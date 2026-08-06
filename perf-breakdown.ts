import { loadEnv } from "./src/harness/env.js";
loadEnv();

import { StateGraph, StateSchema, START, END } from "@langchain/langgraph";
import type { GraphNode } from "@langchain/langgraph";
import { z } from "zod";
import {
  LogicIntentRawSchema,
  ResolvedEventSchema,
  SAFE_DEFAULT_INTENT,
  needsTargetNumber,
  sanitizeIntent,
  type LogicIntent,
} from "./src/harness/state.js";
import { ATTRIBUTES, CharacterSchema } from "./src/harness/character.js";
import { resolveCheck, rejectedEvent, OPPONENT_TIERS } from "./src/harness/rules.js";
import { applyMutation } from "./src/harness/validator.js";
import { logicModel, creativeModel, creativeAltModel } from "./src/harness/models.js";
import { narrateWithFallback } from "./src/harness/narration.js";
import { SAMPLE_CHARACTERS } from "./src/harness/character.js";

const State = new StateSchema({
  playerAction: z.string(),
  character: CharacterSchema,
  gameEvent: ResolvedEventSchema.nullable().default(null),
  narration: z.string().nullable().default(null),
  artUrl: z.string().nullable().default(null),
  artError: z.string().nullable().default(null),
  lastReferenceUrl: z.string().nullable().default(null),
  turnNumber: z.number().int().default(1),
});

// Timing wrapper
function timed(name: string, fn: () => Promise<any>) {
  return async function timedNode(state: any) {
    const start = performance.now();
    const result = await fn();
    const ms = (performance.now() - start).toFixed(2);
    console.log(`[${name}] ${ms}ms`);
    return result;
  };
}

const resolve: GraphNode<typeof State> = async (state) => {
  const character = state.character;
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

  if (needsTargetNumber(intent) && intent.targetNumber == null) {
    intent = SAFE_DEFAULT_INTENT;
  }

  const gameEvent = resolveCheck(character, intent);
  return { gameEvent };
};

const rulesValidate: GraphNode<typeof State> = async (state) => {
  const event = state.gameEvent!;
  const result = applyMutation(state.character, event);

  if (result.rejected) {
    return { gameEvent: rejectedEvent(result.reason, event), character: result.character };
  }
  return { gameEvent: event, character: result.character };
};

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

const artTrigger: GraphNode<typeof State> = async (state) => {
  const event = state.gameEvent!;
  const placeholder = `https://picsum.photos/seed/${encodeURIComponent(event.archetype)}/512/512`;
  return { artUrl: placeholder };
};

const graph = new StateGraph(State)
  .addNode("resolve", resolve)
  .addNode("rulesValidate", rulesValidate)
  .addNode("narrate", narrate)
  .addNode("artTrigger", artTrigger)
  .addEdge(START, "resolve")
  .addEdge("resolve", "rulesValidate")
  .addEdge("rulesValidate", "narrate")
  .addEdge("narrate", "artTrigger")
  .addEdge("artTrigger", END)
  .compile();

async function main() {
  const character = SAMPLE_CHARACTERS["mira-ashgrave"];
  const playerAction = "I swing at the goblin";

  console.log("=== T14 Core Loop Latency Breakdown ===\n");
  console.log(`Character: ${character.name}`);
  console.log(`Action: "${playerAction}"\n`);

  const totalStart = performance.now();
  const result = await graph.invoke({
    playerAction,
    character,
  });
  const totalMs = (performance.now() - totalStart).toFixed(2);

  console.log(`\n[TOTAL] ${totalMs}ms`);
  console.log(`\nOutcome: ${result.gameEvent?.summary}`);
}

main().catch((err) => {
  console.error("Breakdown test failed:", err);
  process.exit(1);
});
