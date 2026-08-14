# node:test is the test runner, not jest

The backend's original three spec files used jest and `@nestjs/testing`, but neither was ever installed and no script ran them — the backend half of the codebase had no executable tests. Every test now runs on `node:test` (already used by the harness half), with NestJS providers built via a plain `new` rather than `Test.createTestingModule`: every provider so far has a plain constructor, so the DI container buys nothing a direct construction doesn't.

## Consequences

A provider that later genuinely needs Nest's DI resolution (multiple candidates for one interface, request-scoped providers) will need a different testing approach for that specific case — this commits to `node:test` as the default, not a ban on ever reaching for Nest's testing utilities.
