---
status: DRAFT
---
# Research: Player Character Portraits, Dynamic Portrait Evolution, Story Reuse

**Scope:** three angles not covered by any prior research pass or by
`docs/designs/ai-dm-platform.md` itself — grepped for "character creation",
"avatar", "portrait", "customiz", "wound"+"armor", "premade" and found
nothing beyond the already-decided monster/bestiary art cache (Decision #6).
This pass does not revisit anything already decided: orchestration
(LangGraph.js, Decisions #19-21), v1 art provider (OpenRouter image models,
Decision #15), archetype art caching (Decision #6), or persistent NPC memory
(Scope Decision #4) are all cited below only as load-bearing context, never
re-litigated. Findings below are candidates for a future `/plan-ceo-review`
or `/plan-eng-review` pass, not decisions — this file does not edit
`docs/designs/ai-dm-platform.md`, `TODOS.md`, or `DESIGN.md`.

---

## 1. Player character creation: free-form vs. AI-predefined-with-portrait

**Finding: no comparable shipped or open-source AI-narrative product
actually solves "a free-form player character with a portrait that stays
consistent across independently generated images" — the entire ecosystem
either sidesteps the problem (fixed pre-authored portrait) or accepts
prompt-discipline drift. This is real evidence the tradeoff is structural,
not an execution gap unique to this project.**

### AI Dungeon (Latitude) — customization is choice-based, not free-text
AI Dungeon's own help docs distinguish two mechanisms, neither of which is
"type your own character freely":
- **Character Creator Scenarios**: "allow players to customize their
  character by picking pre-determined options (rather than writing in their
  answer), with the Opening Prompt built with those choices in mind."
  Customization is real but constrained to author-defined choice sets.
- **Default/Story Scenarios**: fixed starting prompt, "will always start the
  exact same, no matter who plays it."
Source: [AI Dungeon Help — Creating Character Creator Scenarios](https://help.aidungeon.com/faq/whats-the-difference-between-scenarios-and-worlds) · [AI Dungeon Help — What are Scenarios?](https://help.aidungeon.com/faq/what-are-scenarios)

### NovelAI — character consistency solved by prompt discipline, not infra
NovelAI's own documentation for creating a consistent character across
separately generated images is explicit that the mechanism is **tag
density in the prompt, not image-to-image, embeddings, or LoRA training**:
"the more tags we use to describe our character's outfit, the more
consistent it will stay across different images." The guide walks through
iteratively adding clothing/detail tags until the character reads as stable
across separate generations — an author-discipline technique, not a
technical guarantee.
Source: [NovelAI Docs — Creating Consistent Characters](https://docs.novelai.net/en/image/tutorial-charactercreation/)

### Character.ai/SillyTavern-style "Character Card" ecosystem — the strongest evidence for the predefined-portrait pattern
The de facto interchange format across this entire product category (used
by SillyTavern and Character.ai-adjacent tools) is the **Character Card V2
spec**. Its primary-source GitHub spec defines the card's fields —
`name`, `description`, `personality`, `scenario`, `first_mes`,
`mes_example`, `system_prompt`, `alternate_greetings`, `character_book`,
`tags`, `creator`, `character_version`, `extensions` — and **has no
dedicated avatar/image field at all**. That's because the distribution unit
itself is a PNG file with the JSON embedded in its `tEXt` metadata chunk —
the portrait IS the container, one fixed pre-authored image per character,
shared identically by every user who loads that card. There is no per-user
or per-session portrait regeneration anywhere in this format.
Source: [malfoyslastname/character-card-spec-v2 (GitHub)](https://github.com/malfoyslastname/character-card-spec-v2)

### Open-source "AI Dungeon Master" projects — the closest architectural analogs
- **NarrativeEngine-P** — self-hosted, works with "any OpenAI-compatible
  LLM," the closest architectural sibling to this repo's own self-hosted
  LangGraph.js plan. Character creation is fully free-form and
  conversational: "Start a new chat... The GM will walk you through
  character creation and then drop you into the world." It **does**
  generate portraits — but only for NPCs ("Generate NPC portraits on the
  fly in 5 art styles... Works with any OpenAI-compatible image API"). The
  README makes no claim of player-character portrait generation at all.
  This is a directly comparable project choosing free-form text for the
  player character specifically *because* it ships portrait generation
  elsewhere (NPCs) and did not extend that same feature to the player.
  Source: [Sagesheep/NarrativeEngine-P (GitHub)](https://github.com/Sagesheep/NarrativeEngine-P)
- **DungeonGPT-JS** — free-form structured character-creation form (stats,
  class, race, background, alignment) plus a "profile picture" field; the
  README does not specify whether that image is AI-generated or
  user-supplied — an open, undocumented point, not confirmed either way.
  Source: [EdwardAThomson/DungeonGPT-JS (GitHub)](https://github.com/EdwardAThomson/DungeonGPT-JS)
- **GameMasterAI** — README documents setup/dependencies only; no
  character-creation flow or portrait mechanism is documented at all.
  Source: [deckofdmthings/GameMasterAI (GitHub)](https://github.com/deckofdmthings/GameMasterAI)

### CRPG contrast — a different axis of tradeoff, not the same problem
Baldur's Gate 3's Origin-character-vs-custom-Tav split is a UX/onboarding
tradeoff, not an art-generation-cost or consistency tradeoff (BG3 renders
every character live in-engine, no generative-art-consistency problem
exists there at all): "Larian encourages people to use Origin stories
because many players new to the cRPG genre feel uncomfortable not being
handed a proxy character," while custom Tav trades that authored
reactivity for full creative control (and can pick a race/class no
companion has). Useful as a **narrative-design** parallel (predefined
characters can carry richer, pre-written reactivity a free-form character
can't), but it does not bear on the image-consistency/cost question this
project actually faces — noting the axis mismatch explicitly rather than
overreaching the analogy.
Source: [TheGamer — Should You Pick An Origin Character Or Create Your Own](https://www.thegamer.com/baldurs-gate-3-choose-origin-character-or-create-your-own/)

**Verdict:** every comparable product either (a) fixes the portrait once
and never regenerates it per-user (Character Card ecosystem — the closest
match to "AI-predefined-with-portrait"), or (b) keeps the player character
free-form and simply doesn't attempt a player portrait at all
(NarrativeEngine-P, the closest architectural analog to this project). None
demonstrates "free-form player character + consistently-evolving portrait"
working in production. See Section 2 for whether the specific models this
project already chose (Decision #15) change that calculus.

---

## 2. Dynamic portrait evolution: does the chosen v1 art stack support image-to-image editing on an existing portrait?

**Finding: yes — both OpenRouter image models already locked in by Decision
#15 (Gemini 2.5 Flash Image / Nano Banana, Seedream 4.5) document real
image-to-image edit support via a reference-image input parameter, at the
same flat per-image price as a fresh generation. This is new information:
Decision #15 chose these models for MVP art-gen cost, not for edit
capability — the edit capability turns out to come along for free.**

### OpenRouter's unified Image API — `input_references` parameter
OpenRouter's own docs and tutorial blog (checked independently, two
separate fetches, consistent result) describe a dedicated image-editing
path on `POST /api/v1/images`: an `input_references` array of
`{ type: "image_url", image_url: { url } }` objects, accepting either
HTTP(S) URLs or base64 data URLs, with "the number of references accepted
varies by provider." This is explicitly framed as the mechanism for
"image-to-image work" — passing an existing image back in alongside a text
prompt to get a modified version, not just a fresh text-to-image call.
(One direct API-reference URL, `openrouter.ai/docs/api/api-reference/images/create-images`,
404'd on fetch — a navigation gap in this pass, not evidence against the
feature, since the same parameter is independently corroborated on two
other OpenRouter-owned pages.)
Source: [OpenRouter Docs — Image Generation guide](https://openrouter.ai/docs/guides/overview/multimodal/image-generation) · [OpenRouter Blog — Image Generation API tutorial](https://openrouter.ai/blog/tutorials/image-generation-models/)

### Gemini 2.5 Flash Image ("Nano Banana") — edits confirmed on the model's own page
OpenRouter's model card states directly: "It is capable of image
generation, edits, and multi-turn conversations," and "[unlike] traditional
image generators that often struggle with precise edits or maintaining
consistency across variations, this model excels at targeted modifications
while preserving the essence of your original content." Real-world usage
cited on the same page: "generating hundreds of ad variations from a single
source image, maintaining brand consistency" — the exact "take the last
image, apply a targeted change, keep the rest" shape this project needs for
wound/armor updates.
Source: [OpenRouter — Google: Nano Banana (Gemini 2.5 Flash Image)](https://openrouter.ai/google/gemini-2.5-flash-image)

### Seedream 4.5 — multi-image reference input, same $0.04/image price as fresh generation
OpenRouter's Seedream 4.5 page confirms flat "$0.04/image" pricing
(matching Decision #15's ~$0.04 target exactly) and documents "multi-image
composition capabilities... significantly strengthened" plus "editing
consistency" as an explicit improvement area, with multi-image reference
input "enabling consistent identity, style, and proportions across a series
of images" (corroborated by a third-party reseller's description of the
same model). OpenRouter prices this per **output** image regardless of how
many reference images are submitted as input — an edit call costs the same
as a fresh-generation call.
Source: [OpenRouter — ByteDance Seed: Seedream 4.5](https://openrouter.ai/bytedance-seed/seedream-4.5) · [kie.ai — Seedream 4.5 Edit](https://kie.ai/seedream-4-5)

### Per-image cost reconciliation
Gemini 2.5 Flash Image's cost is token-metered, not flat, at the provider
level: Google's own developer pricing page states image output tokens are
$30/1M, at ~1290 tokens per output image (up to 1024×1024) — **≈$0.039/image**,
which is the actual source of Decision #15's "~$0.04/image" figure for this
model. (One OpenRouter page surfaced during this research showed a
different figure, $0.30/$2.50 per 1M input/output tokens — likely a stale
scrape or a different pricing view; Google's own developer pricing page is
the more authoritative primary source here and is the one that reconciles
with the plan's existing number, so it's the one cited.)
Source: [Google AI for Developers — Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing)

### Higgsfield's Soul ID — checked per the task's request, not a re-litigation of the post-v1 deferral
Higgsfield has a named, real feature for this exact problem class — **Soul
ID** — but it works on a materially different mechanism than OpenRouter's
per-call `input_references`:
- **Trained identity, not per-call reference.** "Give Soul ID a set of
  photos of one person, it learns that identity, and from then on it
  applies that identity to anything you generate." Contrasted directly
  against reference-image approaches in Higgsfield's own framing: a
  reference image "anchors a single generation but drifts across many
  separate ones," while Soul ID "trains a reusable identity once, then
  holds it across every generation... without re-uploading."
- **Setup cost:** 20+ reference photos, "about 3 to 5 minutes" training
  time — a real per-character setup cost that a per-call reference-image
  approach doesn't have.
- **Platform lock-in:** the trained identity "lives in the Higgsfield
  ecosystem" and "is used inside Soul 2.0 and connected tools, not exported
  as a standalone model file."
- **Not documented as an incremental-edit/inpaint tool.** Nothing in the
  available Soul ID documentation addresses adding a wound or new armor
  piece to an *already-generated* image specifically — the feature's own
  framing is "an endless stream of content across outfits, settings, and
  aesthetics" (fresh generations sharing an identity), not "edit this one
  existing image."
- **Pricing:** no first-party price found on Higgsfield's own indexed API
  docs (`docs.higgsfield.ai`'s documented sections are Generate Images from
  Text / Generate Videos from Images / FAQ / Support / How to use API /
  Client Libraries / Webhook Integration / Introduction — no Soul, Soul ID,
  or pricing page appears in that index). Third-party API resellers
  (WaveSpeed, Segmind, Eachlabs) quote Soul-family image generation in the
  $0.09-$0.23/image range depending on variant — several times OpenRouter's
  flat $0.04, and this figure is reseller-sourced, not Higgsfield
  first-party, so treat it as directional only.
Source: [Higgsfield Blog — Soul ID: AI Character Consistency](https://higgsfield.ai/blog/Soul-ID-AI-Character-Consistency) · [Higgsfield Blog — How to Keep AI Persona Consistent Using Higgsfield Popcorn](https://higgsfield.ai/blog/how-to-keep-ai-persona-consistent-higgsfield-popcorn) · [WaveSpeedAI — Higgsfield Soul Image-to-Image](https://wavespeed.ai/docs/docs-api/higgsfield/higgsfield-soul-image-to-image)

**Verdict:** "character sheet drives live portrait updates" is v1-feasible
on the already-chosen OpenRouter stack, at the already-budgeted ~$0.04/image
cost, using the `input_references` edit path instead of a fresh
text-to-image call each time — this needs an implementation task
(prompt-template + reference-image passthrough, sitting alongside T13's
STYLE FORMULA work), not a new architectural decision. The real open risk
is **identity drift across many sequential edits** (does turn 40's portrait
still look like turn 1's character after 39 incremental edits?) — an
empirical question to validate in T22's harness, not something any of the
docs above answer definitively. Higgsfield's Soul ID is a real,
differently-mechanized fallback if drift proves unworkable (train-once
identity vs. re-submit-last-image-every-time), at real cost premium and
platform lock-in — worth naming as a fallback option, not worth reopening
Decision #15's deferral on the evidence gathered here.

---

## 3. Story reuse across users: does LangGraph.js's checkpointer support forking/cloning a thread?

**Finding: no — not in the self-hosted LangGraph.js + `PostgresSaver` setup
this project already adopted (Decision #21). The one primitive that does
exist for exactly this purpose — `copy_thread` — is a LangGraph
**Platform** (hosted product) feature, the exact product Decisions #19/#21
explicitly rejected in favor of self-hosting. This is a "design your own
Postgres schema on top" situation, confirmed rather than assumed.**

### The checkpointer interface itself has no clone/copy method
The `BaseCheckpointSaver` interface (which `PostgresSaver` implements) is
documented as four core methods: `.put` (store a checkpoint), `.putWrites`
(store pending intermediate writes), `.getTuple` (fetch a checkpoint by
`thread_id`/`thread_ts`), `.list` (list checkpoints matching a filter). No
duplicate/clone/copy operation exists on this interface.
Source: [LangGraph.js API Reference — `@langchain/langgraph-checkpoint`](https://langchain-ai.github.io/langgraphjs/reference/modules/langgraph-checkpoint.html)

### docs.langchain.com's own Persistence guide doesn't offer one either
The persistence guide lists checkpointer use cases as "conversation
continuity, human-in-the-loop workflows, time travel, and fault tolerance."
"Time travel" here means replaying/branching **within** a single
`thread_id`'s own checkpoint history (e.g. resuming from an earlier
checkpoint after an error) — it is not documented as a way to copy state
into a **different** `thread_id` for a different user/session, which is
what story-reuse-across-users actually requires.
Source: [Docs by LangChain — Persistence (JS/LangGraph)](https://docs.langchain.com/oss/javascript/langgraph/persistence)

### The primitive that does this exists — but only on LangGraph Platform
LangGraph Platform's Threads API exposes exactly the operation this project
wants: `POST /threads/{thread_id}/copy`, wrapped by the SDK as
`client.threads.copy(thread_id)` — "creates an independent thread whose
history is identical to the original thread at the time of copying." This
is confirmed via the official LangChain community forum (two separate
threads: one explicitly asking how to do this in self-hosted OSS, a second
reporting the Platform copy operation taking 12+ minutes on large threads
in production) and the `langgraph-sdk` reference docs for `Thread`/
`ThreadsClient`. **This is Platform-only.** Decisions #19 and #21 already
committed this project to self-hosted LangGraph.js inside NestJS/Docker
Compose specifically to avoid Platform's external infra dependency and
cost — so this primitive is not available to this project as architected.
Source: [LangChain Forum — How to clone a thread in LangGraph](https://forum.langchain.com/t/how-to-clone-a-thread-in-langgraph/2764) · [LangChain Forum — LangGraph thread copy can take 12+ minutes](https://forum.langchain.com/t/langgraph-thread-copy-can-take-12-minutes-recommended-production-pattern/3763) · [LangChain Reference — `ThreadsClient`](https://reference.langchain.com/python/langgraph-sdk/_async/threads/ThreadsClient)

### Self-hosted OSS has no supported workaround — only a raw-SQL one
On the same forum thread, the only workaround offered for self-hosted OSS
is manual and unsupported: `PostgresSaver`'s underlying tables
(`checkpoints`, `checkpoint_writes`, `checkpoint_blobs`, keyed by
`thread_id`) can in principle be copied row-by-row with `thread_id`
rewritten to a new value — described in the forum as "just a matter of
copying the rows and changing `thread_id` value to sth else," i.e. a raw
SQL operation the project would own itself, not a documented or supported
LangGraph API. (Table names here are sourced from a community forum
answer, not a first-party schema reference fetched directly in this pass —
flagging that distinction rather than presenting the table names as
independently primary-source-verified.)
Source: [LangChain Forum — How to clone a thread in LangGraph](https://forum.langchain.com/t/how-to-clone-a-thread-in-langgraph/2764)

**Verdict:** confirmed, not assumed — LangGraph.js's checkpointer has no
built-in forking/cloning primitive in this project's actual (self-hosted)
configuration. Whatever "flag a good chronicle as a reusable starting
scenario for other players" feature gets built has to be application-level:
a bespoke Postgres table that snapshots the relevant narrative state (not a
raw checkpoint-blob copy) when a chronicle is flagged, which a *new*
chronicle's `resolve`/`narrate` prompt context reads from at start —
structurally the same shape this project has already adopted twice: the
`recall` node (Scope Decision #4 / T19, queries an NPC/consequence table by
`user_id` and injects a prompt slot) and the archetype art cache (Decision
#6, keys off a fixed taxonomy into a Postgres-backed cache). Story reuse
would be a third instance of the same "plain Postgres table feeds a graph
node's prompt context" pattern, not a new mechanism.

---

## Recommendations for the next `/plan-ceo-review` or `/plan-eng-review` pass

1. **Q1 (character creation):** Ship v1 with a small set of AI-authored
   predefined characters (e.g. 4-8), each with **one** reference portrait
   generated once, offline — the same mental model as Decision #6's
   archetype art cache, applied to player characters instead of monsters.
   This sidesteps the industry-wide unsolved problem found in this
   research (no comparable product keeps a *free-form* player character's
   portrait consistent across independent generations — the Character Card
   ecosystem fixes the portrait once per character; NarrativeEngine-P, the
   closest open-source architectural analog, skips player portraits
   entirely). Defer free-form character creation with a live portrait as a
   distinct, harder post-v1 question — it depends on Q2's per-edit drift
   risk actually holding up over many turns, which is unverified.

2. **Q2 (portrait evolution):** "Wound/armor updates reflected in the
   character portrait" is v1-feasible on the already-chosen OpenRouter
   image stack (Decision #15) at the already-budgeted ~$0.04/image cost —
   both Gemini 2.5 Flash Image and Seedream 4.5 support image-to-image
   editing via OpenRouter's `input_references` parameter, priced the same
   as a fresh generation. This does not require a new provider or decision
   — it's an implementation task alongside T13 (pass the last-generated
   portrait URL as an `input_references` entry instead of always
   generating from a bare text prompt). Add an explicit validation item to
   T22's harness: run a portrait through several sequential edits and
   eyeball identity drift before committing to this as the live mechanic.
   Name Higgsfield Soul ID in TODOS.md as a concrete (cost-premium,
   platform-locked) fallback if drift proves unworkable — without
   reopening Decision #15's existing Higgsfield deferral.

3. **Q3 (story reuse):** No LangGraph-native primitive exists for this in
   self-hosted LangGraph.js + `PostgresSaver` (confirmed against
   `docs.langchain.com` and the LangGraph.js API reference, consistent with
   how Decisions #19-21 were originally verified) — `copy_thread` is
   Platform-only, the product this project already rejected. If this scope
   gets accepted, it should be scoped as its own task (same shape as
   T19/T20): a new Postgres table snapshotting a flagged chronicle's
   reusable narrative state, read into a new chronicle's `resolve`/
   `narrate` prompt context at start — no checkpoint-level cloning, no new
   service. Not blocking anything currently in flight; safe to leave
   unscheduled until persistent-world-memory (Scope Decision #4, post-v1)
   work is actually underway, since it shares the same table-design
   pattern and timing makes sense to batch together.
