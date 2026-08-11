---
status: DRAFT
---
# Research: Platform, Distribution, Monetization, Retention

**Scope:** four angles not covered by prior research pass
(`2026-08-03-game-design-inspiration.md`, covered AI-DM competitors,
persistent-memory patterns, bestiary mechanics, IP naming). This pass:
tech-stack validation, distribution strategy, monetization, retention.
Findings below candidates for future `/plan-ceo-review` pass, not
decisions — file doesn't edit `docs/designs/ai-dm-platform.md`.

Run via 4 parallel haiku subagents, 2026-08-04.

---

## 1. Frontend engine: Phaser/PixiJS vs alternatives vs no engine

**Finding: current game shape (mostly text + card UI + occasional idle/
attack sprite animation, no physics, no twitch action) doesn't need full
game engine.** Phaser bundles physics/collision/tilemap systems game
never uses; PixiJS pure renderer, still leaves all UI/state/dialog work
hand-built. MDN's own game-dev guidance + 148+ existing vanilla-DOM card
game repos support building card layout, state, sprite/idle animation
directly in DOM + CSS (`@keyframes`/CSS transitions) or small tween lib
(Motion.dev, ~90% smaller than GSAP), state living in NestJS backend
where it already lives per plan.

Recommended stack if direction taken: DOM + Flexbox/Grid + CSS
transitions for cards, CSS keyframes or Motion.dev for sprite idle/attack
tweens, plain `<div>`/`<p>` for streamed narration text. Add Phaser only
if sprite count explodes (100+) or physics/collision becomes central —
neither applies today.

**Tension with current plan:** Foundational Decision #19-21 and V1
Launch Scope both name "Phaser/PixiJS frontend with sprite animations" as
locked. Finding says choice may be more engine than game needs, not
wrong — worth deliberate revisit, not automatic switch.

## 2. Distribution: browser-first + later webview-wrap vs alternatives

**Finding: "browser first, wrap in Electron/Tauri later for Steam" plan
(Scope Decision #7) has real friction at wrap step, skipping Steam at
launch may be stronger sequencing.** WebGPU going production-stable
across major browsers (Chrome, Edge, Safari 18, Firefox 130+) by April
2026 raises what's achievable purely in-browser. Tauri v2 far lighter
than Electron (3MB vs 150MB installers) but only supports WebGPU via
unsafe experimental flag in WebView2, rendering varies by OS since uses
native system webview — real risk of cross-platform render bugs for
PixiJS-based game specifically. Electron more stable for games but gives
up Tauri's size advantage.

Steam itself high bar to justify early: of ~17,889 games released on
Steam in 2025, half got under 10 reviews; reaching even 50-1000 reviews
needs roughly 7-10K pre-launch wishlists and 12-18 months marketing
runway. itch.io's HTML5 category ships same browser build, no wrapping
step, better revenue split (90/10 vs Steam's 70/30).

**Recommendation surfaced:** ship browser + itch.io first, keep Steam-
readiness as constraint on browser-API usage only (Scope Decision #7
already scopes it this way — "constraint only, no build now"), decide on
actual wrap (Electron over Tauri, given WebGPU/webview render-
consistency risk above) only once real traction justifies it. Consistent
with, not contradictory to, existing Decision #7 — argues for delaying
wrap decision even further, not changing constraint itself.

## 3. Monetization

**Finding: no monetization model decided yet, project has real per-turn
variable cost (LLM narration + ~$0.04/image art-gen via OpenRouter) most
generic "indie game monetization" advice doesn't account for.**
Recommended shape: freemium with capped free daily-turn allowance (e.g.
2-3 turns/day) to remove signup friction and validate core loop, one-time
purchase unlock (~$15-25) to remove cap — matching PC-indie convention of
pay-once pricing over subscription churn risk — with optional low-cost
monthly tier (~$5) for heavy players later, following AI Dungeon's own
template (monthly credit allotments + perks, not just more turns).

Critical secondary point: model selection is actual cost lever, not
pricing tier design — same research flagged roughly 100x cost variance
between frontier models and cheaper ones for narration generation,
recommended reserving expensive models for moderation/logic-critical
calls only, batching non-realtime calls where possible. Directly relevant
to which OpenRouter model gets used at `resolve`/`narrate` nodes
(Decision #19's StateGraph), worth follow-up cost-modeling pass before
committing to specific models, not just architecture.

**Tension with current plan:** no monetization decision currently exists
in `ai-dm-platform.md` — genuinely open gap, not conflict with existing
decision. Flagging as candidate for future Foundational Decision, since
Decision #9 (no Redis, cost-conscious) and Decision #13 (spend cap)
already show cost-consciousness first-class concern here.

## 4. Retention / session design

**Finding: players tolerating multi-second per-turn LLM latency already
in contemplative, not twitch, mindset — retention design should lean
into that rather than fight it.** Five concrete, low-effort candidates,
none requiring new backend infrastructure beyond what's already planned:

1. **Mid-session cliffhangers** — end turn on unresolved narrative hook
   rather than closure; research on interactive fiction shows this
   genuine re-engagement driver.
2. **Cross-session consequence webs** — reuse same NPC/consequence store
   already proposed for persistent-world memory (prior research doc,
   Candidate Amendment #2), have early-session choice resurface as
   complication several turns later, not just across chronicles.
3. **Fixed-length session pacing (~3 turns)** — final turn reflective,
   not another action beat; optional continue prompt after.
4. **Session-end recap** — one lightweight LLM call at logout summarizing
   "what changed while you were away," continuity without save-state UI
   work.
5. **Sustained-play narrative unlocks** — gate new NPC scenes/dialogue on
   session count (3+), not daily-login streaks, avoid rewarding spam
   logins.

**Tension with current plan:** none — additive UX ideas sitting on top of
existing turn-resolution/WebSocket/NPC-table infrastructure, same "no new
service" constraint prior research doc's candidate amendments already
followed.

---

## Candidate plan amendments (summary, for a future review pass)

1. Revisit Phaser/PixiJS (Decision #19-21, V1 Launch Scope) against
   DOM+CSS-first approach given game's actual shape — not automatic
   switch, deliberate re-check.
2. Keep Decision #7's Steam-readiness-as-constraint-only stance, but
   treat itch.io/browser-only as real first release target, not just
   stepping stone to Steam — sequence any actual webview wrap later than
   currently implied, prefer Electron over Tauri if/when wrap happens
   (WebGPU support gap in Tauri's WebView2 path).
3. Open new Foundational Decision for monetization model (currently
   undecided): freemium + capped free turns + one-time unlock, informed
   by follow-up OpenRouter model-cost pass for `resolve`/`narrate` nodes
   specifically.
4. Add cliffhanger/recap/session-pacing hooks to narration design — fits
   inside existing turn-resolution and NPC-table infrastructure, no new
   service.