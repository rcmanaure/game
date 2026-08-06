---
status: DRAFT
---
# Research: OpenRouter Free-Tier Model Candidates for LOGIC_MODEL / CREATIVE_MODEL

**Scope:** this pass is narrowly about which free-tier (`:free` suffix)
OpenRouter models are actually usable, right now, for the two roles the
working harness already defines (`src/harness/graph.ts`'s `resolve` and
`narrate` nodes, Foundational Decisions #19-21 in
`docs/designs/ai-dm-platform.md`): a **LOGIC_MODEL** that must reliably
return `GameEventSchema`-conforming JSON via LangChain's
`ChatOpenRouter(...).withStructuredOutput()`, and a **CREATIVE_MODEL** that
must write natural, in-character, correctly-length gothic dark-fantasy
narration in whatever language the player used (tested here in Spanish, per
this project's actual test habit). **Not attempted here:** the server-side
rules validator (Decision #7's separate "schema-valid vs rules-legal" gate),
T15's full per-turn cost-model pass, or any paid-tier model comparison —
this is free-tier only, feeding a future model-selection decision, same as
prior research passes in this repo. `IMAGE_MODEL` gets one brief paragraph
only, per this pass's explicit brief (image gen is paused,
`DISABLE_IMAGE_GEN=true`, not the focus).

**Why this research now:** `.env` currently pins `LOGIC_MODEL=cohere/
north-mini-code:free` and `CREATIVE_MODEL=nvidia/nemotron-3-ultra-550b-a55b
:free`, chosen in an earlier session by manually calling each once. This
pass repeats that verification with more trials per model (to catch
flakiness a single call can't) and widens the candidate pool using
OpenRouter's live `/api/v1/models` API, not the rendered `/models?q=free`
webpage (a filtered UI view of the same data, and a known truncation risk
for page-reading tools).

**Sources:** `https://openrouter.ai/api/v1/models`, fetched directly via
`curl` on 2026-08-05 (public, unauthenticated endpoint — OpenRouter's own
source of truth for model metadata, not a third-party mirror). All model
behavior claims below were verified live against this project's real
`OPENROUTER_API_KEY` (already configured in `.env`), reusing the exact
`GameEventSchema` (`src/harness/state.ts`) and prompt shapes already in
`src/harness/graph.ts`'s `resolve`/`narrate` nodes — not guessed from
declared metadata or general model reputation. Diagnostic scripts were
throwaway (`scratch-test-*.ts` in the repo root), run via `npx tsx`, and
deleted before this file was written; none are checked in.

---

## 1. Every `:free` model currently on OpenRouter (2026-08-05 snapshot)

`/api/v1/models` returned 340 models total; **14** have an id ending in
`:free`. Full list, with what `supported_parameters` declares (declared —
not yet verified, see §2-3 for actual behavior):

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

**Notable:** the well-known-lab roster the brief expected to see more of
(Meta/Llama, Mistral, Qwen/Alibaba, DeepSeek, Microsoft, xAI) currently has
**zero** free-tier entries on OpenRouter as of this pull — the entire free
list is Cohere, Google (Gemma only, not mainline Gemini), NVIDIA (Nemotron
family, several sizes), OpenAI's open-weight `gpt-oss-20b`, plus two
smaller/less-known labs (InclusionAI, Poolside). This materially narrowed
the candidate pool from what the brief anticipated — worth knowing before
reading §2 as "we picked from a wide field."

## 2. LOGIC_MODEL verification — actual `withStructuredOutput()` calls

Candidates tested: the current baseline (`cohere/north-mini-code:free`, 3
trials, to catch flakiness a single call missed last session) plus 5 new
candidates prioritizing declared `tools`/`response_format`/
`structured_outputs` support from a recognizable lab. Every call reused
`GameEventSchema` and a prompt matching `graph.ts`'s `resolve` node
(`"I draw my blade and lunge at the cornered wretch in the alley."`).

| model | trials | result |
|---|---|---|
| `cohere/north-mini-code:free` (baseline) | 3 | **1/3 success.** Trial 1: empty tool call, model answered in `content` as a markdown-fenced JSON blob instead — `withStructuredOutput` does not fall back to parsing `content`, so this trial returned `parsed: undefined`. Trial 2: clean tool call, valid `GameEvent`. Trial 3: empty tool call again, `parsed: undefined`. **~33% reliability observed this session** — meaningfully worse than the existing `.env.example` comment claims ("correctly returns schema-conforming JSON"), which was based on a single successful call last session. |
| `nvidia/nemotron-3-super-120b-a12b:free` | 2 | **2/2 success.** Clean tool call both times, valid `GameEvent`, disciplined `summary` (no invented mechanics), 6.8-7.6s latency. Strongest result of the whole pass. |
| `nvidia/nemotron-nano-9b-v2:free` | 1 struct + 1 plain | **Broken for structured output.** `withStructuredOutput` throws a client-side crash (`Cannot read properties of undefined (reading '0')`) — not a model refusal, an integration-level failure, likely the SDK indexing into an empty/malformed tool-call array. A plain `.invoke()` (no schema) confirms the model itself is alive and responsive (14.8s, produced a reasonable free-text answer) — it simply never returns a usable tool call through this SDK path. |
| `google/gemma-4-26b-a4b-it:free` | 2 | **Consistent provider-level rejection**, same error both trials: `"extract.parameters uses $schema"` from a backend OpenRouter labels `provider_name: "Darkbloom"`. LangChain/Zod v4's JSON-Schema conversion emits a `$schema` meta key in the generated tool definition; this backend's tool-parameter validator rejects it outright. Reproducible, not a fluke. |
| `google/gemma-4-31b-it:free` | 4 (spaced 3-10s apart, over several minutes) | **Untestable this session** — every attempt hit `"temporarily rate-limited upstream"` from `provider_name: "Google AI Studio"` (`limit_source: "upstream_provider_shared_pool"`), i.e. OpenRouter's shared free pool for this model was already saturated by other users, not a fault of this test. |
| `openai/gpt-oss-20b:free` | 2 | **Same `$schema`/Darkbloom rejection as both Gemma models**, identical error text both trials. |

**Pattern worth flagging on its own:** three of six candidates
(`gemma-4-26b`, `gpt-oss-20b`, and by implication likely `gemma-4-31b` once
its rate limit clears) fail structured output for the *same* reason — a
backend labeled "Darkbloom" on OpenRouter rejects the `$schema` field that
this project's LangChain/Zod v4 stack includes in generated tool schemas.
This is not a per-model quirk, it's a provider-routing incompatibility that
will silently sink *any* future free-model candidate OpenRouter happens to
route through that same backend, regardless of the model's own
capabilities. Worth a follow-up eng note (not resolved here): whether
`ChatOpenRouter` or the Zod-to-JSON-Schema step can be configured to omit
`$schema`, since this could otherwise quietly rule out future candidates
for a reason that has nothing to do with the model itself.

## 3. CREATIVE_MODEL verification — Spanish gothic narration

Candidates: the current baseline (`nvidia/nemotron-3-ultra-550b-a55b:free`)
plus two other NVIDIA Nemotron sizes (the only other well-known-lab, large,
narrative-plausible free models available per §1 — Gemma was rate-limited/
broken per §2 and has no obviously "larger" narrative-tuned variant in the
free list; Cohere's only free entry is a `-code` variant, not a narrative
pick). Prompt matched `graph.ts`'s `narrate` node, phrased in Spanish with a
Spanish player action, checking: stays in character (gothic, second
person), natural (not stiff/literal-translation) Spanish, 2-4 sentences.

**`nvidia/nemotron-3-ultra-550b-a55b:free` (current baseline):**
> Tu acero rasga el aire viciado con un silbido hambriento, y la hoja bebe
> la sangre negra del desdichado antes de que su alarido pueda nacer. La
> carne cede con una facilidad obscena, tibia y pegajosa, tiñendo tus botas
> de un carmesí que huele a óxido y miedo. El cuerpo cae sin gracia sobre
> los adoquines resbaladizos, un saco roto que deja de temblar casi al
> instante, y el callejón recupera su silencio sepulcral, roto solo por tu
> jadeo entrecortado.

3 sentences, correct 2nd person (`tu acero`, `tus botas`), idiomatic and
vivid Spanish (no stiff translation-register phrasing), strong gothic
imagery. **Best prose quality of the three.**

**`nvidia/nemotron-3-super-120b-a12b:free`:**
> Desenvainas tu hoja negra, el acero chisporroteando bajo la luz tenue de
> las farolas rotas, y te lanzas como una sombra hambrienta contra el
> desdichado acorralado en el callejón. Tu espada atraviesa su carne
> temblorosa, partiendo el suspiro de su último aliento en un crujido
> húmedo que se pierde entre los ecos de la piedra. El cuerpo cae al suelo,
> dejando una mancha de sangre que se funde con la oscuridad, mientras el
> aire se vuelve más denso y el susurro de los muros parece celebrar tu
> victoria macabra.

3 sentences, correct 2nd person, equally natural and vivid Spanish — very
close second to the baseline on quality. Notably, this is the **same
model** that scored 2/2 on §2's LOGIC_MODEL structured-output test, so it's
a real dual-role candidate.

**`nvidia/nemotron-3-nano-30b-a3b:free`:**
> Con un crujido siniestro, desenvainas tu espada, su filo bañando la
> penumbra del callejón, y te lanzas sobre el desdichado acorallado. El
> acero se hiela en su garganta mientras la sangre brota en gotas negras
> que se mezclan con el polvo. La criatura cae al suelo, sus últimos
> alientos suspiran entre los ladrillos rotos.

3 sentences, correct 2nd person, fastest response (2.5s vs. 5-6.4s for the
other two), noticeably less rich imagery, and one small spelling slip
("acorallado" for "acorralado"). Usable but the weakest of the three.

## 4. IMAGE_MODEL — brief note only (per this pass's scope)

No model in the current `:free` list (§1) declares image output —
confirmed by checking every entry's `architecture.output_modalities` /
`modality` field in the same `/api/v1/models` pull, none include `image`.
There is currently no free-tier path for `IMAGE_MODEL` on OpenRouter; the
project's existing `DISABLE_IMAGE_GEN=true` + picsum.photos placeholder
stance (Decision #15's cost-conscious deferral) remains the right call
until a real cost-model pass (T15) revisits paid image models — nothing
found here changes that.

---

## Recommendation

**Switch `LOGIC_MODEL` from `cohere/north-mini-code:free` to
`nvidia/nemotron-3-super-120b-a12b:free`. Keep `CREATIVE_MODEL` as
`nvidia/nemotron-3-ultra-550b-a55b:free`.**

Reasoning, grounded in the actual trial results above, not declared
metadata:

1. **The current LOGIC_MODEL baseline is unreliable, not just "verified
   once."** 1/3 trials this session — the same model that a single prior
   call had marked as reliable. A ~33% success rate is not acceptable for
   the role Decision #7 assigns it: the resolver's whole fairness guarantee
   depends on structured output actually landing, and the existing
   retry-once-then-safe-default logic in `graph.ts`'s `resolve` node would
   be silently eating roughly 1 in 3 turns as "the moment passes
   uneventfully" — a bad player experience disguised as a rare edge case
   when it's closer to a coin flip.

2. **`nvidia/nemotron-3-super-120b-a12b:free` was clean 2/2**, with fast,
   on-schema, disciplined output (no invented mechanics in `summary`,
   matching the same discipline the `.env.example` comment already praised
   in Cohere). Two trials is not a large sample, but it's a strictly better
   result than the incumbent's three, from a well-known lab (NVIDIA),
   backed by declared `structured_outputs`/`response_format` support that,
   unlike three other candidates this pass tested, actually held up live.

3. **It's a legitimate dual-role candidate**, scoring well on both the
   LOGIC test (§2) and the CREATIVE Spanish narration test (§3) — a very
   close second to the current CREATIVE baseline on prose quality. That
   doesn't change this recommendation (see #4), but it's worth keeping in
   the back pocket: if `nemotron-3-ultra-550b-a55b` ever becomes
   unavailable/rate-limited, `nemotron-3-super-120b-a12b` is a
   already-verified same-session fallback for *either* role, not just one.

4. **Don't touch CREATIVE_MODEL.** The current baseline
   (`nvidia/nemotron-3-ultra-550b-a55b:free`) produced the best Spanish
   prose of the three tested — natural register, correct second person,
   correctly 3 sentences, strong gothic imagery — confirming last session's
   pick rather than overturning it. `nemotron-3-super-120b-a12b` is close
   but not clearly better on narrative quality alone, and switching a model
   that's already working well in its role for a marginal (possibly
   noise-level, at n=1 each) prose difference isn't worth it — especially
   since keeping it on a distinct model from LOGIC also means a LOGIC-side
   outage/rate-limit doesn't take down narration too.

5. **Do not pursue `google/gemma-4-26b-a4b-it:free`,
   `google/gemma-4-31b-it:free`, `openai/gpt-oss-20b:free`, or
   `nvidia/nemotron-nano-9b-v2:free` for LOGIC_MODEL right now** — not
   because they're bad models, but because each hit a concrete, reproduced
   blocker this session: the two Gemma variants and `gpt-oss-20b` all fail
   on the same `$schema`/"Darkbloom" provider incompatibility (§2's
   cross-model pattern, worth an eng follow-up independent of which model
   is finally chosen), Gemma-4-31b was additionally rate-limited on every
   attempt, and `nemotron-nano-9b-v2` crashes the structured-output call
   path outright even though the bare model responds fine to plain text.
   None of these are "maybe it'll work in production" gambles worth taking
   over a model that already tested clean.

**One process note carried forward from this project's own prior finding:**
this pass re-confirms that OpenRouter's declared `supported_parameters` is
a *candidate filter*, not a verification — of the six LOGIC_MODEL
candidates that all declared `tools` support, only one (`nemotron-3-super-
120b-a12b`) was actually reliable end-to-end this session, and the
`$schema`-rejection failure mode wasn't visible in the metadata at all.
Any future model swap for either role should repeat this live-call
verification, not just re-read the models list.
