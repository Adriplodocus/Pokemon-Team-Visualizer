import { parseCookies } from './_lib/cookies.js';
import { verifyJWT } from './_lib/jwt.js';
import { getDB } from './_lib/db.js';

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

function authCheck(context) {
    const cookies = parseCookies(context.request);
    return verifyJWT(cookies.auth, context.env.JWT_SECRET);
}

export async function onRequestGet(context) {
    const payload = await authCheck(context);
    if (!payload) return json({ error: 'Unauthorized' }, 401);

    let rows;
    try {
        const sql = getDB(context.env);
        rows = await sql`SELECT state FROM users WHERE id = ${payload.userId}`;
    } catch (e) {
        console.error('DB error in GET /api/state', e);
        return json({ error: 'Service unavailable' }, 503);
    }

    if (!rows.length) return json({ error: 'User not found' }, 401);
    return json(rows[0].state || {});
}

export async function onRequestPost(context) {
    const payload = await authCheck(context);
    if (!payload) return json({ error: 'Unauthorized' }, 401);

    let body;
    try { body = await context.request.json(); }
    catch { return json({ error: 'Invalid JSON' }, 400); }

    try {
        const sql = getDB(context.env);
        await sql`
            UPDATE users SET state = ${JSON.stringify(body)}::jsonb
            WHERE id = ${payload.userId}
        `;
    } catch (e) {
        console.error('DB error in POST /api/state', e);
        return json({ error: 'Service unavailable' }, 503);
    }

    return json({ ok: true });
}
