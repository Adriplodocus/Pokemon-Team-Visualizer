export async function onRequestGet(context) {
    if (!context.env.ABLY_API_KEY) return json({ error: 'Not configured' }, 503);

    const url    = new URL(context.request.url);
    const id     = url.searchParams.get('id');
    const event  = url.searchParams.get('event');

    if (!id || !/^[0-9a-f-]{36}$/.test(id)) return json({ error: 'Invalid id' }, 400);
    if (event && !/^[a-z-]+$/.test(event))   return json({ error: 'Invalid event' }, 400);

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

        const data = JSON.parse(messages[0].data);
        return json(data);
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
