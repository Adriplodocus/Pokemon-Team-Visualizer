import { parseCookies } from '../_lib/cookies.js';
import { verifyJWT } from '../_lib/jwt.js';
import { getDB } from '../_lib/db.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getUser(context) {
  const cookies = parseCookies(context.request);
  return verifyJWT(cookies.auth, context.env.JWT_SECRET);
}

export async function onRequestGet(context) {
  const payload = await getUser(context);
  if (!payload) return json({ error: 'Unauthorized' }, 401);

  let rows;
  try {
    const sql = getDB(context.env);
    rows = await sql`
      SELECT id, zone_name, created_at
      FROM randomlocke_routes
      WHERE user_id = ${payload.userId}
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
  const payload = await getUser(context);
  if (!payload) return json({ error: 'Unauthorized' }, 401);

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
    rows = await sql`
      INSERT INTO randomlocke_routes (user_id, zone_name)
      VALUES (${payload.userId}, ${zone})
      RETURNING id, zone_name, created_at
    `;
  } catch (e) {
    console.error('DB error in POST /routes', e);
    return json({ error: 'Service unavailable' }, 503);
  }

  const r = rows[0];
  return json({ id: r.id, zoneName: r.zone_name, createdAt: r.created_at }, 201);
}
