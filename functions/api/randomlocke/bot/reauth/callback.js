import { getDB } from '../../../_lib/db.js';

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function html(content) {
    return new Response(content, { headers: { 'Content-Type': 'text/html' } });
}

export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error || !code) {
        return html(`<p>OAuth error: ${escapeHtml(error || 'no code received')}</p>`);
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
        return html(`<p>Token exchange failed: ${escapeHtml(err)}</p>`);
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
