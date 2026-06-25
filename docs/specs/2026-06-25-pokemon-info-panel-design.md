# Pokémon Info Panel — Design Spec
_Date: 2026-06-25_

## Summary

Extend the types page (`types.html` / `types.js`) to show additional Pokémon data below the existing sprite+types row, within the `pk-search-section` card. The type effectiveness table below the separator is unchanged.

## Scope

Four new data blocks rendered when a Pokémon is selected:
1. Status badge (Común / Legendario / Mítico / Bebé)
2. Abilities (including hidden ability)
3. Base stats with bar chart
4. Evolution chain tree (all branches)

---

## API Calls

Three sequential calls inside the expanded `resolvePokemonTypes`:

```
1. GET /api/v2/pokemon/{slug}          (already exists)
   Extract: types[], stats[], abilities[], species.url

2. GET {species.url}                   (new)
   Extract: is_legendary, is_mythical, is_baby, evolution_chain.url

3. GET {evolution_chain.url}           (new)
   Extract: chain (recursive evolves_to tree)
```

- Types render immediately after step 1 (existing behavior preserved).
- Info panel renders after all 3 steps complete.
- The existing `reqId` guard covers all 3 steps — stale responses are discarded.
- Loading state shown in `pk-info` while steps 2+3 are in flight.

---

## HTML Structure

Add after `#pk-result` in `types.html`:

```html
<div id="pk-info" style="display:none">
  <div id="pk-info-badge"></div>
  <div id="pk-info-abilities"></div>
  <div id="pk-info-stats"></div>
  <div id="pk-info-evo"></div>
</div>
```

`clearPkSearch()` hides `#pk-info` and empties its children.

---

## JS Functions

| Function | Input | Output |
|---|---|---|
| `renderPkBadge(species)` | species response object | badge chip |
| `renderPkAbilities(abilities)` | abilities array from pokemon response | ability chips |
| `renderPkStats(stats)` | stats array from pokemon response | stat bars |
| `renderPkEvo(chain, selectedName)` | chain object + current name | evo tree |
| `flattenChain(node)` | chain node | `[{ species, parentSpecies, method, depth }]` |

`applyTypeLang()` calls `renderPkResult()` (existing) and additionally calls `renderPkBadge`, `renderPkAbilities`, `renderPkStats`, `renderPkEvo` if `#pk-info` is currently visible — so all blocks re-render with the new language. Each render function reads from module-level state (`selectedPokemon`, cached species/chain data).

### flattenChain algorithm

DFS traversal of the recursive `chain` object. Each edge produces:
```js
{ from: speciesName, to: speciesName, method: { level, trigger, item } }
```

Evolution method display priority:
- `min_level` present → "nv.X" / "lv.X"
- `trigger.name === 'use-item'` → item name
- `trigger.name === 'trade'` → "intercambio" / "trade"
- otherwise → trigger name (humanized)

### Evo tree render

- **Linear** (each node has exactly 1 branch): horizontal row `[A] → [B] → [C]`
- **Branching**: left column = parent node, right column = all children stacked vertically
- Each node: 48px sprite + name below
- Selected Pokémon node gets `border-color: var(--blue)` highlight

---

## i18n Strings

Added to `TYPE_STRINGS` in both `es` and `en`:

```js
es: {
  statsSection:     'Stats base',
  abilitiesSection: 'Habilidades',
  evoSection:       'Cadena evolutiva',
  hiddenAbility:    'oculta',
  badgeCommon:      'Común',
  badgeLegendary:   'Legendario',
  badgeMythic:      'Mítico',
  badgeBaby:        'Bebé',
  statHp:    'HP',       statAtk:   'Ataque',
  statDef:   'Defensa',  statSpAtk: 'Sp.Atk',
  statSpDef: 'Sp.Def',   statSpd:   'Velocidad',
  evoLevel:  'nv.',      evoTrade:  'intercambio',
},
en: {
  statsSection:     'Base Stats',
  abilitiesSection: 'Abilities',
  evoSection:       'Evolution Chain',
  hiddenAbility:    'hidden',
  badgeCommon:      'Common',
  badgeLegendary:   'Legendary',
  badgeMythic:      'Mythical',
  badgeBaby:        'Baby',
  statHp:    'HP',       statAtk:   'Attack',
  statDef:   'Defense',  statSpAtk: 'Sp.Atk',
  statSpDef: 'Sp.Def',   statSpd:   'Speed',
  evoLevel:  'lv.',      evoTrade:  'trade',
},
```

---

## CSS Classes

| Class | Description |
|---|---|
| `.pk-info` | `display:flex; flex-direction:column; gap:1rem; margin-top:1rem; padding-top:1rem; border-top:1px solid var(--border)` |
| `.pk-info-label` | Section title — 0.7rem, uppercase, `var(--muted)`, letter-spacing |
| `.pk-status-badge` | Pill chip, color varies by rarity (see below) |
| `.pk-ability-chip` | Chip `var(--surface2)` border `var(--border)`; hidden ability → `var(--dim)` + italic label |
| `.pk-stat-row` | CSS grid: `6rem 1fr 2.5rem`; label | bar | number |
| `.pk-stat-bar-track` | `var(--surface2)` h:6px border-radius:3px |
| `.pk-stat-bar-fill` | Color by value: <50 `#E5173A`, 50–79 `#FFD700`, 80–109 `var(--blue)`, ≥110 `var(--pink)` |
| `.pk-evo-tree` | `flex-direction:column; gap:0.5rem` |
| `.pk-evo-node` | 48px sprite + name below; `border: 1px solid var(--blue)` when selected |
| `.pk-evo-row` | One evolution step: parent → arrow+method → child(ren) |

### Badge colors by rarity

| Rarity | Background | Text |
|---|---|---|
| Común / Common | `rgba(255,255,255,0.06)` | `var(--muted)` |
| Bebé / Baby | `rgba(255,86,180,0.15)` | `var(--pink)` |
| Legendario / Legendary | `rgba(255,215,0,0.15)` | `#FFD700` |
| Mítico / Mythical | `rgba(0,204,255,0.15)` | `var(--blue)` |

Badge priority: `is_baby` > `is_legendary` > `is_mythical` > default Common.

### Stat bar width

`width = (statValue / 255) * 100%` — 255 is the maximum possible base stat.

---

## Files Changed

| File | Change |
|---|---|
| `types.html` | Add `#pk-info` div after `#pk-result` |
| `types.js` | Expand `resolvePokemonTypes`; add 5 new functions; expand `TYPE_STRINGS`; expand `clearPkSearch` |
| `style.css` | Add ~9 new CSS class blocks after existing `.pk-error` rule |

No new files. No changes to other pages.
