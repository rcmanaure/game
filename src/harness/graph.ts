import { StateGraph, StateSchema, START, END } from "@langchain/langgraph";
import { PostgresCheckpointSaver } from "@langchain/langgraph-checkpoint-postgres";
import type { GraphNode } from "@langchain/langgraph";
import { z } from "zod";
import {
  LogicIntentRawSchema,
  ResolvedEventSchema,
  SAFE_DEFAULT_INTENT,
  needsTargetNumber,
  sanitizeIntent,
  type LogicIntent,
} from "./state.js";
import { ATTRIBUTES, CharacterSchema } from "./character.js";
import { resolveCheck, rejectedEvent, OPPONENT_TIERS } from "./rules.js";
import { applyMutation } from "./validator.js";
import { logicModel, creativeModel, creativeAltModel } from "./models.js";
import { narrateWithFallback } from "./narration.js";
import { generateArt } from "./art.js";

const State = new StateSchema({
  playerAction: z.string(),
  character: CharacterSchema, // caller-supplied; rulesValidate may return an updated one
  gameEvent: ResolvedEventSchema.nullable().default(null),
  narration: z.string().nullable().default(null),
  artUrl: z.string().nullable().default(null),
  artError: z.string().nullable().default(null),
  lastReferenceUrl: z.string().nullable().default(null), // set by caller for T27 edit-chain runs
  turnNumber: z.number().int().default(1), // T14d recall gating: query Npc on turn 1 only
});

// Decision #19: resolve node emits JSON intent; conditional edge on schema
// validity retries once, then falls back to a safe no-op event. T22
// collapses that into one node (T14's full graph will split it into a real
// conditional edge) — same retry-once-then-safe-default behavior.
//
// Decision #7: the logic model's output is an INTENT (what to check), not a
// verdict. The actual roll, modifier, success, and critical tier are all
// computed server-side by rules.ts, never trusted from the model.
const resolve: GraphNode<typeof State> = async (state) => {
  const character = state.character;

  // withStructuredOutput needs the schema handed to it to be JSON-Schema-
  // representable (a transform/preprocess step throws building the tool
  // definition — confirmed live), so the raw schema stays loose (targetNumber
  // accepts number|string|null) and sanitizeIntent() coerces + validates
  // strictly afterward, inside the same try so a sanitize failure counts
  // toward the same retry-once-then-safe-default budget as a parse failure.
  const model = logicModel().withStructuredOutput(LogicIntentRawSchema);
  const prompt = `You are the logic/resolver model for a dark-fantasy coterie-sim TTRPG. The character "${character.name}" took this action: "${state.playerAction}". Decide: what kind of check this is (a plain check, an opposed check against another creature/NPC, or an attack), which attribute (one of ${ATTRIBUTES.join(", ")}) and skill (or null) governs it, and whether the character is pushing their Craving to gain an edge (cravingElevated). You do NOT decide success or roll any dice — that happens server-side. For "check"/"attack", set targetNumber (5=very easy, 10=easy, 15=medium, 20=hard, 25=very hard, 30=nearly impossible) and leave opponentTier null. For "opposedCheck" (a contest against an opposing creature/NPC), set opponentTier to one of ${OPPONENT_TIERS.join(", ")} instead, and leave targetNumber null — there is no target number in a contest, only two sides' rolls. Use JSON null (never the string "None") for any field you're leaving empty. Also emit an eventType, an archetype tag (short kebab-case, keys art generation, describes the SCENE not the opponent's difficulty), and a one-sentence factual summary of the attempt (not the outcome).`;

  let intent: LogicIntent;
  try {
    intent = sanitizeIntent(await model.invoke(prompt));
  } catch (firstErr) {
    try {
      const retryPrompt = `${prompt}\n\nYour previous response was not valid: ${(firstErr as Error).message}. Try again, strictly matching the schema.`;
      intent = sanitizeIntent(await model.invoke(retryPrompt));
    } catch {
      intent = SAFE_DEFAULT_INTENT;
    }
  }

  // Schema-valid but semantically incomplete (e.g. a "check" with no
  // targetNumber) doesn't get a retry — the model already proved it can
  // emit valid JSON, so a malformed *value* isn't something a retry
  // reliably fixes. Straight to safe-default instead.
  if (needsTargetNumber(intent) && intent.targetNumber == null) {
    intent = SAFE_DEFAULT_INTENT;
  }

  const gameEvent = resolveCheck(character, intent);
  return { gameEvent };
};

// T1: server-side rules validator (Decision #7 — "schema-valid is not the
// same as rules-legal"). resolveCheck() already bounds individual VALUES;
// this node gates the STATE TRANSITION the resolved event would cause
// (validator.ts's Decision #5 lifecycle: Active -> Torpor -> Dead). An
// illegal transition (e.g. any mutation targeting an already-dead
// character) never reaches the character sheet — the event downstream of
// this node becomes a safe no-op, matching the plan's own Error & Rescue
// Registry row for this exact case.
const rulesValidate: GraphNode<typeof State> = async (state) => {
  const event = state.gameEvent!;
  const result = applyMutation(state.character, event);

  if (result.rejected) {
    return { gameEvent: rejectedEvent(result.reason, event), character: result.character };
  }
  return { gameEvent: event, character: result.character };
};

// T2: content-refusal handling (CEO Review Hardening) — violent/dark content
// refusal is expected for this genre, not a rare edge case. Never a silent
// no-op: retry with an alt-provider model, then fall back to a deterministic
// template. narrateWithFallback (narration.ts) does the retry-then-template
// logic; this node only wires it to the two real ChatOpenRouter calls.
const narrate: GraphNode<typeof State> = async (state) => {
  const event = state.gameEvent!;
  const outcome = event.success
    ? event.criticalTier === "critical" || event.criticalTier === "cravingCritical"
      ? "a resounding, decisive success"
      : "a success"
    : event.criticalTier === "cravingFailure"
      ? "a failure where the Craving/Beast intrudes with a complication"
      : "a failure";
  const cravingNote =
    event.criticalTier === "cravingCritical"
      ? " The character's vampiric hunger shows through even in victory — narrate a small unsettling detail alongside the success."
      : event.criticalTier === "cravingFailure"
        ? " The character's hunger causes a bestial complication — narrate it as part of the failure."
        : "";

  const rollDetail =
    event.rollType === "opposedCheck"
      ? `your roll ${event.roll}${event.cravingDie ? ` / Craving die ${event.cravingDie}` : ""} + modifier ${event.modifier} vs the opponent's roll ${event.opponentRoll} (${event.opponentTier} difficulty)`
      : `roll ${event.roll}${event.cravingDie ? ` / Craving die ${event.cravingDie}` : ""} + modifier ${event.modifier} vs target ${event.targetNumber}`;
  const prompt = `You are the AI Dungeon Master for a dark-fantasy coterie-sim. Narrate this beat in 2-4 sentences, second person, moody gothic-fantasy tone, in the same language as the player's action. Player action: "${state.playerAction}". What was attempted: ${event.summary}. Mechanical outcome: ${outcome} (${rollDetail}).${cravingNote} Never contradict the outcome — if it failed, do not narrate success, and vice versa.`;

  const narration = await narrateWithFallback({
    event,
    invokePrimary: () => creativeModel().invoke(prompt),
    invokeAlt: () => creativeAltModel().invoke(prompt),
  });
  return { narration };
};

// T14b: artTrigger returns placeholder immediately (Decision #6 hardening:
// "encounters never block waiting on art generation"). Real art generation
// fires asynchronously in GraphService.runTurn() and pushes the real URL
// over WS when it completes. This keeps the critical path (graph.invoke)
// fast and the DB transaction short.
const artTrigger: GraphNode<typeof State> = async (state) => {
  const event = state.gameEvent!;
  const placeholder = `https://picsum.photos/seed/${encodeURIComponent(event.archetype)}/512/512`;
  return { artUrl: placeholder };
};

const checkpointSaver = process.env.DATABASE_URL
  ? new PostgresCheckpointSaver({
      connectionString: process.env.DATABASE_URL,
    })
  : undefined;

export const harnessGraph = new StateGraph(State)
  .addNode("resolve", resolve)
  .addNode("rulesValidate", rulesValidate)
  .addNode("narrate", narrate)
  .addNode("artTrigger", artTrigger)
  .addEdge(START, "resolve")
  .addEdge("resolve", "rulesValidate")
  .addEdge("rulesValidate", "narrate")
  .addEdge("narrate", "artTrigger")
  .addEdge("artTrigger", END)
  .compile({ checkpointer: checkpointSaver });

export type HarnessGraphState = typeof State.State;
