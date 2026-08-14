import type { ResolvedEvent } from "./rules.js";

// T2: content-refusal handling (CEO Review Hardening — "never a silent
// no-op, that breaks the game roughly every third violent beat"). Chain:
// primary creative model -> refusal detected -> alt-model retry -> still
// refused -> deterministic template. Exported as pure/injectable functions
// (not tied to ChatOpenRouter) so the retry-then-template chain is unit
// testable without a live API call.

// response_metadata's shape isn't structurally compatible with
// ChatOpenRouter's own ResponseMetadata type (no shared fields declared),
// even though finish_reason IS actually present on it at runtime (patched in
// by @langchain/openrouter's converter) — kept loose here rather than
// importing that internal type.
export interface NarrationResponse {
  content: unknown;
  response_metadata?: Record<string, unknown>;
}

const REFUSAL_PHRASES =
  /\b(i cannot|i can't|i won't|i'm not able to|i am not able to|i'm unable to|as an ai|i must decline)\b/i;

// OpenRouter surfaces a structured signal (finish_reason: "content_filter")
// for a hard refusal; soft-refusals (an apologetic prose non-answer, or the
// free-tier "empty tool_calls despite declared support" failure mode
// observed live this session) don't set it, so both an empty response and a
// handful of refusal-phrase heuristics are also treated as refusal.
export function isRefusal(response: NarrationResponse): boolean {
  if (response.response_metadata?.finish_reason === "content_filter") return true;
  const text =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content ?? "");
  if (text.trim().length === 0) return true;
  return REFUSAL_PHRASES.test(text);
}

// The narrate node's prompt — a pure function of the player's action and
// the resolved event, so its wording (including the rejection branch) is
// assertable without constructing a graph State or an adapter.
export function buildNarratePrompt(playerAction: string, event: ResolvedEvent): string {
  // A rules-rejected turn (e.g. targeting an already-dead character) never
  // happened mechanically — narrating it as an ordinary failure would tell
  // the creative model an attempt occurred that the engine actually refused.
  if (event.rejectionReason) {
    return `You are the AI Dungeon Master for a dark-fantasy coterie-sim. Narrate in 1-2 sentences, second person, moody gothic-fantasy tone, in the same language as the player's action, that this action could not happen at all — do not invent a success or a failed attempt. Player action: "${playerAction}". Why it could not happen: ${event.rejectionReason}.`;
  }

  const outcome = event.success
    ? event.criticalTier === "critical" || event.criticalTier === "cravingCritical"
      ? "a resounding, decisive success"
      : "a success"
    : event.criticalTier === "cravingFailure"
      ? "a failure where the Craving/Beast intrudes with a complication"
      : "a failure";
  const cravingNote =
    event.criticalTier === "cravingCritical"
      ? " The character's vampiric hunger shows through even in victory — narrate a small unsettling detail alongside the success."
      : event.criticalTier === "cravingFailure"
        ? " The character's hunger causes a bestial complication — narrate it as part of the failure."
        : "";
  const rollDetail =
    event.rollType === "opposedCheck"
      ? `your roll ${event.roll}${event.cravingDie ? ` / Craving die ${event.cravingDie}` : ""} + modifier ${event.modifier} vs the opponent's roll ${event.opponentRoll} (${event.opponentTier} difficulty)`
      : `roll ${event.roll}${event.cravingDie ? ` / Craving die ${event.cravingDie}` : ""} + modifier ${event.modifier} vs target ${event.targetNumber}`;
  return `You are the AI Dungeon Master for a dark-fantasy coterie-sim. Narrate this beat in 2-4 sentences, second person, moody gothic-fantasy tone, in the same language as the player's action. Player action: "${playerAction}". What was attempted: ${event.summary}. Mechanical outcome: ${outcome} (${rollDetail}).${cravingNote} Never contradict the outcome — if it failed, do not narrate success, and vice versa.`;
}

function outcomeLabel(event: ResolvedEvent): string {
  if (!event.success) {
    return event.criticalTier === "cravingFailure"
      ? "The attempt fails, and the Craving surges to fill the gap."
      : "The attempt fails.";
  }
  return event.criticalTier === "critical" || event.criticalTier === "cravingCritical"
    ? "The attempt succeeds decisively."
    : "The attempt succeeds.";
}

// No LLM call, so this can't match the player's input language (the live
// narrate prompt asks for that) or vary in style — a fixed English template
// keyed off the mechanical outcome. Guaranteed non-empty is the whole point.
export function deterministicNarration(event: ResolvedEvent): string {
  if (event.rejectionReason) {
    return `The attempt cannot happen. (${event.rejectionReason})`;
  }
  return `${outcomeLabel(event)} (${event.summary})`;
}

export async function narrateWithFallback(params: {
  event: ResolvedEvent;
  invokePrimary: () => Promise<NarrationResponse>;
  invokeAlt: () => Promise<NarrationResponse>;
}): Promise<string> {
  const { event, invokePrimary, invokeAlt } = params;

  const primary = await invokePrimary();
  if (!isRefusal(primary)) return contentToString(primary);

  const alt = await invokeAlt();
  if (!isRefusal(alt)) return contentToString(alt);

  return deterministicNarration(event);
}

function contentToString(response: NarrationResponse): string {
  return typeof response.content === "string"
    ? response.content
    : JSON.stringify(response.content);
}
