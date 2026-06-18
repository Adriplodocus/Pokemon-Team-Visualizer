# Custom Sprites (Tournaments + Personal) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow VIP users to upload custom Pokémon sprites (personal and tournament-scoped) that appear as dynamic skins in the team editor alongside existing static skins.

**Architecture:** Custom sprite metadata lives in Neon DB (3 new tables); files live in a new Cloudflare R2 bucket. At app load, `loadCustomSkins()` fetches `/api/sprites/mine` and populates a runtime map that `buildSpriteUrl()` checks before falling back to the static CDN. The overlay receives resolved URLs in the Ably payload and needs no changes.

**Tech Stack:** Cloudflare Pages Functions (vanilla JS), Neon PostgreSQL via `@neondatabase/serverless`, Cloudflare R2 binding, Ably REST API, vanilla JS frontend (no build step).

## Global Constraints

- All Pages Functions export named handlers: `onRequestGet`, `onRequestPost`, `onRequestDelete`, etc.
- Auth pattern: `parseCookies(context.request)` → `verifyJWT(cookie.auth, context.env.JWT_SECRET)` → null = 401
- DB pattern: `const sql = getDB(context.env)` then tagged template literals: `` sql`SELECT ...` ``
- VIP check: `payload.tier !== 'vip'` → 403
- json helper defined per-file: `function json(data, status=200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }); }`
- Max upload size: 2 MB (2_097_152 bytes)
- Accepted formats: `image/gif`, `image/png`, `image/webp`
- R2 binding name: `SPRITES_BUCKET`
- R2 public base URL: `https://assets.pokemon.mrklypp.com`
- Tournament sprites: one skin per `(scope, pokemon_name, skin_name)` regardless of uploader
- One active tournament per user (enforced at join endpoint)
- spec: `docs/specs/2026-06-18-custom-sprites-design.md`

---

## File Map

### New files
| File | Purpose |
|------|---------|
| `db/migrations/002_custom_sprites.sql` | DB migration: tournaments, tournament_members, custom_sprites |
| `functions/api/sprites/mine.js` | GET /api/sprites/mine |
| `functions/api/sprites/upload.js` | POST /api/sprites/upload |
| `functions/api/sprites/[id].js` | DELETE /api/sprites/:id |
| `functions/api/tournaments/create.js` | POST /api/tournaments/create |
| `functions/api/tournaments/join.js` | POST /api/tournaments/join |
| `functions/api/tournaments/mine.js` | GET /api/tournaments/mine |
| `functions/api/tournaments/[id].js` | DELETE /api/tournaments/:id (creator deletes) |
| `functions/api/tournaments/[id]/leave.js` | DELETE /api/tournaments/:id/leave (member leaves) |
| `functions/api/cron/cleanup.js` | POST /api/cron/cleanup (daily expiry, secret-protected) |
| `sprites.html` | Personal sprites management page (VIP) |
| `sprites.js` | JS for sprites.html |
| `tournaments.html` | Tournament management page (VIP) |
| `tournaments.js` | JS for tournaments.html |

### Modified files
| File | What changes |
|------|-------------|
| `db/schema.sql` | Append new table definitions |
| `wrangler.toml` | Add R2 binding |
| `app.js` | Add `customSkins` map, `loadCustomSkins()`, modify `buildSpriteUrl()`, modify `openModal()` skin select, add tournament Ably subscription + toast |
| `header.js` | Add VIP links (Sprites, Torneo) to `initUserWidget()` |

---

### Task 1: DB Migration

**Files:**
- Create: `db/migrations/002_custom_sprites.sql`
- Modify: `db/schema.sql`

**Interfaces:**
- Produces: tables `tournaments`, `tournament_members`, `custom_sprites` available in Neon

- [ ] **Step 1: Write migration file**

```sql
-- db/migrations/002_custom_sprites.sql
CREATE TABLE IF NOT EXISTS tournaments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  created_by  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 year'),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tournament_members (
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tournament_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_tournament_members_user ON tournament_members(user_id);

CREATE TABLE IF NOT EXISTS custom_sprites (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scope        TEXT NOT NULL,
  pokemon_name TEXT NOT NULL,
  skin_name    TEXT NOT NULL,
  r2_key       TEXT NOT NULL,
  format       TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id, scope, pokemon_name, skin_name)
);
CREATE INDEX IF NOT EXISTS idx_custom_sprites_owner ON custom_sprites(owner_id);
CREATE INDEX IF NOT EXISTS idx_custom_sprites_scope ON custom_sprites(scope);
```

- [ ] **Step 2: Run migration against Neon**

Open Neon console → SQL Editor, paste and run the file contents. Verify tables exist:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- Expected: tournaments, tournament_members, custom_sprites in the list
```

- [ ] **Step 3: Append to schema.sql**

Append the same SQL (without `IF NOT EXISTS` guards) to `db/schema.sql` after the existing table definitions, so the canonical schema stays in sync.

- [ ] **Step 4: Commit**

```bash
git add db/migrations/002_custom_sprites.sql db/schema.sql
git commit -m "feat(db): add tournaments, tournament_members, custom_sprites tables"
```

---

### Task 2: R2 Bucket + Bindings

**Files:**
- Modify: `wrangler.toml`

**Interfaces:**
- Produces: `context.env.SPRITES_BUCKET` (R2 binding) available in all Pages Functions; `context.env.CRON_SECRET` available for cleanup route

- [ ] **Step 1: Create R2 bucket**

```bash
npx wrangler r2 bucket create ptv-custom-sprites
```

Expected output: `Created bucket ptv-custom-sprites`

- [ ] **Step 2: Add R2 binding to wrangler.toml**

Open `wrangler.toml` and append:

```toml
[[r2_buckets]]
binding = "SPRITES_BUCKET"
bucket_name = "ptv-custom-sprites"
```

- [ ] **Step 3: Configure public access**

In the Cloudflare dashboard → R2 → `ptv-custom-sprites` → Settings → Public Access: enable. Add custom domain `assets.pokemon.mrklypp.com` (requires DNS CNAME pointing to the R2 bucket's public URL in Cloudflare DNS).

- [ ] **Step 4: Add CRON_SECRET to Cloudflare Pages environment**

In Cloudflare Pages dashboard → Pokemon Team Visualizer → Settings → Environment Variables: add `CRON_SECRET` with a random value (e.g., `openssl rand -hex 32`). Add to both Production and Preview environments.

For local dev, add `--binding CRON_SECRET=<value>` to the wrangler dev command in the project README.

- [ ] **Step 5: Commit**

```bash
git add wrangler.toml
git commit -m "feat(infra): add R2 binding for custom sprites bucket"
```

---

### Task 3: Sprites API

**Files:**
- Create: `functions/api/sprites/mine.js`
- Create: `functions/api/sprites/upload.js`
- Create: `functions/api/sprites/[id].js`

**Interfaces:**
- Consumes: `getDB`, `parseCookies`, `verifyJWT` from `../_lib/`; `context.env.SPRITES_BUCKET`
- Produces:
  - `GET /api/sprites/mine` → `{ personal: Sprite[], tournament: { id, name, sprites: Sprite[] } | null }`
  - `POST /api/sprites/upload` → `{ id, url }`
  - `DELETE /api/sprites/:id` → `{ ok: true }`
  - Where `Sprite = { id, pokemon, skinName, url, format }`

- [ ] **Step 1: Write `functions/api/sprites/mine.js`**

```js
import { parseCookies } from '../_lib/cookies.js';
import { verifyJWT } from '../_lib/jwt.js';
import { getDB } from '../_lib/db.js';

const R2_BASE = 'https://assets.pokemon.mrklypp.com';

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

  const sql = getDB(context.env);

  // Personal sprites
  const personalRows = await sql`
    SELECT id, pokemon_name, skin_name, r2_key, format
    FROM custom_sprites
    WHERE owner_id = ${payload.userId} AND scope = 'personal'
    ORDER BY created_at DESC
  `;

  // Active tournament + its sprites
  const tmRows = await sql`
    SELECT t.id, t.name
    FROM tournaments t
    JOIN tournament_members tm ON tm.tournament_id = t.id
    WHERE tm.user_id = ${payload.userId}
    LIMIT 1
  `;

  let tournament = null;
  if (tmRows.length) {
    const t = tmRows[0];
    const tSprites = await sql`
      SELECT id, pokemon_name, skin_name, r2_key, format
      FROM custom_sprites
      WHERE scope = ${t.id}
      ORDER BY created_at DESC
    `;
    tournament = {
      id: t.id,
      name: t.name,
      sprites: tSprites.map(s => ({
        id: s.id,
        pokemon: s.pokemon_name,
        skinName: s.skin_name,
        url: `${R2_BASE}/${s.r2_key}`,
        format: s.format,
      })),
    };
  }

  return json({
    personal: personalRows.map(s => ({
      id: s.id,
      pokemon: s.pokemon_name,
      skinName: s.skin_name,
      url: `${R2_BASE}/${s.r2_key}`,
      format: s.format,
    })),
    tournament,
  });
}
```

- [ ] **Step 2: Write `functions/api/sprites/upload.js`**

```js
import { parseCookies } from '../_lib/cookies.js';
import { verifyJWT } from '../_lib/jwt.js';
import { getDB } from '../_lib/db.js';

const R2_BASE = 'https://assets.pokemon.mrklypp.com';
const MAX_SIZE = 2_097_152; // 2 MB
const ALLOWED_TYPES = new Set(['image/gif', 'image/png', 'image/webp']);
const EXT_MAP = { 'image/gif': 'gif', 'image/png': 'png', 'image/webp': 'webp' };

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
  if (payload.tier !== 'vip') return json({ error: 'VIP required' }, 403);

  let formData;
  try { formData = await context.request.formData(); }
  catch { return json({ error: 'Invalid form data' }, 400); }

  const pokemon   = (formData.get('pokemon')   || '').trim().toLowerCase();
  const skinName  = (formData.get('skinName')   || '').trim();
  const scope     = (formData.get('scope')      || '').trim();
  const file      = formData.get('file');

  if (!pokemon)  return json({ error: 'pokemon required' }, 400);
  if (!skinName) return json({ error: 'skinName required' }, 400);
  if (!scope)    return json({ error: 'scope required' }, 400);
  if (!file || typeof file.arrayBuffer !== 'function') return json({ error: 'file required' }, 400);

  const contentType = file.type || '';
  if (!ALLOWED_TYPES.has(contentType)) return json({ error: 'Format must be gif, png, or webp' }, 400);

  const buffer = await file.arrayBuffer();
  if (buffer.byteLength > MAX_SIZE) return json({ error: 'File exceeds 2 MB limit' }, 400);

  const sql = getDB(context.env);

  // Validate scope
  if (scope !== 'personal') {
    // Must be a valid tournament UUID and user must be a member
    const memberRows = await sql`
      SELECT 1 FROM tournament_members
      WHERE tournament_id = ${scope} AND user_id = ${payload.userId}
    `;
    if (!memberRows.length) return json({ error: 'Not a member of this tournament' }, 403);

    // For tournament scope: one skin per (scope, pokemon, skinName) regardless of uploader
    const existing = await sql`
      SELECT id FROM custom_sprites
      WHERE scope = ${scope} AND pokemon_name = ${pokemon} AND skin_name = ${skinName}
    `;
    if (existing.length) return json({ error: 'Skin name already taken for this Pokémon in this tournament' }, 409);
  }

  const ext    = EXT_MAP[contentType];
  const r2Key  = scope === 'personal'
    ? `personal/${payload.userId}/${pokemon}/${skinName}.${ext}`
    : `tournament/${scope}/${pokemon}/${skinName}.${ext}`;

  // Upsert: delete existing R2 object if replacing personal sprite
  if (scope === 'personal') {
    const existingPersonal = await sql`
      SELECT r2_key FROM custom_sprites
      WHERE owner_id = ${payload.userId} AND scope = 'personal'
        AND pokemon_name = ${pokemon} AND skin_name = ${skinName}
    `;
    if (existingPersonal.length) {
      await context.env.SPRITES_BUCKET.delete(existingPersonal[0].r2_key);
    }
  }

  await context.env.SPRITES_BUCKET.put(r2Key, buffer, {
    httpMetadata: { contentType },
  });

  const rows = await sql`
    INSERT INTO custom_sprites (owner_id, scope, pokemon_name, skin_name, r2_key, format)
    VALUES (${payload.userId}, ${scope}, ${pokemon}, ${skinName}, ${r2Key}, ${ext})
    ON CONFLICT (owner_id, scope, pokemon_name, skin_name)
    DO UPDATE SET r2_key = EXCLUDED.r2_key, format = EXCLUDED.format
    RETURNING id
  `;

  return json({ id: rows[0].id, url: `${R2_BASE}/${r2Key}` }, 201);
}
```

- [ ] **Step 3: Write `functions/api/sprites/[id].js`**

```js
import { parseCookies } from '../_lib/cookies.js';
import { verifyJWT } from '../_lib/jwt.js';
import { getDB } from '../_lib/db.js';

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
  if (payload.tier !== 'vip') return json({ error: 'VIP required' }, 403);

  const { id } = context.params;
  const sql = getDB(context.env);

  const rows = await sql`
    SELECT r2_key, scope FROM custom_sprites
    WHERE id = ${id} AND owner_id = ${payload.userId}
  `;
  if (!rows.length) return json({ error: 'Not found' }, 404);

  await context.env.SPRITES_BUCKET.delete(rows[0].r2_key);
  await sql`DELETE FROM custom_sprites WHERE id = ${id}`;

  return json({ ok: true });
}
```

- [ ] **Step 4: Test with wrangler dev**

Start dev server:
```bash
npx wrangler pages dev . --binding ABLY_API_KEY=x --binding DATABASE_URL=<neon-url> --binding JWT_SECRET=<secret> --binding SPRITES_BUCKET=ptv-custom-sprites
```

Test (replace `<cookie>` with a valid auth cookie from a logged-in VIP session):
```bash
# GET mine (should return empty lists)
curl -s http://localhost:8788/api/sprites/mine -H "Cookie: auth=<cookie>" | jq

# Upload a sprite
curl -s -X POST http://localhost:8788/api/sprites/upload \
  -b "auth=<cookie>" \
  -F "pokemon=charizard" \
  -F "skinName=test" \
  -F "scope=personal" \
  -F "file=@/path/to/test.png;type=image/png" | jq
# Expected: { "id": "...", "url": "https://assets.pokemon.mrklypp.com/personal/..." }

# GET mine again — should show the uploaded sprite
curl -s http://localhost:8788/api/sprites/mine -H "Cookie: auth=<cookie>" | jq

# DELETE it
curl -s -X DELETE http://localhost:8788/api/sprites/<id> -H "Cookie: auth=<cookie>" | jq
# Expected: { "ok": true }
```

- [ ] **Step 5: Commit**

```bash
git add functions/api/sprites/
git commit -m "feat(api): add sprites mine/upload/delete endpoints"
```

---

### Task 4: Tournaments API — Create, Join, Mine

**Files:**
- Create: `functions/api/tournaments/create.js`
- Create: `functions/api/tournaments/join.js`
- Create: `functions/api/tournaments/mine.js`

**Interfaces:**
- Consumes: `getDB`, `parseCookies`, `verifyJWT`
- Produces:
  - `POST /api/tournaments/create` → `{ id, name, invite_code, expires_at }`
  - `POST /api/tournaments/join` → `{ ok: true, tournament: { id, name } }`
  - `GET /api/tournaments/mine` → `{ id, name, invite_code, expires_at, is_creator, member_count } | null`

- [ ] **Step 1: Write `functions/api/tournaments/create.js`**

```js
import { parseCookies } from '../_lib/cookies.js';
import { verifyJWT } from '../_lib/jwt.js';
import { getDB } from '../_lib/db.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function randomCode(len = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(len)))
    .map(b => chars[b % chars.length]).join('');
}

export async function onRequestPost(context) {
  const cookies = parseCookies(context.request);
  const payload = await verifyJWT(cookies.auth, context.env.JWT_SECRET);
  if (!payload) return json({ error: 'Unauthorized' }, 401);
  if (payload.tier !== 'vip') return json({ error: 'VIP required' }, 403);

  let body;
  try { body = await context.request.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const name = (body.name || '').trim();
  if (!name) return json({ error: 'name required' }, 400);
  if (name.length > 100) return json({ error: 'name too long' }, 400);

  // One tournament per user
  const sql = getDB(context.env);
  const existing = await sql`
    SELECT 1 FROM tournament_members WHERE user_id = ${payload.userId}
  `;
  if (existing.length) return json({ error: 'Already in a tournament. Leave it first.' }, 409);

  const invite_code = randomCode();

  const rows = await sql`
    INSERT INTO tournaments (name, invite_code, created_by)
    VALUES (${name}, ${invite_code}, ${payload.userId})
    RETURNING id, name, invite_code, expires_at
  `;
  const t = rows[0];

  // Auto-join creator
  await sql`
    INSERT INTO tournament_members (tournament_id, user_id)
    VALUES (${t.id}, ${payload.userId})
  `;

  return json({ id: t.id, name: t.name, invite_code: t.invite_code, expires_at: t.expires_at }, 201);
}
```

- [ ] **Step 2: Write `functions/api/tournaments/join.js`**

```js
import { parseCookies } from '../_lib/cookies.js';
import { verifyJWT } from '../_lib/jwt.js';
import { getDB } from '../_lib/db.js';

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
  if (payload.tier !== 'vip') return json({ error: 'VIP required' }, 403);

  let body;
  try { body = await context.request.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const invite_code = (body.invite_code || '').trim().toUpperCase();
  if (!invite_code) return json({ error: 'invite_code required' }, 400);

  const sql = getDB(context.env);

  // One tournament per user
  const existing = await sql`
    SELECT 1 FROM tournament_members WHERE user_id = ${payload.userId}
  `;
  if (existing.length) return json({ error: 'Already in a tournament. Leave it first.' }, 409);

  const tRows = await sql`
    SELECT id, name FROM tournaments WHERE invite_code = ${invite_code}
  `;
  if (!tRows.length) return json({ error: 'Invalid invite code' }, 404);

  const t = tRows[0];
  await sql`
    INSERT INTO tournament_members (tournament_id, user_id)
    VALUES (${t.id}, ${payload.userId})
  `;

  return json({ ok: true, tournament: { id: t.id, name: t.name } });
}
```

- [ ] **Step 3: Write `functions/api/tournaments/mine.js`**

```js
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

  const sql = getDB(context.env);
  const rows = await sql`
    SELECT t.id, t.name, t.invite_code, t.expires_at, t.created_by,
           COUNT(tm2.user_id) AS member_count
    FROM tournaments t
    JOIN tournament_members tm ON tm.tournament_id = t.id
    JOIN tournament_members tm2 ON tm2.tournament_id = t.id
    WHERE tm.user_id = ${payload.userId}
    GROUP BY t.id
    LIMIT 1
  `;

  if (!rows.length) return json(null);

  const t = rows[0];
  return json({
    id:           t.id,
    name:         t.name,
    invite_code:  t.invite_code,
    expires_at:   t.expires_at,
    is_creator:   t.created_by === payload.userId,
    member_count: Number(t.member_count),
  });
}
```

- [ ] **Step 4: Test with wrangler dev**

```bash
# Create a tournament
curl -s -X POST http://localhost:8788/api/tournaments/create \
  -H "Cookie: auth=<vip-cookie>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Torneo Kanto"}' | jq
# Expected: { id, name, invite_code, expires_at }

# Check mine
curl -s http://localhost:8788/api/tournaments/mine \
  -H "Cookie: auth=<vip-cookie>" | jq
# Expected: tournament object with is_creator: true

# Try joining when already in one
curl -s -X POST http://localhost:8788/api/tournaments/join \
  -H "Cookie: auth=<vip-cookie>" \
  -H "Content-Type: application/json" \
  -d '{"invite_code":"XXXX"}' | jq
# Expected: { "error": "Already in a tournament. Leave it first." }

# With a second VIP account, join with the invite_code from create
curl -s -X POST http://localhost:8788/api/tournaments/join \
  -H "Cookie: auth=<vip2-cookie>" \
  -H "Content-Type: application/json" \
  -d '{"invite_code":"<code>"}' | jq
# Expected: { ok: true, tournament: { id, name } }
```

- [ ] **Step 5: Commit**

```bash
git add functions/api/tournaments/create.js functions/api/tournaments/join.js functions/api/tournaments/mine.js
git commit -m "feat(api): add tournament create/join/mine endpoints"
```

---

### Task 5: Tournaments API — Delete + Leave + Ably notification

**Files:**
- Create: `functions/api/tournaments/[id].js`
- Create: `functions/api/tournaments/[id]/leave.js`

**Interfaces:**
- Consumes: `getDB`, `parseCookies`, `verifyJWT`, `context.env.SPRITES_BUCKET`, `context.env.ABLY_API_KEY`
- Produces:
  - `DELETE /api/tournaments/:id` → `{ ok: true }` (creator only; cascades R2 + Ably event)
  - `DELETE /api/tournaments/:id/leave` → `{ ok: true }` (non-creator member)

- [ ] **Step 1: Write `functions/api/tournaments/[id].js`**

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

async function publishAbly(apiKey, channelId, event, data) {
  await fetch(`https://rest.ably.io/channels/ptv-tournament-${channelId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(apiKey),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: event, data: JSON.stringify(data) }),
  });
}

async function deleteR2Prefix(bucket, prefix) {
  // R2 list + batch delete for all objects under prefix
  let cursor;
  do {
    const listed = await bucket.list({ prefix, cursor, limit: 1000 });
    if (listed.objects.length) {
      await Promise.all(listed.objects.map(obj => bucket.delete(obj.key)));
    }
    cursor = listed.truncated ? listed.cursor : null;
  } while (cursor);
}

export async function onRequestDelete(context) {
  const cookies = parseCookies(context.request);
  const payload = await verifyJWT(cookies.auth, context.env.JWT_SECRET);
  if (!payload) return json({ error: 'Unauthorized' }, 401);
  if (payload.tier !== 'vip') return json({ error: 'VIP required' }, 403);

  const { id } = context.params;
  const sql = getDB(context.env);

  const rows = await sql`
    SELECT id FROM tournaments WHERE id = ${id} AND created_by = ${payload.userId}
  `;
  if (!rows.length) return json({ error: 'Not found or not the creator' }, 404);

  // Delete R2 assets for this tournament
  await deleteR2Prefix(context.env.SPRITES_BUCKET, `tournament/${id}/`);

  // Notify members via Ably before DB delete
  if (context.env.ABLY_API_KEY) {
    await publishAbly(context.env.ABLY_API_KEY, id, 'tournament_deleted', { tournamentId: id });
  }

  // DB cascade deletes tournament_members and custom_sprites rows
  await sql`DELETE FROM tournaments WHERE id = ${id}`;

  return json({ ok: true });
}
```

- [ ] **Step 2: Write `functions/api/tournaments/[id]/leave.js`**

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
  if (payload.tier !== 'vip') return json({ error: 'VIP required' }, 403);

  const { id } = context.params;
  const sql = getDB(context.env);

  // Creator cannot leave — must delete the tournament instead
  const creatorRows = await sql`
    SELECT 1 FROM tournaments WHERE id = ${id} AND created_by = ${payload.userId}
  `;
  if (creatorRows.length) return json({ error: 'Creator cannot leave. Delete the tournament instead.' }, 400);

  const result = await sql`
    DELETE FROM tournament_members
    WHERE tournament_id = ${id} AND user_id = ${payload.userId}
    RETURNING tournament_id
  `;
  if (!result.length) return json({ error: 'Not a member of this tournament' }, 404);

  return json({ ok: true });
}
```

- [ ] **Step 3: Test with wrangler dev**

```bash
# Leave tournament (with non-creator VIP account)
curl -s -X DELETE http://localhost:8788/api/tournaments/<id>/leave \
  -H "Cookie: auth=<vip2-cookie>" | jq
# Expected: { ok: true }

# Creator tries to leave — should fail
curl -s -X DELETE http://localhost:8788/api/tournaments/<id>/leave \
  -H "Cookie: auth=<vip-cookie>" | jq
# Expected: { "error": "Creator cannot leave. Delete the tournament instead." }

# Creator deletes tournament
curl -s -X DELETE http://localhost:8788/api/tournaments/<id> \
  -H "Cookie: auth=<vip-cookie>" | jq
# Expected: { ok: true }

# Verify tournament gone
curl -s http://localhost:8788/api/tournaments/mine \
  -H "Cookie: auth=<vip-cookie>" | jq
# Expected: null
```

- [ ] **Step 4: Commit**

```bash
git add functions/api/tournaments/[id].js "functions/api/tournaments/[id]/leave.js"
git commit -m "feat(api): add tournament delete and leave endpoints"
```

---

### Task 6: Cron Cleanup Endpoint

**Files:**
- Create: `functions/api/cron/cleanup.js`

**Interfaces:**
- Consumes: `context.env.CRON_SECRET`, `context.env.SPRITES_BUCKET`, `context.env.ABLY_API_KEY`, `getDB`
- Produces: `POST /api/cron/cleanup` → `{ deleted: number }`

- [ ] **Step 1: Write `functions/api/cron/cleanup.js`**

```js
import { getDB } from '../_lib/db.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function publishAbly(apiKey, channelId, event, data) {
  await fetch(`https://rest.ably.io/channels/ptv-tournament-${channelId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(apiKey),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: event, data: JSON.stringify(data) }),
  });
}

async function deleteR2Prefix(bucket, prefix) {
  let cursor;
  do {
    const listed = await bucket.list({ prefix, cursor, limit: 1000 });
    if (listed.objects.length) {
      await Promise.all(listed.objects.map(obj => bucket.delete(obj.key)));
    }
    cursor = listed.truncated ? listed.cursor : null;
  } while (cursor);
}

export async function onRequestPost(context) {
  const secret = context.request.headers.get('X-Cron-Secret');
  if (!secret || secret !== context.env.CRON_SECRET) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const sql = getDB(context.env);
  const expired = await sql`
    SELECT id FROM tournaments WHERE expires_at < NOW()
  `;

  let deleted = 0;
  for (const t of expired) {
    await deleteR2Prefix(context.env.SPRITES_BUCKET, `tournament/${t.id}/`);
    if (context.env.ABLY_API_KEY) {
      await publishAbly(context.env.ABLY_API_KEY, t.id, 'tournament_deleted', { tournamentId: t.id });
    }
    await sql`DELETE FROM tournaments WHERE id = ${t.id}`;
    deleted++;
  }

  console.log(`[cron] Deleted ${deleted} expired tournaments`);
  return json({ deleted });
}
```

- [ ] **Step 2: Set up external cron trigger**

Register a daily job at `cron-job.org` (free) or similar:
- URL: `https://pokemon.mrklypp.com/api/cron/cleanup`
- Method: POST
- Header: `X-Cron-Secret: <value from env>`
- Schedule: daily at 03:00 UTC

- [ ] **Step 3: Test**

```bash
curl -s -X POST http://localhost:8788/api/cron/cleanup \
  -H "X-Cron-Secret: <value>" | jq
# Expected: { "deleted": 0 } (no expired tournaments yet)

# Wrong secret
curl -s -X POST http://localhost:8788/api/cron/cleanup \
  -H "X-Cron-Secret: wrong" | jq
# Expected: { "error": "Unauthorized" }
```

- [ ] **Step 4: Commit**

```bash
git add functions/api/cron/cleanup.js
git commit -m "feat(api): add cron cleanup endpoint for expired tournaments"
```

---

### Task 7: app.js — Custom Skins Integration

**Files:**
- Modify: `app.js`

**Interfaces:**
- Consumes: `GET /api/sprites/mine`, `GET /api/auth/me` (already called by header)
- Produces: `customSkins` map `{ pokemonName: { skinName: url } }` used by `buildSpriteUrl()` and `openModal()`

- [ ] **Step 1: Add customSkins map and loadCustomSkins() after the existing constants block (around line 217)**

Find the block ending with:
```js
const POKEBALL_URL = 'https://i.postimg.cc/0QdW9KS2/Pokeball-Background.png';
```

After it, add:
```js
// ── Custom skins (loaded at runtime for VIP users) ───────────────
let customSkins = {}; // { pokemonName: { skinName: directUrl } }

async function loadCustomSkins() {
    const res = await fetch('/api/sprites/mine');
    if (!res.ok) return;
    const { personal, tournament } = await res.json();
    customSkins = {};
    for (const s of personal) {
        (customSkins[s.pokemon] ??= {})[s.skinName] = s.url;
    }
    if (tournament) {
        for (const s of tournament.sprites) {
            // personal takes priority
            if (!customSkins[s.pokemon]?.[s.skinName]) {
                (customSkins[s.pokemon] ??= {})[s.skinName] = s.url;
            }
        }
        subscribeToTournamentChannel(tournament.id);
    }
}

function subscribeToTournamentChannel(tournamentId) {
    if (!window.Ably) return;
    const ch = window.Ably.channels.get(`ptv-tournament-${tournamentId}`);
    ch.subscribe('tournament_deleted', () => {
        // Remove tournament skins from customSkins
        for (const pokemon of Object.keys(customSkins)) {
            for (const skinName of Object.keys(customSkins[pokemon])) {
                const url = customSkins[pokemon][skinName];
                if (url.includes('/tournament/')) delete customSkins[pokemon][skinName];
            }
        }
        // Force-reload skin pickers if modal open
        renderTeam();
        showToast(t('tournamentDeleted'));
    });
}
```

- [ ] **Step 2: Add i18n string for tournamentDeleted**

In the `STRINGS` object, add to both `es` and `en`:
```js
// In es:
tournamentDeleted: 'Tu torneo anterior ha finalizado.',
// In en:
tournamentDeleted: 'Your tournament has ended.',
```

- [ ] **Step 3: Call loadCustomSkins() on init**

Find the existing app initialization (where data is fetched at startup — look for the `fetch('/api/auth/me')` or the pokemon list fetch). After the pokemon list loads successfully, add:

```js
// After pokemonNames and POKEMON_CATALOG are loaded, load custom skins for VIP users
fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(user => {
    if (user?.tier === 'vip') loadCustomSkins();
});
```

Note: if `/api/auth/me` is already called elsewhere on init, reuse that result instead of calling it again.

- [ ] **Step 4: Modify buildSpriteUrl() to check customSkins first**

Find `buildSpriteUrl()` (line ~617). Replace the opening of the function:

```js
function buildSpriteUrl(name, props) {
    const lower   = name.toLowerCase();
    const shiny   = props.shiny === 'True';
    const skin    = props.skin  || 'common';
    const gender  = props.gender || 'male';

    // Custom skin takes priority over static sprites
    if (skin !== 'common' && customSkins[lower]?.[skin]) {
        return customSkins[lower][skin];
    }

    // ... rest of existing function unchanged
```

- [ ] **Step 5: Modify openModal() skin select to include custom skins**

Find in `openModal()` the block that builds the `skins` array (around line 557):
```js
const skins = catalog.skipBase ? (catalog.skin || []) : ['common', ...(catalog.skin || [])];
```

Replace with:
```js
const staticSkins = catalog.skipBase ? (catalog.skin || []) : ['common', ...(catalog.skin || [])];
const customForPokemon = Object.keys(customSkins[name.toLowerCase()] || {});
const skins = [...staticSkins, ...customForPokemon.filter(s => !staticSkins.includes(s))];
```

Then in the `<option>` rendering block (around line 581), add a visual indicator for custom skins:
```js
${skins.map(s => {
    const isCustom = customSkins[name.toLowerCase()]?.[s];
    const label = isCustom ? `${s} ★` : s;
    return `<option value="${s}" ${effectiveModalSkin===s?'selected':''}>${label}</option>`;
}).join('')}
```

- [ ] **Step 6: Add showToast() helper if not already present**

Search for an existing toast/status function. If none exists for transient non-error messages, add:
```js
function showToast(msg) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}
```

Add to `style.css`:
```css
.toast {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    background: var(--surface2);
    border: 1px solid var(--border);
    color: var(--text-em);
    padding: 0.6rem 1.25rem;
    border-radius: 8px;
    font-size: 0.85rem;
    z-index: 9999;
    animation: fade-up 0.2s ease;
}
```

- [ ] **Step 7: Test manually**

1. Log in as VIP user
2. Upload a sprite via curl (Task 3 test command)
3. Reload `index.html`
4. Open the properties modal for the Pokémon you uploaded a sprite for
5. Verify the custom skin appears in the dropdown with `★` suffix
6. Select it — verify the sprite preview updates to the R2 URL

- [ ] **Step 8: Commit**

```bash
git add app.js style.css
git commit -m "feat(app): integrate custom skins into skin picker and sprite resolution"
```

---

### Task 8: header.js — VIP Navigation Links

**Files:**
- Modify: `header.js`

**Interfaces:**
- Consumes: `/api/auth/me` response (already fetched by `initUserWidget()`)
- Produces: VIP users see "Sprites" and "Torneo" links in the user widget

- [ ] **Step 1: Add VIP links inside initUserWidget()**

Find the block in `initUserWidget()` that renders the user widget HTML (around line 78-82). The current HTML is:
```js
el.innerHTML =
    (avatarUrl ? `<img class="user-avatar" src="${esc(avatarUrl)}" alt="${esc(username)}">` : '') +
    `<span class="user-name">${esc(username)}</span>` +
    `<span class="user-badge ${badgeClass}">${badgeLabel}</span>` +
    `<a href="/api/auth/logout" class="user-logout">Salir</a>`;
```

Replace with:
```js
const vipLinks = tier === 'vip'
    ? `<a href="/sprites.html" class="user-vip-link">Sprites</a>` +
      `<a href="/tournaments.html" class="user-vip-link">Torneo</a>`
    : '';
el.innerHTML =
    (avatarUrl ? `<img class="user-avatar" src="${esc(avatarUrl)}" alt="${esc(username)}">` : '') +
    `<span class="user-name">${esc(username)}</span>` +
    `<span class="user-badge ${badgeClass}">${badgeLabel}</span>` +
    vipLinks +
    `<a href="/api/auth/logout" class="user-logout">Salir</a>`;
```

- [ ] **Step 2: Add styles for .user-vip-link in style.css**

```css
.user-vip-link {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--pink);
    border: 1px solid rgba(255, 86, 180, 0.30);
    border-radius: 100px;
    padding: 0.2rem 0.6rem;
    transition: background 0.18s, border-color 0.18s;
}
.user-vip-link:hover {
    background: rgba(255, 86, 180, 0.10);
    border-color: rgba(255, 86, 180, 0.50);
}
```

- [ ] **Step 3: Test manually**

1. Log in as VIP — verify "Sprites" and "Torneo" links appear in the header
2. Log in as guest — verify no VIP links appear
3. Click links — verify they navigate to the correct pages (will be 404 until Tasks 9-10)

- [ ] **Step 4: Commit**

```bash
git add header.js style.css
git commit -m "feat(header): add VIP navigation links for sprites and tournament pages"
```

---

### Task 9: sprites.html — Personal Sprites Management Page

**Files:**
- Create: `sprites.html`
- Create: `sprites.js`

**Interfaces:**
- Consumes: `GET /api/sprites/mine`, `POST /api/sprites/upload`, `DELETE /api/sprites/:id`, `GET /api/auth/me`
- Produces: VIP users can view/upload/delete their personal sprites

- [ ] **Step 1: Create `sprites.html`**

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mis Sprites — Pokémon Stream Visualizer</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Russo+One&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
<script>const ACTIVE_PAGE = 'sprites';</script>
<script src="lang.js"></script>
<script src="header.js"></script>

<main class="container sprites-page">
    <section class="sprites-header">
        <h2 class="page-title">Mis Sprites</h2>
        <p class="page-subtitle">Sube sprites personalizados para tus Pokémon. Solo disponible para usuarios VIP.</p>
    </section>

    <section id="access-denied" class="access-denied" style="display:none">
        <p>Esta página requiere una cuenta VIP.</p>
    </section>

    <section id="sprites-content" style="display:none">
        <form id="upload-form" class="card upload-form">
            <h3>Subir sprite</h3>
            <div class="form-row">
                <label for="upload-pokemon">Pokémon</label>
                <input id="upload-pokemon" class="input" type="text" placeholder="charizard" autocomplete="off">
            </div>
            <div class="form-row">
                <label for="upload-skin-name">Nombre de skin</label>
                <input id="upload-skin-name" class="input" type="text" placeholder="mi-skin" autocomplete="off">
            </div>
            <div class="form-row">
                <label for="upload-file">Archivo (GIF, PNG, WebP · máx 2 MB)</label>
                <input id="upload-file" type="file" accept="image/gif,image/png,image/webp">
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn--primary">Subir sprite</button>
                <span id="upload-status" class="upload-status"></span>
            </div>
        </form>

        <section class="sprites-list-section">
            <h3>Sprites subidos</h3>
            <div id="sprites-list" class="sprites-grid">
                <p class="empty-state">Cargando...</p>
            </div>
        </section>
    </section>
</main>

<script src="sprites.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `sprites.js`**

```js
(async function () {
    const meRes = await fetch('/api/auth/me');
    if (!meRes.ok) { window.location.href = '/login.html'; return; }
    const { tier } = await meRes.json();

    if (tier !== 'vip') {
        document.getElementById('access-denied').style.display = '';
        return;
    }
    document.getElementById('sprites-content').style.display = '';

    async function loadSprites() {
        const res = await fetch('/api/sprites/mine');
        const { personal } = await res.json();
        const list = document.getElementById('sprites-list');
        if (!personal.length) {
            list.innerHTML = '<p class="empty-state">No has subido ningún sprite aún.</p>';
            return;
        }
        list.innerHTML = personal.map(s => `
            <div class="sprite-card card" data-id="${s.id}">
                <img src="${s.url}" alt="${s.pokemon}" class="sprite-thumb" onerror="this.style.opacity='0.3'">
                <div class="sprite-info">
                    <span class="sprite-pokemon">${s.pokemon}</span>
                    <span class="sprite-skin">${s.skinName}</span>
                    <span class="sprite-format badge">${s.format}</span>
                </div>
                <button class="btn btn--danger btn--sm delete-btn" data-id="${s.id}">Borrar</button>
            </div>
        `).join('');

        list.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('¿Borrar este sprite?')) return;
                const id = btn.dataset.id;
                const res = await fetch(`/api/sprites/${id}`, { method: 'DELETE' });
                if (res.ok) loadSprites();
                else {
                    const err = await res.json();
                    alert(err.error || 'Error al borrar');
                }
            });
        });
    }

    loadSprites();

    document.getElementById('upload-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('upload-status');
        const pokemon  = document.getElementById('upload-pokemon').value.trim().toLowerCase();
        const skinName = document.getElementById('upload-skin-name').value.trim();
        const fileEl   = document.getElementById('upload-file');
        const file     = fileEl.files[0];

        if (!pokemon || !skinName || !file) {
            status.textContent = 'Rellena todos los campos.';
            status.className = 'upload-status error';
            return;
        }

        const fd = new FormData();
        fd.append('pokemon', pokemon);
        fd.append('skinName', skinName);
        fd.append('scope', 'personal');
        fd.append('file', file);

        status.textContent = 'Subiendo...';
        status.className = 'upload-status';

        const res = await fetch('/api/sprites/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok) {
            status.textContent = '¡Sprite subido correctamente!';
            status.className = 'upload-status success';
            e.target.reset();
            loadSprites();
        } else {
            status.textContent = data.error || 'Error al subir';
            status.className = 'upload-status error';
        }
    });
})();
```

- [ ] **Step 3: Add styles in style.css**

```css
/* sprites.html */
.sprites-page { padding: 2rem 1rem; }
.page-title { font-family: 'Russo One', sans-serif; color: var(--text-em); font-size: 1.6rem; margin-bottom: 0.25rem; }
.page-subtitle { color: var(--muted); font-size: 0.8rem; margin-bottom: 2rem; }
.upload-form { margin-bottom: 2rem; }
.upload-form h3 { color: var(--text-em); margin-bottom: 1rem; font-size: 0.95rem; }
.form-row { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.85rem; }
.form-row label { font-size: 0.75rem; color: var(--muted); }
.form-actions { display: flex; align-items: center; gap: 1rem; margin-top: 1rem; }
.upload-status { font-size: 0.8rem; color: var(--muted); }
.upload-status.success { color: #22C55E; }
.upload-status.error { color: #E5173A; }
.sprites-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; }
.sprite-card { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; text-align: center; }
.sprite-thumb { width: 80px; height: 80px; object-fit: contain; image-rendering: pixelated; }
.sprite-info { display: flex; flex-direction: column; gap: 0.2rem; }
.sprite-pokemon { font-weight: 700; color: var(--text-em); font-size: 0.85rem; }
.sprite-skin { color: var(--muted); font-size: 0.75rem; }
.btn--danger { background: rgba(229, 23, 58, 0.15); color: #E5173A; border-color: rgba(229, 23, 58, 0.30); }
.btn--danger:hover { background: rgba(229, 23, 58, 0.25); border-color: rgba(229, 23, 58, 0.50); }
.btn--sm { padding: 0.3rem 0.75rem; font-size: 0.75rem; }
.empty-state { color: var(--dim); font-size: 0.85rem; }
.access-denied { color: var(--muted); padding: 2rem 0; }
```

- [ ] **Step 4: Test manually**

1. Navigate to `/sprites.html` as a guest → should show access denied message
2. Navigate as VIP → should show upload form + empty sprites list
3. Upload a GIF/PNG/WebP sprite → verify it appears in the grid
4. Upload a file > 2 MB → verify error message
5. Click delete → verify sprite disappears from the grid

- [ ] **Step 5: Commit**

```bash
git add sprites.html sprites.js style.css
git commit -m "feat(ui): add personal sprites management page"
```

---

### Task 10: tournaments.html — Tournament Management Page

**Files:**
- Create: `tournaments.html`
- Create: `tournaments.js`

**Interfaces:**
- Consumes: `GET /api/tournaments/mine`, `POST /api/tournaments/create`, `POST /api/tournaments/join`, `DELETE /api/tournaments/:id`, `DELETE /api/tournaments/:id/leave`, `GET /api/sprites/mine` (for tournament sprites list), `POST /api/sprites/upload`, `DELETE /api/sprites/:id`
- Produces: VIP users can create/join/leave/delete tournaments and manage tournament sprites

- [ ] **Step 1: Create `tournaments.html`**

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Torneo — Pokémon Stream Visualizer</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Russo+One&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
<script>const ACTIVE_PAGE = 'tournaments';</script>
<script src="lang.js"></script>
<script src="header.js"></script>

<main class="container sprites-page">
    <h2 class="page-title">Torneo</h2>

    <section id="access-denied" class="access-denied" style="display:none">
        <p>Esta página requiere una cuenta VIP.</p>
    </section>

    <section id="no-tournament" style="display:none">
        <p class="page-subtitle">No perteneces a ningún torneo.</p>
        <div class="tournament-actions">
            <form id="create-form" class="card upload-form">
                <h3>Crear torneo</h3>
                <div class="form-row">
                    <label for="create-name">Nombre del torneo</label>
                    <input id="create-name" class="input" type="text" placeholder="Torneo Kanto" maxlength="100">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn--primary">Crear</button>
                    <span id="create-status" class="upload-status"></span>
                </div>
            </form>

            <form id="join-form" class="card upload-form">
                <h3>Unirse a un torneo</h3>
                <div class="form-row">
                    <label for="join-code">Código de invitación</label>
                    <input id="join-code" class="input" type="text" placeholder="ABC12345" maxlength="8" style="text-transform:uppercase">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn--primary">Unirse</button>
                    <span id="join-status" class="upload-status"></span>
                </div>
            </form>
        </div>
    </section>

    <section id="active-tournament" style="display:none">
        <div class="card tournament-info">
            <div class="tournament-meta">
                <span id="t-name" class="tournament-name"></span>
                <span id="t-members" class="tournament-members"></span>
                <span id="t-expires" class="tournament-expires"></span>
            </div>
            <div class="tournament-code-row">
                <span class="label">Código de invitación:</span>
                <code id="t-code" class="invite-code"></code>
                <button class="btn btn--sm" id="copy-code-btn">Copiar</button>
            </div>
            <div class="tournament-btns" id="tournament-btns"></div>
        </div>

        <section class="sprites-list-section" style="margin-top:1.5rem">
            <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem">
                <h3 style="margin:0">Sprites del torneo</h3>
            </div>

            <form id="t-upload-form" class="card upload-form" style="margin-bottom:1.5rem">
                <h3>Subir sprite al torneo</h3>
                <div class="form-row">
                    <label for="t-upload-pokemon">Pokémon</label>
                    <input id="t-upload-pokemon" class="input" type="text" placeholder="pikachu" autocomplete="off">
                </div>
                <div class="form-row">
                    <label for="t-upload-skin-name">Nombre de skin</label>
                    <input id="t-upload-skin-name" class="input" type="text" placeholder="torneo-kanto">
                </div>
                <div class="form-row">
                    <label for="t-upload-file">Archivo (GIF, PNG, WebP · máx 2 MB)</label>
                    <input id="t-upload-file" type="file" accept="image/gif,image/png,image/webp">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn--primary">Subir</button>
                    <span id="t-upload-status" class="upload-status"></span>
                </div>
            </form>

            <div id="t-sprites-list" class="sprites-grid">
                <p class="empty-state">Cargando sprites...</p>
            </div>
        </section>
    </section>
</main>

<script src="tournaments.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `tournaments.js`**

```js
(async function () {
    const meRes = await fetch('/api/auth/me');
    if (!meRes.ok) { window.location.href = '/login.html'; return; }
    const { tier } = await meRes.json();

    if (tier !== 'vip') {
        document.getElementById('access-denied').style.display = '';
        return;
    }

    let activeTournamentId = null;

    async function loadTournament() {
        const res = await fetch('/api/tournaments/mine');
        const t = await res.json();

        if (!t) {
            document.getElementById('no-tournament').style.display = '';
            document.getElementById('active-tournament').style.display = 'none';
            return;
        }

        activeTournamentId = t.id;
        document.getElementById('no-tournament').style.display = 'none';
        document.getElementById('active-tournament').style.display = '';

        document.getElementById('t-name').textContent = t.name;
        document.getElementById('t-members').textContent = `${t.member_count} miembro${t.member_count !== 1 ? 's' : ''}`;
        document.getElementById('t-expires').textContent = `Expira: ${new Date(t.expires_at).toLocaleDateString('es-ES')}`;
        document.getElementById('t-code').textContent = t.invite_code;

        const btns = document.getElementById('tournament-btns');
        if (t.is_creator) {
            btns.innerHTML = `<button id="delete-btn" class="btn btn--danger">Eliminar torneo</button>`;
            document.getElementById('delete-btn').addEventListener('click', async () => {
                if (!confirm('¿Eliminar el torneo? Se borrarán todos los sprites y se notificará a los miembros.')) return;
                const r = await fetch(`/api/tournaments/${t.id}`, { method: 'DELETE' });
                if (r.ok) { activeTournamentId = null; loadTournament(); }
                else alert((await r.json()).error || 'Error al eliminar');
            });
        } else {
            btns.innerHTML = `<button id="leave-btn" class="btn">Salir del torneo</button>`;
            document.getElementById('leave-btn').addEventListener('click', async () => {
                if (!confirm('¿Salir del torneo?')) return;
                const r = await fetch(`/api/tournaments/${t.id}/leave`, { method: 'DELETE' });
                if (r.ok) { activeTournamentId = null; loadTournament(); }
                else alert((await r.json()).error || 'Error');
            });
        }

        loadTournamentSprites(t.id);
    }

    async function loadTournamentSprites(tournamentId) {
        const res = await fetch('/api/sprites/mine');
        const { tournament } = await res.json();
        const list = document.getElementById('t-sprites-list');
        const sprites = tournament?.sprites || [];

        if (!sprites.length) {
            list.innerHTML = '<p class="empty-state">No hay sprites en este torneo aún.</p>';
            return;
        }
        list.innerHTML = sprites.map(s => `
            <div class="sprite-card card" data-id="${s.id}">
                <img src="${s.url}" alt="${s.pokemon}" class="sprite-thumb" onerror="this.style.opacity='0.3'">
                <div class="sprite-info">
                    <span class="sprite-pokemon">${s.pokemon}</span>
                    <span class="sprite-skin">${s.skinName}</span>
                    <span class="sprite-format badge">${s.format}</span>
                </div>
                <button class="btn btn--danger btn--sm delete-btn" data-id="${s.id}">Borrar</button>
            </div>
        `).join('');

        list.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('¿Borrar este sprite del torneo?')) return;
                const r = await fetch(`/api/sprites/${btn.dataset.id}`, { method: 'DELETE' });
                if (r.ok) loadTournamentSprites(tournamentId);
                else alert((await r.json()).error || 'Error al borrar');
            });
        });
    }

    document.getElementById('copy-code-btn').addEventListener('click', () => {
        const code = document.getElementById('t-code').textContent;
        navigator.clipboard.writeText(code).then(() => {
            document.getElementById('copy-code-btn').textContent = '¡Copiado!';
            setTimeout(() => { document.getElementById('copy-code-btn').textContent = 'Copiar'; }, 2000);
        });
    });

    document.getElementById('create-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('create-name').value.trim();
        const status = document.getElementById('create-status');
        if (!name) { status.textContent = 'Escribe un nombre.'; status.className = 'upload-status error'; return; }
        const res = await fetch('/api/tournaments/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        const data = await res.json();
        if (res.ok) loadTournament();
        else { status.textContent = data.error || 'Error'; status.className = 'upload-status error'; }
    });

    document.getElementById('join-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('join-code').value.trim().toUpperCase();
        const status = document.getElementById('join-status');
        if (!code) { status.textContent = 'Escribe un código.'; status.className = 'upload-status error'; return; }
        const res = await fetch('/api/tournaments/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invite_code: code }),
        });
        const data = await res.json();
        if (res.ok) loadTournament();
        else { status.textContent = data.error || 'Error'; status.className = 'upload-status error'; }
    });

    document.getElementById('t-upload-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('t-upload-status');
        const pokemon  = document.getElementById('t-upload-pokemon').value.trim().toLowerCase();
        const skinName = document.getElementById('t-upload-skin-name').value.trim();
        const file     = document.getElementById('t-upload-file').files[0];
        if (!pokemon || !skinName || !file || !activeTournamentId) {
            status.textContent = 'Rellena todos los campos.';
            status.className = 'upload-status error';
            return;
        }
        const fd = new FormData();
        fd.append('pokemon', pokemon);
        fd.append('skinName', skinName);
        fd.append('scope', activeTournamentId);
        fd.append('file', file);
        status.textContent = 'Subiendo...';
        status.className = 'upload-status';
        const res = await fetch('/api/sprites/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok) {
            status.textContent = '¡Sprite subido!';
            status.className = 'upload-status success';
            e.target.reset();
            loadTournamentSprites(activeTournamentId);
        } else {
            status.textContent = data.error || 'Error';
            status.className = 'upload-status error';
        }
    });

    // Styles for tournament-specific elements
    loadTournament();
})();
```

- [ ] **Step 3: Add styles in style.css**

```css
/* tournaments.html */
.tournament-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
@media (max-width: 480px) { .tournament-actions { grid-template-columns: 1fr; } }
.tournament-info { margin-bottom: 0; }
.tournament-meta { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; margin-bottom: 1rem; }
.tournament-name { font-family: 'Russo One', sans-serif; color: var(--text-em); font-size: 1.1rem; }
.tournament-members { color: var(--muted); font-size: 0.8rem; }
.tournament-expires { color: var(--dim); font-size: 0.75rem; }
.tournament-code-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
.tournament-code-row .label { color: var(--muted); font-size: 0.8rem; }
.invite-code { background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 0.3rem 0.75rem; color: var(--blue); font-size: 1rem; letter-spacing: 0.08em; }
.tournament-btns { display: flex; gap: 0.75rem; }
```

- [ ] **Step 4: Test manually**

1. Navigate to `/tournaments.html` as VIP → should show create/join forms
2. Create a tournament → should switch to active tournament view with invite code
3. Copy invite code → paste in second VIP account's join form → verify join works
4. Second account joins → creator sees member_count increase (requires page reload)
5. Upload a tournament sprite as any member → verify it appears in the list
6. Try uploading duplicate (same pokemon + skinName) → verify 409 error message
7. Non-creator member leaves → verify they return to no-tournament view
8. Creator deletes → verify all sprites gone, creator returns to no-tournament view

- [ ] **Step 5: Commit**

```bash
git add tournaments.html tournaments.js style.css
git commit -m "feat(ui): add tournament management page"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| 3 new DB tables | Task 1 |
| R2 bucket + bindings | Task 2 |
| `GET /api/sprites/mine` | Task 3 |
| `POST /api/sprites/upload` (VIP, 2MB, gif/png/webp) | Task 3 |
| `DELETE /api/sprites/:id` | Task 3 |
| `POST /api/tournaments/create` (VIP, auto-join) | Task 4 |
| `POST /api/tournaments/join` (VIP, invite code, one-per-user) | Task 4 |
| `GET /api/tournaments/mine` | Task 4 |
| `DELETE /api/tournaments/:id` (creator, cascade R2 + Ably) | Task 5 |
| `DELETE /api/tournaments/:id/leave` (non-creator) | Task 5 |
| Cron cleanup (daily, `expires_at`) | Task 6 |
| `loadCustomSkins()` in app.js | Task 7 |
| `buildSpriteUrl()` custom skin priority | Task 7 |
| Skin picker shows custom skins | Task 7 |
| Tournament deleted toast (offline case) | Task 7 |
| Tournament deleted modal (real-time Ably) | Task 7 |
| VIP links in header | Task 8 |
| `sprites.html` personal sprites page | Task 9 |
| `tournaments.html` tournament management page | Task 10 |
| Tournament sprite: one per (scope, pokemon, skinName) | Task 3 (upload validation) |
| Replace semantics for personal sprites | Task 3 (upload upsert) |
| R2 public domain `assets.pokemon.mrklypp.com` | Task 2 |
| Auto-delete at 1 year (`expires_at`) | Task 1 + Task 6 |
