# Cemetery Nuzlocke Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a standalone Nuzlocke cemetery editor (`cemetery.html`) and OBS overlay (`cemetery-overlay.html`) where streamers manually add fainted Pokémon and publish the grid live to OBS.

**Architecture:** Cemetery state lives in `localStorage` (`ptv_cemetery`) and is published via the existing `/api/publish` endpoint to the shared Ably channel (`ptv-<id>`) using a new event name `cemetery-update`. The overlay subscribes only to `cemetery-update` and renders a sprite grid. The existing team overlay is untouched.

**Tech Stack:** Vanilla JS, Ably (CDN), Cloudflare Pages Functions, localStorage. No build step. Serve with `npx serve .` or open directly.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `functions/api/publish.js` | Modify | Accept optional `event` field to support `cemetery-update` |
| `badges.js` | Modify | Add `cemeteryMode` i18n key to `BADGE_STRINGS` |
| `index.html` | Modify | Add cemetery nav link (2nd position) |
| `badges.html` | Modify | Add cemetery nav link (2nd position) |
| `types.html` | Modify | Add cemetery nav link (2nd position) |
| `style.css` | Modify | Add `.cemetery-*` CSS classes |
| `cemetery.js` | Create | All editor logic: state, autocomplete, modal, publish, i18n |
| `cemetery.html` | Create | Editor page HTML |
| `cemetery-overlay.html` | Create | Self-contained OBS browser source |

---

## Task 1: Support custom event name in publish.js

**Files:**
- Modify: `functions/api/publish.js`

The endpoint always publishes Ably event name `'update'`. Cemetery needs `'cemetery-update'` so the team overlay (`overlay.html`) doesn't accidentally receive cemetery messages.

- [ ] **Step 1: Edit `functions/api/publish.js`**

Replace line 8–17 to extract `event` from body before spreading into `data`:

```js
export async function onRequestPost(context) {
    if (!context.env.ABLY_API_KEY) {
        return json({ error: 'ABLY_API_KEY not configured' }, 503);
    }
    let body;
    try { body = await context.request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

    const { id, event, ...data } = body;
    if (!id || !/^[0-9a-f-]{36}$/.test(id)) return json({ error: 'Invalid id' }, 400);

    const resp = await fetch(`https://rest.ably.io/channels/ptv-${id}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(context.env.ABLY_API_KEY),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: event || 'update', data: JSON.stringify(data) }),
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

- [ ] **Step 2: Verify existing team publish still works**

Run: `npx wrangler pages dev . --binding ABLY_API_KEY=<key>`
Open `index.html`, add a Pokémon, click "Publicar en OBS".
Expected: overlay updates (event defaults to `'update'` as before).

- [ ] **Step 3: Commit**

```bash
git add functions/api/publish.js
git commit -m "feat(api): support optional event name in publish endpoint"
```

---

## Task 2: Add cemeteryMode i18n to badges.js

**Files:**
- Modify: `badges.js` lines ~107–150 (BADGE_STRINGS object)

The nav links use `data-i18n-badge` attributes processed by `applyBadgeLang()` in `badges.js`. Cemetery needs a `cemeteryMode` key there.

- [ ] **Step 1: Add `cemeteryMode` to BADGE_STRINGS.es** (after `typesMode` on ~line 110)

```js
typesMode:              'Tabla de tipos',
cemeteryMode:           'Cementerio',
```

- [ ] **Step 2: Add `cemeteryMode` to BADGE_STRINGS.en** (after `typesMode` on ~line 132)

```js
typesMode:              'Types table',
cemeteryMode:           'Cemetery',
```

- [ ] **Step 3: Verify in browser**

Open `badges.html`, switch to EN. The nav should show "Cemetery" (once the nav link is added in Task 3). For now just confirm no JS errors in the console.

- [ ] **Step 4: Commit**

```bash
git add badges.js
git commit -m "feat(i18n): add cemeteryMode key to BADGE_STRINGS"
```

---

## Task 3: Add cemetery nav link to existing pages

**Files:**
- Modify: `index.html` (line ~29)
- Modify: `badges.html` (line ~23)
- Modify: `types.html` (line ~22)

Add `<a href="cemetery.html" ...>` as the second item in `.mode-toggle` on each page.

- [ ] **Step 1: Update `index.html` nav**

Find the `.mode-toggle` block (~line 27–32). Add the cemetery link after the Pokémon link:

```html
<div class="mode-toggle">
    <a href="index.html" id="mode-btn-pokemon" class="mode-btn active" data-i18n-badge="pokemonMode">Pokémon</a>
    <a href="cemetery.html" id="mode-btn-cemetery" class="mode-btn" data-i18n-badge="cemeteryMode">Cementerio</a>
    <a href="badges.html" id="mode-btn-badges" class="mode-btn" data-i18n-badge="badgeMode">Medallas</a>
    <a href="types.html" id="mode-btn-types" class="mode-btn" data-i18n-badge="typesMode">Tabla de tipos</a>
</div>
```

- [ ] **Step 2: Update `badges.html` nav** (~line 21–25)

```html
<div class="mode-toggle">
    <a href="index.html" id="mode-btn-pokemon" class="mode-btn" data-i18n-badge="pokemonMode">Pokémon</a>
    <a href="cemetery.html" id="mode-btn-cemetery" class="mode-btn" data-i18n-badge="cemeteryMode">Cementerio</a>
    <a href="badges.html" id="mode-btn-badges" class="mode-btn active" data-i18n-badge="badgeMode">Medallas</a>
    <a href="types.html" id="mode-btn-types" class="mode-btn" data-i18n-badge="typesMode">Tabla de tipos</a>
</div>
```

- [ ] **Step 3: Update `types.html` nav** (~line 21–25)

```html
<div class="mode-toggle">
    <a href="index.html"  id="mode-btn-pokemon"   class="mode-btn" data-i18n-badge="pokemonMode">Pokémon</a>
    <a href="cemetery.html" id="mode-btn-cemetery" class="mode-btn" data-i18n-badge="cemeteryMode">Cementerio</a>
    <a href="badges.html" id="mode-btn-badges"    class="mode-btn" data-i18n-badge="badgeMode">Medallas</a>
    <a href="types.html"  id="mode-btn-types"     class="mode-btn active" data-i18n-badge="typesMode">Tabla de tipos</a>
</div>
```

- [ ] **Step 4: Verify in browser**

Open each of the three pages. Confirm the nav shows 4 buttons. Clicking "Cementerio" shows a 404 (cemetery.html not yet created) — that's expected at this step.

- [ ] **Step 5: Commit**

```bash
git add index.html badges.html types.html
git commit -m "feat(nav): add cemetery link to all page navs"
```

---

## Task 4: Add cemetery CSS to style.css

**Files:**
- Modify: `style.css` (append at end)

- [ ] **Step 1: Append the following block to `style.css`**

```css
/* ── Cemetery ─────────────────────────────────────────────────────── */
.cemetery-add-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}
.cemetery-add-row .ac-wrapper {
    position: relative;
    flex: 1;
    min-width: 140px;
}
.cemetery-pending-sprite {
    width: 48px;
    height: 48px;
    object-fit: contain;
    flex-shrink: 0;
}
.cemetery-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 12px;
}
.cemetery-entry {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    position: relative;
}
.cemetery-entry img {
    width: 64px;
    height: 64px;
    object-fit: contain;
}
.cemetery-entry-name {
    font-size: 0.7rem;
    color: var(--muted);
    text-align: center;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.cemetery-remove-btn {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--muted);
    font-size: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    line-height: 1;
}
.cemetery-remove-btn:hover { color: var(--error, #f44); border-color: var(--error, #f44); }
.cemetery-empty {
    color: var(--muted);
    font-size: 0.9rem;
    text-align: center;
    padding: 20px 0;
    display: none;
}
```

- [ ] **Step 2: Commit**

```bash
git add style.css
git commit -m "feat(styles): add cemetery CSS classes"
```

---

## Task 5: Create cemetery.js

**Files:**
- Create: `cemetery.js`

This file contains all editor logic. It depends on globals from files loaded before it:
- `currentLang`, `setLangBase` — from `lang.js`
- `POKEMON_CATALOG`, `FEMALE_VARIANTS` — from `pokemon-catalog.js`
- `BADGE_STRINGS`, `applyBadgeLang`, `tB` — from `badges.js`

- [ ] **Step 1: Create `cemetery.js` with the following content**

```js
const BASE_URL      = 'https://pokemonteamvisualizer.pages.dev/sprites/';
const CEMETERY_KEY  = 'ptv_cemetery';
const DEFAULT_PROPS = { gender: 'male', skin: 'common', shiny: 'False' };

// ── i18n ──────────────────────────────────────────────────────────
const CEMETERY_STRINGS = {
    es: {
        cemeteryAdd:          'Añadir al cementerio',
        cemeteryEmpty:        'Ningún Pokémon en el cementerio.',
        cemeteryPublish:      '📡 Publicar cementerio en OBS',
        cemeteryPublishOk:    '¡Cementerio actualizado en OBS!',
        cemeteryPublishErr:   'Error al publicar.',
        cemeteryReset:        'Vaciar cementerio',
        cemeteryResetConfirm: '¿Vaciar el cementerio?',
        obsUrlLabel:          'URL para la fuente de navegador',
        obsUrlSub:            'No tienes que cambiarla salvo si creas una nueva.',
        obsUrlCopy:           'Copiar',
        obsUrlCopied:         '¡URL copiada!',
        newChannel:           '🔄 Nuevo enlace',
        newChannelConfirm:    '¿Generar un nuevo enlace? Tendrás que actualizar la URL en OBS.',
        namePh:               'Nombre...',
        notePh:               'Mote...',
        propsBtn:             'Propiedades',
        modalTitle:           'propiedades',
        modalGender:          'Género',
        modalSkin:            'Skin',
        modalShiny:           'Shiny',
        modalSet:             'Aplicar',
        errNoName:            'Escribe un nombre de Pokémon.',
        errUnknown:           n => `Pokémon desconocido: ${n}`,
        errWriteFirst:        'Escribe primero un nombre de Pokémon.',
        madeBy:               'Hecho por @MrKlypp',
    },
    en: {
        cemeteryAdd:          'Add to cemetery',
        cemeteryEmpty:        'No Pokémon in the cemetery.',
        cemeteryPublish:      '📡 Publish cemetery to OBS',
        cemeteryPublishOk:    'Cemetery updated in OBS!',
        cemeteryPublishErr:   'Error publishing.',
        cemeteryReset:        'Clear cemetery',
        cemeteryResetConfirm: 'Clear the cemetery?',
        obsUrlLabel:          'Browser source URL',
        obsUrlSub:            'No need to change it unless you create a new one.',
        obsUrlCopy:           'Copy',
        obsUrlCopied:         'URL copied!',
        newChannel:           '🔄 New link',
        newChannelConfirm:    'Generate a new link? You will need to update the URL in OBS.',
        namePh:               'Name...',
        notePh:               'Nickname...',
        propsBtn:             'Properties',
        modalTitle:           'properties',
        modalGender:          'Gender',
        modalSkin:            'Skin',
        modalShiny:           'Shiny',
        modalSet:             'Set',
        errNoName:            'Write a Pokémon name.',
        errUnknown:           n => `Unknown Pokémon: ${n}`,
        errWriteFirst:        'Write a Pokémon name first.',
        madeBy:               'Made by @MrKlypp',
    },
};

function tC(key, arg) {
    const val = (CEMETERY_STRINGS[currentLang] || CEMETERY_STRINGS.es)[key];
    return typeof val === 'function' ? val(arg) : (val ?? key);
}

// ── State ─────────────────────────────────────────────────────────
let cemetery = [];
let channelId = null;
let pokemonNames = [];
const ALIAS_TO_CANONICAL = {};
let pendingEntry = { name: '', mote: '', props: { ...DEFAULT_PROPS } };
let modalProps   = { ...DEFAULT_PROPS };

// ── Channel ID ────────────────────────────────────────────────────
function initChannelId() {
    channelId = localStorage.getItem('ptv_channel_id');
    if (!channelId) {
        channelId = crypto.randomUUID();
        localStorage.setItem('ptv_channel_id', channelId);
    }
}

// ── Persist ───────────────────────────────────────────────────────
function saveCemetery() {
    localStorage.setItem(CEMETERY_KEY, JSON.stringify(cemetery));
}

function loadCemetery() {
    try {
        cemetery = JSON.parse(localStorage.getItem(CEMETERY_KEY) || '[]');
    } catch(_) { cemetery = []; }
}

// ── Sprite URL ────────────────────────────────────────────────────
function buildSpriteUrl(name, props) {
    const lower    = name.toLowerCase();
    const shiny    = props.shiny === 'True';
    const skin     = props.skin  || 'common';
    const gender   = props.gender || 'male';
    const catalog  = POKEMON_CATALOG[lower] || {};
    const skins    = catalog.skin || [];
    const hasFemale = FEMALE_VARIANTS.has(lower);

    let fileName = lower;
    let folder   = BASE_URL;
    if (skin !== 'common' && skins.includes(skin)) fileName += '_' + skin;
    if (shiny) folder += 'shiny/';
    if (gender === 'female' && hasFemale && skin === 'common') folder += 'female/';
    return folder + encodeURIComponent(fileName) + '.gif';
}

// ── Autocomplete ──────────────────────────────────────────────────
Promise.all([
    fetch('pokemon-list.json').then(r => r.json()),
    fetch('pokemon-aliases.json').then(r => r.json()),
])
.then(([names, aliases]) => {
    for (const [canonical, aliasList] of Object.entries(aliases)) {
        for (const alias of aliasList) ALIAS_TO_CANONICAL[alias] = canonical;
    }
    pokemonNames = [...names, ...Object.values(aliases).flat()].sort();
    initInput();
})
.catch(() => {});

function updateSuggestions(input, list) {
    const typed = input.value.toLowerCase();
    if (typed.length < 2) { closeSuggestions(list); return; }
    const starts  = pokemonNames.filter(n => n.startsWith(typed));
    const rest    = pokemonNames.filter(n => !n.startsWith(typed) && n.includes(typed));
    const matches = [...starts, ...rest].slice(0, 8);
    if (!matches.length) { closeSuggestions(list); return; }
    list.innerHTML = matches.map(n => `<li data-value="${n}">${n}</li>`).join('');
    list.style.display = 'block';
}

function closeSuggestions(list) { list.innerHTML = ''; list.style.display = 'none'; }

function initInput() {
    const nameInput   = document.getElementById('cemetery-name-input');
    const suggestions = document.getElementById('cemetery-suggestions');
    const moteInput   = document.getElementById('cemetery-mote-input');
    let activeSuggIdx = -1;

    nameInput.addEventListener('input', () => {
        activeSuggIdx = -1;
        pendingEntry.name = nameInput.value;
        updateSuggestions(nameInput, suggestions);
        updatePendingSprite();
    });

    nameInput.addEventListener('keydown', e => {
        const items = [...suggestions.querySelectorAll('li')];
        if (e.key === 'Tab' && suggestions.style.display === 'block') {
            e.preventDefault();
            const target = items[activeSuggIdx] ?? items[0];
            if (target) {
                nameInput.value = target.dataset.value;
                pendingEntry.name = target.dataset.value;
                updatePendingSprite();
            }
            closeSuggestions(suggestions); activeSuggIdx = -1;
        } else if (e.key === 'Enter') {
            closeSuggestions(suggestions); activeSuggIdx = -1;
        } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && suggestions.style.display === 'block') {
            e.preventDefault();
            if (!items.length) return;
            activeSuggIdx = e.key === 'ArrowDown'
                ? Math.min(activeSuggIdx + 1, items.length - 1)
                : (activeSuggIdx < 0 ? items.length - 1 : Math.max(0, activeSuggIdx - 1));
            items.forEach(li => li.classList.remove('active'));
            items[activeSuggIdx].classList.add('active');
            nameInput.value = items[activeSuggIdx].dataset.value;
            pendingEntry.name = nameInput.value;
            updatePendingSprite();
        }
    });

    suggestions.addEventListener('click', e => {
        const li = e.target.closest('li');
        if (!li) return;
        nameInput.value = li.dataset.value;
        pendingEntry.name = li.dataset.value;
        closeSuggestions(suggestions); activeSuggIdx = -1;
        updatePendingSprite();
    });

    moteInput.addEventListener('input', () => { pendingEntry.mote = moteInput.value; });

    document.addEventListener('click', e => {
        if (!e.target.closest('#cemetery-ac-wrapper')) closeSuggestions(suggestions);
    });
}

function updatePendingSprite() {
    const img  = document.getElementById('cemetery-pending-sprite');
    const name = pendingEntry.name.toLowerCase().trim();
    if (name && pokemonNames.includes(name)) {
        img.src = buildSpriteUrl(name, pendingEntry.props);
        img.style.display = 'block';
    } else {
        img.style.display = 'none';
        img.src = '';
    }
}

// ── Properties modal ──────────────────────────────────────────────
function openModal() {
    const name = pendingEntry.name.trim();
    if (!name) { setStatus(tC('errWriteFirst'), 'var(--error)'); return; }
    document.getElementById('modal-title').textContent = capitalize(name) + ' ' + tC('modalTitle');

    const lower   = name.toLowerCase();
    const catalog = POKEMON_CATALOG[lower] || {};
    const skins   = ['common', ...(catalog.skin || [])];
    const props   = pendingEntry.props;
    modalProps    = { ...props };

    document.getElementById('modal-props').innerHTML = `
        <div class="modal-row">
            <label>${tC('modalGender')}</label>
            <select id="mp-gender" onchange="modalProps.gender=this.value">
                <option value="male"   ${props.gender === 'male'   ? 'selected' : ''}>male</option>
                <option value="female" ${props.gender === 'female' ? 'selected' : ''}>female</option>
            </select>
        </div>
        <div class="modal-row">
            <label>${tC('modalSkin')}</label>
            <select id="mp-skin" onchange="modalProps.skin=this.value">
                ${skins.map(s => `<option value="${s}" ${props.skin === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
        </div>
        <div class="modal-row">
            <label>${tC('modalShiny')}</label>
            <select id="mp-shiny" onchange="modalProps.shiny=this.value">
                <option value="False" ${props.shiny === 'False' ? 'selected' : ''}>False</option>
                <option value="True"  ${props.shiny === 'True'  ? 'selected' : ''}>True</option>
            </select>
        </div>`;

    document.getElementById('modal-backdrop').classList.add('open');
}

function applyModal() {
    pendingEntry.props = { ...modalProps };
    closeModal();
    updatePendingSprite();
}

function closeModal() {
    document.getElementById('modal-backdrop').classList.remove('open');
}

document.getElementById('modal-backdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-backdrop')) closeModal();
});

// ── Add / Remove / Reset ──────────────────────────────────────────
function addToCemetery() {
    const name = pendingEntry.name.trim().toLowerCase();
    if (!name) { setStatus(tC('errNoName'), 'var(--error)'); return; }
    if (pokemonNames.length && !pokemonNames.includes(name)) {
        setStatus(tC('errUnknown', name), 'var(--error)'); return;
    }
    cemetery.push({ name, mote: pendingEntry.mote.trim(), props: { ...pendingEntry.props } });
    saveCemetery();
    renderCemetery();
    document.getElementById('cemetery-name-input').value = '';
    document.getElementById('cemetery-mote-input').value = '';
    document.getElementById('cemetery-pending-sprite').style.display = 'none';
    pendingEntry = { name: '', mote: '', props: { ...DEFAULT_PROPS } };
}

function removeFromCemetery(idx) {
    cemetery.splice(idx, 1);
    saveCemetery();
    renderCemetery();
}

function resetCemetery() {
    if (!confirm(tC('cemeteryResetConfirm'))) return;
    cemetery = [];
    saveCemetery();
    renderCemetery();
}

// ── Render list ───────────────────────────────────────────────────
function renderCemetery() {
    const list    = document.getElementById('cemetery-list');
    const emptyEl = document.getElementById('cemetery-empty');
    if (!cemetery.length) {
        list.innerHTML = '';
        emptyEl.style.display = 'block';
        return;
    }
    emptyEl.style.display = 'none';
    list.innerHTML = cemetery.map((entry, idx) => {
        const name      = entry.name.toLowerCase();
        const url       = buildSpriteUrl(name, entry.props);
        const canonical = ALIAS_TO_CANONICAL[name];
        const fallback  = canonical
            ? BASE_URL + encodeURIComponent(canonical) + '.gif'
            : BASE_URL + encodeURIComponent(name) + '.gif';
        const label = entry.mote || entry.name;
        const fbAttr = fallback !== url
            ? `onerror="if(this.src!=='${fallback}'){this.src='${fallback}';this.onerror=null;}"`
            : '';
        return `
            <div class="cemetery-entry">
                <img src="${url}" ${fbAttr} alt="${escapeHtml(name)}">
                <span class="cemetery-entry-name">${escapeHtml(label)}</span>
                <button class="cemetery-remove-btn" onclick="removeFromCemetery(${idx})">✕</button>
            </div>`;
    }).join('');
}

// ── OBS URL ────────────────────────────────────────────────────────
function updateObsUrl() {
    const el = document.getElementById('cemetery-obs-url-display');
    if (el) el.value = `https://pokemon.mrklypp.com/cemetery-overlay.html?id=${channelId}`;
}

function copyObsUrl() {
    const url = `https://pokemon.mrklypp.com/cemetery-overlay.html?id=${channelId}`;
    navigator.clipboard.writeText(url).then(() => setStatus(tC('obsUrlCopied'), 'var(--success)'));
}

function newChannel() {
    if (!confirm(tC('newChannelConfirm'))) return;
    channelId = crypto.randomUUID();
    localStorage.setItem('ptv_channel_id', channelId);
    updateObsUrl();
}

// ── Publish ────────────────────────────────────────────────────────
async function publishCemetery() {
    const entries = cemetery.map(entry => {
        const name      = entry.name.toLowerCase();
        const url       = buildSpriteUrl(name, entry.props);
        const canonical = ALIAS_TO_CANONICAL[name];
        const fallback  = canonical
            ? BASE_URL + encodeURIComponent(canonical) + '.gif'
            : BASE_URL + encodeURIComponent(name) + '.gif';
        return { url, fallback: fallback !== url ? fallback : null };
    });

    try {
        const resp = await fetch('/api/publish', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ id: channelId, event: 'cemetery-update', pokemon: entries }),
        });
        setStatus(resp.ok ? tC('cemeteryPublishOk') : tC('cemeteryPublishErr'),
                  resp.ok ? 'var(--success)' : 'var(--error)');
    } catch {
        setStatus(tC('cemeteryPublishErr'), 'var(--error)');
    }
}

// ── Status ─────────────────────────────────────────────────────────
function setStatus(msg, color) {
    const el = document.getElementById('cemetery-status');
    if (!el) return;
    el.textContent = msg;
    el.style.color = color || '';
}

// ── Helpers ───────────────────────────────────────────────────────
function escapeHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ── Lang ───────────────────────────────────────────────────────────
function applyCemeteryLang() {
    const ids = {
        'cemetery-add-btn':         tC('cemeteryAdd'),
        'cemetery-publish-btn':     tC('cemeteryPublish'),
        'cemetery-reset-btn':       tC('cemeteryReset'),
        'cemetery-url-label':       tC('obsUrlLabel'),
        'cemetery-url-sub':         tC('obsUrlSub'),
        'cemetery-copy-btn':        tC('obsUrlCopy'),
        'cemetery-new-channel-btn': tC('newChannel'),
        'cemetery-empty':           tC('cemeteryEmpty'),
        'cemetery-props-btn':       tC('propsBtn'),
        'made-by':                  tC('madeBy'),
    };
    for (const [id, text] of Object.entries(ids)) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }
    const nameInput = document.getElementById('cemetery-name-input');
    if (nameInput) nameInput.placeholder = tC('namePh');
    const moteInput = document.getElementById('cemetery-mote-input');
    if (moteInput) moteInput.placeholder = tC('notePh');
    const modalApply = document.querySelector('.modal-apply');
    if (modalApply) modalApply.textContent = tC('modalSet');
}

// ── Init ───────────────────────────────────────────────────────────
initChannelId();
loadCemetery();
renderCemetery();
updateObsUrl();
```

- [ ] **Step 2: Commit**

```bash
git add cemetery.js
git commit -m "feat(cemetery): add cemetery.js editor logic"
```

---

## Task 6: Create cemetery.html

**Files:**
- Create: `cemetery.html`

- [ ] **Step 1: Create `cemetery.html`**

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cementerio — Pokémon Stream Visualizer</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='white'/><path d='M2,16 A14,14 0 0,1 30,16 Z' fill='%23EE1515'/><circle cx='16' cy='16' r='14' fill='none' stroke='%231a1a1a' stroke-width='2'/><line x1='2' y1='16' x2='30' y2='16' stroke='%231a1a1a' stroke-width='2'/><circle cx='16' cy='16' r='5' fill='%231a1a1a'/><circle cx='16' cy='16' r='3' fill='white'/></svg>">
<link rel="stylesheet" href="style.css">
<meta name="theme-color" content="#00CCFF">
<script src="pokemon-catalog.js"></script>
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
            <a href="index.html"    id="mode-btn-pokemon"   class="mode-btn" data-i18n-badge="pokemonMode">Pokémon</a>
            <a href="cemetery.html" id="mode-btn-cemetery"  class="mode-btn active" data-i18n-badge="cemeteryMode">Cementerio</a>
            <a href="badges.html"   id="mode-btn-badges"    class="mode-btn" data-i18n-badge="badgeMode">Medallas</a>
            <a href="types.html"    id="mode-btn-types"     class="mode-btn" data-i18n-badge="typesMode">Tabla de tipos</a>
        </div>
        <div class="lang-toggle">
            <button id="lang-es" onclick="setLang('es')">ES</button>
            <button id="lang-en" onclick="setLang('en')">EN</button>
        </div>
    </div>
</header>
<div id="app">

    <!-- Add Pokémon -->
    <div class="card card--team">
        <div class="cemetery-add-row">
            <img id="cemetery-pending-sprite" class="cemetery-pending-sprite" src="" alt="" style="display:none">
            <div class="ac-wrapper" id="cemetery-ac-wrapper">
                <input id="cemetery-name-input" type="text" class="name-input" autocomplete="off" spellcheck="false" placeholder="Nombre...">
                <ul id="cemetery-suggestions" class="suggestions"></ul>
            </div>
            <input id="cemetery-mote-input" type="text" class="mote-input" placeholder="Mote...">
            <button id="cemetery-props-btn" class="props-btn" onclick="openModal()">Propiedades</button>
            <button id="cemetery-add-btn" class="btn-publish" onclick="addToCemetery()">Añadir al cementerio</button>
        </div>
    </div>

    <!-- Cemetery list -->
    <div class="card card--team">
        <p id="cemetery-empty" class="cemetery-empty" style="display:none">Ningún Pokémon en el cementerio.</p>
        <div id="cemetery-list" class="cemetery-list"></div>
    </div>

    <!-- OBS URL -->
    <div class="card card--actions">
        <div class="actions">
            <span id="cemetery-url-label" class="obs-url-label">URL para la fuente de navegador</span>
            <span id="cemetery-url-sub" class="obs-url-sub">No tienes que cambiarla salvo si creas una nueva.</span>
            <div class="obs-url-row">
                <input id="cemetery-obs-url-display" class="obs-url-display" type="text" readonly>
                <button id="cemetery-copy-btn" class="btn-copy-url" onclick="copyObsUrl()">Copiar</button>
            </div>
            <div class="obs-channel-actions">
                <button id="cemetery-new-channel-btn" class="btn-reset" onclick="newChannel()">🔄 Nuevo enlace</button>
            </div>
        </div>
    </div>

    <!-- Publish / Reset -->
    <div class="card card--actions">
        <div class="actions">
            <button id="cemetery-publish-btn" class="btn-publish" onclick="publishCemetery()">📡 Publicar cementerio en OBS</button>
            <button id="cemetery-reset-btn" class="btn-reset" onclick="resetCemetery()">Vaciar cementerio</button>
            <div id="cemetery-status"></div>
        </div>
    </div>

    <!-- Social -->
    <div class="card social">
        <p id="made-by">Hecho por @MrKlypp</p>
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

<!-- Properties modal (same structure as index.html) -->
<div id="modal-backdrop">
    <div id="modal">
        <h3 id="modal-title"></h3>
        <div id="modal-props"></div>
        <button class="modal-apply" onclick="applyModal()">Aplicar</button>
    </div>
</div>

<script src="badges.js"></script>
<script src="cemetery.js"></script>
<script>
function setLang(lang) {
    setLangBase(lang);
    document.documentElement.lang = lang;
    document.getElementById('lang-es').classList.toggle('active', lang === 'es');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    applyBadgeLang();
    applyCemeteryLang();
}
setLang(currentLang);
</script>
</body>
</html>
```

- [ ] **Step 2: Open in browser and verify**

Run: `npx serve .` then open `http://localhost:3000/cemetery.html`

Check:
- Nav shows 4 buttons, Cemetery is active (highlighted)
- Type "char" in the name input → autocomplete dropdown appears
- Select "charizard" → sprite preview appears next to input
- Click "Propiedades" → modal opens with gender/skin/shiny selects
- Apply modal → sprite updates if shiny/form changes
- Click "Añadir al cementerio" → entry appears in the grid with sprite + name + ✕ button
- Click ✕ → entry removed
- OBS URL field shows `cemetery-overlay.html?id=<uuid>`
- Copy button copies the URL
- Switch to EN → all labels translate

- [ ] **Step 3: Commit**

```bash
git add cemetery.html
git commit -m "feat(cemetery): add cemetery editor page"
```

---

## Task 7: Create cemetery-overlay.html

**Files:**
- Create: `cemetery-overlay.html`

This is a self-contained file (no external CSS). It subscribes to Ably `cemetery-update` events and renders a sprite grid. Pre-computed `url` and `fallback` are sent by the editor, same as the team overlay pattern.

- [ ] **Step 1: Create `cemetery-overlay.html`**

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body, html { background: transparent; }
body { padding: 8px; }
#root {
    display: grid;
    grid-template-columns: repeat(auto-fill, 96px);
    gap: 8px;
    overflow-y: auto;
    max-height: 100vh;
}
.pk-entry img {
    width: 96px;
    height: 96px;
    object-fit: contain;
    pointer-events: none;
    user-select: none;
    display: block;
    animation: fadeSlideUp 0.35s ease forwards;
    opacity: 0;
}
@keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(10px); }
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

    function renderCemetery(pokemon) {
        var root = document.getElementById('root');
        root.innerHTML = '';
        pokemon.forEach(function (entry) {
            if (!entry || !entry.url) return;
            var div = document.createElement('div');
            div.className = 'pk-entry';
            var img = document.createElement('img');
            img.src = entry.url;
            if (entry.fallback) {
                img.onerror = function () {
                    if (img.src !== entry.fallback) { img.src = entry.fallback; img.onerror = null; }
                };
            }
            div.appendChild(img);
            root.appendChild(div);
        });
        var last = root.lastElementChild;
        if (last) last.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    var ably    = new Ably.Realtime({ authUrl: '/api/token' });
    var channel = ably.channels.get('ptv-' + id, { params: { rewind: '1' } });
    channel.subscribe('cemetery-update', function (msg) {
        try {
            var data = JSON.parse(msg.data);
            renderCemetery(data.pokemon || []);
        } catch (e) {}
    });

    ably.connection.on('failed', function (s) { console.error('[PTV] Ably failed:', s.reason); });
    channel.on('failed', function (s)         { console.error('[PTV] Channel failed:', s.reason); });
})();
</script>
</body>
</html>
```

- [ ] **Step 2: Test end-to-end with wrangler**

Run: `npx wrangler pages dev . --binding ABLY_API_KEY=<key>`

1. Open `http://localhost:8788/cemetery.html` in one tab
2. Open `http://localhost:8788/cemetery-overlay.html?id=<your-channel-id>` in another tab
   (copy channelId from the OBS URL field in the editor)
3. In the editor: add 3–4 Pokémon, click "Publicar cementerio en OBS"
4. Expected: sprites appear in the overlay tab
5. Add 2 more Pokémon, publish again → all 5–6 appear, overlay scrolls to last
6. Remove one Pokémon from editor, publish → overlay updates to show fewer sprites
7. Confirm the team overlay (`overlay.html?id=<same-id>`) is NOT affected by cemetery publish

- [ ] **Step 3: Commit**

```bash
git add cemetery-overlay.html
git commit -m "feat(cemetery): add cemetery OBS overlay"
```

---

## Self-Review Checklist (already completed)

- [x] `publish.js` supports `event` field → cemetery uses `cemetery-update`, team overlay unaffected
- [x] `badges.js` has `cemeteryMode` → nav labels translate correctly
- [x] All 3 existing pages have updated nav
- [x] `cemetery.js` uses same `buildSpriteUrl` logic as `app.js` (same props format: `shiny: 'True'/'False'`, `gender: 'male'/'female'`, `skin: 'common'/name`)
- [x] Overlay receives pre-computed `url` + `fallback` (same pattern as `overlay.html`)
- [x] `rewind: 1` on Ably channel → overlay recovers last state on OBS reconnect
- [x] `localStorage` (`ptv_cemetery`) → editor recovers state on page reload
- [x] No changes to `index.html` app logic, `app.js`, or `overlay.html`
