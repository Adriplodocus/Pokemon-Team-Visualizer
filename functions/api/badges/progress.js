import { parseCookies } from '../_lib/cookies.js';
import { verifyJWT }    from '../_lib/jwt.js';
import { getDB }        from '../_lib/db.js';

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

function auth(context) {
    const cookies = parseCookies(context.request);
    return verifyJWT(cookies.auth, context.env.JWT_SECRET);
}

export async function onRequestGet(context) {
    const payload = await auth(context);
    if (!payload) return json({ error: 'Unauthorized' }, 401);

    let rows;
    try {
        const sql = getDB(context.env);
        rows = await sql`
            SELECT game, active, layout
            FROM badge_progress
            WHERE user_id = ${payload.userId}
        `;
    } catch (e) {
        console.error('DB error in GET /api/badges/progress', e);
        return json({ error: 'Service unavailable' }, 503);
    }

    const result = {};
    for (const row of rows) result[row.game] = { active: row.active, layout: row.layout };
    return json(result);
}

export async function onRequestPost(context) {
    const payload = await auth(context);
    if (!payload) return json({ error: 'Unauthorized' }, 401);

    let body;
    try { body = await context.request.json(); }
    catch { return json({ error: 'Invalid JSON' }, 400); }

    const { game, active, layout } = body;
    if (typeof game !== 'string' || !game) return json({ error: 'Invalid game' }, 400);
    if (!Array.isArray(active))            return json({ error: 'Invalid active' }, 400);
    if (typeof layout !== 'string' || !layout) return json({ error: 'Invalid layout' }, 400);

    try {
        const sql = getDB(context.env);
        await sql`
            INSERT INTO badge_progress (user_id, game, active, layout, updated_at)
            VALUES (${payload.userId}, ${game}, ${JSON.stringify(active)}::jsonb, ${layout}, NOW())
            ON CONFLICT (user_id, game)
            DO UPDATE SET
                active     = EXCLUDED.active,
                layout     = EXCLUDED.layout,
                updated_at = NOW()
        `;
    } catch (e) {
        console.error('DB error in POST /api/badges/progress', e);
        return json({ error: 'Service unavailable' }, 503);
    }

    return json({ ok: true });
}
