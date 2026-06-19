export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (!key || key !== env.ADMIN_KEY) {
        return new Response('Unauthorized', { status: 401 });
    }

    const params = new URLSearchParams({
        client_id: env.TWITCH_CLIENT_ID,
        redirect_uri: 'https://pokemon.mrklypp.com/api/randomlocke/bot/reauth/callback',
        response_type: 'code',
        scope: 'user:read:chat user:write:chat user:bot',
        force_verify: 'true',
    });

    return Response.redirect(`https://id.twitch.tv/oauth2/authorize?${params}`, 302);
}
