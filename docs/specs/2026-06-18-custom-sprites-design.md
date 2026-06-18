# Custom Sprites: Torneos y Sprites Personales

**Date:** 2026-06-18  
**Status:** Approved

## Overview

Allow VIP users to upload custom Pokémon sprites stored in Cloudflare R2. Two scopes: personal (per-user) and tournament (shared among members). Both surface as additional skins in the existing skin picker alongside static sprites.

Priority stack: personal skin > tournament skin > base sprite.

---

## Data Model

### New tables (Neon / PostgreSQL)

```sql
CREATE TABLE tournaments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  created_by  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 year'),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tournament_members (
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tournament_id, user_id)
);

CREATE TABLE custom_sprites (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scope        TEXT NOT NULL,  -- 'personal' | tournament UUID
  pokemon_name TEXT NOT NULL,
  skin_name    TEXT NOT NULL,
  r2_key       TEXT NOT NULL,
  format       TEXT NOT NULL,  -- 'gif' | 'png' | 'webp'
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  -- For personal scope: unique per owner. For tournament scope: unique per tournament
  -- regardless of uploader (enforced at API level; DB constraint covers personal case).
  UNIQUE(owner_id, scope, pokemon_name, skin_name)
);

CREATE INDEX idx_custom_sprites_owner ON custom_sprites(owner_id);
CREATE INDEX idx_custom_sprites_scope ON custom_sprites(scope);
CREATE INDEX idx_tournament_members_user ON tournament_members(user_id);
```

### R2 bucket: `ptv-custom-sprites`

```
personal/{userId}/{pokemonName}/{skinName}.{ext}
tournament/{tournamentId}/{pokemonName}/{skinName}.{ext}
```

Served via public domain: `assets.pokemon.mrklypp.com`

---

## API Routes

All routes require a valid JWT cookie. Routes marked **VIP** additionally require `tier = 'vip'`.

### Sprites

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/sprites/mine` | logged in | Returns personal skins + active tournament skins |
| `POST` | `/api/sprites/upload` | VIP | Upload a custom sprite |
| `DELETE` | `/api/sprites/:id` | VIP | Delete sprite (DB + R2) |

**`GET /api/sprites/mine` response:**
```json
{
  "personal": [
    { "id": "uuid", "pokemon": "charizard", "skinName": "fan-art", "url": "https://assets.pokemon.mrklypp.com/personal/...", "format": "png" }
  ],
  "tournament": {
    "id": "uuid",
    "name": "Torneo Kanto",
    "sprites": [
      { "id": "uuid", "pokemon": "pikachu", "skinName": "torneo-kanto", "url": "https://...", "format": "gif" }
    ]
  }
}
```

`tournament` is `null` if the user is not a member of any tournament.

**`POST /api/sprites/upload` (multipart/form-data):**

Fields: `pokemon` (string), `skinName` (string), `scope` ('personal' | tournament UUID), `file` (binary).

Validations:
- Format: gif, png, webp only
- Max size: 2 MB
- `scope` of type tournament UUID: user must be a member of that tournament
- For tournament scope: if `(scope, pokemon_name, skin_name)` already exists (uploaded by any member), reject with 409 — one skin name per Pokémon per tournament
- Replace semantics (personal only): if `(owner_id, scope, pokemon_name, skin_name)` already exists, overwrite R2 key and update DB row

### Tournaments

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/tournaments/create` | VIP | Create tournament, auto-join creator |
| `POST` | `/api/tournaments/join` | VIP | Join via invite code |
| `GET` | `/api/tournaments/mine` | logged in | Returns active tournament for user |
| `DELETE` | `/api/tournaments/:id/leave` | VIP | Leave tournament (members only, not creator) |
| `DELETE` | `/api/tournaments/:id` | VIP | Delete tournament — creator only, cascades DB + R2 |

**`POST /api/tournaments/create` body:** `{ "name": "Torneo Kanto" }`  
**Response:** `{ "id": "uuid", "name": "Torneo Kanto", "invite_code": "ABC123", "expires_at": "..." }`

**`POST /api/tournaments/join` body:** `{ "invite_code": "ABC123" }`

**`DELETE /api/tournaments/:id`** (creator only):
1. List all R2 keys under `tournament/{tournamentId}/`
2. Batch delete from R2
3. Delete tournament row (CASCADE removes members + custom_sprites rows)
4. Publish Ably event `tournament_deleted` to channel `ptv-tournament-{tournamentId}`

### Cron: Tournament Expiry

Cloudflare Cron Trigger — runs daily at 03:00 UTC.

Route: `GET /api/cron/cleanup-tournaments` (internal, protected by shared secret header).

Logic:
1. `SELECT id FROM tournaments WHERE expires_at < NOW()`
2. For each expired tournament: delete R2 assets, publish Ably `tournament_deleted`, delete DB row
3. Log count of deleted tournaments

---

## Frontend

### New pages

**`sprites.html` + `sprites.js`** — Personal sprite management (VIP only):
- List of uploaded personal sprites grouped by Pokémon
- Upload form: Pokémon name (autocomplete from `pokemon-list.json`), skin name, file picker
- Delete button per sprite

**`tournaments.html` + `tournaments.js`** — Tournament management (VIP only):
- Current tournament: name, invite code (copyable), member count, list of tournament sprites
- Upload form for tournament sprites
- Leave button (for non-creators)
- Delete button (for creator) with confirmation modal
- Join form: invite code input

Both pages linked from the user widget in the header, visible only to VIP users.

### `app.js` changes

**`loadCustomSkins()` — called on init if user is VIP:**
```js
async function loadCustomSkins() {
    const res = await fetch('/api/sprites/mine');
    if (!res.ok) return;
    const { personal, tournament } = await res.json();
    // populate customSkins map: { pokemonName: { skinName: url } }
    for (const s of personal) {
        (customSkins[s.pokemon] ??= {})[s.skinName] = s.url;
    }
    if (tournament) {
        for (const s of tournament.sprites) {
            // personal takes priority — only set if not already in customSkins
            if (!customSkins[s.pokemon]?.[s.skinName]) {
                (customSkins[s.pokemon] ??= {})[s.skinName] = s.url;
            }
        }
        subscribeToTournamentChannel(tournament.id);
    }
}
```

**`buildSpriteUrl()` — custom skin resolution:**
```js
function buildSpriteUrl(name, props) {
    const skin = props.skin || 'common';
    if (skin !== 'common' && customSkins[name]?.[skin]) {
        return customSkins[name][skin]; // direct R2 URL, no SPRITE_VER
    }
    // existing logic unchanged
}
```

**Skin picker** — extended to show custom skins with a badge:
- Personal skins tagged `[personal]`
- Tournament skins tagged `[torneo]`
- Shown after static skins in the dropdown

**Tournament deletion (real-time):**
```js
function subscribeToTournamentChannel(tournamentId) {
    const ch = ably.channels.get(`ptv-tournament-${tournamentId}`);
    ch.subscribe('tournament_deleted', () => {
        showTournamentDeletedModal(); // blocking modal, one confirm button
        clearTournamentSkins();       // remove tournament skins from customSkins
        // slots using a tournament skin fall back to base sprite automatically
    });
}
```

**Tournament deleted (offline / next load):** if `/api/sprites/mine` returns `tournament: null` but slots in team state still reference a skin that no longer exists in `customSkins`, `buildSpriteUrl()` falls back to base sprite silently. A toast is shown: `"Tu torneo anterior ha finalizado."`.

### Multi-format support

`buildSpriteUrl()` already returns the full R2 URL for custom skins (which includes the extension). Static sprites remain `.gif`. No changes needed to `<img>` tags — browsers natively support gif/png/webp.

---

## Overlay (`overlay.html`)

No changes required. `buildOverlayHTML()` in `app.js` already resolves sprite URLs before encoding them into the Ably publish payload. If a slot uses a custom skin, the resolved R2 URL is included directly. The overlay renders whatever URL it receives.

---

## Infrastructure

### R2 bucket

New bucket: `ptv-custom-sprites`  
Public domain: `assets.pokemon.mrklypp.com` (custom domain on R2 bucket)  
CORS: allow GET from `pokemon.mrklypp.com`

New binding in `wrangler.toml`:
```toml
[[r2_buckets]]
binding = "SPRITES_BUCKET"
bucket_name = "ptv-custom-sprites"
```

### Cron Trigger

```toml
[triggers]
crons = ["0 3 * * *"]
```

Cloudflare Pages Functions expose a `scheduled` handler via `functions/_worker.js` or a dedicated scheduled Worker. The cron calls the cleanup logic directly — it is not an HTTP route.

### Secrets (no new secrets needed)

Ably key already bound. R2 accessed via binding (no credentials needed).

---

## Constraints & Limits

| Constraint | Value |
|---|---|
| Upload formats | gif, png, webp |
| Max file size | 2 MB |
| Who can upload | VIP only |
| Who can create tournaments | VIP only |
| Who can join tournaments | VIP only (via invite code) |
| Tournament lifespan | 1 year (auto-deleted by cron) |
| User in multiple tournaments | Not supported — one active tournament per user (enforced at API join route) |

---

## Out of Scope

- Sprite moderation / admin review before publish
- Animated WebP support (treated as static)
- Per-tournament member permissions (all members can upload tournament sprites)
- Tournament member limit
