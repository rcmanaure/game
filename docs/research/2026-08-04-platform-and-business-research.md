---
status: DRAFT
---
# Research: Platform, Distribution, Monetization, Retention

**Scope:** four angles not covered by the prior research pass
(`2026-08-03-game-design-inspiration.md`, which covered AI-DM competitors,
persistent-memory patterns, bestiary mechanics, IP naming). This pass covers
tech-stack validation, distribution strategy, monetization, and retention.
Findings below are candidates for a future `/plan-ceo-review` pass, not
decisions — this file does not edit `docs/designs/ai-dm-platform.md`.

Run via 4 parallel haiku subagents, 2026-08-04.

---

## 1. Frontend engine: Phaser/PixiJS vs alternatives vs no engine

**Finding: current game shape (mostly text + card UI + occasional idle/
attack sprite animation, no physics, no twitch action) doesn't need a full
game engine.** Phaser bundles physics/collision/tilemap systems this game
never uses; PixiJS is a pure renderer that still leaves all UI/state/dialog
work to be hand-built. MDN's own game-dev guidance and 148+ existing
vanilla-DOM card game repos support building card layout, state, and
sprite/idle animation directly in DOM + CSS (`@keyframes`/CSS transitions)
or a small tween lib (Motion.dev, ~90% smaller than GSAP), with state living
in the NestJS backend where it already lives per the plan.

Recommended stack if this direction is taken: DOM + Flexbox/Grid + CSS
transitions for cards, CSS keyframes or Motion.dev for sprite idle/attack
tweens, plain `<div>`/`<p>` for streamed narration text. Add Phaser only if
sprite count explodes (100+) or physics/collision becomes central — neither
applies today.

**Tension with current plan:** Foundational Decision #19-21 and the V1
Launch Scope both name "Phaser/PixiJS frontend with sprite animations" as
locked. This finding says that choice may be more engine than the game
needs, not that it's wrong — worth a deliberate revisit, not an
automatic switch.

## 2. Distribution: browser-first + later webview-wrap vs alternatives

**Finding: the "browser first, wrap in Electron/Tauri later for Steam"
plan (Scope Decision #7) has real friction at the wrap step, and skipping
Steam at launch may be the stronger sequencing.** WebGPU going
production-stable across major browsers (Chrome, Edge, Safari 18, Firefox
130+) by April 2026 raises what's achievable purely in-browser. Tauri v2 is
far lighter than Electron (3MB vs 150MB installers) but only supports
WebGPU via an unsafe experimental flag in WebView2, and rendering varies by
OS since it uses the native system webview — real risk of cross-platform
render bugs for a PixiJS-based game specifically. Electron is more stable
for games but gives up Tauri's size advantage.

Steam itself is a high bar to justify early: of ~17,889 games released on
Steam in 2025, half got under 10 reviews; reaching even 50-1000 reviews
needs roughly 7-10K pre-launch wishlists and 12-18 months of marketing
runway. itch.io's HTML5 category ships the same browser build with no
wrapping step and a better revenue split (90/10 vs Steam's 70/30).

**Recommendation surfaced:** ship browser + itch.io first, keep Steam-
readiness as a constraint on browser-API usage only (which Scope Decision
#7 already scopes it as — "constraint only, no build now"), decide on an
actual wrap (Electron over Tauri, given the WebGPU/webview render-
consistency risk above) only once real traction justifies it. This is
consistent with, not contradictory to, the existing Decision #7 — it
argues for delaying the wrap decision even further, not for changing the
constraint itself.

## 3. Monetization

**Finding: no monetization model is decided yet, and the project has a
real per-turn variable cost (LLM narration + ~$0.04/image art-gen via
OpenRouter) that most generic "indie game monetization" advice doesn't
account for.** Recommended shape: freemium with a capped free daily-turn
allowance (e.g. 2-3 turns/day) to remove signup friction and validate the
core loop, a one-time purchase unlock (~$15-25) to remove the cap —
matching PC-indie convention of pay-once pricing over subscription churn
risk — with an optional low-cost monthly tier (~$5) for heavy players
later, following AI Dungeon's own template (monthly credit allotments +
perks, not just more turns).

Critical secondary point: model selection is the actual cost lever, not
pricing tier design — the same research flagged roughly 100x cost variance
between frontier models and cheaper ones for narration generation, and
recommended reserving expensive models for moderation/logic-critical calls
only, batching non-realtime calls where possible. This is directly
relevant to which OpenRouter model gets used at the `resolve`/`narrate`
nodes (Decision #19's StateGraph) and is worth a follow-up cost-modeling
pass before committing to specific models, not just architecture.

**Tension with current plan:** no monetization decision currently exists
in `ai-dm-platform.md` — this is a genuinely open gap, not a conflict with
an existing decision. Flagging as a candidate for a future Foundational
Decision, since Decision #9 (no Redis, cost-conscious) and Decision #13
(spend cap) already show cost-consciousness is a first-class concern here.

## 4. Retention / session design

**Finding: players tolerating multi-second per-turn LLM latency are
already in a contemplative, not twitch, mindset — retention design should
lean into that rather than fight it.** Five concrete, low-effort
candidates, none requiring new backend infrastructure beyond what's
already planned:

1. **Mid-session cliffhangers** — end a turn on an unresolved narrative
   hook rather than closure; research on interactive fiction shows this as
   a genuine re-engagement driver.
2. **Cross-session consequence webs** — reuse the same NPC/consequence
   store already proposed for persistent-world memory (prior research
   doc, Candidate Amendment #2) to have an early-session choice resurface
   as a complication several turns later, not just across chronicles.
3. **Fixed-length session pacing (~3 turns)** — final turn is reflective,
   not another action beat; optional continue prompt after.
4. **Session-end recap** — one lightweight LLM call at logout summarizing
   "what changed while you were away," for continuity without save-state
   UI work.
5. **Sustained-play narrative unlocks** — gate new NPC scenes/dialogue on
   session count (3+), not daily-login streaks, to avoid rewarding spam
   logins.

**Tension with current plan:** none — these are additive UX ideas that sit
on top of the existing turn-resolution/WebSocket/NPC-table infrastructure,
same "no new service" constraint the prior research doc's candidate
amendments already followed.

---

## Candidate plan amendments (summary, for a future review pass)

1. Revisit Phaser/PixiJS (Decision #19-21, V1 Launch Scope) against a
   DOM+CSS-first approach given the game's actual shape — not an automatic
   switch, a deliberate re-check.
2. Keep Decision #7's Steam-readiness-as-constraint-only stance, but treat
   itch.io/browser-only as a real first release target, not just a
   stepping stone to Steam — sequence any actual webview wrap later than
   currently implied, and prefer Electron over Tauri if/when that wrap
   happens (WebGPU support gap in Tauri's WebView2 path).
3. Open a new Foundational Decision for monetization model (currently
   undecided): freemium + capped free turns + one-time unlock, informed by
   a follow-up OpenRouter model-cost pass for the `resolve`/`narrate` nodes
   specifically.
4. Add cliffhanger/recap/session-pacing hooks to the narration design —
   fits inside existing turn-resolution and NPC-table infrastructure, no
   new service.
