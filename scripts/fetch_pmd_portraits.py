"""
Download PMD portrait sprites from PMDCollab/SpriteCollab and generate:
  - sprites/PMD/{canonical_name}.png  for every Pokémon with a Normal.png
  - sprites/PMD/credits.json          attribution data
  - sprites/theme-index.json          updated with "PMD" key

Usage:
    python scripts/fetch_pmd_portraits.py

The portrait_credit field in tracker.json has this shape:
    {"primary": "ArtistName", "secondary": [...], "total": N}
where primary/secondary are either a plain name string or a Discord mention.
"""

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
    """Convert a Pokémon display name to a canonical filename-safe slug.

    Rules (applied in order):
      1. Lowercase
      2. Spaces → underscores
      3. Remove apostrophes, dots, colons

    Examples:
      'Bulbasaur'  → 'bulbasaur'
      'Mr. Mime'   → 'mr_mime'
      "Farfetch'd" → 'farfetchd'
      'Porygon-Z'  → 'porygon-z'   (hyphens preserved)
    """
    name = name.lower()
    name = name.replace(' ', '_')
    name = re.sub(r"['.:]", '', name)
    return name


def parse_credit_names(text: str) -> dict:
    """Parse credit_names.txt TSV into a dict keyed by artist name.

    The TSV has a header row (Name\\tDiscord\\tContact) followed by data rows.
    Empty lines are skipped.

    Returns:
        {'ArtistName': {'discord': '...', 'contact': '...'}, ...}
    """
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
    tracker = requests.get(f'{BASE}/tracker.json', timeout=60).json()

    print('Fetching credit_names.txt...')
    credit_text = requests.get(f'{BASE}/credit_names.txt', timeout=30).text
    credit_map = parse_credit_names(credit_text)

    downloaded = set()
    credits_out = {}
    skipped = 0

    for raw_id, entry in tracker.items():
        if raw_id == '0000':
            continue  # Missingno placeholder — not a real Pokémon

        pmd_name = entry.get('name', '')
        if not pmd_name:
            continue

        canonical = normalize_name(pmd_name)
        out_path = os.path.join(SPRITES_PMD, f'{canonical}.png')

        if os.path.exists(out_path):
            # File already downloaded; still collect credits
            downloaded.add(canonical)
        else:
            r = requests.get(f'{BASE}/portrait/{raw_id}/Normal.png', timeout=20)
            if r.status_code != 200:
                print(f'  SKIP {raw_id} ({pmd_name}): HTTP {r.status_code}')
                skipped += 1
                continue
            with open(out_path, 'wb') as f:
                f.write(r.content)
            downloaded.add(canonical)

        # Build credits entry using the portrait_credit field
        portrait_credit = entry.get('portrait_credit', {})
        primary_name = portrait_credit.get('primary', '')
        secondary_names = portrait_credit.get('secondary', [])

        if primary_name:
            primary_info = credit_map.get(primary_name, {'discord': '', 'contact': ''})
            credits_out[canonical] = {
                'primary': {'name': primary_name, **primary_info},
                'secondary': [
                    {'name': s, **credit_map.get(s, {'discord': '', 'contact': ''})}
                    for s in secondary_names
                    if s
                ],
            }

    # Write credits.json
    credits_path = os.path.join(SPRITES_PMD, 'credits.json')
    with open(credits_path, 'w', encoding='utf-8') as f:
        json.dump(credits_out, f, indent=2, ensure_ascii=False)
    print(f'Wrote credits.json ({len(credits_out)} entries)')

    # Update theme-index.json — preserve all existing theme keys, add/replace PMD
    theme_index_path = os.path.realpath(THEME_INDEX_PATH)
    with open(theme_index_path, encoding='utf-8') as f:
        theme_index = json.load(f)
    theme_index['PMD'] = {name: {} for name in sorted(downloaded)}
    with open(theme_index_path, 'w', encoding='utf-8') as f:
        json.dump(theme_index, f, ensure_ascii=False)
    print(f'Updated theme-index.json PMD: {len(downloaded)} sprites')
    print(f'Skipped: {skipped}')


if __name__ == '__main__':
    main()
