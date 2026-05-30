import { neon } from '@neondatabase/serverless';

export function getDB(env) {
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL env var not set');
  return neon(env.DATABASE_URL);
}
