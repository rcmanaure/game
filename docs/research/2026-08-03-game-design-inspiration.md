---
status: DRAFT
---
# Research: Game-Design Inspiration for the AI-DM Coterie-Sim Plan

**Note on convention:** `docs/research/` is a new directory. The repo's only
prior documentation convention was `docs/designs/` (CEO-plan documents). This
file establishes a `docs/research/YYYY-MM-DD-<topic>.md` convention for
research notes that inform but are not themselves plan documents — no
existing convention was overridden, this one is new.

**Scope:** game/product-design inspiration only. The tech stack
(LangGraph.js, NestJS, OpenRouter, `ChatOpenRouter`, `PostgresSaver`) was
already verified in a prior session against primary docs and is not
revisited here. This file does not edit `docs/designs/ai-dm-platform.md` —
findings below are candidates for a future review pass, not decisions.

---

## 1. Existing AI Dungeon Master / AI-narrated TTRPG projects

**The plan's "10x Check" claim ("AI narrates dice rolls" is commodity in
2026) holds up — but the more interesting finding is *why* the commodity
version fails players, and it's not narration quality.**

### AI Dungeon (Latitude) — commodity narration, unmanaged context
AI Dungeon's own help center explains its memory failures as an
architectural fact, not a bug: "The AI can only look back so far in your
adventure's history (called 'context' when it's passed into the AI model)"
— roughly 4,000 tokens for free users — and "when information starts
falling out of context, the AI loses its ability to look back and reference
certain parts of the story, meaning that most of the time, it's just making
it up as best it can." The page's own mitigations (Plot Essentials, a
"Memory System" that manually re-injects events, Retry/Edit) are
player-operated workarounds, not systemic fixes, and the page admits they
are "not guaranteed to work 100% of the time."
Source: [AI Dungeon Help — Why does the AI forget or mix things up?](https://help.aidungeon.com/faq/why-does-the-ai-forget-or-mix-things-up)

### AI Roguelite (Steam) — the sharpest evidence for the plan's rules-layer bet
AI Roguelite is the closest existing shipped analog to this plan's shape: an
LLM-as-engine roguelite with stat/dice checks layered on top of free-text
narration (per its own marketing, "plausibility assessment, stat checks with
dice rolls based on your stats, and AI narrative generation"). But it does
**not** have a deterministic, server-validated rules layer between the LLM's
judgment and the outcome — the LLM itself decides plausibility and can
overrule the numbers. A player feedback thread on the game's own Steam forum
documents exactly the failure mode this plan's Decision #7 (schema-validated
GameEvents, rules-legal check before narration) is designed to prevent:
"swing a sword at an enemy with a lot of HP and they instantly die with one
hit," a "leaf weapon" ending up with higher stats than swords, and an NPC's
disposition drifting "regardless of player actions" because "rather than
using stats and RNG for routine actions... the system consults the AI for
everything, producing erratic results." The same thread also flags
unrecoverable world-memory drift: "world memory cannot be edited
post-creation... NPCs continue referencing outdated objectives" after the
story state has moved on.
Sources: [AI Roguelite on Steam](https://store.steampowered.com/app/1889620/AI_Roguelite/) · [Steam feedback thread](https://steamcommunity.com/app/1889620/discussions/0/4356744414622572721/) · [Steam discussion — memory extension trick](https://steamcommunity.com/app/1889620/discussions/0/599658601187078907/)

### Hidden Door — the one shipped product closest to this plan's two-layer split
Hidden Door's own FAQ describes a genuine hybrid architecture: "We update
our game engine layer with a structured representation of everything in your
world, from story events to character stats and conditions," enforced by "a
dictionary of tens of thousands of words and phrases that are enriched with
metadata that we use both for mechanical operations (you can't put a
skyscraper into your inventory)." Story generation is then a "fractal
combinatorial trope engine" — human-authored structured "beats" (a
recurring genre scenario, e.g. a bar brawl) combined at runtime by a mix of
programmatic logic, classical ML, and LLMs, not pure free-text generation.
This validates the plan's Decision #6/#7 split (fixed taxonomy + rules
validator, free narration within it) as a real, working pattern in a shipped
product — not a novel risk. The FAQ does not explicitly describe
cross-session/cross-playthrough persistent memory of the kind this plan's
10x Check claims (NPCs resurfacing in later runs); its persistence appears
scoped to within a given world/story.
Source: [Hidden Door FAQ](https://www.hiddendoor.co/help/faq)

### Open-source landscape — checking the plan's "dozens" claim directly
The plan's own text asserts "dozens of open-source AI-DM projects already do
this." A GitHub search for `"AI dungeon master"` repositories plus the
`ai-dungeon-master`, `dungeon-master`, and `solo-rpg` GitHub topic pages
turns up at least a dozen independent repos matching the description across
just two search passes (`nickwalton/AI-DungeonMaster`, 79 stars;
`Sagesheep/NarrativeEngine-P`, 77 stars; `electronistu/Project_Infinity`, 41
stars; `deckofdmthings/GameMasterAI`, 35 stars; plus
`djnightmare9909/Dungeon-master-OS-WFGY`, `eeshsaxena/ai-dungeon-master`,
`benjcooley/dungeongod-agi`, `shawnrushefsky/dmcp`,
`ITMO-Agentic-AI/ai-dungeon-master`, `samvoisin/ai-dungeon-master`,
`ell-hosse/AI-Dungeon-Master`, `fedefreak92/dungeon-master-ai-project`,
`tegridydev/dnd-llm-game`) — "dozens" holds as an order-of-magnitude claim,
though every single one is a small hobby project (max 79 stars; none with a
Steam presence or meaningful install base), which the plan's text doesn't
currently qualify.
Sources: [GitHub search — "AI dungeon master" repositories](https://github.com/search?q=%22AI+dungeon+master%22&type=repositories&s=stars&o=desc) · [GitHub topic — ai-dungeon-master](https://github.com/topics/ai-dungeon-master) · [GitHub topic — solo-rpg](https://github.com/topics/solo-rpg)

The highest-starred, most feature-complete repo found —
`Sagesheep/NarrativeEngine-P` — is the most direct open-source analog to
this plan's two-layer split, and its own README is a useful primary source
for both halves of the 10x Check claim. On the rules layer: it ships a
"Dice Fairness system" that "pre-rolls d20 pools each turn and injects
structured outcomes for 7 skill categories... ensuring the GM uses real
rolls rather than fabricating outcomes" — a genuinely deterministic layer
separate from the LLM, distinct in mechanism from this plan's schema-
validated GameEvent approach (pre-rolled pools vs. server-side rules
validation of LLM-emitted mutations) but proof that "deterministic layer
distinct from LLM judgment" is not unclaimed territory in open source
either. On memory: its README claims deep *within-campaign* recall ("the GM
can accurately recall that Bob betrayed the party in Chapter 3... even if
that was 50 chapters and 200 sessions ago") but does not claim persistence
*across separate, completed playthroughs* — memory is scoped to one
continuous campaign, however long.
Source: [GitHub — Sagesheep/NarrativeEngine-P README](https://github.com/Sagesheep/NarrativeEngine-P)

### Verdict on the 10x Check claim
"AI narrates dice rolls" is confirmed commodity — AI Dungeon (2019), AI
Roguelite (2022), and the open-source landscape (dozens of repos, one
highly-featured) all already ship it. What's genuinely rarer, per the
evidence above: (a) a rules layer specifically validating LLM-emitted state
*mutations* against legality/bounds server-side before they apply (AI
Roguelite has no such layer, hence "instant one-hit kills"; NarrativeEngine-P's
pre-rolled dice pools are a different, narrower mechanism; Hidden Door has
a comparable engine layer but as a closed commercial platform, not visible
open prior art), and (b) persistent memory that survives a single
continuous campaign becoming memory *across separate completed
playthroughs* — no product surveyed here, commercial or open-source, does
that; every memory system found (AI Dungeon's context window,
NarrativeEngine-P's full-transcript recall, Hidden Door's engine layer) is
scoped to one ongoing story. This is stronger, more specific support for
the plan's differentiator than the plan's own text currently states — the
plan frames Decision #7's rules-validator as risk-mitigation hardening
against prompt-injection, when the market evidence above says a robust
version of that same layer is also a competitive point of difference in its
own right. (This is a framing observation about the Vision/10x Check
section's own language, not a persistent-memory or bestiary mechanic, so it
is not repeated as a numbered item in Candidate plan amendments below,
which is scoped to those two mechanics specifically.)

---

## 2. Persistent-world / roguelike-legacy mechanics

The common thread across every example below: **memory lands through
surfacing and attribution at a specific, named touchpoint — not through the
existence of a database.** A fact stored but never re-surfaced to the
player is invisible; the games that "feel like the world remembers you" all
have a dedicated screen, character, or moment whose entire job is to hand
past-run facts back to the player, tied to a proper noun.

### Rogue Legacy (Cellar Door Games) — death becomes a named heir, not a game-over
Cellar Door Games' own official product page, fetched directly: "Each time
you die, your child will succeed you. Every child is unique. One child
might be colorblind, another might be a dwarf with vertigo. But that's OK,
because no one is perfect, and you don't have to be to succeed." Per
secondary GDC-postmortem coverage (session recording not directly
transcribed here), the system evolved specifically to soften permadeath's
harshness — "player deaths lead to new heirs inheriting gold, upgrades, and
randomized traits, allowing gradual advancement without full resets,"
evolving from an early idea of a plain leaderboard into a full genealogical
lineage screen. The mechanic that matters: the player sees a specific
successor with specific quirks, not a reset counter.
Sources: [Cellar Door Games — Rogue Legacy (official page, fetched directly)](https://www.cellardoorgames.com/roguelegacy) · [GDC Vault — Rogue Legacy Design Postmortem: Budget Development](https://www.gdcvault.com/play/1020541/Rogue-Legacy-Design-Postmortem-Budget)

### Darkest Dungeon (Red Hook Studios) — named heroes carry consequence forward within a run
Red Hook's own stated design goal: "We wanted to capture the human response
to stress. Any person can break under pressure, and people break in
different ways" — and deliberately not Call of Cthulhu's "insanity" filter:
"we never really thought of things in the strict 'insanity' filter that many
Call of Cthulhu games adopt." The mechanic (Stress -> Affliction check ->
a named, persistent quirk like paranoia or masochism attached to a specific
recruited hero) is the same "surface it on a proper noun" pattern: the
game's memory of a hero's trauma is legible as a trait on that hero's
character sheet, not a hidden variable.
Source: [Game Developer — Game Design Deep Dive: Darkest Dungeon's Affliction System](https://www.gamedeveloper.com/design/game-design-deep-dive-i-darkest-dungeon-s-i-affliction-system)

### Dwarf Fortress (Bay 12 Games) — a browsable ledger of consequence, seeded and comparable
Tarn Adams' stated goal was a "fantasy world generator" where "the things
that you did before will impact the future and so forth." Confirmed by
directly fetching the Game Developer feature (not a search snippet), Adams
is quoted describing exactly how seed determinism makes consequence
legible: "you could run one world out to 110 years, say, and the same world
out to 100 and play the last ten years yourself instead. You'd end up with
two 110-year worlds with near identical histories, but the last ten would
diverge... Legends mode lets you compare what has happened, to random
people or locations or whatever. Somebody that might have lived out their
life peacefully in the non-player 110-year world might have been
conscripted to die in one of your saw traps in the year 105 in the
player-influenced world." And on what gets recorded: "The players can
impact all of it pretty much, and it keeps track of what they do in Legends
mode, the same as worldgen." The mechanic that makes this land for a player
(not just a design intention) is **Legends mode** itself: a browsable
in-game history viewer, using the same underlying data structures as world
generation. The lesson: a *comparable, browsable* record (not just "stuff
happened somewhere in a DB") is what makes consequence feel real.
Source: [Game Developer — How Tarn Adams upgraded and optimized Dwarf Fortress for its official Steam release (fetched directly, quotes confirmed)](https://www.gamedeveloper.com/programming/how-tarn-adams-upgraded-and-optimized-dwarf-fortress-for-its-official-steam-release) · [Dwarf Fortress Wiki — Legends](https://dwarffortresswiki.org/index.php/DF2014:Legends)

### Hades (Supergiant Games) — repetition reframed as continuity, not reset
Greg Kasavin (Supergiant) on why repeated deaths read as narrative progress
instead of erased progress: characters directly acknowledge the loop —
"It's a rematch now, and you've learned a little bit more and you're maybe
a little bit stronger too" — with the game's own fiction (player character
is an immortal god) supplying the diegetic justification: "you're an
immortal god with no sense of the passage of time... you could just
infinitely play the game... and just keep having these unique experiences."
Per secondary coverage of a separate Kasavin forum comment (not contained
in the GeekDad interview fetched above, and not independently verified here
against a primary source), this is also mechanically enforced via
*relationship state* gating which of several pre-written variants of a
scene plays — distinct dialogue branches keyed to relationship level with a
specific character (e.g. Megaera). Relevant for a coterie-sim regardless of
that one unverified detail: the GeekDad-confirmed material above already
establishes that characters acknowledging a specific returning player,
tied to a named NPC, is the load-bearing mechanic — relationship/history
with a specific recurring NPC, not just "world state," is what a returning
player notices.
Source: [GeekDad — Narrative and Early Access: Supergiant's Greg Kasavin Discusses Hades Development](https://geekdad.com/2019/10/narrative-and-early-access-supergiants-greg-kasavin-discusses-hades-development/)

### Death Stranding (Kojima Productions) — asynchronous traces of a *specific* past action
Kojima on the Social Strand System: "you can see the tracks and traces, so
you can feel or think about the other people," and on the "likes"
mechanic — deliberately not a currency or power-up — "unconditional love,"
designed to make players ask themselves "what would people think if I put
it here?" before leaving a structure behind. **Explicit constraint from the
task brief applies here:** this plan's scope is single-player with the
community-almanac idea already deferred indefinitely (Scope Decision #5 in
the design doc), so the transferable lesson is *not* "add other players'
traces" — it's Death Stranding's underlying mechanic of **attributing a
world-state change to a specific, later-surfaced past action**, applied to
a player's *own* prior playthroughs rather than to a social graph.
Source: [Game Informer — Hideo Kojima Answers Our Questions About Death Stranding](https://gameinformer.com/interview/2019/09/16/hideo-kojima-answers-our-questions-about-death-stranding)

---

## 3. Collection / bestiary mechanics

### Monster Hunter — progressive entry completion on a single cached asset (directly reusable pattern)
*(Sourced from community-documented fan guides, not a Capcom developer
statement — the numbers below are player-measured, not official design
documentation, but the mechanic itself is directly observable in the
shipped game.)* Monster Hunter's Hunter's Notes ties bestiary completeness
to a numeric **research level** per monster (4-6 tiers depending on title),
earned by repeated field activity: "Collecting tracks adds about 10
research points, killing a monster adds about 60, and capturing adds about
90." Each research level unlocks *more information about the same monster
entry* — "weak spots, severable/breakable parts, elemental and status
weaknesses, and a list of potential materials" — not a new asset. This is
the closest existing precedent for this plan's Decision #6 constraint (art
keyed to a small fixed archetype enum, not free text): Monster Hunter
proves a *closed, finite* bestiary can still deliver a
collection-progression feel without needing new art per entry — depth of a
single cached entry is the lever, not breadth of entries.
Source: [Attack of the Fanboy — What Do Research Points Do in Monster Hunter: World?](https://attackofthefanboy.com/guides/monster-hunter-world-guide-research/) · [GamerGuides — Monster Ph.D. Trophy Guide](https://www.gamerguides.com/monster-hunter-world/guide/walkthrough/trophy-guide/monster-ph-d)

### Pokédex — completion as the primary long-tail hook, entries locked to direct encounter
*(Sourced from Bulbapedia, a fan-maintained wiki, and a TechRadar report of
a Junichi Masuda statement rather than the original interview — cited as
the best available secondary account, not a primary Game Freak document.)*
Documentation of the Pokédex confirms the base mechanic: "detailed entries
are not recorded until the player obtains the Pokémon," gating full
completion behind direct capture (not just sighting), with a formal
in-fiction completion reward (a "diploma" from Game Freak's in-universe
director). Notably, Game Freak's producer is reported to have stated a
retreat from *ever-growing* Pokédex scope ("we now have no plans to make
the Pokémon that are missing in the Galar Pokédex in-game available") — a
signal that an unbounded, always-growing collection target has its own
scope-management cost, which is a data point in favor of this plan's
already-fixed archetype taxonomy rather than an open-ended one.
Source: [Bulbapedia — Pokédex](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9dex) · [TechRadar — Pokémon Sword and Shield's Pokédex cut could be permanent](https://www.techradar.com/news/pokemon-sword-and-shields-pokedex-cut-could-be-permanent)

### Slay the Spire / Slay the Spire 2 (Mega Crit) — unlocks as lore delivery, with a documented failure mode to avoid
*(The "unlocking cards is awkward" complaint below is from a player
suggestion thread on the game's own Steam hub, not a Mega Crit statement —
cited as real, observed player friction, not developer intent.)* Original
Slay the Spire ties card/relic unlocks to per-character run progress. A
player thread on the Steam Community forum documents a directly relevant
risk: "unlocking cards is awkward, as it can make your runs more difficult
the more you unlock, often making consistent decks harder to build" — i.e.,
a collection-unlock mechanic that interferes with the core gameplay loop it
is bolted onto is a real, reported failure mode, not a hypothetical one.
Per third-party coverage, Slay the Spire 2 responds by tying unlocks
("Epochs") explicitly to lore delivery ("each Epoch representing a major
lore drop about the Spire's history") rather than pure power unlocks —
closer to this plan's bestiary concept (a codex/lore reward, not a
power-progression system) and worth noting as a signal that lore-flavored
unlocks sidestep the balance trap pure-power unlocks fell into.
Source: [Steam Community — player thread, "Improvements to the meta progression system"](https://steamcommunity.com/app/646570/discussions/2/1696043263503477251/) · [GamerBlurb — Slay the Spire 2 Progression Guide](https://gamerblurb.com/articles/slay-the-spire-2-progression-guide)

---

## 4. Dark-fantasy / vampire-adjacent original IP differentiation

### Fallen London / Sunless Sea (Failbetter Games) — differentiation through invented vocabulary, not mechanics
*(Sourced from Hardcore Gaming 101, an independent games-history site, and
Failbetter's own game-description page — not a developer design-process
interview; no such interview was found in this pass.)* Failbetter's
"Neath"/"Zee" setting differentiates almost entirely through dense,
original in-fiction vocabulary and prose style rather than novel systems —
"the style of the writing... makes heavy use of alliteration, obtuse
language, and dense wordplay," with a specific named "Terror Meter" (not a
generic "sanity" or "fear" stat) that "measures your exposure to darkness
and madness" with dedicated flavor text and visual stings at thresholds.
The lesson for this plan: a distinctive *name* for a mechanic, consistently
used in flavor text, does more differentiation work than the underlying
number itself, which is functionally a fear/sanity meter like many other
games'.
Source: [Failbetter Games — Sunless Sea](https://www.failbettergames.com/games/sunless-sea) · [Hardcore Gaming 101 — Sunless Sea](https://hg101.kontek.net/fallenlondon/sunlesssea.htm)

### Bloodborne (FromSoftware) — a coined stat name (Insight) carries both lore and mechanical weight
*(Sourced from TheGamer, a secondary games-guide site — no direct
FromSoftware design statement on the Insight name was found in this pass;
the observation about the mechanic's function is verifiable from the
shipped game itself.)* Insight is simultaneously a resource, a lore
concept, and a difficulty lever (raising it changes enemy behavior and
unlocks NPC dialogue/vendors), deliberately never explained directly
in-game — "Bloodborne never goes out of its way to explain Insight's many
uses," consistent with FromSoft's environmental-storytelling-over-exposition
house style. Distinct from this plan's stat naming (see below), Insight has
zero shared vocabulary with any prior licensed IP — it reads as native to
Bloodborne specifically.
Source: [TheGamer — Bloodborne: A Complete Guide To Insight](https://www.thegamer.com/bloodborne-insight-complete-guide/)

### Darkest Dungeon (Red Hook Studios) — see Section 2 above
Same source as Section 2: Red Hook explicitly rejected reusing "insanity"
mechanics/terminology from the genre's own obvious precedent (Call of
Cthulhu) in favor of original terms ("Stress," "Affliction," "Virtue")
grounded in psychology rather than cosmic horror. This is the most directly
on-point precedent for a game that is visibly gothic/horror-adjacent but
wants distinct branding from its most obvious genre forebear.

### A finding worth flagging back to the plan (not resolved here)
Foundational Decision #1 in `docs/designs/ai-dm-platform.md` states the
project drops "official VTM IP/Dark Pack license" and the Implementation
Notes state "no VTM branding, no VTM canon terms, anywhere." Checking that
claim against the plan's own IP-naming line ("bloodlines, Hunger, Humanity,
Veil-of-secrecy") against V5 (Vampire: The Masquerade 5th Edition, the
current White Wolf/Paradox edition) surfaces two findings of different
strength, not one:
- **"Hunger"** is V5's specific, signature dice-pool mechanic name (the
  resource that literally drives V5's core dice-rolling system) — a
  distinctive, load-bearing term unique to that edition, not a generic
  English word used incidentally. This is the stronger flag.
- **"Humanity"** is also a literal V5 stat name, but it is a much more
  generic term in wide use across the dark-fantasy/horror genre outside
  White Wolf (a "how human do you still feel" stat exists, under that same
  plain-English name, in other vampire/horror games too) — a weaker,
  lower-confidence flag than "Hunger."
Every successful differentiation case researched above (Sunless Sea's
"Terror," Darkest Dungeon's "Stress"/"Affliction," Bloodborne's "Insight")
achieves distinctiveness specifically by *not* reusing the precedent
genre's own term for a near-identical mechanic — "bloodlines" (vs. "clans")
and "Veil-of-secrecy" (vs. "Masquerade") already follow that pattern in
this plan; "Hunger" currently does not, and "Humanity" arguably doesn't
either though less clearly. This is a factual observation about internal
consistency with Decision #1's own stated rule, not a legal opinion —
flagged here neutrally, with the two terms kept separate rather than
presented as equally strong, for a future `/plan-ceo-review` pass to
resolve.

---

## Candidate plan amendments

Scoped tightly to the two mechanics named in this research request —
persistent-world-memory and the bestiary — not a general punch list. (Two
other findings surfaced during research, the Hunger/Humanity naming gap and
the rules-validator-as-differentiator framing, are recorded where they
belong in Sections 1 and 4 above rather than repeated here, since neither
is a persistent-memory or bestiary mechanic.) Each amendment below fits
inside existing Foundational Decisions — no new service (consistent with
Decision #9's no-Redis stance: Postgres rows + a prompt slot + a UI surface
only), no free-text art keys (would break Decision #6's cache economics),
no multiplayer/social layer (Scope Decision #5's community-almanac
deferral stays deferred). These are candidates for a future
`/plan-ceo-review` pass, not decisions.

1. **Progressive bestiary entries, Monster Hunter-style, on the existing fixed archetype cache.**
   Add a per-user, per-archetype "familiarity level" counter (encounters
   survived / defeated with that archetype) stored as a Postgres row. Gate
   *how much of the cached art/lore card is shown* on that counter (e.g.
   silhouette-only → full card → card + a monster-specific tactical note)
   rather than generating new art per tier. Cost: one integer column + one
   UI conditional; zero new art-gen calls, since it reveals more of the
   *same* cached asset per Decision #6's archetype cache rather than
   requesting new ones. Directly resolves the tension between Decision #6's
   need for a small closed archetype set (cache economics) and collection
   mechanics' usual need for breadth to feel like "collecting" —
   progressive-reveal on a small set sidesteps that trade-off entirely
   (Monster Hunter precedent, Section 3).

2. **A named "returning face" surfaced at chronicle start, not just a queryable NPC table.**
   Persistent-world memory (Scope Decision #4, post-v1) risks becoming an
   invisible database if it's only queryable, per the Section 2 finding
   that memory lands through a *dedicated surfacing touchpoint*, not
   storage existing. Concretely: at the start of a new chronicle, if a
   prior playthrough recorded an NPC the player meaningfully interacted
   with (blackmailer, rival, spared enemy), the DM's opening narration beat
   deterministically references that specific named NPC by name/fact before
   any dice are rolled — a one-node addition to the existing LangGraph
   StateGraph (a `recall` node before `resolve`, querying the existing
   Postgres NPC/consequence table by user_id) plus a prompt-injection slot
   for the creative model. No new storage beyond what post-v1 persistent
   memory already requires — this is a presentation-order change, not a new
   data model.

3. **A single-player "chronicle ledger" screen (Dwarf Fortress Legends-mode-lite), not a stats page.**
   Post-v1 persistent memory currently has no stated player-facing surface
   beyond "NPCs can resurface." Add a minimal, plain-list, per-account page
   (query against the same NPC/consequence table from #2, no new writes)
   showing past chronicles' key outcomes in order — "Chronicle 3: spared
   the blackmailer / Chronicle 5: coterie fell to Final Death." This is the
   cheapest possible version of Dwarf Fortress's browsable-history lesson
   (Section 2): the point isn't a rich viewer, it's that the player can
   *look up* what the world remembers instead of only encountering it by
   surprise. Read-only query + a list template; no new schema.
