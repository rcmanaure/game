import { randomInt } from "node:crypto";
import { type Character, modifierFor } from "./character.js";
import type { CriticalTier, LogicIntent, ResolvedEvent } from "./state.js";

// Server-authoritative d20 — the logic model NEVER supplies a roll value.
// This is the whole point of Decision #7: dice results must not be
// something an LLM can hallucinate or bias.
export function rollD20(): number {
  return randomInt(1, 21); // crypto.randomInt is upper-exclusive
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

    const statDeltas: Record<string, number> = {};
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

  const statDeltas: Record<string, number> = {};
  if (intent.cravingElevated) statDeltas.craving = CRAVING_COST;
  if (intent.rollType === "attack" && success) {
    // Placeholder damage band until a real weapon/damage-dice system
    // exists — bounded, not LLM-supplied, per Decision #7.
    statDeltas.targetHp = -(
      criticalTier === "critical" || criticalTier === "cravingCritical"
        ? 8
        : 4
    );
  }

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
 * statDeltas.
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
    summary: reason,
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
