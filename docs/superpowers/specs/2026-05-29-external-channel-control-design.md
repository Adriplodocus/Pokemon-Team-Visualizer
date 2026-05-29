# External Channel Control via URL Param

**Date:** 2026-05-29  
**Status:** Approved

## Problem

Streamers want to let mods/editors publish updates to their OBS overlays (Pokémon team, cemetery, badges) without sharing access to their own browser/machine. Currently, the channel ID lives only in localStorage, so there is no way to hand control to someone else.

## Solution

Each editor page (`index.html`, `cemetery.html`, `badges.html`) reads an `?id=<uuid>` URL param on init. If present, that UUID is used as the active channel for the session instead of the one in localStorage. The localStorage value is never touched — the external ID is memory-only.

The streamer's UI gains a "Copy editor link" button next to each OBS URL, which generates the correct editor URL with `?id=<channelId>` pre-filled.

## Architecture

### URL param detection (per page)

In `initChannelId()` / `initBadges()`:

```js
const urlId = new URLSearchParams(location.search).get('id');
if (urlId) {
  channelId = urlId;          // session-only, no localStorage write
  setExternalMode(true);
} else {
  // existing localStorage logic unchanged
}
```

### External mode flag

Each JS module tracks a boolean `externalMode`. When true:
- "New channel" button is hidden/disabled
- OBS URL display shows the external ID (read-only, no copy-to-clipboard needed — the mod already has the URL)
- A banner is shown: **"Controlando canal externo · `<first-8-chars>`"**

### Shared channel ID

`app.js` (Pokémon) and `cemetery.js` share `ptv_channel_id` in localStorage. Both accept the same `?id=<uuid>` param, so a single UUID works for both pages. The mod gets two separate editor links (one per page) but they resolve to the same UUID.

`badges.js` uses `ptv_badge_channel_id` — separate UUID, separate editor link.

### "Copy editor link" buttons

Added next to the existing OBS URL section in each page:

| Page | Link generated |
|---|---|
| `index.html` | `https://pokemon.mrklypp.com/index.html?id=<channelId>` |
| `cemetery.html` | `https://pokemon.mrklypp.com/cemetery.html?id=<channelId>` |
| `badges.html` | `https://pokemon.mrklypp.com/badges.html?id=<channelId>` |

## Data flow

```
Streamer opens index.html (normal)
  └─ copies editor link: index.html?id=<uuid>
      └─ shares with mod
          └─ mod opens index.html?id=<uuid>
              └─ channelId = uuid (memory only)
              └─ mod publishes → Ably channel ptv-<uuid>
                  └─ overlay.html?id=<uuid> receives update
```

## Affected files

- `app.js` — `initChannelId()`, `updateObsHint()`, `copyOverlayUrl()`, add `copyEditorUrl()`
- `cemetery.js` — `initChannelId()`, `updateObsUrl()`, `copyObsUrl()`, add `copyEditorUrl()`
- `badges.js` — `initBadges()`, `updateBadgeObsHint()`, add `copyEditorUrl()`
- `index.html` — add "Copy editor link" button, external mode banner
- `cemetery.html` — same
- `badges.html` — same

## Out of scope

- Authentication / access control (anyone with the URL can publish — same as today)
- Persisting external mode across sessions
- Revoking access (streamer uses "New channel" on their own editor to rotate the UUID)
