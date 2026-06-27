"""
Downloads animated GIFs from Pokémon Showdown to replace static 1-frame GIFs.
Run from the project root:  python scripts/fix_static_gifs.py
"""
import os
import io
import urllib.request
from PIL import Image

SPRITES_DIR = os.path.join(os.path.dirname(__file__), '..', 'sprites', 'Showdown')

SHOWDOWN_BASE = {
    'normal': 'https://play.pokemonshowdown.com/sprites/ani/',
    'shiny':  'https://play.pokemonshowdown.com/sprites/ani-shiny/',
}

# Local filename (no ext) -> Showdown name
# Covers: underscore->hyphen forms + Spanish aliases
LOCAL_TO_SHOWDOWN = {
    # Spanish alias -> English Showdown name
    'ferromole':       'iron-treads',
    'ferrotesta':      'iron-boulder',
    'ferropalmas':     'iron-hands',
    'ferrosaco':       'iron-bundle',
    'ferrocuello':     'iron-jugulis',
    'ferropolilla':    'iron-moth',
    'ferropuas':       'iron-thorns',
    'ferroverdor':     'iron-leaves',
    'ferrodada':       'iron-crown',
    'ferropaladin':    'iron-valiant',
    'ferroseed':       'ferroseed',
    # Underscored forms
    'darmanitan_zen':       'darmanitan-zen',
    'ogerpon_cornerstone':  'ogerpon-cornerstone',
    'ogerponcornerstone':   'ogerpon-cornerstone',
    'palafin_hero':         'palafin-hero',
}

def to_showdown_name(local_name):
    lower = local_name.lower()
    if lower in LOCAL_TO_SHOWDOWN:
        return LOCAL_TO_SHOWDOWN[lower]
    # Generic: replace underscores with hyphens
    return lower.replace('_', '-')

def count_frames(data):
    try:
        img = Image.open(io.BytesIO(data))
        return getattr(img, 'n_frames', 1)
    except Exception:
        return 0

def try_download(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.read()
    except Exception:
        return None

def find_statics(base_dir):
    results = []
    for root, _, files in os.walk(base_dir):
        for f in files:
            if not f.lower().endswith('.gif'):
                continue
            full = os.path.join(root, f)
            rel = os.path.relpath(full, base_dir).replace('\\', '/')
            try:
                img = Image.open(full)
                if getattr(img, 'n_frames', 1) <= 1:
                    results.append((full, rel))
            except Exception:
                pass
    return results

def main():
    statics = find_statics(SPRITES_DIR)
    print(f"Estáticos encontrados: {len(statics)}\n")

    replaced = []
    not_found = []
    already_animated = []  # downloaded but still 1 frame on Showdown

    for full_path, rel in statics:
        is_shiny = rel.startswith('shiny/')
        local_name = os.path.splitext(os.path.basename(rel))[0]
        showdown_name = to_showdown_name(local_name)
        mode = 'shiny' if is_shiny else 'normal'
        url = SHOWDOWN_BASE[mode] + showdown_name + '.gif'

        print(f"  {rel} -> {url}")
        data = try_download(url)

        if data is None:
            print(f"    [NO] no encontrado")
            not_found.append((rel, url))
            continue

        frames = count_frames(data)
        if frames <= 1:
            print(f"    [~] descargado pero sigue estatico ({frames} frame)")
            already_animated.append((rel, url))
            continue

        with open(full_path, 'wb') as f:
            f.write(data)
        print(f"    [OK] reemplazado ({frames} frames)")
        replaced.append((rel, url, frames))

    print()
    print("=" * 50)
    print(f"[OK] Reemplazados:  {len(replaced)}")
    print(f"[~]  Sin animacion en Showdown: {len(already_animated)}")
    print(f"[NO] No encontrados: {len(not_found)}")

    if not_found:
        print("\nNo encontrados (nombres a verificar manualmente):")
        for rel, url in not_found:
            print(f"  {rel}  ->  {url}")

    if already_animated:
        print("\nExisten en Showdown pero aún estáticos (Gen 9 sin animar?):")
        for rel, url in already_animated:
            print(f"  {rel}")

if __name__ == '__main__':
    main()
