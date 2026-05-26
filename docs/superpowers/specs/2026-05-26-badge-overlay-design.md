# Badge Overlay Feature — Design Spec

**Date:** 2026-05-26  
**Status:** Approved

---

## Overview

Extend Pokémon Team Visualizer to support a gym badge overlay for OBS. Users switch between Pokémon and Badge modes via a toggle in the header. Badge mode lets users select a game, a badge layout, and mark which badges are active. The result is published to a separate Ably channel and rendered in a new `badge-overlay.html` browser source.

---

## Architecture

### New files

| File | Purpose |
|---|---|
| `badges.js` | All badge logic — state, UI, publish, persistence |
| `badge-overlay.html` | OBS browser source for badges |
| `badges/<Region>/1–N.webp` | Badge images per region |

### Modified files

| File | Change |
|---|---|
| `index.html` | Mode toggle in header; badge section HTML; load `badges.js` |
| `style.css` | Styles for badge section (mode toggle, badge checkboxes, slider) |

`app.js` is untouched.

---

## Badge Images

- Stored at `badges/<Region>/<n>.webp`
- Regions (folder names, capital first letter): `Kanto`, `Johto`, `Hoenn`, `Sinnoh`, `Unova1`, `Unova2`, `Kalos`, `Galar`, `Paldea`
- All files are `.webp`

### Badge counts per region

| Region | Count | Notes |
|---|---|---|
| Kanto | 8 | |
| Johto | 8 | |
| Hoenn | 8 | |
| Sinnoh | 8 | |
| Unova1 | 8 | Pokémon Negro / Blanco |
| Unova2 | 8 | Pokémon Negro 2 / Blanco 2 |
| Kalos | 8 | |
| Galar | 10 | Sword+Shield gyms combined |
| Paldea | 8 | |

---

## Game → Region Mapping

Selector shows game names grouped by region (`<optgroup>`). Internally maps to region folder.

```js
const GAME_TO_REGION = {
  'pokemon-rojo':              'Kanto',
  'pokemon-azul':              'Kanto',
  'pokemon-amarillo':          'Kanto',
  'pokemon-rojo-fuego':        'Kanto',
  'pokemon-verde-hoja':        'Kanto',
  'pokemon-lets-go-pikachu':   'Kanto',
  'pokemon-lets-go-eevee':     'Kanto',
  'pokemon-oro':               'Johto',
  'pokemon-plata':             'Johto',
  'pokemon-cristal':           'Johto',
  'pokemon-soulsilver':        'Johto',
  'pokemon-heartgold':         'Johto',
  'pokemon-rubi':              'Hoenn',
  'pokemon-zafiro':            'Hoenn',
  'pokemon-esmeralda':         'Hoenn',
  'pokemon-rubi-omega':        'Hoenn',
  'pokemon-zafiro-alfa':       'Hoenn',
  'pokemon-diamante':          'Sinnoh',
  'pokemon-perla':             'Sinnoh',
  'pokemon-platino':           'Sinnoh',
  'pokemon-diamante-brillante':'Sinnoh',
  'pokemon-perla-reluciente':  'Sinnoh',
  'pokemon-negro':             'Unova1',
  'pokemon-blanco':            'Unova1',
  'pokemon-negro-2':           'Unova2',
  'pokemon-blanco-2':          'Unova2',
  'pokemon-x':                 'Kalos',
  'pokemon-y':                 'Kalos',
  'pokemon-espada':            'Galar',
  'pokemon-escudo':            'Galar',
  'pokemon-escarlata':         'Paldea',
  'pokemon-purpura':           'Paldea',
};
```

---

## State (`badges.js`)

```js
let badgeGame       = '';              // e.g. 'pokemon-rojo'
let badgeRegion     = '';              // e.g. 'Kanto'
let badgeLayout     = '8x1';          // '8x1' | '4x2' | '2x4' | '1x8' | '10x1' | '5x2' | '2x5' | '1x10'
let badgeActive     = [];             // Array<boolean>, length = region badge count
let badgeBrightness = 20;             // 0–50, applied as filter: brightness(N/100) on inactive
let badgeChannelId  = null;           // UUID, localStorage 'ptv_badge_channel_id'
```

### localStorage keys

| Key | Value |
|---|---|
| `ptv_badge_game` | game slug |
| `ptv_badge_layout` | layout string |
| `ptv_badge_active` | JSON array of booleans |
| `ptv_badge_brightness` | number 0–50 |
| `ptv_badge_channel_id` | UUID |

---

## Layouts

Available layouts are computed from badge count: all divisor pairs of N.

| Count | Layouts |
|---|---|
| 8 | 8×1, 4×2, 2×4, 1×8 |
| 10 | 10×1, 5×2, 2×5, 1×10 |

OBS recommended size: `cols * 80` × `rows * 80` px.

Layout select label format: `"4×2 — 320×160 px"`. Updates OBS hint on change.

---

## UI (`index.html` / `badges.js`)

### Header toggle

Pill toggle (Pokémon | Medallas) added to header right side. Switching hides one section, shows the other. Active mode persisted to `ptv_mode` in localStorage. Default: `'pokemon'`.

### Badge section structure

1. **Settings card** — game `<select>` (optgroup by region) + layout `<select>`
2. **Badge checkboxes card** — N badge thumbnails (40×40), each with checkbox below. Inactive = `filter: brightness(badgeBrightness/100)`. Changes trigger preview update.
3. **Brightness card** — slider 0–50, label shows current value. Updates inactive previews live.
4. **Preview card** — `<iframe srcdoc>` scaled to card width, same pattern as Pokémon preview. Shows actual 80×80 badge grid.
5. **OBS panel card** — Browser source hint, recommended size (updates on layout change), URL display + copy button, new channel button. Independent from Pokémon OBS panel.
6. **Actions card** — Publish button + Reset button.
7. **Footer** — same footer HTML block as Pokémon section (duplicated in DOM, always visible regardless of mode).

---

## Inactive Badge Rendering

```css
img.badge-inactive {
  filter: brightness(0.20); /* value from badgeBrightness/100 */
  transition: filter 0.2s;
}
```

No overlay div. Applied directly to `<img>` element in both editor and overlay.

---

## Ably Payload

Channel name: `ptv-badge-<badgeChannelId>`

```json
{
  "region": "Kanto",
  "layout": "8x1",
  "active": [true, true, true, false, false, false, false, false],
  "brightness": 20
}
```

---

## `badge-overlay.html`

- Connects to Ably via `/api/token` (same endpoint, subscribe-only)
- Channel: `ptv-badge-<id>` with `rewind: 1`
- On `update` message: renders badge grid
- Badge image URL: `badges/<region>/<n>.webp` (relative)
- Inactive: `filter: brightness(brightness/100)` on `<img>`
- No shadow, no pokéball background
- `fadeSlideUp` animation on load (same keyframe as Pokémon overlay)
- Grid: CSS grid with `grid-template-columns: repeat(cols, 80px)`, `gap: 0`

---

## i18n

Badge strings added to a separate `BADGE_STRINGS` object in `badges.js` (ES/EN). `badges.js` exports its own `applyBadgeLang()` function called from the global `setLang()` in `app.js` after `applyLang()`. Keys:
`badgeMode`, `pokemonMode`, `badgeGame`, `badgeLayout`, `badgeBrightness`, `badgeInactive`, `badgeObsHint`, `badgePublishBtn`, `badgeResetBtn`, `badgePublishOk`, `badgePublishErr`, `badgeNewChannel`, `badgeNewChannelConfirm`, `badgeUrlLabel`, `badgeUrlSub`, `badgeUrlCopy`, `badgeUrlCopied`.

---

## Out of scope

- Drag-and-drop reorder of badges
- Presets for badge configurations
- Multiple game sessions simultaneously
