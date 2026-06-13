import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from '../config.js';
import * as schema from './schema.js';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    const pool = new Pool({
      connectionString: config.databaseUrl,
      connectionTimeoutMillis: 5_000,  // fail fast if DB is unreachable
      idleTimeoutMillis: 30_000,
    });
    _db = drizzle(pool, { schema });
  }
  return _db;
}
