# Auth Guard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redirect unauthenticated users to `/login.html`, then return them to the original page after login.

**Architecture:** A Cloudflare Pages middleware (`functions/_middleware.js`) guards all requests server-side — public paths and assets pass through, everything else requires a valid `auth` JWT cookie. The `?next=` redirect path flows through a short-lived `login_next` cookie set by `login.js` and consumed by `callback.js`.

**Tech Stack:** Cloudflare Pages Functions (ES modules), existing `verifyJWT` / `parseCookies` / `setCookie` from `functions/api/_lib/`.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `functions/_middleware.js` | **Create** | JWT guard for all requests |
| `functions/api/auth/login.js` | **Modify** | Read `&next` param, set `login_next` cookie |
| `functions/api/auth/callback.js` | **Modify** | Read `login_next` cookie, redirect there, clear it |
| `login.html` | **Modify** | Rewrite button hrefs to carry `?next=` param |

No test framework exists in this project. Each task includes manual verification steps using `wrangler pages dev`.

---

## Task 1: Cloudflare Pages Middleware

**Files:**
- Create: `functions/_middleware.js`

- [ ] **Step 1: Create the middleware file**

```javascript
import { parseCookies } from './api/_lib/cookies.js';
import { verifyJWT } from './api/_lib/jwt.js';

const PUBLIC_EXTENSIONS = new Set([
  '.css', '.js', '.gif', '.png', '.svg', '.json',
  '.ico', '.webmanifest', '.txt',
]);

const PUBLIC_PATHS = new Set([
  '/login.html',
  '/types.html',
  '/overlay.html',
  '/badge-overlay.html',
  '/cemetery-overlay.html',
]);

const PUBLIC_PREFIXES = ['/api/auth/', '/sprites/'];

function isPublic(pathname) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) return true;
  const dot = pathname.lastIndexOf('.');
  if (dot !== -1 && PUBLIC_EXTENSIONS.has(pathname.slice(dot))) return true;
  return false;
}

export async function onRequest(context) {
  const url      = new URL(context.request.url);
  const pathname = url.pathname;

  if (isPublic(pathname)) return context.next();

  const cookies = parseCookies(context.request);
  const payload = await verifyJWT(cookies.auth, context.env.JWT_SECRET);

  if (payload) return context.next();

  const next = encodeURIComponent(pathname);
  return Response.redirect(
    `${url.protocol}//${url.host}/login.html?next=${next}`,
    302,
  );
}
```

- [ ] **Step 2: Manual smoke test — unauthenticated**

Start dev server:
```
npx wrangler pages dev . --binding ABLY_API_KEY=dummy --binding JWT_SECRET=testsecret
```

Open `http://localhost:8788/index.html` in browser (no cookies).
Expected: 302 redirect to `/login.html?next=%2Findex.html`.

- [ ] **Step 3: Manual smoke test — public paths pass through**

Open `http://localhost:8788/types.html` — should load normally (no redirect).
Open `http://localhost:8788/style.css` — should return CSS (no redirect).
Open `http://localhost:8788/login.html` — should load normally.

- [ ] **Step 4: Commit**

```
git add functions/_middleware.js
git commit -m "feat(auth): add CF pages middleware — redirect unauthenticated requests to login"
```

---

## Task 2: Capture `next` in login.js

**Files:**
- Modify: `functions/api/auth/login.js`

- [ ] **Step 1: Replace the return statement to support multi-header response and `login_next` cookie**

Current file ends with:
```javascript
  const isSecure   = url.protocol === 'https:';
  const stateCookie = setCookie('oauth_state', state, isSecure, { maxAge: 600 });

  return new Response(null, {
    status: 302,
    headers: { Location: `${cfg.authUrl}?${params}`, 'Set-Cookie': stateCookie },
  });
```

Replace with:
```javascript
  const isSecure    = url.protocol === 'https:';
  const stateCookie = setCookie('oauth_state', state, isSecure, { maxAge: 600 });

  const next        = url.searchParams.get('next') || '';
  const validNext   = next && next.startsWith('/') && !next.includes('://') && next.length <= 200;

  const headers = new Headers({ Location: `${cfg.authUrl}?${params}` });
  headers.append('Set-Cookie', stateCookie);
  if (validNext) {
    headers.append('Set-Cookie', setCookie('login_next', next, isSecure, { maxAge: 600 }));
  }

  return new Response(null, { status: 302, headers });
```

- [ ] **Step 2: Manual smoke test**

With dev server running, open:
`http://localhost:8788/api/auth/login?provider=twitch&next=/cemetery.html`

Expected: 302 to Twitch OAuth URL, response headers include two `Set-Cookie` lines — `oauth_state` and `login_next=/cemetery.html`.

Check via browser DevTools → Network → `login` request → Response Headers.

- [ ] **Step 3: Commit**

```
git add functions/api/auth/login.js
git commit -m "feat(auth): store login_next cookie to preserve redirect destination"
```

---

## Task 3: Redirect to `next` after successful login

**Files:**
- Modify: `functions/api/auth/callback.js`

- [ ] **Step 1: Read `login_next` cookie and redirect**

In `callback.js`, find the block near the end that builds the redirect response (around line 129–138):

```javascript
  const iat   = Math.floor(Date.now() / 1000);
  const exp   = iat + 7 * 24 * 3600;
  const token = await signJWT({ userId, tier, iat, exp }, context.env.JWT_SECRET);

  const isSecure = url.protocol === 'https:';
  const headers  = new Headers({ Location: `${url.protocol}//${url.host}/` });
  headers.append('Set-Cookie', setCookie('auth', token, isSecure, { maxAge: 7 * 24 * 3600 }));
  headers.append('Set-Cookie', setCookie('oauth_state', '', isSecure, { maxAge: 0 }));

  return new Response(null, { status: 302, headers });
```

Replace with:
```javascript
  const iat   = Math.floor(Date.now() / 1000);
  const exp   = iat + 7 * 24 * 3600;
  const token = await signJWT({ userId, tier, iat, exp }, context.env.JWT_SECRET);

  const isSecure  = url.protocol === 'https:';
  const loginNext = cookies.login_next || '';
  const validNext = loginNext && loginNext.startsWith('/') && !loginNext.includes('://') && loginNext.length <= 200;
  const dest      = validNext ? loginNext : '/';

  const headers = new Headers({ Location: `${url.protocol}//${url.host}${dest}` });
  headers.append('Set-Cookie', setCookie('auth',        token, isSecure, { maxAge: 7 * 24 * 3600 }));
  headers.append('Set-Cookie', setCookie('oauth_state', '',    isSecure, { maxAge: 0 }));
  headers.append('Set-Cookie', setCookie('login_next',  '',    isSecure, { maxAge: 0 }));

  return new Response(null, { status: 302, headers });
```

Note: `cookies` is already declared earlier in the function (line 49: `const cookies = parseCookies(context.request);`).

- [ ] **Step 2: Verify no name conflicts**

Confirm `cookies` is in scope at the point of the replacement. Check line 49 of `callback.js`:
```javascript
const cookies = parseCookies(context.request);
```
It is — no change needed elsewhere.

- [ ] **Step 3: Commit**

```
git add functions/api/auth/callback.js
git commit -m "feat(auth): redirect to login_next destination after successful OAuth login"
```

---

## Task 4: Pass `next` through login page buttons

**Files:**
- Modify: `login.html`

- [ ] **Step 1: Update the inline script at the bottom of login.html**

Current script (around line 72–79):
```javascript
const params = new URLSearchParams(location.search);
const err = params.get('error');
if (err) {
  const el = document.getElementById('login-error');
  el.textContent = `Error al iniciar sesión: ${err}`;
  el.style.display = '';
}
```

Replace with:
```javascript
const params = new URLSearchParams(location.search);

const err = params.get('error');
if (err) {
  const el = document.getElementById('login-error');
  el.textContent = `Error al iniciar sesión: ${err}`;
  el.style.display = '';
}

const next = params.get('next');
if (next && next.startsWith('/') && !next.includes('://') && next.length <= 200) {
  document.querySelectorAll('.login-btn').forEach(btn => {
    const u = new URL(btn.href, location.origin);
    u.searchParams.set('next', next);
    btn.href = u.toString();
  });
}
```

- [ ] **Step 2: Manual end-to-end test**

With dev server running and a real DB + OAuth credentials (or a mocked JWT cookie):

1. Open `http://localhost:8788/cemetery.html` with no `auth` cookie.
2. Should redirect to `/login.html?next=%2Fcemetery.html`.
3. On login.html, inspect the Twitch button href — should be `/api/auth/login?provider=twitch&next=%2Fcemetery.html`.
4. Complete OAuth flow (or manually set a valid `auth` cookie via DevTools).
5. After callback, should land on `/cemetery.html`.

- [ ] **Step 3: Test fallback — no `next` param**

Open `http://localhost:8788/login.html` directly (no `?next=`).
Button hrefs should remain `/api/auth/login?provider=twitch` (unchanged).
After login, should land on `/` (home).

- [ ] **Step 4: Commit**

```
git add login.html
git commit -m "feat(auth): pass next param through login buttons for post-login redirect"
```
