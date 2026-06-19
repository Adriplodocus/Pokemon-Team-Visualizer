import { getBotToken } from '../_lib/botToken.js';

export async function onRequestGet(context) {
    const key = new URL(context.request.url).searchParams.get('key');
    if (!key || key !== context.env.ADMIN_KEY) {
        return new Response('Unauthorized', { status: 401 });
    }
    const token = await getBotToken(context.env);
    const res = await fetch('https://id.twitch.tv/oauth2/validate', {
        headers: { Authorization: `OAuth ${token.access_token}` },
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
    });
}
