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
