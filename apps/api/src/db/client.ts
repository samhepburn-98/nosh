import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import * as schema from './schema.ts';

/** Opens a SQLite database (a file, or ':memory:') with foreign keys on and write-ahead logging. */
export function openDatabase(filename: string) {
  const sqlite = new Database(filename);
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('journal_mode = WAL');
  return drizzle({ client: sqlite, schema, casing: 'snake_case' });
}

export type Db = ReturnType<typeof openDatabase>;
