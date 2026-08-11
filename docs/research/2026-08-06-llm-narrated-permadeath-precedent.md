---
status: DRAFT
---
# Research: LLM-Narrated Permadeath Precedent — AI Dungeon, AI Roguelite, Hidden Door, Fallen London

**Scope:** companion to `2026-08-06-permadeath-retention-mechanics.md` (covers roguelike permadeath precedent — Hades, FTL, Slay the Spire, different niche, already sourced, not repeated here). This pass covers niche our `docs/reference/DESIGN.md` Product Context section names explicit as competitive space: **AI Dungeon, AI Roguelite, Hidden Door**. Fallen London (Failbetter Games) added as fourth — strongest primary source for narrative-first, slow-turn, async pacing, design axis none of three AI-DM competitors own. All claims below cited to real URL found via live search 2026-08-06; nothing answered from training-data memory. Findings candidates for future `/plan-ceo-review` pass, not decisions — file doesn't edit `docs/reference/DESIGN.md`.

---

## 1. AI Dungeon (Latitude)

**Retention hooks / session structure:**
AI Dungeon runs "Adventures" (single continuous playthroughs), no enforced end state — sessions open-ended, not permadeath-gated. Memory system two parts: **Auto Summarization**, rewrites "Story Summary" plot component every 15 actions, and **Memory Bank**, condenses every six player actions into embedded, semantically retrieved "Memory" — surfaced to player as "Used Memories" (currently relevant) vs. "Stored Memories" (available but inactive). Critical: per AI Dungeon's own FAQ, "Once your Memory Bank has been filled and a new memory has been created, we remove the least used memories to make room for the new addition" — old memories silently evicted, system explicit scoped to **single adventure**, not bridged across separate playthroughs. Monetization four-tier subscription ladder ($14.99–$99.99/mo) gating model access ("Dragon" tier for less-filtered output).
Source: [AI Dungeon Help — What is the Memory System?](https://help.aidungeon.com/faq/the-memory-system), [AI Dungeon Help — Why does the AI forget or mix things up?](https://help.aidungeon.com/faq/why-does-the-ai-forget-or-mix-things-up), [AI Dungeon Review 2026 — dungeonsdeep.ai](https://dungeonsdeep.ai/blog/ai-dungeon-review-2026)

**Community praise vs. criticism:**
Praise centers on emergent creativity — "the AI creates twists players didn't plan, adds characters, and builds scenes fast." Criticism dominated by context loss in long sessions: once story exceeds context window, "the AI loses its ability to look back and reference certain parts of the story... it's just making it up as best it can" (AI Dungeon's own FAQ, not hostile source). More consequential finding historical: April 2021 Latitude shipped under-communicated content filter, crashed Google Play rating 4.8 to 2.6, emptied Discord server (moderators overwhelmed, server temporarily closed), sent ~6,000 users to competitor NovelAI within days — worsened by revelation private stories subject to human moderator review without clear consent, and three-week company silence after. Postmortem lesson: "heavy-handed content moderation without community dialogue destroys loyalty, regardless of the moderation's ethical merit." Trust damage from event still cited in 2025–2026 reviews.
Source: [Utah Business — Latitude Games' AI Dungeon was changing the face of AI-generated content, until its users turned against it](https://www.utahbusiness.com/archive/2021/06/22/latitude-games-ai-dungeon-was-changing-the-face-of-ai-generated-content-until-its-users-turned-against-it/), [AI Dungeon Review 2026 — aitestguide.com](https://aitestguide.com/ai-dungeon-review/)

---

## 2. AI Roguelite

**Retention hooks / session structure:**
Standard mode forgiving; "Insane" difficulty adds true permadeath — on death, "the save file for it [is] erased." Memory handled through explicit, player-invoked workaround rather than automatic system: typing `item1 Memory of [Your Memory Here]` in console manually pins fact so AI stops guessing. Closest of three to our own permadeath-with-stakes design, but memory layer manual/console-driven rather than designed NPC-persistence system.
Source: [Steam Community — A Trick to Extend the Game's Memory of Events](https://steamcommunity.com/app/1889620/discussions/0/599658601187078907/), [Steam Community — Advanced Guide with Tips and Tricks](https://steamcommunity.com/sharedfiles/filedetails/?id=3332357112)

**Community praise vs. criticism:**
Praise: players compare sessions favorably to tabletop D&D — "gave me similar joy as my few D&D experiences" — call concept "Super fun and with boatloads of potential." Criticism, specifically Insane mode's permadeath, about *unfair* stakes rather than *unwanted* stakes: players report one-hit-feeling swings ("a paper cut and was at 30/100HP in my first turn"), hunger/needs stats decay faster than manageable, off-screen enemy ambushes — plus meta "undo" safety items disabled in Insane mode specifically, some players felt defeated the point of having them. Thread's ask: permadeath harshness be optional slider, not removed outright — community wants real stakes, just calibrated ones.
Source: [Steam Community — Some feedback (Mostly Insane Mode Experience)](https://steamcommunity.com/app/1889620/discussions/0/603018408517221162/)

---

## 3. Hidden Door

**Retention hooks / session structure:**
Chapter-based progression inside licensed IP worlds (e.g. Wizard of Oz). Character creation with traits, then story branches through periodic "beat" choices — three pre-written options or free text (free text gets rewritten through moderation/rewrite layer rather than directly steering outcomes). State tracked via "card-based" objects for characters, locations, plot elements — reviewer infers this forms backbone of prompt construction, game's version of persistent memory, though implemented as structured cards rather than freeform recall. Company background: founded by Hilary Mason and Matt Brandwein, $2M pre-seed led by Northzone, first public release August 2025 after extended invite-only beta.
Source: [Hidden Door At Launch: Design Review of an LLM-Driven Story Game — Ian Bicking](https://ianbicking.org/blog/2025/08/hidden-door-design-review-llm-driven-game), [Businesswire — Hidden Door Launches AI Game Platform](https://businesswire.com/news/home/20220316005334/en/Hidden-Door-Launches-AI-Game-Platform-to-Build-the-Narrative-Multiverse)

**Community praise vs. criticism (via detailed design review, closest available primary source to player sentiment during beta window):**
Strongest, most specific critique in space, most relevant to our own design: Hidden Door has **no grounding** — "the treasure chest doesn't have traps. It also doesn't *not* have traps... the only reality to the game is what you read." Nothing predetermined before player reads it, so choices don't feel like they resolve against real world. Produces disconnected scene transitions, characters vanish without explanation, and — most damning for game in our niche — **no functioning stakes**: "the single genuine failure... gets immediately reversed... Permadeath never appears; consequences feel cosmetic." Reviewer's own attempts to force failure (attacking NPCs, attempting murder) mostly resolved as success, violent action against companion NPC ("jamming a compass down Boq's throat") narrated away with instant forgiveness: "Everyone immediately forgives me. I am disappointed." Model prose quality also cited weak (suspected Llama-based, "VERY LLM" — verbose, pacing-deaf on trivial actions), direct recommendation to upgrade to stronger model. Reviewer's prescription — "couple choices to predetermined consequences rather than generating outcomes after-the-fact," "prioritize story quality over sandbox freedom" — effectively argument for real stat/dice resolution layer separate from narration layer, architecturally close to our own logic-model/creative-model split.
Source: [Hidden Door At Launch: Design Review of an LLM-Driven Story Game — Ian Bicking](https://ianbicking.org/blog/2025/08/hidden-door-design-review-llm-driven-game)

---

## 4. Fallen London (Failbetter Games) — added as narrative-first slow-pacing precedent

Not LLM game (hand-authored, pre-AI), but strongest sourced precedent for "narration-heavy, slow-turn pacing" as *retention* mechanic rather than liability — one of four axes we need to evaluate ourselves against.

**Retention hooks / session structure:**
Pacing gated by Action Point resource (the "Candle"): "Actions replenish at a rate of 1 every 10 minutes, whether or not you're playing, up to the maximum of 20 (or 40 for subscribers)." Most story choices cost 1 action; some cost more, shown in-button (e.g. "GO (3)"). Makes game explicit **asynchronous** — designed for short bursts every couple hours, not long unbroken sessions. Death not permanent: accumulating "Wounds" sends player to recovery location ("a slow boat passing a dark beach on a silent river") until menaces reduced, then normal play resumes. Most choices carry no permanent mechanical weight ("Anything that's possible to be missed is never essential") — exceptions explicit flagged "Important or Missable Storylines," small curated subset of choices that do lock/unlock content permanently.
Source: [Fallen London Wiki — Beginner's Guide](https://fallenlondon.wiki/wiki/Beginner's_Guide)

**Community praise vs. criticism:**
Praise squarely about prose quality carrying slow pace: "the primary reward being more bits of the narrative in well-written prose," game rewarding "slow, thoughtful exploration rather than quick action-based gameplay" precisely because async and untimed. One detailed criticism thread found (equipment/outfit switching costless, therefore strategically meaningless) not about pacing or retention — systems-design complaint about gear, outside our scope, included only for completeness. No community complaint surfaced about slow pacing itself being retention problem; if anything, sourced sentiment treats slowness as selling point.
Source: [Fallen London: Why It Works — Steven Savage](https://www.stevensavage.com/blog/2016/12/fallen-london-works.html), [community.failbettergames.com — "Fallen London has a design problem"](https://community.failbettergames.com/t/fallen-london-has-a-design-problem/19676)

---

## Differentiation Analysis

Our design combines four things at once: (a) permadeath with real stakes, (b) Craving/Rouse hunger-escalation risk mechanic, (c) NPC memory persistence *across sessions*, (d) slow, narration-heavy turn pacing.

| Axis | AI Dungeon | AI Roguelite | Hidden Door | Fallen London |
|---|---|---|---|---|
| Permadeath w/ real stakes | No (open-ended) | Yes, but community reports it as *uncalibrated* (one-hit swings, disabled safety nets) rather than *meaningful* | No — reviewer found consequences reliably reversed/cosmetic | No — death temporary, recoverable |
| Escalating risk mechanic (Rouse-like) | No | No (standard stat decay, not escalating bet-the-run mechanic) | No | No (Wounds threshold-and-recover menace, not per-turn escalating gamble) |
| NPC/world memory *across sessions* | No — Memory Bank explicit single-adventure, oldest memories evicted under pressure | Manual/console workaround only, not designed system | Card-based state tracking, but reviewer found it doesn't actually ground continuity between scenes, let alone sessions | Permanent cards for "Missable Storylines" persist, but this authored content-gating, not simulated NPC memory of *player behavior* |
| Slow, narration-heavy pacing | No — designed for continuous, fast interaction | No — real-time action/combat rhythm | Beat-by-beat, moderate pace, not deliberate slow | Yes — explicit asynchronous, AP-gated, one place a competitor has proven pattern works |

**Verdict: partially covered, but specific combination genuinely differentiated.** No single competitor combines all four. Individual pieces each precedented somewhere — AI Roguelite proves permadeath stakes wanted by this audience (if properly calibrated), Fallen London proves slow narration-first pacing sustains retention rather than killing it — but *cross-session NPC memory persistence* axis not solved by anyone reviewed here: AI Dungeon explicit evicts and scopes memory to single adventure, AI Roguelite's is manual console command, Hidden Door's structured card-state flagged by its own most detailed review as not producing real narrative grounding, let alone memory surviving between play sessions. Rouse/Craving escalating-risk mechanic has no analog in any of four — single most novel piece. Honest risk not that competitor already does our combination; it's that Hidden Door's failure mode (stakes that generate narratively but don't resolve mechanically) is most probable way our own permadeath + Rouse mechanic could fail if logic-model/creative-model separation isn't enforced strict — exactly axis Hidden Door's reviewer flagged as fix ("couple choices to predetermined consequences rather than generating outcomes after-the-fact").