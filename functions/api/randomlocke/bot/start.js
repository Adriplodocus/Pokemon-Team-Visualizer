// Re-export DO class so Cloudflare can register it from this bundle
export { TwitchBotDO } from '../_lib/TwitchBotDO.js';

import { parseCookies } from '../../../_lib/cookies.js';
import { verifyJWT } from '../../../_lib/jwt.js';
import { getDB } from '../../../_lib/db.js';

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

    // Get the user's Twitch username (the channel to join)
    let username;
    try {
        const sql = getDB(context.env);
        const rows = await sql`
            SELECT username FROM users WHERE id = ${payload.userId}
        `;
        if (!rows.length) return json({ error: 'User not found' }, 401);
        username = rows[0].username;
    } catch (e) {
        console.error('DB error in bot/start', e);
        return json({ error: 'Service unavailable' }, 503);
    }

    if (!context.env.TWITCH_BOT) {
        return json({ error: 'Bot not configured' }, 503);
    }

    const id = context.env.TWITCH_BOT.idFromName(payload.userId);
    const stub = context.env.TWITCH_BOT.get(id);

    const doRes = await stub.fetch('https://do/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: username, userId: payload.userId }),
    });

    if (!doRes.ok) return json({ error: 'Bot failed to connect' }, 502);
    return json({ ok: true });
}
