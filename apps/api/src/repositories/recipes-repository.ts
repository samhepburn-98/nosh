import { asc, eq, sql } from 'drizzle-orm';

import { DIETARY, type Dietary } from '@nosh/shared/dietary';
import { MEAL_TYPES, type MealType } from '@nosh/shared/meal-types';
import type { RecipeSummary } from '@nosh/shared/recipes';
import type { Unit } from '@nosh/shared/units';

import type { Db } from '../db/client.ts';
import {
  ingredients,
  recipeDietary,
  recipeIngredients,
  recipeMealTypes,
  recipes,
  recipeSteps,
  recipeTags,
  tags,
} from '../db/schema.ts';

/** An ingredient line as stored. The route turns quantity and unit into the amount people read. */
export type StoredIngredientLine = {
  name: string;
  quantity: number | null;
  unit: Unit | null;
  prep: string | null;
};

export type StoredRecipe = RecipeSummary & {
  ingredients: StoredIngredientLine[];
  method: string[];
};

const summaryColumns = {
  id: recipes.id,
  slug: recipes.slug,
  name: recipes.name,
  serves: recipes.serves,
};

export function createRecipesRepository(db: Db) {
  /** Dietary tags, meal types and tags, for one recipe or every recipe. */
  function labelsFor(recipeId?: number) {
    const dietary = db
      .select()
      .from(recipeDietary)
      .where(recipeId === undefined ? undefined : eq(recipeDietary.recipeId, recipeId))
      .all();
    const mealTypes = db
      .select()
      .from(recipeMealTypes)
      .where(recipeId === undefined ? undefined : eq(recipeMealTypes.recipeId, recipeId))
      .all();
    const tagRows = db
      .select({ recipeId: recipeTags.recipeId, name: tags.name })
      .from(recipeTags)
      .innerJoin(tags, eq(recipeTags.tagId, tags.id))
      .where(recipeId === undefined ? undefined : eq(recipeTags.recipeId, recipeId))
      .all();

    const dietaryByRecipe = groupByRecipe(dietary, 'dietary');
    const mealTypesByRecipe = groupByRecipe(mealTypes, 'mealType');
    const tagsByRecipe = groupByRecipe(tagRows, 'name');

    /** Dietary tags and meal types are in display order, tags A–Z. */
    return ({ id, ...recipe }: { id: number; slug: string; name: string; serves: number }) => ({
      ...recipe,
      mealTypes: inOrder(mealTypesByRecipe.get(id), MEAL_TYPES),
      dietary: inOrder(dietaryByRecipe.get(id), DIETARY),
      tags: (tagsByRecipe.get(id) ?? []).sort(),
    });
  }

  return {
    /** Every recipe, A–Z by name. */
    listSummaries(): RecipeSummary[] {
      const rows = db
        .select(summaryColumns)
        .from(recipes)
        .orderBy(asc(sql`lower(${recipes.name})`))
        .all();
      return rows.map(labelsFor());
    },

    /** One recipe's summary, or undefined if there's no recipe with that slug. */
    findSummary(slug: string): RecipeSummary | undefined {
      const row = db.select(summaryColumns).from(recipes).where(eq(recipes.slug, slug)).get();
      return row && labelsFor(row.id)(row);
    },

    /** One recipe in full, with its ingredient lines and method in order. */
    findBySlug(slug: string): StoredRecipe | undefined {
      const row = db.select(summaryColumns).from(recipes).where(eq(recipes.slug, slug)).get();
      if (!row) return undefined;

      const lines = db
        .select({
          name: ingredients.name,
          quantity: recipeIngredients.quantity,
          unit: recipeIngredients.unit,
          prep: recipeIngredients.prep,
        })
        .from(recipeIngredients)
        .innerJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
        .where(eq(recipeIngredients.recipeId, row.id))
        .orderBy(asc(recipeIngredients.position))
        .all();
      const steps = db
        .select({ text: recipeSteps.text })
        .from(recipeSteps)
        .where(eq(recipeSteps.recipeId, row.id))
        .orderBy(asc(recipeSteps.position))
        .all();

      return {
        ...labelsFor(row.id)(row),
        ingredients: lines,
        method: steps.map((step) => step.text),
      };
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
