import { getDB } from './_lib/db.js';

const LOAD_CACHE_TTL_S = 30;

export async function onRequestGet(context) {
    if (!context.env.ABLY_API_KEY) return json({ error: 'Not configured' }, 503);

    const url   = new URL(context.request.url);
    const id    = url.searchParams.get('id');
    const event = url.searchParams.get('event');

    if (!id || !/^[0-9a-f-]{36}$/.test(id)) return json({ error: 'Invalid id' }, 400);
    if (event && !/^[a-z-]+$/.test(event))   return json({ error: 'Invalid event' }, 400);

    const cache    = caches.default;
    const cacheKey = new Request(context.request.url);
    const cached   = await cache.match(cacheKey);
    if (cached) return cached;

    const respond = async (data) => {
        const r = json(data);
        r.headers.set('Cache-Control', `public, max-age=${LOAD_CACHE_TTL_S}`);
        await cache.put(cacheKey, r.clone());
        return r;
    };

    if (context.env.DATABASE_URL) {
        try {
            const sql = getDB(context.env);
            if (!event || event === 'update') {
                const teamRows = await sql`SELECT state->'teamState' AS data FROM users WHERE channel_id = ${id}`;
                if (teamRows.length && teamRows[0].data) return respond(teamRows[0].data);
                const badgeRows = await sql`SELECT state->'badgeState' AS data FROM users WHERE badge_channel_id = ${id}`;
                if (badgeRows.length && badgeRows[0].data) return respond(badgeRows[0].data);
            } else if (event === 'cemetery-update') {
                const rows = await sql`
                    SELECT CASE
                        WHEN state ? 'cemeteryState' THEN state->'cemeteryState'
                        WHEN state ? 'cemetery' THEN jsonb_build_object(
                            'cemetery',       state->'cemetery',
                            'cemeteryConfig', state->'cemeteryConfig',
                            'cemeteryTypo',   state->'cemeteryTypo'
                        )
                        ELSE NULL
                    END AS data FROM users WHERE channel_id = ${id}
                `;
                if (rows.length && rows[0].data) return respond(rows[0].data);
            }
        } catch (e) {
            console.error('[load] DB lookup failed:', e.message);
        }
    }

    try {
        const ablyUrl = new URL(`https://rest.ably.io/channels/ptv-${id}/messages`);
        ablyUrl.searchParams.set('limit', '1');
        if (event) ablyUrl.searchParams.set('name', event);

        const resp = await fetch(ablyUrl.toString(), {
            headers: { 'Authorization': 'Basic ' + btoa(context.env.ABLY_API_KEY) }
        });
        if (!resp.ok) return json({ error: 'Ably error' }, 502);

        const messages = await resp.json();
        if (!messages || !messages.length) return json({ error: 'No team found' }, 404);

        return respond(JSON.parse(messages[0].data));
    } catch (e) {
        return json({ error: e.message }, 500);
    }
}

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
