# Plan: Sistema freemium con Neon

## Contexto
Se implementa un modelo freemium para monetizar la app:
- **Free**: 5 publicaciones/día en OBS, sin vista previa en vivo
- **Pro**: publicaciones ilimitadas + vista previa en vivo
- Base de datos: Neon (PostgreSQL serverless) — nueva app en cuenta existente
- Pago: infraestructura preparada, procesador a decidir después (license keys manuales por ahora)

El `channelId` (UUID en localStorage) actúa como identificador de "usuario". Se almacena en Neon como clave primaria de la tabla `channels`.

---

## Pasos previos (manuales)

### 1. Crear nueva app en Neon
Ir a console.neon.tech → New project → copiar el `DATABASE_URL`.

### 2. Ejecutar schema SQL en la consola de Neon

```sql
CREATE TABLE IF NOT EXISTS channels (
  id            UUID        PRIMARY KEY,
  plan          TEXT        NOT NULL DEFAULT 'free',
  publish_count INT         NOT NULL DEFAULT 0,
  publish_date  DATE        NOT NULL DEFAULT CURRENT_DATE,
  license_key   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS license_keys (
  key        TEXT        PRIMARY KEY,
  used_by    UUID        REFERENCES channels(id),
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3. Añadir variable de entorno en Cloudflare Pages
Settings → Environment Variables → añadir `DATABASE_URL` (el connection string de Neon).

---

## Cambios de código

### `package.json` (nuevo en raíz)
```json
{
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4"
  }
}
```
Cloudflare Pages lo instala automáticamente en cada deploy.

---

### `functions/api/publish.js` (modificar)
Añadir al inicio del handler, antes de llamar a Ably:

```js
import { neon } from '@neondatabase/serverless';

// Dentro de onRequestPost, antes del fetch a Ably:
const sql   = neon(context.env.DATABASE_URL);
const today = new Date().toISOString().slice(0, 10);

const [row] = await sql`
  INSERT INTO channels (id, publish_date)
  VALUES (${id}, ${today})
  ON CONFLICT (id) DO UPDATE SET
    publish_count = CASE
      WHEN channels.publish_date < ${today} THEN 0
      ELSE channels.publish_count
    END,
    publish_date = ${today}
  RETURNING plan, publish_count
`;

if (row.plan === 'free' && row.publish_count >= 5) {
  return json({ error: 'limit_reached', remaining: 0 }, 429);
}

await sql`UPDATE channels SET publish_count = publish_count + 1 WHERE id = ${id}`;

// ... código Ably existente sin cambios ...

const remaining = row.plan === 'pro' ? null : 4 - row.publish_count;
// Cambiar el return final a: return json({ ok: true, remaining });
```

---

### `functions/api/status.js` (nuevo)
GET `/api/status?id=UUID`

- Si el canal no existe en BD → devuelve plan free con count 0
- Si `publish_date < hoy` → count efectivo es 0
- Si plan = pro → `remaining: null`

```json
{ "plan": "free", "remaining": 3, "limit": 5 }
```

---

### `functions/api/activate.js` (nuevo)
POST `/api/activate` con body `{ id, key }`

1. Busca `key` en `license_keys`
2. Si no existe → 404
3. Si `used_by` ya tiene valor → 409
4. Actualiza `channels` a `plan = 'pro'`
5. Marca `license_keys.used_by = id`, `used_at = now()`
6. Devuelve `{ ok: true }`

Para dar licencias manualmente (hasta integrar el pago):
```sql
INSERT INTO license_keys (key) VALUES ('CLAVE-AQUI');
```

---

### `app.js` (modificar)

**Nueva variable de estado:**
```js
let proStatus = { plan: 'free', remaining: 5 };
```

**`initStatus()` — llamar tras `initChannelId()` en el init:**
- GET `/api/status?id=channelId`
- Actualiza `proStatus`
- Llama a `renderStatus()`

**`renderStatus()` — actualiza badge en UI:**
- Free: "Free · X/5 hoy"
- Pro: "Pro ✓"

**`publishToObs()` — modificar:**
- Leer `remaining` de la respuesta y actualizar `proStatus`
- Si 429: mostrar mensaje de límite con CTA de upgrade

**`togglePreview()` — modificar:**
- Si `proStatus.plan !== 'pro'`: mostrar "Vista previa disponible en Pro" en lugar de activar

**Nueva función `activateLicense()`:**
- Lee input de clave
- POST `/api/activate`
- Si OK: recargar status

**i18n nuevas claves (ES + EN):**
- `statusFree`: "Free · %d/5 hoy" / "Free · %d/5 today"
- `statusPro`: "Pro ✓"
- `limitReached`: "Límite diario alcanzado." / "Daily limit reached."
- `previewProOnly`: "Vista previa disponible en Pro." / "Live preview available on Pro."
- `licenseKey`: "Clave de licencia" / "License key"
- `activate`: "Activar" / "Activate"
- `activateOk`: "¡Pro activado!" / "Pro activated!"
- `activateErr`: "Clave no válida o ya utilizada." / "Invalid or already used key."

---

### `index.html` (modificar)
- Badge de status junto al botón "📡 Publicar en OBS"
- Input de clave de licencia + botón "Activar" en el bloque OBS hint

### `style.css` (modificar)
- `.status-badge` — pill con color según plan (gris free, accent pro)
- `.license-row` — input + botón en línea, estilo similar a `.obs-url-row`

---

## Archivos a tocar
| Archivo | Cambio |
|---|---|
| `package.json` | Nuevo — `@neondatabase/serverless` |
| `functions/api/publish.js` | Añade lógica de límite Neon |
| `functions/api/status.js` | Nuevo |
| `functions/api/activate.js` | Nuevo |
| `app.js` | Estado pro, renderStatus, gate preview, activate |
| `index.html` | Badge, input licencia |
| `style.css` | Estilos badge y license-row |

---

## Verificación
1. Publicar 5 veces → la 6ª devuelve 429 y la UI lo muestra
2. Insertar key manualmente en Neon → activar desde UI → plan pasa a Pro
3. Con Pro: publicaciones ilimitadas + vista previa funciona
4. Con Free: vista previa muestra mensaje de upgrade
