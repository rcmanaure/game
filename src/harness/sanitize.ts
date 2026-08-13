// M2.7 (2026-08-13): trust-boundary sanitization for player-supplied free
// text before it ever reaches an LLM prompt. Applied once, at the actual
// trust boundary (jwt-ws.gateway.ts's handleTurn, run.ts's CLI argparse) —
// not re-applied inside graph.ts, which trusts its caller already did this.

// 2KB — long enough for any real action description, short enough to cap
// cost/DoS from a pathological input (audit finding: no length cap existed).
const MAX_PLAYER_ACTION_LENGTH = 2000;

// C0 (0x00-0x1F) and C1 (0x7F-0x9F) control characters, including \n/\t —
// a player action is a short single-line command, not a document; nothing
// legitimate needs an embedded control character, and stripping ALL of
// them (not just the "dangerous" ones) closes the whole class rather than
// picking which controls to trust.
const CONTROL_CHARS = /[\x00-\x1F\x7F-\x9F]/g;

/**
 * Sanitizes free-text player input before it reaches an LLM prompt.
 * Quote-escaping (the ticket's original third measure) isn't needed here —
 * graph.ts passes this as a HumanMessage's content, not interpolated into
 * a hand-built string, so there's no quote-breaking-out-of-context class
 * of bug to escape against in the first place.
 */
export function sanitizePlayerAction(action: string): string {
  return action.replace(CONTROL_CHARS, "").trim().slice(0, MAX_PLAYER_ACTION_LENGTH);
}
