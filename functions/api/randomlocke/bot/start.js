// functions/api/randomlocke/bot/start.js
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

const WEBHOOK_URL = 'https://pokemon.mrklypp.com/api/randomlocke/bot/webhook';

async function createSubscription(env, appToken, broadcasterUserId) {
    return fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
        method: 'POST',
        headers: {
            'Client-Id': env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${appToken}`,
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

    const appToken = await getAppToken(context.env);
    if (!appToken) return json({ error: 'Failed to get app token' }, 502);

    // Cleanup: remove previous subscription if exists
    try {
        const existing = await sql`
            SELECT subscription_id FROM bot_eventsub_subscriptions WHERE user_id = ${payload.userId}
        `;
        if (existing.length) {
            const delRes = await fetch(
                `https://api.twitch.tv/helix/eventsub/subscriptions?id=${existing[0].subscription_id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Client-Id': context.env.TWITCH_CLIENT_ID,
                        'Authorization': `Bearer ${appToken}`,
                    },
                }
            );
            if (!delRes.ok && delRes.status !== 404) {
                console.error('Old subscription cleanup failed', delRes.status);
            }
        }
    } catch (e) {
        console.error('Old subscription cleanup failed (non-fatal)', e);
    }

    console.log('EventSub subscribe attempt', { broadcasterUserId, BOT_USER_ID: context.env.BOT_USER_ID });
    const res = await createSubscription(context.env, appToken, broadcasterUserId);

    if (!res.ok) {
        const errBody = await res.text();
        console.error('EventSub subscribe failed', res.status, errBody);
        return json({ error: 'Failed to start bot' }, 502);
    }

    const data = await res.json();
    const subscriptionId = data.data?.[0]?.id;
    if (!subscriptionId) {
        console.error('EventSub subscribe: unexpected response shape', JSON.stringify(data));
        return json({ error: 'Failed to start bot' }, 502);
    }

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
