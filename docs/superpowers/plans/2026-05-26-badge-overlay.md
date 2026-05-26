# Badge Overlay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a gym badge overlay system to the Pokémon Team Visualizer, switchable from Pokémon mode via a header toggle.

**Architecture:** New `badges.js` module loaded after `app.js` — all badge state and UI logic lives there. Badge overlay rendered by new `badge-overlay.html`. `index.html` wraps the existing Pokémon section and adds a new badge section, toggled by CSS `.hidden`. `publish.js` generalized to pass any body data through to Ably.

**Tech Stack:** Vanilla JS, CSS, Ably Realtime (existing), Cloudflare Pages Functions (existing), webp images.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `functions/api/publish.js` | Modify | Generalize to pass any payload data (not just team fields) |
| `style.css` | Modify | Mode toggle pill, `.hidden`, badge checkbox/brightness styles |
| `index.html` | Modify | Wrap Pokémon section, add mode toggle to header, add badge section HTML, load `badges.js` |
| `app.js` | Modify | Call `applyBadgeLang()` from `setLang()` (guarded) |
| `badges.js` | Create | All badge logic: constants, state, i18n, UI builders, preview, OBS panel, publish, persistence |
| `badge-overlay.html` | Create | OBS browser source for badge grid |
| `.gitignore` | Modify | Add `.superpowers/` |

---

## Task 1: Setup

**Files:**
- Modify: `.gitignore`
- Modify: `functions/api/publish.js`

- [ ] **Add `.superpowers/` to `.gitignore`**

Open `.gitignore`, add at the end:
```
.superpowers/
```

- [ ] **Generalize `publish.js` to pass any payload**

Replace the entire contents of `functions/api/publish.js` with:

```js
export async function onRequestPost(context) {
    if (!context.env.ABLY_API_KEY) {
        return json({ error: 'ABLY_API_KEY not configured' }, 503);
    }
    let body;
    try { body = await context.request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

    const { id, ...data } = body;
    if (!id || !/^[0-9a-f-]{36}$/.test(id)) return json({ error: 'Invalid id' }, 400);

    const resp = await fetch(`https://rest.ably.io/channels/ptv-${id}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(context.env.ABLY_API_KEY),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'update', data: JSON.stringify(data) }),
    });

    return resp.ok ? json({ ok: true }) : json({ error: 'Ably error' }, 502);
}

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
```

This strips `id` from the body and forwards everything else as message data. Existing Pokémon overlay still works because `data.team`, `data.layout`, `data.shadows`, `data.bg` are preserved.

- [ ] **Commit**

```bash
git add .gitignore functions/api/publish.js
git commit -m "refactor: generalize publish.js to pass arbitrary payload data"
```

---

## Task 2: CSS additions

**Files:**
- Modify: `style.css`

- [ ] **Append badge styles to the end of `style.css`**

Add at the very end of `style.css`:

```css
/* ── Mode toggle ─────────────────────────────────────────────── */
.header-controls-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 8px;
}
.mode-toggle {
    display: flex;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 100px;
    padding: 3px;
    gap: 2px;
}
.mode-btn {
    padding: 0.3rem 0.9rem;
    border-radius: 100px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    font-weight: 700;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.18s;
    color: var(--text);
    background: transparent;
}
.mode-btn.active {
    background: var(--surface);
    color: var(--text-em);
    border-color: rgba(0, 204, 255, 0.3);
    box-shadow: 0 0 12px rgba(0, 204, 255, 0.15);
}

/* ── Badge section ───────────────────────────────────────────── */
.hidden { display: none !important; }

.badge-checkboxes {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    align-items: flex-start;
}
.badge-check-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
}
.badge-check-item input[type="checkbox"] {
    accent-color: var(--pink);
    width: 14px;
    height: 14px;
    cursor: pointer;
}
.badge-thumb {
    width: 40px;
    height: 40px;
    object-fit: contain;
    display: block;
    transition: filter 0.2s;
}

.badge-brightness-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.82rem;
    color: var(--text-em);
}
.badge-brightness-row input[type="range"] {
    accent-color: var(--pink);
    width: 160px;
}
#badge-brightness-val {
    color: var(--muted);
    font-size: 0.78rem;
    min-width: 2.5rem;
}

#badge-preview-wrapper {
    position: relative;
    overflow: hidden;
}
#badge-preview-iframe {
    transform-origin: top left;
    display: block;
    border: none;
}
```

- [ ] **Verify mode toggle appears centered and badge styles are error-free**

Open `index.html` in a browser. No JS errors expected at this point (badge section HTML doesn't exist yet). Confirm no CSS parse errors in DevTools.

- [ ] **Commit**

```bash
git add style.css
git commit -m "style: add mode toggle and badge section styles"
```

---

## Task 3: `index.html` structural changes

**Files:**
- Modify: `index.html`

- [ ] **Add mode toggle to header**

In `index.html`, find the `<div class="lang-toggle">` block and replace it with:

```html
    <div class="header-controls-row">
        <div class="mode-toggle">
            <button id="mode-btn-pokemon" class="mode-btn active" onclick="setMode('pokemon')" data-i18n-badge="pokemonMode">Pokémon</button>
            <button id="mode-btn-badges" class="mode-btn" onclick="setMode('badges')" data-i18n-badge="badgeMode">Medallas</button>
        </div>
        <div class="lang-toggle">
            <button id="lang-es" onclick="setLang('es')">ES</button>
            <button id="lang-en" onclick="setLang('en')">EN</button>
        </div>
    </div>
```

- [ ] **Wrap the Pokémon section**

In `index.html`, find `<div id="app">` and the line immediately after it (`<!-- Team -->`). Insert `<div id="section-pokemon">` on a new line after `<div id="app">`.

Find the closing tag of the last Pokémon card (the `.card.card--actions` div, which ends just before `<!-- Social -->`). Insert `</div><!-- /section-pokemon -->` before `<!-- Social -->`.

The result should look like:

```html
<div id="app">

<div id="section-pokemon">
    <!-- Team -->
    <div class="card card--team">
        ...
    </div>
    <!-- Presets -->
    <div class="card card--presets">
        ...
    </div>
    <!-- Settings -->
    <div class="card">
        ...
    </div>
    <!-- Live preview -->
    <div class="card card--preview" id="preview-card">
        ...
    </div>
    <!-- Actions -->
    <div class="card card--actions">
        ...
    </div>
</div><!-- /section-pokemon -->

<!-- Social -->
<div class="card social">
    ...
</div>

</div>
```

- [ ] **Add badge section before the Social card**

Insert the following HTML between `</div><!-- /section-pokemon -->` and `<!-- Social -->`:

```html
<!-- Badges -->
<div id="section-badges" class="hidden">

    <!-- Settings -->
    <div class="card">
        <div class="settings-row">
            <label>
                <span data-i18n-badge="badgeGame"></span>
                <select id="badge-game-select"></select>
            </label>
            <label>
                <span data-i18n-badge="badgeLayout"></span>
                <select id="badge-layout-select"></select>
            </label>
        </div>
    </div>

    <!-- Badge checkboxes -->
    <div class="card card--team">
        <div id="badge-checkboxes" class="badge-checkboxes"></div>
    </div>

    <!-- Brightness -->
    <div class="card">
        <div class="badge-brightness-row">
            <span data-i18n-badge="badgeBrightness"></span>
            <input type="range" id="badge-brightness" min="0" max="50" value="20"
                   oninput="updateBadgeBrightness(this.value)">
            <span id="badge-brightness-val">20%</span>
        </div>
    </div>

    <!-- Live preview -->
    <div class="card card--preview">
        <div id="badge-preview-wrapper">
            <iframe id="badge-preview-iframe" scrolling="no" frameborder="0"></iframe>
        </div>
    </div>

    <!-- Actions -->
    <div class="card card--actions">
        <div class="actions">
            <p id="badge-obs-hint" class="obs-hint"></p>
            <button class="btn-publish" onclick="publishBadgesToObs()" data-i18n-badge="badgePublishBtn"></button>
            <button class="btn-reset" onclick="resetBadges()" data-i18n-badge="badgeResetBtn"></button>
            <div id="badge-status"></div>
        </div>
    </div>

</div><!-- /section-badges -->
```

- [ ] **Add `badges.js` script tag**

Find `<script src="app.js"></script>` near the bottom of `index.html` and add `badges.js` immediately after:

```html
<script src="app.js"></script>
<script src="badges.js"></script>
```

- [ ] **Verify in browser**

Open `index.html`. Pokémon section visible as before, no layout changes. DevTools console shows one expected error: `Cannot read properties of undefined (reading 'addEventListener')` or similar from badges.js not existing yet — that's OK, ignore it.

- [ ] **Commit**

```bash
git add index.html
git commit -m "feat: add mode toggle and badge section scaffold to index.html"
```

---

## Task 4: `badges.js` — constants, state, i18n

**Files:**
- Create: `badges.js`

- [ ] **Create `badges.js` with constants, state, and i18n**

Create `badges.js` with this content:

```js
// ── Constants ────────────────────────────────────────────────────
const GAME_TO_REGION = {
    'pokemon-rojo':               'Kanto',
    'pokemon-azul':               'Kanto',
    'pokemon-amarillo':           'Kanto',
    'pokemon-rojo-fuego':         'Kanto',
    'pokemon-verde-hoja':         'Kanto',
    'pokemon-lets-go-pikachu':    'Kanto',
    'pokemon-lets-go-eevee':      'Kanto',
    'pokemon-oro':                'Johto',
    'pokemon-plata':              'Johto',
    'pokemon-cristal':            'Johto',
    'pokemon-soulsilver':         'Johto',
    'pokemon-heartgold':          'Johto',
    'pokemon-rubi':               'Hoenn',
    'pokemon-zafiro':             'Hoenn',
    'pokemon-esmeralda':          'Hoenn',
    'pokemon-rubi-omega':         'Hoenn',
    'pokemon-zafiro-alfa':        'Hoenn',
    'pokemon-diamante':           'Sinnoh',
    'pokemon-perla':              'Sinnoh',
    'pokemon-platino':            'Sinnoh',
    'pokemon-diamante-brillante': 'Sinnoh',
    'pokemon-perla-reluciente':   'Sinnoh',
    'pokemon-negro':              'Unova1',
    'pokemon-blanco':             'Unova1',
    'pokemon-negro-2':            'Unova2',
    'pokemon-blanco-2':           'Unova2',
    'pokemon-x':                  'Kalos',
    'pokemon-y':                  'Kalos',
    'pokemon-espada':             'Galar',
    'pokemon-escudo':             'Galar',
    'pokemon-escarlata':          'Paldea',
    'pokemon-purpura':            'Paldea',
};

const REGION_DATA = {
    Kanto:  { count: 8 },
    Johto:  { count: 8 },
    Hoenn:  { count: 8 },
    Sinnoh: { count: 8 },
    Unova1: { count: 8 },
    Unova2: { count: 8 },
    Kalos:  { count: 8 },
    Galar:  { count: 10 },
    Paldea: { count: 8 },
};

const BADGE_GAMES = [
    { region: 'Kanto', label: 'Kanto', games: [
        ['pokemon-rojo',            'Pokémon Rojo'],
        ['pokemon-azul',            'Pokémon Azul'],
        ['pokemon-amarillo',        'Pokémon Amarillo'],
        ['pokemon-rojo-fuego',      'Pokémon Rojo Fuego'],
        ['pokemon-verde-hoja',      'Pokémon Verde Hoja'],
        ['pokemon-lets-go-pikachu', "Pokémon: Let's Go, Pikachu!"],
        ['pokemon-lets-go-eevee',   "Pokémon: Let's Go, Eevee!"],
    ]},
    { region: 'Johto', label: 'Johto', games: [
        ['pokemon-oro',        'Pokémon Oro'],
        ['pokemon-plata',      'Pokémon Plata'],
        ['pokemon-cristal',    'Pokémon Cristal'],
        ['pokemon-soulsilver', 'Pokémon SoulSilver'],
        ['pokemon-heartgold',  'Pokémon HeartGold'],
    ]},
    { region: 'Hoenn', label: 'Hoenn', games: [
        ['pokemon-rubi',        'Pokémon Rubí'],
        ['pokemon-zafiro',      'Pokémon Zafiro'],
        ['pokemon-esmeralda',   'Pokémon Esmeralda'],
        ['pokemon-rubi-omega',  'Pokémon Rubí Omega'],
        ['pokemon-zafiro-alfa', 'Pokémon Zafiro Alfa'],
    ]},
    { region: 'Sinnoh', label: 'Sinnoh', games: [
        ['pokemon-diamante',           'Pokémon Diamante'],
        ['pokemon-perla',              'Pokémon Perla'],
        ['pokemon-platino',            'Pokémon Platino'],
        ['pokemon-diamante-brillante', 'Pokémon Diamante Brillante'],
        ['pokemon-perla-reluciente',   'Pokémon Perla Reluciente'],
    ]},
    { region: 'Unova1', label: 'Teselia', games: [
        ['pokemon-negro',  'Pokémon Edición Negra'],
        ['pokemon-blanco', 'Pokémon Edición Blanca'],
    ]},
    { region: 'Unova2', label: 'Teselia 2', games: [
        ['pokemon-negro-2',  'Pokémon Edición Negra 2'],
        ['pokemon-blanco-2', 'Pokémon Edición Blanca 2'],
    ]},
    { region: 'Kalos', label: 'Kalos', games: [
        ['pokemon-x', 'Pokémon X'],
        ['pokemon-y', 'Pokémon Y'],
    ]},
    { region: 'Galar', label: 'Galar', games: [
        ['pokemon-espada', 'Pokémon Espada'],
        ['pokemon-escudo', 'Pokémon Escudo'],
    ]},
    { region: 'Paldea', label: 'Paldea', games: [
        ['pokemon-escarlata', 'Pokémon Escarlata'],
        ['pokemon-purpura',   'Pokémon Púrpura'],
    ]},
];

// ── i18n ─────────────────────────────────────────────────────────
// currentLang is a global defined in app.js (loaded before badges.js)
const BADGE_STRINGS = {
    es: {
        pokemonMode:            'Pokémon',
        badgeMode:              'Medallas',
        badgeGame:              'Juego',
        badgeLayout:            'Diseño',
        badgeBrightness:        'Brillo inactivas',
        badgeObsHint:           dims => `Añade un <strong>Browser Source</strong> en OBS.<br>Tamaño recomendado: <strong>${dims}</strong>`,
        badgeUrlLabel:          'URL para la fuente de navegador',
        badgeUrlSub:            'No tienes que cambiarla salvo si creas una nueva.',
        badgeUrlCopy:           'Copiar',
        badgeUrlCopied:         '¡URL copiada!',
        badgePublishBtn:        '📡 Publicar medallas en OBS',
        badgeResetBtn:          'Resetear medallas',
        badgePublishOk:         '¡Overlay de medallas actualizado!',
        badgePublishErr:        'Error al publicar. ¿Está configurado Ably?',
        badgeNewChannel:        '🔄 Nuevo enlace',
        badgeNewChannelConfirm: '¿Generar un nuevo enlace? Tendrás que actualizar la URL en OBS.',
        badgeConfirmReset:      '¿Resetear todas las medallas?',
        badgeSuccessReset:      'Medallas reseteadas.',
        badgeCopyPrompt:        'Copia este enlace:',
    },
    en: {
        pokemonMode:            'Pokémon',
        badgeMode:              'Badges',
        badgeGame:              'Game',
        badgeLayout:            'Layout',
        badgeBrightness:        'Inactive brightness',
        badgeObsHint:           dims => `Add a <strong>Browser Source</strong> in OBS.<br>Recommended size: <strong>${dims}</strong>`,
        badgeUrlLabel:          'Browser source URL',
        badgeUrlSub:            'No need to change it unless you create a new one.',
        badgeUrlCopy:           'Copy',
        badgeUrlCopied:         'URL copied!',
        badgePublishBtn:        '📡 Publish badges to OBS',
        badgeResetBtn:          'Reset badges',
        badgePublishOk:         'Badge overlay updated in OBS!',
        badgePublishErr:        'Publish error. Is Ably configured?',
        badgeNewChannel:        '🔄 New link',
        badgeNewChannelConfirm: 'Generate a new link? You will need to update the URL in OBS.',
        badgeConfirmReset:      'Reset all badge data?',
        badgeSuccessReset:      'Badges reset.',
        badgeCopyPrompt:        'Copy this link:',
    },
};

function tB(key, arg) {
    const val = BADGE_STRINGS[currentLang][key];
    return typeof val === 'function' ? val(arg) : val;
}

function applyBadgeLang() {
    document.querySelectorAll('[data-i18n-badge]').forEach(el => {
        const key = el.dataset.i18nBadge;
        const s = BADGE_STRINGS[currentLang];
        if (typeof s[key] === 'string') el.textContent = s[key];
    });
    if (badgeChannelId) updateBadgeObsHint();
}

// ── Helpers ──────────────────────────────────────────────────────
function getLayouts(count) {
    const layouts = [];
    for (let cols = 1; cols <= count; cols++) {
        if (count % cols === 0) {
            layouts.push({ cols, rows: count / cols, value: `${cols}x${count / cols}` });
        }
    }
    return layouts;
}

// ── State ─────────────────────────────────────────────────────────
let badgeGame       = 'pokemon-rojo';
let badgeRegion     = 'Kanto';
let badgeLayout     = '8x1';
let badgeActive     = Array(8).fill(true);
let badgeBrightness = 20;
let badgeChannelId  = null;
```

- [ ] **Verify in browser**

Open `index.html`. No console errors. Toggle buttons show "Pokémon" / "Medallas" (i18n applied on init later). DevTools shows `badges.js` loaded.

- [ ] **Commit**

```bash
git add badges.js
git commit -m "feat(badges): add constants, state, and i18n"
```

---

## Task 5: `badges.js` — selector builders

**Files:**
- Modify: `badges.js`

- [ ] **Append game and layout selector functions to `badges.js`**

```js
// ── Selectors ────────────────────────────────────────────────────
function buildBadgeGameSelect() {
    const sel = document.getElementById('badge-game-select');
    sel.innerHTML = BADGE_GAMES.map(g =>
        `<optgroup label="${g.label}">${g.games.map(([val, label]) =>
            `<option value="${val}"${val === badgeGame ? ' selected' : ''}>${label}</option>`
        ).join('')}</optgroup>`
    ).join('');
    sel.onchange = () => {
        badgeGame   = sel.value;
        badgeRegion = GAME_TO_REGION[badgeGame];
        const count = REGION_DATA[badgeRegion].count;
        badgeActive = Array(count).fill(true);
        badgeLayout = getLayouts(count)[0].value;
        buildBadgeLayoutSelect();
        buildBadgeCheckboxes();
        saveBadgeState();
        updateBadgeObsHint();
        schedulePreviewBadgeUpdate();
    };
}

function buildBadgeLayoutSelect() {
    const count   = REGION_DATA[badgeRegion].count;
    const layouts = getLayouts(count);
    const sel     = document.getElementById('badge-layout-select');
    sel.innerHTML = layouts.map(l =>
        `<option value="${l.value}"${l.value === badgeLayout ? ' selected' : ''}>${l.cols}×${l.rows} — ${l.cols * 80}×${l.rows * 80} px</option>`
    ).join('');
    sel.onchange = () => {
        badgeLayout = sel.value;
        saveBadgeState();
        updateBadgeObsHint();
        schedulePreviewBadgeUpdate();
    };
}
```

- [ ] **Commit**

```bash
git add badges.js
git commit -m "feat(badges): add game and layout selector builders"
```

---

## Task 6: `badges.js` — checkbox UI and brightness

**Files:**
- Modify: `badges.js`

- [ ] **Append checkbox and brightness functions to `badges.js`**

```js
// ── Badge checkboxes ─────────────────────────────────────────────
function buildBadgeCheckboxes() {
    const count     = REGION_DATA[badgeRegion].count;
    const container = document.getElementById('badge-checkboxes');
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const item = document.createElement('div');
        item.className = 'badge-check-item';

        const img = document.createElement('img');
        img.src       = `badges/${badgeRegion}/${i + 1}.webp`;
        img.alt       = `Badge ${i + 1}`;
        img.className = 'badge-thumb';
        if (!badgeActive[i]) img.style.filter = `brightness(${badgeBrightness / 100})`;

        const cb  = document.createElement('input');
        cb.type    = 'checkbox';
        cb.checked = badgeActive[i];
        cb.addEventListener('change', () => {
            badgeActive[i] = cb.checked;
            img.style.filter = cb.checked ? '' : `brightness(${badgeBrightness / 100})`;
            saveBadgeState();
            schedulePreviewBadgeUpdate();
        });

        item.appendChild(img);
        item.appendChild(cb);
        container.appendChild(item);
    }
}

function updateBadgeBrightness(val) {
    badgeBrightness = Number(val);
    document.getElementById('badge-brightness-val').textContent = val + '%';
    document.querySelectorAll('#badge-checkboxes .badge-thumb').forEach((img, i) => {
        if (!badgeActive[i]) img.style.filter = `brightness(${badgeBrightness / 100})`;
    });
    saveBadgeState();
    schedulePreviewBadgeUpdate();
}
```

- [ ] **Commit**

```bash
git add badges.js
git commit -m "feat(badges): add badge checkbox UI and brightness slider"
```

---

## Task 7: `badges.js` — overlay HTML and preview

**Files:**
- Modify: `badges.js`

- [ ] **Append overlay builder and preview functions to `badges.js`**

```js
// ── Overlay HTML builder ─────────────────────────────────────────
function buildBadgeOverlayHTML() {
    const [cols, rows] = badgeLayout.split('x').map(Number);
    const count        = REGION_DATA[badgeRegion].count;
    const bv           = (badgeBrightness / 100).toFixed(2);

    const imgs = Array.from({ length: count }, (_, i) => {
        const filter = badgeActive[i] ? '' : `filter:brightness(${bv});`;
        const delay  = (i * 0.08).toFixed(2);
        return `<img src="badges/${badgeRegion}/${i + 1}.webp" style="width:80px;height:80px;object-fit:contain;display:block;animation:fadeSlideUp 0.45s ${delay}s ease forwards;opacity:0;${filter}" alt="">`;
    }).join('\n');

    return `<html>
<head>
<meta charset="UTF-8">
<style>
body,html{margin:0;padding:0;background:transparent;}
.grid{display:grid;grid-template-columns:repeat(${cols},80px);gap:0;width:${cols * 80}px;}
@keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
</style>
</head>
<body>
<div class="grid">
${imgs}
</div>
</body>
</html>`;
}

// ── Live preview ──────────────────────────────────────────────────
let badgePreviewTimeout = null;

function schedulePreviewBadgeUpdate() {
    clearTimeout(badgePreviewTimeout);
    badgePreviewTimeout = setTimeout(updateBadgePreview, 300);
}

function updateBadgePreview() {
    const iframe  = document.getElementById('badge-preview-iframe');
    const wrapper = document.getElementById('badge-preview-wrapper');
    const [cols, rows] = badgeLayout.split('x').map(Number);
    const nativeW = cols * 80;
    const nativeH = rows * 80;

    const card       = wrapper.parentElement;
    const cardStyle  = getComputedStyle(card);
    const containerW = card.clientWidth
        - parseFloat(cardStyle.paddingLeft)
        - parseFloat(cardStyle.paddingRight);

    const scale = Math.min(1, containerW / nativeW);
    iframe.style.width          = nativeW + 'px';
    iframe.style.height         = nativeH + 'px';
    iframe.style.transform      = `scale(${scale})`;
    wrapper.style.width         = Math.round(nativeW * scale) + 'px';
    wrapper.style.height        = Math.round(nativeH * scale) + 'px';
    wrapper.style.margin        = '0';

    iframe.srcdoc = buildBadgeOverlayHTML();
}
```

- [ ] **Commit**

```bash
git add badges.js
git commit -m "feat(badges): add overlay HTML builder and live preview"
```

---

## Task 8: `badges.js` — OBS panel, publish, persistence, reset

**Files:**
- Modify: `badges.js`

- [ ] **Append OBS panel and publish functions to `badges.js`**

```js
// ── OBS hint ─────────────────────────────────────────────────────
function updateBadgeObsHint() {
    const [cols, rows] = badgeLayout.split('x').map(Number);
    const dims = `${cols * 80}×${rows * 80}`;
    const url  = `https://pokemon.mrklypp.com/badge-overlay.html?id=${badgeChannelId}`;
    document.getElementById('badge-obs-hint').innerHTML =
        tB('badgeObsHint', dims) +
        `<br><br><span class="obs-url-label">${tB('badgeUrlLabel')}</span>` +
        `<span class="obs-url-sub">${tB('badgeUrlSub')}</span>` +
        `<div class="obs-url-row">` +
        `<span class="obs-url-display">${url}</span>` +
        `<button class="btn-copy-url" onclick="copyBadgeOverlayUrl()">${tB('badgeUrlCopy')}</button>` +
        `</div>` +
        `<div class="obs-channel-actions">` +
        `<button class="btn-channel-action" onclick="newBadgeChannel()">${tB('badgeNewChannel')}</button>` +
        `</div>`;
}

function copyBadgeOverlayUrl() {
    const url = `https://pokemon.mrklypp.com/badge-overlay.html?id=${badgeChannelId}`;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => setBadgeStatus(tB('badgeUrlCopied'), 'var(--success)'));
    } else {
        prompt(tB('badgeCopyPrompt'), url);
    }
}

function newBadgeChannel() {
    if (!confirm(tB('badgeNewChannelConfirm'))) return;
    badgeChannelId = crypto.randomUUID();
    localStorage.setItem('ptv_badge_channel_id', badgeChannelId);
    updateBadgeObsHint();
}

// ── Publish ───────────────────────────────────────────────────────
async function publishBadgesToObs() {
    try {
        const resp = await fetch('/api/publish', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                id:         badgeChannelId,
                region:     badgeRegion,
                layout:     badgeLayout,
                active:     badgeActive,
                brightness: badgeBrightness,
            }),
        });
        setBadgeStatus(tB(resp.ok ? 'badgePublishOk' : 'badgePublishErr'), resp.ok ? 'var(--success)' : 'var(--error)');
    } catch {
        setBadgeStatus(tB('badgePublishErr'), 'var(--error)');
    }
}

// ── Reset ─────────────────────────────────────────────────────────
function resetBadges() {
    if (!confirm(tB('badgeConfirmReset'))) return;
    const count = REGION_DATA[badgeRegion].count;
    badgeActive     = Array(count).fill(true);
    badgeBrightness = 20;
    buildBadgeCheckboxes();
    document.getElementById('badge-brightness').value     = 20;
    document.getElementById('badge-brightness-val').textContent = '20%';
    saveBadgeState();
    schedulePreviewBadgeUpdate();
    setBadgeStatus(tB('badgeSuccessReset'), 'var(--success)');
}

function setBadgeStatus(msg, color) {
    const el = document.getElementById('badge-status');
    el.textContent = msg;
    el.style.color = color;
    setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 4000);
}

// ── Persistence ───────────────────────────────────────────────────
function saveBadgeState() {
    localStorage.setItem('ptv_badge_game',       badgeGame);
    localStorage.setItem('ptv_badge_layout',     badgeLayout);
    localStorage.setItem('ptv_badge_active',     JSON.stringify(badgeActive));
    localStorage.setItem('ptv_badge_brightness', String(badgeBrightness));
}

function loadBadgeState() {
    const game = localStorage.getItem('ptv_badge_game');
    if (game && GAME_TO_REGION[game]) {
        badgeGame   = game;
        badgeRegion = GAME_TO_REGION[game];
    }
    const count  = REGION_DATA[badgeRegion].count;
    const layout = localStorage.getItem('ptv_badge_layout');
    if (layout && getLayouts(count).some(l => l.value === layout)) badgeLayout = layout;
    else badgeLayout = getLayouts(count)[0].value;

    const active = localStorage.getItem('ptv_badge_active');
    if (active) {
        try {
            const parsed = JSON.parse(active);
            badgeActive = (Array.isArray(parsed) && parsed.length === count)
                ? parsed.map(Boolean)
                : Array(count).fill(true);
        } catch { badgeActive = Array(count).fill(true); }
    } else {
        badgeActive = Array(count).fill(true);
    }

    const brightness = localStorage.getItem('ptv_badge_brightness');
    if (brightness !== null) badgeBrightness = Math.min(50, Math.max(0, Number(brightness)));
}
```

- [ ] **Commit**

```bash
git add badges.js
git commit -m "feat(badges): add OBS panel, publish, reset, and persistence"
```

---

## Task 9: `badges.js` — mode toggle and init

**Files:**
- Modify: `badges.js`
- Modify: `app.js`

- [ ] **Append mode toggle and init to `badges.js`**

```js
// ── Mode toggle ───────────────────────────────────────────────────
function setMode(mode) {
    localStorage.setItem('ptv_mode', mode);
    document.getElementById('section-pokemon').classList.toggle('hidden', mode !== 'pokemon');
    document.getElementById('section-badges').classList.toggle('hidden',  mode !== 'badges');
    document.getElementById('mode-btn-pokemon').classList.toggle('active', mode === 'pokemon');
    document.getElementById('mode-btn-badges').classList.toggle('active',  mode === 'badges');
}

// ── Init ──────────────────────────────────────────────────────────
function initBadges() {
    badgeChannelId = localStorage.getItem('ptv_badge_channel_id');
    if (!badgeChannelId) {
        badgeChannelId = crypto.randomUUID();
        localStorage.setItem('ptv_badge_channel_id', badgeChannelId);
    }

    loadBadgeState();
    buildBadgeGameSelect();
    buildBadgeLayoutSelect();
    buildBadgeCheckboxes();
    document.getElementById('badge-brightness').value            = badgeBrightness;
    document.getElementById('badge-brightness-val').textContent  = badgeBrightness + '%';
    updateBadgeObsHint();
    applyBadgeLang();
    updateBadgePreview();

    const savedMode = localStorage.getItem('ptv_mode') || 'pokemon';
    setMode(savedMode);
}

initBadges();
```

- [ ] **Guard `applyBadgeLang` call in `app.js`**

In `app.js`, find the `setLang` function. At the end of it, after `applyLang()`, add:

```js
    if (typeof applyBadgeLang === 'function') applyBadgeLang();
```

The full updated function should look like:

```js
function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('ptv_lang', lang);
    document.documentElement.lang = lang;
    document.getElementById('lang-es').classList.toggle('active', lang === 'es');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    applyLang();
    if (typeof applyBadgeLang === 'function') applyBadgeLang();
}
```

- [ ] **Verify mode toggle works in browser**

Serve with `npx serve .` (already running on port 3001 or restart). Open `http://localhost:3001`. Click "Medallas" — Pokémon section hides, badge section appears. Click "Pokémon" — reverses. Refresh page — last mode is restored.

- [ ] **Verify badge section renders**

In badge mode, game selector shows all 9 regions grouped. Layout selector shows correct options for default (Kanto → `8×1, 4×2, 2×4, 1×8`). Change game to Galar → layout options become `10×1, 5×2, 2×5, 1×10`. Checkboxes show 8 thumbnails (or 10 for Galar). Preview iframe shows badge grid. OBS hint shows correct URL and dimensions.

- [ ] **Commit**

```bash
git add badges.js app.js
git commit -m "feat(badges): add mode toggle, init, and wire applyBadgeLang into setLang"
```

---

## Task 10: `badge-overlay.html`

**Files:**
- Create: `badge-overlay.html`

- [ ] **Create `badge-overlay.html`**

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
*, *::before, *::after { box-sizing: border-box; }
body, html { margin: 0; padding: 0; background: transparent; }
.grid { display: grid; gap: 0; }
@keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
}
</style>
</head>
<body>
<div id="root"></div>
<script src="https://cdn.ably.com/lib/ably.min-2.js"></script>
<script>
(function () {
    var id = new URLSearchParams(location.search).get('id');
    if (!id) return;

    function render(data) {
        var region     = data.region     || 'Kanto';
        var layout     = data.layout     || '8x1';
        var active     = data.active     || [];
        var brightness = typeof data.brightness === 'number' ? data.brightness : 20;

        var parts = layout.split('x').map(Number);
        var cols  = parts[0];
        var count = active.length;

        var grid = document.createElement('div');
        grid.className = 'grid';
        grid.style.gridTemplateColumns = 'repeat(' + cols + ', 80px)';
        grid.style.width = (cols * 80) + 'px';

        for (var i = 0; i < count; i++) {
            var img = document.createElement('img');
            img.src    = 'badges/' + region + '/' + (i + 1) + '.webp';
            img.alt    = '';
            img.width  = 80;
            img.height = 80;
            img.style.cssText = 'display:block;object-fit:contain;'
                + 'animation:fadeSlideUp 0.45s ' + (i * 0.08).toFixed(2) + 's ease forwards;opacity:0;'
                + (active[i] ? '' : 'filter:brightness(' + (brightness / 100).toFixed(2) + ');');
            grid.appendChild(img);
        }

        var root = document.getElementById('root');
        root.innerHTML = '';
        root.appendChild(grid);
    }

    var ably    = new Ably.Realtime({ authUrl: '/api/token' });
    var channel = ably.channels.get('ptv-' + id, { params: { rewind: '1' } });
    channel.subscribe('update', function (msg) {
        try { render(JSON.parse(msg.data)); } catch (e) {}
    });

    ably.connection.on('failed', function (s) {
        console.error('[Badge Overlay] Ably connection failed:', s.reason);
    });
})();
</script>
</body>
</html>
```

- [ ] **Verify overlay renders locally**

Open `http://localhost:3001/badge-overlay.html?id=00000000-0000-0000-0000-000000000000`. Page loads without errors (Ably connection will fail with invalid id — that's expected). No JS parse errors in console.

- [ ] **Commit**

```bash
git add badge-overlay.html
git commit -m "feat: add badge-overlay.html for OBS browser source"
```

---

## Task 11: End-to-end verification

**No code changes — manual testing only.**

- [ ] **Test badge section UI**

Serve: `npx serve .`

1. Open `http://localhost:3000` (or 3001 if that port is in use)
2. Click "Medallas" toggle — badge section appears, Pokémon section hides
3. Select "Pokémon Espada" (Galar) — layout options update to 10×1 etc., 10 badge checkboxes appear
4. Uncheck badge 5 — thumbnail darkens, preview updates (after 300ms debounce)
5. Move brightness slider — unchecked badges update brightness in thumbnails and preview
6. Select layout "5×2" — preview iframe resizes, OBS hint shows "400×160"
7. Reload page — badge mode restored, Galar selected, badge 5 still unchecked, brightness preserved
8. Click "Pokémon" — Pokémon section back, all Pokémon functionality intact
9. Change language to EN — badge section labels update to English

- [ ] **Test OBS URL panel**

1. Click "Copiar" button — URL copied to clipboard (check clipboard contents)
2. Click "🔄 Nuevo enlace" → confirm → URL changes
3. Reload — new URL persists

- [ ] **Test overlay (if Ably configured locally with wrangler)**

If `ABLY_API_KEY` is available:
```
npx wrangler pages dev . --binding ABLY_API_KEY=<key>
```
1. Open `http://localhost:8788`
2. Go to badge mode, configure some badges, click "📡 Publicar medallas en OBS"
3. Open `http://localhost:8788/badge-overlay.html?id=<your-badge-channel-id>`
4. Badges render. Change active badges and republish — overlay updates.

- [ ] **Commit final state**

```bash
git add -A
git status  # verify only expected files
git commit -m "feat: badge overlay feature — gym badges for OBS"
```
