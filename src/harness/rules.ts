import { randomInt } from "node:crypto";
import {
  type Attribute,
  type Character,
  modifierFor,
} from "./character.js";
import type { LogicIntent } from "./state.js";
import type { CriticalTier, ResolvedEvent } from "./state.js";

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
  const modifier = modifierFor(character, intent.attribute, intent.skill);
  const targetNumber = clampTargetNumber(intent.targetNumber);

  const primaryRoll = rollD20();
  let cravingDie: number | null = null;
  let usedRoll = primaryRoll;

  if (intent.cravingElevated) {
    cravingDie = rollD20();
    // Same shape as D&D's advantage: roll two d20s, take the higher.
    usedRoll = Math.max(primaryRoll, cravingDie);
  }

  const success = usedRoll + modifier >= targetNumber;
  const criticalTier = computeCriticalTier(usedRoll, cravingDie, success);

  const statDeltas: Record<string, number> = {};
  if (intent.cravingElevated) {
    statDeltas.craving = CRAVING_COST;
  }
  if (intent.rollType === "attack" && success) {
    // Placeholder damage band until a real weapon/damage-dice system
    // exists — bounded, not LLM-supplied, per Decision #7.
    statDeltas.targetHp = -(criticalTier === "critical" || criticalTier === "cravingCritical" ? 8 : 4);
  }

  return {
    rollType: intent.rollType,
    attribute: intent.attribute,
    skillOrDiscipline: intent.skill,
    modifier,
    targetNumber,
    roll: primaryRoll,
    cravingDie,
    success,
    criticalTier,
    statDeltas,
    archetype: intent.archetype,
    summary: intent.summary,
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
