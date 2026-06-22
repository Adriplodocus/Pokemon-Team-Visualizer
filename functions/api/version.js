export function onRequestGet(context) {
    const sha = context.env.CF_PAGES_COMMIT_SHA || 'dev';
    return new Response(JSON.stringify({ v: sha }), {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}
