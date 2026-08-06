import { StateGraph, StateSchema, START, END } from "@langchain/langgraph";
import type { GraphNode } from "@langchain/langgraph";
import { z } from "zod";
import {
  LogicIntentSchema,
  ResolvedEventSchema,
  SAFE_DEFAULT_INTENT,
  type LogicIntent,
} from "./state.js";
import { ATTRIBUTES, SAMPLE_CHARACTERS } from "./character.js";
import { resolveCheck } from "./rules.js";
import { logicModel, creativeModel } from "./models.js";
import { generateArt } from "./art.js";

const State = new StateSchema({
  playerAction: z.string(),
  characterId: z.string(),
  gameEvent: ResolvedEventSchema.nullable().default(null),
  narration: z.string().nullable().default(null),
  artUrl: z.string().nullable().default(null),
  artError: z.string().nullable().default(null),
  lastReferenceUrl: z.string().nullable().default(null), // set by caller for T27 edit-chain runs
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
  const character = SAMPLE_CHARACTERS[state.characterId];
  if (!character) {
    throw new Error(`Unknown characterId: ${state.characterId}`);
  }

  const model = logicModel().withStructuredOutput(LogicIntentSchema);
  const prompt = `You are the logic/resolver model for a dark-fantasy coterie-sim TTRPG. The character "${character.name}" took this action: "${state.playerAction}". Decide: what kind of check this is (a plain check, an opposed check, or an attack), which attribute (one of ${ATTRIBUTES.join(", ")}) and skill (or null) governs it, how difficult the target number should be (5=very easy, 10=easy, 15=medium, 20=hard, 25=very hard, 30=nearly impossible), and whether the character is pushing their Craving to gain an edge (cravingElevated). You do NOT decide success or roll any dice — that happens server-side. Also emit an eventType, an archetype tag (short kebab-case, keys art generation), and a one-sentence factual summary of the attempt (not the outcome).`;

  let intent: LogicIntent;
  try {
    intent = await model.invoke(prompt);
  } catch (firstErr) {
    try {
      const retryPrompt = `${prompt}\n\nYour previous response was not valid: ${(firstErr as Error).message}. Try again, strictly matching the schema.`;
      intent = await model.invoke(retryPrompt);
    } catch {
      intent = SAFE_DEFAULT_INTENT;
    }
  }

  const gameEvent = resolveCheck(character, intent);
  return { gameEvent };
};

const narrate: GraphNode<typeof State> = async (state) => {
  const event = state.gameEvent!;
  const model = creativeModel();
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

  const prompt = `You are the AI Dungeon Master for a dark-fantasy coterie-sim. Narrate this beat in 2-4 sentences, second person, moody gothic-fantasy tone, in the same language as the player's action. Player action: "${state.playerAction}". What was attempted: ${event.summary}. Mechanical outcome: ${outcome} (roll ${event.roll}${event.cravingDie ? ` / Craving die ${event.cravingDie}` : ""} + modifier ${event.modifier} vs target ${event.targetNumber}).${cravingNote} Never contradict the outcome — if it failed, do not narrate success, and vice versa.`;
  const response = await model.invoke(prompt);
  const narration =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);
  return { narration };
};

const artTrigger: GraphNode<typeof State> = async (state) => {
  const event = state.gameEvent!;
  const refs = state.lastReferenceUrl ? [state.lastReferenceUrl] : undefined;
  const result = await generateArt(event.archetype, refs);
  if ("error" in result) return { artError: result.error };
  return { artUrl: result.url };
};

export const harnessGraph = new StateGraph(State)
  .addNode("resolve", resolve)
  .addNode("narrate", narrate)
  .addNode("artTrigger", artTrigger)
  .addEdge(START, "resolve")
  .addEdge("resolve", "narrate")
  .addEdge("narrate", "artTrigger")
  .addEdge("artTrigger", END)
  .compile();

export type HarnessGraphState = typeof State.State;
