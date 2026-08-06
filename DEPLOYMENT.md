# Deployment Guide

Distribution to itch.io and Steam. Production environment setup, build process, and post-launch monitoring.

## Overview

**v1 Distribution Strategy** (Scope Decision #7):
1. **itch.io-first** (primary): HTML5 browser game, embedded on itch.io game page
2. **Steam** (post-v1): Electron wrapper, standalone desktop app
3. **Web (optional):** Self-hosted on Hostinger VPS (proof of concept, not primary)

## Itch.io Deployment (v1)

### Prerequisites

- itch.io account (create at https://itch.io)
- Game page created (go to Dashboard → Upload New Project → HTML)
- butler CLI (itch.io upload tool): https://itch.io/docs/butler/

### Build for Itch.io

Itch.io requires a self-contained HTML game (single index.html + assets).

**Current status:** Frontend not yet implemented (planned T5+). For now, ship a stub:

```bash
# Create build output directory
mkdir -p dist/web

# Build backend (if needed for testing)
npm run backend:dev &  # Start in background if testing WS

# Copy HTML stub to dist/web/index.html
cat > dist/web/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AI Dungeon Master</title>
  <style>
    body {
      font-family: serif;
      background: #e8e0c9;
      color: #241f1c;
      text-align: center;
      padding: 2rem;
    }
    h1 { font-family: 'Cinzel', serif; }
  </style>
</head>
<body>
  <h1>AI Dungeon Master</h1>
  <p>Frontend coming soon. Backend API listening on ws://localhost:3000</p>
</body>
</html>
EOF
```

### CORS Configuration (⚠️ Critical for Itch.io)

Itch.io embeds games in an iframe from a **proxy subdomain**, not your direct domain.

**Problem:** WS CORS check fails for itch.io embed, all players silently disconnected.

**Solution:** Verify itch.io's actual embed origin and set FRONTEND_URL accordingly.

**Steps:**
1. Upload to itch.io (see below)
2. Embed game on itch.io page
3. Open DevTools Console in the embedded game → check for CORS error
4. Get the actual embed origin (e.g., `https://<game-id>.itch-game.com`)
5. Update backend env: `FRONTEND_URL="https://<game-id>.itch-game.com"`
6. Redeploy backend
7. Refresh itch.io page, check WS connects

See `BACKEND.md` "JwtWsGateway CORS" for exact logic.

**TODO (P2, blocks itch.io launch):** Run test upload to itch.io, capture actual embed subdomain pattern, document it here.

### Upload to Itch.io

```bash
# Install butler if not installed
curl https://broth.itch.ovh/butler/linux-amd64/LATEST/butler -Lo ~/butler
chmod +x ~/butler

# Set credentials
~/butler login

# Upload build
~/butler push dist/web rcmanaure/ai-dm-platform:html5 --userversion <version>
# Example: --userversion "0.1.0-alpha"

# Verify on itch.io dashboard
# Game should appear under "Uploads" tab
```

### Itch.io Game Settings

In itch.io Dashboard for your game:

1. **Embed Settings:**
   - Embed in page: ✅ Enabled
   - Viewport size: 1280x720 (or responsive)
   - Iframe sandbox: Allow popups, forms, scripts, same-origin

2. **API Key (if player data syncing needed):**
   - Generate API key in account settings
   - Pass to game via query param: `?api_key=<key>`
   - Use in future (T9+) for server-less auth fallback

3. **Monetization:**
   - Set price: $0 (free)
   - One-time-unlock option (Decision #22): $15–$25
   - Commission rate: 10% (itch.io standard)

4. **Distribution:**
   - Downloadable: ❌ No (web-only for v1)
   - Playable in browser: ✅ Yes

### Post-Launch Monitoring

After uploading:

1. **Web Console (F12):**
   - Check for CORS errors on WS handshake
   - Verify `Authorization` header sent correctly

2. **Backend Logs:**
   - Monitor itch.io player IPs in auth logs
   - Flag unusual patterns (bot spam, coordinate attacks)

3. **Player Feedback:**
   - Monitor itch.io comments for bugs / disconnects
   - Cross-reference console errors

## Steam Deployment (Post-v1)

### Strategy

Wrap NestJS backend + frontend in **Electron** (not Tauri per Scope Decision #7 rationale).

**Why Electron:**
- Mature, large ecosystem (Discord, VS Code)
- Built-in Node.js runtime (can run NestJS)
- Native file system access (for local saves, optional)
- Easier code signing + auto-updates than Tauri's native approach

### Build Steps (Planned, Not v1)

1. Create Electron main process (`src/electron/main.ts`)
   - Spawn NestJS backend as subprocess
   - Open BrowserWindow with React frontend
   - Manage window lifecycle, menu, auto-updates

2. Build frontend: `npm run build`

3. Build backend: `npm run build:backend`

4. Package for Steam:
   ```bash
   npm run build:electron
   # Outputs: dist/electron/<platform>/
   ```

5. Upload to SteamWorks Dashboard
   - Require Steam API key
   - Configure achievements, trading cards (post-launch)
   - Set pricing, regional pricing

### Electron Scaffold (Placeholder for T25+)

```typescript
// src/electron/main.ts (not implemented yet)
import { app, BrowserWindow } from 'electron';
import { spawn } from 'child_process';

let mainWindow: BrowserWindow;
let backendProcess: any;

app.on('ready', async () => {
  // 1. Start NestJS backend
  backendProcess = spawn('npm', ['run', 'backend:start']);

  // 2. Wait for backend to be ready
  await waitForPort(3000);

  // 3. Create window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: { nodeIntegration: false, preload: './preload.js' }
  });

  // 4. Load frontend (built React app)
  mainWindow.loadFile('dist/frontend/index.html');
});

app.on('quit', () => {
  backendProcess.kill();
});
```

**Not shipping with v1.** Itch.io browser game is primary; Steam is post-v1.

## Self-Hosted Deployment (VPS)

**Context:** Proof-of-concept on Hostinger VPS. Not primary distribution, itch.io-first is the target.

### Environment

- Hostinger VPS (Ubuntu 20.04+)
- Node.js 18+
- PostgreSQL 14+
- Nginx (reverse proxy for WS + static assets)
- SSL (Let's Encrypt)

### Setup on VPS

```bash
# SSH into VPS
ssh root@<VPS_IP>

# 1. Install system deps
apt update && apt install -y curl git nodejs npm postgresql nginx certbot python3-certbot-nginx

# 2. Clone repo
cd /opt
git clone <repo> game
cd game

# 3. Install dependencies
npm install

# 4. Set up Postgres (or use managed DB)
sudo systemctl start postgresql

# 5. Environment
cp .env.example .env
# Edit: DATABASE_URL, JWT_SECRET, OPENROUTER_API_KEY, FRONTEND_URL

# 6. Migrations
npm run migration:run

# 7. Build frontend (when available)
npm run build  # Outputs dist/frontend

# 8. Start backend (via PM2 or systemd)
npm install -g pm2
pm2 start src/backend/main.ts --name "ai-dm-backend"
pm2 save
```

### Nginx Config

```nginx
server {
  listen 80;
  server_name ai-dm.example.com;

  # Redirect to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name ai-dm.example.com;

  ssl_certificate /etc/letsencrypt/live/ai-dm.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/ai-dm.example.com/privkey.pem;

  # Static assets (frontend)
  root /opt/game/dist/frontend;
  location / {
    try_files $uri $uri/ /index.html;
  }

  # API proxy (WebSocket + HTTP)
  location /api {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  # WebSocket (socket.io)
  location /socket.io {
    proxy_pass http://localhost:3000/socket.io;
    proxy_http_version 1.1;
    proxy_buffering off;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
  }
}
```

Setup SSL:
```bash
sudo certbot certonly --standalone -d ai-dm.example.com
# Renews automatically via cron
```

### Monitoring

```bash
# Logs
pm2 logs "ai-dm-backend"

# Metrics (optional)
pm2 install pm2-logrotate  # Rotate logs
pm2 install pm2-auto-pull  # Auto-deploy on git push
```

## Environment Variables for Production

| Var | Purpose | Production Value |
|-----|---------|------------------|
| `DATABASE_URL` | Postgres | Managed DB (RDS, PlanetScale) |
| `JWT_SECRET` | Access token | 32-byte secure random |
| `JWT_REFRESH_SECRET` | Refresh token | 32-byte secure random |
| `OPENROUTER_API_KEY` | LLM API | Production API key |
| `FRONTEND_URL` | CORS origin | `https://ai-dm.itch.io` or custom domain |
| `NODE_ENV` | Runtime mode | `production` |
| `PORT` | Server port | `3000` |
| `LOG_LEVEL` | Verbosity | `warn` or `error` |

**Security checklist:**
- [ ] Secrets stored in env vars, never committed
- [ ] HTTPS enabled (SSL certificate valid)
- [ ] CORS origin locked to itch.io domain (not wildcard)
- [ ] Database user has minimal perms (no DROP, no ALTER)
- [ ] Rate limiting on LLM calls (prevent account abuse)
- [ ] Monitoring + alerting set up

## Rollback Plan

**If a production turn fails:**

1. Deployment does **not** roll back automatically
2. Check backend logs: `pm2 logs`
3. If issue is code, revert commit: `git revert HEAD`
4. Redeploy: Nginx serves old frontend, backend at old version
5. If DB migration broke, run `npm run migration:revert`

**No data loss expected** (atomicity at turn level protects against mid-turn crashes).

## Post-Launch Monitoring

### Metrics to Track

- **Availability:** Turn success rate (% of /turn requests completed)
- **Latency:** P50/P95/P99 turn time (should be <10s for LLM + art)
- **LLM Costs:** Track OpenRouter API bill, cost per user, cost per turn
- **Player Retention:** D1/D7/D30 (return rates after launch)
- **Conversion:** Free-to-unlock rate (Decision #22 metric)

### Tools (Post-v1)

- **Logging:** Structured JSON logs, ship to Loggly or ELK
- **APM:** DataDog or New Relic for latency/error tracking
- **Metrics:** Prometheus + Grafana for custom dashboards
- **Alerts:** Slack integration for 50x errors, downtime

---

Updated 2026-08-06. See Scope Decision #7 in `docs/designs/ai-dm-platform.md` for rationale.

**P2 blocker before itch.io launch:** Verify FRONTEND_URL CORS config works with actual itch.io embed subdomain (test upload needed).
