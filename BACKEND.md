# Backend API & Architecture

WebSocket turn flow, REST endpoints, and data model for the AI DM backend.

## Overview

- **Runtime:** NestJS on Node.js
- **Database:** PostgreSQL (TypeORM ORM)
- **LLM Orchestration:** LangGraph.js state machine
- **Auth:** JWT (access token 15min, refresh token 7d)
- **Real-time:** Socket.io WebSocket gateway (WS on port 3000)

## Authentication

### Endpoints

All non-public endpoints require `Authorization: Bearer <JWT_ACCESS_TOKEN>` header.

#### `POST /auth/login` (planned T8)
Not yet implemented. For now, JWT tokens hardcoded in tests.

#### Health Check (Public)

```http
GET /health
```

Response (200):
```json
{
  "status": "ok",
  "database": "connected"
}
```

Response (503):
```json
{
  "status": "error",
  "database": "unreachable",
  "message": "connect ECONNREFUSED"
}
```

## WebSocket Flow: Turn Resolution

### Connection & Auth

1. **Client connects** to `ws://localhost:3000` with query/auth header:
   ```javascript
   const socket = io("http://localhost:3000", {
     auth: { token: "JWT_TOKEN_HERE" },
     // OR in headers: { Authorization: "Bearer JWT_TOKEN" }
   });
   ```

2. **Server validates JWT**, stores user context in `socket.data.user`:
   ```typescript
   { sub: "user-id", email: "user@example.com", iat: 1234567890 }
   ```

3. **Connection established** or rejected with 401.

### Turn Event Flow

#### Client Emits: `turn`

```javascript
socket.emit("turn", {
  turnId: "uuid-here",                    // Client-generated, must be unique
  playerAction: "I cast fireball",        // Free-text player input
  character: { /* Character object */ }, // Current character state
  chronicleId: "chronicle-uuid",          // Active chronicle (T7 placeholder: "placeholder-chronicle-id")
  lastReferenceUrl?: "https://..."        // Optional: previous turn's art URL
});
```

#### Server Processing

1. **Atomic Reservation** (idempotency)
   - Tries INSERT into `turns` table with unique `turn_id`
   - If conflict, checks if status='failed' and retries
   - Returns 409 Conflict if already reserved/completed

2. **NPC Recall Query** (T19)
   - Queries `npc` table by `user_id`
   - Returns most recent NPC (name, fact) to inject into narration context
   - Fail-open: if query fails, continues without NPC context

3. **Graph Invocation** (LangGraph state machine)
   - Input: `{ playerAction, character, turnNumber, npcContext? }`
   - Runs through: validate → resolve dice → narrate → art-trigger
   - Output: `{ gameEvent, narration, artUrl?, artError? }`

4. **Persist Turn Row**
   - Updates turn status to 'completed' with result
   - Stores `player_action`, `resolution_payload`, `created_at`

5. **Emit Response**

#### Server Emits: `turn:complete` or `turn:error`

Success (200):
```javascript
socket.on("turn:complete", { turnId: "uuid-here" });
```

Error (400+):
```javascript
socket.on("turn:error", {
  turnId: "uuid-here",
  error: "Turn already processed or in progress"
});
```

### Example: Full Client Flow

```typescript
// Connect
const socket = io("http://localhost:3000", {
  auth: { token: jwtToken }
});

socket.on("connect", () => {
  // Emit turn
  socket.emit("turn", {
    turnId: crypto.randomUUID(),
    playerAction: "I sneak past the guard",
    character: {
      name: "Mira Ashgrave",
      hp: 8,
      maxHp: 10,
      status: "alive",
      attributes: { dexterity: 16 /* ... */ },
      skills: { stealth: "Mastery" }
    },
    chronicleId: "placeholder-chronicle-id"
  });
});

socket.on("turn:complete", (data) => {
  console.log("Turn resolved:", data.turnId);
  // Fetch full turn result from GET /turns/:turnId (planned T9)
});

socket.on("turn:error", (data) => {
  console.error("Turn failed:", data.error);
});
```

## Data Model

### User Entity

```typescript
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar", { unique: true })
  email: string;

  @Column("varchar")
  passwordHash: string;

  @Column("timestamp", { default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column("timestamp", { nullable: true })
  lastLoginAt?: Date;
}
```

### Chronicle Entity

```typescript
export class ChronicleEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  userId: string;  // Foreign key to UserEntity

  @Column("varchar")
  name: string;

  @Column("text")
  setting: string;

  @Column("varchar", { default: "active" })
  status: "active" | "completed" | "paused";

  @Column("timestamp", { default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
```

### Turn Entity

```typescript
export class TurnEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid", { unique: true })
  turnId: string;  // Client-supplied idempotency key

  @Column("uuid")
  userId: string;

  @Column("uuid")
  chronicleId: string;

  @Column("int")
  turnNumber: number;

  @Column("varchar", { default: "reserved" })
  status: "reserved" | "completed" | "failed";

  @Column("text")
  playerAction: string;

  @Column("jsonb", { nullable: true })
  resolutionPayload?: {
    gameEvent: ResolvedEvent;
    narration: string;
    artUrl?: string;
  };

  @Column("timestamp", { default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
```

### NPC Entity

```typescript
export class NpcEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  userId: string;  // User who encountered this NPC

  @Column("varchar")
  name: string;

  @Column("text")
  fact: string;  // One memorable detail from the encounter

  @Column("varchar", { nullable: true })
  archetype?: string;  // Art cache archetype key (T6)

  @Column("timestamp", { default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
```

## Services

### GraphService

Main turn orchestrator. Coordinates reservation, graph invocation, and art generation.

```typescript
async runTurn(input: {
  turnId: string;
  userId: string;
  chronicleId: string;
  playerAction: string;
  character: any;  // CharacterSchema from harness
  lastReferenceUrl?: string;
}): Promise<{ success: boolean; error?: string }>;
```

Responsibilities:
1. Reserve turn atomically (via TurnReservationService)
2. Query NPC by userId (T19 recall, fail-open)
3. Invoke `harnessGraph.invoke()` with state
4. Call `generateArt()` if narration includes art request
5. Persist result to DB
6. Return success/error to WebSocket gateway

Error handling:
- LLM refusals → fallback to `narrate_fallback` node
- Art failures → return error alongside narration (client shows error, not missing image)
- DB failures → return `{ success: false, error: "..." }`

### TurnReservationService

Atomic turn reservation for idempotency.

```typescript
async reserve(
  turnId: string,
  userId: string,
  chronicleId: string
): Promise<TurnEntity | null>;
```

Logic:
1. Try `INSERT ... ON CONFLICT (turnId) DO NOTHING RETURNING *`
   - If row inserted, return it (new turn)
2. If conflict, try `UPDATE ... WHERE status='failed' RETURNING *`
   - If row updated, return it (retry after failure)
3. If no update (already completed/reserved), return null

Prevents duplicate turns from duplicate client requests.

### JwtWsGateway

WebSocket server, handles `turn` messages, emits `turn:complete`/`turn:error`.

```typescript
@SubscribeMessage("turn")
async handleTurn(
  @ConnectedSocket() client: Socket,
  @MessageBody() data: unknown
): Promise<void>;
```

Validates:
- User authenticated (socket.data.user set)
- Message has required fields: turnId, playerAction, character

### AuthService

JWT signing & validation (T7 foundation, login/refresh planned T8).

```typescript
async generateAccessToken(userId: string, email: string): Promise<string>;
async generateRefreshToken(userId: string): Promise<string>;
async validateRefreshToken(token: string): Promise<JwtPayload | null>;
```

Token expiry:
- Access: 15 minutes
- Refresh: 7 days
- Issuer/audience: "ai-dm-platform"

## Startup Behavior

On backend start, `GraphService.onModuleInit()` runs a cleanup sweep:

```typescript
// Flip stale 'reserved' rows to 'failed' (threshold: 60s)
// If backend crashed mid-turn, this makes the turn retryable
UPDATE turns SET status='failed'
WHERE status='reserved' AND created_at < NOW() - 60s
```

Prevents turns from hanging forever if the server crashes during LLM calls.

## Error Responses

All errors return a consistent JSON shape:

```json
{
  "statusCode": 400,
  "message": "Human-readable error",
  "timestamp": "2026-08-06T12:34:56.789Z",
  "path": "/health"
}
```

### Common Status Codes

- **200 OK** - Turn resolved successfully
- **400 Bad Request** - Missing fields in turn message
- **401 Unauthorized** - Invalid/missing JWT
- **409 Conflict** - Turn already processed
- **503 Service Unavailable** - DB unreachable

## Environment Variables (Backend-Specific)

| Var | Purpose | Example |
|-----|---------|---------|
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | Postgres URL | `postgres://...` |
| `JWT_SECRET` | Access token key | (32-byte hex) |
| `JWT_REFRESH_SECRET` | Refresh token key | (32-byte hex) |
| `FRONTEND_URL` | CORS origin | `http://localhost:3001` |

## Testing

### Health Check

```bash
curl http://localhost:3000/health
```

### WebSocket (via wscat or similar)

```bash
npm install -g wscat

wscat -c "ws://localhost:3000"
# Then type: {"turn": {"turnId": "uuid", ...}}
```

(WebSocket testing typically done via client SDK, not raw wscat.)

## Roadmap

**T8** (Auth): Login endpoint, token refresh flow  
**T9** (Deployment): REST endpoints for turn history, profile, settings  
**T20** (Post-v1): Chronicle ledger UI + read endpoints  

---

Updated 2026-08-06. See `docs/designs/ai-dm-platform.md` for full scope.
