# Language Aliases Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extraer los ~18 nombres en español de `pokemon-list.json` a un nuevo `pokemon-aliases.json`, y actualizar `app.js` para cargar ambos archivos y combinarlos en `pokemonNames`, con fallback de sprite al canónico EN si el alias no tiene `.gif` propio.

**Architecture:** Se crea `pokemon-aliases.json` como mapa `{ canonical_en: [alias_es, ...] }`. Al inicio, `app.js` carga ambos archivos en paralelo con `Promise.all`, construye un mapa inverso `ALIAS_TO_CANONICAL` y amplía `pokemonNames` con todos los aliases. `buildSpriteUrl` usa el nombre tal cual pero si falla la imagen hace fallback al sprite del canónico.

**Tech Stack:** Vanilla JS, JSON, fetch API

---

## Archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `pokemon-aliases.json` | Crear | Mapa canónico EN → aliases ES |
| `pokemon-list.json` | Modificar | Eliminar los 18 aliases (quedan en el nuevo archivo) |
| `app.js` | Modificar (líneas ~185-192) | Cargar ambos JSON y construir `pokemonNames` + `ALIAS_TO_CANONICAL` |

---

### Task 1: Crear `pokemon-aliases.json`

**Files:**
- Create: `pokemon-aliases.json`

- [ ] **Step 1: Crear el archivo**

Contenido exacto:

```json
{
  "roaringmoon":  ["bramaluna"],
  "screamtail":   ["colagrito"],
  "ragingbolt":   ["electrofuria"],
  "ironjugulis":  ["ferrocuello"],
  "ironcrown":    ["ferrodada"],
  "irontreads":   ["ferromole"],
  "ironvaliant":  ["ferropaladín"],
  "ironhands":    ["ferropalmas"],
  "ironmoth":     ["ferropolilla"],
  "ironthorns":   ["ferropúas"],
  "ironbundle":   ["ferrosaco"],
  "ironboulder":  ["ferrotesta"],
  "ironleaves":   ["ferroverdor"],
  "gougingfire":  ["flamariete"],
  "brutebonnet":  ["furioseta"],
  "fluttermane":  ["melenaleteo"],
  "walkingwake":  ["ondulagua"],
  "slitherwing":  ["reptalada"]
}
```

- [ ] **Step 2: Verificar JSON válido**

```bash
python3 -c "import json; json.load(open('pokemon-aliases.json')); print('OK')"
```
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add pokemon-aliases.json
git commit -m "feat: add pokemon-aliases.json with ES language variants"
```

---

### Task 2: Limpiar `pokemon-list.json`

**Files:**
- Modify: `pokemon-list.json`

- [ ] **Step 1: Eliminar los 18 aliases del JSON**

```bash
python3 - << 'EOF'
import json

with open('pokemon-list.json') as f:
    data = json.load(f)

with open('pokemon-aliases.json') as f:
    aliases_map = json.load(f)

all_aliases = {a for v in aliases_map.values() for a in v}
result = [n for n in data if n not in all_aliases]

with open('pokemon-list.json', 'w') as f:
    json.dump(result, f, ensure_ascii=False)

print(f'Antes: {len(data)}, Después: {len(result)}, Eliminados: {len(data)-len(result)}')
EOF
```
Expected: `Antes: 1041, Después: 1023, Eliminados: 18`

- [ ] **Step 2: Verificar que los canonicals siguen en la lista**

```bash
python3 - << 'EOF'
import json

with open('pokemon-list.json') as f:
    data = json.load(f)

with open('pokemon-aliases.json') as f:
    aliases_map = json.load(f)

missing = [c for c in aliases_map if c not in data]
print('Canonicals missing:', missing if missing else 'None — OK')
EOF
```
Expected: `Canonicals missing: None — OK`

- [ ] **Step 3: Commit**

```bash
git add pokemon-list.json
git commit -m "feat: remove ES aliases from pokemon-list.json (moved to pokemon-aliases.json)"
```

---

### Task 3: Actualizar `app.js` — carga paralela y construcción de `pokemonNames`

**Files:**
- Modify: `app.js` (~línea 178 y ~línea 185)

- [ ] **Step 1: Añadir variable `ALIAS_TO_CANONICAL`**

Localizar la línea:
```js
let pokemonNames = [];
```

Reemplazarla por:
```js
let pokemonNames = [];
const ALIAS_TO_CANONICAL = {};
```

- [ ] **Step 2: Reemplazar el fetch de `pokemon-list.json` por `Promise.all`**

Localizar este bloque (~línea 185):
```js
fetch('pokemon-list.json')
    .then(r => r.json())
    .then(names => {
        pokemonNames = names;
        for (let i = 0; i < 6; i++) refreshSprite(i);
    })
    .catch(() => {});
```

Reemplazarlo por:
```js
Promise.all([
    fetch('pokemon-list.json').then(r => r.json()),
    fetch('pokemon-aliases.json').then(r => r.json()),
])
.then(([names, aliases]) => {
    for (const [canonical, aliasList] of Object.entries(aliases)) {
        for (const alias of aliasList) {
            ALIAS_TO_CANONICAL[alias] = canonical;
        }
    }
    const allAliases = Object.values(aliases).flat();
    pokemonNames = [...names, ...allAliases];
    for (let i = 0; i < 6; i++) refreshSprite(i);
})
.catch(() => {});
```

- [ ] **Step 3: Verificar en el navegador que el autocomplete funciona con ambos idiomas**

Abrir `index.html` en el navegador. Escribir `bramu` en un slot → debe sugerir `bramaluna`. Escribir `roari` → debe sugerir `roaringmoon`. Ambos deben mostrar sprite.

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat: load pokemon-aliases.json and merge into pokemonNames"
```

---

### Task 4: Fallback de sprite al canónico EN

**Files:**
- Modify: `app.js` (~línea 383 — función `refreshSprite`)

- [ ] **Step 1: Actualizar `refreshSprite` para usar fallback canónico**

Localizar este bloque dentro de `refreshSprite`:
```js
    if (name && pokemonNames.includes(name)) {
        const url         = buildSpriteUrl(name, team[i].properties);
        const fallbackUrl = BASE_URL + encodeURIComponent(name) + '.gif';
        img.onerror = () => {
            if (img.src !== fallbackUrl) {
                img.src = fallbackUrl;
            } else {
                img.classList.remove('visible');
                img.onerror = null;
            }
        };
```

Reemplazarlo por:
```js
    if (name && pokemonNames.includes(name)) {
        const url         = buildSpriteUrl(name, team[i].properties);
        const canonical   = ALIAS_TO_CANONICAL[name];
        const fallbackUrl = canonical
            ? BASE_URL + encodeURIComponent(canonical) + '.gif'
            : BASE_URL + encodeURIComponent(name) + '.gif';
        img.onerror = () => {
            if (img.src !== fallbackUrl) {
                img.src = fallbackUrl;
            } else {
                img.classList.remove('visible');
                img.onerror = null;
            }
        };
```

- [ ] **Step 2: Verificar fallback en el navegador**

Escribir `bramaluna` → si `bramaluna.gif` existe, carga normalmente. Para probar el fallback, renombrar temporalmente `sprites/bramaluna.gif` a `sprites/bramaluna.gif.bak`, recargar → debe mostrar `roaringmoon.gif`. Restaurar el archivo tras la prueba.

```bash
mv sprites/bramaluna.gif sprites/bramaluna.gif.bak
# Probar en navegador
mv sprites/bramaluna.gif.bak sprites/bramaluna.gif
```

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: fallback to canonical EN sprite when alias sprite is missing"
```
