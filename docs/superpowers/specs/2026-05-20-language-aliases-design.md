# Language Aliases Design

**Date:** 2026-05-20  
**Status:** Approved

## Goal

Support Pokémon name variants by language (ES/EN) in a structured, maintainable way. Both language names are always accepted in autocomplete, and each alias may have its own sprite.

## Data Structure

### `pokemon-aliases.json` (new file)

Maps canonical English name → array of language aliases (starting with ES).

```json
{
  "roaringmoon":  ["bramaluna"],
  "screamtail":   ["colagrito"],
  "ragingbolt":   ["electrofuria"],
  "ironjugulis":  ["ferrocuello"],
  "ironcrown":    ["ferrodada"],
  "irontreads":   ["ferromole"],
  "ironvaliant":  ["ferropaladín"],
  "ironhands":    ["ferropalmas"],
  "ironmoth":     ["ferropolilla"],
  "ironthorns":   ["ferropúas"],
  "ironbundle":   ["ferrosaco"],
  "ironboulder":  ["ferrotesta"],
  "ironleaves":   ["ferroverdor"],
  "gougingfire":  ["flamariete"],
  "brutebonnet":  ["furioseta"],
  "fluttermane":  ["melenaleteo"],
  "walkingwake":  ["ondulagua"],
  "slitherwing":  ["reptalada"]
}
```

### `pokemon-list.json` (modified)

Remove the 18 ES aliases listed above. The file becomes the canonical EN list (plus entries with no identified EN equivalent: `colmilargo`, `pelarena`).

## Runtime Behavior (app.js changes)

### Loading

Fetch both files in parallel at startup. No change to loading flow — same Promise.all pattern.

### In-memory structures

```js
// alias → canonical EN name
const ALIAS_TO_CANONICAL = {};

// populated from pokemon-aliases.json:
// { "bramaluna": "roaringmoon", "ferropalmas": "ironhands", ... }
```

### pokemonNames array

Built as: `[...canonicalList, ...Object.values(aliases).flat()]`  
Result: same flat array as before, but now structured at source.

### Sprite loading

No change. Each alias keeps its own `.gif`. `buildSpriteUrl` uses the entered name directly.  
Fallback rule: if an alias has no sprite, load the canonical sprite instead.

## Entries with no identified EN equivalent

`colmilargo` and `pelarena` stay in `pokemon-list.json` as-is. They have their own sprites and no matching EN entry in the current list.

## Out of scope

- Full ES dictionary for all ~1000 Pokémon
- UI language switching affecting autocomplete results
- Normalizing team exports to canonical names
