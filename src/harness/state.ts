import { z } from "zod";
import { ATTRIBUTES } from "./character.js";

// --- LOGIC MODEL INTENT ---
// What the resolve node's LLM actually emits. It decides WHAT to check
// (which attribute/skill, how hard, whether the Craving is being pushed)
// — it never supplies a roll, a modifier, or a success/fail verdict. Those
// are computed server-side in rules.ts (Decision #7: never trust an LLM's
// claimed dice result).
export const RollTypeSchema = z.enum(["check", "opposedCheck", "attack"]);
export type RollType = z.infer<typeof RollTypeSchema>;

export const AttributeSchema = z.enum(ATTRIBUTES);

export const LogicIntentSchema = z.object({
  eventType: z.enum(["combat", "social", "exploration", "other"]),
  archetype: z.string().min(1), // Decision #6 taxonomy key, feeds art-trigger
  summary: z.string().min(1), // factual beat description, feeds narrate node
  rollType: RollTypeSchema,
  attribute: AttributeSchema,
  skill: z.string().nullable(),
  targetNumber: z.number().min(1).max(40), // server clamps to the legal 5-30 range
  cravingElevated: z.boolean(),
});
export type LogicIntent = z.infer<typeof LogicIntentSchema>;

// --- RESOLVED EVENT (server-authoritative) ---
// Every field below the eventType/archetype/summary is either looked up
// from the character sheet or computed by rules.ts's resolveCheck() —
// nothing here comes from the LLM directly, even though the shape mirrors
// LogicIntent. This is what actually reaches the narrate node.
export const CriticalTierSchema = z.enum([
  "none",
  "critical",
  "cravingCritical",
  "cravingFailure",
]);
export type CriticalTier = z.infer<typeof CriticalTierSchema>;

export const ResolvedEventSchema = z.object({
  rollType: RollTypeSchema,
  attribute: AttributeSchema,
  skillOrDiscipline: z.string().nullable(),
  modifier: z.number(),
  targetNumber: z.number(),
  roll: z.number().min(1).max(20),
  cravingDie: z.number().min(1).max(20).nullable(),
  success: z.boolean(),
  criticalTier: CriticalTierSchema,
  statDeltas: z.record(z.string(), z.number()),
  archetype: z.string(),
  summary: z.string(),
});
export type ResolvedEvent = z.infer<typeof ResolvedEventSchema>;

// Fired when the logic model's intent JSON fails schema validation twice
// in a row (Decision #19's retry-once-then-safe-default) — a genuinely
// uneventful beat, not a resolved check, so most fields are neutral/null.
export const SAFE_DEFAULT_INTENT: LogicIntent = {
  eventType: "other",
  archetype: "nondescript-scene",
  summary: "the moment passes uneventfully",
  rollType: "check",
  attribute: "wisdom",
  skill: null,
  targetNumber: 10,
  cravingElevated: false,
};

export const HarnessStateSchema = z.object({
  playerAction: z.string(),
  characterId: z.string(), // which SAMPLE_CHARACTERS entry is acting
  gameEvent: ResolvedEventSchema.nullable().default(null),
  narration: z.string().nullable().default(null),
  artUrl: z.string().nullable().default(null),
  artError: z.string().nullable().default(null),
});
export type HarnessState = z.infer<typeof HarnessStateSchema>;
