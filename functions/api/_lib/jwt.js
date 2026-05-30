const ENC = new TextEncoder();

function b64url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function decodeB64url(str) {
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
}

async function getKey(secret, usage) {
  return crypto.subtle.importKey(
    'raw', ENC.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, [usage]
  );
}

export async function signJWT(payload, secret) {
  const header   = b64url(ENC.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body     = b64url(ENC.encode(JSON.stringify(payload)));
  const unsigned = `${header}.${body}`;
  const key      = await getKey(secret, 'sign');
  const sig      = await crypto.subtle.sign('HMAC', key, ENC.encode(unsigned));
  return `${unsigned}.${b64url(sig)}`;
}

export async function verifyJWT(token, secret) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const unsigned = `${header}.${body}`;
  const key      = await getKey(secret, 'verify');
  const sigBytes = Uint8Array.from(decodeB64url(sig), c => c.charCodeAt(0));
  const valid    = await crypto.subtle.verify('HMAC', key, sigBytes, ENC.encode(unsigned));
  if (!valid) return null;
  const payload  = JSON.parse(decodeB64url(body));
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}
