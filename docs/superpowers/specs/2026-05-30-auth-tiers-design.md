# Auth + Tiers — Design Spec
_Date: 2026-05-30_

## Goal

Add Twitch and Google OAuth login to identify users, store them in Neon (PostgreSQL), and allow manual tier assignment (Guest / VIP) by the admin.

No payment integration in this phase.

---

## Tiers

| Tier | Default | Badge color |
|---|---|---|
| `guest` | Yes (new users) | Muted / grey |
| `vip` | No (manually assigned) | `--pink` |

Tier enforcement (feature gates) is deferred — this phase only establishes the infrastructure and displays the badge in the header.

---

## Database (Neon)

Driver: `@neondatabase/serverless` (HTTP-based, compatible with Cloudflare Workers — no TCP).

```sql
CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider     TEXT NOT NULL,           -- 'twitch' | 'google'
  provider_id  TEXT NOT NULL,
  username     TEXT,
  email        TEXT,
  avatar_url   TEXT,
  tier         TEXT NOT NULL DEFAULT 'guest',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);
```

Tier values are validated in code against `['guest', 'vip']`.

---

## Auth Flow

### Session

- JWT signed with `HMAC-SHA256` via `crypto.subtle` (native in Workers — no library needed).
- Payload: `{ userId, tier, iat, exp }`.
- Delivered as an `HttpOnly`, `SameSite=Lax`, `Secure` cookie named `auth`. TTL: 7 days.

### CSRF Protection

On login, a random 16-byte hex `state` value is generated, stored in a short-lived `HttpOnly` cookie (`oauth_state`, 10 min), and sent to the provider. On callback, the returned `state` is verified against the cookie — mismatch returns 403.

### Login (`GET /api/auth/login?provider=twitch|google`)

1. Generate random `state`, set `oauth_state` cookie.
2. Redirect to provider authorization URL with `client_id`, `redirect_uri`, `scope`, `state`.

Scopes:
- Twitch: `user:read:email`
- Google: `openid email profile`

### Callback (`GET /api/auth/callback?provider=...&code=...&state=...`)

1. Verify `state` against `oauth_state` cookie → 403 on mismatch.
2. Exchange `code` for access token (POST to provider token endpoint).
3. Fetch user profile from provider.
4. Upsert user in Neon:
   ```sql
   INSERT INTO users (provider, provider_id, username, email, avatar_url)
   VALUES ($1, $2, $3, $4, $5)
   ON CONFLICT (provider, provider_id)
   DO UPDATE SET username = EXCLUDED.username,
                 email    = EXCLUDED.email,
                 avatar_url = EXCLUDED.avatar_url;
   ```
5. Sign JWT, set `auth` cookie (7 days).
6. Redirect to `/`.

### Logout (`GET /api/auth/logout`)

- Set `auth` cookie with `Max-Age=0`.
- Redirect to `/`.

### Me (`GET /api/auth/me`)

- Read and verify `auth` cookie JWT (contains `userId`, `tier`).
- Query Neon for `username` and `avatar_url` by `userId`.
- 200 `{ username, tier, avatar_url }` if valid.
- 401 if missing or invalid.

Note: `username` and `avatar_url` are not stored in the JWT (7-day TTL would make them stale if the user updates their profile). DB lookup on each `/me` call is acceptable — it is only called once per page load.

---

## Admin Tier Assignment

### Endpoint (`POST /api/admin/set-tier`)

Protected by `X-Admin-Key` header (must match `ADMIN_KEY` env var).

Request body:
```json
{ "userId": "<uuid>", "tier": "vip" }
```

Response:
```json
{ "ok": true, "username": "...", "tier": "vip" }
```

- Validates tier is one of `['guest', 'vip']`.
- `UPDATE users SET tier = $1 WHERE id = $2`.

### Admin panel (`admin.html`)

- Client-side only guard: if `/api/auth/me` returns non-admin or 401, redirect to `/`.
- Form: search user by username or email, display current tier, set new tier.
- Calls `POST /api/admin/set-tier` with `X-Admin-Key` entered by admin.
- Security is enforced server-side by `ADMIN_KEY`; the page guard is UX only.

### Direct DB access

Admin can also update tiers directly in the Neon console:
```sql
UPDATE users SET tier = 'vip' WHERE username = 'someuser';
```

---

## New Cloudflare Functions

| File | Route | Method | Purpose |
|---|---|---|---|
| `functions/api/auth/login.js` | `/api/auth/login` | GET | Redirect to provider |
| `functions/api/auth/callback.js` | `/api/auth/callback` | GET | Handle callback, create session |
| `functions/api/auth/logout.js` | `/api/auth/logout` | GET | Clear auth cookie |
| `functions/api/auth/me.js` | `/api/auth/me` | GET | Return current user |
| `functions/api/admin/set-tier.js` | `/api/admin/set-tier` | POST | Admin tier assignment |

---

## Frontend Changes

### `header.js`

- On load, fetch `/api/auth/me`.
- If 200: render avatar, username, and tier badge (`GUEST` grey / `VIP` pink).
- If 401: render "Login" button linking to `login.html`.

### `login.html` (new page)

- Two buttons: "Conectar con Twitch" and "Conectar con Google".
- Each links to `/api/auth/login?provider=twitch|google`.
- Uses existing MrKlypp design system.

### `admin.html` (new page)

- User search + tier selector form.
- Admin key input (stored in `sessionStorage` for convenience, never persisted to `localStorage`).

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `TWITCH_CLIENT_ID` | Twitch OAuth app client ID |
| `TWITCH_CLIENT_SECRET` | Twitch OAuth app client secret |
| `GOOGLE_CLIENT_ID` | Google OAuth app client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth app client secret |
| `JWT_SECRET` | HMAC signing key — 32+ random bytes, base64 encoded |
| `ADMIN_KEY` | Secret for `/api/admin/set-tier` |
| `DATABASE_URL` | Neon connection string |

---

## Out of Scope (This Phase)

- Payment / billing integration
- Feature gates based on tier (defined once features are decided)
- Email-based login
- OAuth token refresh (access tokens are only used at login time; the app uses its own JWT)
