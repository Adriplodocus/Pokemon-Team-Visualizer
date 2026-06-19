import { getAppToken } from '../_lib/botToken.js';

export async function onRequestGet(context) {
    const key = new URL(context.request.url).searchParams.get('key');
    if (!key || key !== context.env.ADMIN_KEY) {
        return new Response('Unauthorized', { status: 401 });
    }

    const appToken = await getAppToken(context.env);
    if (!appToken) {
        return new Response(JSON.stringify({ error: 'Failed to get app token' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // List all existing EventSub subscriptions
    const listRes = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
        headers: {
            'Client-Id': context.env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${appToken}`,
        },
    });
    const listData = await listRes.json();

    // Try creating subscription with BOT_USER_ID (correct per Twitch docs)
    const BROADCASTER_ID = '151718302'; // mrklypp
    const botUserId = context.env.BOT_USER_ID;
    const secret = context.env.EVENTSUB_SECRET;

    const body = {
        type: 'channel.chat.message',
        version: '1',
        condition: {
            broadcaster_user_id: BROADCASTER_ID,
            user_id: botUserId,
        },
        transport: {
            method: 'webhook',
            callback: 'https://pokemon.mrklypp.com/api/randomlocke/bot/webhook',
            secret,
        },
    };

    const createRes = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
        method: 'POST',
        headers: {
            'Client-Id': context.env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${appToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    const createBody = await createRes.text();

    return new Response(JSON.stringify({
        botUserId,
        secretLength: secret ? secret.length : 0,
        existingSubscriptions: listData,
        createAttempt: {
            requestBody: body,
            status: createRes.status,
            response: createBody,
        },
    }, null, 2), {
        headers: { 'Content-Type': 'application/json' },
    });
}
