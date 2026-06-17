import { parseCookies } from '../../_lib/cookies.js';
import { verifyJWT } from '../../_lib/jwt.js';

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

    if (!context.env.TWITCH_BOT) return json({ ok: true });

    const id = context.env.TWITCH_BOT.idFromName(payload.userId);
    const stub = context.env.TWITCH_BOT.get(id);

    await stub.fetch('https://do/disconnect', { method: 'POST' });
    return json({ ok: true });
}
