# Ably State Hydration on Editor Load

**Date:** 2026-05-29  
**Status:** Approved

## Problem

When a streamer or mod refreshes the editor, the UI shows the localStorage state — not the live overlay state. If a mod published changes (or anyone on another device), the editor doesn't reflect them until the user manually republishes.

## Solution

On editor init, after loading from localStorage (instant UI), fetch the last published state from Ably in the background. If Ably returns data, overwrite the editor state and sync localStorage. Net effect: Ably is always the source of truth on page load; localStorage is a cache.

## Architecture

### Two-phase init (all three editors)

```
Phase 1 (sync, instant):  loadState() from localStorage → UI visible immediately
Phase 2 (async):          fetch /api/load → if data → overwrite state + re-render + save to localStorage
                          if 404 / network error → keep localStorage state, no change
```

This avoids a blank flash: the user sees their saved state immediately, then Ably silently overwrites it if newer data exists.

### Backend: /api/load event filter

`functions/api/load.js` currently fetches the latest message regardless of event name. Problem: pokemon and cemetery share the same Ably channel (`ptv-<channelId>`). The last message might be a cemetery update when loading the pokemon editor (or vice versa).

Fix: accept optional `?event=<name>` query param and pass it to Ably's `name=` filter:

```
GET /api/load?id=<uuid>&event=update          → last pokemon state
GET /api/load?id=<uuid>&event=cemetery-update → last cemetery state
GET /api/load?id=<uuid>                       → last message (badges uses own channel)
```

Ably REST API natively supports `?name=<event>` for filtering by message name — no extra logic needed.

### Cemetery publish: add `raw` field

Currently `publishCemetery()` only sends rendered URLs (no names). Add:

```js
raw: cemetery.map(e => ({ name: e.name, mote: e.mote, props: { ...e.props } }))
```

This mirrors the pattern already in `app.js` (`publishToObs` sends `raw.team`).

### Data mapping: Ably response → editor state

| Editor | Ably fields used | Editor state updated |
|---|---|---|
| `app.js` | `raw.team [{name, mote, properties}]`, `raw.layout`, `raw.shadows`, `raw.bg` | `team[]` array, layout `<select>`, shadow/bg checkboxes, re-render rows, update preview |
| `cemetery.js` | `raw [{name, mote, props}]` | `cemetery[]` array, re-render list |
| `badges.js` | `region`, `layout`, `active`, `brightness` | badge state vars, rebuild UI controls |

### Error handling

All three editors wrap the Ably fetch in try/catch:
- HTTP 404 ("No team found") → silent fallback, keep localStorage
- Network error / 5xx → silent fallback, keep localStorage
- Malformed data → silent fallback, keep localStorage

No error is shown to the user for a failed hydration — the editor simply loads what it had locally.

## Affected files

- `functions/api/load.js` — accept `?event=` param, pass to Ably `name=` filter
- `cemetery.js` — add `raw` to `publishCemetery()` payload; add `hydrateFromAbly()` async function called after init
- `app.js` — add `hydrateFromAbly()` async function called after init
- `badges.js` — add `hydrateFromAbly()` async function called after init

## Out of scope

- Real-time sync (live updates while editor is open) — would require Ably subscription in editor, separate feature
- Conflict resolution UI — Ably always wins, no prompt
- Showing "loaded from live" indicator — silent hydration
