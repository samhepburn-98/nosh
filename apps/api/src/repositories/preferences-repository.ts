import type { Dietary } from '@nosh/shared/dietary';

import type { Db } from '../db/client.ts';
import { preferences } from '../db/schema.ts';

export function createPreferencesRepository(db: Db) {
  return {
    /** The saved dietary preferences: none until some are saved. */
    get(): Dietary[] {
      return db.select({ dietary: preferences.dietary }).from(preferences).get()?.dietary ?? [];
    },

    /** Replaces the saved dietary preferences. */
    set(dietary: Dietary[]): void {
      db.insert(preferences)
        .values({ id: 1, dietary })
        .onConflictDoUpdate({ target: preferences.id, set: { dietary } })
        .run();
    },
  };
}

export type PreferencesRepository = ReturnType<typeof createPreferencesRepository>;
