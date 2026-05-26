# Design: Badges standalone page

**Date:** 2026-05-26  
**Status:** Approved

## Goal

Extract the Badges section from `index.html` into an independent `badges.html` page so it can be opened in separate browser tabs. The Pokémon mode button in both pages navigates to the other page; middle-click opens a new tab via native browser `<a>` behavior.

## Files changed

| File | Action |
|---|---|
| `lang.js` | New — shared `currentLang` global + `setLangBase()` |
| `app.js` | Modify — remove `currentLang` init; absorb `setMode()` from badges.js; update `setLang` to call `setLangBase` |
| `badges.js` | Modify — remove `setMode()` definition; guard its call in `initBadges()` |
| `index.html` | Modify — load `lang.js` before `app.js`; mode buttons become `<a>` links |
| `badges.html` | New — standalone page |

## `lang.js`

```js
let currentLang = localStorage.getItem('ptv_lang') || 'es';

function setLangBase(lang) {
    currentLang = lang;
    localStorage.setItem('ptv_lang', lang);
}
```

No DOM access. Safe to load on any page before any other script.

## `app.js` changes

1. Remove `let currentLang = localStorage.getItem('ptv_lang') || 'es';` (line ~111) — now in `lang.js`.
2. In `setLang(lang)`, prepend `setLangBase(lang);` and remove the manual `currentLang = lang; localStorage.setItem(...)` lines.
3. Move `setMode(mode)` here from `badges.js` — it belongs in `app.js` since it controls `index.html` DOM elements (`#section-pokemon`, `#section-badges`, mode buttons).

## `badges.js` changes

1. Remove `setMode(mode)` function definition (moved to `app.js`).
2. In `initBadges()`, guard the `setMode` call:
   ```js
   if (typeof setMode === 'function') setMode(savedMode);
   ```
   In `badges.html`, `setMode` is undefined so this is skipped — badges are always visible there. In `index.html`, `app.js` defines it and it runs as before.

## `index.html` changes

1. Add `<script src="lang.js"></script>` before `<script src="app.js"></script>`.
2. Replace mode toggle buttons with `<a>` tags styled identically:
   ```html
   <a href="index.html" id="mode-btn-pokemon" class="mode-btn active" data-i18n-badge="pokemonMode">Pokémon</a>
   <a href="badges.html" id="mode-btn-badges" class="mode-btn" data-i18n-badge="badgeMode">Medallas</a>
   ```
   Active state: `mode-btn-pokemon` gets `active` class (always, since this is the Pokémon page).  
   Middle-click on "Medallas" opens `badges.html` in a new tab — native behavior, zero JS.

3. Remove `onclick="setMode('pokemon')"` and `onclick="setMode('badges')"` from those elements.
4. `setMode` is still called internally by `initBadges()` (via `app.js`) to restore the last-used section on page load — this still works because `setMode` is now in `app.js`.

## `badges.html`

New file. Structure mirrors `index.html` minus the Pokémon section and modal:

```
<head>
  lang.js
  style.css
  (no pokemon-catalog.js, no app.js)
</head>
<body>
  <header>  (identical to index.html header)
    mode toggle:
      <a href="index.html" class="mode-btn">Pokémon</a>
      <a href="badges.html" class="mode-btn active">Medallas</a>
    lang toggle: ES / EN buttons (call setLang)
  </header>
  <div id="app">
    #section-badges content (from index.html lines 87–135)
    .social card (same as index.html)
  </div>
  <script src="lang.js"></script>   (already in <head>, but listed for clarity)
  <script src="badges.js"></script>
  <script>
    // Page-local setLang: updates lang var + re-applies badge strings
    function setLang(lang) {
      setLangBase(lang);
      applyBadgeLang();
      document.getElementById('lang-es').classList.toggle('active', lang === 'es');
      document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    }
  </script>
</body>
```

`badges.html` does NOT need `#section-pokemon`, `#section-badges` wrapper (content is always visible), the modal, `app.js`, or `pokemon-catalog.js`.

The `initBadges()` call at the bottom of `badges.js` runs on load and initialises everything. The `setMode` guard means the missing `setMode` is silently skipped.

## Navigation behavior

| From | Button | Action |
|---|---|---|
| `index.html` | Medallas | Navigate to `badges.html` (same window) |
| `index.html` | Medallas (middle-click) | Open `badges.html` in new tab |
| `badges.html` | Pokémon | Navigate to `index.html` (same window) |
| `badges.html` | Pokémon (middle-click) | Open `index.html` in new tab |

## Out of scope

- No URL routing, no SPA behavior.
- `ptv_mode` in localStorage is no longer used for top-level navigation (pages are separate files). It is still used internally by `setMode` in `index.html` to toggle sub-sections if needed, but can be cleaned up in a future pass.
