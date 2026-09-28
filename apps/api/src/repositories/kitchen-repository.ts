import { asc, eq, sql } from 'drizzle-orm';

import type { Ingredient } from '@nosh/shared/ingredients';

import type { Db } from '../db/client.ts';
import { ingredients, kitchenItems } from '../db/schema.ts';

export function createKitchenRepository(db: Db) {
  return {
    /** The ingredients you have, A–Z. */
    list(): Ingredient[] {
      return db
        .select({ id: ingredients.id, name: ingredients.name })
        .from(kitchenItems)
        .innerJoin(ingredients, eq(kitchenItems.ingredientId, ingredients.id))
        .orderBy(asc(sql`lower(${ingredients.name})`))
        .all();
    },

    /** Replaces what you have. Every id must be a known ingredient. */
    set(ingredientIds: number[]): void {
      db.transaction((tx) => {
        tx.delete(kitchenItems).run();
        if (ingredientIds.length > 0) {
          tx.insert(kitchenItems)
            .values(ingredientIds.map((ingredientId) => ({ ingredientId })))
            .run();
        }
      });
    },
  };
}

export type KitchenRepository = ReturnType<typeof createKitchenRepository>;
