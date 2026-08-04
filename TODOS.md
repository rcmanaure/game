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
  less, so this matters more, not less.
