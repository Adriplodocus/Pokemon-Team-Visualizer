import { parseCookies } from '../_lib/cookies.js';
import { verifyJWT } from '../_lib/jwt.js';
import { getDB } from '../_lib/db.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestGet(context) {
  const cookies = parseCookies(context.request);
  const payload = await verifyJWT(cookies.auth, context.env.JWT_SECRET);

  if (!payload) return json({ error: 'Unauthorized' }, 401);

  let rows;
  try {
    const sql = getDB(context.env);
    rows = await sql`
      SELECT username, avatar_url, tier FROM users WHERE id = ${payload.userId}
    `;
  } catch (e) {
    console.error('DB error in /me', e);
    return json({ error: 'Service unavailable' }, 503);
  }

  if (!rows.length) return json({ error: 'User not found' }, 401);

  const { username, avatar_url, tier } = rows[0];
  return json({ username, avatarUrl: avatar_url, tier });
}
