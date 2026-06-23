const TOKEN_TTL_MS  = 86400000; // 24h
const CACHE_TTL_S   = 82800;    // 23h (under token TTL)
const CACHE_KEY_URL = 'https://cache.internal/ably-subscribe-token';

export async function onRequestGet(context) {
    if (!context.env.ABLY_API_KEY) {
        return json({ error: 'ABLY_API_KEY not configured' }, 503);
    }

    const cache = caches.default;
    const cacheKey = new Request(CACHE_KEY_URL);
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    try {
        const keyName = context.env.ABLY_API_KEY.split(':')[0];
        const resp    = await fetch(`https://rest.ably.io/keys/${keyName}/requestToken`, {
            method:  'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(context.env.ABLY_API_KEY),
                'Content-Type':  'application/json',
            },
            body: JSON.stringify({
                keyName:    keyName,
                capability: JSON.stringify({ '*': ['subscribe'] }),
                ttl:        TOKEN_TTL_MS,
            }),
        });
        const text = await resp.text();
        let data;
        try { data = JSON.parse(text); } catch { data = { error: text }; }

        const response = json(data, resp.ok ? 200 : resp.status);
        if (resp.ok) {
            response.headers.set('Cache-Control', `public, max-age=${CACHE_TTL_S}`);
            await cache.put(cacheKey, response.clone());
        }
        return response;
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
