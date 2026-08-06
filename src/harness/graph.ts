import { StateGraph, StateSchema, START, END } from "@langchain/langgraph";
import type { GraphNode } from "@langchain/langgraph";
import { z } from "zod";
import { GameEventSchema, type GameEvent } from "./state.js";
import { logicModel, creativeModel } from "./models.js";
import { generateArt } from "./art.js";

const State = new StateSchema({
  playerAction: z.string(),
  gameEvent: GameEventSchema.nullable().default(null),
  narration: z.string().nullable().default(null),
  artUrl: z.string().nullable().default(null),
  artError: z.string().nullable().default(null),
  lastReferenceUrl: z.string().nullable().default(null), // set by caller for T27 edit-chain runs
});

const SAFE_DEFAULT_EVENT: GameEvent = {
  eventType: "other",
  archetype: "nondescript-scene",
  summary: "the moment passes uneventfully",
};

// Decision #19: resolve node emits JSON GameEvent; conditional edge on schema
// validity retries once, then falls back to a safe no-op event. T22 collapses
// that into one node (T14's full graph will split it into a real conditional
// edge) — same retry-once-then-safe-default behavior, minimal wiring.
const resolve: GraphNode<typeof State> = async (state) => {
  const model = logicModel().withStructuredOutput(GameEventSchema);
  const prompt = `You are the logic/resolver model for a dark-fantasy coterie-sim TTRPG. A player took this action: "${state.playerAction}". Emit a GameEvent JSON describing what happens mechanically: eventType, an archetype tag for the encounter (used to key art generation — a short kebab-case category, not free text), and a one-sentence factual summary of what happened.`;

  try {
    const gameEvent = await model.invoke(prompt);
    return { gameEvent };
  } catch (firstErr) {
    try {
      const retryPrompt = `${prompt}\n\nYour previous response was not valid: ${(firstErr as Error).message}. Try again, strictly matching the schema.`;
      const gameEvent = await model.invoke(retryPrompt);
      return { gameEvent };
    } catch {
      return { gameEvent: SAFE_DEFAULT_EVENT };
    }
  }
};

const narrate: GraphNode<typeof State> = async (state) => {
  const event = state.gameEvent ?? SAFE_DEFAULT_EVENT;
  const model = creativeModel();
  const prompt = `You are the AI Dungeon Master for a dark-fantasy coterie-sim. Narrate this beat in 2-4 sentences, second person, moody gothic-fantasy tone. Player action: "${state.playerAction}". What happened mechanically: ${event.summary}`;
  const response = await model.invoke(prompt);
  const narration =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);
  return { narration };
};

const artTrigger: GraphNode<typeof State> = async (state) => {
  const event = state.gameEvent ?? SAFE_DEFAULT_EVENT;
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
