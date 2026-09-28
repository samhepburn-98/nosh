import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import { openDatabase } from './client.ts';
import { loadStarterRecipes, seedStarterRecipes } from './seed.ts';

/** The app's database, `apps/api/.data/nosh.sqlite` (gitignored). */
export const databaseFile = fileURLToPath(new URL('../../.data/nosh.sqlite', import.meta.url));

const migrationsFolder = fileURLToPath(new URL('../../drizzle', import.meta.url));

/** Opens the database, brings it up to date, and adds the starter recipes if it has none. */
export function setUpDatabase(filename: string) {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
  const db = openDatabase(filename);
  migrate(db, { migrationsFolder });
  seedStarterRecipes(db, loadStarterRecipes());
  return db;
}
