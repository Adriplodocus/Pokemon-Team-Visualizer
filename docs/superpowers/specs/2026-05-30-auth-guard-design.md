# Auth Guard — Design Spec

**Date:** 2026-05-30  
**Status:** Approved

## Goal

Force login on all tool pages. Unauthenticated users are redirected to `/login.html`. Any authenticated user (any tier) gets full access. After login, users land on the page they originally tried to visit.

---

## Public vs Protected

### Always public (no JWT required)

| Path | Reason |
|---|---|
| `/login.html` | Entry point |
| `/types.html` | Informational, no user data |
| `/overlay.html` | Consumed by OBS without session |
| `/badge-overlay.html` | Same |
| `/cemetery-overlay.html` | Same |
| `/api/auth/*` | Login, logout, callback, me |
| Static assets | `.css`, `.js`, `.gif`, `.png`, `.svg`, `.json`, `.ico`, `.webmanifest`, `.txt` |
| `/sprites/*` | Asset prefix |

### Protected (requires valid JWT cookie `auth`)

All other `.html` pages: `index.html`, `cemetery.html`, `badges.html`, `admin.html`.

---

## Architecture

### New file: `functions/_middleware.js`

Cloudflare Pages middleware — runs before every request including static file serving.

**Logic:**

```
1. Extract pathname from request URL
2. Is path public? → next()
3. Read `auth` cookie → verifyJWT(token, env.JWT_SECRET)
4. Valid payload → next()
5. Invalid/missing → 302 redirect to /login.html?next=<pathname>
```

**Public path check order:**
1. Extension allowlist: ends with `.css`, `.js`, `.gif`, `.png`, `.svg`, `.json`, `.ico`, `.webmanifest`, `.txt`
2. Path prefix: starts with `/sprites/`, `/api/auth/`
3. Exact match: `/login.html`, `/types.html`, `/overlay.html`, `/badge-overlay.html`, `/cemetery-overlay.html`

Uses `verifyJWT` imported from `../api/_lib/jwt.js` (already exists, already tested).

---

## `?next=` Redirect Flow

### Goal
User visits `/cemetery.html` → no session → lands on `/login.html?next=/cemetery.html` → logs in → lands on `/cemetery.html`.

### Flow

```
middleware
  └─→ /login.html?next=/cemetery.html

login.html (script)
  └─→ reads ?next, rewrites button hrefs:
      /api/auth/login?provider=twitch&next=/cemetery.html

login.js (GET /api/auth/login)
  └─→ reads &next param
  └─→ validates: starts with /, no ://, max 200 chars
  └─→ sets cookie: login_next=<next>; HttpOnly; SameSite=Lax; Max-Age=600
  └─→ redirects to OAuth provider

callback.js (GET /api/auth/callback)
  └─→ after successful login, reads cookie login_next
  └─→ validates same rules as above
  └─→ redirects to login_next (or / if missing/invalid)
  └─→ clears login_next cookie (Max-Age=0)
```

### Security: open redirect prevention

`next` value is valid only if:
- Starts with `/`
- Does NOT contain `://`
- Length ≤ 200 chars

If invalid, fall back to `/`.

---

## Files Changed

| File | Change |
|---|---|
| `functions/_middleware.js` | **New** — JWT guard for all requests |
| `functions/api/auth/login.js` | Read `&next` param, set `login_next` cookie |
| `functions/api/auth/callback.js` | Read `login_next` cookie, redirect there, clear cookie |
| `login.html` | Script rewrites button hrefs to include `?next=` param |

---

## What Does NOT Change

- `header.js` — unchanged, widget still shows login link as fallback
- `/api/auth/me` — unchanged
- All overlay pages — unchanged
- Tier system — untouched (any tier gets full access)
- JWT format and signing — untouched
