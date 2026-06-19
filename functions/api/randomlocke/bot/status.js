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
