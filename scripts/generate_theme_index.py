"""
Generate sprites/theme-index.json.

For each theme, records which skins and female variants are actually
present on disk so the UI can filter dropdowns to available options.

Output shape:
{
  "Showdown": { "unown": { "skins": ["bravo",...] }, "ralts": { "female": true } },
  "Home":     { ... },
  "Official": { ... },
  "Pixel":    { ... }
}

Pokémon with only a base sprite are omitted (empty = base only).
Run via update-pokemon-list.bat or directly: python scripts/generate_theme_index.py
"""

import os, json, re

ROOT      = os.path.join(os.path.dirname(__file__), '..')
SPRITES   = os.path.join(ROOT, 'sprites')
LIST_PATH = os.path.join(ROOT, 'pokemon-list.json')
OUT_PATH  = os.path.join(SPRITES, 'theme-index.json')

# ── Load known base names ─────────────────────────────────────────────────────

with open(LIST_PATH, encoding='utf-8') as f:
    KNOWN = set(json.load(f))

def parse_stem(stem):
    """Return (base_name, skin_or_None). Handles names with underscores (nidoran_m)."""
    if stem in KNOWN:
        return stem, None
    parts = stem.split('_')
    for i in range(len(parts) - 1, 0, -1):
        candidate = '_'.join(parts[:i])
        if candidate in KNOWN:
            return candidate, '_'.join(parts[i:])
    return stem, None  # unknown; treat as standalone base

# ── Per-theme scanner ─────────────────────────────────────────────────────────

def scan_theme(root_dir, ext):
    """
    Walk root_dir and return:
      skins  = { base: [skin, ...] }
      female = { base: True }
      bases  = set of Pokémon that have a plain base file (no skin suffix)

    Subdirectory conventions (same for GIF and PNG themes):
      root/           → base or skin variants
      root/female/    → female base forms
      root/shiny/     → shiny base or skin variants (skip — shiny availability
                         mirrors base; we don't need to index it separately)
      root/shiny/female/ → (skip same reason)
    """
    skins  = {}
    female = {}
    bases  = set()

    if not os.path.isdir(root_dir):
        return skins, female, bases

    for fname in os.listdir(root_dir):
        if not fname.lower().endswith(ext):
            continue
        stem = fname[:-len(ext)]
        base, skin = parse_stem(stem)
        if skin is None:
            bases.add(base)
        elif skin == 'female':
            female[base] = True
        else:
            skins.setdefault(base, []).append(skin)

    female_dir = os.path.join(root_dir, 'female')
    if os.path.isdir(female_dir):
        for fname in os.listdir(female_dir):
            if not fname.lower().endswith(ext):
                continue
            stem = fname[:-len(ext)]
            base, _ = parse_stem(stem)
            female[base] = True

    return skins, female, bases

def build_entry(skins, female, has_base):
    """Merge skins + female into a compact dict; omit if empty."""
    out = {}
    if skins:
        out['skins'] = sorted(skins)
    if female:
        out['female'] = True
    if skins and not has_base:
        out['hasBase'] = False
    return out or None

# ── Themes ────────────────────────────────────────────────────────────────────

THEMES = {
    'Showdown': (os.path.join(SPRITES, 'Showdown'), '.gif'),
    'Home':     (os.path.join(SPRITES, 'Home'),     '.png'),
    'Official': (os.path.join(SPRITES, 'Official'), '.png'),
    'Pixel':    (os.path.join(SPRITES, 'Pixel'),    '.png'),
}

index = {}

for theme, (root, ext) in THEMES.items():
    skins_map, female_map, bases_set = scan_theme(root, ext)

    # Merge: a Pokémon can have skins AND female
    all_bases = set(skins_map) | set(female_map)
    entry = {}
    for base in sorted(all_bases):
        data = build_entry(skins_map.get(base, []), female_map.get(base, False), base in bases_set)
        if data:
            entry[base] = data

    index[theme] = entry
    no_base_count = sum(1 for v in entry.values() if v.get('hasBase') is False)
    print(f'{theme}: {len(entry)} pokemon with variants '
          f'({sum(len(v.get("skins",[])) for v in entry.values())} skins, '
          f'{sum(1 for v in entry.values() if v.get("female"))} female, '
          f'{no_base_count} without base sprite)')

with open(OUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(index, f, separators=(',', ':'))

print(f'Written -> sprites/theme-index.json')
