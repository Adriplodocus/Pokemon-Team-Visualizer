# Team Layout Grid — Design Spec
**Date:** 2026-06-30

## Summary

Add sub-layout options within each orientation (horizontal / vertical) so users can arrange
their 6 Pokémon in a 6×1, 3×2, 1×6, or 2×3 grid.

---

## Layout Values

Single compound value encodes orientation + grid. Replaces the current `'horizontal'` / `'vertical'` strings everywhere.

| Value    | Grid  | Width  | Height (approx) | OBS hint   |
|----------|-------|--------|-----------------|------------|
| `h6x1`   | 6 × 1 | 1350px | 265px           | 1350×265   |
| `h3x2`   | 3 × 2 | 675px  | 530px           | 675×530    |
| `v1x6`   | 1 × 6 | 265px  | 1350px          | 265×1350   |
| `v2x3`   | 2 × 3 | 530px  | 675px           | 530×675    |

Back-compat: on any load (localStorage, server state blob, preset), map `'horizontal'` → `'h6x1'`
and `'vertical'` → `'v1x6'` before applying.

Helper: `isHoriz(layout)` returns true if `layout.startsWith('h')`.

---

## UI — `index.html`

Replace the two `<option>` elements in `#layout-select` with four:

```html
<option value="h6x1">Horizontal 6×1</option>
<option value="h3x2">Horizontal 3×2</option>
<option value="v1x6">Vertical 1×6</option>
<option value="v2x3">Vertical 2×3</option>
```

No label i18n needed — grid notation is universal. Remove `data-i18n="horizontal"` / `data-i18n="vertical"`.

---

## i18n / STRINGS

- Remove `horizontal` and `vertical` keys (no longer used as option labels).
- Keep `previewVertical` string (still used for the "no preview" message on vertical layouts).

---

## Preview — `updatePreview` (app.js)

| Layout | Behaviour |
|--------|-----------|
| `h6x1` | iframe: 1350 × overlayH. Scale: containerW / 1350. |
| `h3x2` | iframe: 675 × (overlayH × 2). Scale: containerW / 675. |
| `v1x6` | No iframe. Show `previewVertical` message. |
| `v2x3` | No iframe. Show `previewVertical` message. |

`overlayH = 175 + nameH + 10` (unchanged formula).

The existing `iframe.style.transform = translate(-50%,-50%) scale(…)` centering trick stays.

---

## OBS Hint — `updateObsHint` (app.js)

Replace binary `horizontal ? '1350x265' : '265x1350'` with a lookup:

```js
const LAYOUT_DIMS = { 'h6x1': '1350x265', 'h3x2': '675x530', 'v1x6': '265x1350', 'v2x3': '530x675' };
```

---

## HTML Generation — `buildOverlayHTML` (app.js)

Used only for the live preview iframe (`srcdoc`). Currently branches on `isHorizontal`.

New branches:

### `h6x1` (existing horizontal, no change needed)
`.container { display:flex; flex-wrap:nowrap; }`

### `h3x2` (new)
Same structure as `h6x1` but:
- `.container { display:flex; flex-wrap:wrap; max-width:675px; }`
- Renders all 6 slots; CSS wrapping creates 2 rows of 3 automatically.

### `v1x6` (existing vertical, no change needed)
`.wrapper { display:flex; flex-direction:column; }`

### `v2x3` (new)
Same structure as `v1x6` (`.pair` elements) but:
- `.wrapper { display:flex; flex-wrap:wrap; width:450px; }`
- Each `.pair { width:225px; }` — 2 pairs per row, 3 rows automatically.

---

## Overlay Renderer — `overlay.html`

`overlay.html` receives `layout` in the published JSON and applies `body.className = 'layout-' + layout`.

Add CSS for new classes:

```css
/* h3x2 — same as h6x1 but constrained to 3 cols */
body.layout-h3x2 .container { display:flex; flex-wrap:wrap; max-width:675px; }
/* (all other .pkDiv / .shadowDiv / etc rules inherited from layout-h6x1 or duplicated) */

/* v2x3 — same as v1x6 but 2 pairs per row */
body.layout-v2x3 .wrapper { display:flex; flex-wrap:wrap; width:450px; }
/* (pair / pkDiv / img rules same as v1x6) */
```

The JS render function currently checks `layout === 'vertical'`. Change to `!isHoriz(layout)`.

Apply `normalizeLayout` in `overlay.html` before `body.className = 'layout-' + layout` so overlays
that receive a cached `'horizontal'`/`'vertical'` value from Ably still render correctly.

All 4 CSS rule blocks needed (copy h6x1→h3x2 with the flex-wrap override,
copy v1x6→v2x3 with the wrap override). Animation nth-child delays work as-is
since `.pkDiv` / `.pair` nth-child indices are unchanged.

---

## State Persistence

`buildStateBlob`, `loadState`, presets, server state — all already use `document.getElementById('layout-select').value`.
Only change needed: add back-compat normalization in `loadState` (and anywhere else that
reads a stored layout string before applying it to the select).

```js
function normalizeLayout(v) {
    if (v === 'horizontal') return 'h6x1';
    if (v === 'vertical')   return 'v1x6';
    return v;
}
```

Call `normalizeLayout` before setting `#layout-select.value` in `loadState` and preset load.

---

## Files Changed

| File | Change |
|------|--------|
| `index.html` | 4 `<option>` values in `#layout-select` |
| `app.js` | `LAYOUT_DIMS` map, `normalizeLayout`, `updatePreview` sizing, `updateObsHint`, `buildOverlayHTML` h3x2 + v2x3 branches, `loadState` + preset normalization |
| `overlay.html` | CSS for `layout-h6x1` / `layout-h3x2` / `layout-v1x6` / `layout-v2x3`; JS `isHoriz` check |

No backend changes. Layout value flows through existing publish/state APIs as-is.

---

## Out of Scope

- Animations per-row stagger tuning (can be done separately)
- More than 4 layout options
