import { parseCookies } from '../../_lib/cookies.js';
import { verifyJWT } from '../../_lib/jwt.js';
import { getDB } from '../../_lib/db.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function resolveUserId(context) {
  const url = new URL(context.request.url);
  const channelId = url.searchParams.get('channel');

  if (channelId) {
    const sql = getDB(context.env);
    const rows = await sql`
      SELECT id FROM users WHERE channel_id = ${channelId} LIMIT 1
    `;
    return rows.length ? rows[0].id : null;
  }

  const cookies = parseCookies(context.request);
  const payload = await verifyJWT(cookies.auth, context.env.JWT_SECRET);
  return payload ? payload.userId : null;
}

export async function onRequestDelete(context) {
  let userId;
  try { userId = await resolveUserId(context); } catch (e) {
    console.error('DB error resolving user in DELETE /routes/:id', e);
    return json({ error: 'Service unavailable' }, 503);
  }
  if (!userId) return json({ error: 'Unauthorized' }, 401);

  const { id } = context.params;
  if (!id) return json({ error: 'Missing id' }, 400);

  let result;
  try {
    const sql = getDB(context.env);
    result = await sql`
      DELETE FROM randomlocke_routes
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;
  } catch (e) {
    console.error('DB error in DELETE /routes/:id', e);
    return json({ error: 'Service unavailable' }, 503);
  }

  if (!result.length) return json({ error: 'Not found' }, 404);
  return json({ ok: true });
}
