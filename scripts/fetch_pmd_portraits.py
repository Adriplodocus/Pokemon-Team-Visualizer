"""
Download PMD portrait sprites from PMDCollab/SpriteCollab and generate:
  - sprites/PMD/{canonical_name}.png  for every Pokémon with a Normal.png
  - sprites/PMD/credits.json          attribution data
  - sprites/theme-index.json          updated with "PMD" key

Usage:
    python scripts/fetch_pmd_portraits.py

Credits are fetched from portrait/{id}/credits.txt per Pokémon, which is
the same source the SpriteCollab website uses for its credits viewer.
Each line: timestamp<TAB>artist<TAB>CUR|OLD<TAB>license<TAB>expressions
Only CUR lines are counted; artists are de-duplicated preserving first order.
"""

import os
import json
import re
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE = 'https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master'
SCRIPTS_DIR = os.path.dirname(__file__)
ROOT = os.path.join(SCRIPTS_DIR, '..')
SPRITES_PMD = os.path.join(ROOT, 'sprites', 'PMD')
THEME_INDEX_PATH = os.path.join(ROOT, 'sprites', 'theme-index.json')
MAX_WORKERS = 20


def normalize_name(name: str) -> str:
    """Convert a Pokémon display name to a canonical filename-safe slug."""
    name = name.lower()
    name = name.replace(' ', '_')
    name = re.sub(r"['.:]", '', name)
    return name


def parse_credit_names(text: str) -> tuple:
    """Parse credit_names.txt TSV.

    Returns:
        name_map:    {'ArtistName': {'discord': '...', 'contact': '...'}, ...}
        discord_map: {'<@!XXXXXXX>': 'ArtistName', ...}  — reverse lookup
    """
    lines = text.strip().split('\n')
    name_map = {}
    discord_map = {}
    for line in lines[1:]:  # skip header row
        parts = line.split('\t')
        name = parts[0].strip()
        if not name:
            continue
        discord = parts[1].strip() if len(parts) > 1 else ''
        contact = parts[2].strip() if len(parts) > 2 else ''
        name_map[name] = {'discord': discord, 'contact': contact}
        if discord:
            discord_map[discord] = name
    return name_map, discord_map


def resolve_artist(raw: str, name_map: dict, discord_map: dict) -> dict:
    """Resolve a raw credit string (name or Discord mention) to artist info."""
    name = discord_map.get(raw, raw)
    info = name_map.get(name, {'discord': '', 'contact': ''})
    return {'name': name, **info}


def parse_portrait_credits_txt(text: str, name_map: dict, discord_map: dict) -> list:
    """Parse a per-Pokémon portrait credits.txt into an ordered, de-duplicated artist list.

    Only CUR (current) contributions are counted, matching the SpriteCollab website.
    """
    seen = {}  # raw artist id → resolved dict, preserving insertion order
    for line in text.strip().split('\n'):
        parts = line.split('\t')
        if len(parts) < 3:
            continue
        raw_artist = parts[1].strip()
        status = parts[2].strip()
        if status != 'CUR':
            continue
        if raw_artist not in seen:
            seen[raw_artist] = resolve_artist(raw_artist, name_map, discord_map)
    return list(seen.values())


def fetch_portrait_credits(raw_id: str, name_map: dict, discord_map: dict) -> list:
    """Fetch and parse portrait credits for one Pokémon ID. Returns [] on failure."""
    url = f'{BASE}/portrait/{raw_id}/credits.txt'
    try:
        r = requests.get(url, timeout=20)
        if r.status_code == 404:
            return []
        r.raise_for_status()
        return parse_portrait_credits_txt(r.text, name_map, discord_map)
    except Exception:
        return []


def main():
    os.makedirs(SPRITES_PMD, exist_ok=True)

    print('Fetching tracker.json...')
    tracker = requests.get(f'{BASE}/tracker.json', timeout=60).json()

    print('Fetching credit_names.txt...')
    credit_text = requests.get(f'{BASE}/credit_names.txt', timeout=30).text
    credit_map, discord_map = parse_credit_names(credit_text)

    # Build the list of Pokémon to process
    entries = []
    for raw_id, entry in tracker.items():
        if raw_id == '0000':
            continue
        pmd_name = entry.get('name', '')
        if not pmd_name:
            continue
        entries.append((raw_id, pmd_name))

    downloaded = set()
    sprite_results = {}  # raw_id → {'canonical': str, 'ok': bool}
    skipped = 0

    # Download missing sprites first (sequential — rate-limit friendly)
    print(f'Checking/downloading {len(entries)} sprites...')
    for raw_id, pmd_name in entries:
        canonical = normalize_name(pmd_name)
        out_path = os.path.join(SPRITES_PMD, f'{canonical}.png')
        if os.path.exists(out_path):
            downloaded.add(canonical)
            sprite_results[raw_id] = canonical
        else:
            r = requests.get(f'{BASE}/portrait/{raw_id}/Normal.png', timeout=20)
            if r.status_code != 200:
                print(f'  SKIP {raw_id} ({pmd_name}): HTTP {r.status_code}')
                skipped += 1
                continue
            with open(out_path, 'wb') as f:
                f.write(r.content)
            downloaded.add(canonical)
            sprite_results[raw_id] = canonical

    # Fetch all portrait credits.txt concurrently
    ids_to_fetch = list(sprite_results.keys())
    print(f'Fetching {len(ids_to_fetch)} portrait credits.txt files (workers={MAX_WORKERS})...')
    credits_by_id = {}
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {pool.submit(fetch_portrait_credits, rid, credit_map, discord_map): rid
                   for rid in ids_to_fetch}
        done = 0
        for future in as_completed(futures):
            rid = futures[future]
            credits_by_id[rid] = future.result()
            done += 1
            if done % 100 == 0:
                print(f'  {done}/{len(ids_to_fetch)}')

    # Build credits.json
    credits_out = {}
    for raw_id, canonical in sprite_results.items():
        artists = credits_by_id.get(raw_id, [])
        credits_out[canonical] = {
            'pmd_id': raw_id,
            'artists': artists,
        }

    credits_path = os.path.join(SPRITES_PMD, 'credits.json')
    with open(credits_path, 'w', encoding='utf-8') as f:
        json.dump(credits_out, f, indent=2, ensure_ascii=False)
    print(f'Wrote credits.json ({len(credits_out)} entries)')

    # Update theme-index.json
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
