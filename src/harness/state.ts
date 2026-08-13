import { z } from "zod";
import { ATTRIBUTES, CharacterSchema } from "./character.js";
import { OPPONENT_TIERS } from "./rules.js";

// --- LOGIC MODEL INTENT ---
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

// --- RAW SCHEMA (what's actually handed to withStructuredOutput) ---
// z.preprocess/transform CANNOT be represented in JSON Schema (confirmed
// live 2026-08-05: withStructuredOutput throws "Transforms cannot be
// represented in JSON Schema" building the tool definition it sends to the
// model) — so the schema handed to the LLM must stay transform-free. To
// tolerate a free-tier model's observed habit of emitting the Python-style
// string "None"/"null"/"N/A" instead of JSON null for an empty field, the
// raw schema accepts `number | string | null` for these — still a plain,
// JSON-Schema-representable union — and sanitizeIntent() below coerces and
// re-validates against the strict LogicIntentSchema afterward.
const nullableStringOrNumber = z.union([z.number(), z.string()]).nullable();
const nullableString = z.string().nullable();

// T19/D-3 (2026-08-13): the NPC persist trigger is LLM-signaled — the
// resolve model flags a named NPC worth remembering across turns as part
// of its normal intent output, rather than a text-mention heuristic on the
// narration or a separate player-facing action. Plain nullable object, no
// transform — same JSON-Schema-representability constraint as every other
// field here.
const NpcSignalSchema = z
  .object({
    name: z.string().min(1),
    fact: z.string().min(1),
  })
  .nullable();

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
  npcSignal: NpcSignalSchema,
});
export type LogicIntentRaw = z.infer<typeof LogicIntentRawSchema>;

// --- STRICT SCHEMA (internal validation, after sanitizeIntent) ---
export const LogicIntentSchema = z.object({
  eventType: z.enum(["combat", "social", "exploration", "other"]),
  archetype: z.string().min(1), // Decision #6 taxonomy key, feeds art-trigger ONLY — never a difficulty signal
  summary: z.string().min(1), // factual beat description, feeds narrate node
  rollType: RollTypeSchema,
  attribute: AttributeSchema,
  skill: z.string().nullable(),
  // Required for "check"/"attack" (a DC), meaningless for "opposedCheck"
  // (no DC in a contest — D&D SRD 5.1 p.77). Nullable because zod's flat
  // object schema can't express a rollType-conditional requirement without
  // a discriminated union; resolve() enforces the real constraint below.
  targetNumber: z.number().min(1).max(40).nullable(),
  // Required for "opposedCheck" only — a closed tier the LLM picks, so it
  // can never self-select an arbitrary opponent difficulty the way keying
  // off free-text `archetype` would have allowed.
  opponentTier: OpponentTierSchema.nullable(),
  cravingElevated: z.boolean(),
  npcSignal: NpcSignalSchema,
});
export type LogicIntent = z.infer<typeof LogicIntentSchema>;

// Free-tier models trained heavily on Python sometimes emit the literal
// string "None" (or "null"/"N/A") instead of JSON `null` for a field
// they're leaving empty — a systematic formatting habit, not a random
// flake, so a retry doesn't fix it (observed live: 3/3 identical failures
// on the same prompt). Coerce those strings to real null, then validate
// strictly. Throws (caught by resolve()'s existing try/catch, same
// retry-once-then-safe-default path) if anything else is still wrong.
export function sanitizeIntent(raw: LogicIntentRaw): LogicIntent {
  const PYTHON_NULLISH = /^(none|null|n\/a)$/i;
  const coerce = (v: unknown) =>
    typeof v === "string" && PYTHON_NULLISH.test(v) ? null : v;
  return LogicIntentSchema.parse({
    ...raw,
    skill: coerce(raw.skill),
    targetNumber: coerce(raw.targetNumber),
    opponentTier: coerce(raw.opponentTier),
    npcSignal: coerce(raw.npcSignal),
  });
}

// A null targetNumber on "check" is semantically invalid (that rollType
// needs a DC) but zod already accepted it structurally — this is the
// cross-field check a discriminated union would've given for free.
// "attack" used to need one too, but rules.ts now resolves attack through
// the same contested-roll (opponentTier) path as opposedCheck (D-1,
// 2026-08-13), so targetNumber is no longer meaningful for it.
export function needsTargetNumber(intent: Pick<LogicIntent, "rollType">): boolean {
  return intent.rollType === "check";
}

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
  targetNumber: z.number().nullable(), // null for opposedCheck
  roll: z.number().min(1).max(20),
  cravingDie: z.number().min(1).max(20).nullable(),
  opponentTier: OpponentTierSchema.nullable(), // null for check/attack
  opponentRoll: z.number().min(1).max(20).nullable(), // null for check/attack
  success: z.boolean(),
  criticalTier: CriticalTierSchema,
  statDeltas: z.record(z.string(), z.number()),
  archetype: z.string(),
  summary: z.string(),
  consequences: z.array(z.string()).default([]), // visible consequences for player
  npcSignal: NpcSignalSchema, // pass-through from intent — see M2.2/D-3
  // M2.6 (2026-08-13): distinguishes "the character failed the check" (a
  // normal gameplay outcome, success:false is still a completed turn) from
  // "the mutation was illegal and never applied" (rulesValidate rejected
  // it — validator.ts targeting an already-dead character, etc.). Both
  // used to look identical downstream (success:false + flavor narration
  // reported as a completed turn) — the Hidden Door failure mode the audit
  // flagged. Only rejectedEvent() sets this true.
  rejected: z.boolean(),
});
export type ResolvedEvent = z.infer<typeof ResolvedEventSchema>;

// Fired when the logic model's intent JSON fails schema validation twice
// in a row (Decision #19's retry-once-then-safe-default), OR when it's
// schema-valid but semantically incomplete (null targetNumber on
// check/attack) — same fallback, no extra retry spent on the latter since
// the model already proved it can emit valid JSON; a malformed *value*
// isn't something a retry reliably fixes.
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
  npcSignal: null,
};

// HarnessState type: import from graph.ts as HarnessGraphState.
// Eng review 2026-08-06: deleted duplicate HarnessStateSchema that stayed
// out of sync with graph.ts's State (missed lastReferenceUrl, turnNumber).
// Use graph.ts's State as single source of truth.
