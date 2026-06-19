# EventSub Bot Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar TwitchBotDO (Durable Object con WebSocket IRC persistente) por Twitch EventSub webhooks + Helix API, eliminando toda duración de DO.

**Architecture:** Cloudflare Pages Functions stateless. `bot/start` crea suscripción EventSub en Twitch, `bot/webhook` recibe eventos de chat y responde vía Helix API, `bot/stop` elimina la suscripción. Sin conexiones persistentes ni DO.

**Tech Stack:** Cloudflare Pages Functions (vanilla JS Workers runtime), Neon PostgreSQL (`@neondatabase/serverless`), Twitch EventSub API, Twitch Helix API.

## Global Constraints

- Sin build step. Vanilla JS ES modules. Sin imports de npm en Functions salvo `@neondatabase/serverless` (ya presente en el proyecto).
- Todas las rutas bajo `functions/api/` siguen el patrón `export async function onRequestGet/Post(context)`.
- Helpers compartidos en `functions/api/_lib/` (db, jwt, cookies). Los de randomlocke en `functions/api/randomlocke/_lib/`.
- URL del webhook hardcodeada: `https://pokemon.mrklypp.com/api/randomlocke/bot/webhook`.
- No hay framework de tests. Verificación con `curl` contra `wrangler pages dev`.
- Auth admin vía header `X-Admin-Key` contra env var `ADMIN_KEY` (patrón existente en `/api/admin/*`).
- No modificar `dist-functions/` — es artifact de deploy, no editar.

---

## Mapa de archivos

| Acción | Archivo |
|--------|---------|
| **Crear** | `functions/api/randomlocke/_lib/botToken.js` |
| **Crear** | `functions/api/randomlocke/bot/webhook.js` |
| **Crear** | `functions/api/randomlocke/bot/reauth.js` |
| **Crear** | `functions/api/randomlocke/bot/reauth/callback.js` |
| **Modificar** | `functions/api/randomlocke/bot/start.js` |
| **Modificar** | `functions/api/randomlocke/bot/stop.js` |
| **Modificar** | `functions/api/randomlocke/bot/status.js` |
| **Modificar** | `wrangler.toml` |
| **Modificar** | `db/schema.sql` (añadir tabla ya ejecutada) |
| **Eliminar** | `functions/api/randomlocke/_lib/TwitchBotDO.js` |
| **Eliminar** | `bot-worker/` (directorio completo) |

---

## Task 1: Extraer botToken lib

**Files:**
- Create: `functions/api/randomlocke/_lib/botToken.js`

**Interfaces:**
- Consumes: `env.DATABASE_URL`, `env.BOT_ACCESS_TOKEN`, `env.BOT_REFRESH_TOKEN`, `env.TWITCH_CLIENT_ID`, `env.TWITCH_CLIENT_SECRET`
- Produces:
  - `getBotToken(env) → Promise<{ access_token: string, refresh_token: string }>`
  - `refreshToken(env, oldRefreshToken: string) → Promise<{ access_token: string, refresh_token: string } | null>`

- [ ] **Step 1: Crear el archivo**

```javascript
// functions/api/randomlocke/_lib/botToken.js
import { getDB } from '../../_lib/db.js';

export async function getBotToken(env) {
    try {
        const sql = getDB(env);
        const rows = await sql`
            SELECT access_token, refresh_token
            FROM bot_global_token
            ORDER BY updated_at DESC
            LIMIT 1
        `;
        if (rows.length) return rows[0];
    } catch (e) {
        console.error('Failed to get bot token from DB', e);
    }
    return {
        access_token: env.BOT_ACCESS_TOKEN,
        refresh_token: env.BOT_REFRESH_TOKEN,
    };
}

export async function refreshToken(env, oldRefreshToken) {
    const res = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: oldRefreshToken,
            client_id: env.TWITCH_CLIENT_ID,
            client_secret: env.TWITCH_CLIENT_SECRET,
        }),
    });

    if (!res.ok) {
        console.error('Token refresh failed', res.status, await res.text());
        return null;
    }

    const { access_token, refresh_token } = await res.json();

    try {
        const sql = getDB(env);
        await sql`
            UPDATE bot_global_token
            SET access_token = ${access_token},
                refresh_token = ${refresh_token},
                updated_at = NOW()
            WHERE id = (SELECT id FROM bot_global_token ORDER BY updated_at DESC LIMIT 1)
        `;
    } catch (e) {
        console.error('Failed to persist refreshed token', e);
    }

    return { access_token, refresh_token };
}
```

- [ ] **Step 2: Verificar que el archivo es accesible**

```bash
node -e "import('./functions/api/randomlocke/_lib/botToken.js').then(m => console.log(Object.keys(m)))"
```
Esperado: `[ 'getBotToken', 'refreshToken' ]`

- [ ] **Step 3: Commit**

```bash
git add functions/api/randomlocke/_lib/botToken.js
git commit -m "feat(bot): extract botToken lib from TwitchBotDO"
```

---

## Task 2: Webhook handler

**Files:**
- Create: `functions/api/randomlocke/bot/webhook.js`

**Interfaces:**
- Consumes: `getBotToken(env)`, `refreshToken(env, rt)` de `../\_lib/botToken.js`; `getDB(env)` de `../../\_lib/db.js`; `env.EVENTSUB_SECRET`, `env.TWITCH_CLIENT_ID`, `env.BOT_USER_ID`
- Produces: `POST /api/randomlocke/bot/webhook` — endpoint público para Twitch EventSub

- [ ] **Step 1: Crear el archivo**

```javascript
// functions/api/randomlocke/bot/webhook.js
import { getBotToken, refreshToken } from '../_lib/botToken.js';
import { getDB } from '../../_lib/db.js';

async function verifySignature(messageId, timestamp, body, signature, secret) {
    const message = messageId + timestamp + body;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
    const expected = 'sha256=' + Array.from(new Uint8Array(sig))
        .map(b => b.toString(16).padStart(2, '0')).join('');
    return signature === expected;
}

async function sendChatMessage(env, token, broadcasterUserId, msg) {
    const body = JSON.stringify({
        broadcaster_id: broadcasterUserId,
        sender_id: env.BOT_USER_ID,
        message: msg,
    });
    const headers = {
        'Client-Id': env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token.access_token}`,
        'Content-Type': 'application/json',
    };

    let res = await fetch('https://api.twitch.tv/helix/chat/messages', {
        method: 'POST', headers, body,
    });

    if (res.status === 401) {
        const newToken = await refreshToken(env, token.refresh_token);
        if (!newToken) return;
        res = await fetch('https://api.twitch.tv/helix/chat/messages', {
            method: 'POST',
            headers: { ...headers, Authorization: `Bearer ${newToken.access_token}` },
            body,
        });
    }

    if (!res.ok) console.error('sendChatMessage failed', res.status, await res.text());
}

export async function onRequestPost(context) {
    const { request, env } = context;

    const messageId  = request.headers.get('Twitch-Eventsub-Message-Id') || '';
    const timestamp  = request.headers.get('Twitch-Eventsub-Message-Timestamp') || '';
    const signature  = request.headers.get('Twitch-Eventsub-Message-Signature') || '';
    const msgType    = request.headers.get('Twitch-Eventsub-Message-Type') || '';

    const rawBody = await request.text();

    const valid = await verifySignature(messageId, timestamp, rawBody, signature, env.EVENTSUB_SECRET);
    if (!valid) return new Response('Forbidden', { status: 403 });

    let payload;
    try { payload = JSON.parse(rawBody); }
    catch { return new Response('Bad Request', { status: 400 }); }

    if (msgType === 'webhook_callback_verification') {
        return new Response(payload.challenge, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
        });
    }

    if (msgType === 'notification') {
        const event = payload.event;
        const broadcasterUserId  = event?.broadcaster_user_id;
        const senderLogin        = event?.chatter_user_login?.toLowerCase();
        const broadcasterLogin   = event?.broadcaster_user_login?.toLowerCase();
        const text               = event?.message?.text?.trim() || '';
        const badges             = event?.badges || [];

        const isBroadcaster = senderLogin === broadcasterLogin;
        const isMod = badges.some(b => b.set_id === 'moderator');
        if (!isBroadcaster && !isMod) return new Response(null, { status: 204 });

        const checkMatch = text.match(/^!check\s+(.+)$/i);
        if (!checkMatch) return new Response(null, { status: 204 });

        const zone = checkMatch[1].trim();
        const normalized = zone.toLowerCase().replace(/\s+/g, '');

        let userId;
        try {
            const sql = getDB(env);
            const rows = await sql`
                SELECT id FROM users
                WHERE provider = 'twitch' AND provider_id = ${broadcasterUserId}
            `;
            if (!rows.length) return new Response(null, { status: 204 });
            userId = rows[0].id;
        } catch (e) {
            console.error('DB error finding user in webhook', e);
            return new Response(null, { status: 204 });
        }

        let found = false;
        try {
            const sql = getDB(env);
            const rows = await sql`
                SELECT id FROM randomlocke_routes
                WHERE user_id = ${userId}
                  AND lower(replace(zone_name, ' ', '')) = ${normalized}
            `;
            found = rows.length > 0;
        } catch (e) {
            console.error('DB error in checkZone', e);
            return new Response(null, { status: 204 });
        }

        const msg = found
            ? `❌ NO puedes capturar en ${zone}.`
            : `✅ SÍ puedes capturar en ${zone}.`;

        const token = await getBotToken(env);
        await sendChatMessage(env, token, broadcasterUserId, msg);
    }

    return new Response(null, { status: 204 });
}
```

- [ ] **Step 2: Verificar HMAC con curl simulando Twitch**

Con `wrangler pages dev` corriendo (con `EVENTSUB_SECRET=testsecret`):

```bash
# Calcula firma correcta con Node.js
node -e "
const crypto = require('crypto');
const id = 'msgid1';
const ts = new Date().toISOString();
const body = JSON.stringify({challenge:'abc123',subscription:{type:'webhook_callback_verification'}});
const sig = 'sha256=' + crypto.createHmac('sha256','testsecret').update(id+ts+body).digest('hex');
console.log('Timestamp:', ts);
console.log('Signature:', sig);
console.log('Body:', body);
"
# Luego usa los valores impresos en este curl:
curl -s -X POST http://localhost:8788/api/randomlocke/bot/webhook \
  -H "Content-Type: application/json" \
  -H "Twitch-Eventsub-Message-Id: msgid1" \
  -H "Twitch-Eventsub-Message-Timestamp: <TIMESTAMP>" \
  -H "Twitch-Eventsub-Message-Signature: <SIGNATURE>" \
  -H "Twitch-Eventsub-Message-Type: webhook_callback_verification" \
  -d '<BODY>'
```
Esperado: respuesta `abc123` con status 200.

- [ ] **Step 3: Verificar que firma incorrecta retorna 403**

```bash
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8788/api/randomlocke/bot/webhook \
  -H "Twitch-Eventsub-Message-Id: msgid1" \
  -H "Twitch-Eventsub-Message-Timestamp: 2026-01-01T00:00:00Z" \
  -H "Twitch-Eventsub-Message-Signature: sha256=invalidsignature" \
  -H "Twitch-Eventsub-Message-Type: webhook_callback_verification" \
  -d '{}'
```
Esperado: `403`

- [ ] **Step 4: Commit**

```bash
git add functions/api/randomlocke/bot/webhook.js
git commit -m "feat(bot): add EventSub webhook handler"
```

---

## Task 3: Migrar bot/start

**Files:**
- Modify: `functions/api/randomlocke/bot/start.js`

**Interfaces:**
- Consumes: `getBotToken`, `refreshToken` de `../_lib/botToken.js`; `env.BOT_USER_ID`, `env.EVENTSUB_SECRET`, `env.TWITCH_CLIENT_ID`; tabla `bot_eventsub_subscriptions`
- Produces: `POST /api/randomlocke/bot/start` → `{ ok: true, channel: string }` o error

- [ ] **Step 1: Reemplazar el archivo completo**

```javascript
// functions/api/randomlocke/bot/start.js
import { parseCookies } from '../../_lib/cookies.js';
import { verifyJWT } from '../../_lib/jwt.js';
import { getDB } from '../../_lib/db.js';
import { getBotToken, refreshToken } from '../_lib/botToken.js';

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

const WEBHOOK_URL = 'https://pokemon.mrklypp.com/api/randomlocke/bot/webhook';

async function createSubscription(env, token, broadcasterUserId) {
    return fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
        method: 'POST',
        headers: {
            'Client-Id': env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'channel.chat.message',
            version: '1',
            condition: {
                broadcaster_user_id: broadcasterUserId,
                user_id: env.BOT_USER_ID,
            },
            transport: {
                method: 'webhook',
                callback: WEBHOOK_URL,
                secret: env.EVENTSUB_SECRET,
            },
        }),
    });
}

export async function onRequestPost(context) {
    const cookies = parseCookies(context.request);
    const payload = await verifyJWT(cookies.auth, context.env.JWT_SECRET);
    if (!payload) return json({ error: 'Unauthorized' }, 401);

    const sql = getDB(context.env);

    let username, broadcasterUserId;
    try {
        const rows = await sql`
            SELECT username, provider_id FROM users WHERE id = ${payload.userId}
        `;
        if (!rows.length) return json({ error: 'User not found' }, 401);
        username = rows[0].username;
        broadcasterUserId = rows[0].provider_id;
    } catch (e) {
        console.error('DB error in bot/start', e);
        return json({ error: 'Service unavailable' }, 503);
    }

    // Cleanup: remove previous subscription if exists
    try {
        const existing = await sql`
            SELECT subscription_id FROM bot_eventsub_subscriptions WHERE user_id = ${payload.userId}
        `;
        if (existing.length) {
            const token = await getBotToken(context.env);
            await fetch(
                `https://api.twitch.tv/helix/eventsub/subscriptions?id=${existing[0].subscription_id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Client-Id': context.env.TWITCH_CLIENT_ID,
                        'Authorization': `Bearer ${token.access_token}`,
                    },
                }
            );
        }
    } catch (e) {
        console.error('Old subscription cleanup failed (non-fatal)', e);
    }

    let token = await getBotToken(context.env);
    let res = await createSubscription(context.env, token, broadcasterUserId);

    if (res.status === 401) {
        const newToken = await refreshToken(context.env, token.refresh_token);
        if (!newToken) return json({ error: 'Bot token refresh failed' }, 502);
        token = newToken;
        res = await createSubscription(context.env, token, broadcasterUserId);
    }

    if (!res.ok) {
        const errBody = await res.text();
        console.error('EventSub subscribe failed', res.status, errBody);
        return json({ error: 'Failed to start bot' }, 502);
    }

    const data = await res.json();
    const subscriptionId = data.data[0].id;

    try {
        await sql`
            INSERT INTO bot_eventsub_subscriptions (user_id, subscription_id)
            VALUES (${payload.userId}, ${subscriptionId})
            ON CONFLICT (user_id) DO UPDATE
                SET subscription_id = EXCLUDED.subscription_id,
                    created_at = NOW()
        `;
    } catch (e) {
        console.error('DB error saving subscription', e);
        return json({ error: 'Service unavailable' }, 503);
    }

    return json({ ok: true, channel: username });
}
```

- [ ] **Step 2: Verificar que sin cookie retorna 401**

```bash
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8788/api/randomlocke/bot/start
```
Esperado: `401`

- [ ] **Step 3: Commit**

```bash
git add functions/api/randomlocke/bot/start.js
git commit -m "feat(bot): migrate start to EventSub subscribe"
```

---

## Task 4: Migrar bot/stop

**Files:**
- Modify: `functions/api/randomlocke/bot/stop.js`

**Interfaces:**
- Consumes: `getBotToken` de `../_lib/botToken.js`; tabla `bot_eventsub_subscriptions`
- Produces: `POST /api/randomlocke/bot/stop` → `{ ok: true }` o error

- [ ] **Step 1: Reemplazar el archivo completo**

```javascript
// functions/api/randomlocke/bot/stop.js
import { parseCookies } from '../../_lib/cookies.js';
import { verifyJWT } from '../../_lib/jwt.js';
import { getDB } from '../../_lib/db.js';
import { getBotToken } from '../_lib/botToken.js';

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function onRequestPost(context) {
    const cookies = parseCookies(context.request);
    const payload = await verifyJWT(cookies.auth, context.env.JWT_SECRET);
    if (!payload) return json({ error: 'Unauthorized' }, 401);

    const sql = getDB(context.env);

    let subscriptionId;
    try {
        const rows = await sql`
            SELECT subscription_id FROM bot_eventsub_subscriptions WHERE user_id = ${payload.userId}
        `;
        if (!rows.length) return json({ ok: true }); // Already stopped
        subscriptionId = rows[0].subscription_id;
    } catch (e) {
        console.error('DB error in bot/stop', e);
        return json({ error: 'Service unavailable' }, 503);
    }

    try {
        const token = await getBotToken(context.env);
        await fetch(
            `https://api.twitch.tv/helix/eventsub/subscriptions?id=${subscriptionId}`,
            {
                method: 'DELETE',
                headers: {
                    'Client-Id': context.env.TWITCH_CLIENT_ID,
                    'Authorization': `Bearer ${token.access_token}`,
                },
            }
        );
    } catch (e) {
        console.error('Twitch EventSub delete failed (non-fatal)', e);
    }

    try {
        await sql`DELETE FROM bot_eventsub_subscriptions WHERE user_id = ${payload.userId}`;
    } catch (e) {
        console.error('DB error deleting subscription', e);
        return json({ error: 'Service unavailable' }, 503);
    }

    return json({ ok: true });
}
```

- [ ] **Step 2: Verificar que sin cookie retorna 401**

```bash
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8788/api/randomlocke/bot/stop
```
Esperado: `401`

- [ ] **Step 3: Commit**

```bash
git add functions/api/randomlocke/bot/stop.js
git commit -m "feat(bot): migrate stop to EventSub unsubscribe"
```

---

## Task 5: Migrar bot/status

**Files:**
- Modify: `functions/api/randomlocke/bot/status.js`

**Interfaces:**
- Consumes: tabla `bot_eventsub_subscriptions`, tabla `users`
- Produces: `GET /api/randomlocke/bot/status` → `{ connected: boolean, channel: string | null }`

- [ ] **Step 1: Reemplazar el archivo completo**

```javascript
// functions/api/randomlocke/bot/status.js
import { parseCookies } from '../../_lib/cookies.js';
import { verifyJWT } from '../../_lib/jwt.js';
import { getDB } from '../../_lib/db.js';

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function onRequestGet(context) {
    const cookies = parseCookies(context.request);
    const payload = await verifyJWT(cookies.auth, context.env.JWT_SECRET);
    if (!payload) return json({ error: 'Unauthorized' }, 401);

    const sql = getDB(context.env);

    try {
        const [subRows, userRows] = await Promise.all([
            sql`SELECT subscription_id FROM bot_eventsub_subscriptions WHERE user_id = ${payload.userId}`,
            sql`SELECT username FROM users WHERE id = ${payload.userId}`,
        ]);
        const connected = subRows.length > 0;
        const channel = connected ? (userRows[0]?.username || null) : null;
        return json({ connected, channel });
    } catch (e) {
        console.error('DB error in bot/status', e);
        return json({ error: 'Service unavailable' }, 503);
    }
}
```

- [ ] **Step 2: Verificar que sin cookie retorna 401**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8788/api/randomlocke/bot/status
```
Esperado: `401`

- [ ] **Step 3: Commit**

```bash
git add functions/api/randomlocke/bot/status.js
git commit -m "feat(bot): migrate status to DB lookup"
```

---

## Task 6: Reauth flow (one-time bot re-authorization)

**Files:**
- Create: `functions/api/randomlocke/bot/reauth.js`
- Create: `functions/api/randomlocke/bot/reauth/callback.js`

**Interfaces:**
- Consumes: `env.ADMIN_KEY`, `env.TWITCH_CLIENT_ID`, `env.TWITCH_CLIENT_SECRET`; tabla `bot_global_token`
- Produces:
  - `GET /api/randomlocke/bot/reauth?key=<ADMIN_KEY>` → redirige a Twitch OAuth
  - `GET /api/randomlocke/bot/reauth/callback?code=...` → intercambia code, guarda token, retorna HTML

**Pre-requisito:** Registrar `https://pokemon.mrklypp.com/api/randomlocke/bot/reauth/callback` como redirect URI en Twitch Developer Console (sección OAuth Redirect URLs de la app).

- [ ] **Step 1: Crear reauth.js**

```javascript
// functions/api/randomlocke/bot/reauth.js
export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (!key || key !== env.ADMIN_KEY) {
        return new Response('Unauthorized', { status: 401 });
    }

    const params = new URLSearchParams({
        client_id: env.TWITCH_CLIENT_ID,
        redirect_uri: 'https://pokemon.mrklypp.com/api/randomlocke/bot/reauth/callback',
        response_type: 'code',
        scope: 'user:read:chat user:write:chat',
        force_verify: 'true',
    });

    return Response.redirect(`https://id.twitch.tv/oauth2/authorize?${params}`, 302);
}
```

- [ ] **Step 2: Crear reauth/callback.js**

```javascript
// functions/api/randomlocke/bot/reauth/callback.js
import { getDB } from '../../../_lib/db.js';

function html(content) {
    return new Response(content, { headers: { 'Content-Type': 'text/html' } });
}

export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error || !code) {
        return html(`<p>OAuth error: ${error || 'no code received'}</p>`);
    }

    const res = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: env.TWITCH_CLIENT_ID,
            client_secret: env.TWITCH_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: 'https://pokemon.mrklypp.com/api/randomlocke/bot/reauth/callback',
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        return html(`<p>Token exchange failed: ${err}</p>`);
    }

    const { access_token, refresh_token } = await res.json();

    try {
        const sql = getDB(env);
        const existing = await sql`SELECT id FROM bot_global_token LIMIT 1`;
        if (existing.length) {
            await sql`
                UPDATE bot_global_token
                SET access_token = ${access_token},
                    refresh_token = ${refresh_token},
                    updated_at = NOW()
                WHERE id = ${existing[0].id}
            `;
        } else {
            await sql`
                INSERT INTO bot_global_token (access_token, refresh_token)
                VALUES (${access_token}, ${refresh_token})
            `;
        }
    } catch (e) {
        console.error('DB error saving bot token', e);
        return html('<p>DB error saving token. Check logs.</p>');
    }

    return html('<p>&#x2705; Bot re-authorized. Token saved. You can close this tab.</p>');
}
```

- [ ] **Step 3: Verificar que sin key retorna 401**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8788/api/randomlocke/bot/reauth
```
Esperado: `401`

- [ ] **Step 4: Verificar que con key válida redirige a Twitch**

```bash
curl -s -o /dev/null -w "%{http_code}" \
  "http://localhost:8788/api/randomlocke/bot/reauth?key=<tu_ADMIN_KEY>"
```
Esperado: `302` con `Location: https://id.twitch.tv/oauth2/authorize?...`

- [ ] **Step 5: Commit**

```bash
git add functions/api/randomlocke/bot/reauth.js functions/api/randomlocke/bot/reauth/callback.js
git commit -m "feat(bot): add one-time reauth flow for new scopes"
```

---

## Task 7: Cleanup — eliminar DO y actualizar config

**Files:**
- Delete: `functions/api/randomlocke/_lib/TwitchBotDO.js`
- Delete: `bot-worker/` (directorio completo)
- Modify: `wrangler.toml`
- Modify: `db/schema.sql`

- [ ] **Step 1: Eliminar TwitchBotDO.js**

```bash
git rm functions/api/randomlocke/_lib/TwitchBotDO.js
```

- [ ] **Step 2: Eliminar bot-worker/**

```bash
git rm -r bot-worker/
```

- [ ] **Step 3: Actualizar wrangler.toml**

Contenido nuevo completo (eliminar binding `TWITCH_BOT`):

```toml
name = "pokemon-team-visualizer"
compatibility_date = "2024-09-23"
```

- [ ] **Step 4: Actualizar db/schema.sql — añadir tabla nueva**

Añadir al final de `db/schema.sql`:

```sql
-- EventSub subscription per user (replaces TwitchBotDO)
CREATE TABLE IF NOT EXISTS bot_eventsub_subscriptions (
  user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  subscription_id TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

- [ ] **Step 5: Verificar que wrangler pages dev arranca sin errores**

```bash
npx wrangler pages dev . --binding ABLY_API_KEY=x --binding DATABASE_URL=x --binding TWITCH_CLIENT_ID=x --binding TWITCH_CLIENT_SECRET=x --binding JWT_SECRET=x --binding ADMIN_KEY=x --binding BOT_USER_ID=x --binding EVENTSUB_SECRET=x --binding BOT_USERNAME=x --binding BOT_ACCESS_TOKEN=x --binding BOT_REFRESH_TOKEN=x
```
Esperado: arranca sin errores de binding ni DO.

- [ ] **Step 6: Commit final**

```bash
git add wrangler.toml db/schema.sql
git commit -m "chore(bot): remove TwitchBotDO and bot-worker, clean config"
```

---

## Post-deploy: Activación

Después de hacer deploy en Cloudflare Pages:

1. Añadir `BOT_USER_ID` y `EVENTSUB_SECRET` en Cloudflare Pages → Settings → Environment Variables.
   - `BOT_USER_ID`: obtener con `curl -H "Authorization: Bearer <BOT_ACCESS_TOKEN>" -H "Client-Id: <TWITCH_CLIENT_ID>" "https://api.twitch.tv/helix/users?login=<BOT_USERNAME>"` → campo `id`.
   - `EVENTSUB_SECRET`: string aleatorio ≥16 chars, e.g. `openssl rand -hex 24`.

2. Registrar redirect URI en Twitch Developer Console: `https://pokemon.mrklypp.com/api/randomlocke/bot/reauth/callback`.

3. Re-autorizar bot: visitar (en navegador, logueado como cuenta bot):
   `https://pokemon.mrklypp.com/api/randomlocke/bot/reauth?key=<ADMIN_KEY>`
   Autorizar los scopes → debe mostrar "✅ Bot re-authorized."

4. Desde la UI, activar el bot (Start). Twitch verificará el webhook automáticamente.

5. Probar con `!check <zona>` en el chat del canal — el bot debe responder.
