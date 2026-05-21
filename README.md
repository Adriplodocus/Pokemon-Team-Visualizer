# Pokémon Team Visualizer

Genera tu overlay de equipo Pokémon para OBS en segundos, directamente desde el navegador.

---

### ¿Cómo usarlo?

1. Abre [pokemon.mrklypp.com](https://pokemon.mrklypp.com) en tu navegador.
2. Escribe los nombres de tus Pokémon exactamente como aparecen en el juego.
3. Escribe el mote deseado; si lo dejas vacío, se usará el nombre original.
4. Selecciona las propiedades (género, skin, shiny), layout y opciones gráficas.
5. Pulsa **Generar y descargar** — obtendrás un archivo `TeamVisualizer.html`.

### Cómo añadirlo a OBS

1. Añade una **Browser Source** en OBS y selecciona `TeamVisualizer.html` como archivo local.
2. Tamaño recomendado: **1350×265** (horizontal) o **265×1350** (vertical).
3. Marca "Apagar fuente cuando no sea visible".
4. Para actualizar el equipo, regenera el archivo y reemplázalo en la misma ruta.

### Recomendaciones

Usa Stream Deck, Touch Portal (móvil) o Lioranboard para ocultar/mostrar la fuente fácilmente.

---

Generate your Pokémon team overlay for OBS in seconds, directly from your browser.

---

### Setup

1. Open [pokemon.mrklypp.com](https://pokemon.mrklypp.com) in your browser.
2. Enter your Pokémon names exactly as they appear in-game.
3. Enter a nickname; if left empty, the original name will be used.
4. Select properties (gender, skin, shiny), layout, and graphic options.
5. Click **Generate & Download** — you'll get a `TeamVisualizer.html` file.

### How to add it to OBS

1. Add a **Browser Source** in OBS and select `TeamVisualizer.html` as a local file.
2. Recommended size: **1350×265** (horizontal) or **265×1350** (vertical).
3. Check "Turn off source when not visible".
4. To update your team, regenerate the file and replace it at the same path.

### Recommendations

Use Stream Deck, Touch Portal (mobile) or Lioranboard to easily show/hide the source.

---

### Development

**`scripts/generate_pokemon_list.py`** — Regenerates `pokemon-list.json` by scanning the `sprites/` folder.

```bash
python scripts/generate_pokemon_list.py
```

**`scripts/pokemon_catalog.py`** — Source of truth for Pokémon forms and skins. Mirror changes to `pokemon-catalog.js`.

---

www.twitch.tv/MrKlypp · www.x.com/MrKlypp · www.instagram.com/MrKlypp
