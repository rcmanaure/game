import type { ResolvedEvent } from "./state.js";

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
  return `${outcomeLabel(event)} (${event.summary})`;
}

export async function narrateWithFallback(params: {
  event: ResolvedEvent;
  invokePrimary: () => Promise<NarrationResponse>;
  invokeAlt: () => Promise<NarrationResponse>;
}): Promise<string> {
  const { event, invokePrimary, invokeAlt } = params;

  // CEO Review Hardening (2026-08-06): catch thrown LLM errors, not just refusals
  try {
    const primary = await invokePrimary();
    if (!isRefusal(primary)) return contentToString(primary);
  } catch (err) {
    console.error('Primary narration invoke failed:', err);
  }

  try {
    const alt = await invokeAlt();
    if (!isRefusal(alt)) return contentToString(alt);
  } catch (err) {
    console.error('Alt narration invoke failed:', err);
  }

  return deterministicNarration(event);
}

function contentToString(response: NarrationResponse): string {
  return typeof response.content === "string"
    ? response.content
    : JSON.stringify(response.content);
}
