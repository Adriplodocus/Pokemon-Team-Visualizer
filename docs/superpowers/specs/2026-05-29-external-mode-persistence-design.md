# External Mode Persistence Across Navigation

**Date:** 2026-05-29  
**Status:** Approved

## Problem

When a mod opens `index.html?id=<uuid>` (external mode) and navigates to `cemetery.html` or `badges.html` via the header tabs, the `?id=` URL param is lost. Those pages fall back to the mod's own localStorage channel IDs instead of the streamer's.

Additionally, there is no visible persistent indicator that the mod is editing an external overlay — the per-section pink banner is only visible within its own editor section.

## Solution

Two changes:

1. **sessionStorage persistence** — When external mode is detected from the URL, store the channel IDs in `sessionStorage`. Subsequent pages check sessionStorage on init if no URL param is present. `sessionStorage` lives for the duration of the browser tab, so it survives header-link navigation but is cleaned up when the tab closes.

2. **Header-level external mode bar** — `header.js` reads sessionStorage on load and injects a persistent pink bar into the header when external mode is active. The bar shows the short channel ID and a "Salir" exit button that clears sessionStorage and redirects to `index.html`.

## sessionStorage Keys

| Key | Value | Set by |
|---|---|---|
| `ptv_external_id` | UUID (main channel) | `app.js` or `cemetery.js` when `?id=` is in URL |
| `ptv_external_badge_id` | UUID (badge channel) | `badges.js` when `?id=` is in URL on `badges.html`; also written by `app.js`/`cemetery.js` when `?bid=` is in URL |

## URL Format Change

`copyEditorUrl()` in `app.js` and `cemetery.js` now generates a URL with both channel IDs:

```
https://pokemon.mrklypp.com/index.html?id=<main-uuid>&bid=<badge-uuid>
```

This lets a mod arrive at a single URL and navigate all three editors in external mode. `copyBadgeEditorUrl()` in `badges.js` is unchanged (`badges.html?id=<badge-uuid>` — badges-only entry point).

## Init Logic Changes

### app.js `initChannelId()`

```
1. Read ?id= from URL
   → if present: externalMode=true, channelId=urlId
                 sessionStorage.setItem('ptv_external_id', urlId)
                 if ?bid= present: sessionStorage.setItem('ptv_external_badge_id', bidId)
2. Else read sessionStorage.getItem('ptv_external_id')
   → if present: externalMode=true, channelId=stored
3. Else: read/generate from localStorage (existing behavior)
```

### cemetery.js `initChannelId()`

Same as app.js — reads `?id=` then sessionStorage `ptv_external_id`, falls back to localStorage.  
No `?bid=` handling needed here (app.js writes it; cemetery shares the main channel ID only).

### badges.js `initBadges()` (on badges.html only)

```
1. Read ?id= from URL
   → if present: badgeExternalMode=true, badgeChannelId=urlId
                 sessionStorage.setItem('ptv_external_badge_id', urlId)
2. Else read sessionStorage.getItem('ptv_external_badge_id')
   → if present: badgeExternalMode=true, badgeChannelId=stored
3. Else: read/generate from localStorage (existing behavior)
```

On index.html / cemetery.html (non-badges ACTIVE_PAGE): same change — check sessionStorage before falling back to localStorage.

## Header Bar

`header.js` is an IIFE that runs before page scripts. It injects into `document.body`. After the existing header HTML, it checks sessionStorage and conditionally renders the external mode bar.

```html
<div id="external-mode-bar" class="external-mode-bar">
  <span>Controlando canal externo · <code>abc12345</code></span>
  <button onclick="exitExternalMode()">✕ Salir</button>
</div>
```

The bar is only rendered if `ptv_external_id` or `ptv_external_badge_id` is present in sessionStorage at the time header.js runs. `exitExternalMode()` is defined in header.js:

```js
function exitExternalMode() {
    sessionStorage.removeItem('ptv_external_id');
    sessionStorage.removeItem('ptv_external_badge_id');
    window.location.href = 'index.html';
}
```

The short ID shown in the bar is the main channel ID (first 8 chars of `ptv_external_id`) or, if only badge external is active, the badge channel (first 8 chars of `ptv_external_badge_id`).

## Style

The header bar reuses `.external-banner` visual language (pink, same font/weight) but styled as a full-width bar inside the header, between the subtitle and the nav tabs. New CSS class `.external-mode-bar`.

## Affected Files

- `header.js` — add external bar HTML + `exitExternalMode()`
- `style.css` — add `.external-mode-bar` styles
- `app.js` — `initChannelId()` uses sessionStorage; `copyEditorUrl()` includes `&bid=`
- `cemetery.js` — `initChannelId()` uses sessionStorage; `copyEditorUrl()` includes `&bid=`
- `badges.js` — `initBadges()` uses sessionStorage for `ptv_external_badge_id`

## Out of Scope

- Syncing the per-section `.external-banner` divs with sessionStorage (they remain URL-param-only — can be addressed separately)
- Cross-tab external mode persistence (sessionStorage is tab-scoped by design)
- Entry from `badges.html?id=<badge>` carrying over to pokemon/cemetery (badge-only entry can't know the main channel ID)
