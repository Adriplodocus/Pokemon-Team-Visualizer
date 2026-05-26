export async function onRequestPost(context) {
    if (!context.env.ABLY_API_KEY) {
        return json({ error: 'ABLY_API_KEY not configured' }, 503);
    }
    let body;
    try { body = await context.request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

    const { id, event, ...data } = body;
    if (!id || !/^[0-9a-f-]{36}$/.test(id)) return json({ error: 'Invalid id' }, 400);

    const resp = await fetch(`https://rest.ably.io/channels/ptv-${id}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(context.env.ABLY_API_KEY),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: event || 'update', data: JSON.stringify(data) }),
    });

    return resp.ok ? json({ ok: true }) : json({ error: 'Ably error' }, 502);
}

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
