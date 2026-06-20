import { parseCookies } from '../_lib/cookies.js';
import { verifyJWT } from '../_lib/jwt.js';
import { getDB } from '../_lib/db.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const cookies = parseCookies(context.request);
  const payload = await verifyJWT(cookies.auth, context.env.JWT_SECRET);
  if (!payload) return json({ error: 'Unauthorized' }, 401);

  let body;
  try { body = await context.request.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const channelId = (body.channelId || '').trim();
  if (!channelId || channelId.length > 100) return json({ error: 'Invalid channelId' }, 400);

  try {
    const sql = getDB(context.env);
    await sql`
      UPDATE users SET channel_id = ${channelId}
      WHERE id = ${payload.userId}
    `;
  } catch (e) {
    console.error('DB error in POST /auth/channel', e);
    return json({ error: 'Service unavailable' }, 503);
  }

  return json({ ok: true });
}
