# Auth + Tiers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Twitch and Google OAuth login, persist users in Neon PostgreSQL, and enable manual Guest/VIP tier assignment via API endpoint and admin panel.

**Architecture:** Cloudflare Pages Functions handle the full OAuth server-side flow (login redirect → callback → JWT cookie). A shared `functions/api/_lib/` folder provides JWT signing, DB access, and cookie helpers. The frontend fetches `/api/auth/me` on each page load to render the user widget in the header. Admin tier assignment is secured by `X-Admin-Key` header.

**Tech Stack:** `@neondatabase/serverless` (HTTP mode, no TCP), `crypto.subtle` HMAC-SHA256 JWT (native in Workers), Cloudflare Pages Functions (ES modules), Neon PostgreSQL.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `package.json` | npm deps |
| Create | `db/schema.sql` | Neon migration reference |
| Create | `functions/api/_lib/jwt.js` | Sign/verify JWT |
| Create | `functions/api/_lib/db.js` | Neon SQL helper |
| Create | `functions/api/_lib/cookies.js` | Parse/set cookies |
| Create | `functions/api/auth/login.js` | OAuth redirect |
| Create | `functions/api/auth/callback.js` | Exchange code, create session |
| Create | `functions/api/auth/logout.js` | Clear auth cookie |
| Create | `functions/api/auth/me.js` | Return current user |
| Create | `functions/api/admin/set-tier.js` | Update user tier |
| Create | `functions/api/admin/users.js` | Search users |
| Create | `login.html` | Login page |
| Modify | `header.js` | Add user widget |
| Modify | `style.css` | User widget styles |
| Create | `admin.html` | Admin panel |

---

### Task 1: Project setup + DB schema

**Files:**
- Create: `package.json`
- Create: `db/schema.sql`
- Modify: `.gitignore`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "pokemon-team-visualizer",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@neondatabase/serverless": "^0.10.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`

Expected: `node_modules/@neondatabase/` created, `package-lock.json` generated.

- [ ] **Step 3: Add `.dev.vars` and `node_modules` to `.gitignore`**

Append to `.gitignore`:
```
.dev.vars
node_modules/
```

- [ ] **Step 4: Create `.dev.vars` with your secrets**

Create `.dev.vars` (never commit this):
```
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret_base64
ADMIN_KEY=your_admin_key
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname
```

Generate secrets:
```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# ADMIN_KEY
node -e "console.log(require('crypto').randomBytes(24).toString('base64'))"
```

- [ ] **Step 5: Create `db/schema.sql`**

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider     TEXT NOT NULL,
  provider_id  TEXT NOT NULL,
  username     TEXT,
  email        TEXT,
  avatar_url   TEXT,
  tier         TEXT NOT NULL DEFAULT 'guest',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);
```

- [ ] **Step 6: Apply schema in Neon console**

Open your Neon project → SQL Editor → paste and run `db/schema.sql`.

Expected: No errors. `\d users` shows 8 columns.

- [ ] **Step 7: Register OAuth apps**

**Twitch:** https://dev.twitch.tv/console/apps → Register Your Application
- OAuth Redirect URL: `https://pokemon.mrklypp.com/api/auth/callback`
- Also add: `http://localhost:8788/api/auth/callback` (for local dev)
- Copy Client ID and generate Client Secret → add to `.dev.vars` and Cloudflare Pages env vars

**Google:** https://console.cloud.google.com → APIs & Services → Credentials → Create OAuth 2.0 Client ID
- Application type: Web application
- Authorized redirect URIs: `https://pokemon.mrklypp.com/api/auth/callback`
- Also add: `http://localhost:8788/api/auth/callback`
- Copy Client ID and Client Secret → add to `.dev.vars` and Cloudflare Pages env vars

**Cloudflare Pages:** Settings → Environment variables → add all 7 variables from `.dev.vars`.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json db/schema.sql .gitignore
git commit -m "chore: npm deps, Neon schema, gitignore for auth"
```

---

### Task 2: Shared libraries

**Files:**
- Create: `functions/api/_lib/jwt.js`
- Create: `functions/api/_lib/db.js`
- Create: `functions/api/_lib/cookies.js`

Files in `_lib/` are not exposed as routes (Cloudflare Pages ignores underscore-prefixed paths).

- [ ] **Step 1: Create `functions/api/_lib/jwt.js`**

```javascript
const ENC = new TextEncoder();

function b64url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function decodeB64url(str) {
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
}

async function getKey(secret, usage) {
  return crypto.subtle.importKey(
    'raw', ENC.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, [usage]
  );
}

export async function signJWT(payload, secret) {
  const header   = b64url(ENC.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body     = b64url(ENC.encode(JSON.stringify(payload)));
  const unsigned = `${header}.${body}`;
  const key      = await getKey(secret, 'sign');
  const sig      = await crypto.subtle.sign('HMAC', key, ENC.encode(unsigned));
  return `${unsigned}.${b64url(sig)}`;
}

export async function verifyJWT(token, secret) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const unsigned = `${header}.${body}`;
  const key      = await getKey(secret, 'verify');
  const sigBytes = Uint8Array.from(decodeB64url(sig), c => c.charCodeAt(0));
  const valid    = await crypto.subtle.verify('HMAC', key, sigBytes, ENC.encode(unsigned));
  if (!valid) return null;
  const payload  = JSON.parse(decodeB64url(body));
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}
```

- [ ] **Step 2: Create `functions/api/_lib/db.js`**

```javascript
import { neon } from '@neondatabase/serverless';

export function getDB(env) {
  return neon(env.DATABASE_URL);
}
```

`neon(connectionString)` returns a tagged template function. Usage: `` await sql`SELECT * FROM users WHERE id = ${id}` ``. Parameters are always safely escaped.

- [ ] **Step 3: Create `functions/api/_lib/cookies.js`**

```javascript
export function parseCookies(req) {
  const cookies = {};
  const header  = req.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const name     = part.slice(0, eq).trim();
    cookies[name]  = decodeURIComponent(part.slice(eq + 1).trim());
  }
  return cookies;
}

export function setCookie(name, value, isSecure, opts = {}) {
  let str = `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax`;
  if (isSecure) str += '; Secure';
  if (opts.maxAge != null) str += `; Max-Age=${opts.maxAge}`;
  return str;
}
```

`isSecure` should be `url.protocol === 'https:'` from the request. Secure flag is omitted on local HTTP dev so cookies still work during testing.

- [ ] **Step 4: Commit**

```bash
git add functions/api/_lib/jwt.js functions/api/_lib/db.js functions/api/_lib/cookies.js
git commit -m "feat(auth): add JWT, DB, and cookie shared utilities"
```

---

### Task 3: Login endpoint

**Files:**
- Create: `functions/api/auth/login.js`

- [ ] **Step 1: Create `functions/api/auth/login.js`**

```javascript
import { setCookie } from '../_lib/cookies.js';

const PROVIDERS = {
  twitch: {
    authUrl: 'https://id.twitch.tv/oauth2/authorize',
    scope:   'user:read:email',
  },
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope:   'openid email profile',
  },
};

export async function onRequestGet(context) {
  const url      = new URL(context.request.url);
  const provider = url.searchParams.get('provider');

  if (!PROVIDERS[provider]) {
    return new Response('Invalid provider', { status: 400 });
  }

  const cfg       = PROVIDERS[provider];
  const clientId  = provider === 'twitch' ? context.env.TWITCH_CLIENT_ID : context.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${url.protocol}//${url.host}/api/auth/callback`;

  // CSRF state encodes provider so the callback knows which provider to use
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  const randomHex   = Array.from(randomBytes, b => b.toString(16).padStart(2, '0')).join('');
  const state       = `${provider}:${randomHex}`;

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    scope:         cfg.scope,
    state,
    response_type: 'code',
  });

  if (provider === 'google') {
    params.set('access_type', 'offline');
    params.set('prompt', 'select_account');
  }

  const isSecure   = url.protocol === 'https:';
  const stateCookie = setCookie('oauth_state', state, isSecure, { maxAge: 600 });

  return new Response(null, {
    status: 302,
    headers: { Location: `${cfg.authUrl}?${params}`, 'Set-Cookie': stateCookie },
  });
}
```

- [ ] **Step 2: Test manually**

Run: `npx wrangler pages dev . --binding ABLY_API_KEY=placeholder`

Navigate to: `http://localhost:8788/api/auth/login?provider=twitch`

Expected: Redirect to `https://id.twitch.tv/oauth2/authorize?client_id=...&state=twitch:...`. Response sets `oauth_state` cookie.

Navigate to: `http://localhost:8788/api/auth/login?provider=google`

Expected: Redirect to `https://accounts.google.com/o/oauth2/v2/auth?...&state=google:...`.

Navigate to: `http://localhost:8788/api/auth/login?provider=discord`

Expected: 400 response.

- [ ] **Step 3: Commit**

```bash
git add functions/api/auth/login.js
git commit -m "feat(auth): add OAuth login redirect endpoint"
```

---

### Task 4: Callback endpoint

**Files:**
- Create: `functions/api/auth/callback.js`

- [ ] **Step 1: Create `functions/api/auth/callback.js`**

```javascript
import { parseCookies, setCookie } from '../_lib/cookies.js';
import { signJWT } from '../_lib/jwt.js';
import { getDB } from '../_lib/db.js';

const TOKEN_URLS = {
  twitch: 'https://id.twitch.tv/oauth2/token',
  google: 'https://oauth2.googleapis.com/token',
};

async function fetchProfile(provider, accessToken, clientId) {
  if (provider === 'twitch') {
    const res      = await fetch('https://api.twitch.tv/helix/users', {
      headers: { Authorization: `Bearer ${accessToken}`, 'Client-Id': clientId },
    });
    const { data } = await res.json();
    const u = data[0];
    return {
      providerId: u.id,
      username:   u.login,
      email:      u.email || null,
      avatarUrl:  u.profile_image_url,
    };
  }
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const u = await res.json();
  return {
    providerId: u.sub,
    username:   u.name || u.email,
    email:      u.email || null,
    avatarUrl:  u.picture || null,
  };
}

export async function onRequestGet(context) {
  const url   = new URL(context.request.url);
  const code  = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    return Response.redirect(`${url.protocol}//${url.host}/login.html?error=${encodeURIComponent(error)}`, 302);
  }

  const cookies = parseCookies(context.request);
  if (!state || state !== cookies.oauth_state) {
    return new Response('Invalid state — possible CSRF attack. Please try logging in again.', { status: 403 });
  }

  const [provider] = state.split(':');
  if (!['twitch', 'google'].includes(provider)) {
    return new Response('Invalid provider', { status: 400 });
  }

  const clientId     = provider === 'twitch' ? context.env.TWITCH_CLIENT_ID     : context.env.GOOGLE_CLIENT_ID;
  const clientSecret = provider === 'twitch' ? context.env.TWITCH_CLIENT_SECRET  : context.env.GOOGLE_CLIENT_SECRET;
  const redirectUri  = `${url.protocol}//${url.host}/api/auth/callback`;

  const tokenRes = await fetch(TOKEN_URLS[provider], {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      grant_type:    'authorization_code',
      client_id:     clientId,
      client_secret: clientSecret,
      code,
      redirect_uri:  redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    const txt = await tokenRes.text();
    return new Response(`Token exchange failed: ${txt}`, { status: 502 });
  }

  const { access_token } = await tokenRes.json();
  const profile = await fetchProfile(provider, access_token, clientId);

  const sql  = getDB(context.env);
  const rows = await sql`
    INSERT INTO users (provider, provider_id, username, email, avatar_url)
    VALUES (${provider}, ${profile.providerId}, ${profile.username}, ${profile.email}, ${profile.avatarUrl})
    ON CONFLICT (provider, provider_id)
    DO UPDATE SET
      username   = EXCLUDED.username,
      email      = EXCLUDED.email,
      avatar_url = EXCLUDED.avatar_url
    RETURNING id, tier
  `;

  const { id: userId, tier } = rows[0];
  const iat   = Math.floor(Date.now() / 1000);
  const exp   = iat + 7 * 24 * 3600;
  const token = await signJWT({ userId, tier, iat, exp }, context.env.JWT_SECRET);

  const isSecure = url.protocol === 'https:';
  const headers  = new Headers({ Location: `${url.protocol}//${url.host}/` });
  headers.append('Set-Cookie', setCookie('auth', token, isSecure, { maxAge: 7 * 24 * 3600 }));
  headers.append('Set-Cookie', setCookie('oauth_state', '', isSecure, { maxAge: 0 }));

  return new Response(null, { status: 302, headers });
}
```

- [ ] **Step 2: Test (requires real OAuth credentials in `.dev.vars`)**

Run: `npx wrangler pages dev .`

Navigate to `http://localhost:8788/api/auth/login?provider=twitch` and complete the Twitch OAuth flow.

Expected:
- Provider redirects to `http://localhost:8788/api/auth/callback?code=...&state=twitch:...`
- Response sets `auth` cookie (a JWT) and redirects to `/`
- In Neon console: `SELECT id, username, provider, tier FROM users;` shows new row with `tier = 'guest'`

Test error path: Navigate directly to `http://localhost:8788/api/auth/callback?error=access_denied`

Expected: Redirect to `/login.html?error=access_denied`

- [ ] **Step 3: Commit**

```bash
git add functions/api/auth/callback.js
git commit -m "feat(auth): add OAuth callback — upsert user, issue JWT cookie"
```

---

### Task 5: Logout + Me endpoints

**Files:**
- Create: `functions/api/auth/logout.js`
- Create: `functions/api/auth/me.js`

- [ ] **Step 1: Create `functions/api/auth/logout.js`**

```javascript
import { setCookie } from '../_lib/cookies.js';

export async function onRequestGet(context) {
  const url      = new URL(context.request.url);
  const isSecure = url.protocol === 'https:';
  return new Response(null, {
    status: 302,
    headers: {
      Location:   `${url.protocol}//${url.host}/`,
      'Set-Cookie': setCookie('auth', '', isSecure, { maxAge: 0 }),
    },
  });
}
```

- [ ] **Step 2: Create `functions/api/auth/me.js`**

```javascript
import { parseCookies } from '../_lib/cookies.js';
import { verifyJWT } from '../_lib/jwt.js';
import { getDB } from '../_lib/db.js';

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

  const sql  = getDB(context.env);
  const rows = await sql`
    SELECT username, avatar_url, tier FROM users WHERE id = ${payload.userId}
  `;

  if (!rows.length) return json({ error: 'User not found' }, 401);

  const { username, avatar_url, tier } = rows[0];
  return json({ username, avatarUrl: avatar_url, tier });
}
```

- [ ] **Step 3: Test**

After completing OAuth (Task 4) — you have an `auth` cookie in the browser.

Test `/api/auth/me` with valid session:
```bash
# Copy auth cookie value from DevTools → Application → Cookies
curl -H "Cookie: auth=<token>" http://localhost:8788/api/auth/me
```
Expected: `{"username":"youruser","avatarUrl":"https://...","tier":"guest"}`

Test `/api/auth/me` without session:
```bash
curl http://localhost:8788/api/auth/me
```
Expected: 401 `{"error":"Unauthorized"}`

Test logout:
Navigate to `http://localhost:8788/api/auth/logout`
Expected: Redirects to `/`. Check DevTools — `auth` cookie is gone (or has `Max-Age=0`).

Test `/api/auth/me` after logout:
```bash
curl http://localhost:8788/api/auth/me
```
Expected: 401 `{"error":"Unauthorized"}`

- [ ] **Step 4: Commit**

```bash
git add functions/api/auth/logout.js functions/api/auth/me.js
git commit -m "feat(auth): add logout and /me endpoints"
```

---

### Task 6: Admin endpoints

**Files:**
- Create: `functions/api/admin/set-tier.js`
- Create: `functions/api/admin/users.js`

- [ ] **Step 1: Create `functions/api/admin/set-tier.js`**

```javascript
import { getDB } from '../_lib/db.js';

const VALID_TIERS = ['guest', 'vip'];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const adminKey = context.request.headers.get('X-Admin-Key');
  if (!adminKey || adminKey !== context.env.ADMIN_KEY) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let body;
  try   { body = await context.request.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const { userId, tier } = body;
  if (!userId || !VALID_TIERS.includes(tier)) {
    return json({ error: 'Invalid userId or tier. tier must be one of: guest, vip' }, 400);
  }

  const sql  = getDB(context.env);
  const rows = await sql`
    UPDATE users SET tier = ${tier} WHERE id = ${userId}
    RETURNING id, username, tier
  `;

  if (!rows.length) return json({ error: 'User not found' }, 404);

  return json({ ok: true, username: rows[0].username, tier: rows[0].tier });
}
```

- [ ] **Step 2: Create `functions/api/admin/users.js`**

```javascript
import { getDB } from '../_lib/db.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestGet(context) {
  const adminKey = context.request.headers.get('X-Admin-Key');
  if (!adminKey || adminKey !== context.env.ADMIN_KEY) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const url = new URL(context.request.url);
  const q   = url.searchParams.get('q')?.trim();
  if (!q) return json({ error: 'Missing q param' }, 400);

  const sql  = getDB(context.env);
  const rows = await sql`
    SELECT id, provider, username, email, avatar_url, tier, created_at
    FROM users
    WHERE username ILIKE ${'%' + q + '%'} OR email ILIKE ${'%' + q + '%'}
    ORDER BY created_at DESC
    LIMIT 10
  `;

  return json({ users: rows });
}
```

- [ ] **Step 3: Test**

Get a user UUID from Neon console: `SELECT id, username FROM users;`

Test set-tier:
```bash
curl -X POST http://localhost:8788/api/admin/set-tier \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: your_admin_key_from_dev_vars" \
  -d '{"userId":"<uuid-from-neon>","tier":"vip"}'
```
Expected: `{"ok":true,"username":"youruser","tier":"vip"}`

Verify in Neon: `SELECT username, tier FROM users WHERE username = 'youruser';` → `vip`

Test with invalid tier:
```bash
curl -X POST http://localhost:8788/api/admin/set-tier \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: your_admin_key_from_dev_vars" \
  -d '{"userId":"<uuid>","tier":"premium"}'
```
Expected: 400 `{"error":"Invalid userId or tier..."}`

Test wrong admin key:
```bash
curl -X POST http://localhost:8788/api/admin/set-tier \
  -H "X-Admin-Key: wrongkey" \
  -H "Content-Type: application/json" \
  -d '{"userId":"<uuid>","tier":"vip"}'
```
Expected: 401 `{"error":"Unauthorized"}`

Test user search:
```bash
curl "http://localhost:8788/api/admin/users?q=youruser" \
  -H "X-Admin-Key: your_admin_key_from_dev_vars"
```
Expected: `{"users":[{"id":"...","username":"youruser","tier":"vip","provider":"twitch",...}]}`

- [ ] **Step 4: Commit**

```bash
git add functions/api/admin/set-tier.js functions/api/admin/users.js
git commit -m "feat(admin): add set-tier and user search endpoints"
```

---

### Task 7: login.html

**Files:**
- Create: `login.html`

- [ ] **Step 1: Create `login.html`**

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Login — Pokémon Stream Visualizer</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='white'/><path d='M2,16 A14,14 0 0,1 30,16 Z' fill='%23EE1515'/><circle cx='16' cy='16' r='14' fill='none' stroke='%231a1a1a' stroke-width='2'/><line x1='2' y1='16' x2='30' y2='16' stroke='%231a1a1a' stroke-width='2'/><circle cx='16' cy='16' r='5' fill='%231a1a1a'/><circle cx='16' cy='16' r='3' fill='white'/></svg>">
<link rel="stylesheet" href="style.css">
<style>
.login-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 55vh;
  gap: 1.5rem;
  text-align: center;
}
.login-subtitle { font-size: 0.85rem; color: var(--text-2); }
.login-btns     { display: flex; flex-direction: column; gap: 0.75rem; width: 100%; max-width: 280px; }
.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid var(--border);
  cursor: pointer;
  text-decoration: none;
  background: var(--surface);
  color: var(--text);
  transition: opacity 0.15s, box-shadow 0.15s, border-color 0.15s;
}
.login-btn:hover { opacity: 0.9; }
.login-btn--twitch { border-color: rgba(145,71,255,0.4); }
.login-btn--twitch:hover { box-shadow: 0 0 16px rgba(145,71,255,0.25); }
.login-btn--google:hover  { box-shadow: 0 0 14px rgba(255,255,255,0.08); }
.login-error { color: var(--error); font-size: 0.85rem; }
</style>
</head>
<body>
<script>const ACTIVE_PAGE = '';</script>
<script src="header.js"></script>
<div class="login-wrap">
  <div>
    <p class="login-subtitle">Inicia sesión para acceder a todas las funciones</p>
  </div>
  <div class="login-btns">
    <a href="/api/auth/login?provider=twitch" class="login-btn login-btn--twitch">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="color:#9147FF">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
      </svg>
      Conectar con Twitch
    </a>
    <a href="/api/auth/login?provider=google" class="login-btn login-btn--google">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Conectar con Google
    </a>
  </div>
  <div id="login-error" class="login-error" style="display:none"></div>
</div>
<script>
const params = new URLSearchParams(location.search);
const err = params.get('error');
if (err) {
  const el = document.getElementById('login-error');
  el.textContent = `Error al iniciar sesión: ${err}`;
  el.style.display = '';
}
</script>
</body>
</html>
```

- [ ] **Step 2: Test**

Navigate to `http://localhost:8788/login.html`

Expected: Page renders with Twitch and Google buttons using existing dark theme. Clicking Twitch redirects to `https://id.twitch.tv/oauth2/authorize?...`.

Navigate to `http://localhost:8788/login.html?error=access_denied`

Expected: Error message appears below buttons.

- [ ] **Step 3: Commit**

```bash
git add login.html
git commit -m "feat(auth): add login.html with Twitch + Google buttons"
```

---

### Task 8: User widget in header

**Files:**
- Modify: `header.js`
- Modify: `style.css`

- [ ] **Step 1: Add user widget CSS to `style.css`**

Add after the `.mode-btn.active { ... }` block (after line 667):

```css
/* ── User widget ─────────────────────────────────────────────── */
.user-widget {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
}
.user-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid var(--border);
    flex-shrink: 0;
}
.user-name {
    color: var(--text);
    font-weight: 600;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.user-badge {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 2px 7px;
    border-radius: 100px;
    border: 1px solid;
    flex-shrink: 0;
}
.user-badge--guest {
    background: rgba(255,255,255,0.05);
    color: var(--text-2);
    border-color: var(--border);
}
.user-badge--vip {
    background: rgba(255,86,180,0.15);
    color: var(--accent);
    border-color: rgba(255,86,180,0.35);
}
.user-logout,
.user-login-link {
    font-size: 12px;
    color: var(--text-2);
    text-decoration: none;
    padding: 3px 8px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface-2);
    transition: color 0.15s, border-color 0.15s;
    cursor: pointer;
    white-space: nowrap;
}
.user-logout:hover,
.user-login-link:hover {
    color: var(--text);
    border-color: rgba(0, 204, 255, 0.3);
}
```

- [ ] **Step 2: Update `header.js`**

Replace the full contents of `header.js` with:

```javascript
(function () {
    const icons = {
        pokemon:  '<svg class="mode-btn-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M3 12h5.5M15.5 12H21" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/></svg>',
        cemetery: '<svg class="mode-btn-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 21V10a6 6 0 0 1 12 0v11" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 7v5M9.5 9.5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 21h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
        badges:   '<svg class="mode-btn-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="9" r="6" stroke="currentColor" stroke-width="1.8"/><path d="M9 14.5 7.5 21l4.5-2.5L16.5 21 15 14.5" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
        types:    '<svg class="mode-btn-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.8"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.8"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.8"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.8"/></svg>',
    };

    const pages = [
        { id: 'pokemon',  href: 'index.html',    i18n: 'pokemonMode',  label: 'Pokémon' },
        { id: 'cemetery', href: 'cemetery.html', i18n: 'cemeteryMode', label: 'Cementerio' },
        { id: 'badges',   href: 'badges.html',   i18n: 'badgeMode',    label: 'Medallas' },
        { id: 'types',    href: 'types.html',    i18n: 'typesMode',    label: 'Tabla de tipos' },
    ];

    const tabs = pages.map(p =>
        `<a href="${p.href}" id="mode-btn-${p.id}" class="mode-btn${ACTIVE_PAGE === p.id ? ' active' : ''}" aria-label="${p.label}">${icons[p.id] || ''}<span class="mode-btn-text" data-i18n-badge="${p.i18n}">${p.label}</span></a>`
    ).join('\n            ');

    document.addEventListener('DOMContentLoaded', () => {
        document.body.insertAdjacentHTML('beforeend', `
<footer class="site-footer">
    <a href="https://mrklypp.com/" target="_blank" rel="noopener" data-i18n="madeBy">Hecho por @MrKlypp</a>
</footer>`);
        initUserWidget();
    });

    document.body.insertAdjacentHTML('afterbegin', `
<header>
    <h1>Pokémon Stream Visualizer</h1>
    <p class="subtitle">La herramienta definitiva para gestionar tu overlay de pokémon</p>
    <p class="header-error">Si encuentras algún error, <a href="mailto:MrKlypp@gmail.com">escríbeme</a>.</p>
    <div class="header-controls-row">
        <div class="mode-toggle">
            ${tabs}
        </div>
        <div class="lang-toggle">
            <button id="lang-es" onclick="setLang('es')">ES</button>
            <button id="lang-en" onclick="setLang('en')">EN</button>
        </div>
        <div class="user-widget" id="user-widget"></div>
    </div>
</header>`);
})();

function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function initUserWidget() {
    const el = document.getElementById('user-widget');
    if (!el) return;
    try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
            const { username, avatarUrl, tier } = await res.json();
            const badgeClass = tier === 'vip' ? 'user-badge--vip' : 'user-badge--guest';
            const badgeLabel = tier === 'vip' ? 'VIP' : 'GUEST';
            el.innerHTML =
                (avatarUrl ? `<img class="user-avatar" src="${esc(avatarUrl)}" alt="${esc(username)}">` : '') +
                `<span class="user-name">${esc(username)}</span>` +
                `<span class="user-badge ${badgeClass}">${badgeLabel}</span>` +
                `<a href="/api/auth/logout" class="user-logout">Salir</a>`;
        } else {
            el.innerHTML = `<a href="/login.html" class="user-login-link">Login</a>`;
        }
    } catch {
        el.innerHTML = `<a href="/login.html" class="user-login-link">Login</a>`;
    }
}

function exitExternalMode() {
    sessionStorage.removeItem('ptv_external_id');
    sessionStorage.removeItem('ptv_external_badge_id');
    window.location.href = 'index.html';
}
```

- [ ] **Step 3: Test**

Navigate to `http://localhost:8788/` while logged in (auth cookie present).

Expected: Header shows user avatar, username, tier badge (GUEST in grey), and "Salir" link.

Navigate to `http://localhost:8788/` while logged out (no auth cookie).

Expected: Header shows "Login" link that goes to `/login.html`.

Test VIP badge: Use curl to set tier to vip (Task 6), then reload.

Expected: Badge shows "VIP" in pink (`var(--accent)` color).

- [ ] **Step 4: Commit**

```bash
git add header.js style.css
git commit -m "feat(auth): add user widget to header (avatar, username, tier badge)"
```

---

### Task 9: admin.html

**Files:**
- Create: `admin.html`

- [ ] **Step 1: Create `admin.html`**

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin — Pokémon Stream Visualizer</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='white'/><path d='M2,16 A14,14 0 0,1 30,16 Z' fill='%23EE1515'/><circle cx='16' cy='16' r='14' fill='none' stroke='%231a1a1a' stroke-width='2'/><line x1='2' y1='16' x2='30' y2='16' stroke='%231a1a1a' stroke-width='2'/><circle cx='16' cy='16' r='5' fill='%231a1a1a'/><circle cx='16' cy='16' r='3' fill='white'/></svg>">
<link rel="stylesheet" href="style.css">
<style>
#admin-app { width: 100%; max-width: 680px; }
.admin-section { display: flex; flex-direction: column; gap: 0.75rem; }
.admin-row     { display: flex; gap: 0.5rem; align-items: center; }
.admin-label   { font-size: 0.75rem; color: var(--text-2); margin-bottom: 0.25rem; }
.admin-input {
  flex: 1;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.45rem 0.75rem;
  color: var(--text);
  font-family: inherit;
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.15s;
}
.admin-input:focus { border-color: rgba(0,204,255,0.4); }
.admin-btn {
  padding: 0.45rem 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s, background 0.15s;
}
.admin-btn:hover { border-color: rgba(0,204,255,0.3); background: var(--btn-hover); }
.admin-btn--primary { background: rgba(0,204,255,0.15); border-color: rgba(0,204,255,0.35); color: var(--cyan); }
.admin-btn--primary:hover { background: rgba(0,204,255,0.22); }
.admin-divider { border: none; border-top: 1px solid var(--border); margin: 0.5rem 0; }
.user-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
}
.user-row img { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.user-row-info { flex: 1; min-width: 0; }
.user-row-name  { font-weight: 700; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.user-row-meta  { color: var(--text-2); font-size: 0.75rem; margin-top: 1px; }
.user-row-actions { display: flex; gap: 0.5rem; align-items: center; flex-shrink: 0; }
.tier-select {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-family: inherit;
  font-size: 0.8rem;
  padding: 0.3rem 0.5rem;
  cursor: pointer;
}
.status-msg { font-size: 0.78rem; min-height: 1.1em; }
.status-msg.ok  { color: var(--success); }
.status-msg.err { color: var(--error); }
#search-results { display: flex; flex-direction: column; gap: 0.5rem; }
</style>
</head>
<body>
<script>const ACTIVE_PAGE = '';</script>
<script src="header.js"></script>
<div id="admin-app">

<div class="card">
  <div class="admin-section">
    <div>
      <div class="admin-label">Admin Key</div>
      <div class="admin-row">
        <input type="password" id="admin-key-input" class="admin-input" placeholder="X-Admin-Key" autocomplete="off">
        <button class="admin-btn admin-btn--primary" onclick="saveKey()">Guardar</button>
      </div>
      <div id="key-status" class="status-msg" style="margin-top:4px"></div>
    </div>
  </div>
</div>

<div class="card">
  <div class="admin-section">
    <div>
      <div class="admin-label">Buscar usuario</div>
      <div class="admin-row">
        <input type="text" id="search-input" class="admin-input" placeholder="username o email" onkeydown="if(event.key==='Enter')search()">
        <button class="admin-btn" onclick="search()">Buscar</button>
      </div>
    </div>
    <div id="search-status" class="status-msg"></div>
    <div id="search-results"></div>
  </div>
</div>

</div>
<script>
const TIERS = ['guest', 'vip'];

function getKey() {
  return sessionStorage.getItem('ptv_admin_key') || '';
}

function saveKey() {
  const val = document.getElementById('admin-key-input').value.trim();
  if (!val) return;
  sessionStorage.setItem('ptv_admin_key', val);
  document.getElementById('key-status').textContent = 'Guardada en sesión.';
  document.getElementById('key-status').className = 'status-msg ok';
}

async function search() {
  const q   = document.getElementById('search-input').value.trim();
  const key = getKey();
  const statusEl  = document.getElementById('search-status');
  const resultsEl = document.getElementById('search-results');

  if (!key) { statusEl.textContent = 'Falta Admin Key.'; statusEl.className = 'status-msg err'; return; }
  if (!q)   { statusEl.textContent = 'Escribe un nombre o email.'; statusEl.className = 'status-msg err'; return; }

  statusEl.textContent = 'Buscando...';
  statusEl.className   = 'status-msg';
  resultsEl.innerHTML  = '';

  const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`, {
    headers: { 'X-Admin-Key': key },
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: res.statusText }));
    statusEl.textContent = `Error: ${error}`;
    statusEl.className   = 'status-msg err';
    return;
  }

  const { users } = await res.json();
  if (!users.length) {
    statusEl.textContent = 'Sin resultados.';
    statusEl.className   = 'status-msg';
    return;
  }

  statusEl.textContent = `${users.length} usuario(s) encontrado(s).`;
  statusEl.className   = 'status-msg ok';
  resultsEl.innerHTML  = users.map(u => renderUserRow(u)).join('');
}

function renderUserRow(u) {
  const img = u.avatar_url
    ? `<img src="${esc(u.avatar_url)}" alt="${esc(u.username)}">`
    : `<div style="width:32px;height:32px;border-radius:50%;background:var(--surface);flex-shrink:0"></div>`;
  const opts = TIERS.map(t => `<option value="${t}"${u.tier === t ? ' selected' : ''}>${t.toUpperCase()}</option>`).join('');
  return `
<div class="user-row" id="row-${esc(u.id)}">
  ${img}
  <div class="user-row-info">
    <div class="user-row-name">${esc(u.username || '—')}</div>
    <div class="user-row-meta">${esc(u.provider)} · ${esc(u.email || 'sin email')} · <span id="status-${esc(u.id)}" class="status-msg"></span></div>
  </div>
  <div class="user-row-actions">
    <select class="tier-select" id="tier-${esc(u.id)}">${opts}</select>
    <button class="admin-btn admin-btn--primary" onclick="setTier('${esc(u.id)}')">Guardar</button>
  </div>
</div>`;
}

async function setTier(userId) {
  const key      = getKey();
  const tier     = document.getElementById(`tier-${userId}`).value;
  const statusEl = document.getElementById(`status-${userId}`);

  if (!key) { statusEl.textContent = 'Sin Admin Key.'; statusEl.className = 'status-msg err'; return; }

  statusEl.textContent = '...';
  statusEl.className   = 'status-msg';

  const res = await fetch('/api/admin/set-tier', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Key': key },
    body:    JSON.stringify({ userId, tier }),
  });

  const data = await res.json().catch(() => ({}));
  if (res.ok) {
    statusEl.textContent = `✓ ${data.tier}`;
    statusEl.className   = 'status-msg ok';
  } else {
    statusEl.textContent = `Error: ${data.error || res.statusText}`;
    statusEl.className   = 'status-msg err';
  }
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Restore saved key on load
window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('ptv_admin_key');
  if (saved) {
    document.getElementById('admin-key-input').value = saved;
    document.getElementById('key-status').textContent = 'Key cargada de sesión.';
    document.getElementById('key-status').className   = 'status-msg ok';
  }
});
</script>
</body>
</html>
```

- [ ] **Step 2: Test**

Navigate to `http://localhost:8788/admin.html`

Expected: Page renders with "Admin Key" and "Buscar usuario" sections.

Enter your `ADMIN_KEY` from `.dev.vars` and click Guardar. Expected: "Guardada en sesión."

Search for your Twitch username. Expected: User row appears with avatar, username, provider, current tier, and tier dropdown.

Change tier to `vip` and click Guardar. Expected: Status shows "✓ vip".

Reload the page, re-enter admin key, search again. Expected: User now shows `VIP` in the dropdown.

- [ ] **Step 3: Commit**

```bash
git add admin.html
git commit -m "feat(admin): add admin panel for user tier management"
```

---

## Post-implementation checklist

- [ ] Deploy to Cloudflare Pages: `git push origin main`
- [ ] Verify all 7 env vars are set in Cloudflare Pages dashboard
- [ ] Test full OAuth flow on production (`https://pokemon.mrklypp.com`)
- [ ] Confirm redirect URIs registered in Twitch + Google match production URL exactly
- [ ] Verify user row appears in Neon after login
- [ ] Test VIP badge on production via admin panel
