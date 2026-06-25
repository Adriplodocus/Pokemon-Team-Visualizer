# Pokémon Info Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a collapsible info panel below the sprite+types row in `types.html` that shows status badge, abilities, base stats bars, and evolution chain tree fetched from PokéAPI.

**Architecture:** Expand `resolvePokemonTypes` in `types.js` to make 2 additional sequential PokéAPI calls (species → evolution chain) after the existing pokemon call. Stats and abilities render immediately from the first call; badge and evo chain render after the species and chain calls complete. The `reqId` guard covers all 3 calls.

**Tech Stack:** Vanilla JS, vanilla CSS custom properties, PokéAPI REST. No build step.

## Global Constraints

- CSS variables only — never hardcode colors. Use `--cyan`, `--accent`, `--surface-2`, `--border`, `--text`, `--text-2`, `--dimmed` as defined in `:root`.
- Stat bar width formula: `(base_stat / 255) * 100%`.
- Badge priority: `is_baby` > `is_legendary` > `is_mythical` > Common.
- Both `es` and `en` must be covered in all new `TYPE_STRINGS` entries.
- The `reqId` guard (`if (reqId !== typeResolveId) return;`) must be checked after every `await`.
- No test framework — verification is done in-browser with specific Pokémon.

---

## File Map

| File | Change |
|---|---|
| `style.css` | Add ~18 new CSS class blocks after `.pk-error` (line 1707) |
| `types.html` | Add `#pk-info` div after `#pk-result` |
| `types.js` | Add module state vars; expand `TYPE_STRINGS`; update `selectedPokemon` shape; add `STAT_KEYS`, `statColor`; add 9 new functions; update `resolvePokemonTypes`, `clearPkSearch`, `applyTypeLang` |

---

### Task 1: CSS — Info panel classes

**Files:**
- Modify: `style.css` after line 1707 (after `.pk-error { }` block)

**Interfaces:**
- Produces: all CSS classes consumed by Tasks 3-5

- [ ] **Step 1: Insert CSS block**

Open `style.css`. After the `.pk-error` closing brace (line 1707), insert:

```css
/* ── Pokémon info panel ──────────────────────────────────────── */
.pk-info {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border);
}

.pk-info-label {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-2);
    margin-bottom: 0.3rem;
}

.pk-status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.22rem 0.7rem;
    border-radius: 100px;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    border: 1px solid transparent;
}

.pk-ability-chips {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
}

.pk-ability-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.22rem 0.7rem;
    border-radius: 100px;
    font-size: 0.7rem;
    font-weight: 600;
    background: var(--surface-2);
    color: var(--text);
    border: 1px solid var(--border);
    text-transform: capitalize;
}

.pk-ability-chip.hidden {
    color: var(--dimmed);
    border-style: dashed;
}

.pk-ability-hidden-label {
    font-style: italic;
    font-weight: 400;
    color: var(--dimmed);
}

.pk-stat-list {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.pk-stat-row {
    display: grid;
    grid-template-columns: 5.5rem 1fr 2.2rem;
    align-items: center;
    gap: 0.5rem;
}

.pk-stat-name {
    font-size: 0.68rem;
    color: var(--text-2);
    text-align: right;
}

.pk-stat-bar-track {
    height: 6px;
    border-radius: 3px;
    background: var(--surface-2);
    overflow: hidden;
}

.pk-stat-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.35s ease;
}

.pk-stat-value {
    font-size: 0.68rem;
    color: var(--text);
    font-weight: 700;
    text-align: right;
}

.pk-evo-tree {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.pk-evo-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.pk-evo-children {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.pk-evo-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
}

.pk-evo-node img {
    width: 48px;
    height: 48px;
    image-rendering: pixelated;
    object-fit: contain;
    border: 1px solid transparent;
    border-radius: 8px;
    background: var(--surface-2);
    transition: border-color 0.18s;
}

.pk-evo-node.selected img {
    border-color: var(--cyan);
    box-shadow: 0 0 8px rgba(0, 204, 255, 0.3);
}

.pk-evo-node-name {
    font-size: 0.6rem;
    color: var(--text-2);
    text-align: center;
    text-transform: capitalize;
    max-width: 52px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.pk-evo-arrow {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
}

.pk-evo-arrow-method {
    font-size: 0.58rem;
    color: var(--dimmed);
    text-transform: capitalize;
    white-space: nowrap;
}

.pk-evo-arrow-icon {
    font-size: 0.9rem;
    color: var(--text-2);
    line-height: 1;
}
```

- [ ] **Step 2: Commit**

```bash
git add style.css
git commit -m "style: add pokemon info panel CSS classes"
```

---

### Task 2: HTML structure + i18n strings + module state

**Files:**
- Modify: `types.html` — add `#pk-info` div
- Modify: `types.js` — TYPE_STRINGS, module state, STAT_KEYS, statColor, clearPkSearch

**Interfaces:**
- Consumes: CSS classes from Task 1
- Produces: `#pk-info`, `#pk-info-badge`, `#pk-info-abilities`, `#pk-info-stats`, `#pk-info-evo` DOM elements; `tT('statsSection')` etc.; `selectedPokemon.abilities`, `selectedPokemon.stats`; `pkSpeciesData`, `pkChainData`, `pkCurrentSpeciesName`; `statColor(v)`; `STAT_KEYS`

- [ ] **Step 1: Add `#pk-info` div to types.html**

In `types.html`, find the line:
```html
            <p id="pk-error" class="pk-error" style="display:none"></p>
```

Add this directly after it:
```html
            <div id="pk-info" class="pk-info" style="display:none">
                <div id="pk-info-badge"></div>
                <div id="pk-info-abilities"></div>
                <div id="pk-info-stats"></div>
                <div id="pk-info-evo"></div>
            </div>
```

- [ ] **Step 2: Add new TYPE_STRINGS entries in types.js**

Find the `TYPE_STRINGS` object. Add these keys inside both `es` and `en` blocks:

In `es`:
```js
    statsSection:     'Stats base',
    abilitiesSection: 'Habilidades',
    evoSection:       'Cadena evolutiva',
    hiddenAbility:    'oculta',
    badgeCommon:      'Común',
    badgeLegendary:   'Legendario',
    badgeMythic:      'Mítico',
    badgeBaby:        'Bebé',
    statHp:    'HP',        statAtk:   'Ataque',
    statDef:   'Defensa',   statSpAtk: 'Sp.Atk',
    statSpDef: 'Sp.Def',    statSpd:   'Velocidad',
    evoLevel:  'nv.',       evoTrade:  'intercambio',
```

In `en`:
```js
    statsSection:     'Base Stats',
    abilitiesSection: 'Abilities',
    evoSection:       'Evolution Chain',
    hiddenAbility:    'hidden',
    badgeCommon:      'Common',
    badgeLegendary:   'Legendary',
    badgeMythic:      'Mythical',
    badgeBaby:        'Baby',
    statHp:    'HP',        statAtk:   'Attack',
    statDef:   'Defense',   statSpAtk: 'Sp.Atk',
    statSpDef: 'Sp.Def',    statSpd:   'Speed',
    evoLevel:  'lv.',       evoTrade:  'trade',
```

- [ ] **Step 3: Add module-level state vars in types.js**

Find this existing line:
```js
let typeResolveId   = 0;
```

Add after it:
```js
let pkSpeciesData        = null;
let pkChainData          = null;
let pkCurrentSpeciesName = '';
```

- [ ] **Step 4: Expand selectedPokemon initial shape**

Find:
```js
let selectedPokemon = { name: '', skin: '', types: [] };
```

Replace with:
```js
let selectedPokemon = { name: '', skin: '', types: [], abilities: [], stats: [] };
```

- [ ] **Step 5: Add STAT_KEYS and statColor in types.js**

Add after the `SKIN_SLUG_MAP` const (after line ~457):

```js
const STAT_KEYS = {
    'hp':               'statHp',
    'attack':           'statAtk',
    'defense':          'statDef',
    'special-attack':   'statSpAtk',
    'special-defense':  'statSpDef',
    'speed':            'statSpd',
};

function statColor(v) {
    if (v < 50)  return '#E5173A';
    if (v < 80)  return '#FFD700';
    if (v < 110) return 'var(--cyan)';
    return 'var(--accent)';
}
```

- [ ] **Step 6: Update clearPkSearch**

Replace the entire `clearPkSearch` function with:

```js
function clearPkSearch() {
    selectedPokemon      = { name: '', skin: '', types: [], abilities: [], stats: [] };
    pkSpeciesData        = null;
    pkChainData          = null;
    pkCurrentSpeciesName = '';
    const input = document.getElementById('pk-search-input');
    if (input) input.value = '';
    closePkSuggestions();
    const propsRow = document.getElementById('pk-props-row');
    if (propsRow) propsRow.style.display = 'none';
    const result = document.getElementById('pk-result');
    if (result) result.style.display = 'none';
    const infoDiv = document.getElementById('pk-info');
    if (infoDiv) infoDiv.style.display = 'none';
    const error = document.getElementById('pk-error');
    if (error) error.style.display = 'none';
    const clearBtn = document.getElementById('pk-clear-btn');
    if (clearBtn) clearBtn.style.display = 'none';
}
```

- [ ] **Step 7: Verify in browser**

Open the page. Search for any Pokémon. Confirm the ✕ clear button still works — searching, selecting, then pressing ✕ should hide sprite, types, and `#pk-info` (currently empty/hidden). No JS errors in console.

- [ ] **Step 8: Commit**

```bash
git add types.html types.js
git commit -m "feat(types): scaffold info panel HTML, i18n strings and module state"
```

---

### Task 3: Render stats + abilities

**Files:**
- Modify: `types.js` — add `renderPkStats`, `renderPkAbilities`; update `resolvePokemonTypes` to extract + render them

**Interfaces:**
- Consumes: `STAT_KEYS`, `statColor`, `tT`, `selectedPokemon.abilities`, `selectedPokemon.stats`, `#pk-info-stats`, `#pk-info-abilities`
- Produces: `renderPkStats(stats)`, `renderPkAbilities(abilities)` — called by `resolvePokemonTypes` and `renderPkInfo`

- [ ] **Step 1: Add renderPkStats function**

Add this function in `types.js` after `renderPkResult`:

```js
function renderPkStats(stats) {
    const el = document.getElementById('pk-info-stats');
    if (!el || !stats.length) return;
    const rows = stats
        .filter(s => STAT_KEYS[s.stat.name])
        .map(s => {
            const label = tT(STAT_KEYS[s.stat.name]);
            const pct   = Math.round((s.base_stat / 255) * 100);
            const color = statColor(s.base_stat);
            return `<div class="pk-stat-row">
                <span class="pk-stat-name">${label}</span>
                <div class="pk-stat-bar-track">
                    <div class="pk-stat-bar-fill" style="width:${pct}%;background:${color}"></div>
                </div>
                <span class="pk-stat-value">${s.base_stat}</span>
            </div>`;
        }).join('');
    el.innerHTML = `<div class="pk-info-label">${tT('statsSection')}</div>
        <div class="pk-stat-list">${rows}</div>`;
}
```

- [ ] **Step 2: Add renderPkAbilities function**

Add after `renderPkStats`:

```js
function renderPkAbilities(abilities) {
    const el = document.getElementById('pk-info-abilities');
    if (!el || !abilities.length) return;
    const chips = abilities.map(a => {
        const name = a.ability.name.replace(/-/g, ' ');
        const hiddenLabel = a.is_hidden
            ? ` <span class="pk-ability-hidden-label">(${tT('hiddenAbility')})</span>`
            : '';
        return `<span class="pk-ability-chip${a.is_hidden ? ' hidden' : ''}">${name}${hiddenLabel}</span>`;
    }).join('');
    el.innerHTML = `<div class="pk-info-label">${tT('abilitiesSection')}</div>
        <div class="pk-ability-chips">${chips}</div>`;
}
```

- [ ] **Step 3: Update resolvePokemonTypes to extract + render stats/abilities**

Find the existing `resolvePokemonTypes` function. Replace it entirely with this version — everything up to the species calls is included here; species + chain calls are added in Task 4:

```js
async function resolvePokemonTypes(name, skin) {
    const reqId     = ++typeResolveId;
    const capSkin   = skin;
    const capShiny  = typeProps.shiny;
    const capGender = typeProps.gender;

    const resultDiv = document.getElementById('pk-result');
    const errorEl   = document.getElementById('pk-error');
    const typesDiv  = document.getElementById('pk-result-types');
    const infoDiv   = document.getElementById('pk-info');

    resultDiv.style.display = 'none';
    errorEl.style.display   = 'none';
    if (infoDiv) infoDiv.style.display = 'none';
    typesDiv.innerHTML = `<span style="color:var(--text-2)">${tT('loadingTypes')}</span>`;

    const slug = toPokeApiSlug(name, capSkin);
    let data;
    try {
        let res = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`);
        if (!res.ok && capSkin) {
            res = await fetch(`https://pokeapi.co/api/v2/pokemon/${toPokeApiSlug(name, null)}`);
        }
        if (!res.ok) throw new Error('not found');
        data = await res.json();
    } catch {
        if (reqId !== typeResolveId) return;
        errorEl.textContent   = tT('unknownPokemon');
        errorEl.style.display = 'block';
        return;
    }

    if (reqId !== typeResolveId) return;

    const types = data.types
        .map(t => t.type.name)
        .filter(t => TYPES.includes(t))
        .slice(0, 2);

    selectedPokemon.types     = types;
    selectedPokemon.abilities = data.abilities;
    selectedPokemon.stats     = data.stats;
    pkCurrentSpeciesName      = data.species.name;
    pkSpeciesData             = null;
    pkChainData               = null;

    selectedTypes = [...types];
    renderTypeSelector();
    renderTable();

    const catalog  = (typeof POKEMON_CATALOG !== 'undefined') ? POKEMON_CATALOG[name] : null;
    const skins    = catalog?.skin ?? [];
    const skinPart = (capSkin && skins.includes(capSkin)) ? `_${capSkin}` : '';
    let spriteFile;
    if (capShiny === 'True') {
        spriteFile = `sprites/shiny/${name}${skinPart}.gif`;
    } else if (capGender === 'female') {
        spriteFile = `sprites/female/${name}${skinPart}.gif`;
    } else {
        spriteFile = `sprites/${name}${skinPart}.gif`;
    }
    const sprite = document.getElementById('pk-result-sprite');
    sprite.onerror = () => { sprite.onerror = null; sprite.src = `sprites/${name}.gif` + SPRITE_VER; };
    sprite.src = spriteFile + SPRITE_VER;

    renderPkResult();
    resultDiv.style.display = 'flex';

    // Show info panel — stats + abilities available immediately from step 1
    if (infoDiv) infoDiv.style.display = 'flex';
    renderPkStats(data.stats);
    renderPkAbilities(data.abilities);

    // (species + evo chain calls added in Task 4)
}
```

- [ ] **Step 4: Verify in browser**

Open the types page. Search "blastoise". Confirm:
- Sprite and types appear as before
- Below the types: "Habilidades" section with chips "torrent" and "rain dish (oculta)"
- "Stats base" section with 6 bars (HP 79 red-ish, Special Defense 105 cyan)
- Switch lang to EN — labels change to "Abilities", "Base Stats", "Attack", etc.
- Press ✕ — stats and abilities hidden, no errors

- [ ] **Step 5: Commit**

```bash
git add types.js
git commit -m "feat(types): render base stats bars and abilities from pokemon API"
```

---

### Task 4: Species call + status badge

**Files:**
- Modify: `types.js` — add `renderPkBadge`; expand `resolvePokemonTypes` with species fetch

**Interfaces:**
- Consumes: `pkSpeciesData`, `pkCurrentSpeciesName`, `tT`, `#pk-info-badge`
- Produces: `renderPkBadge(species)` — called by `resolvePokemonTypes` and `renderPkInfo`

- [ ] **Step 1: Add renderPkBadge function**

Add after `renderPkAbilities`:

```js
function renderPkBadge(species) {
    const el = document.getElementById('pk-info-badge');
    if (!el) return;
    let label, bg, color, borderColor;
    if (species.is_baby) {
        label = tT('badgeBaby');
        bg = 'rgba(255,86,180,0.15)';
        color = 'var(--accent)';
        borderColor = 'rgba(255,86,180,0.35)';
    } else if (species.is_legendary) {
        label = tT('badgeLegendary');
        bg = 'rgba(255,215,0,0.15)';
        color = '#FFD700';
        borderColor = 'rgba(255,215,0,0.35)';
    } else if (species.is_mythical) {
        label = tT('badgeMythic');
        bg = 'rgba(0,204,255,0.15)';
        color = 'var(--cyan)';
        borderColor = 'rgba(0,204,255,0.35)';
    } else {
        label = tT('badgeCommon');
        bg = 'rgba(255,255,255,0.06)';
        color = 'var(--text-2)';
        borderColor = 'var(--border)';
    }
    el.innerHTML = `<span class="pk-status-badge" style="background:${bg};color:${color};border-color:${borderColor}">${label}</span>`;
}
```

- [ ] **Step 2: Expand resolvePokemonTypes with species fetch**

Find this comment at the bottom of `resolvePokemonTypes`:
```js
    // (species + evo chain calls added in Task 4)
```

Replace it with:

```js
    // Fetch species data (badge)
    try {
        const speciesRes = await fetch(data.species.url);
        if (reqId !== typeResolveId) return;
        if (!speciesRes.ok) throw new Error('species not found');
        pkSpeciesData = await speciesRes.json();
        if (reqId !== typeResolveId) return;
        renderPkBadge(pkSpeciesData);

        // (evo chain fetch added in Task 5)
    } catch {
        // badge is non-critical — silently skip on error
    }
```

- [ ] **Step 3: Verify in browser**

Open types page. Test these cases:

| Search | Expected badge |
|---|---|
| bulbasaur | Común / Common |
| mew | Mítico / Mythical |
| mewtwo | Legendario / Legendary |
| pichu | Bebé / Baby |

Switch lang to EN mid-session. No badge re-render yet (that's Task 5) — just confirm no crash.

- [ ] **Step 4: Commit**

```bash
git add types.js
git commit -m "feat(types): fetch species and render status badge"
```

---

### Task 5: Evolution chain + lang support

**Files:**
- Modify: `types.js` — add `evoMethodLabel`, `evoNodeHTML`, `collectLinear`, `renderChainNode`, `renderPkEvo`, `renderPkInfo`; expand species try-block with chain fetch; update `applyTypeLang`

**Interfaces:**
- Consumes: `pkChainData`, `pkCurrentSpeciesName`, `SPRITE_VER`, `tT`, `#pk-info-evo`
- Produces: `renderPkEvo(chain, selectedSpeciesName)`, `renderPkInfo()` — `renderPkInfo` is the coordinator called from `applyTypeLang`

- [ ] **Step 1: Add evo helper functions**

Add after `renderPkBadge`:

```js
function evoMethodLabel(details) {
    if (!details || !details.length) return '';
    const d = details[0];
    if (d.min_level)                                   return `${tT('evoLevel')}${d.min_level}`;
    if (d.trigger?.name === 'use-item' && d.item?.name) return d.item.name.replace(/-/g, ' ');
    if (d.trigger?.name === 'trade')                   return tT('evoTrade');
    if (d.trigger?.name === 'level-up')                return `${tT('evoLevel')}?`;
    return d.trigger?.name?.replace(/-/g, ' ') ?? '';
}

function evoNodeHTML(speciesName, selectedSpeciesName) {
    const isSelected = speciesName === selectedSpeciesName;
    return `<div class="pk-evo-node${isSelected ? ' selected' : ''}">
        <img src="sprites/${speciesName}.gif${SPRITE_VER}" alt="${speciesName}" loading="lazy"
             onerror="this.style.display='none'">
        <span class="pk-evo-node-name">${speciesName}</span>
    </div>`;
}

function collectLinear(node) {
    if (node.evolves_to.length === 0) return [node];
    if (node.evolves_to.length > 1)   return null;
    const rest = collectLinear(node.evolves_to[0]);
    return rest ? [node, ...rest] : null;
}

function renderChainNode(node, selectedSpeciesName) {
    const linear = collectLinear(node);
    if (linear) {
        let html = '<div class="pk-evo-row">';
        for (let i = 0; i < linear.length; i++) {
            if (i > 0) {
                const method = evoMethodLabel(linear[i].evolution_details);
                html += `<div class="pk-evo-arrow">
                    <span class="pk-evo-arrow-method">${method}</span>
                    <span class="pk-evo-arrow-icon">→</span>
                </div>`;
            }
            html += evoNodeHTML(linear[i].species.name, selectedSpeciesName);
        }
        html += '</div>';
        return html;
    }

    // Branching node
    const parentHTML   = evoNodeHTML(node.species.name, selectedSpeciesName);
    const childrenHTML = node.evolves_to.map(child => {
        const method = evoMethodLabel(child.evolution_details);
        return `<div class="pk-evo-row">
            <div class="pk-evo-arrow">
                <span class="pk-evo-arrow-method">${method}</span>
                <span class="pk-evo-arrow-icon">→</span>
            </div>
            ${renderChainNode(child, selectedSpeciesName)}
        </div>`;
    }).join('');

    return `<div class="pk-evo-row">
        ${parentHTML}
        <div class="pk-evo-children">${childrenHTML}</div>
    </div>`;
}

function renderPkEvo(chain, selectedSpeciesName) {
    const el = document.getElementById('pk-info-evo');
    if (!el) return;
    el.innerHTML = `<div class="pk-info-label">${tT('evoSection')}</div>
        <div class="pk-evo-tree">${renderChainNode(chain, selectedSpeciesName)}</div>`;
}
```

- [ ] **Step 2: Add renderPkInfo coordinator**

Add after `renderPkEvo`:

```js
function renderPkInfo() {
    const infoDiv = document.getElementById('pk-info');
    if (!pkSpeciesData || !infoDiv || infoDiv.style.display === 'none') return;
    renderPkBadge(pkSpeciesData);
    renderPkAbilities(selectedPokemon.abilities);
    renderPkStats(selectedPokemon.stats);
    if (pkChainData) renderPkEvo(pkChainData.chain, pkCurrentSpeciesName);
}
```

- [ ] **Step 3: Expand resolvePokemonTypes species try-block with chain fetch**

Find this comment inside the species `try` block:
```js
        // (evo chain fetch added in Task 5)
```

Replace it with:

```js
        const chainRes = await fetch(pkSpeciesData.evolution_chain.url);
        if (reqId !== typeResolveId) return;
        if (!chainRes.ok) throw new Error('chain not found');
        pkChainData = await chainRes.json();
        if (reqId !== typeResolveId) return;
        renderPkEvo(pkChainData.chain, pkCurrentSpeciesName);
```

- [ ] **Step 4: Update applyTypeLang to call renderPkInfo**

Find `applyTypeLang`. Add `renderPkInfo();` at the very end, after `renderPkResult();`:

```js
function applyTypeLang() {
    document.querySelectorAll('[data-i18n-type]').forEach(el => {
        const key = el.dataset.i18nType;
        const val = TYPE_STRINGS[currentLang][key];
        if (typeof val === 'string') el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-type-ph]').forEach(el => {
        const key = el.dataset.i18nTypePh;
        const val = TYPE_STRINGS[currentLang][key];
        if (typeof val === 'string') el.placeholder = val;
    });
    renderTypeSelector();
    renderTable();
    renderPkResult();
    renderPkInfo();
}
```

- [ ] **Step 5: Verify in browser — linear chain**

Search "bulbasaur". Confirm:
- Badge: "Común"
- Habilidades: "overgrow", "chlorophyll (oculta)"
- Stats: 6 bars, HP=45 red
- Cadena evolutiva: `[bulbasaur] →lv.16 [ivysaur] →lv.32 [venusaur]` — bulbasaur node highlighted (cyan border)

Search "ivysaur" in the same chain. Confirm ivysaur node is now highlighted.

- [ ] **Step 6: Verify in browser — branching chain**

Search "eevee". Confirm:
- 8 branches visible: vaporeon, jolteon, flareon, espeon, umbreon, leafeon, glaceon, sylveon
- Each shows item/method label above arrow (e.g., "water stone", "friendship")
- eevee node highlighted

- [ ] **Step 7: Verify in browser — lang switch**

With a Pokémon selected, switch ES→EN. Confirm all labels update: "Stats base"→"Base Stats", "Habilidades"→"Abilities", "Cadena evolutiva"→"Evolution Chain", "oculta"→"hidden", "nv."→"lv.", "intercambio"→"trade".

- [ ] **Step 8: Verify in browser — stale request guard**

Type "cha", select "charizard", then immediately type "me" and select "mewtwo" fast. Only mewtwo's data should appear — no charizard flash.

- [ ] **Step 9: Commit**

```bash
git add types.js
git commit -m "feat(types): add evolution chain tree, badge + abilities lang support"
```
