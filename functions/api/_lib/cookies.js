export function parseCookies(req) {
  const cookies = {};
  const header  = req.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const name     = part.slice(0, eq).trim();
    cookies[name]  = decodeURIComponent(part.slice(eq + 1).trim());
  }
  return cookies;
}

export function setCookie(name, value, isSecure, opts = {}) {
  let str = `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax`;
  if (isSecure) str += '; Secure';
  if (opts.maxAge != null) str += `; Max-Age=${opts.maxAge}`;
  return str;
}
