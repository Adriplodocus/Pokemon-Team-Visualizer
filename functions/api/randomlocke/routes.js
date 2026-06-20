import { parseCookies } from '../_lib/cookies.js';
import { verifyJWT } from '../_lib/jwt.js';
import { getDB } from '../_lib/db.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// In external mode the frontend passes ?channel=<channelId> instead of a JWT.
// We resolve the owner's user_id from users.channel_id.
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

export async function onRequestGet(context) {
  let userId;
  try { userId = await resolveUserId(context); } catch (e) {
    console.error('DB error resolving user in GET /routes', e);
    return json({ error: 'Service unavailable' }, 503);
  }
  if (!userId) return json({ error: 'Unauthorized' }, 401);

  let rows;
  try {
    const sql = getDB(context.env);
    rows = await sql`
      SELECT id, zone_name, created_at
      FROM randomlocke_routes
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  } catch (e) {
    console.error('DB error in GET /routes', e);
    return json({ error: 'Service unavailable' }, 503);
  }

  return json(rows.map(r => ({
    id: r.id,
    zoneName: r.zone_name,
    createdAt: r.created_at,
  })));
}

export async function onRequestPost(context) {
  let userId;
  try { userId = await resolveUserId(context); } catch (e) {
    console.error('DB error resolving user in POST /routes', e);
    return json({ error: 'Service unavailable' }, 503);
  }
  if (!userId) return json({ error: 'Unauthorized' }, 401);

  let body;
  try { body = await context.request.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const raw = (body.zone || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const zone = raw.charAt(0).toUpperCase() + raw.slice(1);
  if (!zone) return json({ error: 'zone required' }, 400);
  if (zone.length > 100) return json({ error: 'zone too long (max 100)' }, 400);

  let rows;
  try {
    const sql = getDB(context.env);
    const existing = await sql`
      SELECT 1 FROM randomlocke_routes
      WHERE user_id = ${userId} AND lower(zone_name) = lower(${zone})
      LIMIT 1
    `;
    if (existing.length > 0) return json({ error: 'Zone already exists' }, 409);

    rows = await sql`
      INSERT INTO randomlocke_routes (user_id, zone_name)
      VALUES (${userId}, ${zone})
      RETURNING id, zone_name, created_at
    `;
  } catch (e) {
    console.error('DB error in POST /routes', e);
    return json({ error: 'Service unavailable' }, 503);
  }

  const r = rows[0];
  return json({ id: r.id, zoneName: r.zone_name, createdAt: r.created_at }, 201);
}

export async function onRequestDelete(context) {
  let userId;
  try { userId = await resolveUserId(context); } catch (e) {
    console.error('DB error resolving user in DELETE /routes', e);
    return json({ error: 'Service unavailable' }, 503);
  }
  if (!userId) return json({ error: 'Unauthorized' }, 401);

  try {
    const sql = getDB(context.env);
    await sql`DELETE FROM randomlocke_routes WHERE user_id = ${userId}`;
  } catch (e) {
    console.error('DB error in DELETE /routes', e);
    return json({ error: 'Service unavailable' }, 503);
  }

  return json({ ok: true });
}
