import { parseCookies } from '../../_lib/cookies.js';
import { verifyJWT } from '../../_lib/jwt.js';
import { getDB } from '../../_lib/db.js';
import { getAppToken } from '../_lib/botToken.js';

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
        const appToken = await getAppToken(context.env);
        if (appToken) {
            const delRes = await fetch(
                `https://api.twitch.tv/helix/eventsub/subscriptions?id=${subscriptionId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Client-Id': context.env.TWITCH_CLIENT_ID,
                        'Authorization': `Bearer ${appToken}`,
                    },
                }
            );
            if (!delRes.ok && delRes.status !== 404) {
                console.error('Twitch EventSub delete failed', delRes.status);
            }
        }
    } catch (e) {
        console.error('Twitch EventSub delete failed (network error)', e);
    }

    try {
        await sql`DELETE FROM bot_eventsub_subscriptions WHERE user_id = ${payload.userId}`;
    } catch (e) {
        console.error('DB error deleting subscription', e);
        return json({ error: 'Service unavailable' }, 503);
    }

    return json({ ok: true });
}
