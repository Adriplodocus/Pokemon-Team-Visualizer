# External Channel Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow mods/editors to open an editor page with `?id=<uuid>` to publish directly to a streamer's OBS overlay channels.

**Architecture:** Each editor page (`index.html`, `cemetery.html`, `badges.html`) reads `?id=` from the URL on init. If present, the UUID is used as the active channel ID for the session without writing to localStorage. A banner appears on-screen so the operator knows they're in external mode. The streamer's UI gains a "Copy editor link" button to generate the shareable URL. `badges.js` only reads the URL param when `ACTIVE_PAGE === 'badges'` since it is also loaded on `index.html` and `cemetery.html`.

**Tech Stack:** Vanilla JS, HTML, CSS — no build step, no test framework. Verification is manual (browser).

---

### Task 1: Add external-banner CSS

**Files:**
- Modify: `style.css` (after `.btn-channel-action:hover` rule, around line 326)

`.hidden` is already defined at line 550 as `display: none !important`.

- [ ] **Step 1: Add the banner rule to style.css**

Insert after line 326 (`.btn-channel-action:hover { ... }`):

```css
.external-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 8px;
    background: rgba(255, 86, 180, 0.10);
    border: 1px solid rgba(255, 86, 180, 0.30);
    color: var(--pink);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    margin-bottom: 12px;
}
```

- [ ] **Step 2: Verify in browser**

Open `index.html`. No visual change expected (banner starts hidden). DevTools → add class `external-banner` to any div and remove `hidden` — confirm pink banner with correct styling appears.

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "style: add external-banner component"
```

---

### Task 2: app.js — External mode for Pokémon channel

**Files:**
- Modify: `app.js`

`app.js` is only loaded on `index.html` where `ACTIVE_PAGE = 'pokemon'`, so no ACTIVE_PAGE guard is needed.

- [ ] **Step 1: Add i18n strings to both locales**

In `STRINGS.es` (after `cookieOk` key, line ~53), add:

```js
copyEditorUrl:   '🔗 Copiar link de editor',
externalBanner:  id => `Controlando canal externo · ${id}`,
```

In `STRINGS.en` (after `cookieOk` key, line ~105), add:

```js
copyEditorUrl:   '🔗 Copy editor link',
externalBanner:  id => `Controlling external channel · ${id}`,
```

- [ ] **Step 2: Add externalMode flag near other state vars**

After `let channelId = null;` (line 174), add:

```js
let externalMode = false;
```

- [ ] **Step 3: Replace initChannelId() to read URL param**

Replace the existing `initChannelId()` function (lines 928–934):

```js
function initChannelId() {
    const urlId = new URLSearchParams(location.search).get('id');
    if (urlId) {
        channelId    = urlId;
        externalMode = true;
    } else {
        channelId = localStorage.getItem('ptv_channel_id');
        if (!channelId) {
            channelId = crypto.randomUUID();
            localStorage.setItem('ptv_channel_id', channelId);
        }
    }
}
```

- [ ] **Step 4: Update updateObsHint() to show banner and conditional buttons**

Replace the existing `updateObsHint()` function (lines 736–750):

```js
function updateObsHint() {
    const banner = document.getElementById('external-banner');
    if (banner) {
        banner.classList.toggle('hidden', !externalMode);
        if (externalMode) banner.textContent = t('externalBanner', channelId.slice(0, 8));
    }

    const layout = document.getElementById('layout-select').value;
    const dims   = layout === 'horizontal' ? '1350x265' : '265x1350';
    const url    = `https://pokemon.mrklypp.com/overlay.html?id=${channelId}`;
    document.getElementById('obs-hint').innerHTML =
        t('obsHint', dims) +
        `<br><br><span class="obs-url-label">${t('obsUrlLabel')}</span>` +
        `<div class="obs-url-row">` +
        `<span class="obs-url-display">${url}</span>` +
        `<button class="btn-copy-url" onclick="copyOverlayUrl()">${t('obsUrlCopy')}</button>` +
        `</div>` +
        `<div class="obs-channel-actions">` +
        (externalMode ? '' : `<button class="btn-channel-action" onclick="newChannel()">${t('newChannel')}</button>`) +
        (externalMode ? '' : `<button class="btn-channel-action" onclick="copyEditorUrl()">${t('copyEditorUrl')}</button>`) +
        `</div>`;
}
```

- [ ] **Step 5: Add copyEditorUrl() after copyOverlayUrl()**

Insert after `copyOverlayUrl()` (after line 759):

```js
function copyEditorUrl() {
    const url = `https://pokemon.mrklypp.com/index.html?id=${channelId}`;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => setStatus(t('obsUrlCopied'), 'var(--success)'));
    } else {
        prompt(t('sharePromptCopy'), url);
    }
}
```

- [ ] **Step 6: Verify normal mode**

Open `index.html` (no `?id=` param).
- External banner is NOT visible.
- OBS hint shows "🔄 Nuevo enlace" and "🔗 Copiar link de editor" buttons.
- Click "Copiar link de editor" — clipboard receives `https://pokemon.mrklypp.com/index.html?id=<uuid>`.

- [ ] **Step 7: Verify external mode**

Open `index.html?id=00000000-test-test-test-000000000000`.
- Pink banner at top: "Controlando canal externo · 00000000".
- OBS hint shows NO "Nuevo enlace" or "Copiar link de editor" buttons.
- OBS URL in hint shows `overlay.html?id=00000000-test-test-test-000000000000`.
- Click "Publicar en OBS" — network tab shows POST `/api/publish` with `id: "00000000-test-test-test-000000000000"`.
- Reload page — banner still shows (URL param persists in address bar).
- Open `index.html` (no param) — localStorage UUID is unchanged (external mode didn't overwrite it).

- [ ] **Step 8: Commit**

```bash
git add app.js
git commit -m "feat(app): external channel control via ?id= URL param"
```

---

### Task 3: index.html — Add external banner element

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add banner div after opening of #app**

In `index.html`, after `<div id="app">` (line 19), add:

```html
<div id="external-banner" class="external-banner hidden"></div>
```

- [ ] **Step 2: Verify**

Open `index.html?id=abc12345-0000-0000-0000-000000000000`. Banner shows "Controlando canal externo · abc12345".

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(index): add external-banner element"
```

---

### Task 4: cemetery.js — External mode for Cemetery channel

**Files:**
- Modify: `cemetery.js`

`cemetery.js` is only loaded on `cemetery.html` (`ACTIVE_PAGE = 'cemetery'`), so no ACTIVE_PAGE guard needed.

- [ ] **Step 1: Add i18n strings to both locales**

In `CEMETERY_STRINGS.es` (after `madeBy` key, line ~54), add:

```js
copyEditorUrl:  '🔗 Copiar link de editor',
externalBanner: id => `Controlando canal externo · ${id}`,
```

In `CEMETERY_STRINGS.en` (after `madeBy` key, line ~81), add:

```js
copyEditorUrl:  '🔗 Copy editor link',
externalBanner: id => `Controlling external channel · ${id}`,
```

- [ ] **Step 2: Add externalMode flag after channelId declaration**

After `let channelId = null;` (line 92), add:

```js
let externalMode = false;
```

- [ ] **Step 3: Replace initChannelId() to read URL param**

Replace the existing `initChannelId()` (lines 99–105):

```js
function initChannelId() {
    const urlId = new URLSearchParams(location.search).get('id');
    if (urlId) {
        channelId    = urlId;
        externalMode = true;
    } else {
        channelId = localStorage.getItem('ptv_channel_id');
        if (!channelId) {
            channelId = crypto.randomUUID();
            localStorage.setItem('ptv_channel_id', channelId);
        }
    }
}
```

- [ ] **Step 4: Update updateObsUrl() to manage banner and button visibility**

Replace the existing `updateObsUrl()` (lines 347–350):

```js
function updateObsUrl() {
    const banner = document.getElementById('external-banner');
    if (banner) {
        banner.classList.toggle('hidden', !externalMode);
        if (externalMode) banner.textContent = tC('externalBanner', channelId.slice(0, 8));
    }

    const newChannelBtn  = document.getElementById('cemetery-new-channel-btn');
    const copyEditorBtn  = document.getElementById('cemetery-copy-editor-btn');
    if (newChannelBtn) newChannelBtn.classList.toggle('hidden', externalMode);
    if (copyEditorBtn) copyEditorBtn.classList.toggle('hidden', externalMode);

    const el = document.getElementById('cemetery-obs-url-display');
    if (el) el.value = `https://pokemon.mrklypp.com/cemetery-overlay.html?id=${channelId}`;
}
```

- [ ] **Step 5: Add copyEditorUrl() after copyObsUrl()**

Insert after `copyObsUrl()` function (after line 355):

```js
function copyEditorUrl() {
    const url = `https://pokemon.mrklypp.com/cemetery.html?id=${channelId}`;
    navigator.clipboard
        ? navigator.clipboard.writeText(url).then(() => setStatus(tC('obsUrlCopied'), 'var(--success)'))
        : prompt(tC('obsUrlCopied'), url);
}
```

- [ ] **Step 6: Add cemetery-copy-editor-btn to applyCemeteryLang()**

In `applyCemeteryLang()` (line 406), add to the `ids` object:

```js
'cemetery-copy-editor-btn': tC('copyEditorUrl'),
```

- [ ] **Step 7: Commit**

```bash
git add cemetery.js
git commit -m "feat(cemetery): external channel control via ?id= URL param"
```

---

### Task 5: cemetery.html — Add banner element and copy-editor button

**Files:**
- Modify: `cemetery.html`

- [ ] **Step 1: Add external banner div after #app opening**

After `<div id="app">` (line 16), add:

```html
<div id="external-banner" class="external-banner hidden"></div>
```

- [ ] **Step 2: Add copy-editor button to obs-channel-actions div**

In the `.obs-channel-actions` div (currently lines 46–48), add a second button:

```html
<div class="obs-channel-actions">
    <button id="cemetery-new-channel-btn" class="btn-reset" onclick="newChannel()">🔄 Nuevo enlace</button>
    <button id="cemetery-copy-editor-btn" class="btn-channel-action" onclick="copyEditorUrl()">🔗 Copiar link de editor</button>
</div>
```

- [ ] **Step 3: Verify normal mode**

Open `cemetery.html` (no param).
- No banner visible.
- Both "🔄 Nuevo enlace" and "🔗 Copiar link de editor" buttons visible.
- Clicking "Copiar link de editor" copies `https://pokemon.mrklypp.com/cemetery.html?id=<uuid>`.

- [ ] **Step 4: Verify external mode**

Open `cemetery.html?id=00000000-test-test-test-000000000000`.
- Pink banner: "Controlando canal externo · 00000000".
- "Nuevo enlace" button hidden.
- "Copiar link de editor" button hidden.
- OBS URL input shows `cemetery-overlay.html?id=00000000-test-test-test-000000000000`.
- POST to `/api/publish` uses the external UUID.

- [ ] **Step 5: Commit**

```bash
git add cemetery.html
git commit -m "feat(cemetery): add external-banner element and copy-editor button"
```

---

### Task 6: badges.js — External mode for Badges channel

**Files:**
- Modify: `badges.js`

`badges.js` is loaded on `index.html`, `cemetery.html`, AND `badges.html`. The URL param must only be consumed when `ACTIVE_PAGE === 'badges'`.

- [ ] **Step 1: Add i18n strings to both locales**

In `BADGE_STRINGS.es` (after `badgeCopyPrompt`, line ~127), add:

```js
badgeCopyEditorUrl:  '🔗 Copiar link de editor',
badgeExternalBanner: id => `Controlando canal externo · ${id}`,
```

In `BADGE_STRINGS.en` (after `badgeCopyPrompt`, line ~149), add:

```js
badgeCopyEditorUrl:  '🔗 Copy editor link',
badgeExternalBanner: id => `Controlling external channel · ${id}`,
```

- [ ] **Step 2: Add badgeExternalMode flag after badgeChannelId declaration**

After `let badgeChannelId  = null;` (line 190 in badges.js), add:

```js
let badgeExternalMode = false;
```

- [ ] **Step 3: Replace initBadges() entirely (lines 447–465)**

```js
function initBadges() {
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

    loadBadgeState();
    buildBadgeGameSelect();
    buildBadgeLayoutSelect();
    buildBadgeCheckboxes();
    document.getElementById('badge-brightness').value           = badgeBrightness;
    document.getElementById('badge-brightness-val').textContent = badgeBrightness + '%';
    updateBadgeObsHint();
    applyBadgeLang();

    if (typeof setMode === 'function') setMode('pokemon');
    updateBadgePreview();
}
```

- [ ] **Step 4: Update updateBadgeObsHint() to show banner and conditional buttons**

Replace the existing `updateBadgeObsHint()` function (lines 333–349):

```js
function updateBadgeObsHint() {
    const hint = document.getElementById('badge-obs-hint');
    if (!hint) return;

    const banner = document.getElementById('external-banner');
    if (banner && badgeExternalMode) {
        banner.classList.remove('hidden');
        banner.textContent = tB('badgeExternalBanner', badgeChannelId.slice(0, 8));
    }

    const [cols, rows] = badgeLayout.split('x').map(Number);
    const dims = `${cols * 80}×${rows * 80}`;
    const url  = `https://pokemon.mrklypp.com/badge-overlay.html?id=${badgeChannelId}`;
    hint.innerHTML =
        tB('badgeObsHint', dims) +
        `<br><br><span class="obs-url-label">${tB('badgeUrlLabel')}</span>` +
        `<div class="obs-url-row">` +
        `<span class="obs-url-display">${url}</span>` +
        `<button class="btn-copy-url" onclick="copyBadgeOverlayUrl()">${tB('badgeUrlCopy')}</button>` +
        `</div>` +
        `<div class="obs-channel-actions">` +
        (badgeExternalMode ? '' : `<button class="btn-channel-action" onclick="newBadgeChannel()">${tB('badgeNewChannel')}</button>`) +
        (badgeExternalMode ? '' : `<button class="btn-channel-action" onclick="copyBadgeEditorUrl()">${tB('badgeCopyEditorUrl')}</button>`) +
        `</div>`;
}
```

- [ ] **Step 5: Add copyBadgeEditorUrl() after copyBadgeOverlayUrl()**

Insert after `copyBadgeOverlayUrl()` (after line 358):

```js
function copyBadgeEditorUrl() {
    const url = `https://pokemon.mrklypp.com/badges.html?id=${badgeChannelId}`;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => setBadgeStatus(tB('badgeUrlCopied'), 'var(--success)'));
    } else {
        prompt(tB('badgeCopyPrompt'), url);
    }
}
```

- [ ] **Step 6: Find badgeChannelId declaration to confirm placement of badgeExternalMode**

Run in browser console on `badges.html`: `console.log(typeof badgeChannelId)` — should log `string`. If badges.js declares `let badgeChannelId` near line 160–165 (after the BADGE_STRINGS block), add `let badgeExternalMode = false;` on the line immediately after it.

- [ ] **Step 7: Commit**

```bash
git add badges.js
git commit -m "feat(badges): external channel control via ?id= URL param"
```

---

### Task 7: badges.html — Add external banner element

**Files:**
- Modify: `badges.html`

- [ ] **Step 1: Add external banner div after #app opening**

In `badges.html`, after `<div id="app">` (line 15), add:

```html
<div id="external-banner" class="external-banner hidden"></div>
```

- [ ] **Step 2: Verify normal mode**

Open `badges.html` (no param).
- No banner.
- OBS hint shows "🔄 Nuevo enlace" and "🔗 Copiar link de editor" buttons.
- Click "Copiar link de editor" — copies `https://pokemon.mrklypp.com/badges.html?id=<uuid>`.

- [ ] **Step 3: Verify external mode**

Open `badges.html?id=00000000-test-test-test-000000000000`.
- Pink banner: "Controlando canal externo · 00000000".
- No "Nuevo enlace" or "Copiar link de editor" buttons.
- Publish sends `id: "00000000-test-test-test-000000000000"`.

- [ ] **Step 4: Verify no bleed on index.html and cemetery.html**

Open `index.html?id=aaaabbbb-0000-0000-0000-000000000000`.
- Banner shows "Controlando canal externo · aaaabbbb" (pokemon banner from app.js).
- Switch to "Medallas" mode → no second banner, badge OBS hint behaves normally (uses badge's own localStorage UUID).

Open `cemetery.html?id=ccccdddd-0000-0000-0000-000000000000`.
- Banner shows "Controlando canal externo · ccccdddd" (cemetery banner).
- Badge section on cemetery.html is NOT in external mode (correct — badges.js saw `ACTIVE_PAGE !== 'badges'`).

- [ ] **Step 5: Commit**

```bash
git add badges.html
git commit -m "feat(badges): add external-banner element"
```

---

## Post-implementation smoke test

1. Streamer opens `index.html` normally. Copies editor link. Sends it to mod.
2. Mod opens `index.html?id=<streamer-uuid>`. Sees banner. Publishes team. Streamer's `overlay.html` updates.
3. Streamer's `index.html` (no param) — own localStorage UUID untouched.
4. Streamer clicks "🔄 Nuevo enlace" — UUID rotates, old editor link stops working.
