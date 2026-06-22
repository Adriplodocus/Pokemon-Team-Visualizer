import { getDB } from './_lib/db.js';

export async function onRequestPost(context) {
    if (!context.env.ABLY_API_KEY) {
        return json({ error: 'ABLY_API_KEY not configured' }, 503);
    }
    let body;
    try { body = await context.request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

    const { id, event, ...data } = body;
    if (!id || !/^[0-9a-f-]{36}$/.test(id)) return json({ error: 'Invalid id' }, 400);
    if (event && !/^[a-z-]+$/.test(event)) return json({ error: 'Invalid event name' }, 400);

    const resp = await fetch(`https://rest.ably.io/channels/ptv-${id}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(context.env.ABLY_API_KEY),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: event || 'update', data: JSON.stringify(data) }),
    });

    if (!resp.ok) return json({ error: 'Ably error' }, 502);

    if (context.env.DATABASE_URL) {
        try {
            const sql = getDB(context.env);
            if (!event || event === 'update') {
                const rawState = (data.raw && Array.isArray(data.raw.team)) ? data.raw : null;
                const patchObj = { teamState: data };
                if (rawState) {
                    patchObj.team       = rawState.team;
                    patchObj.layout     = rawState.layout;
                    patchObj.shadows    = rawState.shadows;
                    patchObj.bg         = rawState.bg;
                    patchObj.typography = rawState.typography;
                }
                const patch = JSON.stringify(patchObj);
                const teamResult = await sql`
                    UPDATE users
                    SET state = COALESCE(state, '{}'::jsonb) || ${patch}::jsonb
                    WHERE channel_id = ${id}
                    RETURNING id
                `;
                if (!teamResult.length) {
                    const badgePatch = JSON.stringify({ badgeState: data });
                    await sql`
                        UPDATE users
                        SET state = COALESCE(state, '{}'::jsonb) || ${badgePatch}::jsonb
                        WHERE badge_channel_id = ${id}
                    `;
                }
            } else if (event === 'cemetery-update') {
                const patch = JSON.stringify({ cemeteryState: data });
                await sql`
                    UPDATE users
                    SET state = COALESCE(state, '{}'::jsonb) || ${patch}::jsonb
                    WHERE channel_id = ${id}
                `;
            }
        } catch (e) {
            console.error('[publish] DB state save failed:', e.message);
        }
    }

    return json({ ok: true });
}

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
