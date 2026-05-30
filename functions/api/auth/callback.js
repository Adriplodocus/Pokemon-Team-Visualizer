import { parseCookies, setCookie } from '../_lib/cookies.js';
import { signJWT } from '../_lib/jwt.js';
import { getDB } from '../_lib/db.js';

const TOKEN_URLS = {
  twitch: 'https://id.twitch.tv/oauth2/token',
  google: 'https://oauth2.googleapis.com/token',
};

async function fetchProfile(provider, accessToken, clientId) {
  if (provider === 'twitch') {
    const res = await fetch('https://api.twitch.tv/helix/users', {
      headers: { Authorization: `Bearer ${accessToken}`, 'Client-Id': clientId },
    });
    if (!res.ok) throw new Error(`Twitch profile fetch failed: ${res.status}`);
    const { data } = await res.json();
    if (!data || !data[0]) throw new Error('Twitch returned empty user data');
    const u = data[0];
    return {
      providerId: u.id,
      username:   u.login,
      email:      u.email || null,
      avatarUrl:  u.profile_image_url,
    };
  }
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Google profile fetch failed: ${res.status}`);
  const u = await res.json();
  return {
    providerId: u.sub,
    username:   u.name || u.email,
    email:      u.email || null,
    avatarUrl:  u.picture || null,
  };
}

export async function onRequestGet(context) {
  const url   = new URL(context.request.url);
  const code  = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    return Response.redirect(`${url.protocol}//${url.host}/login.html?error=${encodeURIComponent(error)}`, 302);
  }

  const cookies = parseCookies(context.request);
  if (!state || state !== cookies.oauth_state) {
    return new Response('Invalid state — possible CSRF attack. Please try logging in again.', { status: 403 });
  }

  if (!code) {
    return new Response('Missing authorization code', { status: 400 });
  }

  const [provider] = state.split(':');
  if (!['twitch', 'google'].includes(provider)) {
    return new Response('Invalid provider', { status: 400 });
  }

  const clientId     = provider === 'twitch' ? context.env.TWITCH_CLIENT_ID     : context.env.GOOGLE_CLIENT_ID;
  const clientSecret = provider === 'twitch' ? context.env.TWITCH_CLIENT_SECRET  : context.env.GOOGLE_CLIENT_SECRET;
  const redirectUri  = `${url.protocol}//${url.host}/api/auth/callback`;

  if (!clientId || !clientSecret) {
    console.error('Missing OAuth credentials for provider:', provider);
    return new Response('OAuth provider not configured', { status: 500 });
  }

  const tokenRes = await fetch(TOKEN_URLS[provider], {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      grant_type:    'authorization_code',
      client_id:     clientId,
      client_secret: clientSecret,
      code,
      redirect_uri:  redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    console.error('Token exchange failed', tokenRes.status, await tokenRes.text());
    return new Response('Authentication failed. Please try again.', { status: 502 });
  }

  let access_token;
  try { ({ access_token } = await tokenRes.json()); }
  catch { return new Response('Invalid token response from provider', { status: 502 }); }

  let profile;
  try { profile = await fetchProfile(provider, access_token, clientId); }
  catch (e) {
    console.error('fetchProfile error', e);
    return new Response('Failed to fetch user profile. Please try again.', { status: 502 });
  }

  let rows;
  try {
    const sql = getDB(context.env);
    rows = await sql`
      INSERT INTO users (provider, provider_id, username, email, avatar_url)
      VALUES (${provider}, ${profile.providerId}, ${profile.username}, ${profile.email}, ${profile.avatarUrl})
      ON CONFLICT (provider, provider_id)
      DO UPDATE SET
        username   = EXCLUDED.username,
        email      = EXCLUDED.email,
        avatar_url = EXCLUDED.avatar_url
      RETURNING id, tier
    `;
  } catch (e) {
    console.error('DB upsert error', e);
    return new Response('Database error. Please try again.', { status: 500 });
  }

  if (!rows || !rows[0]) {
    return new Response('Database error: no user returned', { status: 500 });
  }

  const { id: userId, tier } = rows[0];

  if (!context.env.JWT_SECRET) {
    console.error('JWT_SECRET not configured');
    return new Response('Server configuration error', { status: 500 });
  }

  const iat   = Math.floor(Date.now() / 1000);
  const exp   = iat + 7 * 24 * 3600;
  const token = await signJWT({ userId, tier, iat, exp }, context.env.JWT_SECRET);

  const isSecure  = url.protocol === 'https:';
  const loginNext = cookies.login_next || '';
  const validNext = loginNext && loginNext.startsWith('/') && !loginNext.includes('://') && loginNext.length <= 200;
  const dest      = validNext ? loginNext : '/';

  const headers = new Headers({ Location: `${url.protocol}//${url.host}${dest}` });
  headers.append('Set-Cookie', setCookie('auth',        token, isSecure, { maxAge: 7 * 24 * 3600 }));
  headers.append('Set-Cookie', setCookie('oauth_state', '',    isSecure, { maxAge: 0 }));
  headers.append('Set-Cookie', setCookie('login_next',  '',    isSecure, { maxAge: 0 }));

  return new Response(null, { status: 302, headers });
}
