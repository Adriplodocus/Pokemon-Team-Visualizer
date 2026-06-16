# Randomlocke Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/randomlocke.html` — a private tools page for Randomlocke runs with route history (DB-backed), a StreamCounters iframe, and a persistent Twitch bot (Durable Object) that answers `!check <zone>` in the streamer's channel.

**Architecture:** Vanilla JS frontend following existing page conventions. Cloudflare Pages Functions for all API routes. Neon (PostgreSQL) for route history and bot token storage. One Durable Object (`TwitchBotDO`) per user maintains a persistent outgoing WebSocket to Twitch IRC; alarms keep it alive across evictions.

**Tech Stack:** Vanilla JS, Cloudflare Pages Functions, Durable Objects (with Alarms), Neon PostgreSQL (`@neondatabase/serverless`), Twitch IRC WebSocket API

> **Phase 1** (Tasks 1–5): Page + route history + life counter. Shippable on its own.
> **Phase 2** (Tasks 6–10): Twitch bot. Requires Phase 1 to be deployed first.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `db/schema.sql` | Modify | Add `randomlocke_routes` + `bot_global_token` tables |
| `functions/api/randomlocke/routes.js` | Create | GET + POST `/api/randomlocke/routes` |
| `functions/api/randomlocke/routes/[id].js` | Create | DELETE `/api/randomlocke/routes/:id` |
| `randomlocke.html` | Create | Page markup (3 cards) |
| `randomlocke.js` | Create | UI logic, API calls, i18n |
| `wrangler.toml` | Create | DO binding + migration |
| `functions/api/randomlocke/_lib/TwitchBotDO.js` | Create | Durable Object: IRC connection, `!check` handler, alarm-based keepalive |
| `functions/api/randomlocke/bot/start.js` | Create | POST `/api/randomlocke/bot/start` — exports `TwitchBotDO` |
| `functions/api/randomlocke/bot/stop.js` | Create | POST `/api/randomlocke/bot/stop` |
| `functions/api/randomlocke/bot/status.js` | Create | GET `/api/randomlocke/bot/status` |

---

## Task 1: DB schema — add new tables

**Files:**
- Modify: `db/schema.sql`

- [ ] **Step 1: Add tables to schema.sql**

Append to `db/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS randomlocke_routes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  zone_name  TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_randomlocke_routes_user ON randomlocke_routes(user_id);

-- Single-row table: stores the refreshed global bot token.
-- Seeded manually; updated by TwitchBotDO on each token refresh.
CREATE TABLE IF NOT EXISTS bot_global_token (
  id            SERIAL PRIMARY KEY,
  access_token  TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

- [ ] **Step 2: Run migration against Neon**

Open Neon console (https://console.neon.tech) → SQL editor for the project DB → paste and run the SQL from Step 1.

Alternatively via psql:
```bash
psql $DATABASE_URL -f db/schema.sql
```

- [ ] **Step 3: Seed bot_global_token with initial bot credentials**

In Neon SQL editor:
```sql
INSERT INTO bot_global_token (access_token, refresh_token)
VALUES ('<YOUR_BOT_ACCESS_TOKEN>', '<YOUR_BOT_REFRESH_TOKEN>');
```

These are obtained from the Twitch Dev Console for the bot account with scopes `chat:read chat:edit`.

- [ ] **Step 4: Verify tables exist**

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('randomlocke_routes', 'bot_global_token');
```

Expected: 2 rows.

- [ ] **Step 5: Commit**

```bash
git add db/schema.sql
git commit -m "feat(db): add randomlocke_routes and bot_global_token tables"
```

---

## Task 2: Route history API

**Files:**
- Create: `functions/api/randomlocke/routes.js`
- Create: `functions/api/randomlocke/routes/[id].js`

- [ ] **Step 1: Create routes.js (GET + POST)**

Create `functions/api/randomlocke/routes.js`:

```js
import { parseCookies } from '../../_lib/cookies.js';
import { verifyJWT } from '../../_lib/jwt.js';
import { getDB } from '../../_lib/db.js';

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

async function getUser(context) {
    const cookies = parseCookies(context.request);
    return verifyJWT(cookies.auth, context.env.JWT_SECRET);
}

export async function onRequestGet(context) {
    const payload = await getUser(context);
    if (!payload) return json({ error: 'Unauthorized' }, 401);

    let rows;
    try {
        const sql = getDB(context.env);
        rows = await sql`
            SELECT id, zone_name, created_at
            FROM randomlocke_routes
            WHERE user_id = ${payload.userId}
            ORDER BY created_at DESC
        `;
    } catch (e) {
        console.error('DB error in GET /routes', e);
        return json({ error: 'Service unavailable' }, 503);
    }

    return json(rows.map(r => ({
        id: r.id,
        zoneName: r.zone_name,
        createdAt: r.created_at,
    })));
}

export async function onRequestPost(context) {
    const payload = await getUser(context);
    if (!payload) return json({ error: 'Unauthorized' }, 401);

    let body;
    try { body = await context.request.json(); }
    catch { return json({ error: 'Invalid JSON' }, 400); }

    const zone = (body.zone || '').trim();
    if (!zone) return json({ error: 'zone required' }, 400);
    if (zone.length > 100) return json({ error: 'zone too long (max 100)' }, 400);

    let rows;
    try {
        const sql = getDB(context.env);
        rows = await sql`
            INSERT INTO randomlocke_routes (user_id, zone_name)
            VALUES (${payload.userId}, ${zone})
            RETURNING id, zone_name, created_at
        `;
    } catch (e) {
        console.error('DB error in POST /routes', e);
        return json({ error: 'Service unavailable' }, 503);
    }

    const r = rows[0];
    return json({ id: r.id, zoneName: r.zone_name, createdAt: r.created_at }, 201);
}
```

- [ ] **Step 2: Create routes/[id].js (DELETE)**

Create `functions/api/randomlocke/routes/[id].js`:

```js
import { parseCookies } from '../../../_lib/cookies.js';
import { verifyJWT } from '../../../_lib/jwt.js';
import { getDB } from '../../../_lib/db.js';

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function onRequestDelete(context) {
    const cookies = parseCookies(context.request);
    const payload = await verifyJWT(cookies.auth, context.env.JWT_SECRET);
    if (!payload) return json({ error: 'Unauthorized' }, 401);

    const { id } = context.params;
    if (!id) return json({ error: 'Missing id' }, 400);

    let result;
    try {
        const sql = getDB(context.env);
        result = await sql`
            DELETE FROM randomlocke_routes
            WHERE id = ${id} AND user_id = ${payload.userId}
            RETURNING id
        `;
    } catch (e) {
        console.error('DB error in DELETE /routes/:id', e);
        return json({ error: 'Service unavailable' }, 503);
    }

    if (!result.length) return json({ error: 'Not found' }, 404);
    return json({ ok: true });
}
```

- [ ] **Step 3: Test manually with wrangler dev**

```bash
npx wrangler pages dev . --binding DATABASE_URL=<neon-url> --binding JWT_SECRET=<secret>
```

- Open `http://localhost:8788/randomlocke.html` (will 404 until Task 5, skip for now)
- Test via curl with a valid JWT cookie (or Postman):

```bash
# GET (expect 401 without cookie)
curl -s http://localhost:8788/api/randomlocke/routes
# Expected: {"error":"Unauthorized"}
```

- [ ] **Step 4: Commit**

```bash
git add functions/api/randomlocke/routes.js functions/api/randomlocke/routes/
git commit -m "feat(api): add randomlocke route history CRUD endpoints"
```

---

## Task 3: randomlocke.html

**Files:**
- Create: `randomlocke.html`

- [ ] **Step 1: Create the HTML page**

Create `randomlocke.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Randomlocke — Pokémon Stream Visualizer</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='white'/><path d='M2,16 A14,14 0 0,1 30,16 Z' fill='%23EE1515'/><circle cx='16' cy='16' r='14' fill='none' stroke='%231a1a1a' stroke-width='2'/><line x1='2' y1='16' x2='30' y2='16' stroke='%231a1a1a' stroke-width='2'/><circle cx='16' cy='16' r='5' fill='%231a1a1a'/><circle cx='16' cy='16' r='3' fill='white'/></svg>">
<link rel="stylesheet" href="style.css">
<meta name="theme-color" content="#00CCFF">
<script src="lang.js"></script>
</head>
<body>
<script>const ACTIVE_PAGE = 'randomlocke';</script>
<script src="header.js"></script>
<div id="app">

<div id="auth-gate" class="hidden">
    <div class="card" style="text-align:center;padding:2rem">
        <p data-i18n="loginRequired">Inicia sesión para usar esta herramienta.</p>
        <a href="/login.html" class="btn" style="margin-top:1rem" data-i18n="loginBtn">Iniciar sesión</a>
    </div>
</div>

<div id="main-content" class="hidden">

    <!-- Route history -->
    <div class="card" id="routes-card">
        <h2 class="card-title" data-i18n="routeHistoryTitle">Historial de rutas</h2>

        <div class="settings-row" style="gap:0.5rem;margin-bottom:0.75rem">
            <input id="route-search" class="input" type="text"
                data-i18n-ph="searchZonePh" placeholder="Buscar zona...">
        </div>

        <div class="settings-row" style="gap:0.5rem;margin-bottom:1rem">
            <input id="route-input" class="input" type="text"
                data-i18n-ph="addZonePh" placeholder="Añadir zona...">
            <button id="route-add-btn" class="btn" data-i18n="addZoneBtn">+ Añadir</button>
        </div>

        <ul id="route-list" class="route-list"></ul>
        <p id="route-empty" class="muted-text hidden" data-i18n="noRoutes">Sin rutas registradas.</p>
    </div>

    <!-- Life counter -->
    <div class="card" id="counter-card">
        <h2 class="card-title" data-i18n="lifeCounterTitle">Contador de vidas</h2>
        <div class="settings-row" style="gap:0.5rem;margin-bottom:0.75rem;align-items:center">
            <label style="white-space:nowrap" data-i18n="overlayUrlLabel">URL del overlay</label>
            <input id="counter-url" class="input" type="url"
                data-i18n-ph="overlayUrlPh" placeholder="https://...">
        </div>
        <iframe id="counter-frame" src="" style="width:100%;height:120px;border:none;border-radius:8px;background:var(--surface2)"></iframe>
    </div>

    <!-- Twitch bot -->
    <div class="card" id="bot-card">
        <h2 class="card-title" data-i18n="botTitle">Bot de Twitch</h2>
        <div class="bot-status-row">
            <span class="live-dot" id="bot-dot" style="background:var(--dim)"></span>
            <span id="bot-status-label" data-i18n="botDisconnected">Desactivado</span>
            <span id="bot-channel-label" class="muted-text"></span>
        </div>
        <button id="bot-toggle-btn" class="btn" style="margin-top:0.75rem" data-i18n="activateBot">Activar bot</button>
        <p class="muted-text" style="margin-top:0.75rem;font-size:0.75rem" data-i18n="botHint">Responde a: !check &lt;zona&gt;</p>
    </div>

</div><!-- /main-content -->
</div><!-- /app -->
<script src="randomlocke.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add randomlocke.html
git commit -m "feat(randomlocke): add page HTML skeleton"
```

---

## Task 4: Style additions for randomlocke

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Add route list and bot status styles**

Open `style.css` and append at the end:

```css
/* ── Randomlocke ─────────────────────────────────────── */
.route-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.route-list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.4rem 0.75rem;
    background: var(--surface2);
    border-radius: 8px;
    font-size: 0.85rem;
    color: var(--text-em);
}

.route-list li button {
    background: none;
    border: none;
    color: var(--dim);
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    padding: 0 0.25rem;
    transition: color 0.15s;
}

.route-list li button:hover {
    color: #E5173A;
}

.bot-status-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
}

.muted-text {
    color: var(--muted);
    font-size: 0.8rem;
}
```

- [ ] **Step 2: Commit**

```bash
git add style.css
git commit -m "feat(styles): add randomlocke route list and bot status styles"
```

---

## Task 5: randomlocke.js — Phase 1 (routes + life counter + auth gate + bot UI stub)

**Files:**
- Create: `randomlocke.js`

- [ ] **Step 1: Create randomlocke.js**

Create `randomlocke.js`:

```js
// ── i18n ─────────────────────────────────────────────
const STRINGS = {
    es: {
        routeHistoryTitle: 'Historial de rutas',
        searchZonePh:      'Buscar zona...',
        addZonePh:         'Añadir zona...',
        addZoneBtn:        '+ Añadir',
        noRoutes:          'Sin rutas registradas.',
        lifeCounterTitle:  'Contador de vidas',
        overlayUrlLabel:   'URL del overlay',
        overlayUrlPh:      'https://...',
        botTitle:          'Bot de Twitch',
        botDisconnected:   'Desactivado',
        botConnected:      'Activo',
        activateBot:       'Activar bot',
        deactivateBot:     'Desactivar bot',
        botHint:           'Responde a: !check <zona>',
        loginRequired:     'Inicia sesión para usar esta herramienta.',
        loginBtn:          'Iniciar sesión',
    },
    en: {
        routeHistoryTitle: 'Route history',
        searchZonePh:      'Search zone...',
        addZonePh:         'Add zone...',
        addZoneBtn:        '+ Add',
        noRoutes:          'No routes recorded.',
        lifeCounterTitle:  'Life counter',
        overlayUrlLabel:   'Overlay URL',
        overlayUrlPh:      'https://...',
        botTitle:          'Twitch bot',
        botDisconnected:   'Inactive',
        botConnected:      'Active',
        activateBot:       'Activate bot',
        deactivateBot:     'Deactivate bot',
        botHint:           'Responds to: !check <zone>',
        loginRequired:     'Log in to use this tool.',
        loginBtn:          'Log in',
    },
};

function t(key) {
    return (STRINGS[currentLang] || STRINGS.es)[key] || key;
}

function applyLang() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        el.placeholder = t(el.dataset.i18nPh);
    });
}

// ── State ─────────────────────────────────────────────
let routes = [];
let searchQuery = '';
let botActive = false;

// ── Auth gate ─────────────────────────────────────────
async function checkAuth() {
    try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) throw new Error();
        const user = await res.json();
        document.getElementById('auth-gate').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');
        document.getElementById('bot-channel-label').textContent = `#${user.username}`;
        return user;
    } catch {
        document.getElementById('auth-gate').classList.remove('hidden');
        document.getElementById('main-content').classList.add('hidden');
        return null;
    }
}

// ── Route history ─────────────────────────────────────
async function loadRoutes() {
    try {
        const res = await fetch('/api/randomlocke/routes');
        if (!res.ok) throw new Error();
        routes = await res.json();
        renderRoutes();
    } catch (e) {
        console.error('Failed to load routes', e);
    }
}

function renderRoutes() {
    const list = document.getElementById('route-list');
    const empty = document.getElementById('route-empty');
    const query = searchQuery.toLowerCase();

    const filtered = query
        ? routes.filter(r => r.zoneName.toLowerCase().includes(query))
        : routes;

    if (!filtered.length) {
        list.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    list.innerHTML = filtered.map(r => `
        <li data-id="${r.id}">
            <span>${escapeHtml(r.zoneName)}</span>
            <button onclick="deleteRoute('${r.id}')" title="Eliminar">✕</button>
        </li>
    `).join('');
}

async function addRoute() {
    const input = document.getElementById('route-input');
    const zone = input.value.trim();
    if (!zone) return;

    try {
        const res = await fetch('/api/randomlocke/routes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ zone }),
        });
        if (!res.ok) throw new Error();
        const newRoute = await res.json();
        routes.unshift(newRoute);
        input.value = '';
        renderRoutes();
    } catch (e) {
        console.error('Failed to add route', e);
    }
}

async function deleteRoute(id) {
    try {
        const res = await fetch(`/api/randomlocke/routes/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        routes = routes.filter(r => r.id !== id);
        renderRoutes();
    } catch (e) {
        console.error('Failed to delete route', e);
    }
}

// ── Life counter ──────────────────────────────────────
const COUNTER_URL_KEY = 'ptv_streamcounters_url';

function initLifeCounter() {
    const input = document.getElementById('counter-url');
    const frame = document.getElementById('counter-frame');
    const saved = localStorage.getItem(COUNTER_URL_KEY) || '';
    input.value = saved;
    if (saved) frame.src = saved;

    input.addEventListener('blur', () => {
        const url = input.value.trim();
        localStorage.setItem(COUNTER_URL_KEY, url);
        frame.src = url;
    });
}

// ── Bot ───────────────────────────────────────────────
async function loadBotStatus() {
    try {
        const res = await fetch('/api/randomlocke/bot/status');
        if (!res.ok) throw new Error();
        const { connected } = await res.json();
        setBotUI(connected);
    } catch {
        setBotUI(false);
    }
}

function setBotUI(active) {
    botActive = active;
    const dot = document.getElementById('bot-dot');
    const label = document.getElementById('bot-status-label');
    const btn = document.getElementById('bot-toggle-btn');

    dot.style.background = active ? '#22C55E' : 'var(--dim)';
    label.textContent = t(active ? 'botConnected' : 'botDisconnected');
    btn.textContent = t(active ? 'deactivateBot' : 'activateBot');
}

async function toggleBot() {
    const btn = document.getElementById('bot-toggle-btn');
    btn.disabled = true;
    try {
        const endpoint = botActive ? '/api/randomlocke/bot/stop' : '/api/randomlocke/bot/start';
        const res = await fetch(endpoint, { method: 'POST' });
        if (!res.ok) throw new Error();
        setBotUI(!botActive);
    } catch (e) {
        console.error('Bot toggle failed', e);
    } finally {
        btn.disabled = false;
    }
}

// ── Utils ─────────────────────────────────────────────
function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Init ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    applyLang();
    const user = await checkAuth();
    if (!user) return;

    loadRoutes();
    initLifeCounter();
    loadBotStatus();

    document.getElementById('route-add-btn').addEventListener('click', addRoute);
    document.getElementById('route-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') addRoute();
    });
    document.getElementById('route-search').addEventListener('input', e => {
        searchQuery = e.target.value;
        renderRoutes();
    });
    document.getElementById('bot-toggle-btn').addEventListener('click', toggleBot);
});

// Re-apply lang when header triggers setLang
const _origSetLang = typeof setLangBase === 'function' ? setLangBase : null;
if (_origSetLang) {
    window.addEventListener('langchange', applyLang);
}
```

- [ ] **Step 2: Test Phase 1 manually**

```bash
npx wrangler pages dev . --binding DATABASE_URL=<neon-url> --binding JWT_SECRET=<secret> --binding TWITCH_CLIENT_ID=<id> --binding TWITCH_CLIENT_SECRET=<secret>
```

Navigate to `http://localhost:8788/randomlocke.html`.

Verify:
- Not logged in → auth gate card shown
- Log in via Twitch → redirected back
- Route history: add a zone → appears in list
- Route history: search filters the list
- Route history: delete removes from list
- Life counter: paste a URL → iframe loads it, URL persists after reload
- Bot card: shows "Desactivado", toggle button present (will 503 until Task 8)

- [ ] **Step 3: Commit**

```bash
git add randomlocke.js
git commit -m "feat(randomlocke): add Phase 1 — routes, life counter, bot UI stub"
```

---

## Task 6: wrangler.toml — create with DO binding

**Files:**
- Create: `wrangler.toml`

> **Note:** Before creating this file, verify the project name in the Cloudflare Pages dashboard. The `name` field must match.

- [ ] **Step 1: Create wrangler.toml**

Create `wrangler.toml` at the project root:

```toml
name = "pokemon-team-visualizer"
compatibility_date = "2024-09-23"

[[durable_objects.bindings]]
name = "TWITCH_BOT"
class_name = "TwitchBotDO"

[[migrations]]
tag = "v1"
new_classes = ["TwitchBotDO"]
```

- [ ] **Step 2: Verify wrangler recognizes the config**

```bash
npx wrangler pages dev . --binding DATABASE_URL=<neon-url> --binding JWT_SECRET=<secret> --binding BOT_ACCESS_TOKEN=<token> --binding BOT_REFRESH_TOKEN=<token> --binding BOT_USERNAME=<username> --binding TWITCH_CLIENT_ID=<id> --binding TWITCH_CLIENT_SECRET=<secret>
```

Should start without errors about unknown bindings.

- [ ] **Step 3: Commit**

```bash
git add wrangler.toml
git commit -m "chore: add wrangler.toml with TwitchBotDO binding"
```

---

## Task 7: TwitchBotDO — Durable Object

**Files:**
- Create: `functions/api/randomlocke/_lib/TwitchBotDO.js`

- [ ] **Step 1: Create the Durable Object**

Create `functions/api/randomlocke/_lib/TwitchBotDO.js`:

```js
import { neon } from '@neondatabase/serverless';

function getDB(env) {
    return neon(env.DATABASE_URL);
}

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export class TwitchBotDO {
    constructor(state, env) {
        this.state = state;
        this.env = env;
        this.ws = null;
    }

    async fetch(request) {
        const url = new URL(request.url);

        if (url.pathname === '/connect') {
            const { channel, userId } = await request.json();
            await this.state.storage.put('connected', true);
            await this.state.storage.put('channel', channel);
            await this.state.storage.put('userId', userId);
            await this.connect(channel, userId);
            this.scheduleAlarm();
            return jsonResponse({ ok: true });
        }

        if (url.pathname === '/disconnect') {
            await this.state.storage.put('connected', false);
            await this.state.storage.deleteAlarm();
            this.disconnect();
            return jsonResponse({ ok: true });
        }

        if (url.pathname === '/status') {
            const connected = await this.state.storage.get('connected') || false;
            const channel = await this.state.storage.get('channel') || null;
            const wsOpen = this.ws !== null && this.ws.readyState === WebSocket.OPEN;
            return jsonResponse({ connected: connected && wsOpen, channel });
        }

        return new Response('Not found', { status: 404 });
    }

    async alarm() {
        const connected = await this.state.storage.get('connected');
        if (!connected) return;

        const wsOpen = this.ws !== null && this.ws.readyState === WebSocket.OPEN;
        if (!wsOpen) {
            const channel = await this.state.storage.get('channel');
            const userId = await this.state.storage.get('userId');
            if (channel && userId) {
                await this.connect(channel, userId);
            }
        }

        this.scheduleAlarm();
    }

    scheduleAlarm() {
        // Wake every 4 minutes to keep connection alive
        this.state.storage.setAlarm(Date.now() + 4 * 60 * 1000);
    }

    async getBotToken() {
        try {
            const sql = getDB(this.env);
            const rows = await sql`
                SELECT access_token, refresh_token
                FROM bot_global_token
                ORDER BY updated_at DESC
                LIMIT 1
            `;
            if (rows.length) return rows[0];
        } catch (e) {
            console.error('Failed to get bot token from DB', e);
        }
        // Fall back to env secrets (initial seed)
        return {
            access_token: this.env.BOT_ACCESS_TOKEN,
            refresh_token: this.env.BOT_REFRESH_TOKEN,
        };
    }

    async refreshToken(oldRefreshToken) {
        const res = await fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type:    'refresh_token',
                refresh_token: oldRefreshToken,
                client_id:     this.env.TWITCH_CLIENT_ID,
                client_secret: this.env.TWITCH_CLIENT_SECRET,
            }),
        });

        if (!res.ok) {
            console.error('Token refresh failed', res.status, await res.text());
            return null;
        }

        const { access_token, refresh_token } = await res.json();

        // Persist refreshed token to DB
        try {
            const sql = getDB(this.env);
            await sql`
                UPDATE bot_global_token
                SET access_token = ${access_token},
                    refresh_token = ${refresh_token},
                    updated_at = NOW()
                WHERE id = (SELECT id FROM bot_global_token ORDER BY updated_at DESC LIMIT 1)
            `;
        } catch (e) {
            console.error('Failed to persist refreshed token', e);
        }

        return { access_token, refresh_token };
    }

    async connect(channel, userId) {
        this.disconnect();

        const { access_token, refresh_token } = await this.getBotToken();
        const botUsername = this.env.BOT_USERNAME;

        const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
        this.ws = ws;

        ws.addEventListener('open', () => {
            ws.send(`PASS oauth:${access_token}`);
            ws.send(`NICK ${botUsername}`);
            ws.send(`JOIN #${channel}`);
        });

        ws.addEventListener('message', async (event) => {
            await this.handleMessage(event.data, channel, userId, refresh_token);
        });

        ws.addEventListener('close', () => {
            if (this.ws === ws) this.ws = null;
        });

        ws.addEventListener('error', (e) => {
            console.error('IRC WebSocket error', e);
            if (this.ws === ws) this.ws = null;
        });
    }

    disconnect() {
        if (this.ws) {
            try { this.ws.close(); } catch {}
            this.ws = null;
        }
    }

    async handleMessage(raw, channel, userId, refreshToken) {
        if (raw.startsWith('PING')) {
            this.ws?.send('PONG :tmi.twitch.tv');
            return;
        }

        // Handle auth failure: reconnect with refreshed token
        if (raw.includes('NOTICE') && raw.includes('Login authentication failed')) {
            console.error('Bot auth failed — refreshing token');
            const newTokens = await this.refreshToken(refreshToken);
            if (newTokens) await this.connect(channel, userId);
            return;
        }

        // :username!username@username.tmi.twitch.tv PRIVMSG #channel :message
        const match = raw.match(/^:\w+!\w+@\w+\.tmi\.twitch\.tv PRIVMSG #\w+ :(.+)$/);
        if (!match) return;

        const text = match[1].trim();
        const checkMatch = text.match(/^!check\s+(.+)$/i);
        if (!checkMatch) return;

        const zone = checkMatch[1].trim();
        await this.checkZone(zone, channel, userId);
    }

    async checkZone(zone, channel, userId) {
        let found = false;
        try {
            const sql = getDB(this.env);
            const rows = await sql`
                SELECT id FROM randomlocke_routes
                WHERE user_id = ${userId} AND lower(zone_name) = lower(${zone})
            `;
            found = rows.length > 0;
        } catch (e) {
            console.error('DB error in checkZone', e);
            return;
        }

        const msg = found
            ? `✅ ${zone} ya fue atrapada`
            : `❌ ${zone} está libre`;

        this.ws?.send(`PRIVMSG #${channel} :${msg}`);
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add functions/api/randomlocke/_lib/TwitchBotDO.js
git commit -m "feat(do): add TwitchBotDO with IRC WebSocket and alarm keepalive"
```

---

## Task 8: Bot API endpoints

**Files:**
- Create: `functions/api/randomlocke/bot/start.js`
- Create: `functions/api/randomlocke/bot/stop.js`
- Create: `functions/api/randomlocke/bot/status.js`

- [ ] **Step 1: Create bot/start.js**

Create `functions/api/randomlocke/bot/start.js`:

```js
// Re-export DO class so Cloudflare can register it from this bundle
export { TwitchBotDO } from '../_lib/TwitchBotDO.js';

import { parseCookies } from '../../../_lib/cookies.js';
import { verifyJWT } from '../../../_lib/jwt.js';
import { getDB } from '../../../_lib/db.js';

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function onRequestPost(context) {
    const cookies = parseCookies(context.request);
    const payload = await verifyJWT(cookies.auth, context.env.JWT_SECRET);
    if (!payload) return json({ error: 'Unauthorized' }, 401);

    // Get the user's Twitch username (the channel to join)
    let username;
    try {
        const sql = getDB(context.env);
        const rows = await sql`
            SELECT username FROM users WHERE id = ${payload.userId}
        `;
        if (!rows.length) return json({ error: 'User not found' }, 401);
        username = rows[0].username;
    } catch (e) {
        console.error('DB error in bot/start', e);
        return json({ error: 'Service unavailable' }, 503);
    }

    if (!context.env.TWITCH_BOT) {
        return json({ error: 'Bot not configured' }, 503);
    }

    const id = context.env.TWITCH_BOT.idFromName(payload.userId);
    const stub = context.env.TWITCH_BOT.get(id);

    const doRes = await stub.fetch('https://do/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: username, userId: payload.userId }),
    });

    if (!doRes.ok) return json({ error: 'Bot failed to connect' }, 502);
    return json({ ok: true });
}
```

- [ ] **Step 2: Create bot/stop.js**

Create `functions/api/randomlocke/bot/stop.js`:

```js
import { parseCookies } from '../../../_lib/cookies.js';
import { verifyJWT } from '../../../_lib/jwt.js';

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function onRequestPost(context) {
    const cookies = parseCookies(context.request);
    const payload = await verifyJWT(cookies.auth, context.env.JWT_SECRET);
    if (!payload) return json({ error: 'Unauthorized' }, 401);

    if (!context.env.TWITCH_BOT) return json({ ok: true });

    const id = context.env.TWITCH_BOT.idFromName(payload.userId);
    const stub = context.env.TWITCH_BOT.get(id);

    await stub.fetch('https://do/disconnect', { method: 'POST' });
    return json({ ok: true });
}
```

- [ ] **Step 3: Create bot/status.js**

Create `functions/api/randomlocke/bot/status.js`:

```js
import { parseCookies } from '../../../_lib/cookies.js';
import { verifyJWT } from '../../../_lib/jwt.js';

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function onRequestGet(context) {
    const cookies = parseCookies(context.request);
    const payload = await verifyJWT(cookies.auth, context.env.JWT_SECRET);
    if (!payload) return json({ error: 'Unauthorized' }, 401);

    if (!context.env.TWITCH_BOT) {
        return json({ connected: false, channel: null });
    }

    const id = context.env.TWITCH_BOT.idFromName(payload.userId);
    const stub = context.env.TWITCH_BOT.get(id);

    const doRes = await stub.fetch('https://do/status');
    const status = await doRes.json();
    return json(status);
}
```

- [ ] **Step 4: Commit**

```bash
git add functions/api/randomlocke/bot/
git commit -m "feat(api): add bot start/stop/status endpoints"
```

---

## Task 9: Set Cloudflare secrets for the bot

- [ ] **Step 1: Set bot secrets via wrangler**

```bash
npx wrangler pages secret put BOT_ACCESS_TOKEN
# Paste the bot account's OAuth access token when prompted

npx wrangler pages secret put BOT_REFRESH_TOKEN
# Paste the bot account's OAuth refresh token when prompted

npx wrangler pages secret put BOT_USERNAME
# Paste the bot account's Twitch username (lowercase) when prompted
```

To get the bot's OAuth tokens with required scopes (`chat:read chat:edit`):
- Go to https://twitchapps.com/tmi/ and log in as the bot account, or
- Use Twitch CLI: `twitch token -u -s 'chat:read chat:edit'` logged in as the bot account

- [ ] **Step 2: Verify bot secrets are set**

```bash
npx wrangler pages secret list
```

Expected: `BOT_ACCESS_TOKEN`, `BOT_REFRESH_TOKEN`, `BOT_USERNAME` listed.

---

## Task 10: Integration test — bot end-to-end

- [ ] **Step 1: Deploy to Cloudflare Pages (or test locally with wrangler)**

```bash
npx wrangler pages dev . \
  --binding DATABASE_URL=<neon-url> \
  --binding JWT_SECRET=<secret> \
  --binding TWITCH_CLIENT_ID=<id> \
  --binding TWITCH_CLIENT_SECRET=<secret> \
  --binding BOT_ACCESS_TOKEN=<token> \
  --binding BOT_REFRESH_TOKEN=<token> \
  --binding BOT_USERNAME=<username>
```

- [ ] **Step 2: Test bot flow**

1. Open `http://localhost:8788/randomlocke.html`
2. Log in with your main Twitch account
3. Add a few routes (e.g. "Ruta 22", "Torre Pokémon")
4. Click "Activar bot" — status dot should turn green
5. In Twitch chat, type `!check Ruta 22` — bot should reply `✅ Ruta 22 ya fue atrapada`
6. Type `!check Ruta 1` — bot should reply `❌ Ruta 1 está libre`
7. Click "Desactivar bot" — status dot should return to gray
8. Reload page — if bot was active, status should reflect stored state

- [ ] **Step 3: Commit and push for deployment**

```bash
git push origin main
```

Cloudflare Pages auto-deploys on push. Navigate to `https://pokemon.mrklypp.com/randomlocke.html` to verify.

---

## Known limitations / future work

- Bot only active per-user session (active flag persists in DO storage, but DO can be evicted if Cloudflare cold-starts; alarm reconnects automatically within ~4 min)
- `!check` command messages are hardcoded in Spanish — add i18n to bot responses in a future iteration
- Nav button not added — add to `header.js` `pages` array when releasing publicly
- StreamCounters iframe: no error state if URL is invalid — a future quality-of-life improvement
