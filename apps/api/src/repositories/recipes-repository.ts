import { asc, eq, sql } from 'drizzle-orm';

import { DIETARY, type Dietary } from '@nosh/shared/dietary';
import { MEAL_TYPES, type MealType } from '@nosh/shared/meal-types';
import type { RecipeSummary } from '@nosh/shared/recipes';

import type { Db } from '../db/client.ts';
import { recipeDietary, recipeMealTypes, recipes, recipeTags, tags } from '../db/schema.ts';

export function createRecipesRepository(db: Db) {
  return {
    /** Every recipe, A–Z by name. Dietary tags and meal types are in display order, tags A–Z. */
    listSummaries(): RecipeSummary[] {
      const rows = db
        .select({ id: recipes.id, slug: recipes.slug, name: recipes.name, serves: recipes.serves })
        .from(recipes)
        .orderBy(asc(sql`lower(${recipes.name})`))
        .all();
      const dietaryByRecipe = groupByRecipe(db.select().from(recipeDietary).all(), 'dietary');
      const mealTypesByRecipe = groupByRecipe(db.select().from(recipeMealTypes).all(), 'mealType');
      const tagsByRecipe = groupByRecipe(
        db
          .select({ recipeId: recipeTags.recipeId, name: tags.name })
          .from(recipeTags)
          .innerJoin(tags, eq(recipeTags.tagId, tags.id))
          .all(),
        'name',
      );

      return rows.map(({ id, ...recipe }) => ({
        ...recipe,
        mealTypes: inOrder(mealTypesByRecipe.get(id), MEAL_TYPES),
        dietary: inOrder(dietaryByRecipe.get(id), DIETARY),
        tags: (tagsByRecipe.get(id) ?? []).sort(),
      }));
    },
  };
}

export type RecipesRepository = ReturnType<typeof createRecipesRepository>;

function groupByRecipe<Row extends { recipeId: number }, Key extends keyof Row>(
  rows: Row[],
  key: Key,
): Map<number, Row[Key][]> {
  const groups = new Map<number, Row[Key][]>();
  for (const row of rows) {
    const group = groups.get(row.recipeId) ?? [];
    group.push(row[key]);
    groups.set(row.recipeId, group);
  }
  return groups;
}

function inOrder<Value extends Dietary | MealType>(
  values: Value[] = [],
  order: readonly Value[],
): Value[] {
  return order.filter((value) => values.includes(value));
}
