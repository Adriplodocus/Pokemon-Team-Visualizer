# Sprite Reorganization Design

**Date:** 2026-05-20  
**Status:** Approved

## Problem

The current sprite naming convention uses `-` as both a separator within Pokémon names (`wo-chien`, `tapu-koko`) and as a modifier suffix (`-f` for female, `-alola` for regional forms). This causes ambiguity — `wo-chien-f.gif` is indistinguishable from a hypothetical Pokémon named `wo` with skin `chien-f`. It also produces messy shiny filenames with a trailing ` (1)` suffix inherited from Cloudflare Pages uploads.

## Convention

| Character | Meaning | Example |
|-----------|---------|---------|
| `-` | Part of Pokémon name | `wo-chien`, `tapu-koko`, `mr-mime` |
| `_` | Skin/form modifier | `raichu_alola`, `pikachu_cosplay` |
| `female/` subfolder | Female variant | `female/pikachu.gif` |
| `shiny/` subfolder | Shiny variant | `shiny/pikachu.gif` |

Rules are independent and composable: a shiny female alolan Raichu lives at `shiny/female/raichu_alola.gif`.

## Directory Structure

```
sprites/
  {name}.gif                     normal, neutral/male
  {name}_{skin}.gif              normal, skin variant
  female/
    {name}.gif                   normal, female
    {name}_{skin}.gif            normal, skin + female
  shiny/
    {name}.gif                   shiny, neutral/male
    {name}_{skin}.gif            shiny, skin variant
    female/
      {name}.gif                 shiny, female
      {name}_{skin}.gif          shiny, skin + female
  Mega/                          unchanged (not used by code yet)
  Mega/Shiny/                    unchanged (not used by code yet)
```

## File Migration Rules

All ~3000 normal and shiny sprites are migrated by script. No manual renaming.

### Normal sprites (sprites/ root)

| Pattern | Destination | Example |
|---------|-------------|---------|
| `{name}.gif` | `{name}.gif` | no change |
| `{name}-{skin}.gif` | `{name}_{skin}.gif` | `raichu-alola.gif` → `raichu_alola.gif` |
| `{name}-f.gif` | `female/{name}.gif` | `pikachu-f.gif` → `female/pikachu.gif` |
| `{name}-{skin}-f.gif` | `female/{name}_{skin}.gif` | `pikachu-cosplay-f.gif` → `female/pikachu_cosplay.gif` |

Skin names are derived from `POKEMON_CATALOG` — for each Pokémon, its known skins are used to identify which `-{skin}` suffix to replace with `_{skin}`.

### Shiny sprites (sprites/Shiny/ → sprites/shiny/)

Same rules as above, plus:
- Source folder `Shiny/` (uppercase) becomes `shiny/` (lowercase)
- Trailing ` (1)` suffix is stripped from all filenames

| Pattern | Destination |
|---------|-------------|
| `{name} (1).gif` | `shiny/{name}.gif` |
| `{name}-{skin} (1).gif` | `shiny/{name}_{skin}.gif` |
| `{name}-f (1).gif` | `shiny/female/{name}.gif` |
| `{name}-{skin}-f (1).gif` | `shiny/female/{name}_{skin}.gif` |

## Code Changes (app.js)

### `buildSpriteUrl` rewrite

```javascript
function buildSpriteUrl(name, props) {
    const lower   = name.toLowerCase();
    const shiny   = props.shiny === 'True';
    const skin    = props.skin  || 'common';
    const gender  = props.gender || 'male';

    const catalog  = POKEMON_CATALOG[lower] || {};
    const skins    = catalog.skin || [];
    const hasFemale = FEMALE_VARIANTS.has(lower);

    let fileName = lower;
    let folder   = BASE_URL;

    if (skin !== 'common' && skins.includes(skin)) {
        fileName += '_' + skin;   // underscore separator
    }
    if (shiny) {
        folder += 'shiny/';       // lowercase, no ' (1)'
    }
    if (gender === 'female' && hasFemale) {
        folder += 'female/';      // subfolder instead of -f suffix
    }

    return folder + encodeURIComponent(fileName) + '.gif';
}
```

The three modifiers (skin, shiny, female) are now fully independent — each appends to either `fileName` or `folder` without interfering with the others.

### `refreshSprite` fallback

The existing fallback URL (`BASE_URL + name + '.gif'`) remains correct and unchanged — it always points to the root normal sprite.

## What Does NOT Change

- `FEMALE_VARIANTS` set in `app.js`
- `pokemon-catalog.js` — skin values are identifiers, not filenames
- `pokemon-list.json` — Pokémon names are unaffected
- `sprites/Mega/` and `sprites/Mega/Shiny/` — left as-is (not referenced by code)
- The fallback logic in `refreshSprite`

## Migration Script

A Python script (`scripts/migrate-sprites.py`) will:

1. Read `POKEMON_CATALOG` skin data from `pokemon-catalog.js`
2. Create `sprites/female/`, `sprites/shiny/`, `sprites/shiny/female/`
3. Rename all skin-variant files in `sprites/` root (`-{skin}` → `_{skin}`)
4. Move female files from `sprites/` root to `sprites/female/`
5. Move and rename all files from `sprites/Shiny/` to `sprites/shiny/` (strip ` (1)`, apply skin and female rules)
6. Remove the now-empty `sprites/Shiny/` directory

The script operates on actual filenames — no assumptions, no regex guessing. For each Pokémon + skin combination it knows the exact source and destination filename.

## Testing

After migration, verify:
- Normal sprite loads for a base Pokémon (e.g. pikachu)
- Normal female loads (e.g. pikachu female)
- Skin variant loads (e.g. raichu alola)
- Shiny loads (e.g. pikachu shiny)
- Shiny female loads (e.g. pikachu shiny + female)
- Hyphenated name loads (e.g. wo-chien)
- Fallback works when variant doesn't exist (e.g. poliwhirl female → shows poliwhirl)
