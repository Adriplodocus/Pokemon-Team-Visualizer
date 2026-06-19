# Diseño: Migración bot Twitch IRC (DO) → EventSub Webhooks

**Fecha:** 2026-06-19  
**Estado:** Aprobado

## Problema

`TwitchBotDO` mantiene WebSocket IRC persistente con alarmas cada 2 min. El DO nunca evicta → duración acumulada 24/7 → excede free tier de Durable Objects.

## Solución

Eliminar el DO completamente. Usar Twitch EventSub (webhooks) para recibir mensajes de chat y Helix API para responder. Arquitectura stateless — cero duración DO.

---

## Flujo

### Activar bot (start)
1. `POST /api/randomlocke/bot/start` — auth JWT
2. Obtener `provider_id` (Twitch broadcaster ID) y `username` de `users` table
3. Obtener token del bot de `bot_global_token`
4. Si ya existe suscripción en DB para este usuario → eliminarla en Twitch primero (cleanup)
5. Llamar `POST /helix/eventsub/subscriptions` con `channel.chat.message`
6. Guardar `subscription_id` en `bot_eventsub_subscriptions` (upsert)

### Desactivar bot (stop)
1. `POST /api/randomlocke/bot/stop` — auth JWT
2. Obtener `subscription_id` de DB
3. Llamar `DELETE /helix/eventsub/subscriptions?id=<subscription_id>`
4. Borrar fila de DB

### Estado (status)
1. `GET /api/randomlocke/bot/status` — auth JWT
2. Consultar `bot_eventsub_subscriptions` para este `user_id`
3. Devolver `{ connected: boolean, channel: username | null }`

### Webhook (por cada mensaje de chat)
1. `POST /api/randomlocke/bot/webhook` — público, no auth JWT
2. Verificar firma HMAC-SHA256 con `EVENTSUB_SECRET`
3. Si tipo `webhook_callback_verification` → responder con `challenge` en texto plano
4. Si tipo `notification`:
   - Extraer `broadcaster_user_id`, `chatter_user_login`, badges, texto
   - Filtrar: solo `!check <zona>`
   - Filtrar: solo broadcaster o mod
   - Buscar usuario en DB por `provider_id = broadcaster_user_id`
   - Consultar `randomlocke_routes`
   - Llamar `POST /helix/chat/messages` con respuesta
5. Responder 204

### Re-auth bot (one-time)
- `GET /api/randomlocke/bot/reauth` — protegido por JWT + rol admin
- Redirige a OAuth Twitch con scopes `user:read:chat user:write:chat`
- Callback en `GET /api/randomlocke/bot/reauth/callback`
- Actualiza `bot_global_token` con nuevos tokens

---

## Archivos

### Crear
| Archivo | Propósito |
|---------|-----------|
| `functions/api/randomlocke/bot/webhook.js` | Handler EventSub |
| `functions/api/randomlocke/bot/reauth.js` | OAuth re-auth bot (admin) |
| `functions/api/randomlocke/bot/reauth/callback.js` | Callback OAuth bot |
| `functions/api/randomlocke/_lib/botToken.js` | `getBotToken()` + `refreshToken()` |

### Modificar
| Archivo | Cambio |
|---------|--------|
| `functions/api/randomlocke/bot/start.js` | Helix EventSub subscribe + DB upsert |
| `functions/api/randomlocke/bot/stop.js` | Helix EventSub delete + DB delete |
| `functions/api/randomlocke/bot/status.js` | DB lookup en vez de DO |
| `wrangler.toml` | Eliminar binding `TWITCH_BOT` |
| `db/schema.sql` | Añadir tabla `bot_eventsub_subscriptions` (ya ejecutado en Neon) |

### Eliminar
- `functions/api/randomlocke/_lib/TwitchBotDO.js`
- `bot-worker/` (directorio completo)

---

## Base de datos

```sql
-- Ya ejecutado en Neon
CREATE TABLE IF NOT EXISTS bot_eventsub_subscriptions (
  user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  subscription_id TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Variables de entorno (nuevas)

| Var | Descripción |
|-----|-------------|
| `BOT_USER_ID` | ID numérico Twitch del bot (lookup con `GET /helix/users?login=<BOT_USERNAME>`) |
| `EVENTSUB_SECRET` | String aleatorio ≥16 chars para verificar firma HMAC del webhook |

Existentes que se mantienen: `BOT_USERNAME`, `BOT_ACCESS_TOKEN`, `BOT_REFRESH_TOKEN`, `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`.

---

## Manejo de errores

| Caso | Comportamiento |
|------|---------------|
| Token bot expirado (401 Helix) | `refreshToken()` → reintenta una vez → actualiza DB |
| Suscripción duplicada en start | Eliminar vieja en Twitch → crear nueva → upsert DB |
| HMAC inválido en webhook | 403, no procesar |
| Usuario no encontrado por `broadcaster_user_id` | Log + 204 (Twitch no debe recibir error) |
| DB error en checkZone | Log + no responder en chat |
| Mensaje no es `!check` | Ignorar, 204 |
| Sender no es broadcaster ni mod | Ignorar, 204 |

---

## Seguridad

- Webhook es endpoint público — toda seguridad viene de la verificación HMAC
- `EVENTSUB_SECRET` nunca en logs ni respuestas
- `reauth` y `reauth/callback` protegidos: solo admin puede acceder
- Token bot solo en `bot_global_token` DB + env vars (no en código)

---

## Notas de implementación

- URL del webhook hardcodeada: `https://pokemon.mrklypp.com/api/randomlocke/bot/webhook`
- La URL de callback OAuth del reauth (`/api/randomlocke/bot/reauth/callback`) debe estar registrada en Twitch Developer Console como redirect URI válida
- El check de admin en `reauth` sigue el mismo patrón que `/api/admin/*` existentes

---

## Pasos de activación (post-deploy)

1. Añadir `BOT_USER_ID` y `EVENTSUB_SECRET` a Cloudflare Pages env vars
2. Hacer re-auth del bot visitando `/api/randomlocke/bot/reauth` como admin
3. Verificar token nuevo en `bot_global_token`
4. Activar bot desde la UI (start) → Twitch verifica el webhook automáticamente
5. Confirmar con `!check <zona>` en chat
