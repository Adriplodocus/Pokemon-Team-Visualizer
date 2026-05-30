import { parseCookies, setCookie } from '../_lib/cookies.js';
import { signJWT } from '../_lib/jwt.js';
import { getDB } from '../_lib/db.js';

const TOKEN_URLS = {
  twitch: 'https://id.twitch.tv/oauth2/token',
  google: 'https://oauth2.googleapis.com/token',
};

async function fetchProfile(provider, accessToken, clientId) {
  if (provider === 'twitch') {
    const res      = await fetch('https://api.twitch.tv/helix/users', {
      headers: { Authorization: `Bearer ${accessToken}`, 'Client-Id': clientId },
    });
    const { data } = await res.json();
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

  const [provider] = state.split(':');
  if (!['twitch', 'google'].includes(provider)) {
    return new Response('Invalid provider', { status: 400 });
  }

  const clientId     = provider === 'twitch' ? context.env.TWITCH_CLIENT_ID     : context.env.GOOGLE_CLIENT_ID;
  const clientSecret = provider === 'twitch' ? context.env.TWITCH_CLIENT_SECRET  : context.env.GOOGLE_CLIENT_SECRET;
  const redirectUri  = `${url.protocol}//${url.host}/api/auth/callback`;

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
    const txt = await tokenRes.text();
    return new Response(`Token exchange failed: ${txt}`, { status: 502 });
  }

  const { access_token } = await tokenRes.json();
  const profile = await fetchProfile(provider, access_token, clientId);

  const sql  = getDB(context.env);
  const rows = await sql`
    INSERT INTO users (provider, provider_id, username, email, avatar_url)
    VALUES (${provider}, ${profile.providerId}, ${profile.username}, ${profile.email}, ${profile.avatarUrl})
    ON CONFLICT (provider, provider_id)
    DO UPDATE SET
      username   = EXCLUDED.username,
      email      = EXCLUDED.email,
      avatar_url = EXCLUDED.avatar_url
    RETURNING id, tier
  `;

  const { id: userId, tier } = rows[0];
  const iat   = Math.floor(Date.now() / 1000);
  const exp   = iat + 7 * 24 * 3600;
  const token = await signJWT({ userId, tier, iat, exp }, context.env.JWT_SECRET);

  const isSecure = url.protocol === 'https:';
  const headers  = new Headers({ Location: `${url.protocol}//${url.host}/` });
  headers.append('Set-Cookie', setCookie('auth', token, isSecure, { maxAge: 7 * 24 * 3600 }));
  headers.append('Set-Cookie', setCookie('oauth_state', '', isSecure, { maxAge: 0 }));

  return new Response(null, { status: 302, headers });
}
