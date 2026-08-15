import { StateGraph, StateSchema, START, END } from "@langchain/langgraph";
import type { GraphNode } from "@langchain/langgraph";
import { z } from "zod";
import { CharacterSchema } from "./character.js";
import {
  resolveCheck,
  rejectedEvent,
  ResolvedEventSchema,
  resolveWithFallback,
  buildResolvePrompt,
} from "./rules.js";
import { applyMutation } from "./validator.js";
import { LogicAdapter, CreativeAdapter, type PromptAdapter, type NarrationAdapter } from "./adapters.js";
import { narrateWithFallback, buildNarratePrompt } from "./narration.js";
import { generateArt } from "./art.js";
import { ArtService } from "./art-service.js";

const State = new StateSchema({
  playerAction: z.string(),
  character: CharacterSchema, // caller-supplied; rulesValidate may return an updated one
  gameEvent: ResolvedEventSchema.nullable().default(null),
  narration: z.string().nullable().default(null),
  artUrl: z.string().nullable().default(null),
  artError: z.string().nullable().default(null),
  lastReferenceUrl: z.string().nullable().default(null), // set by caller for T27 edit-chain runs
});

export type HarnessGraphState = typeof State.State;

export interface HarnessGraphCollaborators {
  logic: PromptAdapter;
  creative: NarrationAdapter;
  art: ArtService;
}

// Builds the compiled graph from its collaborators — kept a factory rather
// than a module-level singleton so a caller (backend DI, a test) can hand it
// stub collaborators instead of live OpenRouter/ArtService instances. Meant
// to be called once per process (createHarnessGraphFromEnv below is the
// production entry point); the graph's topology never changes between
// turns, so nothing here needs rebuilding per invocation.
export function createHarnessGraph(collaborators: HarnessGraphCollaborators) {
  const { logic, creative, art } = collaborators;

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
    const prompt = buildResolvePrompt(character, state.playerAction);

    // resolveWithFallback handles retry-once-then-safe-default logic
    // (Decision #19); wasFallback is for T14's conditional edges (metrics,
    // escalation) to branch on later, not consumed yet.
    const { intent } = await resolveWithFallback(logic, prompt);

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
    const prompt = buildNarratePrompt(state.playerAction, event);

    const narration = await narrateWithFallback({
      event,
      invokePrimary: () => creative.getModel().invoke(prompt),
      invokeAlt: () => creative.getAltModel().invoke(prompt),
    });
    return { narration };
  };

  const artTrigger: GraphNode<typeof State> = async (state) => {
    const event = state.gameEvent!;
    const refs = state.lastReferenceUrl ? [state.lastReferenceUrl] : undefined;
    const result = await art.generateArt(event.archetype, refs);
    if ("error" in result) return { artError: result.error };
    return { artUrl: result.url };
  };

  return new StateGraph(State)
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
}

export type HarnessGraph = ReturnType<typeof createHarnessGraph>;

// The production entry point — reads OPENROUTER_API_KEY etc. via each
// adapter's fromEnv(). Callers that need stub collaborators (tests) use
// createHarnessGraph directly instead.
export function createHarnessGraphFromEnv(): HarnessGraph {
  return createHarnessGraph({
    logic: LogicAdapter.fromEnv(),
    creative: CreativeAdapter.fromEnv(),
    art: new ArtService(generateArt),
  });
}
