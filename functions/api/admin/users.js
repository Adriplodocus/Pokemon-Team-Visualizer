import { getDB } from '../_lib/db.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const ALLOWED_LIMITS = new Set([10, 20, 25, 50, 0]);

export async function onRequestGet(context) {
  const adminKey = context.request.headers.get('X-Admin-Key');
  if (!adminKey || adminKey !== context.env.ADMIN_KEY) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const url    = new URL(context.request.url);
  const q      = url.searchParams.get('q')?.trim() || null;
  const sort   = url.searchParams.get('sort') === 'desc' ? 'DESC' : 'ASC';
  const limit  = (() => {
    const v = parseInt(url.searchParams.get('limit'), 10);
    return ALLOWED_LIMITS.has(v) ? v : 20;
  })();
  const page   = Math.max(1, parseInt(url.searchParams.get('page'), 10) || 1);
  const offset = limit === 0 ? 0 : (page - 1) * limit;

  let rows;
  try {
    const sql    = getDB(context.env);
    const params = [];
    let   query  = `
      SELECT id, provider, username, email, avatar_url, tier, created_at,
             COUNT(*) OVER()::int AS total_count
      FROM users
    `;

    if (q) {
      params.push('%' + q + '%');
      query += ` WHERE username ILIKE $${params.length} OR email ILIKE $${params.length}`;
    }

    query += ` ORDER BY username ${sort}`;

    if (limit > 0) {
      params.push(limit);
      query += ` LIMIT $${params.length}`;
      params.push(offset);
      query += ` OFFSET $${params.length}`;
    }

    rows = await sql(query, params);
  } catch (e) {
    console.error('DB error in /admin/users', e);
    return json({ error: 'Database error' }, 500);
  }

  const total = rows.length > 0 ? rows[0].total_count : 0;
  const pages = limit === 0 ? 1 : Math.ceil(total / limit) || 1;

  return json({
    users: rows.map(({ total_count, ...u }) => u),
    total,
    page,
    limit,
    pages,
  });
}
