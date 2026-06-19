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

    let username;
    try {
        const rows = await sql`
            SELECT username FROM users WHERE id = ${payload.userId}
        `;
        if (!rows.length) return json({ error: 'User not found' }, 401);
        username = rows[0].username;
    } catch (e) {
        console.error('DB error in bot/status', e);
        return json({ error: 'Service unavailable' }, 503);
    }

    try {
        const rows = await sql`
            SELECT subscription_id FROM bot_eventsub_subscriptions WHERE user_id = ${payload.userId}
        `;
        const connected = rows.length > 0;
        return json({ connected, channel: connected ? username : null });
    } catch (e) {
        console.error('DB error fetching subscription', e);
        return json({ error: 'Service unavailable' }, 503);
    }
}
