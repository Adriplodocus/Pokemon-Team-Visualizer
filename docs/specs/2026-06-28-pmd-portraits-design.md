# PMD Portraits — Sprite Theme

**Date:** 2026-06-28
**Status:** Approved

## Summary

Add a new "PMD" sprite theme to the Pokémon Team Visualizer using face portrait sprites from the PMDCollab community repository (https://sprites.pmdcollab.org). Portraits are downloaded locally via a Python script, cropped to the "Normal" emotion tile (40×40 px), and stored in `sprites/PMD/`. A credits page surfaces artist attribution as required by the CC license.

---

## Architecture

### Data source

PMDCollab exposes a GraphQL API at `https://spriteserver.pmdcollab.org/graphql`.

Key query: `monster(id: Int!)` → returns `rawId` (e.g. `"0001"`), `name`, and `forms[].portraits { sheetUrl, recolorSheetUrl, creditPrimary, creditSecondary }`.

Portrait sheet URL pattern:
- Default: `https://spriteserver.pmdcollab.org/assets/portrait-{rawId}.png`
- Shiny/recolor: `https://spriteserver.pmdcollab.org/assets/portrait_recolor-{rawId}-0000-0001.png`

Each sheet is a spritesheet (160 × variable px) with 40×40 emotion tiles arranged in a 4-column grid. Tile at position (0, 0) is the "Normal" emotion.

### Local sprite storage

```
sprites/PMD/{canonical_name}.png        # Normal emotion tile (40×40)
sprites/PMD/shiny/{canonical_name}.png  # Recolor/shiny tile (40×40)
sprites/PMD/credits.json                # Artist attribution per Pokémon
```

### Theme index

`sprites/theme-index.json` gains a `"PMD"` key following the existing structure:

```json
{
  "PMD": {
    "bulbasaur": {},
    "charmander": {},
    ...
  }
}
```

No skins or female variants for the initial release (PMD portraits do not use the same skin system). The index serves primarily to signal which Pokémon have sprites available.

---

## Components

### 1. `scripts/fetch_pmd_portraits.py` (new)

**Purpose:** One-time (and re-runnable) script to populate `sprites/PMD/`.

**Steps:**
1. Iterate monster IDs 1–1010 via GraphQL `monster(id: N)`.
2. Skip nulls (non-existent IDs).
3. Normalize PMD name → canonical project name (lowercase, replace spaces with `_`, strip punctuation to match existing naming).
4. Download portrait sheet → crop tile (0, 0) at 40×40 → save as `sprites/PMD/{name}.png`.
5. Download recolor sheet (if URL differs from default) → crop same tile → save as `sprites/PMD/shiny/{name}.png`. Skip if recolor sheet is the same as the default (some Pokémon have no shiny variant).
6. Collect `creditPrimary` and `creditSecondary` IDs. Fetch credit details (`name`, `contact`) from `credit(id)` GraphQL query for unique IDs.
7. Write `sprites/PMD/credits.json`.
8. Write/update `sprites/theme-index.json` PMD entry.

**Dependencies:** `requests`, `Pillow` (`pip install requests pillow`).

**Name normalization rules:**
- Lowercase
- Spaces → `_`
- Remove apostrophes, dots
- Match against existing `pokemon-list.json`; skip unmatched (log as warning)

### 2. `sprites/PMD/credits.json` (generated)

```json
{
  "bulbasaur": {
    "primary": { "name": "ArtistName", "contact": "https://..." },
    "secondary": [{ "name": "Other", "contact": "..." }]
  }
}
```

### 3. `credits-pmd.html` (new page)

Static HTML page (same boilerplate as other pages in the project — no build step).

**Content:**
- Header via `header.js`
- Intro: "Los sprites PMD provienen de PMDCollab (CC Attribution). Aquí puedes ver a los artistas que los crearon."
- Table: Pokémon name | Primary artist (linked to contact) | Secondary artists
- Data loaded from `sprites/PMD/credits.json` via `fetch()`
- i18n: ES/EN strings

### 4. `header.js`

Add a second `<a class="guide-btn">` after the existing one:

```html
<a href="/credits-pmd.html" class="guide-btn" aria-label="Créditos PMD">
  <svg ...><!-- use an existing SVG icon consistent with the guide-btn style, e.g. a person/credit icon --></svg>
  <span data-i18n-header="creditsBtn">Créditos</span>
</a>
```

Add to `HEADER_STRINGS`:
- ES: `creditsBtn: 'Créditos'`
- EN: `creditsBtn: 'Credits'`

### 5. `index.html`

Add option to `#theme-select`:

```html
<option value="PMD">PMD</option>
```

### 6. `app.js`

No changes required. Existing theme logic already handles the PMD theme:
- `themeExt()` returns `.png` for any non-Showdown theme ✓
- `buildSpriteUrl()` builds `sprites/PMD/{name}.png` ✓
- `themeAvail()` reads from `theme-index.json["PMD"]` ✓

### 7. `scripts/generate_pokemon_list.py`

Ensure `sprites/PMD/` is included when scanning sprite directories for `pokemon-list.json`. If the script already scans all subdirs of `sprites/`, no change needed — verify only.

---

## Error handling

- Pokémon without PMD portraits: broken image (same behavior as missing sprites in other themes). No special fallback — consistent with existing system.
- Credit fetch failures: log and skip; credits.json entry omitted for that Pokémon.
- Recolor sheet identical to default sheet: compare `recolorSheetUrl` vs `sheetUrl` strings; if equal, skip shiny download and omit `sprites/PMD/shiny/{name}.png`.

---

## Out of scope

- Animated sprites (ZIP format, significant complexity — separate feature if ever needed)
- Female / skin variants for PMD (not applicable in the same way)
- Auto-updating portraits when PMDCollab is updated (manual re-run of script)
