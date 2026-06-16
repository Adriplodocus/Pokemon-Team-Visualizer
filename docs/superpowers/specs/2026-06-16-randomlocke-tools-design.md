# Randomlocke Tools — Design Spec

**Date:** 2026-06-16  
**Status:** Approved  
**URL:** `/randomlocke.html` (no nav button until feature is released)

---

## Overview

New page "Herramientas para randomlocke" (ES) / "Randomlocke Tools" (EN) with three features:

1. **Route history** — track zones where the user has already caught a Pokémon
2. **Life counter** — embed a StreamCounters overlay via iframe
3. **Twitch bot** — global bot that responds to `!check <zone>` in the user's channel

Page requires login. Follows existing page conventions (`ACTIVE_PAGE`, `header.js`, `lang.js`, `style.css`).

---

## Architecture

```
randomlocke.html + randomlocke.js
     │
     ├─ Route history
     │    GET    /api/randomlocke/routes        → D1 (randomlocke_routes)
     │    POST   /api/randomlocke/routes        → D1
     │    DELETE /api/randomlocke/routes/:id    → D1
     │
     ├─ Life counter
     │    <iframe> → user-supplied StreamCounters URL (localStorage)
     │
     └─ Twitch bot
          GET  /api/randomlocke/bot/status      → DO state
          POST /api/randomlocke/bot/start       → TwitchBotDO.connect()
          POST /api/randomlocke/bot/stop        → TwitchBotDO.disconnect()
               │
               TwitchBotDO (Durable Object, one per user_id)
                    ├─ WebSocket → irc-ws.chat.twitch.tv
                    ├─ Parses !check <zone> from chat
                    └─ Queries D1 routes → replies in channel
```

---

## Database

### New table: `randomlocke_routes`

```sql
CREATE TABLE randomlocke_routes (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    zone_name   TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_randomlocke_routes_user ON randomlocke_routes(user_id);
```

No `bot_accounts` table — bot credentials are global secrets.

---

## Cloudflare Secrets (wrangler)

```
BOT_ACCESS_TOKEN     Twitch OAuth access token for the global bot account
BOT_REFRESH_TOKEN    Twitch OAuth refresh token for the global bot account
BOT_USERNAME         Bot account username (e.g. "mrklyppbot")
```

Set via `wrangler pages secret put <NAME>`.

---

## Durable Object: `TwitchBotDO`

One DO instance per user (`idFromName(userId)`).

**Endpoints (internal fetch):**
- `POST /connect` — opens IRC WebSocket, JOINs user's channel
- `POST /disconnect` — closes WebSocket
- `GET /status` — returns `{ connected: bool, channel: string }`

**IRC flow:**
1. Connect to `wss://irc-ws.chat.twitch.tv:443`
2. Send `PASS oauth:<BOT_ACCESS_TOKEN>`, `NICK <BOT_USERNAME>`, `JOIN #<user_channel>`
3. On PING → send PONG
4. On PRIVMSG matching `!check <zone>` (case-insensitive):
   - Query D1: `SELECT id FROM randomlocke_routes WHERE user_id = ? AND lower(zone_name) = lower(?)`
   - Found → `PRIVMSG #channel :✅ <zone> ya fue atrapada`
   - Not found → `PRIVMSG #channel :❌ <zone> está libre`

**Token refresh:**
- On 401 from Twitch → call Twitch token refresh endpoint → update secrets via internal mechanism (see note below)
- Token refresh uses `BOT_REFRESH_TOKEN` → gets new `access_token` → stored back (TBD: storage mechanism for refreshed token, since Cloudflare secrets are write-only at deploy time; use D1 table `bot_token` with a single row, or KV)

> **Note:** Refreshed tokens must persist somewhere. Use a D1 table `bot_global_token (access_token, refresh_token, updated_at)` — single row, overwritten on each refresh. DO reads from this table on connect instead of from secrets (secrets used only as initial seed).

---

## API Routes (`functions/api/randomlocke/`)

### `routes.js` — GET, POST, DELETE

```
GET    /api/randomlocke/routes
  Auth: JWT required
  Response: [{ id, zone_name, created_at }]

POST   /api/randomlocke/routes
  Auth: JWT required
  Body: { zone: string }
  Validation: non-empty, max 100 chars
  Response: { id, zone_name, created_at }

DELETE /api/randomlocke/routes/:id
  Auth: JWT required
  Validates route belongs to user
  Response: { ok: true }
```

### `bot.js` — GET status, POST start/stop

```
GET  /api/randomlocke/bot/status
  Auth: JWT required
  Calls DO /status
  Response: { connected: bool, channel: string | null }

POST /api/randomlocke/bot/start
  Auth: JWT required
  Calls DO /connect with { token, channel: user.username }
  Response: { ok: true }

POST /api/randomlocke/bot/stop
  Auth: JWT required
  Calls DO /disconnect
  Response: { ok: true }
```

---

## Frontend (`randomlocke.js`)

### State (in-memory + DB)
- `routes[]` — loaded from API on page load
- `iframeUrl` — read/written to `localStorage` key `ptv_streamcounters_url`

### i18n keys (added to `STRINGS`)
```
randomlockeTitle, routeHistory, addZone, addZoneBtn, searchZone,
lifeCounter, overlayUrl, twitchBot, botStatus, activateBot,
deactivateBot, checkCmd, zoneFound, zoneFree,
connected, disconnected
```

### Key interactions
- Add zone: `POST /api/randomlocke/routes` → prepend to list
- Delete zone: `DELETE /api/randomlocke/routes/:id` → remove from list
- Search: client-side filter on `routes[]` by substring match
- iframe: updates `src` on blur of URL input
- Bot toggle: calls start/stop, updates status indicator
- On load: fetch routes + fetch bot status

---

## UI Layout

```
┌─────────────────────────────────────────────┐
│ Historial de rutas                          │
│                                             │
│ [🔍 Buscar zona...          ]               │
│ [Añadir zona...    ] [+ Añadir]             │
│                                             │
│ ✕  Ruta 22                                  │
│ ✕  Torre Pokémon                            │
│ ✕  Cueva Roca                               │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Contador de vidas                           │
│                                             │
│ URL del overlay  [___________________]      │
│                                             │
│ ┌───────────────────────────────────────┐   │
│ │         <iframe StreamCounters>       │   │
│ └───────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Bot de Twitch                               │
│                                             │
│  Estado: ● Desactivado                      │
│  Canal:  #mrklypp                           │
│                                             │
│  [  Activar bot  ]                          │
│                                             │
│  Responde a: !check <zona>                  │
└─────────────────────────────────────────────┘
```

---

## Out of scope

- Bot responding to other commands beyond `!check`
- Multiple bot commands configuration UI
- StreamCounters API integration (iframe only for now)
- Nav button (added when feature is released publicly)
- Zone categories or grouping
