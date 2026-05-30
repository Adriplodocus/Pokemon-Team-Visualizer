# Desktop Layout — Diseño

**Fecha:** 2026-05-29  
**Estado:** Aprobado

## Problema

El layout actual tiene `#app` con `max-width: 680px`. En pantallas de escritorio y portátil (≥900px) todos los elementos se apilan en una sola columna estrecha, desaprovechando el espacio horizontal.

## Decisión

Layout de 2 columnas en pantallas ≥900px para las páginas de Pokémon y Medallas. Cementerio sin cambios por ahora.

## Layout

### Páginas afectadas

| Página | Columna izquierda | Columna derecha |
|--------|-------------------|-----------------|
| `index.html` `#section-pokemon` | Team + Presets + Settings | Preview + Actions |
| `index.html` `#section-badges` | Settings + Checkboxes + Brightness | Preview + Actions |
| `badges.html` | Settings + Checkboxes + Brightness | Preview + Actions |

### Páginas sin cambios

- `cemetery.html` — columna única, se revisará en el futuro

### Especificaciones CSS

- `#app` max-width: `1120px` (era `680px`)
- Breakpoint: `@media (min-width: 900px)`
- Grid: `grid-template-columns: 440px 1fr`
- Gap: `20px`
- Columna derecha: `position: sticky; top: 20px; align-self: start` — preview+acciones fijos al hacer scroll
- Mobile `<900px`: sin cambios, columna única igual que ahora

### Clases nuevas en style.css

```css
@media (min-width: 900px) {
  .desktop-layout {
    display: grid;
    grid-template-columns: 440px 1fr;
    gap: 20px;
    align-items: start;
  }
  .desktop-col-right {
    position: sticky;
    top: 20px;
  }
}
```

### Cambios HTML

En cada sección se añaden dos wrappers:

```html
<!-- Antes: cards sueltas -->
<div id="section-pokemon">
  <div class="card card--team">...</div>
  <div class="card card--presets">...</div>
  <div class="card">...</div>       <!-- settings -->
  <div class="card card--preview">...</div>
  <div class="card card--actions">...</div>
</div>

<!-- Después: wrappers de columna -->
<div id="section-pokemon" class="desktop-layout">
  <div class="desktop-col-left">
    <div class="card card--team">...</div>
    <div class="card card--presets">...</div>
    <div class="card">...</div>
  </div>
  <div class="desktop-col-right">
    <div class="card card--preview">...</div>
    <div class="card card--actions">...</div>
  </div>
</div>
```

Misma estructura en `#section-badges` (index.html) y en `badges.html`.

## Archivos a modificar

1. `style.css` — `#app` max-width + media query + clases `.desktop-layout`, `.desktop-col-right`
2. `index.html` — wrappers en `#section-pokemon` y `#section-badges`
3. `badges.html` — wrappers en el contenido principal
