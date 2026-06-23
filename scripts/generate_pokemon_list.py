import os, json, re

sprites_dir  = os.path.join(os.path.dirname(__file__), '..', 'sprites', 'Showdown')
catalog_path = os.path.join(os.path.dirname(__file__), '..', 'pokemon-catalog.js')

with open(catalog_path, encoding='utf-8') as f:
    text = f.read()

# Build set of base_skin combos to exclude (selectable via skin chips, not standalone names)
excluded = set()
catalog_bases = set()
_skip = {'const', 'POKEMON_CATALOG', 'skin', 'skipBase'}
for match in re.finditer(r'(?:"([^"]+)"|(\w+))\s*:\s*\{[^}]*skin\s*:\s*\[([^\]]*)\]', text):
    base  = match.group(1) or match.group(2)
    if base in _skip:
        continue
    catalog_bases.add(base)
    skins = re.findall(r"'([^']+)'", match.group(3))
    for skin in skins:
        excluded.add(f"{base}_{skin}")

# Pokémon whose canonical species name contains a hyphen
HYPHENATED_SPECIES = {
    'ho-oh', 'porygon-z',
    'jangmo-o', 'hakamo-o', 'kommo-o',
    'chi-yu', 'chien-pao', 'ting-lu', 'wo-chien',
}

from_sprites = set(
    f[:-4] for f in os.listdir(sprites_dir)
    if f.endswith('.gif')
    and not f.endswith(' (1).gif')
    and not f.endswith('-f.gif')
    and ('-' not in f[:-4] or f[:-4] in HYPHENATED_SPECIES)
    and '(' not in f[:-4]
    and f[:-4] not in excluded
)

names = sorted(from_sprites | catalog_bases)

output = os.path.join(os.path.dirname(__file__), '..', 'pokemon-list.json')
with open(output, 'w', encoding='utf-8') as f:
    json.dump(names, f)

print(f'Generated {len(names)} names -> pokemon-list.json')
