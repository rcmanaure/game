# TODOS

## Deferred from CEO review (2026-08-03, IP-agnostic rewrite after the
## VTM->original-IP pivot — see ~/.gstack/projects/game/ceo-plans/2026-08-03-ai-dm-platform.md)

- **Bloodline-power-flavored job outcomes** — a coterie member's bloodline
  power unlocks unique resolution paths per job (e.g. a stealth-type power
  = auto-success, skips a story beat) instead of generic pass/fail on the
  job resolver. Deferred to keep the cherry-pick vote to 4 options, not
  rejected on merit. Revisit after the core loop ships and the plain
  Attribute+Skill job resolver is playtested.
- **Community almanac** — git-based public repo of exported chronicles.
  Deferred indefinitely: different risk profile (ongoing moderation of
  user-submitted horror content vs one-time build cost). Revisit only if
  there's an actual community asking for it.
- **TTS voice narration for the AI DM** — revisit once the core
  text+art+animation loop is playtested and the narration output's
  separate "narrated text" field is proven sufficient groundwork for
  bolting on TTS without rework.

## Deferred from platform/business amendments review (2026-08-04, see
## ~/.gstack/projects/game/ceo-plans/2026-08-04-platform-business-amendments.md)

- **Post-v1 retention hooks: cross-session consequence recall + session-
  count-gated narrative unlocks** — an early-session choice resurfaces as
  a complication in a later session (not just later chronicles), and new
  NPC scenes/dialogue unlock at session-count milestones (3+) rather than
  daily-login streaks. Both depend on the persistent NPC/consequence
  table, which is Post-v1 scope (Scope Decision #4) — build alongside
  that phase, not before it. Revisit when persistent-world-memory work
  starts.
- **Subscription tier (~$5/mo)** — deferred pending real conversion data
  from the freemium + one-time-unlock model (Foundational Decision #22).
  Revisit post-launch once free-to-unlock conversion is measured.
- ~~**Engine-choice + distribution-sequencing prototype (T18)**~~ —
  **RESOLVED 2026-08-04**, no longer deferred: decided directly rather than
  via prototype. Phaser/PixiJS stays (Decision #2/#19-21 unchanged); Scope
  Decision #7 got explicit itch.io-first/Electron-over-Tauri sequencing
  guidance. See `docs/designs/ai-dm-platform.md` "Amended 2026-08-04 (6)".

## Deferred from CEO review (2026-08-04, text-format-tooling research pass —
## see `docs/research/2026-08-04-text-format-tooling-research.md`)

- **Progressive bestiary entries (Monster Hunter-style familiarity tiers)**
  — gate how much of a cached archetype's art/lore card is revealed on a
  per-user "familiarity" counter (silhouette -> full card -> card+tactical
  note) instead of full reveal on first encounter. Zero new art-gen calls,
  reveals more of the same cached asset (Decision #6's archetype cache).
  Deferred to keep the cherry-pick pass scoped, not rejected on merit — ship
  the plain bestiary/codex unlock (Scope Decision #3) first, revisit once
  the core loop is playtested and you know if flat reveal already feels
  satisfying.

## Launch gate, not deferred work (tracked so it doesn't get missed)

- **Pre-launch content-abuse moderation system** — Foundational Decision #13
  already makes this an explicit gate: keyword + model-based filter on
  player free-text input, with a review process, required before ANY
  public/Steam launch (not v1 work — v1 only does DM input/output logging).
  Flagged by the outside-voice pass on the 2026-08-04 CEO review because it
  had no tracking entry anywhere outside the plan doc's own text. Revisit
  when a public/Steam launch is actually being scheduled, not before.

## Deferred from CEO review (2026-08-03, 11-section deep review)

- **UX inputs for /plan-design-review (P1, blocking pre-build)** — define
  interaction states (loading/empty/error/success/partial), baseline
  accessibility (keyboard nav, screen reader, contrast — this is a
  text-heavy game, an unusually easy screen-reader win if built on
  semantic HTML from the start), and responsive/mobile layout for the
  login, core game loop, bestiary/codex, and dossier-export screens
  *before* implementation UI work starts. Carried forward from the
  superseded VTM-era plan, which had this requirement but it did not
  survive the pivot to the full platform (NestJS + Phaser + profiles) —
  there is now more UI surface than before (auth, bestiary, dossier), not
  less, so this matters more, not less. **Concrete accessibility input now
  available** (2026-08-04): an 8-item checklist (ARIA live regions for
  streamed narration, W3C APG grid pattern for card-grid keyboard nav, WCAG
  AA contrast verification for the muted retro palette, semantic HTML,
  screen-reader pass, responsive/touch targets, error-state live regions,
  `prefers-reduced-motion`) — see
  `docs/research/2026-08-04-text-format-tooling-research.md` Section 4. Feed
  directly into T11 when `/plan-design-review` runs.
