import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema.js';

export function getDb(d1) {
  if (!d1) throw new Error('Cloudflare D1 database binding (env.DB) tidak ditemukan.');
  return drizzle(d1, { schema });
}

export { schema };

