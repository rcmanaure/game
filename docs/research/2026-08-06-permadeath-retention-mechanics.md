---
status: RESEARCH
---

# Permadeath Retention Mechanics: Hades, FTL, Slay the Spire

## Hades (Supergiant Games)

**Core mechanic:** Relationship-state gating + character acknowledgment of loop.

Greg Kasavin (creative director): "It's a rematch now, and you've learned a little bit more and you're maybe a little bit stronger too." Immortal-god diegesis (character's narrative reason for respawning) validates repetition as progression. Dialogue branches keyed to NPC relationship levels make returning players feel recognized.

- **Replayability**: 6/10 (weapon/mirror variations, fixed NPC roster)
- **Agency**: 9/10 (player chooses NPC interactions, which gates unique dialogue)
- **Surprise**: 7/10 (dialogue variants on repeat; boss patterns fixed)

Source: [GeekDad — Narrative and Early Access](https://geekdad.com/2019/10/narrative-and-early-access-supergiants-greg-kasavin-discusses-hades-development/)

---

## FTL: Faster Than Light (Subset Games)

**Core mechanic:** Permanent progression across runs (ship unlocks, scrap accumulation, beacon/enemy discovery).

Justin Ma + Matthew Davis: "Success comes from learning, not from any single run." Death feels like research; unlocking new ships/crew types from prior failures is visible progress. No single run is "wasted" — knowledge + unlocks compound.

- **Replayability**: 10/10 (procedural maps, 8+ ships with distinct playstyles, no run identical)
- **Agency**: 7/10 (pick weapons/shields, but RNG heavily gates options)
- **Surprise**: 9/10 (random events, ship variants, unexpected hard counters)

Sources: [Designer commentary, various GDC postmortems]; [Rock Paper Shotgun interview — Subset Games on FTL's design philosophy](https://www.rockpapershotgun.com/faster-than-light-post-mortem)

---

## Slay the Spire (Mega Crit Games)

**Core mechanic:** Unlock progression that gates *build variety*, not just power. Each character starts weak; defeats unlock cards/relics, which create new viable deck archetypes.

Designer commentary: Unlocks explicitly tie to lore/narrative progression (v2: "Epochs"). Early constraint: pure-power unlocks made runs harder, not better. Solution: lore-flavored, build-enabling unlocks sidestep power creep.

- **Replayability**: 10/10 (procedural encounters, card/relic pools, 3 characters with distinct identities)
- **Agency**: 9/10 (player chooses build path early; draft-style deck building each turn)
- **Surprise**: 8/10 (random event cascades, rare relic combos, hard-counter elite encounters)

Sources: [Steam Community — unlock progression feedback thread](https://steamcommunity.com/app/646570/discussions/2/1696043263503477251/); [GamerBlurb — Slay the Spire 2 lore-progression design](https://gamerblurb.com/articles/slay-the-spire-2-progression-guide)

---

## Pattern Across All Three

**DNA**: Death is not loss; it's *asymmetric information gain*.

| Game | Currency | Mechanic | Why It Sticks |
|------|----------|----------|---------------|
| Hades | Recognition (NPC dialogue state) | Character knows you returned | Emotional: "you matter to this world" |
| FTL | Knowledge (unlocked ships/configs) | Progression visible in ship select | Tactical: "I know what works now" |
| Slay the Spire | Variety (unlocked archetypes) | New playstyles from defeats | Strategic: "I can try a completely different build" |

**Common thread**: Each game makes *past failure's accumulated knowledge directly visible* before the next run starts — not hidden in a database.

---

## Gap in Current Game

Current "Permadeath + Torpor" plan (per `docs/research/2026-08-06-blockchain-npcs-for-retention-viability.md`) has:
- ✓ NPC persistence (Hades pattern)
- ✓ Rules-validated progression (rules layer can compound knowledge)
- ✗ **No visible "ship select" equivalent** showing run-to-run growth

**Recommendation**: Add a pre-chronicle screen surfacing past defeated coterie, spared enemies, or learned NPC secrets *before dice roll*, not just in passive NPC queryability. Model: Section 2.2 of `2026-08-03-game-design-inspiration.md` ("A named returning face...") + Dwarf Fortress Legends Mode aesthetic (browsable ledger, not rich viewer).
