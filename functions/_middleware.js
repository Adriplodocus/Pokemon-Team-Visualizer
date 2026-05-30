import { parseCookies } from './api/_lib/cookies.js';
import { verifyJWT } from './api/_lib/jwt.js';

const PUBLIC_EXTENSIONS = new Set([
  '.css', '.js', '.gif', '.png', '.svg', '.json',
  '.ico', '.webmanifest',
]);

const PUBLIC_PATHS = new Set([
  '/login.html',
  '/types.html',
  '/overlay.html',
  '/badge-overlay.html',
  '/cemetery-overlay.html',
]);

const PUBLIC_PREFIXES = ['/api/auth/', '/sprites/'];

function isPublic(pathname) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) return true;
  const dot = pathname.lastIndexOf('.');
  if (dot !== -1 && PUBLIC_EXTENSIONS.has(pathname.slice(dot))) return true;
  return false;
}

export async function onRequest(context) {
  const url      = new URL(context.request.url);
  const pathname = url.pathname;

  if (isPublic(pathname)) return context.next();

  const cookies = parseCookies(context.request);
  const payload = await verifyJWT(cookies.auth, context.env.JWT_SECRET);

  if (payload) return context.next();

  const next = encodeURIComponent(pathname);
  return Response.redirect(
    `${url.protocol}//${url.host}/login.html?next=${next}`,
    302,
  );
}
