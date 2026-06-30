# Team Layout Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the binary horizontal/vertical layout toggle with 4 grid options: h6x1, h3x2, v1x6, v2x3.

**Architecture:** Single compound layout value encodes both orientation and grid. Back-compat normalization maps old 'horizontal'→'h6x1' and 'vertical'→'v1x6' in all three places where a stored value is applied to the select. Preview renders an iframe only for horizontal layouts; h3x2 gets different iframe dimensions than h6x1.

**Tech Stack:** Vanilla JS, HTML, CSS — no build step, no test framework.

## Global Constraints

- No backend changes — layout value flows through existing Ably publish and `/api/state` APIs unchanged.
- Back-compat required: `loadState`, `buildMigratedState`, and preset load all run values through `normalizeLayout()` before applying them.
- `overlay.html` receives layout via Ably; it must handle legacy `'horizontal'`/`'vertical'` values from cached messages via `normalizeLayout()` in its own JS.
- Each Pokémon slot is 225px wide. h3x2 = 3 cols × 2 rows → 675px container. v2x3 = 2 cols × 3 rows → 450px container.
- Preview shows "only horizontal" message for both v1x6 and v2x3 — `previewVertical` i18n key stays.

---

### Task 1: Replace layout select options in `index.html`

**Files:**
- Modify: `index.html` (layout select, lines 166–169)

**Interfaces:**
- Produces: `#layout-select` with values `'h6x1' | 'h3x2' | 'v1x6' | 'v2x3'`

- [ ] **Step 1: Replace the 2 options with 4**

Find in `index.html`:
```html
                <select id="layout-select">
                    <option value="horizontal" data-i18n="horizontal"></option>
                    <option value="vertical" data-i18n="vertical"></option>
                </select>
```

Replace with:
```html
                <select id="layout-select">
                    <option value="h6x1">Horizontal 6×1</option>
                    <option value="h3x2">Horizontal 3×2</option>
                    <option value="v1x6">Vertical 1×6</option>
                    <option value="v2x3">Vertical 2×3</option>
                </select>
```

Grid notation is language-agnostic — no `data-i18n` needed.

- [ ] **Step 2: Verify in browser**

Open `index.html` locally. The Layout dropdown shows 4 options: "Horizontal 6×1", "Horizontal 3×2", "Vertical 1×6", "Vertical 2×3".

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(layout): replace binary layout select with 4-option grid select"
```

---

### Task 2: Add helpers + normalize all stored-layout reads in `app.js`

**Files:**
- Modify: `app.js` at lines ~239, ~1337, ~1428, ~1609, ~1764

**Interfaces:**
- Produces:
  - `normalizeLayout(v: string): string` — `'horizontal'`→`'h6x1'`, `'vertical'`→`'v1x6'`, else passthrough
  - `isHoriz(layout: string): boolean` — `layout.startsWith('h')`
  - `LAYOUT_DIMS: { [k: string]: string }` — OBS hint dimension per layout value

- [ ] **Step 1: Insert helpers after the `FLOATING_POKEMON` constant (~line 239)**

Find:
```js
const FLOATING_POKEMON = new Set([
    'wingull','kyogre','swellow','vibrava','mantine','yanmega','yanma','tropius','regieleki',
]);
```

Insert immediately after:
```js
// ── Layout helpers ────────────────────────────────────────────────
function normalizeLayout(v) {
    if (v === 'horizontal') return 'h6x1';
    if (v === 'vertical')   return 'v1x6';
    return v;
}

function isHoriz(layout) {
    return layout.startsWith('h');
}

const LAYOUT_DIMS = {
    'h6x1': '1350x265',
    'h3x2': '675x530',
    'v1x6': '265x1350',
    'v2x3': '530x675',
};
```

- [ ] **Step 2: Normalize in `loadState` (~line 1337)**

Find:
```js
    if (raw.layout  !== undefined) document.getElementById('layout-select').value  = raw.layout;
```

Replace with:
```js
    if (raw.layout  !== undefined) document.getElementById('layout-select').value  = normalizeLayout(raw.layout);
```

- [ ] **Step 3: Normalize in `buildMigratedState` (~line 1764)**

Find:
```js
        layout:     localStorage.getItem('ptv_layout')   || 'horizontal',
```

Replace with:
```js
        layout:     normalizeLayout(localStorage.getItem('ptv_layout') || 'h6x1'),
```

- [ ] **Step 4: Normalize in preset load (~line 1609)**

Find:
```js
    if (preset.layout) document.getElementById('layout-select').value = preset.layout;
```

Replace with:
```js
    if (preset.layout) document.getElementById('layout-select').value = normalizeLayout(preset.layout);
```

- [ ] **Step 5: Update `updateObsHint` to use `LAYOUT_DIMS` (~line 1427–1428)**

Find:
```js
    const layout = document.getElementById('layout-select').value;
    const dims   = layout === 'horizontal' ? '1350x265' : '265x1350';
```

Replace with:
```js
    const layout = document.getElementById('layout-select').value;
    const dims   = LAYOUT_DIMS[layout] || '1350x265';
```

- [ ] **Step 6: Verify in browser**

- Select "Horizontal 3×2" → OBS hint area shows `675×530`.
- Select "Vertical 2×3" → OBS hint shows `530×675`.
- Open DevTools → Application → Local Storage → set `ptv_layout = 'horizontal'` → reload → Layout select shows "Horizontal 6×1", no JS errors.

- [ ] **Step 7: Commit**

```bash
git add app.js
git commit -m "feat(layout): add normalizeLayout/isHoriz helpers + LAYOUT_DIMS OBS hint map"
```

---

### Task 3: Update `updatePreview` and `buildOverlayHTML` in `app.js`

**Files:**
- Modify: `app.js` — `updatePreview` (~lines 1112–1142), `buildOverlayHTML` (~lines 895–954)

**Interfaces:**
- Consumes: `isHoriz(layout)` from Task 2
- `buildOverlayHTML(layout, showShadows, showBg, typo)` now accepts `'h6x1' | 'h3x2' | 'v1x6' | 'v2x3'`

- [ ] **Step 1: Rewrite `updatePreview`**

Find the entire function (from `function updatePreview()` to its closing `}`):
```js
function updatePreview() {
    const layout  = document.getElementById('layout-select').value;
    const msg     = document.getElementById('preview-msg');
    const wrapper = document.getElementById('preview-wrapper');

    msg.textContent   = layout === 'vertical' ? t('previewVertical') : '';
    msg.style.display = layout === 'vertical' ? '' : 'none';
    wrapper.style.display = '';

    const shadows    = document.getElementById('shadows-check').checked;
    const bg         = document.getElementById('bg-check').checked;
    const iframe     = document.getElementById('preview-iframe');
    const cardStyle  = getComputedStyle(wrapper.parentElement);
    const containerW = wrapper.parentElement.clientWidth
        - parseFloat(cardStyle.paddingLeft)
        - parseFloat(cardStyle.paddingRight);

    const nameH     = Math.max(typography.size, 25);
    const overlayH  = 175 + nameH + 10;
    const scale     = Math.max(containerW / 1350, 0.75);
    const wrapperW  = Math.min(Math.round(1350 * scale), containerW);
    const wrapperH  = Math.round(overlayH * scale);
    iframe.style.width     = '1350px';
    iframe.style.height    = overlayH + 'px';
    iframe.style.transform = `translate(-50%, -50%) scale(${scale})`;
    wrapper.style.width    = '';
    wrapper.style.height   = '';
    wrapper.style.margin   = '0';

    iframe.srcdoc = buildOverlayHTML('horizontal', shadows, bg, typography);
}
```

Replace with:
```js
function updatePreview() {
    const layout  = document.getElementById('layout-select').value;
    const msg     = document.getElementById('preview-msg');
    const wrapper = document.getElementById('preview-wrapper');
    const horiz   = isHoriz(layout);

    msg.textContent       = horiz ? '' : t('previewVertical');
    msg.style.display     = horiz ? 'none' : '';
    wrapper.style.display = horiz ? '' : 'none';

    if (!horiz) return;

    const shadows    = document.getElementById('shadows-check').checked;
    const bg         = document.getElementById('bg-check').checked;
    const iframe     = document.getElementById('preview-iframe');
    const cardStyle  = getComputedStyle(wrapper.parentElement);
    const containerW = wrapper.parentElement.clientWidth
        - parseFloat(cardStyle.paddingLeft)
        - parseFloat(cardStyle.paddingRight);

    const nameH    = Math.max(typography.size, 25);
    const overlayH = 175 + nameH + 10;
    const is3x2    = layout === 'h3x2';
    const iframeW  = is3x2 ? 675  : 1350;
    const iframeH  = is3x2 ? overlayH * 2 : overlayH;
    const scale    = Math.max(containerW / iframeW, 0.75);

    iframe.style.width     = iframeW + 'px';
    iframe.style.height    = iframeH + 'px';
    iframe.style.transform = `translate(-50%, -50%) scale(${scale})`;
    wrapper.style.width    = '';
    wrapper.style.height   = '';
    wrapper.style.margin   = '0';

    iframe.srcdoc = buildOverlayHTML(layout, shadows, bg, typography);
}
```

- [ ] **Step 2: Update the layout discriminants at the top of `buildOverlayHTML` (~line 895)**

Find:
```js
    const isHorizontal = layout === 'horizontal';
```

Replace with:
```js
    const is3x2 = layout === 'h3x2';
    const is2x3 = layout === 'v2x3';
```

- [ ] **Step 3: Update the branch condition (~line 914)**

Find:
```js
    if (isHorizontal) {
```

Replace with:
```js
    if (isHoriz(layout)) {
```

- [ ] **Step 4: Update `.container` CSS in the horizontal branch (~line 930)**

Inside the horizontal branch template literal, find:
```js
.container{display:flex;flex-wrap:nowrap;}
```

Replace with:
```js
.container{display:flex;flex-wrap:${is3x2 ? 'wrap' : 'nowrap'};${is3x2 ? 'max-width:675px;' : ''}}
```

- [ ] **Step 5: Update `.wrapper` CSS in the vertical branch**

Inside the vertical (else) branch template literal (~line 963), find:
```js
.wrapper{display:flex;flex-direction:column;}
```

Replace with:
```js
.wrapper{display:flex;${is2x3 ? 'flex-wrap:wrap;width:450px;' : 'flex-direction:column;'}}
```

- [ ] **Step 6: Verify in browser**

Fill 6 Pokémon in the editor (e.g., pikachu, charizard, mewtwo, eevee, snorlax, gengar).

- Select "Horizontal 6×1" → preview shows 1 row of 6, ~1350px wide scaled to fit.
- Select "Horizontal 3×2" → preview shows 2 rows of 3, ~675px wide scaled to fit.
- Select "Vertical 1×6" → preview wrapper disappears, "live preview only available in horizontal mode" message appears.
- Select "Vertical 2×3" → same message, no iframe.
- Switch between h6x1 and h3x2 several times rapidly — no layout glitches, iframe updates correctly each time.

- [ ] **Step 7: Commit**

```bash
git add app.js
git commit -m "feat(layout): update updatePreview + buildOverlayHTML for h3x2/v2x3"
```

---

### Task 4: Update `overlay.html` — CSS classes and JS renderer

**Files:**
- Modify: `overlay.html` — `<style>` block (lines 7–50), `renderTeam` function (~lines 72–179)

**Interfaces:**
- Consumes: Ably `data.layout` which may be `'h6x1' | 'h3x2' | 'v1x6' | 'v2x3'` (new) or `'horizontal' | 'vertical'` (legacy cached)

- [ ] **Step 1: Replace the entire `<style>` block with 4-layout CSS**

Find everything between `<style>` and `</style>` (the entire block starting with `*{box-sizing:border-box;}` through the last animation delay line) and replace with:

```css
*{box-sizing:border-box;}
body,html{margin:0;padding:0;background:transparent;}

/* ── h6x1 / h3x2 shared rules ── */
body.layout-h6x1 .pkDiv,body.layout-h3x2 .pkDiv{flex:0 0 225px;width:225px;height:150px;position:relative;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;}
body.layout-h6x1 .pkDiv--float,body.layout-h3x2 .pkDiv--float{align-items:center;}
body.layout-h6x1 .shadowDiv,body.layout-h3x2 .shadowDiv{flex:0 0 225px;width:225px;height:40px;padding-top:5px;}
body.layout-h6x1 .sprite-row,body.layout-h3x2 .sprite-row{position:relative;z-index:1;}
body.layout-h6x1 .shadow-row,body.layout-h3x2 .shadow-row{margin-top:-15px;}
body.layout-h6x1 .nameDiv,body.layout-h3x2 .nameDiv{flex:0 0 225px;width:225px;}
body.layout-h6x1 img,body.layout-h3x2 img{width:100%;height:100%;object-fit:contain;object-position:bottom center;pointer-events:none;user-select:none;display:block;}
body.layout-h6x1 p,body.layout-h3x2 p{margin:0;height:35px;line-height:35px;text-align:center;}
body.layout-h6x1 .name-above-row,body.layout-h3x2 .name-above-row{padding-top:10px;}

/* ── h6x1 specific ── */
body.layout-h6x1 .container{display:flex;flex-wrap:nowrap;}

/* ── h3x2 specific ── */
body.layout-h3x2 .container{display:flex;flex-wrap:wrap;max-width:675px;}

/* ── v1x6 / v2x3 shared rules ── */
body.layout-v1x6 .pair,body.layout-v2x3 .pair{display:flex;flex-direction:column;margin:0;padding:0;margin-bottom:20px;width:225px;align-items:center;}
body.layout-v1x6 .pkDiv,body.layout-v2x3 .pkDiv{width:225px;position:relative;}
body.layout-v1x6 .shadowDiv,body.layout-v2x3 .shadowDiv{width:150px;margin-top:-15px;min-height:20px;}
body.layout-v1x6 img,body.layout-v2x3 img{display:block;width:100%;height:auto;max-height:150px;object-fit:contain;object-position:bottom center;pointer-events:none;user-select:none;}
body.layout-v1x6 p,body.layout-v2x3 p{margin:0 0 6px;padding:0;height:auto;line-height:1.2;text-align:center;}

/* ── v1x6 specific ── */
body.layout-v1x6 .wrapper{display:flex;flex-direction:column;}

/* ── v2x3 specific ── */
body.layout-v2x3 .wrapper{display:flex;flex-wrap:wrap;width:450px;}

/* ── Animations ── */
@keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}

body.layout-h6x1 .pkDiv,body.layout-h6x1 .shadowDiv,
body.layout-h3x2 .pkDiv,body.layout-h3x2 .shadowDiv{animation:fadeSlideUp 0.45s ease forwards;opacity:0;}
body.layout-h6x1 .pkDiv:nth-child(1),body.layout-h6x1 .shadowDiv:nth-child(1),
body.layout-h3x2 .pkDiv:nth-child(1),body.layout-h3x2 .shadowDiv:nth-child(1){animation-delay:0.00s;}
body.layout-h6x1 .pkDiv:nth-child(2),body.layout-h6x1 .shadowDiv:nth-child(2),
body.layout-h3x2 .pkDiv:nth-child(2),body.layout-h3x2 .shadowDiv:nth-child(2){animation-delay:0.12s;}
body.layout-h6x1 .pkDiv:nth-child(3),body.layout-h6x1 .shadowDiv:nth-child(3),
body.layout-h3x2 .pkDiv:nth-child(3),body.layout-h3x2 .shadowDiv:nth-child(3){animation-delay:0.24s;}
body.layout-h6x1 .pkDiv:nth-child(4),body.layout-h6x1 .shadowDiv:nth-child(4),
body.layout-h3x2 .pkDiv:nth-child(4),body.layout-h3x2 .shadowDiv:nth-child(4){animation-delay:0.36s;}
body.layout-h6x1 .pkDiv:nth-child(5),body.layout-h6x1 .shadowDiv:nth-child(5),
body.layout-h3x2 .pkDiv:nth-child(5),body.layout-h3x2 .shadowDiv:nth-child(5){animation-delay:0.48s;}
body.layout-h6x1 .pkDiv:nth-child(6),body.layout-h6x1 .shadowDiv:nth-child(6),
body.layout-h3x2 .pkDiv:nth-child(6),body.layout-h3x2 .shadowDiv:nth-child(6){animation-delay:0.60s;}

body.layout-v1x6 .pair,body.layout-v2x3 .pair{animation:fadeSlideUp 0.45s ease forwards;opacity:0;}
body.layout-v1x6 .pair:nth-child(1),body.layout-v2x3 .pair:nth-child(1){animation-delay:0.00s;}
body.layout-v1x6 .pair:nth-child(2),body.layout-v2x3 .pair:nth-child(2){animation-delay:0.12s;}
body.layout-v1x6 .pair:nth-child(3),body.layout-v2x3 .pair:nth-child(3){animation-delay:0.24s;}
body.layout-v1x6 .pair:nth-child(4),body.layout-v2x3 .pair:nth-child(4){animation-delay:0.36s;}
body.layout-v1x6 .pair:nth-child(5),body.layout-v2x3 .pair:nth-child(5){animation-delay:0.48s;}
body.layout-v1x6 .pair:nth-child(6),body.layout-v2x3 .pair:nth-child(6){animation-delay:0.60s;}
```

- [ ] **Step 2: Add `normalizeLayout` and `isHoriz` at the top of the IIFE in `overlay.html`**

Find:
```js
(function () {
    var SHADOW_URL   = 'https://i.postimg.cc/xdmpF4Tm/Shadow.png';
    var POKEBALL_URL = 'https://i.postimg.cc/0QdW9KS2/Pokeball-Background.png';
```

Replace with:
```js
(function () {
    var SHADOW_URL   = 'https://i.postimg.cc/xdmpF4Tm/Shadow.png';
    var POKEBALL_URL = 'https://i.postimg.cc/0QdW9KS2/Pokeball-Background.png';

    function normalizeLayout(v) {
        if (v === 'horizontal') return 'h6x1';
        if (v === 'vertical')   return 'v1x6';
        return v;
    }

    function isHoriz(layout) {
        return layout.startsWith('h');
    }
```

- [ ] **Step 3: Normalize layout in `renderTeam`**

Find:
```js
        var layout  = data.layout  || 'horizontal';
```

Replace with:
```js
        var layout  = normalizeLayout(data.layout  || 'h6x1');
```

- [ ] **Step 4: Update the vertical branch check in `renderTeam`**

Find:
```js
        if (layout === 'vertical') {
```

Replace with:
```js
        if (!isHoriz(layout)) {
```

The v2x3 wrapper width is handled entirely by CSS (`body.layout-v2x3 .wrapper { flex-wrap:wrap; width:450px }`). The JS renderer creates the same `.pair` elements for both v1x6 and v2x3 — no JS changes needed inside the vertical branch.

- [ ] **Step 5: Verify with a live publish test**

Open the editor and OBS overlay side by side (overlay.html?id=<your-channel-id>):

- Select "Horizontal 3×2", publish → overlay shows 3 cols × 2 rows with fadeSlideUp animation.
- Select "Horizontal 6×1", publish → overlay shows 1 row of 6.
- Select "Vertical 2×3", publish → overlay shows 2 cols × 3 rows.
- Select "Vertical 1×6", publish → overlay shows single column.
- Open a new tab with the overlay URL directly (simulates cached Ably state with old value) — confirm it falls back gracefully to h6x1 if the last published layout was 'horizontal'.

- [ ] **Step 6: Commit**

```bash
git add overlay.html
git commit -m "feat(layout): update overlay CSS/JS for h6x1/h3x2/v1x6/v2x3 layout classes"
```
