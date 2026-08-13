# LLM Model Recommendations — AI DM Coterie-Sim

**Date:** 2026-08-13
**Scope:** `LOGIC_MODEL` / `CREATIVE_MODEL` / `CREATIVE_MODEL_ALT` env vars
(`src/harness/models.ts`). Not `IMAGE_MODEL` — image generation is disabled
this pass (`DISABLE_IMAGE_GEN=true`, per user request).

**Method.** Pulled live pricing from OpenRouter's public models API
(`GET https://openrouter.ai/api/v1/models`, not the JS-rendered `/models`
page, which returns no data to a plain fetch). Cross-referenced against this
session's own live latency measurements — direct API calls and full harness
turns, not vendor-quoted numbers.

---

## Recommendation: `google/gemini-2.5-flash-lite`

For both `LOGIC_MODEL` and `CREATIVE_MODEL` (`CREATIVE_MODEL_ALT` too, or
pick a second provider for genuine refusal-retry diversity — see note below).

| | Price | Measured latency | Reasoning tokens |
|---|---|---|---|
| **gemini-2.5-flash-lite** | $0.10 / $0.40 per M (prompt/completion) | **0.70s** | 0 |
| gpt-4o-mini (current `.env`) | $0.15 / $0.60 per M | 1.7s | 0 |
| deepseek-v4-flash-0731 (your suggestion) | $0.08 / $0.18 per M | **11.2-11.6s** | 10-33, even on "Say OK" |
| qwen3-30b-a3b-instruct-2507 | $0.048 / $0.193 per M | 0.85s | 0 |
| mistral-small-3.2-24b-instruct | $0.094 / $0.25 per M | 1.02s | 0 |
| nvidia/nemotron-3-ultra-550b-a55b:free | $0 | **55s+, zero response body** | — |

**Why not deepseek-v4-flash-0731, despite being the cheapest sticker price:**
it's a reasoning model. It burns 10-33 reasoning tokens even on a trivial
prompt, and OpenRouter bills those — so the *effective* cost per useful call
is higher than the sticker price suggests, on top of the ~11.5s latency
floor. A full turn makes 2 sequential calls (resolve → narrate, can't
parallelize — narrate needs resolve's output), so that's a ~23s floor
per turn before any real work, which is why the original audit measured
81s+ turns. Confirmed live this session, not vendor-claimed:
`deepseek-v4-flash-0731`'s own `reasoning.mandatory` flag in OpenRouter's
API reads `false`, but it reasons by default anyway — that field isn't a
reliable signal, only a live test call is.

**Why not free-tier models, per your instruction to avoid them:** confirmed
live this session — `nvidia/nemotron-3-ultra-550b-a55b:free` returned zero
response body after 55s+ direct API call. Separately, `TODO.md`'s T15
volume test (2026-08-07, 100 turns on free tier) recorded intermittent
malformed payloads under rate-limit pressure and a 36.9s average with a
134.6s max. Free tier is not viable for anything on the interactive turn
path.

**Why gemini-2.5-flash-lite over gpt-4o-mini (the model currently in
`.env`, kept there for now per your instruction):** cheaper on both prompt
and completion price, and measured faster in direct testing (0.70s vs
1.7s). Live-verified compatible with this codebase's actual usage, not just
raw API tool-calling: ran a real harness turn through
`logicModel().withStructuredOutput(...)` (structured JSON intent
classification) and `creativeModel().invoke()` (narration) — both worked,
narration quality held up ("The moonlight glints off your silvered blade as
you surge forward, a predatory grace in your lunge...").

**Runner-up, if you want an even cheaper option:**
`qwen/qwen3-30b-a3b-instruct-2507` — cheapest completion price of the
non-reasoning candidates tested ($0.193/M vs flash-lite's $0.40/M) and
still fast (0.85s), served via a smaller/less-established provider
(`StreamLake` on this call) rather than Google directly. Not live-tested
against this codebase's actual harness calls (only the raw API) — do that
before switching to it for real.

---

## Current state vs. this recommendation

`.env` is currently on `openai/gpt-4o-mini` — kept there deliberately per
your "we keep the cheaper model one for tests" instruction earlier in this
session, not because it's the production recommendation. **This file is the
production-intent recommendation; `.env` reflects the dev/test choice.**
Don't let these two silently drift into a contradiction the way
`CHANGELOG.md` vs. the code did before this remediation pass — if you swap
`.env` to `gemini-2.5-flash-lite` for real, update the comment there noting
it now matches this file, not just overrides it.

To switch:
```
LOGIC_MODEL=google/gemini-2.5-flash-lite
CREATIVE_MODEL=google/gemini-2.5-flash-lite
CREATIVE_MODEL_ALT=google/gemini-2.5-flash-lite
```

**On `CREATIVE_MODEL_ALT`:** the alt-model retry path exists specifically
so a content-refusal rooted in one provider's policy has a real chance of
not repeating on retry (`narration.ts`'s comment on this). Setting it to
the same model as `CREATIVE_MODEL` defeats that purpose — if refusal
diversity matters more than matching the primary model's speed/cost here,
consider a second fast provider (e.g. `qwen/qwen3-30b-a3b-instruct-2507` or
`mistralai/mistral-small-3.2-24b-instruct`, both live-tested fast and cheap
above) instead of duplicating `CREATIVE_MODEL`.

## Re-check before relying on this

Pricing and availability on OpenRouter change; this table is a 2026-08-13
snapshot, not a permanent fact. Re-pull `GET
https://openrouter.ai/api/v1/models` before a real production cutover, and
re-run `npm run test:volume` against whichever model is chosen for a real
p95 latency/failure-rate baseline — this file's numbers are single-call
spot checks, not a volume test.
