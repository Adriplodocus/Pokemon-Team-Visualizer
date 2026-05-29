# Ably State Hydration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On every editor page load, silently fetch the last published overlay state from Ably and overwrite the editor UI (and localStorage), so the editor always reflects what's live in OBS.

**Architecture:** Two-phase init — Phase 1 loads from localStorage instantly (no flash); Phase 2 calls `/api/load` async and overwrites state if data is found. The backend `/api/load` gains an `?event=` filter so pokemon and cemetery (which share a channel) can each fetch their own last message. Cemetery publish gains a `raw` field with names/motes/props. Badges publish gains a `game` field for full round-trip restore.

**Tech Stack:** Vanilla JS, Cloudflare Functions, Ably REST API. No build step, no test framework — verification is manual (browser + network tab).

---

### Task 1: /api/load — optional event filter

**Files:**
- Modify: `functions/api/load.js`

Cemetery and pokemon share channel `ptv-<channelId>`. Without filtering by event name, `/api/load` returns whichever was published last. Ably REST supports `?name=<event>` natively.

- [ ] **Step 1: Add event param to the Ably fetch URL**

Replace the existing `onRequestGet` function in `functions/api/load.js`:

```js
export async function onRequestGet(context) {
    if (!context.env.ABLY_API_KEY) return json({ error: 'Not configured' }, 503);

    const url    = new URL(context.request.url);
    const id     = url.searchParams.get('id');
    const event  = url.searchParams.get('event');

    if (!id || !/^[0-9a-f-]{36}$/.test(id)) return json({ error: 'Invalid id' }, 400);
    if (event && !/^[a-z-]+$/.test(event))   return json({ error: 'Invalid event' }, 400);

    try {
        const ablyUrl = new URL(`https://rest.ably.io/channels/ptv-${id}/messages`);
        ablyUrl.searchParams.set('limit', '1');
        if (event) ablyUrl.searchParams.set('name', event);

        const resp = await fetch(ablyUrl.toString(), {
            headers: { 'Authorization': 'Basic ' + btoa(context.env.ABLY_API_KEY) }
        });
        if (!resp.ok) return json({ error: 'Ably error' }, 502);

        const messages = await resp.json();
        if (!messages || !messages.length) return json({ error: 'No team found' }, 404);

        const data = JSON.parse(messages[0].data);
        return json(data);
    } catch (e) {
        return json({ error: e.message }, 500);
    }
}

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
```

- [ ] **Step 2: Verify (manual)**

With `wrangler pages dev . --binding ABLY_API_KEY=<key>`, or after deploy:
- `GET /api/load?id=<uuid>&event=update` → returns pokemon state (or 404 if never published)
- `GET /api/load?id=<uuid>&event=cemetery-update` → returns cemetery state
- `GET /api/load?id=<uuid>` → returns last message regardless of name (unchanged behavior)
- `GET /api/load?id=<uuid>&event=invalid!` → returns `{ error: 'Invalid event' }` 400

- [ ] **Step 3: Commit**

```bash
git add functions/api/load.js
git commit -m "feat(api): add optional event filter to /api/load"
```

---

### Task 2: cemetery.js — add raw to publishCemetery()

**Files:**
- Modify: `cemetery.js` (function `publishCemetery`, line ~399)

Without `raw`, `/api/load?event=cemetery-update` returns only sprite URLs — not enough to repopulate the editor.

- [ ] **Step 1: Add raw field to the publish payload**

In `publishCemetery()` (line ~411-415), find the `JSON.stringify({...})` call and add `raw`:

```js
body: JSON.stringify({
    id:      channelId,
    event:   'cemetery-update',
    pokemon: entries,
    cols:    CEMETERY_COLS,
    rows:    CEMETERY_ROWS,
    raw:     cemetery.map(e => ({ name: e.name, mote: e.mote, props: { ...e.props } })),
}),
```

- [ ] **Step 2: Verify (manual)**

Open `cemetery.html`, add 2 pokémon, click Publish. In DevTools Network tab, inspect the POST `/api/publish` request body — confirm `raw` array is present with `{name, mote, props}` for each entry.

- [ ] **Step 3: Commit**

```bash
git add cemetery.js
git commit -m "feat(cemetery): include raw names in publish payload"
```

---

### Task 3: badges.js — add game to publishBadgesToObs()

**Files:**
- Modify: `badges.js` (function `publishBadgesToObs`, line ~390)

Without `game`, hydration can restore the region but not which specific game was selected in the dropdown.

- [ ] **Step 1: Add game field to the publish payload**

In `publishBadgesToObs()` (line ~395-401), add `game: badgeGame`:

```js
body: JSON.stringify({
    id:         badgeChannelId,
    region:     badgeRegion,
    game:       badgeGame,
    layout:     badgeLayout,
    active:     badgeActive,
    brightness: badgeBrightness,
}),
```

- [ ] **Step 2: Verify (manual)**

Open `badges.html`, pick a game, publish. In DevTools Network, confirm POST body includes `game: "pokemon-rojo"` (or whichever was selected).

- [ ] **Step 3: Commit**

```bash
git add badges.js
git commit -m "feat(badges): include game in publish payload"
```

---

### Task 4: app.js — hydrateFromAbly()

**Files:**
- Modify: `app.js`

Adds async hydration: fetches last pokemon state from Ably after localStorage loads. Ably always wins. Does not write to localStorage in external mode.

- [ ] **Step 1: Add hydrateFromAbly() after loadState() function (after line ~729)**

```js
async function hydrateFromAbly() {
    try {
        const resp = await fetch(`/api/load?id=${channelId}&event=update`);
        if (!resp.ok) return;
        const data = await resp.json();
        if (!data.raw || !Array.isArray(data.raw.team)) return;

        data.raw.team.forEach((slot, i) => {
            if (i >= 6) return;
            team[i] = {
                name:       slot.name || '',
                mote:       slot.mote || '',
                properties: { ...DEFAULT_PROPS, ...(slot.properties || {}) },
            };
            const row = document.querySelector(`.pokemon-row[data-index="${i}"]`);
            if (!row) return;
            row.querySelector('.name-input').value = team[i].name;
            row.querySelector('.mote-input').value = team[i].mote;
            refreshIcons(i);
            refreshSprite(i);
        });

        if (data.raw.layout) document.getElementById('layout-select').value = data.raw.layout;
        if (data.raw.shadows !== undefined) document.getElementById('shadows-check').checked = data.raw.shadows;
        if (data.raw.bg      !== undefined) document.getElementById('bg-check').checked      = data.raw.bg;

        if (!externalMode) {
            localStorage.setItem('ptv_team', JSON.stringify(team));
            if (data.raw.layout  !== undefined) localStorage.setItem('ptv_layout',  data.raw.layout);
            if (data.raw.shadows !== undefined) localStorage.setItem('ptv_shadows', String(data.raw.shadows));
            if (data.raw.bg      !== undefined) localStorage.setItem('ptv_bg',      String(data.raw.bg));
        }

        updatePreview();
        updateObsHint();
    } catch (_) {}
}
```

- [ ] **Step 2: Call hydrateFromAbly() at the end of the init block**

At the bottom of `app.js` (after `initCookieNotice()`, line ~980), add:

```js
hydrateFromAbly();
```

Result:
```js
initChannelId();
buildRows();
loadState();
setLang(currentLang);
updatePreview();
initCookieNotice();
hydrateFromAbly();
```

- [ ] **Step 3: Verify normal mode**

1. Open `index.html`, publish a team (e.g. pikachu, bulbasaur).
2. Clear localStorage manually: DevTools → Application → localStorage → delete `ptv_team`.
3. Reload the page.
4. Expected: editor repopulates with pikachu + bulbasaur (from Ably).
5. Check localStorage after load: `ptv_team` is written back.

- [ ] **Step 4: Verify external mode**

1. Open `index.html?id=<uuid-with-published-team>`.
2. Expected: editor shows the team from Ably.
3. Check localStorage: `ptv_team` is NOT overwritten (mod's own data preserved).

- [ ] **Step 5: Verify fallback**

1. Open `index.html` with a channelId that has never published.
2. Expected: editor shows localStorage state (or empty), no error shown.

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "feat(app): hydrate editor state from Ably on load"
```

---

### Task 5: cemetery.js — hydrateFromAbly()

**Files:**
- Modify: `cemetery.js`

Adds async hydration using the `raw` field added in Task 2.

- [ ] **Step 1: Add hydrateFromAbly() after loadCemetery() function (after line ~130)**

```js
async function hydrateFromAbly() {
    try {
        const resp = await fetch(`/api/load?id=${channelId}&event=cemetery-update`);
        if (!resp.ok) return;
        const data = await resp.json();
        if (!Array.isArray(data.raw)) return;

        cemetery = data.raw.map(e => ({
            name:  e.name || '',
            mote:  e.mote || '',
            props: { ...DEFAULT_PROPS, ...(e.props || {}) },
        }));

        if (!externalMode) saveCemetery();
        renderCemetery();
    } catch (_) {}
}
```

- [ ] **Step 2: Call hydrateFromAbly() at the end of the init block**

At the bottom of `cemetery.js` (after `updateCemeteryObsHint()`, line ~479), add:

```js
hydrateFromAbly();
```

Result:
```js
initChannelId();
loadCemetery();
renderCemetery();
updateObsUrl();
updateCemeteryObsHint();
hydrateFromAbly();
```

- [ ] **Step 3: Verify normal mode**

1. Open `cemetery.html`, add 3 pokémon, publish.
2. Delete `ptv_cemetery` from localStorage.
3. Reload. Expected: 3 pokémon repopulate from Ably.
4. Check localStorage: `ptv_cemetery` written back.

- [ ] **Step 4: Verify fallback**

Open `cemetery.html` with a channel that has never published cemetery data. Expected: localStorage state (or empty), no error.

- [ ] **Step 5: Commit**

```bash
git add cemetery.js
git commit -m "feat(cemetery): hydrate editor state from Ably on load"
```

---

### Task 6: badges.js — hydrateFromAbly()

**Files:**
- Modify: `badges.js`

Adds async hydration using `region`, `game`, `layout`, `active`, `brightness` fields (including `game` added in Task 3).

- [ ] **Step 1: Add hydrateFromAbly() after loadBadgeState() function (after line ~459)**

```js
async function hydrateFromAbly() {
    try {
        const resp = await fetch(`/api/load?id=${badgeChannelId}`);
        if (!resp.ok) return;
        const data = await resp.json();

        if (data.game && GAME_TO_REGION[data.game]) {
            badgeGame   = data.game;
            badgeRegion = GAME_TO_REGION[data.game];
        } else if (data.region && REGION_DATA[data.region]) {
            badgeRegion = data.region;
        }

        const count = REGION_DATA[badgeRegion].count;

        if (data.layout) {
            const layouts = getLayouts(count);
            if (layouts.some(l => l.value === data.layout)) badgeLayout = data.layout;
        }
        if (Array.isArray(data.active) && data.active.length === count) {
            badgeActive = data.active.map(Boolean);
        }
        if (data.brightness !== undefined) {
            badgeBrightness = Math.min(100, Math.max(0, Number(data.brightness)));
        }

        if (!badgeExternalMode) saveBadgeState();

        buildBadgeGameSelect();
        buildBadgeLayoutSelect();
        buildBadgeCheckboxes();
        document.getElementById('badge-brightness').value           = badgeBrightness;
        document.getElementById('badge-brightness-val').textContent = badgeBrightness + '%';
        updateBadgeObsHint();
        updateBadgePreview();
    } catch (_) {}
}
```

- [ ] **Step 2: Call hydrateFromAbly() at the end of initBadges()**

In `initBadges()` (currently ends at line ~502), add `hydrateFromAbly()` as the last call:

```js
    if (typeof setMode === 'function') setMode('pokemon');
    updateBadgePreview();
    hydrateFromAbly();
}
```

- [ ] **Step 3: Verify normal mode**

1. Open `badges.html`, pick Johto, toggle 4 badges on, brightness 60%, publish.
2. Clear badge localStorage keys: `ptv_badge_game`, `ptv_badge_layout`, `ptv_badge_active`, `ptv_badge_brightness`.
3. Reload. Expected: Johto selected, same 4 badges active, brightness 60%.
4. Check localStorage: keys written back.

- [ ] **Step 4: Verify external mode**

1. Open `badges.html?id=<uuid-with-published-badges>`.
2. Expected: shows published badge state.
3. Check localStorage: badge keys NOT overwritten.

- [ ] **Step 5: Verify no bleed on index.html**

1. Open `index.html` (no param).
2. Switch to badges mode.
3. Expected: badges section hydrates from the badge channel (same as opening `badges.html` normally). No errors in console.

- [ ] **Step 6: Commit**

```bash
git add badges.js
git commit -m "feat(badges): hydrate editor state from Ably on load"
```

---

## Post-implementation smoke test

1. Publish a full team from `index.html`.
2. Open `index.html` in a different browser (no localStorage). Expected: team loads from Ably.
3. Publish a cemetery from `cemetery.html`.
4. Open `cemetery.html` in a different browser. Expected: cemetery loads.
5. Publish badges from `badges.html`.
6. Open `badges.html` in a different browser. Expected: badges load.
7. Open `index.html?id=<uuid>` (external mode). Expected: team shows but localStorage NOT written.
