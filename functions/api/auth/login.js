import { setCookie } from '../_lib/cookies.js';

const PROVIDERS = {
  twitch: {
    authUrl: 'https://id.twitch.tv/oauth2/authorize',
    scope:   'user:read:email moderator:read:followers user:read:chat channel:bot',
  },
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope:   'openid email profile',
  },
};

export async function onRequestGet(context) {
  const url      = new URL(context.request.url);
  const provider = url.searchParams.get('provider');

  if (!PROVIDERS[provider]) {
    return new Response(JSON.stringify({ error: 'Invalid provider' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const cfg       = PROVIDERS[provider];
  const clientId  = provider === 'twitch' ? context.env.TWITCH_CLIENT_ID : context.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return new Response(JSON.stringify({ error: 'OAuth provider not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const redirectUri = `${url.protocol}//${url.host}/api/auth/callback`;

  // CSRF state encodes provider so the callback knows which provider to use
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  const randomHex   = Array.from(randomBytes, b => b.toString(16).padStart(2, '0')).join('');
  const state       = `${provider}:${randomHex}`;

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    scope:         cfg.scope,
    state,
    response_type: 'code',
  });

  if (provider === 'google') {
    params.set('access_type', 'offline');
    params.set('prompt', 'select_account');
  } else if (provider === 'twitch') {
    params.set('force_verify', 'true');
  }

  const isSecure    = url.protocol === 'https:';
  const stateCookie = setCookie('oauth_state', state, isSecure, { maxAge: 600 });

  const next        = url.searchParams.get('next') || '';
  const validNext   = next && next.startsWith('/') && !next.startsWith('//') && !next.includes('://') && next.length <= 200;

  const headers = new Headers({ Location: `${cfg.authUrl}?${params}` });
  headers.append('Set-Cookie', stateCookie);
  if (validNext) {
    headers.append('Set-Cookie', setCookie('login_next', next, isSecure, { maxAge: 600 }));
  }

  return new Response(null, { status: 302, headers });
}
