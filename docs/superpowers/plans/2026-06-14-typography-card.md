# Typography Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a typography card above the publish card that lets streamers configure font (Google Fonts custom dropdown with preview), size (20–50px, default 35), text color, stroke width (0–10px), and stroke color for Pokémon name labels.

**Architecture:** A `typography` global object in `app.js` holds the settings and is persisted to `localStorage` as `ptv_typography`. It flows into `buildOverlayHTML()` for live preview and is included in the Ably publish payload. `overlay.html` reads `data.typography` in `renderTeam()` and applies it via inline styles + dynamic Google Font `<link>`. A canvas-based HSB color picker serves both text and stroke color inputs; a custom `<div>` dropdown renders each font option in its own typeface.

**Tech Stack:** Vanilla JS/HTML/CSS, Google Fonts API v2 (batch URL), Canvas 2D API.

---

## File Map

| File | Change |
|---|---|
| `index.html` | Add typography card HTML + color picker popover HTML; add batch Google Fonts `<link>` |
| `style.css` | Styles for `.card--typography`, custom font dropdown, color picker popover |
| `app.js` | Typography state, font dropdown JS, color picker JS, update `buildOverlayHTML()`, `saveState()`, `loadState()`, `publishToObs()`, `applyRawState()` |
| `overlay.html` | Update `renderTeam()` to apply typography via inline style + dynamic font link |

---

## Task 1: Typography state + persistence

**Files:**
- Modify: `app.js` (near top, after `DEFAULT_PROPS`)

- [ ] **Step 1: Add font list + default typography object**

Find the line with `const DEFAULT_PROPS` in `app.js` and add after it:

```js
const GOOGLE_FONTS = [
    'Abril Fatface','Alfa Slab One','Anton','Bangers','Bebas Neue',
    'Black Han Sans','Black Ops One','Boogaloo','Carter One','Changa One',
    'Chewy','Cinzel','Concert One','Creepster','Exo 2',
    'Fascinate','Fredoka One','Fugaz One','Graduate','Gugi',
    'Josefin Sans','Knewave','Lilita One','Lobster','Luckiest Guy',
    'Montserrat','Nunito','Orbitron','Oswald','Oxanium',
    'Pacifico','Passion One','Patua One','Permanent Marker','Pirata One',
    'Poller One','Press Start 2P','Racing Sans One','Righteous','Rubik',
    'Russo One','Sigmar One','Skranji','Squada One','Titan One',
    'Viga','Yanone Kaffeesatz',
];

const DEFAULT_TYPOGRAPHY = {
    font:        'Anton',
    size:        35,
    textColor:   '#ffffff',
    strokeWidth: 3,
    strokeColor: '#000000',
};

let typography = { ...DEFAULT_TYPOGRAPHY };
```

- [ ] **Step 2: Add `saveTypography()` and `loadTypography()`**

Add after the `saveState()` / `loadState()` block in `app.js`:

```js
function saveTypography() {
    localStorage.setItem('ptv_typography', JSON.stringify(typography));
}

function loadTypography() {
    try {
        const saved = JSON.parse(localStorage.getItem('ptv_typography'));
        if (saved) typography = { ...DEFAULT_TYPOGRAPHY, ...saved };
    } catch (_) {}
}
```

- [ ] **Step 3: Call `loadTypography()` inside `loadState()`**

At the end of `loadState()`, before the closing `}`, add:

```js
    loadTypography();
```

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat(typography): add state, font list, and persistence"
```

---

## Task 2: Batch Google Fonts link in index.html

**Files:**
- Modify: `index.html` `<head>`

- [ ] **Step 1: Build the batch Google Fonts URL**

The URL format is:
`https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Alfa+Slab+One&...&display=swap`

Replace spaces with `+` and join with `&family=`.

- [ ] **Step 2: Add the `<link>` to `index.html` `<head>`**

After the existing `<link rel="stylesheet" href="style.css">` line, add:

```html
<link id="gf-batch" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Alfa+Slab+One&family=Anton&family=Bangers&family=Bebas+Neue&family=Black+Han+Sans&family=Black+Ops+One&family=Boogaloo&family=Carter+One&family=Changa+One&family=Chewy&family=Cinzel&family=Concert+One&family=Creepster&family=Exo+2:wght@700&family=Fascinate&family=Fredoka+One&family=Fugaz+One&family=Graduate&family=Gugi&family=Josefin+Sans:wght@700&family=Knewave&family=Lilita+One&family=Lobster&family=Luckiest+Guy&family=Montserrat:wght@700&family=Nunito:wght@700&family=Orbitron:wght@700&family=Oswald:wght@700&family=Oxanium:wght@700&family=Pacifico&family=Passion+One&family=Patua+One&family=Permanent+Marker&family=Pirata+One&family=Poller+One&family=Press+Start+2P&family=Racing+Sans+One&family=Righteous&family=Rubik:wght@700&family=Russo+One&family=Sigmar+One&family=Skranji&family=Squada+One&family=Titan+One&family=Viga&family=Yanone+Kaffeesatz:wght@700&display=swap">
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(typography): batch load Google Fonts in editor"
```

---

## Task 3: Typography card HTML

**Files:**
- Modify: `index.html` — inside `.pokemon-actions-col`, BEFORE `.card--actions`

- [ ] **Step 1: Add typography card HTML**

In `index.html`, find:

```html
    <div class="pokemon-actions-col">

        <!-- Actions -->
        <div class="card card--actions">
```

Replace with:

```html
    <div class="pokemon-actions-col">

        <!-- Typography -->
        <div class="card card--typography">

            <!-- Font -->
            <div class="typo-row">
                <span class="typo-label">Font</span>
                <div class="font-dropdown" id="font-dropdown">
                    <div class="font-dropdown__trigger" id="font-trigger" onclick="toggleFontDropdown()">
                        <span id="font-selected-label">Anton</span>
                        <svg class="font-dropdown__caret" viewBox="0 0 10 6" width="10" height="6"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>
                    </div>
                    <div class="font-dropdown__panel" id="font-panel"></div>
                </div>
            </div>

            <!-- Size -->
            <div class="typo-row">
                <span class="typo-label">Size</span>
                <input type="range" id="typo-size" min="20" max="50" value="35"
                       oninput="onTypoSize(this.value)">
                <span class="typo-val" id="typo-size-val">35px</span>
            </div>

            <!-- Colors + Stroke -->
            <div class="typo-row typo-row--colors">
                <span class="typo-label">Text</span>
                <div class="color-swatch" id="text-swatch" onclick="openPicker('text')" style="background:#ffffff"></div>

                <span class="typo-label typo-label--gap">Stroke</span>
                <div class="color-swatch" id="stroke-swatch" onclick="openPicker('stroke')" style="background:#000000"></div>
                <input type="range" id="typo-stroke" min="0" max="10" value="3" step="0.5"
                       oninput="onTypoStroke(this.value)">
                <span class="typo-val" id="typo-stroke-val">3px</span>
            </div>

        </div>

        <!-- Color picker popover (shared) -->
        <div class="color-picker-popover hidden" id="color-picker">
            <canvas id="cp-canvas" width="220" height="140"></canvas>
            <div class="cp-thumb" id="cp-thumb"></div>
            <canvas id="cp-hue" width="220" height="14"></canvas>
            <div class="cp-hue-thumb" id="cp-hue-thumb"></div>
            <input type="text" class="cp-hex" id="cp-hex" maxlength="7" spellcheck="false">
        </div>

        <!-- Actions -->
        <div class="card card--actions">
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat(typography): add typography card and color picker HTML"
```

---

## Task 4: Typography card CSS

**Files:**
- Modify: `style.css` — add after the `/* ── Live preview */` section

- [ ] **Step 1: Add all typography card styles**

Add after `#preview-bg-toggle:hover { ... }`:

```css
/* ── Typography card ─────────────────────────────────────────── */
.card--typography { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }

.typo-row {
    display: flex;
    align-items: center;
    gap: 8px;
}
.typo-row--colors { flex-wrap: wrap; }

.typo-label {
    font-size: 11px;
    color: var(--text);
    white-space: nowrap;
    min-width: 32px;
}
.typo-label--gap { margin-left: 8px; }

.typo-val {
    font-size: 11px;
    color: var(--text);
    min-width: 30px;
    text-align: right;
}

.typo-row input[type="range"] {
    flex: 1;
    accent-color: var(--blue);
    min-width: 0;
}

/* Font dropdown */
.font-dropdown { position: relative; flex: 1; }

.font-dropdown__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 10px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    color: var(--text-em);
    transition: border-color 0.15s;
    user-select: none;
}
.font-dropdown__trigger:hover { border-color: rgba(0,204,255,0.3); }
.font-dropdown__trigger.open   { border-color: rgba(0,204,255,0.5); }

.font-dropdown__caret { color: var(--text); flex-shrink: 0; }

.font-dropdown__panel {
    position: absolute;
    top: calc(100% + 4px);
    left: 0; right: 0;
    max-height: 220px;
    overflow-y: auto;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px;
    z-index: 200;
    display: none;
    box-shadow: 0 6px 24px rgba(0,0,0,0.7);
}
.font-dropdown__panel.open { display: block; }

.font-dropdown__item {
    padding: 8px 12px;
    font-size: 15px;
    color: var(--text-em);
    cursor: pointer;
    transition: background 0.1s;
}
.font-dropdown__item:hover    { background: var(--surface); }
.font-dropdown__item.selected { color: var(--blue); }

/* Color swatch */
.color-swatch {
    width: 22px;
    height: 22px;
    border-radius: 5px;
    border: 1px solid var(--border);
    cursor: pointer;
    flex-shrink: 0;
    transition: border-color 0.15s;
}
.color-swatch:hover { border-color: rgba(0,204,255,0.4); }

/* Color picker popover */
.color-picker-popover {
    position: relative;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: 0 6px 24px rgba(0,0,0,0.7);
    user-select: none;
}
.color-picker-popover.hidden { display: none; }

#cp-canvas  { border-radius: 6px; display: block; cursor: crosshair; }
#cp-hue     { border-radius: 4px; display: block; cursor: crosshair; }

.cp-thumb {
    position: absolute;
    width: 12px; height: 12px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 0 3px rgba(0,0,0,0.8);
    pointer-events: none;
    transform: translate(-50%, -50%);
}
.cp-hue-thumb {
    position: absolute;
    width: 4px; height: 22px;
    background: #fff;
    border-radius: 2px;
    box-shadow: 0 0 3px rgba(0,0,0,0.8);
    pointer-events: none;
    transform: translateX(-50%);
    top: 0;
}

.cp-hex {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-em);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    padding: 5px 8px;
    width: 100%;
    outline: none;
    text-transform: uppercase;
    transition: border-color 0.15s;
}
.cp-hex:focus { border-color: rgba(0,204,255,0.5); }
```

- [ ] **Step 2: Commit**

```bash
git add style.css
git commit -m "feat(typography): add typography card and color picker CSS"
```

---

## Task 5: Custom font dropdown JS

**Files:**
- Modify: `app.js` — add new section `// ── Font dropdown`

- [ ] **Step 1: Add font dropdown build + toggle functions**

Add after the `togglePreviewBg()` function:

```js
// ── Font dropdown ─────────────────────────────────────────────────
function buildFontDropdown() {
    const panel = document.getElementById('font-panel');
    GOOGLE_FONTS.forEach(font => {
        const item = document.createElement('div');
        item.className = 'font-dropdown__item' + (font === typography.font ? ' selected' : '');
        item.textContent = font;
        item.style.fontFamily = `'${font}', sans-serif`;
        item.dataset.font = font;
        item.onclick = () => selectFont(font);
        panel.appendChild(item);
    });
}

function toggleFontDropdown() {
    const panel   = document.getElementById('font-panel');
    const trigger = document.getElementById('font-trigger');
    const isOpen  = panel.classList.toggle('open');
    trigger.classList.toggle('open', isOpen);
    if (isOpen) {
        setTimeout(() => document.addEventListener('click', closeFontDropdownOutside, { once: true }), 0);
    }
}

function closeFontDropdownOutside(e) {
    const dd = document.getElementById('font-dropdown');
    if (!dd.contains(e.target)) closeFontDropdown();
}

function closeFontDropdown() {
    document.getElementById('font-panel').classList.remove('open');
    document.getElementById('font-trigger').classList.remove('open');
}

function selectFont(font) {
    typography.font = font;
    document.getElementById('font-selected-label').textContent = font;
    document.getElementById('font-selected-label').style.fontFamily = `'${font}', sans-serif`;
    document.querySelectorAll('.font-dropdown__item').forEach(el => {
        el.classList.toggle('selected', el.dataset.font === font);
    });
    closeFontDropdown();
    saveTypography();
    schedulePreviewUpdate();
}
```

- [ ] **Step 2: Add size/stroke handlers**

```js
function onTypoSize(val) {
    typography.size = Number(val);
    document.getElementById('typo-size-val').textContent = val + 'px';
    saveTypography();
    schedulePreviewUpdate();
}

function onTypoStroke(val) {
    typography.strokeWidth = Number(val);
    document.getElementById('typo-stroke-val').textContent = val + 'px';
    saveTypography();
    schedulePreviewUpdate();
}
```

- [ ] **Step 3: Call `buildFontDropdown()` in `DOMContentLoaded`**

Find the `document.addEventListener('DOMContentLoaded', ...)` block in `app.js` and add inside it, after `loadState()`:

```js
    buildFontDropdown();
    syncTypographyUI();
```

- [ ] **Step 4: Add `syncTypographyUI()` to restore UI from state**

```js
function syncTypographyUI() {
    document.getElementById('typo-size').value        = typography.size;
    document.getElementById('typo-size-val').textContent = typography.size + 'px';
    document.getElementById('typo-stroke').value      = typography.strokeWidth;
    document.getElementById('typo-stroke-val').textContent = typography.strokeWidth + 'px';
    document.getElementById('font-selected-label').textContent  = typography.font;
    document.getElementById('font-selected-label').style.fontFamily = `'${typography.font}', sans-serif`;
    document.getElementById('text-swatch').style.background   = typography.textColor;
    document.getElementById('stroke-swatch').style.background = typography.strokeColor;
}
```

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "feat(typography): font dropdown and slider handlers"
```

---

## Task 6: Canvas color picker JS

**Files:**
- Modify: `app.js` — add new section `// ── Color picker`

- [ ] **Step 1: Add color picker state + canvas draw helpers**

```js
// ── Color picker ──────────────────────────────────────────────────
let cpTarget = null;   // 'text' | 'stroke'
let cpH = 0, cpS = 1, cpB = 1;   // hue 0-360, sat 0-1, bri 0-1

function drawCpCanvas() {
    const canvas = document.getElementById('cp-canvas');
    const ctx    = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = `hsl(${cpH},100%,50%)`;
    ctx.fillRect(0, 0, W, H);
    const wg = ctx.createLinearGradient(0, 0, W, 0);
    wg.addColorStop(0, 'rgba(255,255,255,1)');
    wg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = wg; ctx.fillRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, 'rgba(0,0,0,0)');
    bg.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
}

function drawHueBar() {
    const canvas = document.getElementById('cp-hue');
    const ctx    = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const g = ctx.createLinearGradient(0, 0, W, 0);
    for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, `hsl(${i * 60},100%,50%)`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

function hsbToHex(h, s, b) {
    const rgb = hsbToRgb(h, s, b);
    return '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('');
}

function hsbToRgb(h, s, b) {
    const i = Math.floor(h / 60) % 6;
    const f = h / 60 - Math.floor(h / 60);
    const p = b * (1 - s), q = b * (1 - f * s), t = b * (1 - (1 - f) * s);
    const maps = [[b,t,p],[q,b,p],[p,b,t],[p,q,b],[t,p,b],[b,p,q]];
    return maps[i].map(v => Math.round(v * 255));
}

function hexToHsb(hex) {
    const r = parseInt(hex.slice(1,3),16)/255;
    const g = parseInt(hex.slice(3,5),16)/255;
    const b = parseInt(hex.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min;
    let h = 0;
    if (d) {
        if      (max === r) h = ((g - b) / d + 6) % 6 * 60;
        else if (max === g) h = ((b - r) / d + 2) * 60;
        else                h = ((r - g) / d + 4) * 60;
    }
    return { h, s: max ? d / max : 0, b: max };
}

function updateCpThumb() {
    const canvas = document.getElementById('cp-canvas');
    const thumb  = document.getElementById('cp-thumb');
    const x = cpS * canvas.width;
    const y = (1 - cpB) * canvas.height;
    thumb.style.left = (canvas.offsetLeft + x) + 'px';
    thumb.style.top  = (canvas.offsetTop  + y) + 'px';
}

function updateHueThumb() {
    const canvas = document.getElementById('cp-hue');
    const thumb  = document.getElementById('cp-hue-thumb');
    thumb.style.left = (canvas.offsetLeft + (cpH / 360) * canvas.width) + 'px';
    thumb.style.top  = canvas.offsetTop + 'px';
}

function applyPickerColor() {
    const hex = hsbToHex(cpH, cpS, cpB);
    document.getElementById('cp-hex').value = hex.toUpperCase();
    if (cpTarget === 'text') {
        typography.textColor = hex;
        document.getElementById('text-swatch').style.background = hex;
    } else {
        typography.strokeColor = hex;
        document.getElementById('stroke-swatch').style.background = hex;
    }
    saveTypography();
    schedulePreviewUpdate();
}
```

- [ ] **Step 2: Add picker open/close + interaction**

```js
function openPicker(target) {
    cpTarget = target;
    const hex = target === 'text' ? typography.textColor : typography.strokeColor;
    const hsb = hexToHsb(hex);
    cpH = hsb.h; cpS = hsb.s; cpB = hsb.b;

    const picker  = document.getElementById('color-picker');
    const swatch  = document.getElementById(target + '-swatch');
    picker.classList.remove('hidden');

    drawCpCanvas();
    drawHueBar();
    document.getElementById('cp-hex').value = hex.toUpperCase();

    // Position thumb after layout
    requestAnimationFrame(() => { updateCpThumb(); updateHueThumb(); });

    setTimeout(() => document.addEventListener('click', closePickerOutside, { once: true }), 0);
}

function closePickerOutside(e) {
    const picker = document.getElementById('color-picker');
    const swatches = document.querySelectorAll('.color-swatch');
    const clickedSwatch = [...swatches].some(s => s.contains(e.target));
    if (!picker.contains(e.target) && !clickedSwatch) {
        picker.classList.add('hidden');
    } else {
        setTimeout(() => document.addEventListener('click', closePickerOutside, { once: true }), 0);
    }
}

function initColorPicker() {
    const canvas    = document.getElementById('cp-canvas');
    const hueCanvas = document.getElementById('cp-hue');
    const hexInput  = document.getElementById('cp-hex');

    function onCanvasClick(e) {
        const rect = canvas.getBoundingClientRect();
        cpS = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        cpB = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
        updateCpThumb();
        applyPickerColor();
    }

    function onHueClick(e) {
        const rect = hueCanvas.getBoundingClientRect();
        cpH = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));
        updateHueThumb();
        drawCpCanvas();
        applyPickerColor();
    }

    let draggingCanvas = false, draggingHue = false;
    canvas.addEventListener('mousedown', e => { draggingCanvas = true; onCanvasClick(e); });
    hueCanvas.addEventListener('mousedown', e => { draggingHue = true; onHueClick(e); });
    document.addEventListener('mousemove', e => {
        if (draggingCanvas) onCanvasClick(e);
        if (draggingHue)    onHueClick(e);
    });
    document.addEventListener('mouseup', () => { draggingCanvas = false; draggingHue = false; });

    hexInput.addEventListener('change', () => {
        const val = hexInput.value.trim();
        if (/^#[0-9a-fA-F]{6}$/.test(val)) {
            const hsb = hexToHsb(val);
            cpH = hsb.h; cpS = hsb.s; cpB = hsb.b;
            drawCpCanvas();
            updateCpThumb();
            updateHueThumb();
            applyPickerColor();
        }
    });
}
```

- [ ] **Step 3: Call `initColorPicker()` in `DOMContentLoaded`**

Inside the `DOMContentLoaded` block, after `buildFontDropdown()`:

```js
    initColorPicker();
```

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat(typography): canvas HSB color picker"
```

---

## Task 7: Update `buildOverlayHTML()` to use typography

**Files:**
- Modify: `app.js` — `buildOverlayHTML()` function

- [ ] **Step 1: Change signature to accept typography param**

Change:

```js
function buildOverlayHTML(layout, showShadows, showBg) {
    const dataBlock = JSON.stringify({ team, layout, shadows: showShadows, bg: showBg });
```

To:

```js
function buildOverlayHTML(layout, showShadows, showBg, typo) {
    typo = typo || typography;
    const dataBlock = JSON.stringify({ team, layout, shadows: showShadows, bg: showBg, typography: typo });
```

- [ ] **Step 2: Build the font Google Fonts URL for the iframe**

After the `typo = typo || typography;` line, add:

```js
    const gfFamily = typo.font.replace(/ /g, '+');
    const gfLink   = `<link href="https://fonts.googleapis.com/css2?family=${gfFamily}:wght@400;700&display=swap" rel="stylesheet">`;
```

- [ ] **Step 3: Build the `<p>` inline style string**

Add:

```js
    const strokePx   = typo.strokeWidth > 0 ? `${typo.strokeWidth}px` : '0';
    const pStyle = [
        `color:${typo.textColor}`,
        `font-family:'${typo.font}',Anton,'Arial Narrow Bold',sans-serif`,
        `font-size:${typo.size}px`,
        `-webkit-text-stroke:${strokePx} ${typo.strokeColor}`,
        `paint-order:stroke fill`,
    ].join(';');
```

- [ ] **Step 4: Replace hardcoded `<link>` and `<p>` styles in horizontal template**

In the horizontal `return` string, replace:

```js
<link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet">
```

with:

```js
${gfLink}
```

And replace the hardcoded `p{...}` CSS rule in the horizontal template:

```css
p{height:25px;color:white;text-align:center;font-family:Anton,'Arial Narrow Bold',sans-serif;font-size:35px;text-shadow:3px 3px 0 #000,-3px 3px 0 #000,-3px -3px 0 #000,3px -3px 0 #000;}
```

with:

```css
p{height:25px;text-align:center;}
```

Then in the `pkDivContent` map, change:

```js
let c = `<p>${e.mote}</p>`;
```

to:

```js
let c = `<p style="${pStyle}">${e.mote}</p>`;
```

- [ ] **Step 5: Do the same for the vertical template**

Replace `<link>` in vertical template with `${gfLink}`.

Replace the vertical `<p>` CSS:

```css
p{margin:0;padding:0;height:25px;color:white;font-family:Anton,'Arial Narrow Bold',sans-serif;font-size:25px;text-align:center;text-shadow:3px 3px 0 #000,-3px 3px 0 #000,-3px -3px 0 #000,3px -3px 0 #000;}
```

with:

```css
p{margin:0;padding:0;height:25px;text-align:center;}
```

Note: the `pkDivContent` array is shared between horizontal and vertical paths — the `<p style="${pStyle}">` change from Step 4 already covers both.

- [ ] **Step 6: Update `updatePreview()` call**

In `updatePreview()`, change:

```js
    iframe.srcdoc = buildOverlayHTML('horizontal', shadows, bg);
```

to:

```js
    iframe.srcdoc = buildOverlayHTML('horizontal', shadows, bg, typography);
```

- [ ] **Step 7: Commit**

```bash
git add app.js
git commit -m "feat(typography): apply to buildOverlayHTML and preview"
```

---

## Task 8: Include typography in `publishToObs()` and `applyRawState()`

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add typography to publish payload**

In `publishToObs()`, find the `body: JSON.stringify({...})` block and add `typography` to both the top-level payload and `raw`:

```js
body: JSON.stringify({
    id:      channelId,
    team:    entries,
    layout,
    shadows,
    bg,
    typography,
    raw: {
        team: team.map(s => ({ name: s.name, mote: s.mote, properties: { ...s.properties } })),
        layout,
        shadows,
        bg,
        typography,
    },
}),
```

- [ ] **Step 2: Apply typography in `applyRawState()`**

In `applyRawState()`, after the `if (raw.bg !== undefined)` line, add:

```js
    if (raw.typography) {
        typography = { ...DEFAULT_TYPOGRAPHY, ...raw.typography };
        saveTypography();
        syncTypographyUI();
    }
```

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat(typography): include in publish payload and applyRawState"
```

---

## Task 9: Update `overlay.html` to apply typography

**Files:**
- Modify: `overlay.html`

- [ ] **Step 1: Replace hardcoded Anton `<link>` with a placeholder**

In `overlay.html` `<head>`, replace:

```html
<link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet">
```

with:

```html
<link id="overlay-font-link" href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Remove hardcoded font/color from CSS rules**

In `overlay.html` `<style>`, change:

```css
body.layout-horizontal p{height:25px;color:white;text-align:center;font-family:Anton,'Arial Narrow Bold',sans-serif;font-size:35px;-webkit-text-stroke:3px #000;paint-order:stroke fill;}
```

to:

```css
body.layout-horizontal p{height:25px;text-align:center;}
```

And change:

```css
body.layout-vertical p{margin:0;padding:0;height:25px;color:white;font-family:Anton,'Arial Narrow Bold',sans-serif;font-size:25px;text-align:center;-webkit-text-stroke:3px #000;paint-order:stroke fill;}
```

to:

```css
body.layout-vertical p{margin:0;padding:0;height:25px;text-align:center;}
```

- [ ] **Step 3: Update `renderTeam()` to apply typography**

In `renderTeam(data)`, after reading `var bg = data.bg !== false;`, add:

```js
        var typo = data.typography || {
            font: 'Anton', size: 35, textColor: '#ffffff',
            strokeWidth: 3, strokeColor: '#000000'
        };

        // Update font link
        var fontLink = document.getElementById('overlay-font-link');
        var gfFamily = typo.font.replace(/ /g, '+');
        var newHref  = 'https://fonts.googleapis.com/css2?family=' + gfFamily + ':wght@400;700&display=swap';
        if (fontLink.href !== newHref) fontLink.href = newHref;

        var strokePx = typo.strokeWidth > 0 ? typo.strokeWidth + 'px' : '0';
        var pStyle = [
            'color:' + typo.textColor,
            "font-family:'" + typo.font + "',Anton,'Arial Narrow Bold',sans-serif",
            'font-size:' + typo.size + 'px',
            '-webkit-text-stroke:' + strokePx + ' ' + typo.strokeColor,
            'paint-order:stroke fill',
        ].join(';');
```

- [ ] **Step 4: Apply `pStyle` to every `<p>` created in `renderTeam()`**

In both the vertical and horizontal branches, after `var p = document.createElement('p');`, add:

```js
                p.style.cssText = pStyle;
```

There are two `var p = document.createElement('p');` occurrences — one in the vertical branch (inside `team.forEach`), one in the horizontal branch. Add `p.style.cssText = pStyle;` immediately after each.

- [ ] **Step 5: Commit**

```bash
git add overlay.html
git commit -m "feat(typography): apply dynamic typography in overlay.html"
```

---

## Task 10: Verify end-to-end

- [ ] **Step 1: Serve locally**

```bash
npx serve .
```

Open `http://localhost:3000` in browser.

- [ ] **Step 2: Check typography card renders**

Confirm card appears above publish card with font dropdown, size slider, two swatches, stroke slider.

- [ ] **Step 3: Test font dropdown**

Click dropdown → panel opens with ~47 fonts each rendered in its own typeface. Select "Bangers" → trigger updates, preview iframe refreshes with Bangers font.

- [ ] **Step 4: Test color picker**

Click text color swatch → picker opens. Drag on canvas → swatch and preview update. Type `#FF56B4` in HEX input → updates. Click outside → picker closes.

- [ ] **Step 5: Test stroke**

Move stroke slider to 0 → no stroke in preview. Move to 8 → thick stroke visible.

- [ ] **Step 6: Test persistence**

Reload page → typography settings restore correctly (font, size, colors, stroke).

- [ ] **Step 7: Test publish (requires Ably)**

Publish team → open `overlay.html?id=<channelId>` → confirms font/color/stroke applied in overlay.

- [ ] **Step 8: Final commit if any fixes needed**

```bash
git add -p
git commit -m "fix(typography): <describe any fixes>"
```
