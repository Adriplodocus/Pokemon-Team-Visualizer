export async function onRequestGet(context) {
    if (!context.env.ABLY_API_KEY) {
        return json({ error: 'ABLY_API_KEY not configured' }, 503);
    }
    const keyName = context.env.ABLY_API_KEY.split(':')[0];
    const resp = await fetch(`https://rest.ably.io/keys/${keyName}/requestToken`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(context.env.ABLY_API_KEY),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            capability: JSON.stringify({ '*': ['subscribe'] }),
            ttl: 3600000,
        }),
    });
    const data = await resp.json();
    return json(data, resp.ok ? 200 : 502);
}

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
