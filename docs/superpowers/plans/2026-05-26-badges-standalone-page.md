# Badges Standalone Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the Badges section from `index.html` into a standalone `badges.html` page, backed by a shared `lang.js` module, so users can open each mode in independent browser tabs.

**Architecture:** A new `lang.js` owns the `currentLang` global and `setLangBase()`. `app.js` and `badges.js` both read `currentLang` as a global; each page defines its own `setLang` wrapper that calls `setLangBase` then updates the DOM. `setMode` moves from `badges.js` to `app.js` since it toggles `index.html`-specific DOM elements. Mode navigation becomes `<a href>` links so middle-click works natively.

**Tech Stack:** Vanilla JS, HTML, CSS — no build step, no bundler.

---

### Task 1: Create `lang.js`

**Files:**
- Create: `lang.js`

- [ ] **Step 1: Create the file**

```js
let currentLang = localStorage.getItem('ptv_lang') || 'es';

function setLangBase(lang) {
    currentLang = lang;
    localStorage.setItem('ptv_lang', lang);
}
```

- [ ] **Step 2: Verify**

Open `index.html` in a browser (or `npx serve .`). Open DevTools console. Run:
```js
typeof currentLang   // expected: "string" ("es" or "en")
typeof setLangBase   // expected: "function"
```
This will fail until Task 2 loads `lang.js` in `index.html` — that's expected. Move on.

- [ ] **Step 3: Commit**

```bash
git add lang.js
git commit -m "feat(lang): extract currentLang and setLangBase to lang.js"
```

---

### Task 2: Update `app.js` — remove `currentLang` init, update `setLang`, absorb `setMode`

**Files:**
- Modify: `app.js` (lines ~111, ~118–120, end of file)

- [ ] **Step 1: Remove `currentLang` init**

Find and delete line 111:
```js
let currentLang = localStorage.getItem('ptv_lang') || 'es';
```
Delete that single line. `currentLang` is now provided by `lang.js`.

- [ ] **Step 2: Update `setLang` to call `setLangBase`**

Current `setLang` (lines 118–126):
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

Replace with:
```js
function setLang(lang) {
    setLangBase(lang);
    document.documentElement.lang = lang;
    document.getElementById('lang-es').classList.toggle('active', lang === 'es');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    applyLang();
    if (typeof applyBadgeLang === 'function') applyBadgeLang();
}
```

- [ ] **Step 3: Add `setMode` at end of `app.js`**

Append after the `initChannelId` function (the last function in the file, around line 939):

```js
// ── Mode toggle ───────────────────────────────────────────────────
function setMode(mode) {
    localStorage.setItem('ptv_mode', mode);
    document.getElementById('section-pokemon').classList.toggle('hidden', mode !== 'pokemon');
    document.getElementById('section-badges').classList.toggle('hidden',  mode !== 'badges');
    document.getElementById('mode-btn-pokemon').classList.toggle('active', mode === 'pokemon');
    document.getElementById('mode-btn-badges').classList.toggle('active',  mode === 'badges');
    if (mode === 'badges') schedulePreviewBadgeUpdate();
}
```

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "refactor(app): delegate lang init to lang.js, absorb setMode"
```

---

### Task 3: Update `badges.js` — remove `setMode`, guard its call in `initBadges`

**Files:**
- Modify: `badges.js` (lines ~439–447, ~466–467)

- [ ] **Step 1: Delete the `setMode` block**

Remove lines 439–447 entirely:
```js
// ── Mode toggle ───────────────────────────────────────────────────
function setMode(mode) {
    localStorage.setItem('ptv_mode', mode);
    document.getElementById('section-pokemon').classList.toggle('hidden', mode !== 'pokemon');
    document.getElementById('section-badges').classList.toggle('hidden',  mode !== 'badges');
    document.getElementById('mode-btn-pokemon').classList.toggle('active', mode === 'pokemon');
    document.getElementById('mode-btn-badges').classList.toggle('active',  mode === 'badges');
    if (mode === 'badges') schedulePreviewBadgeUpdate();
}
```

- [ ] **Step 2: Guard `setMode` call in `initBadges`**

Current (around line 466):
```js
    const savedMode = localStorage.getItem('ptv_mode') || 'pokemon';
    setMode(savedMode);
```

Replace with:
```js
    const savedMode = localStorage.getItem('ptv_mode') || 'pokemon';
    if (typeof setMode === 'function') setMode(savedMode);
```

- [ ] **Step 3: Update the comment above `currentLang`**

Find line ~105:
```js
// currentLang is a global defined in app.js (loaded before badges.js)
```
Replace with:
```js
// currentLang is a global defined in lang.js (loaded before badges.js)
```

- [ ] **Step 4: Commit**

```bash
git add badges.js
git commit -m "refactor(badges): remove setMode (moved to app.js), guard call in initBadges"
```

---

### Task 4: Update `index.html` — load `lang.js`, convert mode buttons to links

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Load `lang.js` before `app.js`**

Find in `<head>`:
```html
<script src="pokemon-catalog.js"></script>
```
Replace with:
```html
<script src="pokemon-catalog.js"></script>
<script src="lang.js"></script>
```

- [ ] **Step 2: Convert mode buttons to `<a>` links**

Find:
```html
<button id="mode-btn-pokemon" class="mode-btn active" onclick="setMode('pokemon')" data-i18n-badge="pokemonMode">Pokémon</button>
<button id="mode-btn-badges" class="mode-btn" onclick="setMode('badges')" data-i18n-badge="badgeMode">Medallas</button>
```
Replace with:
```html
<a href="index.html" id="mode-btn-pokemon" class="mode-btn active" data-i18n-badge="pokemonMode">Pokémon</a>
<a href="badges.html" id="mode-btn-badges" class="mode-btn" data-i18n-badge="badgeMode">Medallas</a>
```

- [ ] **Step 3: Verify `index.html` still works**

Open `index.html` in browser. Check:
1. Page loads without console errors.
2. ES/EN toggle works — strings update.
3. Pokémon team section is visible.
4. Clicking "Medallas" navigates to `badges.html` (404 expected until Task 5).
5. Middle-click on "Medallas" opens a new tab.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(index): load lang.js, convert mode buttons to nav links"
```

---

### Task 5: Create `badges.html`

**Files:**
- Create: `badges.html`

- [ ] **Step 1: Create the file**

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Medallas — Pokémon Stream Visualizer</title>
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
            <a href="index.html" id="mode-btn-pokemon" class="mode-btn" data-i18n-badge="pokemonMode">Pokémon</a>
            <a href="badges.html" id="mode-btn-badges" class="mode-btn active" data-i18n-badge="badgeMode">Medallas</a>
        </div>
        <div class="lang-toggle">
            <button id="lang-es" onclick="setLang('es')">ES</button>
            <button id="lang-en" onclick="setLang('en')">EN</button>
        </div>
    </div>
</header>
<div id="app">

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

    <!-- Social -->
    <div class="card social">
        <p data-i18n="madeBy"></p>
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
<script>
function setLang(lang) {
    setLangBase(lang);
    document.documentElement.lang = lang;
    document.getElementById('lang-es').classList.toggle('active', lang === 'es');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    applyBadgeLang();
}
setLang(currentLang);
</script>
</body>
</html>
```

- [ ] **Step 2: Verify `badges.html` in browser**

Open `badges.html` (served via `npx serve .`). Check:
1. No console errors.
2. Game selector, layout selector populate correctly.
3. Badge checkboxes render.
4. Brightness slider works.
5. Live preview renders.
6. ES/EN toggle updates all strings.
7. "Pokémon" link navigates to `index.html`.
8. Middle-click on "Pokémon" opens `index.html` in new tab.
9. Publish button works (requires `wrangler` or deployed env for the API call).

- [ ] **Step 3: Commit**

```bash
git add badges.html
git commit -m "feat: add badges.html as standalone page"
```

---

### Task 6: Verify cross-page behavior

- [ ] **Step 1: Full smoke test**

1. Open `index.html`. Switch to EN. Click "Medallas" → navigates to `badges.html` in EN (lang persists via localStorage).
2. From `badges.html`, click "Pokémon" → back to `index.html`.
3. Open `index.html`, middle-click "Medallas" → opens `badges.html` in new tab.
4. Both tabs are independently functional.
5. Badge state (selected game, active badges, brightness) persists across page reloads.

- [ ] **Step 2: Final commit if anything was adjusted**

```bash
git add -p
git commit -m "fix: cross-page smoke test corrections"
```
(Only run if step 1 revealed issues requiring code fixes.)
