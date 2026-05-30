import { setCookie } from '../_lib/cookies.js';

export async function onRequestGet(context) {
  const url      = new URL(context.request.url);
  const isSecure = url.protocol === 'https:';
  return new Response(null, {
    status: 302,
    headers: {
      Location:   `${url.protocol}//${url.host}/`,
      'Set-Cookie': setCookie('auth', '', isSecure, { maxAge: 0 }),
    },
  });
}
