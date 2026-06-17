import { getDB } from './_lib/db.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestGet(context) {
  try {
    const sql = getDB(context.env);
    const rows = await sql`
      SELECT username, avatar_url, provider
      FROM users
      WHERE featured = true
      ORDER BY username ASC
    `;
    return json(rows.map(r => ({
      username: r.username,
      avatarUrl: r.avatar_url,
      platform: r.provider,
    })));
  } catch (e) {
    console.error('DB error in GET /featured', e);
    return json({ error: 'Service unavailable' }, 503);
  }
}
