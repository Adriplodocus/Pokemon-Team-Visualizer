import { getDB } from './_lib/db.js';
import { parseCookies } from './_lib/cookies.js';
import { verifyJWT } from './_lib/jwt.js';

export async function onRequestPost(context) {
    if (!context.env.ABLY_API_KEY) {
        return json({ error: 'ABLY_API_KEY not configured' }, 503);
    }

    const cookies = parseCookies(context.request);
    const payload = await verifyJWT(cookies.auth, context.env.JWT_SECRET);

    let body;
    try { body = await context.request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

    const { id, event, ...data } = body;
    if (!id || !/^[0-9a-f-]{36}$/.test(id)) return json({ error: 'Invalid id' }, 400);
    if (event && !/^[a-z-]+$/.test(event)) return json({ error: 'Invalid event name' }, 400);

    if (context.env.DATABASE_URL) {
        try {
            const sql  = getDB(context.env);
            if (payload) {
                // Authenticated owner: verify they own this channel
                const rows = await sql`
                    SELECT id FROM users
                    WHERE id = ${payload.userId}
                      AND (channel_id = ${id} OR badge_channel_id = ${id})
                `;
                if (!rows.length) {
                    // Not the owner — fall through to external editor check:
                    // channel UUID itself acts as the shared key
                    const channelRows = await sql`
                        SELECT id FROM users
                        WHERE channel_id = ${id} OR badge_channel_id = ${id}
                    `;
                    if (!channelRows.length) return json({ error: 'Forbidden' }, 403);
                }
            } else {
                // External editor: no JWT, but channel UUID acts as the shared key
                const rows = await sql`
                    SELECT id FROM users
                    WHERE channel_id = ${id} OR badge_channel_id = ${id}
                `;
                if (!rows.length) return json({ error: 'Forbidden' }, 403);
            }
        } catch (e) {
            console.error('[publish] ownership check failed:', e.message);
            return json({ error: 'Service unavailable' }, 503);
        }
    } else if (!payload) {
        return json({ error: 'Unauthorized' }, 401);
    }

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
                    patchObj.team    = rawState.team;
                    patchObj.layout  = rawState.layout;
                    patchObj.shadows = rawState.shadows;
                    patchObj.bg      = rawState.bg;
                    if (payload) patchObj.typography = rawState.typography;
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
                const patchObj = {
                    cemeteryState:  data,
                    cemetery:       data.raw || [],
                    cemeteryConfig: { cols: data.cols, rows: data.rows, overflow: data.overflow },
                };
                if (payload && data.typography) {
                    patchObj.cemeteryTypo = data.typography;
                }
                const patch = JSON.stringify(patchObj);
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
