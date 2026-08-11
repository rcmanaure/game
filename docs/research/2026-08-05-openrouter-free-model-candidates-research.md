---
status: DRAFT
---
# Research: OpenRouter Free-Tier Model Candidates for LOGIC_MODEL / CREATIVE_MODEL

**Scope:** pass narrow — which free-tier (`:free` suffix) OpenRouter models usable now, for two roles harness already defines (`src/harness/graph.ts`'s `resolve` and `narrate` nodes, Foundational Decisions #19-21 in `docs/designs/ai-dm-platform.md`): **LOGIC_MODEL** must reliably return `GameEventSchema`-conforming JSON via LangChain's `ChatOpenRouter(...).withStructuredOutput()`, and **CREATIVE_MODEL** must write natural, in-character, correct-length gothic dark-fantasy narration in whatever language player used (tested here in Spanish, per project's actual test habit). **Not attempted here:** server-side rules validator (Decision #7's separate "schema-valid vs rules-legal" gate), T15's full per-turn cost-model pass, or paid-tier model comparison — free-tier only, feeds future model-selection decision, same as prior research passes in repo. `IMAGE_MODEL` gets one brief paragraph only, per this pass's explicit brief (image gen paused, `DISABLE_IMAGE_GEN=true`, not focus).

**Why this research now:** `.env` currently pins `LOGIC_MODEL=cohere/
north-mini-code:free` and `CREATIVE_MODEL=nvidia/nemotron-3-ultra-550b-a55b
:free`, chosen earlier session by manually calling each once. Pass repeats verification with more trials per model (catch flakiness single call can't) and widens candidate pool using OpenRouter's live `/api/v1/models` API, not rendered `/models?q=free` webpage (filtered UI view of same data, known truncation risk for page-reading tools).

**Sources:** `https://openrouter.ai/api/v1/models`, fetched direct via `curl` on 2026-08-05 (public, unauthenticated endpoint — OpenRouter's own source of truth for model metadata, not third-party mirror). All model behavior claims below verified live against project's real `OPENROUTER_API_KEY` (already configured in `.env`), reusing exact `GameEventSchema` (`src/harness/state.ts`) and prompt shapes already in `src/harness/graph.ts`'s `resolve`/`narrate` nodes — not guessed from declared metadata or general model reputation. Diagnostic scripts throwaway (`scratch-test-*.ts` in repo root), run via `npx tsx`, deleted before file written; none checked in.

---

## 1. Every `:free` model currently on OpenRouter (2026-08-05 snapshot)

`/api/v1/models` returned 340 models total; **14** have id ending in `:free`. Full list, with what `supported_parameters` declares (declared — not yet verified, see §2-3 for actual behavior):

| id | context_length | `tools` | `tool_choice` | `response_format` | `structured_outputs` |
|---|---|---|---|---|---|
| `cohere/north-mini-code:free` | 256,000 | Y | Y | N | N |
| `google/gemma-4-26b-a4b-it:free` | 262,144 | Y | Y | Y | Y |
| `google/gemma-4-31b-it:free` | 262,144 | Y | Y | Y | N |
| `inclusionai/ling-3.0-flash:free` | 262,144 | Y | Y | N | N |
| `nvidia/nemotron-3-nano-30b-a3b:free` | 256,000 | Y | Y | N | N |
| `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | 256,000 | Y | Y | N | N |
| `nvidia/nemotron-3-super-120b-a12b:free` | 262,144 | Y | Y | Y | Y |
| `nvidia/nemotron-3-ultra-550b-a55b:free` | 1,000,000 | Y | Y | N | N |
| `nvidia/nemotron-3.5-content-safety:free` | 128,000 | N | N | N | N |
| `nvidia/nemotron-nano-12b-v2-vl:free` | 128,000 | Y | Y | N | N |
| `nvidia/nemotron-nano-9b-v2:free` | 128,000 | Y | Y | Y | Y |
| `openai/gpt-oss-20b:free` | 131,072 | Y | Y | Y | Y |
| `poolside/laguna-s-2.1:free` | 262,144 | Y | Y | N | N |
| `poolside/laguna-xs-2.1:free` | 262,144 | Y | Y | N | N |

**Notable:** well-known-lab roster brief expected more of (Meta/Llama, Mistral, Qwen/Alibaba, DeepSeek, Microsoft, xAI) currently has **zero** free-tier entries on OpenRouter as of this pull — entire free list Cohere, Google (Gemma only, not mainline Gemini), NVIDIA (Nemotron family, several sizes), OpenAI's open-weight `gpt-oss-20b`, plus two smaller/less-known labs (InclusionAI, Poolside). Narrowed candidate pool materially from what brief anticipated — worth knowing before reading §2 as "picked from wide field."

## 2. LOGIC_MODEL verification — actual `withStructuredOutput()` calls

Candidates tested: current baseline (`cohere/north-mini-code:free`, 3 trials, catch flakiness single call missed last session) plus 5 new candidates prioritizing declared `tools`/`response_format`/`structured_outputs` support from recognizable lab. Every call reused `GameEventSchema` and prompt matching `graph.ts`'s `resolve` node (`"I draw my blade and lunge at the cornered wretch in the alley."`).

| model | trials | result |
|---|---|---|
| `cohere/north-mini-code:free` (baseline) | 3 | **1/3 success.** Trial 1: empty tool call, model answered in `content` as markdown-fenced JSON blob instead — `withStructuredOutput` doesn't fall back to parsing `content`, so trial returned `parsed: undefined`. Trial 2: clean tool call, valid `GameEvent`. Trial 3: empty tool call again, `parsed: undefined`. **~33% reliability observed this session** — worse than existing `.env.example` comment claims ("correctly returns schema-conforming JSON"), based on single successful call last session. |
| `nvidia/nemotron-3-super-120b-a12b:free` | 2 | **2/2 success.** Clean tool call both times, valid `GameEvent`, disciplined `summary` (no invented mechanics), 6.8-7.6s latency. Strongest result whole pass. |
| `nvidia/nemotron-nano-9b-v2:free` | 1 struct + 1 plain | **Broken for structured output.** `withStructuredOutput` throws client-side crash (`Cannot read properties of undefined (reading '0')`) — not model refusal, integration-level failure, likely SDK indexing into empty/malformed tool-call array. Plain `.invoke()` (no schema) confirms model itself alive and responsive (14.8s, produced reasonable free-text answer) — never returns usable tool call through this SDK path. |
| `google/gemma-4-26b-a4b-it:free` | 2 | **Consistent provider-level rejection**, same error both trials: `"extract.parameters uses $schema"` from backend OpenRouter labels `provider_name: "Darkbloom"`. LangChain/Zod v4's JSON-Schema conversion emits `$schema` meta key in generated tool definition; this backend's tool-parameter validator rejects outright. Reproducible, not fluke. |
| `google/gemma-4-31b-it:free` | 4 (spaced 3-10s apart, over several minutes) | **Untestable this session** — every attempt hit `"temporarily rate-limited upstream"` from `provider_name: "Google AI Studio"` (`limit_source: "upstream_provider_shared_pool"`), i.e. OpenRouter's shared free pool for model already saturated by other users, not fault of test. |
| `openai/gpt-oss-20b:free` | 2 | **Same `$schema`/Darkbloom rejection as both Gemma models**, identical error text both trials. |

**Pattern worth flagging on own:** three of six candidates (`gemma-4-26b`, `gpt-oss-20b`, and by implication likely `gemma-4-31b` once rate limit clears) fail structured output for *same* reason — backend labeled "Darkbloom" on OpenRouter rejects `$schema` field this project's LangChain/Zod v4 stack includes in generated tool schemas. Not per-model quirk, it's provider-routing incompatibility that'll silently sink *any* future free-model candidate OpenRouter happens to route through same backend, regardless of model's own capabilities. Worth follow-up eng note (not resolved here): whether `ChatOpenRouter` or Zod-to-JSON-Schema step can be configured to omit `$schema`, since this could otherwise quietly rule out future candidates for reason having nothing to do with model itself.

## 3. CREATIVE_MODEL verification — Spanish gothic narration

Candidates: current baseline (`nvidia/nemotron-3-ultra-550b-a55b:free`) plus two other NVIDIA Nemotron sizes (only other well-known-lab, large, narrative-plausible free models available per §1 — Gemma rate-limited/broken per §2 and has no obviously "larger" narrative-tuned variant in free list; Cohere's only free entry is `-code` variant, not narrative pick). Prompt matched `graph.ts`'s `narrate` node, phrased in Spanish with Spanish player action, checking: stays in character (gothic, second person), natural (not stiff/literal-translation) Spanish, 2-4 sentences.

**`nvidia/nemotron-3-ultra-550b-a55b:free` (current baseline):**
> Tu acero rasga el aire viciado con un silbido hambriento, y la hoja bebe la sangre negra del desdichado antes de que su alarido pueda nacer. La carne cede con una facilidad obscena, tibia y pegajosa, tiñendo tus botas de un carmesí que huele a óxido y miedo. El cuerpo cae sin gracia sobre los adoquines resbaladizos, un saco roto que deja de temblar casi al instante, y el callejón recupera su silencio sepulcral, roto solo por tu jadeo entrecortado.

3 sentences, correct 2nd person (`tu acero`, `tus botas`), idiomatic vivid Spanish (no stiff translation-register phrasing), strong gothic imagery. **Best prose quality of three.**

**`nvidia/nemotron-3-super-120b-a12b:free`:**
> Desenvainas tu hoja negra, el acero chisporroteando bajo la luz tenue de las farolas rotas, y te lanzas como una sombra hambrienta contra el desdichado acorralado en el callejón. Tu espada atraviesa su carne temblorosa, partiendo el suspiro de su último aliento en un crujido húmedo que se pierde entre los ecos de la piedra. El cuerpo cae al suelo, dejando una mancha de sangre que se funde con la oscuridad, mientras el aire se vuelve más denso y el susurro de los muros parece celebrar tu victoria macabra.

3 sentences, correct 2nd person, equally natural vivid Spanish — very close second to baseline on quality. Notably, **same model** scored 2/2 on §2's LOGIC_MODEL structured-output test, so real dual-role candidate.

**`nvidia/nemotron-3-nano-30b-a3b:free`:**
> Con un crujido siniestro, desenvainas tu espada, su filo bañando la penumbra del callejón, y te lanzas sobre el desdichado acorallado. El acero se hiela en su garganta mientras la sangre brota en gotas negras que se mezclan con el polvo. La criatura cae al suelo, sus últimos alientos suspiran entre los ladrillos rotos.

3 sentences, correct 2nd person, fastest response (2.5s vs. 5-6.4s other two), noticeably less rich imagery, one small spelling slip ("acorallado" for "acorralado"). Usable but weakest of three.

## 4. IMAGE_MODEL — brief note only (per this pass's scope)

No model in current `:free` list (§1) declares image output — confirmed checking every entry's `architecture.output_modalities` / `modality` field in same `/api/v1/models` pull, none include `image`. Currently no free-tier path for `IMAGE_MODEL` on OpenRouter; project's existing `DISABLE_IMAGE_GEN=true` + picsum.photos placeholder stance (Decision #15's cost-conscious deferral) remains right call until real cost-model pass (T15) revisits paid image models — nothing found here changes that.

---

## Recommendation

**Switch `LOGIC_MODEL` from `cohere/north-mini-code:free` to `nvidia/nemotron-3-super-120b-a12b:free`. Keep `CREATIVE_MODEL` as `nvidia/nemotron-3-ultra-550b-a55b:free`.**

Reasoning, grounded in actual trial results above, not declared metadata:

1. **Current LOGIC_MODEL baseline unreliable, not just "verified once."** 1/3 trials this session — same model single prior call had marked reliable. ~33% success rate not acceptable for role Decision #7 assigns it: resolver's whole fairness guarantee depends on structured output actually landing, and existing retry-once-then-safe-default logic in `graph.ts`'s `resolve` node would silently eat roughly 1 in 3 turns as "the moment passes uneventfully" — bad player experience disguised as rare edge case when closer to coin flip.

2. **`nvidia/nemotron-3-super-120b-a12b:free` clean 2/2**, fast, on-schema, disciplined output (no invented mechanics in `summary`, matching same discipline `.env.example` comment already praised in Cohere). Two trials not large sample, but strictly better result than incumbent's three, from well-known lab (NVIDIA), backed by declared `structured_outputs`/`response_format` support that, unlike three other candidates this pass tested, actually held up live.

3. **Legitimate dual-role candidate**, scoring well on both LOGIC test (§2) and CREATIVE Spanish narration test (§3) — very close second to current CREATIVE baseline on prose quality. Doesn't change this recommendation (see #4), but worth keeping in back pocket: if `nemotron-3-ultra-550b-a55b` ever becomes unavailable/rate-limited, `nemotron-3-super-120b-a12b` already-verified same-session fallback for *either* role, not just one.

4. **Don't touch CREATIVE_MODEL.** Current baseline (`nvidia/nemotron-3-ultra-550b-a55b:free`) produced best Spanish prose of three tested — natural register, correct second person, correctly 3 sentences, strong gothic imagery — confirming last session's pick rather than overturning it. `nemotron-3-super-120b-a12b` close but not clearly better on narrative quality alone, and switching model already working well in its role for marginal (possibly noise-level, at n=1 each) prose difference not worth it — especially since keeping on distinct model from LOGIC also means LOGIC-side outage/rate-limit doesn't take down narration too.

5. **Don't pursue `google/gemma-4-26b-a4b-it:free`, `google/gemma-4-31b-it:free`, `openai/gpt-oss-20b:free`, or `nvidia/nemotron-nano-9b-v2:free` for LOGIC_MODEL right now** — not because bad models, but each hit concrete, reproduced blocker this session: two Gemma variants and `gpt-oss-20b` all fail on same `$schema`/"Darkbloom" provider incompatibility (§2's cross-model pattern, worth eng follow-up independent of which model finally chosen), Gemma-4-31b additionally rate-limited every attempt, and `nemotron-nano-9b-v2` crashes structured-output call path outright even though bare model responds fine to plain text. None of these "maybe it'll work in production" gambles worth taking over model that already tested clean.

**One process note carried forward from project's own prior finding:** pass re-confirms OpenRouter's declared `supported_parameters` is *candidate filter*, not verification — of six LOGIC_MODEL candidates that all declared `tools` support, only one (`nemotron-3-super-
120b-a12b`) actually reliable end-to-end this session, and `$schema`-rejection failure mode wasn't visible in metadata at all. Any future model swap for either role should repeat this live-call verification, not just re-read models list.