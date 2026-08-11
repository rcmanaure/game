---
status: DRAFT
---
# Research: Text-Game Tooling, Animation, Alternative Formats, Accessibility

**Scope:** four angles not covered by two prior research passes
(`2026-08-03-game-design-inspiration.md` — AI-DM competitors, persistent
memory, bestiary; `2026-08-04-platform-and-business-research.md` — stack
validation, distribution, monetization, retention). Pass answers user's
direct question: browser text+card+animation (current plan) right format,
or narrative-engine tooling / alt formats beat it? Also deep-dive animation
technique (follow-up prior pass's DOM+CSS finding) and accessibility
(unblock TODOS.md's T11 gate).

Run via 4 parallel haiku subagents, 2026-08-04. Findings below candidates
for future `/plan-ceo-review` pass, not decisions — file doesn't edit
`docs/designs/ai-dm-platform.md`.

---

## 1. Narrative-scripting engines (Ink, Twine, Yarn Spinner) vs custom build

**Finding: none of existing narrative-engine tools fit LLM-improvised game —
plan's hand-rolled DOM+CSS frontend stays right call, not gap to fill.**

- **Ink (inkjs)** — ships zero-dependency JS runtime, works in-browser,
  but architected as middleware for *pre-authored* branching narrative
  (compiled story graph), not runtime-generated content. No official
  LLM integration; third-party fork (InkOS) adds LLM support only for
  *assisted authoring*, not runtime narration.
  Source: [inkjs GitHub](https://github.com/inkle/inkjs) ·
  [Ink official docs](https://www.inklestudios.com/ink/)
- **Twine (Harlowe/SugarCube)** — strong CSS/animation support, zero
  deployment friction (compiles to self-contained HTML), but passage-based
  editor for hand-authored branches. No official LLM integration exists.
  Source: [SugarCube docs](https://www.motoslave.net/sugarcube/2/) ·
  [Twine CSS cookbook](https://twinery.org/cookbook/twine1/editor/css.html)
- **Yarn Spinner** — targets game engines (Unity production-ready; Godot/
  Unreal/Bevy experimental), not browsers; no documented in-browser runtime.
  Own blog states explicitly doesn't use generative AI.
  Source: [Yarn Spinner FAQ](https://docs.yarnspinner.dev/faq) ·
  [Yarn Spinner — "Why We Don't Use AI"](https://yarnspinner.dev/blog/why-we-dont-use-ai/)
- **Recent hybrid LLM+narrative research** (DiaryPlay, CHI 2026;
  NarrativeGenie, AIIDE 2024; STORY2GAME, arXiv 2505.03547) all build
  **custom infrastructure** for LLM orchestration rather than integrate
  with Ink/Twine/Yarn — these engines lock narrative structure at
  authoring time, fundamentally incompatible with runtime LLM generation.

**Verdict:** no engine here "LLM content display layer." Adopting one
adds architectural friction (state impedance mismatch) no value —
plan's decision to hand-roll frontend in DOM+CSS, fed by LLM-generated
narration, confirmed right call, not under-researched gap.

---

## 2. Animation technique deep-dive (DOM+CSS, follow-up prior pass's finding)

**Finding: CSS `@keyframes`+`steps()` remains 2026 standard for
sprite-sheet frame animation in text+card UI — confirmed correct
direction, concrete technique guidance follows.**

- **Motion.dev not sprite-sheet tooling.** Its `frame` function generic
  scheduling utility, better suited to card enter/exit micro-interactions
  than idle/attack sprite loops. Use CSS `steps()` for sprite frames;
  reserve Motion.dev (or View Transitions API, Chrome/Edge/Safari 18+
  only — Firefox not yet production-safe) for card-state transitions.
- **Real shipped precedent:** [Slay the Web](https://github.com/oskarrough/slaytheweb)
  (open-source, production DOM-based deck-builder, UI-agnostic engine with
  documented animation-architecture plan) and multiple HTML5
  Slay-the-Spire-likes on itch.io validate DOM+CSS at production scale for
  exact genre shape (text/card, no physics).
- **Performance rules (MDN-sourced):** animate only `transform`/`opacity`
  (never `top`/`left`/`width`/`margin` — triggers reflow); apply
  `contain: content` to animated containers; never use `will-change`
  preemptively (only after profiling shows real bottleneck); respect
  `prefers-reduced-motion`. Ceiling: ~50 concurrent animated elements
  before needing viewport culling — well above game's needs.
- **Frame-rate guidance:** 12fps for pixel-art-style sprites, 24fps
  default, 60fps for smooth card flips.

**Concrete recommendations:** CSS `steps()` for sprite idle/attack loops;
Motion.dev or View Transitions API for card reveal/enter-exit (pick one
per component, don't mix mechanisms); `transform`+`opacity` only,
`contain: content` on animated containers, profile before `will-change`.

---

## 3. Alternative formats to browser text+card+animation

**Finding: no alt format has documented evidence of beating current
plan — strongest data point (mobile interactive fiction) proof-of-concept
only, since plan already browser-delivered, not switch candidate.**

- **Chat-interface games (Discord/Telegram bots)** — real active examples
  exist (Discoggin, JDR-Bot), Discord's own numbers large (200M
  MAU, 93% play games). But Discord format plain-text-only — "no
  graphics" per direct analysis — hard rejection of this game's
  illustrated-card-UI direction. No published retention comparison vs.
  dedicated game UIs either way.
  Source: [Zarfhome — Discoggin analysis](https://blog.zarfhome.com/2025/07/discord-if-bot)
- **Voice-first/voice-augmented IF** — zero shipped examples found, zero
  retention/engagement data. Purely theoretical marketing claims
  (ElevenLabs blog) no comparative studies. Confirms project's
  existing TODOS.md deferral of TTS not leaving evidence on table.
- **Mobile-native text-adventure apps** (Choice of Games, Episode,
  Choices: Stories You Play) — strongest data point found anywhere in
  pass: Choices hit 32.7M downloads / $175.4M lifetime
  revenue, proving text-driven narrative games work at scale. But
  **cross-cultural retention study found heavier narrative consumption
  correlates with *lower* retention**, not higher — players who read less
  retain better and spend more. Actually favors current plan: card
  UI + light animation creates natural pacing/consumption breaks pure-text
  mobile apps lack.
  Source: [ScienceDirect — cross-cultural narrative retention study](https://www.sciencedirect.com/science/article/pii/S1875952125000746) ·
  [Udonis — Choices monetization](https://www.blog.udonis.co/mobile-marketing/mobile-games/choices-stories-you-play-monetization)
- **Terminal/xterm.js-style minimal UI** — technically mature (xterm.js
  powers VS Code), zero published player-adoption or retention data
  for any terminal-styled adventure game found. Unproven, not
  disqualifying, just no evidence either way.
- **Broader AI-DM platform landscape** (Fables.gg, AI Realm, RoleForge,
  Voyage, StoryRoll) — real user counts exist (AI Realm 200K+ campaigns,
  Fables.gg 100K+ users) but **none publish retention metrics** —
  whole AI-narrative-game space currently competes on presence, not
  measured engagement.

**Verdict:** stay course. Browser text+card+animation has only
real evidenced parallel (mobile IF apps' revenue at scale, narrative-
consumption/retention finding actively favoring this plan's card+animation
pacing over pure-text). No alt format clears bar of "proven better,"
several (Discord, voice) disqualified outright by project's own stated
visual/no-TTS direction.

---

## 4. Accessibility — concrete input for TODOS.md's blocking T11

**Finding: this game's text-heavy shape genuine, evidenced
accessibility advantage if built on semantic HTML from start — direct,
actionable patterns exist for every open question T11 lists.**

- **Streaming narration:** use `role="status"` (implicitly
  `aria-live="polite" aria-atomic="true"`) on narration container so
  screen readers announce complete update at natural pauses, not
  every partial chunk as it streams. Reserve `aria-live="assertive"`
  narrowly, for combat-outcome-class events only.
  Source: [MDN — status role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/status_role)
- **Bestiary/dossier card-grid keyboard nav:** W3C APG's **Grid Pattern**
  fits directly — Tab/Shift+Tab enter/exit grid as one stop, arrow
  keys move between cards, Home/End jump row edges, roving `tabindex`
  (one card `0`, rest `-1`, reassigned on move).
  Source: [W3C APG — Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)
- **Muted retro palette vs. WCAG AA contrast:** saturation doesn't affect
  4.5:1 (normal text) / 3:1 (large text) requirement — contrast comes
  from relative luminance, not hue. Desaturated parchment+charcoal pair
  (e.g. `#e8e4d0` / `#2a2a2a` ≈ 14:1) clears AA easily; no conflict
  between locked art-direction palette (Decision #16-17) and
  accessibility, just needs per-pair verification.
  Source: [WCAG 2.2 — Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- **Precedent:** Twine games screen-reader-compatible essentially for
  free because compile to semantic HTML — direct confirmation of
  project's own TODOS.md observation that text-heavy "unusually
  easy screen-reader win if built on semantic HTML from start."

**T11-ready checklist (directly usable input for blocking design
task):**
1. Narration container: `role="status"` / `aria-live="polite"
   aria-atomic="true"`, no focus-stealing; `assertive` only for
   combat-critical events.
2. Card grids (bestiary/dossier): W3C APG grid pattern + roving
   `tabindex`, arrow-key nav, Home/End row jumps.
3. Every locked palette pair (Decision #16-17) verified at 4.5:1/3:1 via
   WebAIM contrast checker, values logged in design doc.
4. Semantic HTML throughout: `<main>`, `<article>`, native `<button>`
   (never div click handler), real heading hierarchy.
5. Screen-reader pass (NVDA/JAWS/VoiceOver) before ship: narration
   announced once per update, card position announced on focus.
6. Mobile/responsive: card grid reflows to single column, 48px minimum
   touch targets, text respects OS font-size preference.
7. Error/loading/empty states (already required by T11) all routed through
   same live-region pattern as narration, not separate silent state.
8. `prefers-reduced-motion` respected by every animation from Section 2
   above (sprite loops, card transitions) — ties animation and
   accessibility findings together at implementation time.

---

## Candidate plan amendments (summary, for future review pass)

Scoped tightly to what pass actually found — not general punch
list. Each fits inside existing decisions, no new service/architecture
change:

1. **No action needed on narrative-engine tooling** — Ink/Twine/Yarn
   Spinner all evaluated, confirmed not fit; plan's existing
   custom DOM+CSS frontend decision stands, closes question
   rather than opening new one.
2. **Adopt animation technique guidance in Section 2 as concrete
   implementation detail** for T11/T13 — CSS `steps()` for sprites,
   Motion.dev/View Transitions for card states, specific performance
   rules (transform/opacity only, `contain: content`, no premature
   `will-change`).
3. **No format change** — browser text+card+animation stays; mobile-IF
   retention finding (less narrative consumption correlates with higher
   retention) worth folding into narration-pacing design work
   already flagged in prior research pass's retention section (mid-
   session cliffhangers, fixed-length ~3-turn pacing) as supporting
   evidence, not new mechanic.
4. **Feed 8-item accessibility checklist (Section 4) directly into
   T11** — already blocking task in TODOS.md; this research
   answers its open questions rather than raising new ones.