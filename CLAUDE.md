# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A static web app that lets streamers build a Pokémon team overlay for OBS. Users enter up to 6 Pokémon names, configure gender/skin/shiny properties, and publish the team live to a browser-source URL via Ably real-time messaging. Deployed on Cloudflare Pages at `https://pokemon.mrklypp.com`.

## Running locally

No build step. Open `index.html` directly in a browser, or serve the root with any static server:

```
npx serve .
```

The Cloudflare Functions (`functions/api/`) require `wrangler` to run locally with the `ABLY_API_KEY` secret:

```
npx wrangler pages dev . --binding ABLY_API_KEY=<key>
```

## Updating Pokémon data

Two Python scripts in `scripts/` maintain the autocomplete and catalog data:

- `generate_pokemon_list.py` — reads `sprites/*.gif` filenames and writes `pokemon-list.json`
- `pokemon_catalog.py` — source of truth for skin variants per Pokémon (not a runnable script; used as reference when maintaining `pokemon-catalog.js`)

Run the list generator after adding new sprites:

```
python scripts/generate_pokemon_list.py
```

`pokemon-aliases.json` maps alternate names (regional names, fan names) to canonical sprite filenames. `pokemon-list.json` and `pokemon-aliases.json` are both fetched at runtime by `app.js`.

## Architecture

### Frontend (`index.html` + `app.js` + `style.css`)

- **i18n** — all UI strings live in the `STRINGS` object at the top of `app.js` (ES/EN). Strings accessed via `t(key)`. Elements with `data-i18n` attributes are updated by `applyLang()`.
- **State** — a 6-element `team` array holds `{ name, mote, properties }` per slot. Persisted to `localStorage` under `ptv_*` keys.
- **Sprite resolution** — `buildSpriteUrl(name, props)` constructs a GIF URL from `BASE_URL` + subfolder logic (shiny → `shiny/`, female → `female/`, skins → filename suffix). On error, falls back to the canonical sprite.
- **Live preview** — an `<iframe srcdoc>` rendered by `buildOverlayHTML()` shows a scaled preview of the horizontal overlay directly in the editor.
- **Presets** — up to 3 named team snapshots stored in `localStorage` as `ptv_preset_0/1/2`.
- **Channel ID** — a UUID stored in `localStorage` as `ptv_channel_id` identifies the Ably channel. Generates a new one if missing.

### OBS overlay (`overlay.html`)

Loaded as an OBS Browser Source. Connects to Ably with a token from `/api/token` and subscribes to the `ptv-<id>` channel with `rewind: 1` (receives the last published state on connect). Renders the team DOM on each `update` message. Supports `horizontal` and `vertical` layouts via CSS classes on `<body>`.

### Cloudflare Functions (`functions/api/`)

| Route | Purpose |
|---|---|
| `POST /api/publish` | Publishes team JSON to the Ably channel via REST API |
| `GET /api/token` | Issues a subscribe-only Ably token for `overlay.html` |
| `GET /api/load` | Fetches the last message from a channel (used for debugging) |

All three require the `ABLY_API_KEY` environment variable.

### Sprites

Stored under `sprites/` as animated GIFs. Subdirectories:
- `sprites/shiny/` — shiny variants
- `sprites/female/` — female sprite variants
- `sprites/Mega/` and `sprites/Mega/Shiny/` — Mega Evolution sprites

Skin variants are encoded in the filename: `<name>_<skin>.gif` (e.g., `charizard_gmax.gif`).

## Design system

Follow the MrKlypp brand system defined in `~/.claude/CLAUDE.md` (global instructions). Key tokens: `--pink: #FF56B4`, `--blue: #00CCFF`, `--bg: #1E1E1E`. Fonts: Russo One (titles), Syne (UI), JetBrains Mono (stats/counters).
