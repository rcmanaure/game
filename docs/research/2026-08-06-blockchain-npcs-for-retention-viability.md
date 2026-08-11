---
status: RESEARCH (not a decision)
date: 2026-08-06
scope: on-chain NPC state viability for retention in AI Dungeon Master coterie-sim
---
# Research: Blockchain NPCs (On-Chain AI State) for Retention Viability

**Question:** Blockchain NPCs (AI on-chain) viable retention lever for AI DM game?

**Short answer:** Not viable. On-chain NPC state add latency, cost, UX friction, hurt retention, don't fix what drives it. Game's retention strategy depend on narrative continuity + emergent choices — both served better by centralized persistence.

---

## Context: What We're Optimizing For

From `2026-08-04-platform-and-business-research.md`, current retention strategy rely on:

1. **Narrative continuity** — NPCs remember prior choices
2. **Emergent consequence webs** — early choices resurface as complications
3. **Slow, contemplative pacing** — multi-second LLM latency acceptable
4. **Session continuity** — player state persist across logins

On-chain storage mean:
- Store NPC memory/state in smart contract
- Settle NPC interactions on L1, L2, or sidechain
- Use transaction finality as proof "NPC interaction happened"

Fundamentally misaligned with what game does.

---

## Finding 1: Blockchain Games Have Modest Retention; It's Driven by Speculation, Not Narrative

**Retention data for blockchain games (2025-2026):**

- Monthly retention: **35%** (competitive with traditional mobile games; comparable to social/competitive games at 30-45%)
- Weekly engagement: 12-16 hours
- But: 97% of gaming token launches underperformed in 2025; 36% DAU decline year-over-year

**Retention drivers for blockchain games:**
- Token/asset appreciation (speculative)
- Play-to-earn economics (financial incentive)
- Provable ownership (for trading/communities)

**Retention drivers for narrative indie games:**
- Emergent storytelling (choices matter)
- Character attachment (NPC memory)
- Session pacing (cliffhangers, recaps)
- Permadeath stakes (consequences)

**Mismatch:** Blockchain's retention value financial. AI DM game's retention value narrative. NPC state on-chain don't improve narrative retention — only add cost + friction around it.

Sources:
- [Blockchain Gaming Market Statistics 2026](https://www.companieshistory.com/blockchain-gaming-market)
- [Blockchain Gaming Live Ops vs Token Launches](https://cryptodaily.co.uk/2026/05/blockchain-gaming-live-ops-vs-token-launches)

---

## Finding 2: Latency Kills the Slow-Paced Narrative Experience

**Current game design:**
- Multi-second LLM calls per turn expected (narration, resolution)
- Player mindset contemplative, not twitch
- Session pacing emphasize reflection over action

**On-chain latency penalties:**

| Layer | Block time | Finality | Per-tx cost (Polygon/L2) | Practical impact |
|-------|------------|----------|-------------------------|------------------|
| Ethereum L1 | 12-15s | 12+ min | $0.50-2.00 | Not viable for real-time state |
| Polygon PoS (L2-like) | ~2s | 128 blocks (~4 min) | $0.0001-0.01 | Still adds seconds to player actions |
| Arbitrum/Optimism (L2) | 2-4s | 7-10 min for security | $0.001-0.01 | Multiple seconds overhead |

**For NPC recall, mean:**
- Player take action (button click)
- Client call backend, backend call LLM
- Backend *also* need settle NPC state on-chain
- Settle call wait for block confirmation (2-4s minimum on L2, longer for finality)
- Player see result only after settlement

Current flow: **Player action → 3-8s LLM call → Result.**
With on-chain NPC: **Player action → 3-8s LLM call → 2-10s blockchain settlement → Result.**

Blockchain step add nothing to narrative quality; only delay feedback. For contemplative game, feature loss, not gain.

Sources:
- [Polygon vs Ethereum Statistics 2026](https://coinlaw.io/polygon-vs-ethereum-statistics/)
- [Ethereum L2 Networks Comparison](https://coinbureau.com/analysis/what-is-the-best-layer-2)
- [Transaction Costs and Speed in Ethereum Ecosystem](https://arxiv.org/html/2606.22206v1)

---

## Finding 3: Wallet UX Remains a Massive Barrier, Even with Embedded Wallets

**Wallet onboarding friction (2025-2026):**

- Manual wallet setup (seed phrases, external apps): **70% abandonment rate**
- Embedded wallet (social login, gasless): **80%+ completion rate, 340% higher retention than external**
- Current status: Embedded wallet tech exist but need integration work + player education

**For AI DM game:**
- Target platforms: itch.io, Steam (per `ai-dm-platform.md` Scope Decision #7)
- Player expectations: No wallet, no seed phrases, no gas tokens
- Adding blockchain would require:
  - Embedded wallet SDK integration (~1-2 sprints)
  - Player education on "why NPC state on-chain" (confusing for narrative game)
  - Wallet recovery/security UX (player loses wallet → loses NPC history?)

**UX cost real:** Even optimistic embedded-wallet paths impose security/recovery complexity narrative games don't need.

**Concrete friction point:** Player device resets, loses wallet — lose all NPC memory? Centralized DB + auth just re-fetch on login. On-chain mean either:
  - Player must recover wallet (complex)
  - Maintain centralized backup anyway (defeats point)

Sources:
- [Blockchain Gaming UX in 2026: Shift to Invisible Infrastructure](https://chainplay.gg/blog/why-2026-is-the-year-blockchain-gaming-goes-mainstream/)
- [Web3 Gaming Wallet-First Onboarding Problem](https://cryptodaily.co.uk/2026/05/web3-gaming-wallet-first-onboarding)
- [Embedded Wallets 2026 Developer Guide](https://www.openfort.io/blog/embedded-wallet-explained)

---

## Finding 4: No Shipping Games Store NPC AI State On-Chain

**On-chain gaming in 2026:**
- Established games: Pirate Nation, Parallel, Axie Infinity, Gods Unchained
- What they store on-chain: **Assets, ownership, rewards, high-value state changes, governance**
- What they keep off-chain: **Real-time logic, matchmaking, physics, AI/NPC behavior**

**Why?** Smart contracts good at:
- Verifiable ownership (who owns what)
- Provable settlement (reward distribution)
- Deterministic rules (D20 rolls)

Smart contracts bad at:
- LLM inference (AI state, narrative generation)
- Complex state mutations (NPC personality, memory updates)
- Dynamic logic (branches, conditions, AI thinking)

**Evidence:** Zero shipping games found store dynamic NPC AI state on-chain. Why? Expensive (gas), slow (block time), don't add value (player can't trade NPC memories or prove them elsewhere).

---

## Finding 5: Cost Analysis Shows Centralized DB Wins on Every Axis

**Scenario: One turn = player action → NPC state update + narration**

### On-chain NPC update cost:

- Smart contract call to update NPC memory: ~1-2M gas (L2 Arbitrum/Optimism)
- Cost at current prices: **~$0.001-0.003 per turn**
- Annual cost for 1000 active players, 10 turns/week: **~$2000-6000**

### Centralized DB cost:

- Postgres row insert/update (NPC memory): < 1ms, negligible CPU
- Backend inference cost (OpenRouter narration): **~$0.01-0.04 per turn** (LLM dominates)
- Annual cost for same 1000 players: **Narration model (~$5000-15000) dominates; DB rounding error**

### Infrastructure cost:
- On-chain: Add blockchain complexity, bridge risk, validator fee exposure, still need backup DB anyway
- Centralized: Postgres already in stack; no additional infrastructure

**Winner:** Centralized by massive margin. Blockchain cost small vs LLM cost, but add complexity for zero narrative benefit.

---

## Finding 6: No Cross-Game NPC Trading/Interop Use Case Exists

**Only real blockchain retention advantage would be:**
- NPCs interoperable across games (player trades pet NPC to another game)
- NPC history portable (verifiable on-chain, player prove "NPC remembers my choices")

**Reality for AI DM:**
- Single game (not platform)
- NPC memories game-specific (tied to specific chronicle/playthrough)
- Players don't want trade NPCs; want emergent stories
- No planned interop with other games

**In other words:** Feature that'd justify blockchain NPC state (cross-game portability) don't exist in this product. State only valuable within one game — exactly where centralized DB shine.

---

## Verdict: Not Viable

**Blockchain NPCs for retention not viable because:**

1. ✗ **Latency:** Adds 2-10s blockchain settlement overhead to turns already spanning 3-8s LLM time. No narrative benefit; pure friction.

2. ✗ **Retention drivers mismatched:** Blockchain retention financial (speculation, P2E); AI DM retention narrative (choice, consequence, pacing). Optimizing wrong dimension.

3. ✗ **Wallet UX still barrier:** Even embedded wallets, integration cost + player confusion outweigh benefits for game that don't need blockchain.

4. ✗ **Cost:** Blockchain adds cost for zero value. Centralized DB + OpenRouter narration simpler, cheaper.

5. ✗ **No interop use case:** NPCs game-specific; no cross-game trading justify on-chain storage.

6. ✗ **Precedent:** No shipping narrative game use on-chain NPC AI state. Successful blockchain games use on-chain storage for *assets*, not *logic*.

---

## Recommendation

**Keep NPC persistence centralized (Postgres + backend).**

Current plan (2026-08-04 retention research) already right:
- NPC memory stored in Postgres (fast, cheap, owned)
- Consequence webs tracked in `consequence` table (deterministic, queryable)
- Session-end recap + mid-session cliffhangers (pure UX, no infrastructure needed)

Addresses retention drivers without blockchain overhead.

**If future cross-game interop become goal,** reconsider on-chain NPC registry then — but only for portability metadata, not live AI state.

---

## Sources Cited

1. [Blockchain Gaming Market Statistics 2026](https://www.companieshistory.com/blockchain-gaming-market)
2. [Blockchain Gaming: Live Ops vs Token Launches](https://cryptodaily.co.uk/2026/05/blockchain-gaming-live-ops-vs-token-launches)
3. [Polygon vs Ethereum Statistics 2026](https://coinlaw.io/polygon-vs-ethereum-statistics/)
4. [Best Ethereum Layer 2 Projects 2026](https://coinbureau.com/analysis/what-is-the-best-layer-2)
5. [Transaction Costs and Speed in Ethereum Ecosystem](https://arxiv.org/html/2606.22206v1)
6. [Blockchain Gaming UX: The Shift to Invisible Infrastructure](https://chainplay.gg/blog/why-2026-is-the-year-blockchain-gaming-goes-mainstream/)
7. [Web3 Gaming Wallet-First Onboarding Problem](https://cryptodaily.co.uk/2026/05/web3-gaming-wallet-first-onboarding)
8. [Embedded Wallets Explained: 2026 Developer Guide](https://www.openfort.io/blog/embedded-wallet-explained)