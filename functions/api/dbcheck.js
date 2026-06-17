import { getDB } from './_lib/db.js';

export async function onRequestGet(context) {
  const sql = getDB(context.env);
  const rows = await sql`SELECT current_database() AS db`;
  const url = new URL(context.env.DATABASE_URL);
  return new Response(JSON.stringify({ db: rows[0].db, host: url.hostname }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
