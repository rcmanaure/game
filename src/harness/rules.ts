import { randomInt } from "node:crypto";
import { z } from "zod";
import { type Character, modifierFor } from "./character.js";
import type { LogicIntent } from "./validator.js";
import {
  RollTypeSchema,
  AttributeSchema,
  OpponentTierSchema,
  OPPONENT_TIERS,
  type OpponentTier,
  LogicIntentRawSchema,
  needsTargetNumber,
  SAFE_DEFAULT_INTENT,
} from "./state.js";
import { sanitizeIntent } from "./validator.js";
import type { PromptAdapter } from "./adapters.js";

// Server-authoritative d20 — the logic model NEVER supplies a roll value.
// This is the whole point of Decision #7: dice results must not be
// something an LLM can hallucinate or bias.
export function rollD20(): number {
  return randomInt(1, 21); // crypto.randomInt is upper-exclusive
}

// Retry-once-then-safe-default logic (Decision #19). Invokes LLM once, retries
// on parse failure, falls back to SAFE_DEFAULT_INTENT on second failure. Also
// detects semantic incompleteness (e.g., missing targetNumber on a check) and
// treats it as a fallback (no retry spent, the model already proved it can emit
// valid JSON — a malformed *value* isn't something a retry reliably fixes).
// T14's conditional edges can branch on wasFallback to decide whether to
// escalate or log a metric. Extracted for testability: resolve node logic
// stays clean, retry strategy is independently testable.
export async function resolveWithFallback(
  adapter: PromptAdapter,
  prompt: string,
): Promise<{ intent: LogicIntent; wasFallback: boolean }> {
  const model = adapter.getModel().withStructuredOutput(LogicIntentRawSchema);

  let intent: LogicIntent;
  let wasFallback = false;

  try {
    intent = sanitizeIntent(await model.invoke(prompt));
  } catch (firstErr) {
    try {
      const retryPrompt = `${prompt}\n\nYour previous response was not valid: ${(firstErr as Error).message}. Try again, strictly matching the schema.`;
      intent = sanitizeIntent(await model.invoke(retryPrompt));
      wasFallback = true;
    } catch {
      intent = SAFE_DEFAULT_INTENT;
      wasFallback = true;
    }
  }

  // Schema-valid but semantically incomplete (e.g. a "check" with no
  // targetNumber) doesn't get a retry — the model already proved it can
  // emit valid JSON, so a malformed *value* isn't something a retry
  // reliably fixes. Straight to safe-default instead.
  if (needsTargetNumber(intent) && intent.targetNumber == null) {
    intent = SAFE_DEFAULT_INTENT;
    wasFallback = true;
  }

  return { intent, wasFallback };
}

const DC_MIN = 5;
const DC_MAX = 30; // D&D SRD 5.1 p.76-77 "Typical Difficulty Classes" range

function clampTargetNumber(dc: number): number {
  return Math.max(DC_MIN, Math.min(DC_MAX, Math.round(dc)));
}

// Craving-elevated checks always cost 1 Craving to invoke (VTM V5's Rouse
// check is the closest analog: using the Blood always risks raising
// Hunger). Fixed magnitude, not LLM-invented — Decision #7's bound.
const CRAVING_COST = 1;

// --- RESOLVED EVENT (server-authoritative) ---
// Every field below the eventType/archetype/summary is either looked up
// from the character sheet or computed by resolveCheck() — nothing here
// comes from the LLM directly, even though the shape mirrors LogicIntent.
// This is what actually reaches the narrate node (Decision #7: only
// server-computed values, never LLM-claimed results).
export const CriticalTierSchema = z.enum([
  "none",
  "critical",
  "cravingCritical",
  "cravingFailure",
]);
export type CriticalTier = z.infer<typeof CriticalTierSchema>;

// Closed on purpose (Decision #25 flagged the original open Record<string,
// number> as having "no structure behind it at all") — applyMutation
// (validator.ts) handles every key here exhaustively, so a new stat can't
// compile without a handler for it.
export const StatDeltasSchema = z.object({
  hp: z.number().optional(),
  craving: z.number().optional(),
});
export type StatDeltas = z.infer<typeof StatDeltasSchema>;

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
  statDeltas: StatDeltasSchema,
  archetype: z.string(),
  summary: z.string(), // factual description of the attempt — never overwritten by a rejection
  rejectionReason: z.string().nullable().default(null), // set only by rejectedEvent()
});
export type ResolvedEvent = z.infer<typeof ResolvedEventSchema>;

const TIER_MODIFIERS: Record<OpponentTier, number> = {
  trivial: 0,
  minor: 2,
  moderate: 4,
  dangerous: 6,
  deadly: 9,
};

interface PlayerRoll {
  modifier: number;
  primaryRoll: number;
  cravingDie: number | null;
  usedRoll: number;
}

// Shared by both the DC-path and the opposedCheck-path — the player's side
// of a roll never differs between them (character's real modifier, a d20,
// a second Craving-tagged d20 if elevated, D&D's advantage shape).
function rollPlayerSide(character: Character, intent: LogicIntent): PlayerRoll {
  const modifier = modifierFor(character, intent.attribute, intent.skill);
  const primaryRoll = rollD20();
  let cravingDie: number | null = null;
  let usedRoll = primaryRoll;

  if (intent.cravingElevated) {
    cravingDie = rollD20();
    usedRoll = Math.max(primaryRoll, cravingDie);
  }

  return { modifier, primaryRoll, cravingDie, usedRoll };
}

/**
 * Resolves one check server-side. The resolve node's LLM only decided
 * *what* to check (attribute/skill/roughly-how-hard); everything here —
 * the character's real modifier, the actual d20 roll(s), success, and the
 * critical tier — is computed deterministically and cannot be overridden
 * by anything the model claimed.
 */
export function resolveCheck(
  character: Character,
  intent: LogicIntent,
): ResolvedEvent {
  const { modifier, primaryRoll, cravingDie, usedRoll } = rollPlayerSide(
    character,
    intent,
  );

  const base = {
    rollType: intent.rollType,
    attribute: intent.attribute,
    skillOrDiscipline: intent.skill,
    modifier,
    roll: primaryRoll,
    cravingDie,
    archetype: intent.archetype,
    summary: intent.summary,
    rejectionReason: null,
  };

  if (intent.rollType === "opposedCheck") {
    const opponentTier = intent.opponentTier ?? "moderate";
    const opponentRoll = rollD20();
    const opponentTotal = opponentRoll + TIER_MODIFIERS[opponentTier];
    const playerTotal = usedRoll + modifier;

    // Tie: "the situation remains the same as it was before the contest"
    // (D&D SRD 5.1 p.77) — status quo, not a win or a loss, but the
    // Craving cost and its critical/failure tier still apply if elevated:
    // the player paid for pushing the Craving regardless of the outcome.
    const success = playerTotal > opponentTotal;
    const criticalTier = computeCriticalTier(usedRoll, cravingDie, success);

    const statDeltas: StatDeltas = {};
    if (intent.cravingElevated) statDeltas.craving = CRAVING_COST;
    if (intent.eventType === "combat" && !success) {
      // A failed combat opposedCheck (e.g. a defense/dodge contest) means
      // the character took a hit — damage to the ACTOR's own hp, not the
      // opponent's. This is what gives T1's rules-validator (validator.ts)
      // real material to gate: an actor's own hp/status transition.
      // Placeholder band, same bounded-not-LLM-supplied discipline as the
      // attack-success damage below.
      statDeltas.hp = -(TIER_MODIFIERS[opponentTier] + 2);
    }

    return {
      ...base,
      targetNumber: null,
      opponentTier,
      opponentRoll,
      success,
      criticalTier,
      statDeltas,
    };
  }

  const targetNumber = clampTargetNumber(intent.targetNumber!);
  const success = usedRoll + modifier >= targetNumber;
  const criticalTier = computeCriticalTier(usedRoll, cravingDie, success);

  const statDeltas: StatDeltas = {};
  if (intent.cravingElevated) statDeltas.craving = CRAVING_COST;
  // A successful "attack" has no statDeltas target: Decision #25 models
  // opponents as a closed difficulty tier, not an entity with hp, so there
  // is nothing server-side to apply damage to yet — attacks resolve
  // narratively until a real opponent/damage system exists.

  return {
    ...base,
    targetNumber,
    opponentTier: null,
    opponentRoll: null,
    success,
    criticalTier,
    statDeltas,
  };
}

/**
 * Builds the "safe no-op" ResolvedEvent for a rules-illegal mutation
 * (Decision #7's Error & Rescue Registry row: "Schema-valid but
 * rules-illegal -> Rejected by rules validator, safe no-op event"). The
 * roll already happened (kept for transparency/debugging), but the
 * mutation itself never applies — reflected here as success:false with no
 * statDeltas. `summary` keeps describing what was ATTEMPTED (narrate's
 * prompt reads it that way); the reason the attempt didn't land goes in
 * rejectionReason instead, not stamped over summary.
 */
export function rejectedEvent(
  reason: string,
  resolved: ResolvedEvent,
): ResolvedEvent {
  return {
    ...resolved,
    success: false,
    criticalTier: "none",
    statDeltas: {},
    rejectionReason: reason,
  };
}

export function computeCriticalTier(
  usedRoll: number,
  cravingDie: number | null,
  success: boolean,
): CriticalTier {
  const isNatural20 = usedRoll === 20;
  const cravingRolledNatural20 = cravingDie === 20;
  const cravingRolledNatural1 = cravingDie === 1;

  if (isNatural20 && cravingRolledNatural20) return "cravingCritical";
  if (isNatural20) return "critical";
  if (!success && cravingRolledNatural1) return "cravingFailure";
  return "none";
}
