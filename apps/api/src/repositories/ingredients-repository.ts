import { asc, sql } from 'drizzle-orm';

import type { Ingredient } from '@nosh/shared/ingredients';

import type { Db } from '../db/client.ts';
import { ingredients } from '../db/schema.ts';

export function createIngredientsRepository(db: Db) {
  return {
    /** Every known ingredient, A–Z, with its name as stored. */
    list(): Ingredient[] {
      return db
        .select({ id: ingredients.id, name: ingredients.name })
        .from(ingredients)
        .orderBy(asc(sql`lower(${ingredients.name})`))
        .all();
    },
  };
}

export type IngredientsRepository = ReturnType<typeof createIngredientsRepository>;
