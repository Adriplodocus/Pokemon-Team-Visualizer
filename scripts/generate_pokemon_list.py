import os, json

sprites_dir = os.path.join(os.path.dirname(__file__), '..', 'sprites')
names = sorted(set(
    f[:-4] for f in os.listdir(sprites_dir)
    if f.endswith('.gif')
    and not f.endswith(' (1).gif')
    and not f.endswith('-f.gif')
    and '-' not in f[:-4]
    and '(' not in f[:-4]
))

output = os.path.join(os.path.dirname(__file__), '..', 'pokemon-list.json')
with open(output, 'w', encoding='utf-8') as f:
    json.dump(names, f)

print(f'Generated {len(names)} names -> pokemon-list.json')
