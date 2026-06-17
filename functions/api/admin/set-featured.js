import { getDB } from '../_lib/db.js';

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

  const { userId, featured } = body;
  if (!userId || typeof featured !== 'boolean') {
    return json({ error: 'Invalid userId or featured (must be boolean)' }, 400);
  }

  const sql  = getDB(context.env);
  const rows = await sql`
    UPDATE users SET featured = ${featured} WHERE id = ${userId}
    RETURNING id, username, featured
  `;

  if (!rows.length) return json({ error: 'User not found' }, 404);

  return json({ ok: true, username: rows[0].username, featured: rows[0].featured });
}
