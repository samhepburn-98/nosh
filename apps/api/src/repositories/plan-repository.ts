import { asc, eq } from 'drizzle-orm';

import type { Db } from '../db/client.ts';
import { planEntries, recipes } from '../db/schema.ts';

export function createPlanRepository(db: Db) {
  return {
    /** Every planned meal, in the order it was added. */
    list(): { id: number; day: number; recipeSlug: string }[] {
      return db
        .select({ id: planEntries.id, day: planEntries.day, recipeSlug: recipes.slug })
        .from(planEntries)
        .innerJoin(recipes, eq(planEntries.recipeId, recipes.id))
        .orderBy(asc(planEntries.id))
        .all();
    },

    /** Adds a recipe to a day and returns the new meal's id. The recipe must exist. */
    add(day: number, recipeSlug: string): number {
      const recipe = db
        .select({ id: recipes.id })
        .from(recipes)
        .where(eq(recipes.slug, recipeSlug))
        .get();
      if (!recipe) throw new Error(`There's no recipe "${recipeSlug}".`);
      return db
        .insert(planEntries)
        .values({ day, recipeId: recipe.id })
        .returning({ id: planEntries.id })
        .get().id;
    },

    /** Removes one meal. Returns false if it wasn't there. */
    remove(id: number): boolean {
      return db.delete(planEntries).where(eq(planEntries.id, id)).run().changes > 0;
    },

    clear(): void {
      db.delete(planEntries).run();
    },
  };
}

export type PlanRepository = ReturnType<typeof createPlanRepository>;
