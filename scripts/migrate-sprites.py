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

    # Pre-flight: check for destination collisions
    dst_counts = {}
    for _, dst in moves:
        dst_counts[dst] = dst_counts.get(dst, 0) + 1
    dupes = {os.path.relpath(dst, SPRITES_DIR): n for dst, n in dst_counts.items() if n > 1}
    if dupes:
        raise RuntimeError(f"Destination collision(s) — fix source files first:\n" +
                           "\n".join(f"  {dst}: {n} sources" for dst, n in dupes.items()))

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

    # Two-step rename needed on macOS case-insensitive filesystem
    shiny_dir = os.path.join(SPRITES_DIR, 'Shiny')
    shiny_tmp  = os.path.join(SPRITES_DIR, '__shiny_tmp__')
    shiny_final = os.path.join(SPRITES_DIR, 'shiny')
    os.rename(shiny_dir, shiny_tmp)
    os.rename(shiny_tmp, shiny_final)
    print("Renamed Shiny/ → shiny/")

    print(f"Done. Migrated {len(moves)} files.")


if __name__ == '__main__':
    main()
