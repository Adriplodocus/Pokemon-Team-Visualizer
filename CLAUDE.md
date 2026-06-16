# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A static web app that lets streamers build Pokémon overlays for OBS. Deployed on Cloudflare Pages at `https://pokemon.mrklypp.com`. No build step — vanilla JS + Cloudflare Functions.

## Running locally

Serve the root with any static server:

```
npx serve .
```

Cloudflare Functions (`functions/api/`) require `wrangler` with secrets:

```
npx wrangler pages dev . --binding ABLY_API_KEY=<key> --binding DATABASE_URL=<neon-url> --binding TWITCH_CLIENT_ID=<id> --binding TWITCH_CLIENT_SECRET=<secret> --binding GOOGLE_CLIENT_ID=<id> --binding GOOGLE_CLIENT_SECRET=<secret> --binding JWT_SECRET=<secret>
```

## Pages

| File | Purpose |
|---|---|
| `index.html` + `app.js` | Team overlay editor (6 Pokémon slots → OBS) |
| `cemetery.html` + `cemetery.js` | Nuzlocke cemetery overlay |
| `badges.html` + `badges.js` | Gym badge tracker overlay |
| `types.html` + `types.js` | Type effectiveness chart |
| `overlay.html` | OBS Browser Source for team (subscribes to Ably) |
| `badge-overlay.html` | OBS Browser Source for badges |
| `cemetery-overlay.html` | OBS Browser Source for cemetery |
| `login.html` | OAuth login page (Twitch / Google) |
| `admin.html` | Admin panel (tier management) |

## Shared modules

- **`lang.js`** — `currentLang` + `setLangBase()`. Loaded first; every page uses it.
- **`header.js`** — injects `<header>` (nav tabs, lang toggle, user widget) and `<footer>` into every page via `insertAdjacentHTML`. Defines `applyHeaderLang()`, `initUserWidget()`, `exitExternalMode()`. The `ACTIVE_PAGE` global must be declared before loading this script.

## Architecture

### Frontend state (app.js)

- **i18n** — `STRINGS` object at the top (ES/EN). Access via `t(key)`. Elements with `data-i18n` / `data-i18n-ph` updated by `applyLang()`. Each page with extra strings has its own `STRINGS` extension and `apply*Lang()` function.
- **Team state** — 6-element `team[]` array `{ name, mote, properties }`. `localStorage` keys prefixed `ptv_*`.
- **Sprite resolution** — `buildSpriteUrl(name, props)` builds a GIF URL from `BASE_URL` + subdirectory logic (shiny → `shiny/`, female → `female/`, skins → filename suffix). Falls back to canonical sprite on error.
- **Live preview** — `<iframe srcdoc>` rendered by `buildOverlayHTML()` shows a scaled horizontal overlay inline.
- **Presets** — 3 named team snapshots in `localStorage` as `ptv_preset_0/1/2`.
- **Channel ID** — UUID in `localStorage` as `ptv_channel_id`. Identifies the Ably channel.
- **External editing** — `ptv_external_id` / `ptv_external_badge_id` in `sessionStorage` let a user control someone else's overlay via shared URL.

> `FEMALE_VARIANTS` (Set of Pokémon with female sprites) is duplicated in both `app.js` and `cemetery.js`. Keep both in sync when adding entries.

### OBS overlays

Connect to Ably with a token from `/api/token`, subscribe to `ptv-<id>` with `rewind: 1` (receives last published state on connect). Render team DOM on each `update` message. Layout (`horizontal`/`vertical`) set via CSS class on `<body>`.

### Cloudflare Functions (`functions/api/`)

| Route | Purpose |
|---|---|
| `POST /api/publish` | Publishes team JSON to Ably channel via REST |
| `GET /api/token` | Issues subscribe-only Ably token for overlays |
| `GET /api/load` | Fetches last channel message (debugging) |
| `GET /api/auth/login` | OAuth redirect (Twitch or Google) |
| `GET /api/auth/callback` | OAuth callback → sets JWT cookie |
| `GET /api/auth/logout` | Clears session cookie |
| `GET /api/auth/me` | Returns current user `{ username, avatarUrl, tier }` |
| `POST /api/auth/set-tier` | Updates user tier (self or admin) |
| `GET /api/admin/users` | Admin: list all users |
| `POST /api/admin/set-tier` | Admin: change any user's tier |

Shared utilities in `functions/api/_lib/`: `db.js` (Neon client), `jwt.js` (sign/verify), `cookies.js`.

Compiled bundles live in `dist-functions/` (Cloudflare deployment artifact — do not edit directly).

### Auth

OAuth 2.0 with Twitch and Google. On callback, user is upserted into Neon `users` table and a signed JWT is set as an HttpOnly cookie. Tier values: `guest` (default) or `vip`.

### Database (Neon / PostgreSQL)

Schema in `db/schema.sql`. Accessed via `@neondatabase/serverless` (HTTP transport, no TCP). One table: `users` (id, provider, provider_id, username, email, avatar_url, tier). Badge images organized by region under `db/` (reference only — not served from DB).

## Updating Pokémon data

- `scripts/generate_pokemon_list.py` — reads `sprites/*.gif` and writes `pokemon-list.json`. Run after adding sprites.
- `pokemon_catalog.py` — reference for skin variants; drives manual updates to `pokemon-catalog.js`.
- `pokemon-aliases.json` — alternate → canonical name mapping. Both JSON files fetched at runtime by `app.js`.

```
python scripts/generate_pokemon_list.py
```

## Sprites

Animated GIFs under `sprites/`:
- `sprites/shiny/` — shiny variants
- `sprites/female/` — female variants
- `sprites/Mega/` and `sprites/Mega/Shiny/` — Mega Evolutions

Skin variants: `<name>_<skin>.gif` (e.g. `charizard_gmax.gif`).

## Design system

Styles in `style.css`. Always use CSS custom properties (`--pink`, `--blue`, `--bg`, etc.) — never hardcode values. Fonts: Russo One (titles), JetBrains Mono (UI/body/stats). Full token reference in `C:/Proyectos/MrKlypp-design-system`.
