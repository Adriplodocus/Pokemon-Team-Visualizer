function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestGet(context) {
  const adminKey = context.request.headers.get('X-Admin-Key');
  if (!adminKey || adminKey !== context.env.ADMIN_KEY) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const url       = new URL(context.request.url);
  const usernames = (url.searchParams.get('usernames') || '')
    .split(',')
    .map(u => u.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 100);

  if (!usernames.length) return json({ live: [] });

  const tokenRes = await fetch('https://id.twitch.tv/oauth2/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     context.env.TWITCH_CLIENT_ID,
      client_secret: context.env.TWITCH_CLIENT_SECRET,
      grant_type:    'client_credentials',
    }),
  });

  if (!tokenRes.ok) return json({ error: 'Twitch token failed' }, 502);
  const { access_token } = await tokenRes.json();

  const streamsUrl = new URL('https://api.twitch.tv/helix/streams');
  for (const u of usernames) streamsUrl.searchParams.append('user_login', u);
  streamsUrl.searchParams.set('first', '100');

  const streamsRes = await fetch(streamsUrl, {
    headers: {
      'Client-ID':     context.env.TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${access_token}`,
    },
  });

  if (!streamsRes.ok) return json({ error: 'Twitch streams failed' }, 502);
  const { data } = await streamsRes.json();

  return json({ live: data.map(s => s.user_login.toLowerCase()) });
}
