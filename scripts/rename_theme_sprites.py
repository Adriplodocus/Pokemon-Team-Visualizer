#!/usr/bin/env python3
"""
rename_theme_sprites.py
Maps numbered PNGs in Home/Official/Pixel theme folders to Pokémon names.
Uses PokeAPI for ID→name lookup with local cache.

Usage:
    python scripts/rename_theme_sprites.py           # dry run (default)
    python scripts/rename_theme_sprites.py --apply   # actually rename files
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error

# ── Config ───────────────────────────────────────────────────────────────────

SPRITES_DIR = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'sprites'))
THEMES = ['Home', 'Official', 'Pixel']
CACHE_FILE = os.path.join(os.path.dirname(__file__), '_pokeapi_cache.json')
DRY_RUN = '--apply' not in sys.argv

# ── PokeAPI slug overrides ───────────────────────────────────────────────────
# PokeAPI slug → our filename (without extension). None = skip file.

SLUG_OVERRIDES = {
    # Base Pokémon edge cases
    'nidoran-f':             'nidoran',
    'nidoran-m':             None,             # no nidoran-m in our system
    'mr-mime':               'mr. mime',
    'mime-jr':               'mime jr.',
    'tapu-koko':             'tapukoko',
    'tapu-lele':             'tapulele',
    'tapu-bulu':             'tapubulu',
    'tapu-fini':             'tapufini',
    'farfetchd':             "farfetch'd",

    # Form variants that don't transform cleanly
    'aegislash-blade':               'aegislash_blade',
    'aegislash-shield':              'aegislash',
    'basculin-blue-striped':         'basculin_blue',
    'basculin-red-striped':          'basculin_red',
    'basculin-white-striped':        'basculin_white',
    'calyrex-ice-rider':             'calyrex_icerider',
    'calyrex-shadow-rider':          'calyrex_shadowrider',
    'darmanitan-standard':           'darmanitan',
    'darmanitan-zen-mode':           'darmanitan_zen',
    'darmanitan-galar-standard':     'darmanitan_galarice',
    'darmanitan-galar-zen-mode':     'darmanitan_galaricefire',
    'darumaka-galar-standard':       'darumaka_galar',
    'dudunsparce-three-segment':     'dudunsparce_threesegment',
    'eiscue-ice':                    'eiscue',
    'eiscue-noice-face':             'eiscue_noice',
    'furfrou-natural':               'furfrou',
    'meloetta-aria':                 'meloetta_aria',
    'meloetta-pirouette':            'meloetta_pirouette',
    'mimikyu-disguised':             'mimikyu_disguised',
    'mimikyu-busted':                'mimikyu_busted',
    'minior-red-meteor':             'minior_meteor',
    'minior-orange-meteor':          None,
    'minior-yellow-meteor':          None,
    'minior-green-meteor':           None,
    'minior-blue-meteor':            None,
    'minior-indigo-meteor':          None,
    'minior-violet-meteor':          None,
    'morpeko-full-belly':            'morpeko_full-belly',
    'mr-mime-galar':                 'mr. mime_galar',
    'palafin-zero':                  'palafin',
    'pikachu-original':              'pikachu_originalcap',
    'pikachu-alola':                 'pikachu_alolacap',
    'pikachu-hoenn':                 'pikachu_hoenncap',
    'pikachu-sinnoh':                'pikachu_sinnohcap',
    'pikachu-unova':                 'pikachu_unovacap',
    'pikachu-kalos':                 'pikachu_kaloscap',
    'pikachu-partner':               None,
    'pikachu-starter':               None,
    'pikachu-world':                 None,
    'toxtricity-amped':              'toxtricity_amped',
    'toxtricity-low-key':            'toxtricity_lowkey',
    'urshifu-single-strike':         'urshifu',
    'urshifu-rapid-strike':          None,     # not in our system
    'wishiwashi-solo':               'wishiwashi',
    'wishiwashi-school':             None,
    'zygarde-10-power-construct':    None,            # zygarde_10 from base form
    'zygarde-50-power-construct':    None,            # zygarde_50 from base form
    'zygarde-complete':              'zygarde_100',
    'zygarde-10':                    None,            # handled by power-construct form
    'zygarde-50':                    None,            # handled by power-construct form
    'zygarde-complete-forme':        'zygarde_100',
    # PokeAPI uses -hisui (not -hisuian) for all Hisuian forms — match catalog naming
    'arcanine-hisui':    'arcanine_hisuian',
    'avalugg-hisui':     'avalugg_hisuian',
    'braviary-hisui':    'braviary_hisuian',
    'decidueye-hisui':   'decidueye_hisuian',
    'electrode-hisui':   'electrode_hisuian',
    'goodra-hisui':      'goodra_hisuian',
    'growlithe-hisui':   'growlithe_hisuian',
    'lilligant-hisui':   'lilligant_hisuian',
    'qwilfish-hisui':    'qwilfish_hisuian',
    'samurott-hisui':    'samurott_hisuian',
    'sliggoo-hisui':     'sliggoo_hisuian',
    'sneasel-hisui':     'sneasel_hisuian',
    'typhlosion-hisui':  'typhlosion_hisuian',
    'voltorb-hisui':     'voltorb_hisuian',
    'zoroark-hisui':     'zoroark_hisuian',
    'zorua-hisui':       'zorua_hisuian',
    'kyurem-black':                  'kyurem_black',
    'kyurem-white':                  'kyurem_white',
    'ogerpon-teal-mask':             'ogerpon',
    'ogerpon-cornerstone-mask':      'ogerpon_cornerstone',
    'ogerpon-hearthflame-mask':      None,
    'ogerpon-wellspring-mask':       None,
    'tauros-paldea-combat-breed':    'tauros_paldeacombat',
    'tauros-paldea-blaze-breed':     'tauros_paldeablaze',
    'tauros-paldea-aqua-breed':      'tauros_paldeaaqua',
    'tandemaus-family-of-four':      'tandemaus_four',
    'maushold-family-of-four':       'maushold',
    'maushold-family-of-three':      None,
    'squawkabilly-green-plumage':    'squawkabilly_green',
    'squawkabilly-blue-plumage':     'squawkabilly_blue',
    'squawkabilly-yellow-plumage':   'squawkabilly_yellow',
    'squawkabilly-white-plumage':    'squawkabilly_white',
    'oinkologne-male':               'oinkologne',
    'oinkologne-female':             None,
    'indeedee-male':                 'indeedee',
    'indeedee-female':               None,
    'meowstic-male':                 'meowstic',
    'meowstic-female':               None,
    'unfezant-male':                 'unfezant',
    'unfezant-female':               None,
    'basculegion-male':              'basculegion',
    'basculegion-female':            None,
    'frillish-male':                 'frillish',
    'frillish-female':               None,
    'jellicent-male':                 'jellicent',
    'jellicent-female':              None,
    'pyroar-male':                   'pyroar',
    'pyroar-female':                 None,
    'hippopotas-male':               'hippopotas',
    'hippopotas-female':             None,
    'hippowdon-male':                'hippowdon',
    'hippowdon-female':              None,
    'combee-male':                   'combee',
    'combee-female':                 None,
    'wormadam-plant':                'wormadam',   # plant cloak = base
    'deoxys-normal':                 'deoxys',
    'giratina-altered':              'giratina',
    'shaymin-land':                  'shaymin',
    'rotom-normal':                  'rotom',
    'arceus-normal':                 'arceus',
    'keldeo-ordinary':               'keldeo',
    'kyurem-normal':                 'kyurem',
    'meloetta-aria-forme':           'meloetta_aria',
    'tornadus-incarnate':            'tornadus',
    'thundurus-incarnate':           'thundurus',
    'landorus-incarnate':            'landorus',
    'zacian-crowned':                None,            # base zacian covers
    'zamazenta-crowned':             None,            # base zamazenta covers
    'greninja-battle-bond':          None,            # base greninja covers
    'greninja-ash':                  'greninja_ash',
    'cramorant-gulping':             'cramorant_gulping',
    'cramorant-gorging':             'cramorant_gorging',
    'eternatus-eternamax':           None,
    'gimmighoul-roaming':            None,
    'polteageist-antique':           'polteageist_antique',
    'polteageist-phony':             'polteageist_phony',
    'sinistea-antique':              'sinistea',
    'sinistea-phony':                None,
    'sinistcha-antique':             'sinistcha',
    'sinistcha-masterpiece':         None,
    'poltchageist-artisan':          'poltchageist',
    'poltchageist-counterfeit':      None,
}

# ── {dex_id}-{form}.png mapping ──────────────────────────────────────────────
# Key: (dex_id_int, form_suffix_str) -> our filename (without .png). None = skip.

def _alcremie_map():
    creams = ['caramel-swirl','lemon-cream','matcha-cream','mint-cream',
              'rainbow-swirl','ruby-cream','ruby-swirl','salted-cream','vanilla-cream']
    sweets = ['berry','clover','flower','love','ribbon','star','strawberry']
    m = {}
    for c in creams:
        for s in sweets:
            key = (869, f'{c}-{s}-sweet')
            is_base = (c == 'vanilla-cream' and s == 'strawberry')
            m[key] = None if is_base else f'alcremie_{c}-{s}'
    return m

FORM_NAME_MAP = {
    # Unown (201) — A is base; rest use NATO phonetic
    **{(201, l): f'unown_{w}' for l, w in zip(
        list('bcdefghijklmnopqrstuvwxyz') + ['exclamation','question'],
        ['bravo','charlie','delta','echo','foxtrot','golf','hotel','india','juliet',
         'kilo','lima','mike','november','oscar','papa','quebec','romeo','sierra',
         'tango','uniform','victor','whiskey','xray','yankee','zulu',
         'exclamation','question'])},
    (201, 'a'): 'unown',
    # Wormadam (412)
    (412, 'plant'): 'wormadam',
    (412, 'sandy'): 'wormadam_sandy',
    (412, 'trash'): 'wormadam_trash',
    # Cherrim (421)
    (421, 'overcast'): 'cherrim',
    (421, 'sunshine'): 'cherrim_sunshine',
    # Shellos (422) — west = base (already renamed from 422.png)
    (422, 'west'):  None,
    (422, 'east'):  'shellos_east',
    # Gastrodon (423)
    (423, 'west'):  None,
    (423, 'east'):  'gastrodon_east',
    # Arceus (493)
    (493, 'normal'): 'arceus', (493, 'unknown'): None,
    **{(493, t): f'arceus_{t}' for t in
       ['bug','dark','dragon','electric','fairy','fighting','fire',
        'flying','ghost','grass','ground','ice','poison','psychic','rock','steel','water']},
    # Deerling (585) / Sawsbuck (586) — spring = base
    (585, 'spring'): 'deerling',
    **{(585, s): f'deerling_{s}' for s in ['summer','autumn','winter']},
    (586, 'spring'): 'sawsbuck',
    **{(586, s): f'sawsbuck_{s}' for s in ['summer','autumn','winter']},
    # Genesect (649) — base already renamed from 649.png
    (649, 'normal'): None,
    **{(649, d): f'genesect_{d}' for d in ['burn','chill','douse','shock']},
    # Vivillon (666) — only catalog patterns
    (666, 'icy-snow'):    'vivillon',
    (666, 'archipelago'): 'vivillon_archipelago',
    (666, 'continental'): 'vivillon_continental',
    (666, 'elegant'):     'vivillon_elegant',
    (666, 'fancy'):       'vivillon_fancy',
    (666, 'garden'):      'vivillon_garden',
    (666, 'high-plains'): 'vivillon_highplains',
    (666, 'jungle'):      'vivillon_jungle',
    (666, 'marine'):      'vivillon_marine',
    **{(666, p): None for p in
       ['meadow','modern','monsoon','ocean','poke-ball','polar',
        'river','sandstorm','savanna','sun','tundra']},
    # Flabebe (669) / Floette (670) / Florges (671) — red = base
    (669, 'red'): 'flabebe',
    **{(669, c): f'flabebe_{c}' for c in ['blue','orange','white','yellow']},
    (670, 'red'): 'floette',
    **{(670, c): f'floette_{c}' for c in ['blue','orange','white','yellow']},
    (671, 'red'): 'florges',
    **{(671, c): f'florges_{c}' for c in ['blue','orange','white','yellow']},
    # Furfrou (676)
    (676, 'natural'): 'furfrou',
    **{(676, s): f'furfrou_{s}' for s in
       ['dandy','debutante','diamond','heart','kabuki','matron','pharaoh','star']},
    (676, 'la-reine'): 'furfrou_lareine',
    # Xerneas (716) — active = battle form (keep), neutral = skip
    (716, 'active'): 'xerneas',
    (716, 'neutral'): None,
    # Silvally (773)
    (773, 'normal'): 'silvally',
    **{(773, t): f'silvally_{t}' for t in
       ['bug','dark','dragon','electric','fairy','fighting','fire',
        'flying','ghost','grass','ground','ice','poison','psychic','rock','steel','water']},
    # Alcremie (869)
    **_alcremie_map(),
    # Pichu (172)
    (172, 'spiky-eared'): 'pichu_spikyeared',
    # Komala (775) — duplicate, base already renamed from 775.png
    (775, 'form-1'): None,
}

# Suffixes to strip from PokeAPI form slugs before transformation
STRIP_SUFFIXES = [
    '-forme', '-form', '-mode', '-cloak', '-face', '-style', '-size',
    '-pattern', '-drive', '-plumage', '-breed', '-construct',
]

# Pokémon whose base name contains hyphens (don't split on these)
HYPHEN_BASES = {
    'ho-oh', 'porygon-z', 'jangmo-o', 'hakamo-o', 'kommo-o',
    'chi-yu', 'chien-pao', 'wo-chien', 'ting-lu',
    'mr-mime', 'mime-jr', 'tapu-koko', 'tapu-lele', 'tapu-bulu', 'tapu-fini',
    'farfetchd', 'sirfetchd',
}

# ── PokeAPI ──────────────────────────────────────────────────────────────────

def load_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_cache(cache):
    with open(CACHE_FILE, 'w') as f:
        json.dump(cache, f, indent=2)

def fetch_pokemon_name(pid, cache):
    key = str(pid)
    if key in cache:
        return cache[key]
    url = f'https://pokeapi.co/api/v2/pokemon/{pid}'
    req = urllib.request.Request(url, headers={'User-Agent': 'ptv-sprite-renamer/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
            name = data['name']
    except urllib.error.HTTPError as e:
        if e.code == 404:
            name = None
        else:
            raise
    cache[key] = name
    time.sleep(0.15)   # be polite to PokeAPI
    return name

# ── Name transformation ───────────────────────────────────────────────────────

def slug_to_our_name(slug):
    """Convert a PokeAPI Pokémon slug to our filename convention."""
    if slug is None:
        return None

    # Check explicit overrides first
    if slug in SLUG_OVERRIDES:
        return SLUG_OVERRIDES[slug]

    # Strip known trailing suffixes (iterate to catch multiple)
    cleaned = slug
    changed = True
    while changed:
        changed = False
        for sfx in STRIP_SUFFIXES:
            if cleaned.endswith(sfx):
                cleaned = cleaned[:-len(sfx)]
                changed = True
                break

    # Check overrides again after stripping
    if cleaned in SLUG_OVERRIDES:
        return SLUG_OVERRIDES[cleaned]

    # Pokémon whose base name has hyphens — handle specially
    for base in HYPHEN_BASES:
        if cleaned == base:
            return base  # base form
        if cleaned.startswith(base + '-'):
            form = cleaned[len(base) + 1:]
            return f'{base}_{form}'

    # Default: replace first hyphen with underscore, keep rest
    if '-' in cleaned:
        idx = cleaned.index('-')
        species = cleaned[:idx]
        form    = cleaned[idx + 1:]
        return f'{species}_{form}'

    return cleaned

# ── Core rename logic ─────────────────────────────────────────────────────────

def collect_ids(folder):
    """Return list of (filepath, int_id) for pure-number PNGs."""
    results = []
    if not os.path.isdir(folder):
        return results
    for fname in os.listdir(folder):
        base, ext = os.path.splitext(fname)
        if ext.lower() == '.png' and base.isdigit():
            results.append((os.path.join(folder, fname), int(base)))
    return results

def collect_form_files(folder):
    """Return list of (filepath, dex_id, form_suffix) for {id}-{form}.png files."""
    results = []
    if not os.path.isdir(folder):
        return results
    import re
    pat = re.compile(r'^(\d+)-(.+)$')
    for fname in os.listdir(folder):
        base, ext = os.path.splitext(fname)
        if ext.lower() != '.png':
            continue
        m = pat.match(base)
        if m:
            results.append((os.path.join(folder, fname), int(m.group(1)), m.group(2)))
    return results

def build_rename_map(theme_dir, cache):
    """Return list of (src_path, dst_path) renames for a theme folder and its subdirs."""
    renames = []
    skipped = []
    unknown = []

    # All folders recursively (root + shiny + female + shiny/female etc.)
    subdirs = []
    for root, dirs, files in os.walk(theme_dir):
        subdirs.append(root)

    total_ids = set()
    for folder in subdirs:
        for fpath, pid in collect_ids(folder):
            total_ids.add(pid)

    # Fetch all names not yet in cache
    ids_to_fetch = [pid for pid in sorted(total_ids) if str(pid) not in cache]
    if ids_to_fetch:
        print(f'  Fetching {len(ids_to_fetch)} IDs from PokeAPI...')
    for pid in ids_to_fetch:
        fetch_pokemon_name(pid, cache)
    if ids_to_fetch:
        save_cache(cache)

    for folder in subdirs:
        # Process {id}-{form}.png files
        for fpath, dex_id, form_sfx in sorted(collect_form_files(folder), key=lambda x: (x[1], x[2])):
            key = (dex_id, form_sfx)
            if key not in FORM_NAME_MAP:
                skipped.append((fpath, f'no mapping for {dex_id}-{form_sfx}'))
                continue
            our_name = FORM_NAME_MAP[key]
            if our_name is None:
                skipped.append((fpath, f'{dex_id}-{form_sfx} — intentionally skipped'))
                continue
            dst = os.path.join(folder, our_name + '.png')
            if os.path.exists(dst) and os.path.abspath(dst) != os.path.abspath(fpath):
                skipped.append((fpath, f'target {our_name}.png already exists'))
                continue
            if os.path.abspath(dst) == os.path.abspath(fpath):
                continue
            renames.append((fpath, dst))

        for fpath, pid in sorted(collect_ids(folder), key=lambda x: x[1]):
            if pid == 0:
                skipped.append((fpath, 'ID 0 — placeholder'))
                continue

            slug = cache.get(str(pid))
            if slug is None:
                skipped.append((fpath, f'ID {pid} not found in PokeAPI'))
                continue

            our_name = slug_to_our_name(slug)
            if our_name is None:
                skipped.append((fpath, f'{pid} ({slug}) — intentionally skipped'))
                continue

            dst = os.path.join(folder, our_name + '.png')

            if os.path.exists(dst) and os.path.abspath(dst) != os.path.abspath(fpath):
                skipped.append((fpath, f'target {our_name}.png already exists'))
                continue

            if os.path.abspath(dst) == os.path.abspath(fpath):
                continue  # already correctly named

            renames.append((fpath, dst))

    return renames, skipped

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print(f'{"DRY RUN" if DRY_RUN else "APPLYING"} sprite renaming\n')
    cache = load_cache()
    grand_total = 0

    for theme in THEMES:
        theme_dir = os.path.join(SPRITES_DIR, theme)
        if not os.path.isdir(theme_dir):
            print(f'[SKIP] {theme} folder not found')
            continue

        print(f'== {theme} =================================')
        renames, skipped = build_rename_map(theme_dir, cache)

        for src, dst in renames:
            rel_src = os.path.relpath(src, SPRITES_DIR)
            rel_dst = os.path.relpath(dst, SPRITES_DIR)
            if DRY_RUN:
                print(f'  {rel_src}  ->  {rel_dst}')
            else:
                try:
                    os.rename(src, dst)
                    print(f'  renamed: {rel_src}  ->  {rel_dst}')
                except FileExistsError:
                    print(f'  SKIP (target exists): {rel_dst}')

        if skipped:
            print(f'\n  SKIPPED ({len(skipped)}):')
            for fpath, reason in skipped[:30]:
                print(f'    {os.path.relpath(fpath, SPRITES_DIR)}: {reason}')
            if len(skipped) > 30:
                print(f'    ... and {len(skipped) - 30} more')

        print(f'  Total renames: {len(renames)}\n')
        grand_total += len(renames)

    save_cache(cache)
    print(f'Grand total: {grand_total} files {"to rename" if DRY_RUN else "renamed"}')
    if DRY_RUN:
        print('\nRun with --apply to execute.\n')

if __name__ == '__main__':
    main()
