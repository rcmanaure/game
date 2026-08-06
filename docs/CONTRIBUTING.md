# Contributing Guide

Development workflow, code conventions, commit standards, and PR process.

## Principles

- **Quality > Velocity**: When trade-offs arise, ship right not fast. Extended timelines acceptable.
- **Laziness (Ponytail)**: No speculative abstractions, stdlib first, one-liner when possible.
- **Terse (Caveman)**: Code comments only when the *why* is non-obvious. No defensive prose.

## Commit Conventions

Use conventional commit format: `<type>: <subject>`

### Types

| Type | Meaning | Example |
|------|---------|---------|
| `feat` | New feature | `feat: T14c knot-count scoping` |
| `fix` | Bug fix | `fix: auth middleware token expiry check` |
| `docs` | Documentation | `docs: add API endpoints to BACKEND.md` |
| `test` | Tests (no code change) | `test: add edge-case coverage for rules validator` |
| `refactor` | Code restructure (no feature change) | `refactor: extract turn-reservation logic into service` |
| `chore` | Tooling, deps, build config | `chore: update TypeORM to 0.3.31` |

### Subject Line

- Imperative mood: "add" not "added" or "adds"
- Lowercase, no period
- Max 50 characters
- Specific task reference if applicable: `feat: T14a postgres entities`

### Example Commits

Good:
```
feat: T14a postgres entities, migrations, turn status enum
fix: jwt-auth guard CORS check for itch.io embed subdomain
docs: add BACKEND.md with turn event flow
test: full coverage for art generation error cases
```

Bad:
```
Updated things
fix some auth stuff
Added documentation
T14
```

### Author Footer

**Do not add Co-Authored-By footers.** User commits are authored by the user; Claude commits are not made (user only pushes).

If pair programming with another human:
```
Co-Authored-By: <Name> <email@example.com>
```

## Code Conventions

### TypeScript

- **Strict mode:** On. No `any` except in rare escape hatches (mark with `// @ts-ignore` + comment why).
- **Naming:** camelCase for vars/functions, PascalCase for classes/types.
- **No barrel exports:** `export *` from index files — import from specific files.
- **Zod schemas:** All user input validated at system boundaries.

Example:
```typescript
// Bad: type-only comment
const count = getData(); // Returns number

// Good: type annotation
const count: number = getData();
```

### Entity Definitions (TypeORM)

```typescript
// src/backend/entities/user.entity.ts
@Entity("user_entity")
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar", { unique: true })
  email: string;

  @Column("timestamp", { default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
```

- Table name matches filename
- `@PrimaryGeneratedColumn("uuid")` for ID
- No soft deletes (simplify by hard-delete)
- Date columns: use `timestamp with time zone` (not string)

### Harness State (Zod)

```typescript
// src/harness/state.ts
export const CharacterSchema = z.object({
  name: z.string(),
  hp: z.number().int().min(0),
  status: z.enum(["alive", "wounded", "dead"]),
  // ...
});

export type Character = z.infer<typeof CharacterSchema>;
```

- Define schema, then infer type
- Export both schema and type
- Use discriminated unions for variants

### No Comments Rule

Skip comments unless the **why** is non-obvious:

```typescript
// Bad: restates the code
const users = await userRepo.find(); // Find all users

// Good: explains a non-obvious choice
// Skip deleted users silently; they may re-activate later
const users = await userRepo.find({ where: { deletedAt: IsNull() } });

// Good: documents a workaround
// BUG: typeorm#9999 — soft-delete filter doesn't cascade to joins
// Manually filter joined NPCs instead
const npc = npcs.filter(n => n.deletedAt === null);
```

- No docstrings (JSDoc) unless the function signature alone doesn't explain the contract
- No inline explanations of what the code does
- Only document surprising constraints, hidden assumptions, or workarounds

### Error Handling

- **Input validation:** Explicit at trust boundaries (controllers, WebSocket handlers)
- **Exceptions:** Throw only if the error is not recoverable
- **Logging:** Errors logged, not silenced (but not repeated)

Example:
```typescript
// Backend service — validate input
if (!payload.turnId) {
  throw new WsException("Missing turnId");
}

// Harness game logic — trust input (already validated upstream)
return character.hp - damage; // Don't re-validate hp type
```

### Testing

**Required for non-trivial logic:**
- Branches: at least one test per branch
- Edge cases: zero, max, null, empty string
- Error paths: explicit test for failure mode

**One test per file minimum** — even harness modules should have a smoke test.

**No fixtures, no test frameworks beyond Node's `--test`.** Inline test data, keep tests self-contained.

Example:
```typescript
// src/harness/__tests__/rules.test.ts
import { test, strict as assert } from "node:test";
import { rollD20, modifierFor } from "../rules";

test("rollD20() returns 1-20 inclusive", async (t) => {
  for (let i = 0; i < 100; i++) {
    const roll = rollD20();
    assert.ok(roll >= 1 && roll <= 20, `Roll out of range: ${roll}`);
  }
});

test("modifierFor() clamps to [-10, 10]", (t) => {
  assert.equal(modifierFor(30), 10);
  assert.equal(modifierFor(-30), -10);
  assert.equal(modifierFor(10), 5); // (10-10)/2
});
```

## PR Workflow

### Before Starting

1. Check `TODOS.md` for active scope and P2 blockers
2. Check `docs/designs/ai-dm-platform.md` for architectural decisions
3. Branch name: `feat/T14a-postgres-entities` or `fix/auth-cors`

### During Development

1. Write code, commit frequently with meaningful messages
2. Run tests: `npm run test`
3. Manual testing: `npm run harness "action"`
4. No code review hooks (`--no-verify`) — if a hook fails, fix the underlying issue

### Before PR

1. Rebase on `master`: `git rebase -i origin/master`
2. Verify all commits have good messages
3. Run full test suite one more time
4. Check for any credentials in diffs: `git diff origin/master`

### Creating PR (Planned for Later)

When moving to team workflow (post-v1), use `gh pr create`:

```bash
gh pr create --title "feat: T14a postgres entities" --body "$(cat <<'EOF'
## Summary
- Added User/Chronicle/Turn/Npc entities
- Generated TypeORM migrations

## Test Plan
- [x] Migrations run without error
- [x] Schema matches entity definitions
- [x] Backend health check connects to DB
EOF
)"
```

## Code Review Checklist

**For self-review before committing:**

- [ ] Does the code solve the stated problem?
- [ ] Are there simpler alternatives (stdlib, existing patterns)?
- [ ] Are inputs validated at system boundaries?
- [ ] Are error cases handled (or explicitly ignored with a comment)?
- [ ] Do new functions have at least one test?
- [ ] Are commit messages clear and follow conventions?
- [ ] Does the code follow the DESIGN.md constraints (if UI)?
- [ ] Are there any security concerns (input injection, auth bypass)?

**For team review (post-v1):**
- Correctness: Does it work and handle edge cases?
- Clarity: Can a peer understand the change?
- Fit: Does it align with the plan and conventions?
- Risk: Could it break something else?

## Common Patterns

### New Entity

```typescript
// 1. Define entity
@Entity("my_entity_name")
export class MyEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar")
  name: string;

  @Column("timestamp", { default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}

// 2. Import in data-source.ts
import { MyEntity } from "./entities/my.entity";
// Add to entities: [..., MyEntity]

// 3. Generate migration
npm run migration:generate

// 4. Run migrations
npm run migration:run
```

### New Service

```typescript
// 1. Define service
@Injectable()
export class MyService {
  constructor(
    @InjectRepository(MyEntity)
    private myRepo: Repository<MyEntity>
  ) {}

  async findAll(): Promise<MyEntity[]> {
    return this.myRepo.find();
  }
}

// 2. Add to app.module.ts
providers: [..., MyService]

// 3. Inject where needed
constructor(private myService: MyService) {}
```

### New Harness Node

```typescript
// 1. Define input/output types
export interface MyNodeInput {
  value: string;
}

export interface MyNodeOutput {
  result: string;
}

// 2. Define node function
async function myNode(state: State): Promise<Partial<State>> {
  const { playerAction } = state;
  return {
    nodeResult: { result: "..." }
  };
}

// 3. Add to graph
.addNode("my-node", myNode)
.addEdge("previous-node", "my-node")
.addEdge("my-node", "next-node")
```

## Architecture Decisions

Before proposing large changes, check:
1. `CLAUDE.md` — project-level decisions (quality > velocity, Ink + inkjs, etc.)
2. `docs/designs/ai-dm-platform.md` — CEO plan decisions (11 sections)
3. `TODOS.md` — P1/P2 blockers, deferred scope

If your change affects any of these, raise an issue or post to CLAUDE.md memo before coding.

## Debugging Tips

### Harness (CLI)

```bash
npm run harness "action" 2>&1 | grep -i error
# Check for validation errors, LLM refusals, art failures
```

### Backend Logs

```bash
npm run backend:dev 2>&1 | grep -E "error|warn|socket"
# Monitor for auth failures, DB issues, WS connection drops
```

### Database

```bash
psql postgresql://game_user:game_password@localhost:5432/game_db

# List tables
\dt

# Query turns
SELECT turn_id, status, created_at FROM turns ORDER BY created_at DESC LIMIT 5;
```

### GraphQL Inspector (Post-v1)

When adding LangGraph debugging:
```typescript
// Inspect state after each node
.addEdge(..., ..., (state) => {
  console.log("State:", JSON.stringify(state, null, 2));
  return state;
});
```

## Questions?

- **Architecture:** See `ARCHITECTURE.md` or `docs/designs/ai-dm-platform.md`
- **API:** See `BACKEND.md` for endpoints and event schema
- **Setup:** See `SETUP.md` for dev environment
- **Decisions:** Check `TODOS.md` for what's P1/P2 vs. deferred

---

Updated 2026-08-06. Based on ponytail (lazy, minimal) and caveman (terse, clear) principles.
