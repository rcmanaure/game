---
status: DRAFT
---

# Research: LLM-Narrated Permadeath Precedent — AI Dungeon, AI Roguelite, Hidden Door, Fallen London

**Scope:** companion to `2026-08-06-permadeath-retention-mechanics.md` (which
covers roguelike permadeath precedent — Hades, FTL, Slay the Spire, a
different niche, already sourced and not repeated here). This pass covers
the niche our own `docs/reference/DESIGN.md` Product Context section names
explicitly as our competitive space: **AI Dungeon, AI Roguelite, Hidden
Door**. Fallen London (Failbetter Games) is added as a fourth because it's
the strongest primary source for narrative-first, slow-turn, asynchronous
pacing — a design axis none of the three AI-DM competitors actually own.
All claims below are cited to a real URL found via live search on
2026-08-06; nothing is answered from training-data memory. Findings below
are candidates for a future `/plan-ceo-review` pass, not decisions — this
file does not edit `docs/reference/DESIGN.md`.

---

## 1. AI Dungeon (Latitude)

**Retention hooks / session structure:**
AI Dungeon runs on "Adventures" (single continuous playthroughs) with no
enforced end state — sessions are open-ended, not permadeath-gated. Its
memory system has two parts: **Auto Summarization**, which rewrites the
"Story Summary" plot component every 15 actions, and the **Memory Bank**,
which condenses every six player actions into an embedded, semantically
retrieved "Memory" — surfaced to the player as "Used Memories" (currently
relevant) vs. "Stored Memories" (available but inactive). Critically, per
AI Dungeon's own FAQ, "Once your Memory Bank has been filled and a new
memory has been created, we remove the least used memories to make room for
the new addition" — old memories get silently evicted, and the system is
explicitly scoped to a **single adventure**, not bridged across separate
playthroughs. Monetization is a four-tier subscription ladder ($14.99–
$99.99/mo) gating model access ("Dragon" tier for less-filtered output).
Source: [AI Dungeon Help — What is the Memory System?](https://help.aidungeon.com/faq/the-memory-system), [AI Dungeon Help — Why does the AI forget or mix things up?](https://help.aidungeon.com/faq/why-does-the-ai-forget-or-mix-things-up), [AI Dungeon Review 2026 — dungeonsdeep.ai](https://dungeonsdeep.ai/blog/ai-dungeon-review-2026)

**Community praise vs. criticism:**
Praise centers on emergent creativity — "the AI creates twists players
didn't plan, adds characters, and builds scenes fast." Criticism is
dominated by context loss in long sessions: once a story exceeds the
context window, "the AI loses its ability to look back and reference
certain parts of the story... it's just making it up as best it can" (AI
Dungeon's own FAQ, not a hostile source). The more consequential finding is
historical: in April 2021 Latitude shipped an under-communicated content
filter, which crashed the Google Play rating from 4.8 to 2.6, emptied the
Discord server (moderators overwhelmed, server temporarily closed), and
sent ~6,000 users to competitor NovelAI within days — worsened by the
revelation that private stories were subject to human moderator review
without clear consent, and a three-week company silence afterward. The
lesson the postmortem draws: "heavy-handed content moderation without
community dialogue destroys loyalty, regardless of the moderation's ethical
merit." Trust damage from that event is still cited in 2025–2026 reviews.
Source: [Utah Business — Latitude Games' AI Dungeon was changing the face of AI-generated content, until its users turned against it](https://www.utahbusiness.com/archive/2021/06/22/latitude-games-ai-dungeon-was-changing-the-face-of-ai-generated-content-until-its-users-turned-against-it/), [AI Dungeon Review 2026 — aitestguide.com](https://aitestguide.com/ai-dungeon-review/)

---

## 2. AI Roguelite

**Retention hooks / session structure:**
Standard mode is forgiving; "Insane" difficulty adds true permadeath — on
death, "the save file for it [is] erased." Memory is handled through an
explicit, player-invoked workaround rather than an automatic system:
typing `item1 Memory of [Your Memory Here]` in the console manually pins a
fact so the AI stops guessing. This is the closest of the three to our own
permadeath-with-stakes design, but the memory layer is manual/console-driven
rather than a designed NPC-persistence system.
Source: [Steam Community — A Trick to Extend the Game's Memory of Events](https://steamcommunity.com/app/1889620/discussions/0/599658601187078907/), [Steam Community — Advanced Guide with Tips and Tricks](https://steamcommunity.com/sharedfiles/filedetails/?id=3332357112)

**Community praise vs. criticism:**
Praise: players compare sessions favorably to tabletop D&D — "gave me
similar joy as my few D&D experiences" — and call the concept "Super fun
and with boatloads of potential." Criticism, specifically about Insane
mode's permadeath, is about *unfair* stakes rather than *unwanted* stakes:
players report one-hit-feeling swings ("a paper cut and was at 30/100HP in
my first turn"), hunger/needs stats that decay faster than they can be
managed, and off-screen enemy ambushes — plus that meta "undo" safety items
are disabled in Insane mode specifically, which some players felt defeated
the point of having them. The thread's ask was for permadeath harshness to
be an optional slider, not removed outright — i.e., the community wants
real stakes, just calibrated ones.
Source: [Steam Community — Some feedback (Mostly Insane Mode Experience)](https://steamcommunity.com/app/1889620/discussions/0/603018408517221162/)

---

## 3. Hidden Door

**Retention hooks / session structure:**
Chapter-based progression inside licensed IP worlds (e.g. Wizard of Oz).
Character creation with traits, then story branches through periodic
"beat" choices — three pre-written options or free text (free text gets
rewritten through a moderation/rewrite layer rather than directly steering
outcomes). State is tracked via "card-based" objects for characters,
locations, and plot elements, which the reviewer infers forms the backbone
of prompt construction — the game's version of persistent memory, though
implemented as structured cards rather than freeform recall. Company
background: founded by Hilary Mason and Matt Brandwein, $2M pre-seed led by
Northzone, first public release August 2025 after an extended invite-only
beta.
Source: [Hidden Door At Launch: Design Review of an LLM-Driven Story Game — Ian Bicking](https://ianbicking.org/blog/2025/08/hidden-door-design-review-llm-driven-game), [Businesswire — Hidden Door Launches AI Game Platform](https://businesswire.com/news/home/20220316005334/en/Hidden-Door-Launches-AI-Game-Platform-to-Build-the-Narrative-Multiverse)

**Community praise vs. criticism (via detailed design review, closest
available primary source to player sentiment during the beta window):**
The strongest, most specific critique in the space, and the most relevant
to our own design: Hidden Door has **no grounding** — "the treasure chest
doesn't have traps. It also doesn't *not* have traps... the only reality to
the game is what you read." Nothing is predetermined before the player
reads it, so choices don't feel like they resolve against a real world.
This produces disconnected scene transitions, characters that vanish
without explanation, and — most damning for a game in our niche — **no
functioning stakes**: "the single genuine failure... gets immediately
reversed... Permadeath never appears; consequences feel cosmetic." The
reviewer's own attempts to force failure (attacking NPCs, attempting
murder) mostly resolved as success, and violent action against a
companion NPC ("jamming a compass down Boq's throat") was narrated away
with instant forgiveness: "Everyone immediately forgives me. I am
disappointed." Model prose quality is also cited as weak (suspected
Llama-based, "VERY LLM" — verbose, pacing-deaf on trivial actions), with a
direct recommendation to upgrade to a stronger model. The reviewer's
prescription — "couple choices to predetermined consequences rather than
generating outcomes after-the-fact," "prioritize story quality over sandbox
freedom" — is effectively an argument for a real stat/dice resolution layer
separate from the narration layer, which is architecturally close to our
own logic-model/creative-model split.
Source: [Hidden Door At Launch: Design Review of an LLM-Driven Story Game — Ian Bicking](https://ianbicking.org/blog/2025/08/hidden-door-design-review-llm-driven-game)

---

## 4. Fallen London (Failbetter Games) — added as narrative-first slow-pacing precedent

Not an LLM game (hand-authored, pre-AI), but it's the strongest sourced
precedent for "narration-heavy, slow-turn pacing" as a *retention* mechanic
rather than a liability, which is one of the four axes we need to evaluate
ourselves against.

**Retention hooks / session structure:**
Pacing is gated by an Action Point resource (the "Candle"): "Actions
replenish at a rate of 1 every 10 minutes, whether or not you're playing,
up to the maximum of 20 (or 40 for subscribers)." Most story choices cost 1
action; some cost more, shown in-button (e.g. "GO (3)"). This makes the
game explicitly **asynchronous** — designed to be checked in short bursts
every couple of hours, not played in long unbroken sessions. Death is not
permanent: accumulating "Wounds" sends the player to a recovery location
("a slow boat passing a dark beach on a silent river") until menaces are
reduced, then normal play resumes. Most choices carry no permanent
mechanical weight ("Anything that's possible to be missed is never
essential") — the exceptions are explicitly flagged "Important or Missable
Storylines," a small, curated subset of choices that do lock/unlock content
permanently.
Source: [Fallen London Wiki — Beginner's Guide](https://fallenlondon.wiki/wiki/Beginner's_Guide)

**Community praise vs. criticism:**
Praise is squarely about prose quality carrying the slow pace: "the
primary reward being more bits of the narrative in well-written prose,"
and the game rewarding "slow, thoughtful exploration rather than
quick action-based gameplay" precisely because it's asynchronous and
untimed. The one detailed criticism thread found (equipment/outfit
switching being costless and therefore strategically meaningless) is not
about pacing or retention — it's a systems-design complaint about gear,
outside our scope, included here only for completeness. No community
complaint surfaced about the slow pacing itself being a retention problem;
if anything, the sourced sentiment treats slowness as the selling point.
Source: [Fallen London: Why It Works — Steven Savage](https://www.stevensavage.com/blog/2016/12/fallen-london-works.html), [community.failbettergames.com — "Fallen London has a design problem"](https://community.failbettergames.com/t/fallen-london-has-a-design-problem/19676)

---

## Differentiation Analysis

Our design combines four things simultaneously: (a) permadeath with real
stakes, (b) a Craving/Rouse hunger-escalation risk mechanic, (c) NPC memory
persistence *across sessions*, (d) slow, narration-heavy turn pacing.

| Axis | AI Dungeon | AI Roguelite | Hidden Door | Fallen London |
|---|---|---|---|---|
| Permadeath w/ real stakes | No (open-ended) | Yes, but community reports it as *uncalibrated* (one-hit swings, disabled safety nets) rather than *meaningful* | No — reviewer found consequences reliably reversed/cosmetic | No — death is temporary, recoverable |
| Escalating risk mechanic (Rouse-like) | No | No (standard stat decay, not an escalating bet-the-run mechanic) | No | No (Wounds is a threshold-and-recover menace, not a per-turn escalating gamble) |
| NPC/world memory *across sessions* | No — Memory Bank is explicitly single-adventure, oldest memories evicted under pressure | Manual/console workaround only, not a designed system | Card-based state tracking, but reviewer found it doesn't actually ground continuity between scenes, let alone sessions | Permanent cards for "Missable Storylines" persist, but this is authored content-gating, not simulated NPC memory of *player behavior* |
| Slow, narration-heavy pacing | No — designed for continuous, fast interaction | No — real-time action/combat rhythm | Beat-by-beat, moderate pace, not deliberately slow | Yes — explicitly asynchronous, AP-gated, and this is the one place a competitor has proven the pattern works |

**Verdict: partially covered, but the specific combination is genuinely
differentiated.** No single competitor combines all four. The individual
pieces are each precedented somewhere — AI Roguelite proves permadeath
stakes are wanted by this audience (if properly calibrated), Fallen London
proves slow narration-first pacing sustains retention rather than killing
it — but the *cross-session NPC memory persistence* axis is not solved by
anyone reviewed here: AI Dungeon explicitly evicts and scopes memory to a
single adventure, AI Roguelite's is a manual console command, and Hidden
Door's structured card-state was flagged by its own most detailed review as
not producing real narrative grounding, let alone memory that survives
between play sessions. The Rouse/Craving escalating-risk mechanic has no
analog in any of the four — it is the single most novel piece. The honest
risk is not that a competitor already does our combination; it's that
Hidden Door's failure mode (stakes that generate narratively but don't
resolve mechanically) is the most probable way our own permadeath +
Rouse mechanic could fail if the logic-model/creative-model separation
isn't enforced strictly — which is exactly the axis Hidden Door's reviewer
flagged as the fix ("couple choices to predetermined consequences rather
than generating outcomes after-the-fact").
