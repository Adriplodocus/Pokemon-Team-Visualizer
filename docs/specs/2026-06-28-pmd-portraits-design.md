# PMD Portraits — Sprite Theme

**Date:** 2026-06-28
**Status:** Approved

## Summary

Add a new "PMD" sprite theme to the Pokémon Team Visualizer using face portrait sprites from the PMDCollab community repository (https://github.com/PMDCollab/SpriteCollab). Individual emotion PNGs are downloaded directly from the repo via raw.githubusercontent.com using `tracker.json` for name/credit mapping, and `credit_names.txt` for artist contact details. No image processing library needed. A credits page surfaces artist attribution as required by the CC Attribution license.

---

## Architecture

### Data source

GitHub repo: `PMDCollab/SpriteCollab` (raw files via `https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/`).

Key files:
- `tracker.json` — maps `rawId` (e.g. `"0001"`) → `{ name, portrait_credits: { ... } }`
- `credit_names.txt` — TSV: `Name\tDiscord\tContact` per artist
- `portrait/{rawId}/Normal.png` — individual 40×40 portrait PNG per Pokémon (no cropping needed)

### Local sprite storage

```
sprites/PMD/{canonical_name}.png   # Normal portrait (40×40 individual PNG)
sprites/PMD/credits.json           # Artist attribution per Pokémon
```

No shiny subfolder in initial release (shiny recolor files need separate investigation).

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

No skins or female variants for the initial release. The index signals which Pokémon have sprites available.

---

## Components

### 1. `scripts/fetch_pmd_portraits.py` (new)

**Purpose:** One-time (and re-runnable) script to populate `sprites/PMD/`.

**Steps:**
1. Fetch `tracker.json` → parse to build `{ rawId: { name, credit_ids } }` map.
2. Fetch `credit_names.txt` → parse TSV → build `{ artistName: { discord, contact } }` map.
3. For each rawId in tracker.json where a portrait exists (`portrait/{rawId}/Normal.png`):
   a. Normalize PMD name → canonical project name (see rules below).
   b. Download `portrait/{rawId}/Normal.png` → save as `sprites/PMD/{canonical_name}.png`.
   c. Collect credit IDs from tracker portrait credits field → resolve via credit_names map.
4. Write `sprites/PMD/credits.json`.
5. Write/update `sprites/theme-index.json` PMD entry with all successfully downloaded names.

**Dependencies:** `requests` only (`pip install requests`). No Pillow — files are already individual PNGs.

**Name normalization rules:**
- Lowercase
- Spaces → `_`
- Remove apostrophes, dots
- Match against existing `pokemon-list.json`; log warning and skip unmatched

### 2. `sprites/PMD/credits.json` (generated)

```json
{
  "bulbasaur": {
    "primary": { "name": "ArtistName", "contact": "https://..." },
    "secondary": [{ "name": "Other", "contact": "..." }]
  }
}
```

Contact field uses the value from `credit_names.txt` (URL or Discord handle). Omit entries with no credit data.

### 3. `credits-pmd.html` (new page)

Static HTML page, same boilerplate as other pages (no build step, `header.js` injected).

**Content:**
- Intro paragraph: CC Attribution notice linking to PMDCollab repo
- Table: Pokémon | Primary artist (linked to contact) | Secondary artists
- Data loaded from `sprites/PMD/credits.json` via `fetch()`
- i18n: ES/EN strings

### 4. `header.js`

Add a second `<a class="guide-btn">` after the existing Guía button:

```html
<a href="/credits-pmd.html" class="guide-btn" aria-label="Créditos PMD">
  <svg ...><!-- person/attribution icon, consistent with guide-btn SVG style --></svg>
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

No changes required. Existing theme logic already handles PMD:
- `themeExt()` returns `.png` for any non-Showdown theme ✓
- `buildSpriteUrl()` builds `sprites/PMD/{name}.png` ✓
- `themeAvail()` reads from `theme-index.json["PMD"]` ✓

### 7. `scripts/generate_pokemon_list.py`

Verify that `sprites/PMD/` is included when scanning for `pokemon-list.json`. If the script already scans all subdirectories of `sprites/`, no change needed.

---

## Error handling

- Pokémon without PMD portraits: `portrait/{rawId}/Normal.png` fetch returns 404 → skip silently.
- Name normalization miss: log warning with rawId + PMD name; skip that entry.
- Credit data missing: omit that Pokémon from `credits.json`; do not block script.
- Network error during download: log and continue; re-run script to fill gaps (idempotent — skips existing files).

---

## Out of scope

- Shiny/recolor portraits (requires investigating per-entry recolor structure in repo — future work)
- Animated battle sprites (ZIP format, significant complexity)
- Female / skin variants (not applicable to PMD portraits)
- Auto-updating when PMDCollab repo is updated (manual re-run of script)
