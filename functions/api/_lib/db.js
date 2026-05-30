import { neon } from '@neondatabase/serverless';

export function getDB(env) {
  return neon(env.DATABASE_URL);
}
