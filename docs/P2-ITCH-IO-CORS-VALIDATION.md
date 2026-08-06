# P2 Blocker: itch.io CORS Origin Verification

**Status:** BLOCKED (needs itch.io test upload)  
**Priority:** P2 — required before v1 launch on itch.io  
**Owner:** Deployment phase (T25+)  
**Risk:** Silent WS connection failure for all itch.io players if CORS origin mismatch

## Problem

itch.io embeds HTML5 games in an iframe from a **proxy subdomain**, not the developer's domain.

**Example:**
- Your game domain: `myname.itch.io`
- itch.io embed iframe origin: `https://itch-game-1234.itch.io` (or similar pattern)
- Your WS CORS check in `JwtWsGateway` validates against `FRONTEND_URL` env var

**If FRONTEND_URL doesn't match itch.io's actual embed origin:**
- WS handshake CORS preflight fails (409)
- Client disconnects silently
- Player sees "Connection refused" in console
- No error in your backend logs (CORS happens client-side)

**Result:** v1 launch on itch.io ships with a broken game.

## Task: Validate & Document Actual Origin

### Step 1: Create Test Upload (TODO)

```bash
# After v1 is ready for itch.io (post-T14, before launch)

# 1. Verify build is ready
npm run test
npm run harness "test"

# 2. Build frontend (when ready, T5+)
npm run build
# Outputs: dist/frontend/index.html + assets

# 3. Create itch.io game page
# Go to: https://itch.io/dashboard
# Click: "Upload New Project"
# Name: "AI Dungeon Master [TEST]"
# Select: "This file will be played in the browser"
# Upload: dist/frontend/

# 4. Get embed URL
# Your itch.io game page: https://<username>.itch.io/<game-slug>
# Default embed: shows iframe in game page
```

### Step 2: Inspect Embed Origin (TODO)

On the itch.io game page:

```javascript
// 1. Open DevTools (F12) Console
// 2. Type:
document.querySelector('iframe').src
// Returns: https://itch-game-XXXX.itch.io or similar

// 3. Note the full origin (protocol + host)
// Example: https://itch-game-1234.itch.io

// 4. Paste into Slack / GitHub issue for documentation
```

**Also check:** itch.io API documentation for official embed subdomain pattern  
https://itch.io/api/documentation (if exists)

### Step 3: Update FRONTEND_URL (TODO)

Once you have the actual origin:

```bash
# In production backend environment:
FRONTEND_URL="https://itch-game-XXXX.itch.io"

# Backend WS gateway will then allow connections from that origin
# (See src/backend/auth/jwt-ws.gateway.ts, line 20-26)
```

### Step 4: Test Connection (TODO)

```javascript
// On the itch.io embedded game page, console:

const socket = io("http://localhost:3000", {  // Will be YOUR backend URL
  auth: { token: "JWT_TOKEN" }
});

socket.on("connect", () => {
  console.log("✅ WS connected successfully");
});

socket.on("connect_error", (error) => {
  console.log("❌ WS failed:", error);
  console.log("Check CORS: FRONTEND_URL must match embed origin");
});
```

**Expected:** "✅ WS connected successfully"  
**If error:** Connection refused due to CORS, need to update FRONTEND_URL

### Step 5: Document Pattern (TODO)

Update `DEPLOYMENT.md` with:
- Actual itch.io embed origin pattern (e.g., `https://itch-game-*.itch.io`)
- Exact FRONTEND_URL value to use
- Verification steps (so future deploys don't have this issue)

Add to `DEPLOYMENT.md` section "CORS Configuration":

```markdown
### Verified itch.io Embed Origin (2026-XX-XX)

- Embed URL pattern: `https://itch-game-<game-id>.itch.io`
- Exact origin for THIS game: `https://itch-game-12345.itch.io` (update if re-deployed)
- Set in backend: `FRONTEND_URL="https://itch-game-12345.itch.io"`
```

## Checklist

- [ ] Create test game on itch.io
- [ ] Upload v1 build to itch.io
- [ ] Inspect actual embed iframe origin (DevTools)
- [ ] Update FRONTEND_URL env var in backend
- [ ] Test WS connection from itch.io embedded game
- [ ] Verify `socket.on("connect")` fires without error
- [ ] Document actual origin pattern in DEPLOYMENT.md
- [ ] Remove test game (or keep for future patches)

## If This Fails

**Symptom:** Connection refused (409) in console on itch.io game page

**Diagnosis:**
1. Check backend CORS logic: `src/backend/auth/jwt-ws.gateway.ts:20-26`
2. Verify FRONTEND_URL is set in backend environment
3. Check backend logs: `pm2 logs` or server output

**Workaround (not recommended):**
```typescript
// DANGEROUS: Accept all origins (opens CORS vulnerability)
cors: {
  origin: "*"  // ❌ NEVER in production
}
```

Instead, verify the origin and set it explicitly.

## References

- **WS Gateway CORS:** `src/backend/auth/jwt-ws.gateway.ts` (lines 18-28)
- **Deployment Steps:** `DEPLOYMENT.md` section "CORS Configuration"
- **itch.io Docs:** https://itch.io/docs/client/api (if available)

---

**Blocked on:** v1 build ready, itch.io upload possible (post-T14, pre-launch)  
**Owner:** Deployment phase  
**Timeline:** Must complete before v1 itch.io launch (Decision #22 go/no-go)
