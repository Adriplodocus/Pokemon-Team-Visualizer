import { parseCookies } from '../../_lib/cookies.js';
import { verifyJWT } from '../../_lib/jwt.js';
import { getDB } from '../../_lib/db.js';
import { getBotToken, getAppToken } from '../_lib/botToken.js';

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

const WEBHOOK_URL = 'https://pokemon.mrklypp.com/api/randomlocke/bot/webhook';

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
            await fetch(
                `https://api.twitch.tv/helix/eventsub/subscriptions?id=${existing[0].subscription_id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Client-Id': context.env.TWITCH_CLIENT_ID,
                        'Authorization': `Bearer ${appToken}`,
                    },
                }
            );
        }
    } catch (e) {
        console.error('Old subscription cleanup failed (non-fatal)', e);
    }

    const res = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
        method: 'POST',
        headers: {
            'Client-Id': context.env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${appToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'channel.chat.message',
            version: '1',
            condition: {
                broadcaster_user_id: broadcasterUserId,
                user_id: context.env.BOT_USER_ID,
            },
            transport: {
                method: 'webhook',
                callback: WEBHOOK_URL,
                secret: context.env.EVENTSUB_SECRET,
            },
        }),
    });

    let subscriptionId;

    if (res.status === 409) {
        // Already exists on Twitch — fetch existing ID
        const listRes = await fetch(
            `https://api.twitch.tv/helix/eventsub/subscriptions?type=channel.chat.message`,
            {
                headers: {
                    'Client-Id': context.env.TWITCH_CLIENT_ID,
                    'Authorization': `Bearer ${appToken}`,
                },
            }
        );
        if (listRes.ok) {
            const list = await listRes.json();
            const sub = list.data?.find(s => s.condition?.broadcaster_user_id === broadcasterUserId);
            subscriptionId = sub?.id;
        }
    } else if (res.ok) {
        const data = await res.json();
        subscriptionId = data.data?.[0]?.id;
    } else {
        const errBody = await res.text();
        console.error('EventSub subscribe failed', res.status, errBody);
        return json({ error: 'Failed to start bot' }, 502);
    }

    if (!subscriptionId) {
        console.error('EventSub subscribe: could not determine subscription ID');
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
