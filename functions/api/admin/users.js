import { getDB } from '../_lib/db.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestGet(context) {
  const adminKey = context.request.headers.get('X-Admin-Key');
  if (!adminKey || adminKey !== context.env.ADMIN_KEY) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const url = new URL(context.request.url);
  const q   = url.searchParams.get('q')?.trim();
  if (!q) return json({ error: 'Missing q param' }, 400);

  const sql  = getDB(context.env);
  const rows = await sql`
    SELECT id, provider, username, email, avatar_url, tier, created_at
    FROM users
    WHERE username ILIKE ${'%' + q + '%'} OR email ILIKE ${'%' + q + '%'}
    ORDER BY created_at DESC
    LIMIT 10
  `;

  return json({ users: rows });
}
