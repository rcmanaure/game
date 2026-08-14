import { z } from "zod";
import { ATTRIBUTES, CharacterSchema } from "./character.js";
import type { LogicIntent } from "./validator.js";

// --- SHARED ENUMS ---
// Opponent difficulty for opposedCheck — a CLOSED enum the LLM picks from
// (like `attribute`), never the free-text `archetype` string. Keying off
// archetype would let the model self-select its own opponent's difficulty
// (an outside-voice-caught violation of Decision #7's "never trust an
// LLM-claimed value" principle — archetype is a narrative/art-gen tag for
// the scene, not a closed difficulty signal).
export const OPPONENT_TIERS = [
  "trivial",
  "minor",
  "moderate",
  "dangerous",
  "deadly",
] as const;
export type OpponentTier = (typeof OPPONENT_TIERS)[number];

// --- LOGIC MODEL INTENT (RAW) ---
// What the resolve node's LLM actually emits. It decides WHAT to check
// (which attribute/skill, how hard, whether the Craving is being pushed,
// and — for opposedCheck — the opponent's difficulty TIER, a closed enum,
// never a free-text label) — it never supplies a roll, a modifier, or a
// success/fail verdict. Those are computed server-side in rules.ts
// (Decision #7: never trust an LLM's claimed dice result).
export const RollTypeSchema = z.enum(["check", "opposedCheck", "attack"]);
export type RollType = z.infer<typeof RollTypeSchema>;

export const AttributeSchema = z.enum(ATTRIBUTES);
export const OpponentTierSchema = z.enum(OPPONENT_TIERS);

// z.preprocess/transform CANNOT be represented in JSON Schema (confirmed
// live 2026-08-05: withStructuredOutput throws "Transforms cannot be
// represented in JSON Schema" building the tool definition it sends to the
// model) — so the schema handed to the LLM must stay transform-free. To
// tolerate a free-tier model's observed habit of emitting the Python-style
// string "None"/"null"/"N/A" instead of JSON null for an empty field, the
// raw schema accepts `number | string | null` for these — still a plain,
// JSON-Schema-representable union — and sanitizeIntent() in validator.ts
// coerces and re-validates strictly (Decision #19).
const nullableStringOrNumber = z.union([z.number(), z.string()]).nullable();
const nullableString = z.string().nullable();

export const LogicIntentRawSchema = z.object({
  eventType: z.enum(["combat", "social", "exploration", "other"]),
  archetype: z.string().min(1),
  summary: z.string().min(1),
  rollType: RollTypeSchema,
  attribute: AttributeSchema,
  skill: nullableString,
  targetNumber: nullableStringOrNumber,
  opponentTier: z.union([OpponentTierSchema, z.string()]).nullable(),
  cravingElevated: z.boolean(),
});
export type LogicIntentRaw = z.infer<typeof LogicIntentRawSchema>;

// A null targetNumber on "check"/"attack" is semantically invalid (those
// rollTypes need a DC) but zod already accepted it structurally — this is
// the cross-field check a discriminated union would've given for free.
export function needsTargetNumber(intent: Pick<LogicIntent, "rollType">): boolean {
  return intent.rollType === "check" || intent.rollType === "attack";
}

// Fired when the logic model's intent JSON fails schema validation twice
// in a row (Decision #19's retry-once-then-safe-default), OR when it's
// schema-valid but semantically incomplete (null targetNumber on
// check/attack) — same fallback, no extra retry spent on the latter since
// the model already proved it can emit valid JSON; a malformed *value*
// isn't something a retry reliably fixes. Uses the strict LogicIntent
// type from validator.ts.
export const SAFE_DEFAULT_INTENT: LogicIntent = {
  eventType: "other",
  archetype: "nondescript-scene",
  summary: "the moment passes uneventfully",
  rollType: "check",
  attribute: "wisdom",
  skill: null,
  targetNumber: 10,
  opponentTier: null,
  cravingElevated: false,
};

// Documents the harness graph's state shape (graph.ts defines its own
// StateGraph StateSchema separately — LangGraph's StateSchema isn't a
// plain zod object — this mirrors it for anyone importing the type without
// pulling in the graph itself). ResolvedEventSchema lives in rules.ts
// (where it's computed); this mirrors the shape but doesn't validate it
// (validation is rules.ts's responsibility, not state's).
export const HarnessStateSchema = z.object({
  playerAction: z.string(),
  character: CharacterSchema, // caller-supplied, mutated by rulesValidate
  gameEvent: z.any().nullable().default(null), // ResolvedEvent (computed in rules.ts)
  narration: z.string().nullable().default(null),
  artUrl: z.string().nullable().default(null),
  artError: z.string().nullable().default(null),
});
export type HarnessState = z.infer<typeof HarnessStateSchema>;
