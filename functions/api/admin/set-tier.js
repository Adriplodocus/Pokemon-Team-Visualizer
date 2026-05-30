import { getDB } from '../_lib/db.js';

const VALID_TIERS = ['guest', 'vip'];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const adminKey = context.request.headers.get('X-Admin-Key');
  if (!adminKey || adminKey !== context.env.ADMIN_KEY) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let body;
  try   { body = await context.request.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const { userId, tier } = body;
  if (!userId || !VALID_TIERS.includes(tier)) {
    return json({ error: 'Invalid userId or tier. tier must be one of: guest, vip' }, 400);
  }

  const sql  = getDB(context.env);
  const rows = await sql`
    UPDATE users SET tier = ${tier} WHERE id = ${userId}
    RETURNING id, username, tier
  `;

  if (!rows.length) return json({ error: 'User not found' }, 404);

  return json({ ok: true, username: rows[0].username, tier: rows[0].tier });
}
