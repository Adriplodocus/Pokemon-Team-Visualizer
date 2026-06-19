import { getDB } from '../../_lib/db.js';

export async function getAppToken(env) {
    const res = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: env.TWITCH_CLIENT_ID,
            client_secret: env.TWITCH_CLIENT_SECRET,
        }),
    });
    if (!res.ok) {
        console.error('App token fetch failed', res.status, await res.text());
        return null;
    }
    const { access_token } = await res.json();
    return access_token;
}

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
