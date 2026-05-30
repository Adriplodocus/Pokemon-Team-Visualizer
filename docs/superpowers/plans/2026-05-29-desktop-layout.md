# Desktop Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 2-column desktop layout (≥900px) to the Pokémon and Medallas pages so the editor occupies the left column and the preview + actions occupy a sticky right column.

**Architecture:** Pure CSS grid added via a media query at ≥900px. Two new utility classes (`.desktop-layout`, `.desktop-col-right`) applied via wrapper `<div>`s in HTML. No JS changes. Mobile layout (`<900px`) unchanged.

**Tech Stack:** HTML, CSS (no build step — static site served with `npx serve .`)

---

## Files

| File | Change |
|------|--------|
| `style.css` | `#app` max-width 680→1120px; add `.desktop-layout` + `.desktop-col-right` media query |
| `index.html` | Wrapper divs in `#section-pokemon` and `#section-badges` |
| `badges.html` | Wrapper divs in main content |

---

### Task 1: CSS — widen app and add grid classes

**Files:**
- Modify: `style.css:96` (`#app` rule) and bottom of file (new media query)

- [ ] **Step 1: Verify current state**

Open `style.css`. Confirm line 96 reads:
```css
#app { width: 100%; max-width: 680px; }
```
And confirm there is no existing `.desktop-layout` rule anywhere in the file.

- [ ] **Step 2: Update `#app` max-width**

In `style.css`, change line 96:
```css
#app { width: 100%; max-width: 1120px; }
```

- [ ] **Step 3: Add desktop grid media query**

Append at the end of `style.css`, before the final blank line:

```css
/* ── Desktop layout ──────────────────────────────────────────── */
@media (min-width: 900px) {
  .desktop-layout {
    display: grid;
    grid-template-columns: 440px 1fr;
    gap: 20px;
    align-items: start;
  }
  .desktop-col-right {
    position: sticky;
    top: 20px;
  }
}
```

- [ ] **Step 4: Verify in browser**

Run: `npx serve .` and open `http://localhost:3000`.

At full-HD width: `#app` should span wider (no visible change yet since HTML wrappers aren't added). Check that the max-width is 1120px in DevTools → Elements → `#app` → Computed.

- [ ] **Step 5: Commit**

```bash
git add style.css
git commit -m "feat(layout): widen app to 1120px and add desktop grid classes"
```

---

### Task 2: index.html — 2-column layout for #section-pokemon

**Files:**
- Modify: `index.html` lines 23–68 (`#section-pokemon`)

- [ ] **Step 1: Verify current structure**

Open `index.html`. Confirm `#section-pokemon` contains exactly 5 direct child cards in this order:
1. `div.card.card--team` — team rows
2. `div.card.card--presets` — presets bar
3. `div.card` — settings row (layout, shadows, bg)
4. `div.card.card--preview#preview-card` — live preview iframe
5. `div.card.card--actions` — publish/reset buttons

- [ ] **Step 2: Add wrapper divs**

Replace the opening tag and card arrangement in `#section-pokemon`. The full section becomes:

```html
<div id="section-pokemon" class="desktop-layout">
<div class="desktop-col-left">

    <!-- Team -->
    <div class="card card--team">
        <div id="team-rows"></div>
    </div>

    <!-- Presets -->
    <div class="card card--presets">
        <div class="presets-bar" id="presets-bar"></div>
    </div>

    <!-- Settings -->
    <div class="card">
        <div class="settings-row">
            <label>
                <span data-i18n="layout"></span>
                <select id="layout-select">
                    <option value="horizontal" data-i18n="horizontal"></option>
                    <option value="vertical" data-i18n="vertical"></option>
                </select>
            </label>
            <label><input type="checkbox" id="shadows-check" checked> <span data-i18n="showShadows"></span></label>
            <label><input type="checkbox" id="bg-check" checked> <span data-i18n="showBg"></span></label>
        </div>
    </div>

</div><!-- /desktop-col-left -->
<div class="desktop-col-right">

    <!-- Live preview -->
    <div class="card card--preview" id="preview-card">
        <p id="preview-msg" style="display:none"></p>
        <div id="preview-wrapper">
            <iframe id="preview-iframe" scrolling="no" frameborder="0"></iframe>
        </div>
    </div>

    <!-- Actions -->
    <div class="card card--actions">
        <div class="actions">
            <p id="obs-hint" class="obs-hint"></p>
            <button class="btn-publish" onclick="publishToObs()" data-i18n="publishBtn"></button>
            <button class="btn-reset" onclick="resetAll()" data-i18n="resetBtn"></button>
            <div id="status"></div>
        </div>
    </div>

</div><!-- /desktop-col-right -->
</div><!-- /section-pokemon -->
```

- [ ] **Step 3: Verify in browser at desktop width**

Open `http://localhost:3000` at ≥900px viewport width.

Expected on the Pokémon tab:
- Team, Presets, Settings cards in left column (~440px wide)
- Preview iframe and Actualizar/Reset buttons in right column (remaining width)
- Right column stays fixed while scrolling (sticky)
- Autocomplete dropdown on name inputs still appears above other elements

- [ ] **Step 4: Verify mobile (resize to 600px)**

Resize browser to 600px width.

Expected: single-column layout, identical to before — Team card first, then Presets, Settings, Preview, Actions stacked vertically.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat(layout): 2-column desktop layout for pokemon section"
```

---

### Task 3: index.html — 2-column layout for #section-badges

**Files:**
- Modify: `index.html` lines 71–119 (`#section-badges`)

- [ ] **Step 1: Verify current structure**

Confirm `#section-badges` contains 5 direct child cards in this order:
1. `div.card` — settings (game select, layout select)
2. `div.card.card--team` — badge checkboxes
3. `div.card` — brightness slider
4. `div.card.card--preview` — badge preview iframe
5. `div.card.card--actions` — publish/reset buttons

- [ ] **Step 2: Add wrapper divs**

Replace the content of `#section-badges`. The full section becomes:

```html
<div id="section-badges" class="hidden desktop-layout">
<div class="desktop-col-left">

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
            <input type="range" id="badge-brightness" min="0" max="100" value="20"
                   oninput="updateBadgeBrightness(this.value)">
            <span id="badge-brightness-val">20%</span>
        </div>
    </div>

</div><!-- /desktop-col-left -->
<div class="desktop-col-right">

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

</div><!-- /desktop-col-right -->
</div><!-- /section-badges -->
```

- [ ] **Step 3: Verify in browser**

Navigate to the Medallas tab within `index.html` (if the tab is reachable via JS toggle on index.html). If the Medallas tab redirects to `badges.html`, skip to Task 4 verification.

Expected: same 2-column layout — checkboxes on the left, preview+actions on the right.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(layout): 2-column desktop layout for badges section in index.html"
```

---

### Task 4: badges.html — 2-column layout

**Files:**
- Modify: `badges.html` lines 15–65 (main content inside `#app`)

- [ ] **Step 1: Verify current structure**

Open `badges.html`. Confirm inside `<div id="app">` there are 5 direct child elements after the external-banner:
1. `div.card` — settings
2. `div.card.card--team` — badge checkboxes
3. `div.card` — brightness
4. `div.card.card--preview` — preview iframe
5. `div.card.card--actions` — actions

- [ ] **Step 2: Add wrapper divs**

Replace the content inside `<div id="app">` (keep `external-banner` outside the wrappers):

```html
<div id="app">
<div id="external-banner" class="external-banner hidden"></div>

<div class="desktop-layout">
<div class="desktop-col-left">

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
            <input type="range" id="badge-brightness" min="0" max="100" value="20"
                   oninput="updateBadgeBrightness(this.value)">
            <span id="badge-brightness-val">20%</span>
        </div>
    </div>

</div><!-- /desktop-col-left -->
<div class="desktop-col-right">

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

</div><!-- /desktop-col-right -->
</div><!-- /desktop-layout -->

</div>
```

- [ ] **Step 3: Verify in browser at desktop width**

Open `http://localhost:3000/badges.html` at ≥900px.

Expected:
- Settings + Checkboxes grid + Brightness slider in left column
- Preview iframe + Actualizar/Reset in right column, sticky
- Badge checkboxes grid fills the available left-column width

- [ ] **Step 4: Verify mobile**

Resize to 600px. Expected: single-column stack, no layout change from before.

- [ ] **Step 5: Final commit**

```bash
git add badges.html
git commit -m "feat(layout): 2-column desktop layout for badges.html"
```
