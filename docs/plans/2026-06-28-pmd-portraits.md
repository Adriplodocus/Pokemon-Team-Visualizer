# PMD Portraits — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "PMD" sprite theme using face portraits from PMDCollab/SpriteCollab, with a credits page for artist attribution.

**Architecture:** Python script downloads `Normal.png` per Pokémon from the PMDCollab GitHub repo and writes them to `sprites/PMD/`. The existing theme system needs zero changes in `app.js` — adding the `"PMD"` key to `theme-index.json` and one `<option>` in `index.html` is enough. A static `credits-pmd.html` page loads `sprites/PMD/credits.json` and renders artist attribution.

**Tech Stack:** Python 3 + `requests`, vanilla JS, HTML/CSS (no build step).

## Global Constraints

- No build step — static files only; JS must work without a bundler
- CSS must use custom properties from `style.css` (`--pink`, `--blue`, `--bg`, etc.) — no hardcoded colors
- Fonts: Russo One (titles), JetBrains Mono (UI/body) — same as rest of app
- i18n: every user-visible string needs ES + EN entry; follow `HEADER_STRINGS` pattern in `header.js`
- `theme-index.json` format: `{ "ThemeName": { "pokemonname": {} } }` — no skins/female for PMD
- Portrait source: `https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/`
- Portrait size: 40×40 px individual PNG (already cropped — no Pillow needed)
- Script is idempotent: re-running skips already-downloaded files, overwrites credits.json and theme-index.json PMD entry

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `scripts/fetch_pmd_portraits.py` | Download portraits + build credits.json + update theme-index |
| Create | `tests/test_fetch_pmd_portraits.py` | Unit tests for script helpers |
| Create | `sprites/PMD/credits.json` | Generated — artist attribution per Pokémon |
| Modify | `sprites/theme-index.json` | Add `"PMD"` key (written by script) |
| Create | `credits-pmd.html` | Static credits page |
| Modify | `header.js` | Add Credits button + i18n strings |
| Modify | `index.html` | Add `<option value="PMD">PMD</option>` |

---

## Task 1: Download script

**Files:**
- Create: `scripts/fetch_pmd_portraits.py`
- Create: `tests/test_fetch_pmd_portraits.py`
- Generates: `sprites/PMD/*.png`, `sprites/PMD/credits.json`, updates `sprites/theme-index.json`

**Interfaces:**
- Produces: `sprites/PMD/{canonical_name}.png` for every Pokémon with a Normal.png in the repo
- Produces: `sprites/PMD/credits.json` — `{ "bulbasaur": { "primary": { "name": str, "discord": str, "contact": str }, "secondary": [...] } }`
- Produces: `sprites/theme-index.json` updated with `"PMD": { "bulbasaur": {}, ... }`

- [ ] **Step 1: Write failing tests for helper functions**

Create `tests/test_fetch_pmd_portraits.py`:

```python
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))

from fetch_pmd_portraits import normalize_name, parse_credit_names

def test_normalize_basic():
    assert normalize_name('Bulbasaur') == 'bulbasaur'

def test_normalize_spaces():
    assert normalize_name('Mr. Mime') == 'mr_mime'

def test_normalize_apostrophe():
    assert normalize_name("Farfetch'd") == 'farfetchd'

def test_normalize_dot():
    assert normalize_name('Porygon-Z') == 'porygon-z'

def test_parse_credit_names_basic():
    tsv = "Name\tDiscord\tContact\nArtistA\t#handle\thttps://example.com\nArtistB\t<@123>\t"
    result = parse_credit_names(tsv)
    assert result['ArtistA'] == {'discord': '#handle', 'contact': 'https://example.com'}
    assert result['ArtistB'] == {'discord': '<@123>', 'contact': ''}

def test_parse_credit_names_skips_header():
    tsv = "Name\tDiscord\tContact\nX\t\t"
    result = parse_credit_names(tsv)
    assert 'Name' not in result

def test_parse_credit_names_empty_lines():
    tsv = "Name\tDiscord\tContact\n\nArtistA\tD\tC\n"
    result = parse_credit_names(tsv)
    assert list(result.keys()) == ['ArtistA']
```

- [ ] **Step 2: Run tests to confirm they fail**

```
cd C:\Proyectos\Pokemon-Team-Visualizer
python -m pytest tests/test_fetch_pmd_portraits.py -v
```

Expected: `ModuleNotFoundError: No module named 'fetch_pmd_portraits'`

- [ ] **Step 3: Write the script**

Create `scripts/fetch_pmd_portraits.py`:

```python
import os
import json
import re
import requests

BASE = 'https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master'
SCRIPTS_DIR = os.path.dirname(__file__)
ROOT = os.path.join(SCRIPTS_DIR, '..')
SPRITES_PMD = os.path.join(ROOT, 'sprites', 'PMD')
THEME_INDEX_PATH = os.path.join(ROOT, 'sprites', 'theme-index.json')


def normalize_name(name: str) -> str:
    name = name.lower()
    name = name.replace(' ', '_')
    name = re.sub(r"['.:]", '', name)
    return name


def parse_credit_names(text: str) -> dict:
    lines = text.strip().split('\n')
    result = {}
    for line in lines[1:]:  # skip header row
        parts = line.split('\t')
        name = parts[0].strip()
        if not name:
            continue
        discord = parts[1].strip() if len(parts) > 1 else ''
        contact = parts[2].strip() if len(parts) > 2 else ''
        result[name] = {'discord': discord, 'contact': contact}
    return result


def main():
    os.makedirs(SPRITES_PMD, exist_ok=True)

    print('Fetching tracker.json...')
    tracker = requests.get(f'{BASE}/tracker.json', timeout=30).json()

    print('Fetching credit_names.txt...')
    credit_text = requests.get(f'{BASE}/credit_names.txt', timeout=30).text
    credit_map = parse_credit_names(credit_text)

    downloaded = []
    credits_out = {}
    skipped = 0

    for raw_id, entry in tracker.items():
        if raw_id == '0000':
            continue  # Missingno — not a real Pokémon

        pmd_name = entry.get('name', '')
        if not pmd_name:
            continue

        canonical = normalize_name(pmd_name)
        out_path = os.path.join(SPRITES_PMD, f'{canonical}.png')

        if os.path.exists(out_path):
            downloaded.append(canonical)
            # Still collect credits even if file already exists
        else:
            r = requests.get(f'{BASE}/portrait/{raw_id}/Normal.png', timeout=15)
            if r.status_code != 200:
                print(f'  SKIP {raw_id} ({pmd_name}): HTTP {r.status_code}')
                skipped += 1
                continue
            with open(out_path, 'wb') as f:
                f.write(r.content)
            downloaded.append(canonical)

        # Build credits entry
        portrait_credit = entry.get('portrait_credit', {})
        primary_name = portrait_credit.get('primary', '')
        secondary_names = portrait_credit.get('secondary', [])

        if primary_name:
            primary_info = credit_map.get(primary_name, {'discord': '', 'contact': ''})
            credits_out[canonical] = {
                'primary': {'name': primary_name, **primary_info},
                'secondary': [
                    {'name': s, **credit_map.get(s, {'discord': '', 'contact': ''})}
                    for s in secondary_names if s
                ],
            }

    # Write credits.json
    credits_path = os.path.join(SPRITES_PMD, 'credits.json')
    with open(credits_path, 'w', encoding='utf-8') as f:
        json.dump(credits_out, f, indent=2, ensure_ascii=False)
    print(f'Wrote credits.json ({len(credits_out)} entries)')

    # Update theme-index.json
    with open(THEME_INDEX_PATH, encoding='utf-8') as f:
        theme_index = json.load(f)
    theme_index['PMD'] = {name: {} for name in sorted(downloaded)}
    with open(THEME_INDEX_PATH, 'w', encoding='utf-8') as f:
        json.dump(theme_index, f, ensure_ascii=False)
    print(f'Updated theme-index.json PMD: {len(downloaded)} sprites')
    print(f'Skipped: {skipped}')


if __name__ == '__main__':
    main()
```

- [ ] **Step 4: Run failing tests again — should pass now**

```
python -m pytest tests/test_fetch_pmd_portraits.py -v
```

Expected: all 6 tests PASS.

- [ ] **Step 5: Install dependency if needed**

```
pip install requests
```

- [ ] **Step 6: Verify tracker.json credit field name before running**

Run this one-liner to check the actual field names in tracker.json (needed because we can't view the full file in browser):

```
python -c "
import requests, json
t = requests.get('https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/tracker.json').json()
entry = t.get('0001', {})
print(json.dumps(entry, indent=2))
"
```

Look for the portrait credit field. If it is named differently from `portrait_credit` (e.g. `portrait_credits`), update the key in `main()` at the line `portrait_credit = entry.get('portrait_credit', {})`.

- [ ] **Step 7: Run the download script (takes several minutes)**

```
python scripts/fetch_pmd_portraits.py
```

Expected output (approximate):
```
Fetching tracker.json...
Fetching credit_names.txt...
  SKIP 0007 (...): HTTP 404    ← some Pokémon have no portrait yet
...
Wrote credits.json (NNN entries)
Updated theme-index.json PMD: NNN sprites
Skipped: NN
```

Verify spot-check:
```
python -c "import os; print(os.path.exists('sprites/PMD/bulbasaur.png'))"
```

Expected: `True`

- [ ] **Step 8: Commit**

```
git add scripts/fetch_pmd_portraits.py tests/test_fetch_pmd_portraits.py sprites/PMD/ sprites/theme-index.json
git commit -m "feat(pmd): download portrait sprites and generate credits"
```

---

## Task 2: Add PMD option to theme select

**Files:**
- Modify: `index.html:172-177` (the `#theme-select` block)

**Interfaces:**
- Consumes: `sprites/theme-index.json["PMD"]` key (written by Task 1)
- Produces: `spriteTheme === 'PMD'` works in `app.js` — `buildSpriteUrl()` resolves to `sprites/PMD/{name}.png`

- [ ] **Step 1: Add the option**

In `index.html`, find the `#theme-select` block (around line 172):

```html
<select id="theme-select">
    <option value="Showdown">Showdown</option>
    <option value="Home">Home</option>
    <option value="Official">Official</option>
    <option value="Pixel">Pixel</option>
</select>
```

Change to:

```html
<select id="theme-select">
    <option value="Showdown">Showdown</option>
    <option value="Home">Home</option>
    <option value="Official">Official</option>
    <option value="Pixel">Pixel</option>
    <option value="PMD">PMD</option>
</select>
```

- [ ] **Step 2: Manual verification**

Start the dev server:
```
npx serve .
```

1. Open `http://localhost:3000`
2. Open "Configuración / Settings" panel
3. Confirm "PMD" appears in the sprite theme dropdown
4. Select "PMD" — type a Pokémon name (e.g. "bulbasaur")
5. Confirm the sprite slot shows the 40×40 PMD portrait face

- [ ] **Step 3: Commit**

```
git add index.html
git commit -m "feat(pmd): add PMD option to sprite theme select"
```

---

## Task 3: Credits page

**Files:**
- Create: `credits-pmd.html`

**Interfaces:**
- Consumes: `sprites/PMD/credits.json` via `fetch()`
- Consumes: `header.js` for nav injection
- Produces: publicly accessible page at `/credits-pmd.html`

- [ ] **Step 1: Create the page**

Create `credits-pmd.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Créditos PMD — Pokémon Stream Visualizer</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='white'/><path d='M2,16 A14,14 0 0,1 30,16 Z' fill='%23EE1515'/><circle cx='16' cy='16' r='14' fill='none' stroke='%231a1a1a' stroke-width='2'/><line x1='2' y1='16' x2='30' y2='16' stroke='%231a1a1a' stroke-width='2'/><circle cx='16' cy='16' r='5' fill='%231a1a1a'/><circle cx='16' cy='16' r='3' fill='white'/></svg>">
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Russo+One&family=JetBrains+Mono:wght@400;700&display=swap">
<meta name="theme-color" content="#00CCFF">
<script src="lang.js"></script>
<style>
.credits-container {
    max-width: 860px;
    margin: 2rem auto;
    padding: 0 1rem;
}
.credits-intro {
    color: var(--text);
    font-size: 0.85rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
}
.credits-intro a {
    color: var(--blue);
}
.credits-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
}
.credits-table th {
    text-align: left;
    padding: 0.5rem 0.75rem;
    color: var(--text-em);
    border-bottom: 1px solid var(--border);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.7rem;
}
.credits-table td {
    padding: 0.4rem 0.75rem;
    color: var(--text);
    border-bottom: 1px solid var(--border);
    vertical-align: middle;
}
.credits-table tr:hover td {
    background: var(--surface2);
}
.credits-pokemon {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.credits-pokemon img {
    width: 40px;
    height: 40px;
    image-rendering: pixelated;
}
.credits-name-text {
    color: var(--text-em);
    text-transform: capitalize;
}
.credits-artist a {
    color: var(--blue);
    text-decoration: none;
}
.credits-artist a:hover {
    text-decoration: underline;
}
.credits-loading {
    color: var(--muted);
    text-align: center;
    padding: 2rem;
}
</style>
</head>
<body>
<script>const ACTIVE_PAGE = '';</script>
<script src="patch-notes.js"></script>
<script src="header.js"></script>

<div class="credits-container">
    <p class="credits-intro" id="credits-intro">
        Los retratos PMD provienen de <a href="https://github.com/PMDCollab/SpriteCollab" target="_blank" rel="noopener">PMDCollab/SpriteCollab</a>
        y están licenciados bajo <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC Attribution 4.0</a>.
        Aquí se listan los artistas que los crearon.
    </p>
    <div id="credits-loading" class="credits-loading">Cargando créditos…</div>
    <table class="credits-table" id="credits-table" style="display:none">
        <thead>
            <tr>
                <th id="th-pokemon">Pokémon</th>
                <th id="th-primary">Artista principal</th>
                <th id="th-secondary">Artistas secundarios</th>
            </tr>
        </thead>
        <tbody id="credits-tbody"></tbody>
    </table>
</div>

<script>
const CREDITS_STRINGS = {
    es: {
        intro: 'Los retratos PMD provienen de <a href="https://github.com/PMDCollab/SpriteCollab" target="_blank" rel="noopener">PMDCollab/SpriteCollab</a> y están licenciados bajo <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC Attribution 4.0</a>. Aquí se listan los artistas que los crearon.',
        loading: 'Cargando créditos…',
        thPokemon: 'Pokémon',
        thPrimary: 'Artista principal',
        thSecondary: 'Artistas secundarios',
        noContact: '—',
    },
    en: {
        intro: 'PMD portraits come from <a href="https://github.com/PMDCollab/SpriteCollab" target="_blank" rel="noopener">PMDCollab/SpriteCollab</a> and are licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC Attribution 4.0</a>. Artist credits are listed below.',
        loading: 'Loading credits…',
        thPokemon: 'Pokémon',
        thPrimary: 'Primary artist',
        thSecondary: 'Secondary artists',
        noContact: '—',
    },
};

function applyCreditsLang() {
    const s = CREDITS_STRINGS[currentLang] || CREDITS_STRINGS.es;
    document.getElementById('credits-intro').innerHTML = s.intro;
    document.getElementById('credits-loading').textContent = s.loading;
    document.getElementById('th-pokemon').textContent = s.thPokemon;
    document.getElementById('th-primary').textContent = s.thPrimary;
    document.getElementById('th-secondary').textContent = s.thSecondary;
}

function artistCell(artist) {
    if (!artist || !artist.name) return '—';
    const contact = artist.contact || artist.discord || '';
    if (contact && contact.startsWith('http')) {
        return `<a href="${contact}" target="_blank" rel="noopener">${artist.name}</a>`;
    }
    return artist.name + (artist.discord ? ` (${artist.discord})` : '');
}

async function loadCredits() {
    const s = CREDITS_STRINGS[currentLang] || CREDITS_STRINGS.es;
    try {
        const res = await fetch('/sprites/PMD/credits.json');
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        const tbody = document.getElementById('credits-tbody');
        const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
        for (const [name, credit] of entries) {
            const secondaryList = (credit.secondary || []).map(artistCell).join(', ') || s.noContact;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="credits-pokemon">
                        <img src="/sprites/PMD/${name}.png" alt="${name}" onerror="this.style.display='none'">
                        <span class="credits-name-text">${name.replace(/_/g, ' ')}</span>
                    </div>
                </td>
                <td class="credits-artist">${artistCell(credit.primary)}</td>
                <td class="credits-artist">${secondaryList}</td>
            `;
            tbody.appendChild(row);
        }
        document.getElementById('credits-loading').style.display = 'none';
        document.getElementById('credits-table').style.display = '';
    } catch (e) {
        document.getElementById('credits-loading').textContent = 'Error al cargar créditos.';
    }
}

applyCreditsLang();
loadCredits();
</script>
</body>
</html>
```

- [ ] **Step 2: Manual verification**

With the dev server running (`npx serve .`):

1. Open `http://localhost:3000/credits-pmd.html`
2. Confirm table loads with Pokémon names, sprites, and artist links
3. Toggle ES/EN — confirm column headers and intro text switch language
4. Click an artist link — confirm it opens correctly (HTTP contact URL) or shows name/discord

- [ ] **Step 3: Commit**

```
git add credits-pmd.html
git commit -m "feat(pmd): add PMD credits attribution page"
```

---

## Task 4: Credits button in header

**Files:**
- Modify: `header.js`

**Interfaces:**
- Consumes: `credits-pmd.html` (Task 3)
- Produces: Credits button visible on all pages, same style as the Guide button

- [ ] **Step 1: Add button and i18n strings**

In `header.js`, find the existing guide button (line ~45):

```html
<a href="https://pleasant-nerine-dc9.notion.site/..." target="_blank" rel="noopener" class="guide-btn" aria-label="Guía de uso">...</a>
```

Add a Credits button **after** it (before `<div class="user-widget"`):

```html
<a href="/credits-pmd.html" class="guide-btn" aria-label="Créditos PMD" data-i18n-header="creditsBtn"><svg class="guide-btn-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span data-i18n-header="creditsBtn">Créditos</span></a>
```

In `HEADER_STRINGS`, add `creditsBtn` to both `es` and `en`:

```js
// In es block (after guideBtn line):
creditsBtn: 'Créditos',

// In en block (after guideBtn line):
creditsBtn: 'Credits',
```

In `applyHeaderLang()`, the existing `data-i18n-header` mechanism will pick up `creditsBtn` automatically if `applyHeaderLang()` already handles all `[data-i18n-header]` elements. Verify this is the case — if `applyHeaderLang` explicitly lists keys, add `creditsBtn` to it.

- [ ] **Step 2: Manual verification**

With dev server running:

1. Open any page (index, cemetery, badges)
2. Confirm "Créditos" / "Credits" button appears next to "Guía" / "Guide"
3. Click it — confirm it navigates to `/credits-pmd.html`
4. Toggle ES/EN — confirm button label switches

- [ ] **Step 3: Commit**

```
git add header.js
git commit -m "feat(pmd): add Credits button to global header"
```

---

## Self-Review Checklist

- [x] Script downloads portraits → `sprites/PMD/`
- [x] Script generates `sprites/PMD/credits.json`
- [x] Script updates `sprites/theme-index.json` with PMD key
- [x] `index.html` has PMD option in theme-select
- [x] `app.js` needs no changes (confirmed in spec)
- [x] `credits-pmd.html` loads credits.json, shows table with sprites + artist links
- [x] `header.js` has Credits button + ES/EN i18n strings
- [x] All user-visible strings have ES + EN entries
- [x] No hardcoded colors — CSS custom properties only
- [x] Script is idempotent (skips existing files)
- [x] tracker.json field verification step included (Step 6, Task 1)
