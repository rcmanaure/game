import type { Character, CharacterStatus } from "./character.js";
import type { ResolvedEvent } from "./state.js";

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

/**
 * Applies a resolved event's hp delta (if any) to `character`, returning a
 * NEW character object — never mutates the input. Illegal transitions
 * (e.g. targeting an already-dead character) return the ORIGINAL character
 * unchanged plus a reason, matching the plan's Error & Rescue Registry
 * row: "Schema-valid but rules-illegal -> Rejected by rules validator,
 * safe no-op event."
 */
export function applyMutation(
  character: Character,
  event: ResolvedEvent,
): { character: Character; rejected: false } | { character: Character; rejected: true; reason: string } {
  const hpDelta = event.statDeltas.hp ?? 0;
  if (hpDelta === 0) {
    // No hp change proposed — still must reject if the character is
    // already dead (e.g. a Craving cost or a social check targeting a
    // dead character is equally illegal, not just damage).
    if (character.status === "dead") {
      return {
        character,
        rejected: true,
        reason: `${character.name} has met Final Death — no further mutation is legal`,
      };
    }
    return { character, rejected: false };
  }

  const result = validateTransition(character, hpDelta);
  if (!result.legal) {
    return { character, rejected: true, reason: result.reason };
  }

  return {
    character: {
      ...character,
      hp: result.resultingHp,
      status: result.resultingStatus,
    },
    rejected: false,
  };
}
