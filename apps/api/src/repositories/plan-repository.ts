import { asc, eq } from 'drizzle-orm';

import type { Db } from '../db/client.ts';
import { ingredients, planEntries, recipeIngredients, recipes } from '../db/schema.ts';
import type { PlannedRecipe } from '../domain/shopping-list.ts';

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

    /**
     * Each planned meal's recipe with its ingredient lines, in the order the meals were added.
     * A recipe planned twice is given twice, so the shopping list buys it twice.
     */
    listRecipes(): PlannedRecipe[] {
      const rows = db
        .select({
          mealId: planEntries.id,
          recipeName: recipes.name,
          name: ingredients.name,
          quantity: recipeIngredients.quantity,
          unit: recipeIngredients.unit,
        })
        .from(planEntries)
        .innerJoin(recipes, eq(planEntries.recipeId, recipes.id))
        .innerJoin(recipeIngredients, eq(recipeIngredients.recipeId, recipes.id))
        .innerJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
        .orderBy(asc(planEntries.id), asc(recipeIngredients.position))
        .all();

      const meals = new Map<number, PlannedRecipe>();
      for (const { mealId, recipeName, ...line } of rows) {
        const meal = meals.get(mealId) ?? { name: recipeName, ingredients: [] };
        meal.ingredients.push(line);
        meals.set(mealId, meal);
      }
      return [...meals.values()];
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
