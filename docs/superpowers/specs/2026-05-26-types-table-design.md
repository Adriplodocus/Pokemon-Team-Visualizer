# Types Table — Design Spec
_Date: 2026-05-26_

## Summary

New standalone page `types.html` + `types.js` adding a Pokémon type effectiveness calculator (defense mode). Follows the same page/nav pattern as `badges.html`. Localized ES/EN. No server calls — pure static data.

---

## Architecture

### New files
- `types.html` — page shell, same header/nav structure as `badges.html`
- `types.js` — all logic + static data + i18n strings

### Modified files
- `index.html` — add 3rd nav link to `types.html`
- `badges.html` — add 3rd nav link to `types.html`
- `lang.js` — no changes needed (pattern: each page JS calls `setLangBase` via `lang.js`)

### Unchanged
- `style.css` — reuses existing design tokens and component classes; minor additions for type chips if needed
- `app.js`, `badges.js`, `overlay.html` — untouched

---

## Data

### `TYPE_CHART`
Static 18×18 defensive multiplier matrix embedded in `types.js`.  
Rows = defender type, Columns = attacker type.  
Values: `0, 0.5, 1, 2`. Combined multiplier for dual-type = product of both rows.

### `TYPE_NAMES`
```js
const TYPE_NAMES = {
  es: { normal:'Normal', fire:'Fuego', water:'Agua', electric:'Eléctrico',
        grass:'Planta', ice:'Hielo', fighting:'Lucha', poison:'Veneno',
        ground:'Tierra', flying:'Volador', psychic:'Psíquico', bug:'Bicho',
        rock:'Roca', ghost:'Fantasma', dragon:'Dragón', dark:'Siniestro',
        steel:'Acero', fairy:'Hada' },
  en: { normal:'Normal', fire:'Fire', water:'Water', electric:'Electric',
        grass:'Grass', ice:'Ice', fighting:'Fighting', poison:'Poison',
        ground:'Ground', flying:'Flying', psychic:'Psychic', bug:'Bug',
        rock:'Rock', ghost:'Ghost', dragon:'Dragon', dark:'Dark',
        steel:'Steel', fairy:'Fairy' }
};
```

### `TYPE_COLORS`
One hex per type (canonical Pokémon series colors), used for button backgrounds and chips.

---

## UI Layout

```
┌──────────────────────────────────────────────────────┐
│  HEADER / NAV (Pokémon · Medallas · Tipos)           │
├──────────────────┬───────────────────────────────────┤
│  TYPE SELECTOR   │  EFFECTIVENESS TABLE              │
│                  │                                   │
│  [Fuego] [Agua]  │  ×4   [chip] [chip]               │
│  [Planta][Elec]  │  ×2   [chip] [chip] [chip]        │
│  … (18 total)    │  ×1   [chip] …                    │
│                  │  ×0.5 [chip]                      │
│  [Reset]         │  ×0.25 —                          │
│                  │  ×0   [chip]                      │
│                  │                                   │
│                  │  (placeholder if none selected)   │
└──────────────────┴───────────────────────────────────┘
```

On mobile: columns stack vertically (selector on top, table below).

---

## Interaction

### Type selection (FIFO queue, max 2)
| State | Action | Result |
|---|---|---|
| 0 selected | Click type A | `[A]` |
| 1 selected `[A]` | Click A again | `[]` (deselect) |
| 1 selected `[A]` | Click B | `[A, B]` |
| 2 selected `[A, B]` | Click B | `[A]` (deselect B) |
| 2 selected `[A, B]` | Click C | `[B, C]` (A evicted, FIFO) |

### Reset button
Clears `selectedTypes`, re-renders selector (all inactive) and table (placeholder).

---

## Type Effectiveness Calculation

```js
function calcDefense(selectedTypes) {
  // returns { 4: [], 2: [], 1: [], 0.5: [], 0.25: [], 0: [] }
  // For each attacking type, multiply its multiplier across all selected defender types
  // Multiply the individual row values: combined = TYPE_CHART[t1][atk] * TYPE_CHART[t2][atk]
}
```

Rows with no types: omit or render as `—`. Only show rows that have ≥1 type (except ×1 which shows all remaining).  
`×1` row: shown last among the non-trivial rows; contains all attacker types not in other categories.

---

## i18n

`STRINGS` object in `types.js` with ES/EN keys:
- `title` — page title
- `typesMode` — nav label ("Tipos" / "Types table")  
- `resetBtn` — "Resetear" / "Reset"
- `noTypeSelected` — placeholder text
- `multiplierLabel` — (not needed; multiplier values are language-neutral)

`setLang(lang)` → `setLangBase(lang)` + `applyLang()` pattern identical to `badges.js`.

---

## Spec Self-Review

- No TBDs or placeholders.
- Nav label in STRINGS covers both pages that display the nav.
- `TYPE_CHART` data is the only external knowledge dependency — must be verified accurate during implementation.
- Scope: single feature, single spec, implementable in one plan.
- ×1 row behavior (show or hide) is explicitly defined above.
