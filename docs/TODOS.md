# TODOS

## Completed (2026-08-06, eng review + T14a/b/d build)

- ✅ **T14a**: Postgres entities (User/Chronicle/Turn/Npc), migrations, turn status enum, PostgresSaver installed
- ✅ **T14b**: TurnReservationService (atomic INSERT/UPDATE), GraphService (invoke+persist+async-art), startup sweep, CORS env fix, WS integration, narrateWithFallback error handling
- ✅ **T14d**: turnNumber field, recall node NPC query setup, state schema DRY (removed HarnessStateSchema duplicate)
- ✅ **T14c pre-step**: knot-count scoping — 7 narration branches needed, under +1-2d estimate
- ✅ **T-art-tests**: full coverage (placeholder, network error, non-200, malformed, valid responses, b64, reference URLs) — 52 tests passing
- ✅ **eng-review fixes**: atomic reservation race, crash reconciliation sweep, async art-trigger, CORS env scoping, LLM error resilience

## Deferred from CEO review (2026-08-06, HOLD SCOPE — 11-section deep review
## of the T14/T19/Ink build-readiness, see `docs/designs/ai-dm-platform.md`
## and the GSTACK REVIEW REPORT; outside-voice pass via Claude subagent,
## Codex CLI not installed this session)

- **Re-evaluate T15's cost-model pass under quality>velocity principle** —
  T15 currently optimizes DM model selection purely for OpenRouter cost
  (~100x variance across models per prior research). Ink (Decision #26)
  and T19 (recall) both got a quality override this week; model
  SELECTION (the actual narration substance, not just Ink's structure)
  didn't. Outside-voice review flagged this as the larger untouched
  quality lever. Depends on T14's narration pipeline actually running —
  need real narration-quality signal to compare against cost, so this
  can't be scoped properly until after T14 ships. Effort: M (human
  ~1-2d / CC ~2-3h). Priority: P2, should land before Decision #22's
  monetization free-turn-cap numbers are finalized.
- **Verify itch.io embed origin matches FRONTEND_URL CORS config before
  first deploy** — the WS gateway's CORS check (fixed 2026-08-06 to
  read a `FRONTEND_URL` env var instead of a wildcard) assumes a single
  origin string. Itch.io serves embedded HTML5 games from a proxy
  subdomain, not the developer's own domain — if the CORS origin
  doesn't match itch.io's actual embed pattern, the WS handshake fails
  for every itch.io player, silently, in production. Scope Decision #7
  already commits to itch.io-first distribution, so this is a known
  future blocker, not hypothetical scope. Effort: S (human ~1-2h / CC
  ~20min) once itch.io's real embed URL pattern is confirmed (needs a
  test upload or itch.io docs check). Priority: P2 — blocks nothing
  now, but is a launch blocker for the itch.io-first plan. Depends on
  T9 (deployment) / an actual itch.io test upload.
- **Checkpoint before building T27 (portrait-edit drift mitigation) —
  validate core loop first** — consider a deliberate pause point after
  T14 ships (DM narration + recall working end-to-end) to validate the
  core loop feels right before building T26/T27 (predefined-character
  coterie assembly + portrait evolution), both already flagged by prior
  research (`docs/research/2026-08-05-character-portraits-and-story-
  reuse-research.md`) as structurally novel/unproven — no comparable
  shipped product keeps free-form portraits consistent across
  generations. HOLD SCOPE mode this session correctly did not reverse
  any locked scope decision (#23/#24/#26 + T19 stay v1) — this is a
  sequencing question between already-accepted phases, not a scope
  question. Effort: S (a go/no-go review, not new code). Priority: P2,
  worth raising at the next CEO review once T14 ships, not a blocker
  now.


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

## Deferred from CEO review (2026-08-05, character-portraits-and-story-reuse
## research pass — see `docs/research/2026-08-05-character-portraits-and-
## story-reuse-research.md` and `docs/designs/ai-dm-platform.md` "Amended
## 2026-08-05 (7)")

- **Story reuse across users (flag a chronicle as a reusable starting
  seed for other players)** — deferred, not built this pass, despite
  having a real design (below). An outside-voice pass on this review
  caught that it's close enough to the already-deferred **Community
  almanac** item (deferred indefinitely, "revisit only if there's an
  actual community asking for it") that it should be held to the same
  "no demand signal yet" bar, even though the actual mechanism differs:
  this would be an **internal** Postgres table read into a new
  chronicle's prompt context (same shape as the `recall` node/T19), not
  the almanac's public git-based export. **What:** a new table snapshots
  a flagged chronicle's reusable narrative state; at new-chronicle-start,
  a `seed-select` node auto-picks one eligible snapshot (no player-facing
  browse UI — same automatic, invisible pattern as T19's "returning
  face" NPC callback) and folds it into the `narrate` node's opening
  beat. **Why:** replayability lever adjacent to Scope Decision #4's
  persistent-memory work; the mechanism was fully designed this session,
  just not scheduled. **Design record so it isn't lost:**
  - Snapshot table stores **structured/fictional fields only** — NPC
    name, NPC fact, bloodline, key outcome tag, archetype ref — **never**
    raw narration text or raw player free-text (both can echo a
    player's real-world PII into a *different* user's session; this was
    a Section 3 finding this review caught).
  - The "flag as reusable" write action needs the same per-user
    JWT-scoped IDOR guard as every other save/chronicle endpoint (T7's
    pattern) — verify the flagging user actually owns the chronicle
    being flagged. The outside-voice pass caught this was unspecified.
  - Needs a flag/unflag toggle (retraction path) — flagging isn't
    permanent.
  - Structured "NPC fact" fields are still LLM-derived from the
    original player's free-text input and would get auto-served into a
    stranger's session with **zero moderation** — a genuinely new
    user-to-user content-propagation surface that Foundational Decision
    #13's content-abuse gate (currently scoped as origin-user-only
    logging, pre-launch keyword/model filter) never anticipated. Whoever
    picks this up needs to decide whether that's an accepted risk at
    hobby scale or needs its own lightweight filter before shipping.
  - If it ever gets a UI surface for the *flagging* side specifically
    (not the consumption side, which stays UI-less per the seed-select
    design above), hang it off the existing Chronicle Ledger screen
    (Scope Decision #4/T20) rather than building a dedicated screen —
    T20 would need its "read-only, no new writes/schema" verify
    criteria amended to note the one write action.
  - **Effort estimate:** M (human ~2-3d / CC ~4-5h) — new table +
    migration, seed-select graph node (same shape as T19), flag/unflag
    endpoint with IDOR guard, T20 scope amendment.
  - **Priority:** P3 — revisit once Scope Decision #4's persistent-
    memory phase (T19/T20) is actually underway, same timing rationale
    as the rest of that phase, not before.
  - **Depends on:** T19/T20 (shares the same phase and design pattern —
    build alongside, not ahead of, that work).

- **Higgsfield Soul ID as a portrait-drift fallback** — not adopted now
  (Decision #24 ships periodic re-anchor-to-original-reference as the
  drift mitigation instead), but named here as a concrete fallback if
  T22's harness shows re-anchoring isn't enough: Soul ID trains a
  reusable identity once per character (20+ reference photos, ~3-5min
  training) instead of re-submitting a reference image per call — a
  materially different, costlier ($0.09-$0.23/image range, reseller-
  quoted, not first-party-confirmed), platform-locked mechanism. Revisit
  only if T22's drift validation shows the cheaper re-anchor approach
  genuinely doesn't hold up — does not reopen Decision #15's existing
  Higgsfield deferral for anything else.

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
