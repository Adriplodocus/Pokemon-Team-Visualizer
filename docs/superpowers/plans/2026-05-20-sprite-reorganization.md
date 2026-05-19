# Sprite Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize ~3000 sprite GIFs into a clean directory structure — `female/` and `shiny/` subfolders for variants, `_` as skin separator — eliminating all naming ambiguity with hyphenated Pokémon names.

**Architecture:** A Python migration script builds an explicit mapping of every old filename to its new path using `POKEMON_CATALOG` skins and `FEMALE_VARIANTS`, then executes all renames. `buildSpriteUrl` in `app.js` is updated to match the new paths. `sprites/Mega/` is left untouched (not referenced by code).

**Tech Stack:** Python 3 (stdlib only), JavaScript

---

### Task 1: Write migration script

**Files:**
- Create: `scripts/migrate-sprites.py`

- [ ] **Step 1: Create the script**

```python
#!/usr/bin/env python3
"""
Migrate sprite files to the new naming convention.

Old → New:
  sprites/{name}-{skin}.gif           → sprites/{name}_{skin}.gif
  sprites/{name}-f.gif                → sprites/female/{name}.gif
  sprites/{name}-{skin}-f.gif         → sprites/female/{name}_{skin}.gif
  sprites/Shiny/{name} (1).gif        → sprites/shiny/{name}.gif
  sprites/Shiny/{name}-{skin} (1).gif → sprites/shiny/{name}_{skin}.gif
  sprites/Shiny/{name}-f (1).gif      → sprites/shiny/female/{name}.gif
  sprites/Shiny/{name}-{skin}-f (1).gif → sprites/shiny/female/{name}_{skin}.gif
"""

import os
import re
import shutil
import sys

DRY_RUN = '--dry-run' in sys.argv
SPRITES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'sprites'))
CATALOG_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'pokemon-catalog.js'))


def parse_catalog():
    with open(CATALOG_PATH) as f:
        content = f.read()
    catalog = {}
    for m in re.finditer(
        r'["\']?([a-zA-Z0-9\'\-\.]+)["\']?\s*:\s*\{[^}]*skin:\s*\[([^\]]*)\]',
        content
    ):
        name = m.group(1)
        skins = [s.strip().strip("'\"") for s in m.group(2).split(',') if s.strip().strip("'\"")]
        catalog[name] = skins
    return catalog


def build_skin_map(catalog):
    """Return {old_stem: new_stem} for every (pokemon, skin) combination."""
    skin_map = {}
    for pokemon, skins in catalog.items():
        for skin in skins:
            skin_map[f'{pokemon}-{skin}'] = f'{pokemon}_{skin}'
    return skin_map


def transform_stem(stem, skin_map):
    """
    Given a filename stem (no .gif, no ' (1)'), return (folder_suffix, new_stem).
    folder_suffix: '' or 'female/'
    """
    folder = ''

    if stem.endswith('-f'):
        folder = 'female/'
        stem = stem[:-2]

    if stem in skin_map:
        stem = skin_map[stem]

    return folder, stem


def collect_moves(skin_map):
    moves = []

    # Normal sprites (root)
    for fname in sorted(os.listdir(SPRITES_DIR)):
        if not fname.endswith('.gif'):
            continue
        stem = fname[:-4]
        folder, new_stem = transform_stem(stem, skin_map)
        src = os.path.join(SPRITES_DIR, fname)
        dst = os.path.join(SPRITES_DIR, folder, new_stem + '.gif')
        if src != dst:
            moves.append((src, dst))

    # Shiny sprites (Shiny/ → shiny/)
    shiny_src = os.path.join(SPRITES_DIR, 'Shiny')
    shiny_dst = os.path.join(SPRITES_DIR, 'shiny')
    for fname in sorted(os.listdir(shiny_src)):
        if not fname.endswith('.gif'):
            continue
        stem = fname[:-4].replace(' (1)', '')
        folder, new_stem = transform_stem(stem, skin_map)
        src = os.path.join(shiny_src, fname)
        dst = os.path.join(shiny_dst, folder, new_stem + '.gif')
        moves.append((src, dst))

    return moves


def main():
    catalog = parse_catalog()
    print(f"Parsed catalog: {len(catalog)} Pokémon with skins")

    skin_map = build_skin_map(catalog)
    print(f"Skin map: {len(skin_map)} (pokemon, skin) combinations")

    moves = collect_moves(skin_map)
    print(f"Planned moves: {len(moves)}\n")

    if DRY_RUN:
        for src, dst in moves:
            print(f"  {os.path.relpath(src, SPRITES_DIR)}  →  {os.path.relpath(dst, SPRITES_DIR)}")
        return

    for d in ['female', 'shiny', os.path.join('shiny', 'female')]:
        os.makedirs(os.path.join(SPRITES_DIR, d), exist_ok=True)

    for src, dst in moves:
        shutil.move(src, dst)

    shiny_dir = os.path.join(SPRITES_DIR, 'Shiny')
    remaining = [f for f in os.listdir(shiny_dir) if not f.startswith('.')]
    if not remaining:
        shutil.rmtree(shiny_dir)
        print("Removed Shiny/ directory.")
    else:
        print(f"WARNING: Shiny/ still has {len(remaining)} files: {remaining[:5]}")

    print(f"Done. Migrated {len(moves)} files.")


if __name__ == '__main__':
    main()
```

- [ ] **Step 2: Make executable**

```bash
chmod +x scripts/migrate-sprites.py
```

---

### Task 2: Dry-run and verify

**Files:**
- Read: `scripts/migrate-sprites.py` (just created)

- [ ] **Step 1: Run in dry-run mode**

```bash
python3 scripts/migrate-sprites.py --dry-run 2>&1 | head -5
python3 scripts/migrate-sprites.py --dry-run 2>&1 | grep -c "→"
```

Expected first lines:
```
Parsed catalog: 105 Pokémon with skins
Skin map: <N> (pokemon, skin) combinations
Planned moves: <N>
```

- [ ] **Step 2: Verify key transformations appear correctly**

```bash
python3 scripts/migrate-sprites.py --dry-run 2>&1 | grep "pikachu\b"
```

Expected (examples):
```
  pikachu-f.gif  →  female/pikachu.gif
```

```bash
python3 scripts/migrate-sprites.py --dry-run 2>&1 | grep "raichu"
```

Expected:
```
  raichu-alola.gif  →  raichu_alola.gif
  Shiny/raichu-alola (1).gif  →  shiny/raichu_alola.gif
```

```bash
python3 scripts/migrate-sprites.py --dry-run 2>&1 | grep "wo-chien\|chi-yu\|ting-lu"
```

Expected — only shiny moves, no female moves (these have no female variant):
```
  Shiny/wo-chien (1).gif  →  shiny/wo-chien.gif
  Shiny/chi-yu (1).gif    →  shiny/chi-yu.gif
  Shiny/ting-lu (1).gif   →  shiny/ting-lu.gif
```

```bash
python3 scripts/migrate-sprites.py --dry-run 2>&1 | grep "cosplay"
```

Expected:
```
  pikachu-cosplay-f.gif  →  female/pikachu_cosplay.gif
  Shiny/pikachu-cosplay-f (1).gif  →  shiny/female/pikachu_cosplay.gif
```

```bash
python3 scripts/migrate-sprites.py --dry-run 2>&1 | grep "alcremie" | head -3
```

Expected:
```
  alcremie-caramel-swirl-berry.gif  →  alcremie_caramel-swirl-berry.gif
  ...
```

- [ ] **Step 3: Confirm no unexpected renames of hyphenated Pokémon names**

```bash
python3 scripts/migrate-sprites.py --dry-run 2>&1 | grep "chien-pao\|mr-mime\|tapu\|jangmo\|porygon-z\|type-null"
```

Expected: only shiny moves (stripping ` (1)` and moving to `shiny/`), no changes to the pokemon name itself. Example:
```
  Shiny/chien-pao (1).gif  →  shiny/chien-pao.gif
```

If anything looks wrong, fix the script before proceeding.

---

### Task 3: Execute migration

**Files:**
- Modify: `sprites/` directory tree (all renames happen here)

- [ ] **Step 1: Run the migration**

```bash
python3 scripts/migrate-sprites.py
```

Expected output:
```
Parsed catalog: 105 Pokémon with skins
Skin map: <N> (pokemon, skin) combinations
Planned moves: <N>
Removed Shiny/ directory.
Done. Migrated <N> files.
```

If output contains `WARNING: Shiny/ still has`, investigate and manually move/remove remaining files before continuing.

- [ ] **Step 2: Verify directory structure**

```bash
ls /Users/adrian/Pokemon-Team-Visualizer/sprites/
```

Expected: `female/`, `shiny/`, `Mega/`, `Mega/Shiny/` directories present. No `Shiny/` (uppercase).

```bash
ls /Users/adrian/Pokemon-Team-Visualizer/sprites/shiny/ | head -5
ls /Users/adrian/Pokemon-Team-Visualizer/sprites/female/ | head -5
ls /Users/adrian/Pokemon-Team-Visualizer/sprites/shiny/female/ | head -5
```

- [ ] **Step 3: Verify key files exist at new paths**

```bash
# Female normal
test -f sprites/female/pikachu.gif && echo "OK: female pikachu" || echo "MISSING"
test -f sprites/female/wo-chien.gif && echo "OK: female wo-chien" || echo "MISSING — expected, no female variant"
test -f sprites/female/pikachu_cosplay.gif && echo "OK: female pikachu_cosplay" || echo "MISSING"

# Shiny
test -f sprites/shiny/pikachu.gif && echo "OK: shiny pikachu" || echo "MISSING"
test -f sprites/shiny/wo-chien.gif && echo "OK: shiny wo-chien" || echo "MISSING"
test -f sprites/shiny/raichu_alola.gif && echo "OK: shiny raichu_alola" || echo "MISSING"

# Shiny female
test -f sprites/shiny/female/pikachu.gif && echo "OK: shiny female pikachu" || echo "MISSING"
test -f sprites/shiny/female/pikachu_cosplay.gif && echo "OK: shiny female pikachu_cosplay" || echo "MISSING"
```

Expected: all lines print `OK:` except `female/wo-chien.gif` (no female variant for wo-chien).

- [ ] **Step 4: Verify old paths are gone**

```bash
test ! -f sprites/pikachu-f.gif && echo "OK: old female gone" || echo "FAIL: old file still exists"
test ! -f "sprites/Shiny/pikachu (1).gif" && echo "OK: old shiny gone" || echo "FAIL: old file still exists"
test ! -d sprites/Shiny && echo "OK: Shiny/ removed" || echo "FAIL: Shiny/ still exists"
test -f sprites/raichu_alola.gif && echo "OK: skin uses underscore" || echo "MISSING"
test ! -f sprites/raichu-alola.gif && echo "OK: old skin name gone" || echo "FAIL: old file still exists"
```

- [ ] **Step 5: File count sanity check**

```bash
find sprites -maxdepth 1 -name "*.gif" | wc -l     # normal root (no subdirs)
find sprites/female -name "*.gif" | wc -l           # should be ~107
find sprites/shiny -maxdepth 1 -name "*.gif" | wc -l  # shiny root
find sprites/shiny/female -name "*.gif" | wc -l     # should be ~106
find sprites -name "*.gif" | grep -v Mega | wc -l   # total non-mega
```

Compare total non-mega against pre-migration total (1492 normal + 1428 shiny = 2920).

---

### Task 4: Update `buildSpriteUrl` in app.js

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Replace `buildSpriteUrl` function**

Find the current function (starts at `// ── Sprite URL builder`). Replace the entire function body:

```javascript
// ── Sprite URL builder ──────────────────────────────────────────
function buildSpriteUrl(name, props) {
    const lower   = name.toLowerCase();
    const shiny   = props.shiny === 'True';
    const skin    = props.skin  || 'common';
    const gender  = props.gender || 'male';

    const catalog   = POKEMON_CATALOG[lower] || {};
    const skins     = catalog.skin || [];
    const hasFemale = FEMALE_VARIANTS.has(lower);

    let fileName = lower;
    let folder   = BASE_URL;

    if (skin !== 'common' && skins.includes(skin)) {
        fileName += '_' + skin;
    }
    if (shiny) {
        folder += 'shiny/';
    }
    if (gender === 'female' && hasFemale) {
        folder += 'female/';
    }

    return folder + encodeURIComponent(fileName) + '.gif';
}
```

- [ ] **Step 2: Verify the fallback URL in `refreshSprite` is still correct**

Find this line in `refreshSprite` (~line 354):

```javascript
const fallbackUrl = BASE_URL + encodeURIComponent(name) + '.gif';
```

This points to `sprites/{name}.gif` (root, no subfolder) — still correct after migration. No change needed.

---

### Task 5: Verify in the app

- [ ] **Step 1: Start a local server**

```bash
cd /Users/adrian/Pokemon-Team-Visualizer && python3 -m http.server 8080
```

Open `http://localhost:8080` in a browser.

- [ ] **Step 2: Test these cases manually**

| Test | Steps | Expected |
|------|-------|----------|
| Normal sprite | Type `pikachu`, press Enter | Sprite appears |
| Female variant | Set pikachu to female | Female sprite appears |
| No female variant | Type `poliwhirl`, set female | Regular poliwhirl sprite (fallback) |
| Skin | Type `raichu`, set skin to `alola` | Alolan Raichu sprite |
| Shiny | Type `pikachu`, toggle shiny | Shiny sprite |
| Shiny female | Type `pikachu`, shiny + female | Shiny female sprite |
| Hyphenated name | Type `wo-chien` | Sprite appears, no error |
| Skin cosplay | Type `pikachu`, skin `cosplay`, female | Female cosplay pikachu |

- [ ] **Step 3: Stop the server**

`Ctrl+C`

---

### Task 6: Commit

- [ ] **Step 1: Stage all changes**

```bash
git add scripts/migrate-sprites.py app.js
git add sprites/female/ sprites/shiny/
git rm -r sprites/Shiny/   # if not already staged as deleted by git
git status                 # review what's staged
```

- [ ] **Step 2: Commit**

```bash
git commit -m "$(cat <<'EOF'
Reorganize sprites: subfolders for gender/shiny, underscore for skins

- female/ subfolder replaces -f suffix (eliminates ambiguity with hyphenated names)
- shiny/ subfolder replaces Shiny/ (lowercase, drops ' (1)' suffix)
- Skin separator changed from '-' to '_' (raichu-alola → raichu_alola)
- buildSpriteUrl updated to match new structure

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3: Push**

```bash
git push
```
