import { parseCookies } from '../../../_lib/cookies.js';
import { verifyJWT } from '../../../_lib/jwt.js';
import { getDB } from '../../../_lib/db.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestDelete(context) {
  const cookies = parseCookies(context.request);
  const payload = await verifyJWT(cookies.auth, context.env.JWT_SECRET);
  if (!payload) return json({ error: 'Unauthorized' }, 401);

  const { id } = context.params;
  if (!id) return json({ error: 'Missing id' }, 400);

  let result;
  try {
    const sql = getDB(context.env);
    result = await sql`
      DELETE FROM randomlocke_routes
      WHERE id = ${id} AND user_id = ${payload.userId}
      RETURNING id
    `;
  } catch (e) {
    console.error('DB error in DELETE /routes/:id', e);
    return json({ error: 'Service unavailable' }, 503);
  }

  if (!result.length) return json({ error: 'Not found' }, 404);
  return json({ ok: true });
}
