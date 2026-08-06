# T7: JWT Auth Guard + WebSocket Auth (Implemented)

## Summary

T7 implements secure JWT authentication and WebSocket handshake validation per `nestjs-best-practices` skill (security-auth-jwt, security-use-guards).

## Architecture

### JWT Strategy + Guards

- **JwtStrategy** (`jwt.strategy.ts`): Extracts Bearer token from `Authorization` header, validates via `JWT_SECRET` env var.
- **JwtAuthGuard** (`jwt-auth.guard.ts`): Global guard (registered via `APP_GUARD` in AppModule). Checks `@Public()` decorator to skip auth for public routes.
- **RolesGuard** (`roles.guard.ts`): Role-based access control. Uses `@Roles()` decorator to require specific roles.
- **Decorators** (`auth.decorators.ts`): `@Public()` + `@Roles(UserRole.Admin | UserRole.User)`.

### AuthService

- **generateAccessToken()**: Issues short-lived (15m) JWT with `sub` (user_id) + `email`.
- **generateRefreshToken()**: Issues long-lived (7d) refresh token; stored separately for revocation.
- **validateRefreshToken()**: Verifies refresh token, used by future T23 endpoint.

### WebSocket Gateway

- **JwtWsGateway** (`jwt-ws.gateway.ts`): Custom socket.io gateway.
  - Validates JWT during handshake (client must pass token in `auth.token` query or `Authorization` header).
  - Disconnects unauthenticated clients immediately.
  - Stores `user` context on `client.data`.
  - Emits "turn" message (handler stubbed, TODO: wire to T14 DM-graph resolver).

### Exception Filter

- **AllExceptionsFilter** (`common/all-exceptions.filter.ts`): Centralized error handling.
  - Catches HttpException + generic errors.
  - Logs to console (TODO: structured logging per T10).
  - Returns JSON with `statusCode`, `message`, `timestamp`, `path`.

## Configuration (env vars)

```
JWT_SECRET        # Required: min 32 chars. Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_REFRESH_SECRET # Required: separate secret for refresh token
DATABASE_URL      # Required: postgres connection string
PORT              # Optional: default 3000
```

## Wiring

1. **AppModule** imports JwtModule (registerAsync), PassportModule.
2. **Providers**: AuthService, JwtStrategy, JwtWsGateway + APP_GUARD (JwtAuthGuard, RolesGuard).
3. **main.ts** registers AllExceptionsFilter globally, enables CORS.

## What's Next

- **T14** (DM-graph): Wire `JwtWsGateway.handleTurn()` to graph resolver, emit narration to client.
- **T3/T4**: Add Characters, Turns, SpendTracking entities; rate-limit + idempotency checks.
- **T23**: JWT refresh endpoint (POST /auth/refresh with refresh token).
- **T12**: Age verification endpoint (signup gate).

## Testing

No unit tests yet (deferred to T25 eval suite). Smoke test: `npm run backend:dev` should bootstrap on port 3000.

## Decisions Captured

- Short-lived access token (15m) + refresh token (7d) per `security-auth-jwt` rule.
- Global guards via `APP_GUARD` — no manual auth checks in handlers.
- Custom WS handshake validation (no passport-jwt built-in).
- Enum-based UserRole (Admin | User) for RolesGuard.
