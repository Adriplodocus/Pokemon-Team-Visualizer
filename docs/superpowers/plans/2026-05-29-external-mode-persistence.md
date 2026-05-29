# External Mode Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a mod opens any editor page via `?id=<uuid>`, the external mode persists across header-tab navigation so all three editors (Pokémon, Cementerio, Medallas) keep controlling the streamer's channel. A persistent bar in the header shows the external mode status and a "Salir" button to exit.

**Architecture:** `sessionStorage` holds `ptv_external_id` (main channel) and `ptv_external_badge_id` (badge channel). `header.js` reads these at inject-time and renders the bar immediately (no flicker). Each page's `initChannelId()` / `initBadges()` writes sessionStorage on first URL-param entry, then reads it on subsequent navigations. `exitExternalMode()` is a global defined in `header.js` that clears both keys and redirects to `index.html`.

**Tech Stack:** Vanilla JS, sessionStorage, no build step.

---

## File Map

| File | Change |
|---|---|
| `header.js` | Add external mode bar HTML + `exitExternalMode()` global |
| `style.css` | Add `.external-mode-bar` CSS |
| `app.js` | `initChannelId()` reads/writes sessionStorage; `copyEditorUrl()` includes `&bid=` |
| `cemetery.js` | `initChannelId()` reads/writes sessionStorage; `copyEditorUrl()` includes `&bid=` |
| `badges.js` | `initBadges()` reads/writes `ptv_external_badge_id` from sessionStorage |

---

### Task 1: header.js + style.css — external mode bar

**Files:**
- Modify: `header.js`
- Modify: `style.css`

The bar must appear before the nav tabs. `header.js` is an IIFE that builds the header HTML via `insertAdjacentHTML`. `exitExternalMode()` must be a **global** (outside the IIFE) so `onclick` can call it.

- [ ] **Step 1: Replace `header.js` with this content**

```js
(function () {
    const pages = [
        { id: 'pokemon',  href: 'index.html',    i18n: 'pokemonMode',  label: 'Pokémon' },
        { id: 'cemetery', href: 'cemetery.html', i18n: 'cemeteryMode', label: 'Cementerio' },
        { id: 'badges',   href: 'badges.html',   i18n: 'badgeMode',    label: 'Medallas' },
        { id: 'types',    href: 'types.html',    i18n: 'typesMode',    label: 'Tabla de tipos' },
    ];

    const tabs = pages.map(p =>
        `<a href="${p.href}" id="mode-btn-${p.id}" class="mode-btn${ACTIVE_PAGE === p.id ? ' active' : ''}" data-i18n-badge="${p.i18n}">${p.label}</a>`
    ).join('\n            ');

    const extId    = sessionStorage.getItem('ptv_external_id');
    const extBadge = sessionStorage.getItem('ptv_external_badge_id');
    const shortId  = extId ? extId.slice(0, 8) : extBadge ? extBadge.slice(0, 8) : null;
    const extBar   = shortId
        ? `<div id="external-mode-bar" class="external-mode-bar">
        <span>Controlando canal externo &middot; <code>${shortId}</code></span>
        <button onclick="exitExternalMode()">&#x2715; Salir</button>
    </div>`
        : '';

    document.body.insertAdjacentHTML('afterbegin', `
<header>
    <h1>Pokémon Stream Visualizer by <a href="https://mrklypp.com/" target="_blank" rel="noopener" class="header-brand">MrKlypp</a></h1>
    <p class="subtitle">La herramienta definitiva para gestionar tu overlay de pokémon</p>
    <p class="header-error">Si encuentras algún error, <a href="mailto:MrKlypp@gmail.com">escríbeme</a>.</p>
    ${extBar}
    <div class="header-controls-row">
        <div class="mode-toggle">
            ${tabs}
        </div>
        <div class="lang-toggle">
            <button id="lang-es" onclick="setLang('es')">ES</button>
            <button id="lang-en" onclick="setLang('en')">EN</button>
        </div>
    </div>
</header>`);
})();

function exitExternalMode() {
    sessionStorage.removeItem('ptv_external_id');
    sessionStorage.removeItem('ptv_external_badge_id');
    window.location.href = 'index.html';
}
```

- [ ] **Step 2: Add `.external-mode-bar` styles to `style.css` after the `.external-banner` block (~line 342)**

```css
.external-mode-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 7px 16px;
    margin: 8px 0;
    border-radius: 8px;
    background: rgba(255, 86, 180, 0.10);
    border: 1px solid rgba(255, 86, 180, 0.30);
    color: var(--pink);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
}

.external-mode-bar code {
    font-family: 'JetBrains Mono', monospace;
    opacity: 0.8;
}

.external-mode-bar button {
    background: rgba(255, 86, 180, 0.15);
    border: 1px solid rgba(255, 86, 180, 0.35);
    border-radius: 5px;
    color: var(--pink);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    padding: 3px 8px;
    cursor: pointer;
    transition: background 0.15s;
}

.external-mode-bar button:hover {
    background: rgba(255, 86, 180, 0.25);
}
```

- [ ] **Step 3: Verify (manual)**

Open `index.html?id=00000000-0000-0000-0000-000000000001` in a browser. Expected: pink bar in header showing "Controlando canal externo · 00000000" with a "✕ Salir" button. Open `index.html` without params — no bar shown.

- [ ] **Step 4: Commit**

```bash
git add header.js style.css
git commit -m "feat(header): add persistent external mode bar with exit button"
```

---

### Task 2: app.js — sessionStorage in initChannelId + bid in copyEditorUrl

**Files:**
- Modify: `app.js` (functions `initChannelId` line ~989, `copyEditorUrl` line ~812)

Two changes:
1. `initChannelId()` reads/writes sessionStorage.
2. `copyEditorUrl()` appends `&bid=<badgeChannelId>` so the mod gets both IDs in one URL.

Note: `badgeChannelId` is a global set by `badges.js` which loads on the same page. Access it as `typeof badgeChannelId !== 'undefined' && badgeChannelId`.

- [ ] **Step 1: Replace `initChannelId()` (lines 989–1001) with:**

```js
function initChannelId() {
    const params = new URLSearchParams(location.search);
    const urlId  = params.get('id');
    const bidId  = params.get('bid');

    if (urlId) {
        channelId    = urlId;
        externalMode = true;
        sessionStorage.setItem('ptv_external_id', urlId);
        if (bidId) sessionStorage.setItem('ptv_external_badge_id', bidId);
    } else {
        const storedExtId = sessionStorage.getItem('ptv_external_id');
        if (storedExtId) {
            channelId    = storedExtId;
            externalMode = true;
        } else {
            channelId = localStorage.getItem('ptv_channel_id');
            if (!channelId) {
                channelId = crypto.randomUUID();
                localStorage.setItem('ptv_channel_id', channelId);
            }
        }
    }
}
```

- [ ] **Step 2: Replace `copyEditorUrl()` (lines 812–819) with:**

```js
function copyEditorUrl() {
    const bid = typeof badgeChannelId !== 'undefined' && badgeChannelId ? `&bid=${badgeChannelId}` : '';
    const url = `https://pokemon.mrklypp.com/index.html?id=${channelId}${bid}`;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => setStatus(t('obsUrlCopied'), 'var(--success)'));
    } else {
        prompt(t('sharePromptCopy'), url);
    }
}
```

- [ ] **Step 3: Verify (manual)**

1. Open `index.html` (own channel). Click "Copiar link de editor". Paste the URL — it should include `?id=<uuid>&bid=<badge-uuid>`.
2. Open that URL in the same tab. Expected: external mode active, bar shows the short ID.
3. Click "Cementerio" tab. Expected: `cemetery.html` loads still in external mode (banner visible, same channel ID).

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat(app): persist external mode via sessionStorage, include bid in editor URL"
```

---

### Task 3: cemetery.js — sessionStorage in initChannelId + bid in copyEditorUrl

**Files:**
- Modify: `cemetery.js` (functions `initChannelId` line ~106, `copyEditorUrl` line ~400)

Same pattern as Task 2. Cemetery's `initChannelId` only handles the main channel (`ptv_external_id`), not `?bid=` — that's handled by `app.js`. The `copyEditorUrl` on cemetery also includes `&bid=` for mods who bookmark the cemetery entry point.

- [ ] **Step 1: Replace `initChannelId()` (lines 106–118) with:**

```js
function initChannelId() {
    const urlId = new URLSearchParams(location.search).get('id');
    if (urlId) {
        channelId    = urlId;
        externalMode = true;
        sessionStorage.setItem('ptv_external_id', urlId);
    } else {
        const storedExtId = sessionStorage.getItem('ptv_external_id');
        if (storedExtId) {
            channelId    = storedExtId;
            externalMode = true;
        } else {
            channelId = localStorage.getItem('ptv_channel_id');
            if (!channelId) {
                channelId = crypto.randomUUID();
                localStorage.setItem('ptv_channel_id', channelId);
            }
        }
    }
}
```

- [ ] **Step 2: Replace `copyEditorUrl()` (lines 400–407) with:**

```js
function copyEditorUrl() {
    const bid = typeof badgeChannelId !== 'undefined' && badgeChannelId ? `&bid=${badgeChannelId}` : '';
    const url = `https://pokemon.mrklypp.com/cemetery.html?id=${channelId}${bid}`;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => setStatus(tC('obsUrlCopied'), 'var(--success)'));
    } else {
        prompt(tC('sharePromptCopy'), url);
    }
}
```

- [ ] **Step 3: Verify (manual)**

1. From Task 2 test: after navigating to `cemetery.html` from external mode, confirm the external banner within the cemetery section also shows (it reads `externalMode` which is now true from sessionStorage).
2. Click "✕ Salir" in the header bar. Expected: redirected to `index.html` without params, no external mode bar, own channel active.

- [ ] **Step 4: Commit**

```bash
git add cemetery.js
git commit -m "feat(cemetery): persist external mode via sessionStorage, include bid in editor URL"
```

---

### Task 4: badges.js — sessionStorage in initBadges

**Files:**
- Modify: `badges.js` (function `initBadges` lines 509–542)

`initBadges()` has two branches: `ACTIVE_PAGE === 'badges'` (badges.html) and the else (index.html, cemetery.html). Both branches need sessionStorage checks.

- [ ] **Step 1: Replace the channel-ID init block inside `initBadges()` (lines 510–528)**

Current block to replace:

```js
    if (typeof ACTIVE_PAGE !== 'undefined' && ACTIVE_PAGE === 'badges') {
        const urlId = new URLSearchParams(location.search).get('id');
        if (urlId) {
            badgeChannelId    = urlId;
            badgeExternalMode = true;
        } else {
            badgeChannelId = localStorage.getItem('ptv_badge_channel_id');
            if (!badgeChannelId) {
                badgeChannelId = crypto.randomUUID();
                localStorage.setItem('ptv_badge_channel_id', badgeChannelId);
            }
        }
    } else {
        badgeChannelId = localStorage.getItem('ptv_badge_channel_id');
        if (!badgeChannelId) {
            badgeChannelId = crypto.randomUUID();
            localStorage.setItem('ptv_badge_channel_id', badgeChannelId);
        }
    }
```

Replace with:

```js
    if (typeof ACTIVE_PAGE !== 'undefined' && ACTIVE_PAGE === 'badges') {
        const urlId = new URLSearchParams(location.search).get('id');
        if (urlId) {
            badgeChannelId    = urlId;
            badgeExternalMode = true;
            sessionStorage.setItem('ptv_external_badge_id', urlId);
        } else {
            const storedExtBadge = sessionStorage.getItem('ptv_external_badge_id');
            if (storedExtBadge) {
                badgeChannelId    = storedExtBadge;
                badgeExternalMode = true;
            } else {
                badgeChannelId = localStorage.getItem('ptv_badge_channel_id');
                if (!badgeChannelId) {
                    badgeChannelId = crypto.randomUUID();
                    localStorage.setItem('ptv_badge_channel_id', badgeChannelId);
                }
            }
        }
    } else {
        const storedExtBadge = sessionStorage.getItem('ptv_external_badge_id');
        if (storedExtBadge) {
            badgeChannelId    = storedExtBadge;
            badgeExternalMode = true;
        } else {
            badgeChannelId = localStorage.getItem('ptv_badge_channel_id');
            if (!badgeChannelId) {
                badgeChannelId = crypto.randomUUID();
                localStorage.setItem('ptv_badge_channel_id', badgeChannelId);
            }
        }
    }
```

- [ ] **Step 2: Verify (manual)**

1. Start from `index.html?id=<main>&bid=<badge>` (use real UUIDs from a streamer's channels or fabricate two valid UUIDs).
2. Click "Medallas" tab → `badges.html`. Expected: badge external mode active, bar in header, badge section shows own external banner.
3. Navigate back to "Pokémon" → `index.html`. Expected: still in external mode.
4. Click "✕ Salir". Expected: `index.html` without params, own channel, no bar.
5. Open `badges.html?id=<badge-uuid>` directly. Navigate to "Pokémon". Expected: index.html loads with OWN pokemon channel (main channel not known from badge-only entry), no external banner for pokemon section. Header bar still shows if badge external ID is in sessionStorage.

- [ ] **Step 3: Commit**

```bash
git add badges.js
git commit -m "feat(badges): persist external mode via sessionStorage"
```

---

## Post-implementation smoke test

1. Open `index.html` (own channel). Click "Copiar link de editor". Confirm URL includes `?id=<main>&bid=<badge>`.
2. Open that URL. Confirm: pink header bar, per-section banners also show, publishing works to streamer's channel.
3. Navigate Pokémon → Cementerio → Medallas via header tabs. Each page: header bar present, correct external mode, publishin to streamer channel.
4. Click "✕ Salir". Confirm: `index.html`, no bar, back to own channel.
5. Open `badges.html?id=<badge>` directly. Navigate to Pokémon. Confirm: pokemon section uses own channel (no pokemon external mode), but header bar still shows badge external mode.
