# Cementerio Nuzlocke — Design Spec

**Date:** 2026-05-26
**Status:** Approved

---

## Overview

New standalone overlay for Nuzlocke runs. Streamers manually add fainted Pokémon to a cemetery editor; the cemetery overlay updates live in OBS. Completely independent from the existing team overlay — no changes to `index.html`, `app.js`, or `overlay.html`.

---

## Navigation

`Pokémon | Cementerio | Medallas | Tabla de tipos`

Cemetery is added as the second item in the mode toggle nav (between Pokémon and Medallas).

---

## New Files

### `cemetery.html` — Editor (opens in browser)

- Same nav bar as other pages, Cemetery tab active
- Pokémon selector identical to `index.html`: autocomplete input, properties modal (shiny / gender / skin)
- "Añadir / Add" button → appends Pokémon to the cemetery list
- Cemetery list: sprite (full color, no filter) + Pokémon name/nickname, ✕ button per entry
- "Publicar en OBS / Publish to OBS" button → POSTs `cemetery-update` message to `/api/publish`
- State persisted to `localStorage` under key `ptv_cemetery`
- i18n ES/EN using the same `STRINGS` / `t()` pattern as `app.js`
- OBS URL display: shows `cemetery-overlay.html?id=<channelId>` with copy button (same pattern as `index.html` obs-url-row)
- "Nuevo enlace / New link" button reuses existing channel ID logic

### `cemetery-overlay.html` — OBS Browser Source

- Transparent background (`background: transparent`)
- On load: fetches Ably token from `/api/token`, subscribes to channel `ptv-<id>` with `rewind: 1`
- Listens for messages where `data.type === 'cemetery-update'`
- Renders a grid of Pokémon sprites using the same `buildSpriteUrl` logic as `overlay.html`
- Sprites displayed at full color (no CSS filter)
- Grid grows downward; on each update, scrolls to the last added entry (`scrollIntoView({ behavior: 'smooth' })`)
- Recommended OBS size: configurable by streamer (transparent bg, fits any layout)

---

## Data Shape

Message published to Ably via `/api/publish`:

```json
{
  "type": "cemetery-update",
  "pokemon": [
    { "name": "charizard", "mote": "Ember", "props": { "shiny": false, "gender": "m", "skin": null } }
  ]
}
```

Full array every publish (not a delta). Overlay replaces its full state on each message.

---

## Reuse

| Existing piece | How reused |
|---|---|
| `/api/publish` | Same endpoint, same channel ID, new message type |
| `/api/token` | Same endpoint, no changes |
| `pokemon-catalog.js` | Loaded in `cemetery.html` for skin variant logic |
| `pokemon-list.json` + `pokemon-aliases.json` | Fetched for autocomplete |
| `style.css` | Shared styles; new `.cemetery-*` classes added |
| `lang.js` | Shared lang toggle |

---

## New i18n Keys

| Key | ES | EN |
|---|---|---|
| `cemeteryTitle` | `Cementerio` | `Cemetery` |
| `cemeteryAdd` | `Añadir al cementerio` | `Add to cemetery` |
| `cemeteryEmpty` | `Ningún Pokémon en el cementerio.` | `No Pokémon in the cemetery.` |
| `cemeteryPublish` | `📡 Publicar cementerio en OBS` | `📡 Publish cemetery to OBS` |
| `cemeteryPublishOk` | `¡Cementerio actualizado en OBS!` | `Cemetery updated in OBS!` |

---

## Streamer Flow

1. Open `cemetery.html` in browser
2. Type Pokémon name → autocomplete → set properties → "Añadir"
3. Click "Publicar en OBS" → cemetery overlay updates live
4. To remove a Pokémon: click ✕ in the editor → "Publicar en OBS"
5. Cemetery overlay URL is the same as `overlay.html` URL pattern but for `cemetery-overlay.html`

---

## Constraints & Decisions

- **No nuzlocke mode in `index.html`** — team editor unchanged; streamer removes Pokémon from team manually
- **Full array per publish** — simpler than delta; cemetery size is small enough that full replace is fine
- **No server-side persistence** — `rewind: 1` on Ably recovers last state; `localStorage` recovers editor state
- **Sprites at full color** — streamer decision; no grayscale filter applied
- **Unlimited entries** — grid grows; scroll to latest on update
- **Separate HTML file** — consistent with `badges.html` and `types.html` pattern

---

## Out of Scope

- Automatic sync between team and cemetery (no "kill" button in team editor)
- Cause of death / level / location metadata
- Nuzlocke rule enforcement
- Freemium gating (cemetery treated same as team publish)
