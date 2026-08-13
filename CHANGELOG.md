# Changelog

All notable changes to this project are documented here.
Format: `## [MAJOR.MINOR.PATCH.MICRO] - YYYY-MM-DD`

## [0.1.0.0] - 2026-08-12

First tracked version. Everything below landed before versioning existed, so
this entry covers the whole branch rather than one release's worth of change.

### Added

- **Play a turn over a live connection.** A WebSocket gateway accepts a turn,
  runs it through the resolve → validate → narrate → art pipeline, and pushes
  the result back. Art no longer blocks the turn: a placeholder returns
  immediately and the real image arrives later on its own event.
- **Log in and stay logged in.** JWT access and refresh tokens, a WebSocket
  handshake that rejects unauthenticated connections, and route guards.
- **Turns survive a retry.** Submitting the same turn twice does the work once.
  A turn interrupted by a crash is swept back to a retryable state on the next
  startup instead of being stuck forever.
- **The story remembers characters.** From the second turn of a chronicle, a
  previously met NPC is recalled and threaded into the narration, scoped so one
  chronicle never leaks into another.
- **Actions have visible consequences.** Critical successes, Craving-driven
  outcomes and damage taken or dealt now come back as text the player reads,
  not just numbers in a state object.
- **Permadeath.** A character at zero HP drops to torpor, and again to Final
  Death. Mutations against a dead character are rejected.
- **Turns persist.** Postgres storage for users, chronicles, turns and NPCs,
  with migrations, plus LangGraph checkpointing keyed to the turn id.
- Continuous integration on every push and pull request: harness typecheck,
  backend typecheck, and the harness test suite.
- `docs/game-auditor.md`, a viability-audit instrument, with its entry-contract
  facts split across a public `docs/PROJECT_FACTS.md` and a local, untracked
  facts file.

### Changed

- Narration falls back instead of failing. If the primary model refuses, errors
  or times out, an alternate runs; if that also fails, a deterministic template
  is used. A turn always produces narration.
- The dice engine is authoritative. The model decides only what to check; the
  modifier, the roll, the target number and the outcome are computed
  server-side and clamped to legal ranges.
- `.env` loading now uses `dotenv` instead of a hand-rolled parser.

### Fixed

- **The backend could not complete a single turn against a real database.**
  Four raw SQL statements named snake_case columns that the migration had
  created as quoted camelCase, so reserving a turn threw — as did both of the
  error paths meant to mark a turn failed.
- **The app could not start.** `@InjectRepository` was used without the
  matching TypeORM feature registration, so dependency injection failed during
  bootstrap.
- **Checkpointing had no tables.** The Postgres checkpointer was constructed
  but never initialised, so every turn threw once a database URL was set.
- Two turns sent at once no longer receive the same turn number; it is now
  counted after the turn is reserved rather than before.
- HTTP responses no longer allow every origin. Cross-origin access is scoped to
  the same frontend the WebSocket gateway already allowed.
- Unexpected server errors return a generic message instead of the raw
  exception text, which could expose database and filesystem detail.
- NPC recall passed the wrong parameter and was missing chronicle scoping, so
  it never ran.

### Removed

- A duplicate harness state schema that had drifted out of sync with the real
  one and was missing two fields.
