# Types Table Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a standalone `types.html` page with a Pokémon type effectiveness calculator (defense view) — select 1-2 types, see damage multipliers from all attacking types.

**Architecture:** New `types.html` page + `types.js` module follow the exact same pattern as `badges.html`/`badges.js`. Nav gets a 3rd link across all pages. Static type chart data embedded in `types.js`. No server calls.

**Tech Stack:** Vanilla JS, HTML, CSS — same stack as rest of project. No build step.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `types.js` | Create | Static data (chart, colors, names), calcDefense, toggle logic, render functions, i18n |
| `types.html` | Create | Page shell, header/nav with 3rd link active, layout markup, inline setLang script |
| `badges.js` | Modify | Add `typesMode` key to `BADGE_STRINGS` (ES + EN) |
| `index.html` | Modify | Add 3rd nav link to `types.html` |
| `badges.html` | Modify | Add 3rd nav link to `types.html` |
| `style.css` | Modify | Add CSS for `.types-layout`, `.type-grid`, `.type-btn`, `.mult-row`, `.type-chip` etc. |

---

## Task 1: Add `typesMode` to `BADGE_STRINGS` and 3rd nav link in existing pages

**Files:**
- Modify: `badges.js` (BADGE_STRINGS ES + EN blocks, ~lines 106–145)
- Modify: `index.html` (mode-toggle div, ~line 30)
- Modify: `badges.html` (mode-toggle div, ~line 22)

- [ ] **Step 1: Guard `buildBadgeGameSelect()` against missing element**

`types.html` won't contain `badge-game-select`. Without a guard, `applyBadgeLang()` crashes when called there. In `badges.js`, add an early-return guard:

Find:
```js
function buildBadgeGameSelect() {
    const sel = document.getElementById('badge-game-select');
    sel.innerHTML = BADGE_GAMES.map(g =>
```

Replace with:
```js
function buildBadgeGameSelect() {
    const sel = document.getElementById('badge-game-select');
    if (!sel) return;
    sel.innerHTML = BADGE_GAMES.map(g =>
```

- [ ] **Step 2: Add `typesMode` to both language blocks in `BADGE_STRINGS`**

In `badges.js`, find the `BADGE_STRINGS` object. Add `typesMode` to both language blocks:

```js
// ES block (around line 108):
pokemonMode:            'Pokémon',
badgeMode:              'Medallas',
typesMode:              'Tabla de tipos',   // ← add this

// EN block (around line 129):
pokemonMode:            'Pokémon',
badgeMode:              'Badges',
typesMode:              'Types table',      // ← add this
```

- [ ] **Step 3: Add 3rd nav link in `index.html`**

Find the `.mode-toggle` div in `index.html` (~line 29) and add the third link:

```html
<div class="mode-toggle">
    <a href="index.html" id="mode-btn-pokemon" class="mode-btn active" data-i18n-badge="pokemonMode">Pokémon</a>
    <a href="badges.html" id="mode-btn-badges" class="mode-btn" data-i18n-badge="badgeMode">Medallas</a>
    <a href="types.html" id="mode-btn-types" class="mode-btn" data-i18n-badge="typesMode">Tabla de tipos</a>
</div>
```

- [ ] **Step 4: Add 3rd nav link in `badges.html`**

Find the `.mode-toggle` div in `badges.html` (~line 22) and add the third link:

```html
<div class="mode-toggle">
    <a href="index.html" id="mode-btn-pokemon" class="mode-btn" data-i18n-badge="pokemonMode">Pokémon</a>
    <a href="badges.html" id="mode-btn-badges" class="mode-btn active" data-i18n-badge="badgeMode">Medallas</a>
    <a href="types.html" id="mode-btn-types" class="mode-btn" data-i18n-badge="typesMode">Tabla de tipos</a>
</div>
```

- [ ] **Step 5: Verify in browser**

Open `index.html` and `badges.html`. Both should show 3 nav links. Switch ES↔EN — "Tabla de tipos" / "Types table" should update.

- [ ] **Step 6: Commit**

```bash
git add badges.js index.html badges.html
git commit -m "feat(nav): add types table nav link"
```

---

## Task 2: Create `types.js` — static data layer

**Files:**
- Create: `types.js`

- [ ] **Step 1: Create `types.js` with TYPES array, TYPE_COLORS, TYPE_NAMES, TYPE_CHART**

Create `types.js` with this exact content for the data layer:

```js
const TYPES = [
    'normal','fire','water','electric','grass','ice',
    'fighting','poison','ground','flying','psychic','bug',
    'rock','ghost','dragon','dark','steel','fairy'
];

const TYPE_COLORS = {
    normal:   '#A8A878',
    fire:     '#F08030',
    water:    '#6890F0',
    electric: '#F8D030',
    grass:    '#78C850',
    ice:      '#98D8D8',
    fighting: '#C03028',
    poison:   '#A040A0',
    ground:   '#E0C068',
    flying:   '#A890F0',
    psychic:  '#F85888',
    bug:      '#A8B820',
    rock:     '#B8A038',
    ghost:    '#705898',
    dragon:   '#7038F8',
    dark:     '#705848',
    steel:    '#B8B8D0',
    fairy:    '#EE99AC',
};

const TYPE_NAMES = {
    es: {
        normal:'Normal', fire:'Fuego',    water:'Agua',    electric:'Eléctrico',
        grass:'Planta',  ice:'Hielo',     fighting:'Lucha', poison:'Veneno',
        ground:'Tierra', flying:'Volador', psychic:'Psíquico', bug:'Bicho',
        rock:'Roca',     ghost:'Fantasma', dragon:'Dragón',   dark:'Siniestro',
        steel:'Acero',   fairy:'Hada'
    },
    en: {
        normal:'Normal', fire:'Fire',     water:'Water',   electric:'Electric',
        grass:'Grass',   ice:'Ice',       fighting:'Fighting', poison:'Poison',
        ground:'Ground', flying:'Flying', psychic:'Psychic',   bug:'Bug',
        rock:'Rock',     ghost:'Ghost',   dragon:'Dragon',     dark:'Dark',
        steel:'Steel',   fairy:'Fairy'
    }
};

// TYPE_CHART[defenderType][attackerType] = multiplier (Gen 6+ rules)
const TYPE_CHART = {
    normal:   {normal:1,   fire:1,   water:1,   electric:1,  grass:1,   ice:1,   fighting:2,  poison:1,   ground:1,  flying:1,  psychic:1,  bug:1,   rock:1,  ghost:0,  dragon:1,  dark:1,   steel:1,   fairy:1  },
    fire:     {normal:1,   fire:0.5, water:2,   electric:1,  grass:0.5, ice:0.5, fighting:1,  poison:1,   ground:2,  flying:1,  psychic:1,  bug:0.5, rock:2,  ghost:1,  dragon:1,  dark:1,   steel:0.5, fairy:0.5},
    water:    {normal:1,   fire:0.5, water:0.5, electric:2,  grass:2,   ice:0.5, fighting:1,  poison:1,   ground:1,  flying:1,  psychic:1,  bug:1,   rock:1,  ghost:1,  dragon:1,  dark:1,   steel:0.5, fairy:1  },
    electric: {normal:1,   fire:1,   water:1,   electric:0.5,grass:1,   ice:1,   fighting:1,  poison:1,   ground:2,  flying:0.5,psychic:1,  bug:1,   rock:1,  ghost:1,  dragon:1,  dark:1,   steel:0.5, fairy:1  },
    grass:    {normal:1,   fire:2,   water:0.5, electric:0.5,grass:0.5, ice:2,   fighting:1,  poison:2,   ground:0.5,flying:2,  psychic:1,  bug:2,   rock:1,  ghost:1,  dragon:1,  dark:1,   steel:1,   fairy:1  },
    ice:      {normal:1,   fire:2,   water:1,   electric:1,  grass:1,   ice:0.5, fighting:2,  poison:1,   ground:1,  flying:1,  psychic:1,  bug:1,   rock:2,  ghost:1,  dragon:1,  dark:1,   steel:2,   fairy:1  },
    fighting: {normal:1,   fire:1,   water:1,   electric:1,  grass:1,   ice:1,   fighting:1,  poison:1,   ground:1,  flying:2,  psychic:2,  bug:0.5, rock:0.5,ghost:1,  dragon:1,  dark:0.5, steel:1,   fairy:2  },
    poison:   {normal:1,   fire:1,   water:1,   electric:1,  grass:0.5, ice:1,   fighting:0.5,poison:0.5, ground:2,  flying:1,  psychic:2,  bug:0.5, rock:1,  ghost:1,  dragon:1,  dark:1,   steel:1,   fairy:0.5},
    ground:   {normal:1,   fire:1,   water:2,   electric:0,  grass:2,   ice:2,   fighting:1,  poison:0.5, ground:1,  flying:1,  psychic:1,  bug:1,   rock:0.5,ghost:1,  dragon:1,  dark:1,   steel:1,   fairy:1  },
    flying:   {normal:1,   fire:1,   water:1,   electric:2,  grass:0.5, ice:2,   fighting:0.5,poison:1,   ground:0,  flying:1,  psychic:1,  bug:0.5, rock:2,  ghost:1,  dragon:1,  dark:1,   steel:1,   fairy:1  },
    psychic:  {normal:1,   fire:1,   water:1,   electric:1,  grass:1,   ice:1,   fighting:0.5,poison:1,   ground:1,  flying:1,  psychic:0.5,bug:2,   rock:1,  ghost:2,  dragon:1,  dark:2,   steel:1,   fairy:1  },
    bug:      {normal:1,   fire:2,   water:1,   electric:1,  grass:0.5, ice:1,   fighting:0.5,poison:1,   ground:0.5,flying:2,  psychic:1,  bug:1,   rock:2,  ghost:1,  dragon:1,  dark:1,   steel:1,   fairy:1  },
    rock:     {normal:0.5, fire:0.5, water:2,   electric:1,  grass:2,   ice:1,   fighting:2,  poison:0.5, ground:2,  flying:0.5,psychic:1,  bug:1,   rock:1,  ghost:1,  dragon:1,  dark:1,   steel:2,   fairy:1  },
    ghost:    {normal:0,   fire:1,   water:1,   electric:1,  grass:1,   ice:1,   fighting:0,  poison:0.5, ground:1,  flying:1,  psychic:1,  bug:0.5, rock:1,  ghost:2,  dragon:1,  dark:2,   steel:1,   fairy:1  },
    dragon:   {normal:1,   fire:0.5, water:0.5, electric:0.5,grass:0.5, ice:2,   fighting:1,  poison:1,   ground:1,  flying:1,  psychic:1,  bug:1,   rock:1,  ghost:1,  dragon:2,  dark:1,   steel:1,   fairy:2  },
    dark:     {normal:1,   fire:1,   water:1,   electric:1,  grass:1,   ice:1,   fighting:2,  poison:1,   ground:1,  flying:1,  psychic:0,  bug:2,   rock:1,  ghost:0.5,dragon:1,  dark:0.5, steel:1,   fairy:2  },
    steel:    {normal:0.5, fire:2,   water:1,   electric:1,  grass:0.5, ice:0.5, fighting:2,  poison:0,   ground:2,  flying:0.5,psychic:0.5,bug:0.5, rock:0.5,ghost:1,  dragon:0.5,dark:1,   steel:0.5, fairy:0.5},
    fairy:    {normal:1,   fire:1,   water:1,   electric:1,  grass:1,   ice:1,   fighting:0.5,poison:2,   ground:1,  flying:1,  psychic:1,  bug:0.5, rock:1,  ghost:1,  dragon:0,  dark:0.5, steel:2,   fairy:1  },
};

const TYPE_STRINGS = {
    es: {
        noTypeSelected: 'Selecciona uno o dos tipos para ver la efectividad.',
        resetBtn:       'Resetear',
    },
    en: {
        noTypeSelected: 'Select one or two types to see effectiveness.',
        resetBtn:       'Reset',
    }
};

function tT(key) {
    return TYPE_STRINGS[currentLang][key];
}
```

- [ ] **Step 2: Verify data in browser console**

Open any HTML page and load `types.js` in the console (or open `types.html` after Task 4). Run:

```js
// Should return 0 (Normal immune to Ghost)
TYPE_CHART['normal']['ghost']

// Should return 4 (Grass/Ice defender vs Fire attacker: 2 * 2 = 4)
TYPE_CHART['grass']['fire'] * TYPE_CHART['ice']['fire']
```

---

## Task 3: Add logic + render functions to `types.js`

**Files:**
- Modify: `types.js` (append to end)

- [ ] **Step 1: Append `calcDefense`, `selectedTypes`, toggle and render functions**

Append this block to `types.js`:

```js
let selectedTypes = [];

function calcDefense(types) {
    const result = { 0: [], 0.25: [], 0.5: [], 1: [], 2: [], 4: [] };
    for (const atk of TYPES) {
        let mult = 1;
        for (const def of types) {
            mult *= TYPE_CHART[def][atk];
        }
        if (result[mult] !== undefined) result[mult].push(atk);
    }
    return result;
}

function toggleType(type) {
    const idx = selectedTypes.indexOf(type);
    if (idx !== -1) {
        selectedTypes.splice(idx, 1);
    } else {
        if (selectedTypes.length >= 2) selectedTypes.shift();
        selectedTypes.push(type);
    }
    renderTypeSelector();
    renderTable();
}

function renderTypeSelector() {
    const grid = document.getElementById('type-grid');
    grid.innerHTML = '';
    for (const type of TYPES) {
        const btn = document.createElement('button');
        btn.className = 'type-btn' + (selectedTypes.includes(type) ? ' selected' : '');
        btn.textContent = TYPE_NAMES[currentLang][type];
        btn.style.background = TYPE_COLORS[type];
        btn.onclick = () => toggleType(type);
        grid.appendChild(btn);
    }
}

function renderTable() {
    const container = document.getElementById('types-table');
    if (selectedTypes.length === 0) {
        container.innerHTML = `<p class="types-placeholder">${tT('noTypeSelected')}</p>`;
        return;
    }
    const groups = calcDefense(selectedTypes);
    const MULT_ORDER = [4, 2, 0.5, 0.25, 0];
    let html = '';
    for (const mult of MULT_ORDER) {
        const types = groups[mult];
        if (types.length === 0) continue;
        html += `<div class="mult-row">
            <span class="mult-label">×${mult}</span>
            <div class="mult-chips">${types.map(t =>
                `<span class="type-chip" style="background:${TYPE_COLORS[t]}">${TYPE_NAMES[currentLang][t]}</span>`
            ).join('')}</div>
        </div>`;
    }
    const neutral = groups[1];
    if (neutral.length > 0) {
        html += `<div class="mult-row mult-row--neutral">
            <span class="mult-label">×1</span>
            <div class="mult-chips">${neutral.map(t =>
                `<span class="type-chip" style="background:${TYPE_COLORS[t]}">${TYPE_NAMES[currentLang][t]}</span>`
            ).join('')}</div>
        </div>`;
    }
    container.innerHTML = html;
}

function resetTypes() {
    selectedTypes = [];
    renderTypeSelector();
    renderTable();
}

function applyTypeLang() {
    document.querySelectorAll('[data-i18n-type]').forEach(el => {
        const key = el.dataset.i18nType;
        const val = TYPE_STRINGS[currentLang][key];
        if (typeof val === 'string') el.textContent = val;
    });
    renderTypeSelector();
    renderTable();
}
```

- [ ] **Step 2: Verify calcDefense in browser console (after Task 4 page exists)**

```js
// Fire type only → should be weak to Water(2), Ground(2), Rock(2)
JSON.stringify(calcDefense(['fire']))
// Expected: "2" bucket contains ["water","ground","rock"], "0.5" contains fire/grass/ice/bug/steel/fairy

// Water+Ground dual → Electric should be ×0 (ground immune), Grass should be ×4
const r = calcDefense(['water','ground'])
r[0]   // should include 'electric'
r[4]   // should include 'grass'
```

---

## Task 4: Create `types.html`

**Files:**
- Create: `types.html`

- [ ] **Step 1: Create `types.html`**

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tabla de tipos — Pokémon Stream Visualizer</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='white'/><path d='M2,16 A14,14 0 0,1 30,16 Z' fill='%23EE1515'/><circle cx='16' cy='16' r='14' fill='none' stroke='%231a1a1a' stroke-width='2'/><line x1='2' y1='16' x2='30' y2='16' stroke='%231a1a1a' stroke-width='2'/><circle cx='16' cy='16' r='5' fill='%231a1a1a'/><circle cx='16' cy='16' r='3' fill='white'/></svg>">
<link rel="stylesheet" href="style.css">
<meta name="theme-color" content="#00CCFF">
<script src="lang.js"></script>
</head>
<body>
<header>
    <div class="header-title-row">
        <a href="https://mrklypp.com/" target="_blank" rel="noopener" class="avatar-ring">
            <img src="https://mrklypp.com/assets/img/logo.png" alt="MrKlypp">
        </a>
        <h1>Pokémon Stream Visualizer</h1>
    </div>
    <div class="header-controls-row">
        <div class="mode-toggle">
            <a href="index.html"  id="mode-btn-pokemon" class="mode-btn" data-i18n-badge="pokemonMode">Pokémon</a>
            <a href="badges.html" id="mode-btn-badges"  class="mode-btn" data-i18n-badge="badgeMode">Medallas</a>
            <a href="types.html"  id="mode-btn-types"   class="mode-btn active" data-i18n-badge="typesMode">Tabla de tipos</a>
        </div>
        <div class="lang-toggle">
            <button id="lang-es" onclick="setLang('es')">ES</button>
            <button id="lang-en" onclick="setLang('en')">EN</button>
        </div>
    </div>
</header>
<div id="app">

    <div class="card">
        <div class="types-layout">
            <div class="types-selector">
                <div id="type-grid" class="type-grid"></div>
                <button class="btn-reset" onclick="resetTypes()" data-i18n-type="resetBtn">Resetear</button>
            </div>
            <div id="types-table" class="types-table-panel"></div>
        </div>
    </div>

    <div class="card social">
        <p>Hecho por @MrKlypp</p>
        <a href="https://paypal.me/MrKlypp" target="_blank" rel="noopener" class="donate-btn">💜 Donar</a>
        <div class="social-links">
            <a href="https://mrklypp.com" target="_blank">Home</a>
            <a href="https://www.twitch.tv/MrKlypp" target="_blank">Twitch</a>
            <a href="https://www.youtube.com/@MrKlypp" target="_blank">YouTube</a>
            <a href="https://www.instagram.com/MrKlypp_/" target="_blank">Instagram</a>
            <a href="https://www.tiktok.com/@mrklypp" target="_blank">TikTok</a>
            <a href="https://x.com/MrKlypp" target="_blank">X</a>
        </div>
    </div>

</div>

<script src="badges.js"></script>
<script src="types.js"></script>
<script>
function setLang(lang) {
    setLangBase(lang);
    document.documentElement.lang = lang;
    document.getElementById('lang-es').classList.toggle('active', lang === 'es');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    applyBadgeLang();
    applyTypeLang();
}
setLang(currentLang);
</script>
</body>
</html>
```

**Note:** `badges.js` is loaded here solely so `applyBadgeLang()` can translate the `data-i18n-badge` nav labels (same pattern as `index.html`). `initBadges()` is never called, so no badge UI code runs.

- [ ] **Step 2: Open `types.html` in browser and verify**

- All 3 nav links visible, "Tabla de tipos" active (highlighted)
- 18 type buttons render in a 3-column grid with correct colors
- Placeholder text visible on the right
- Lang toggle switches type names and button labels

---

## Task 5: Add CSS to `style.css`

**Files:**
- Modify: `style.css` (append to end)

- [ ] **Step 1: Append types CSS to `style.css`**

```css
/* ── Types table ─────────────────────────────────────────────── */
.types-layout {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1.2rem;
    align-items: start;
}
@media (max-width: 700px) {
    .types-layout { grid-template-columns: 1fr; }
}

.types-selector {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.type-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.35rem;
}

.type-btn {
    padding: 0.4rem 0.5rem;
    border-radius: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    font-weight: 700;
    cursor: pointer;
    border: 2px solid transparent;
    color: white;
    text-shadow: 0 1px 2px rgba(0,0,0,0.6);
    transition: border-color 0.15s, box-shadow 0.15s;
    white-space: nowrap;
}
.type-btn.selected {
    border-color: white;
    box-shadow: 0 0 8px rgba(255,255,255,0.4);
}
.type-btn:hover { opacity: 0.85; }

.types-table-panel {
    min-height: 120px;
}

.types-placeholder {
    color: var(--dim);
    font-size: 0.8rem;
    padding-top: 0.5rem;
}

.mult-row {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border);
}
.mult-row:last-child { border-bottom: none; }
.mult-row--neutral { opacity: 0.45; }

.mult-label {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-em);
    min-width: 3rem;
    padding-top: 0.15rem;
    flex-shrink: 0;
}

.mult-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
}

.type-chip {
    display: inline-block;
    padding: 0.2rem 0.55rem;
    border-radius: 100px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    font-weight: 700;
    color: white;
    text-shadow: 0 1px 2px rgba(0,0,0,0.6);
}
```

- [ ] **Step 2: Full interaction test in browser**

1. Open `types.html`
2. Click **Fuego** → right side shows: ×2 Agua/Tierra/Roca, ×0.5 Fuego/Planta/Hielo/Bicho/Acero/Hada
3. Click **Tierra** (2nd type) → right side now shows ×4 Agua, ×0 Eléctrico, combined resistances
4. Click **Fuego** again → deselects Fuego, only Tierra selected
5. With Tierra selected, click **Agua** then **Planta** → Tierra evicted (FIFO), Agua+Planta selected
6. Click **Resetear** → all buttons inactive, placeholder returns
7. Switch to EN → all type names in English, reset button says "Reset"
8. Navigate to `index.html` and `badges.html` → both show 3 nav links, correct active state, labels translate

- [ ] **Step 3: Commit**

```bash
git add types.js types.html style.css
git commit -m "feat: add types table page"
```
