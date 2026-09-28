import { readFileSync } from 'node:fs';

import { starterRecipesSchema, type StarterRecipe } from '@nosh/shared/starter-recipes';

import type { Db } from './client.ts';
import {
  ingredients,
  recipeDietary,
  recipeIngredients,
  recipeMealTypes,
  recipes,
  recipeSteps,
  recipeTags,
  tags,
} from './schema.ts';

const starterRecipesFile = new URL(
  '../../../../data/project-nosh-sample-recipes.json',
  import.meta.url,
);

/** Reads the client's recipes and checks them against the schema, which never changes them. */
export function loadStarterRecipes(): StarterRecipe[] {
  return starterRecipesSchema.parse(JSON.parse(readFileSync(starterRecipesFile, 'utf8')));
}

/**
 * Adds the starter recipes if there are no recipes yet, in one transaction.
 * Ingredient names are stored exactly as written, one row per distinct name.
 * Returns whether anything was added.
 */
export function seedStarterRecipes(db: Db, starterRecipes: StarterRecipe[]): boolean {
  return db.transaction((tx) => {
    if (tx.select({ id: recipes.id }).from(recipes).limit(1).get()) return false;

    // Keyed by the exact name, so two spellings that differ only in case fail on the
    // database's unique index instead of being quietly merged.
    const ingredientIds = new Map<string, number>();
    const ingredientId = (name: string) => {
      let id = ingredientIds.get(name);
      if (id === undefined) {
        id = tx.insert(ingredients).values({ name }).returning({ id: ingredients.id }).get().id;
        ingredientIds.set(name, id);
      }
      return id;
    };

    const tagIds = new Map<string, number>();
    const tagId = (name: string) => {
      let id = tagIds.get(name);
      if (id === undefined) {
        id = tx.insert(tags).values({ name }).returning({ id: tags.id }).get().id;
        tagIds.set(name, id);
      }
      return id;
    };

    for (const recipe of starterRecipes) {
      const recipeId = tx
        .insert(recipes)
        .values({
          slug: recipe.id,
          name: recipe.name,
          cuisine: recipe.cuisine,
          serves: recipe.serves,
          isBuiltin: true,
        })
        .returning({ id: recipes.id })
        .get().id;

      tx.insert(recipeSteps)
        .values(recipe.method.map((text, position) => ({ recipeId, position, text })))
        .run();
      tx.insert(recipeIngredients)
        .values(
          recipe.ingredients.map((line, position) => ({
            recipeId,
            position,
            ingredientId: ingredientId(line.item),
            quantity: line.quantity,
            unit: line.unit,
            prep: line.prep ?? null,
          })),
        )
        .run();
      tx.insert(recipeMealTypes)
        .values(recipe.mealType.map((mealType) => ({ recipeId, mealType })))
        .run();
      if (recipe.dietary.length > 0) {
        tx.insert(recipeDietary)
          .values(recipe.dietary.map((dietary) => ({ recipeId, dietary })))
          .run();
      }
      if (recipe.tags.length > 0) {
        tx.insert(recipeTags)
          .values(recipe.tags.map((name) => ({ recipeId, tagId: tagId(name) })))
          .run();
      }
    }
    return true;
  });
}
