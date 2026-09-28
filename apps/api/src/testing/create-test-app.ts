import { createApp } from '../app.ts';
import { setUpDatabase } from '../db/set-up.ts';

/** The API over a fresh in-memory database with the starter recipes, so route tests never import db/. */
export function createTestApp() {
  return createApp(setUpDatabase(':memory:'));
}
