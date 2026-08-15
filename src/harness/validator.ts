import { z } from "zod";
import type { Character, CharacterStatus } from "./character.js";
import {
  RollTypeSchema,
  AttributeSchema,
  OpponentTierSchema,
  type LogicIntentRaw,
} from "./state.js";
import type { ResolvedEvent } from "./rules.js";

// --- STRICT INTENT SCHEMA ---
// Internal validation schema for LogicIntent. The resolve node's LLM emits
// LogicIntentRaw (which accepts string/"None" for nullable fields). After
// sanitizeIntent() coerces those, the result is validated against this
// strict schema. This is where we live — the internal canonical form that
// callers depend on (Decision #7: schema-valid is not the same as
// semantically valid, but this schema IS the validation layer for intent).
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
  });
}

// T1: the server-side rules validator (Decision #7 — "schema-valid is not
// the same as rules-legal"). resolveCheck() (rules.ts) already bounds
// individual VALUES (modifiers, DC, roll range). This module gates the
// separate question: is the resulting STATE TRANSITION legal at all —
// Decision #5's coterie-member lifecycle (Active -> Torpor -> Dead), not a
// bounds check on any single number.

export type TransitionResult =
  | { legal: true; resultingHp: number; resultingStatus: CharacterStatus }
  | { legal: false; reason: string };

/**
 * Whether applying `hpDelta` to `character` is a legal transition, and if
 * so, what the resulting hp/status actually are. Never trusts a claimed
 * resulting status from anywhere upstream — this IS the authority on it.
 */
export function validateTransition(
  character: Character,
  hpDelta: number,
): TransitionResult {
  // A dead character is permanently removed from the coterie (Decision #5)
  // — no further mutation of any kind is legal against them. This is the
  // core "legal transition" check T1 exists for: schema-valid deltas can
  // still target an illegal recipient.
  if (character.status === "dead") {
    return {
      legal: false,
      reason: `${character.name} has met Final Death — no further mutation is legal`,
    };
  }

  const resultingHp = Math.max(0, Math.min(character.maxHp, character.hp + hpDelta));

  let resultingStatus: CharacterStatus = character.status;
  if (resultingHp <= 0) {
    // Active -> Torpor is the FIRST time hp bottoms out (soft permadeath,
    // a buffer); Torpor -> Dead is the SECOND time (no buffer left) —
    // Decision #5's "Final Death (no Torpor buffer left)" condition.
    resultingStatus = character.status === "active" ? "torpor" : "dead";
  }

  return { legal: true, resultingHp, resultingStatus };
}

const CRAVING_MIN = 0;
const CRAVING_MAX = 5; // character.ts's own `craving` comment: 0-5, VTM V5's Hunger

// State-transition bound, same discipline as validateTransition's hp gate:
// never trust an LLM-claimed craving delta to land un-clamped.
function clampCraving(value: number): number {
  return Math.max(CRAVING_MIN, Math.min(CRAVING_MAX, value));
}

/**
 * Applies a resolved event's stat deltas (hp, craving — StatDeltas is
 * closed, so both are handled here explicitly) to `character`, returning a
 * NEW character object — never mutates the input. A true no-op (no delta of
 * either kind) returns the SAME character reference, not a copy. Illegal
 * transitions (e.g. targeting an already-dead character) return the
 * ORIGINAL character unchanged plus a reason, matching the plan's Error &
 * Rescue Registry row: "Schema-valid but rules-illegal -> Rejected by rules
 * validator, safe no-op event."
 */
export function applyMutation(
  character: Character,
  event: ResolvedEvent,
): { character: Character; rejected: false } | { character: Character; rejected: true; reason: string } {
  // A dead character accepts no further mutation of any kind (Decision #5)
  // — a Craving-only delta is equally illegal, not just hp damage.
  if (character.status === "dead") {
    return {
      character,
      rejected: true,
      reason: `${character.name} has met Final Death — no further mutation is legal`,
    };
  }

  const hpDelta = event.statDeltas.hp ?? 0;
  const cravingDelta = event.statDeltas.craving ?? 0;

  if (hpDelta === 0 && cravingDelta === 0) {
    return { character, rejected: false };
  }

  let resultingHp = character.hp;
  let resultingStatus: CharacterStatus = character.status;

  if (hpDelta !== 0) {
    const result = validateTransition(character, hpDelta);
    if (!result.legal) {
      return { character, rejected: true, reason: result.reason };
    }
    resultingHp = result.resultingHp;
    resultingStatus = result.resultingStatus;
  }

  return {
    character: {
      ...character,
      hp: resultingHp,
      status: resultingStatus,
      craving: clampCraving(character.craving + cravingDelta),
    },
    rejected: false,
  };
}
