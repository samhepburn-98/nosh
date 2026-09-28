import { asc, eq, sql } from 'drizzle-orm';

import { DIETARY, type Dietary } from '@nosh/shared/dietary';
import { MEAL_TYPES, type MealType } from '@nosh/shared/meal-types';
import type { NewRecipe, RecipeSummary } from '@nosh/shared/recipes';
import type { Unit } from '@nosh/shared/units';

import type { Db } from '../db/client.ts';
import {
  ingredients,
  planEntries,
  recipeDietary,
  recipeIngredients,
  recipeMealTypes,
  recipes,
  recipeSteps,
  recipeTags,
  tags,
} from '../db/schema.ts';
import { matchIngredient } from '../domain/ingredients.ts';
import { uniqueSlug } from '../domain/slugs.ts';

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
  plannedOn: number[];
};

const summaryColumns = {
  id: recipes.id,
  slug: recipes.slug,
  name: recipes.name,
  serves: recipes.serves,
  isBuiltin: recipes.isBuiltin,
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
    return ({
      id,
      isBuiltin,
      ...recipe
    }: {
      id: number;
      slug: string;
      name: string;
      serves: number;
      isBuiltin: boolean;
    }) => ({
      ...recipe,
      isOwn: !isBuiltin,
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

    /** Every recipe's ingredient names, in order, by slug. */
    listIngredientNames(): Map<string, string[]> {
      const rows = db
        .select({ slug: recipes.slug, name: ingredients.name })
        .from(recipeIngredients)
        .innerJoin(recipes, eq(recipeIngredients.recipeId, recipes.id))
        .innerJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
        .orderBy(asc(recipeIngredients.recipeId), asc(recipeIngredients.position))
        .all();
      const names = new Map<string, string[]>();
      for (const { slug, name } of rows) names.set(slug, [...(names.get(slug) ?? []), name]);
      return names;
    },

    /** One recipe's summary, or undefined if there's no recipe with that slug. */
    findSummary(slug: string): RecipeSummary | undefined {
      const row = db.select(summaryColumns).from(recipes).where(eq(recipes.slug, slug)).get();
      return row && labelsFor(row.id)(row);
    },

    /**
     * Adds the user's recipe in one transaction, and returns its slug. A new ingredient name uses
     * a known ingredient with the same singular form if there is one (so "Carrot" uses "carrot"),
     * and is added otherwise. Ids of known ingredients must exist.
     */
    create(recipe: NewRecipe): string {
      return db.transaction((tx) => {
        const taken = new Set(
          tx
            .select({ slug: recipes.slug })
            .from(recipes)
            .all()
            .map((row) => row.slug),
        );
        const slug = uniqueSlug(recipe.name, taken);
        const recipeId = tx
          .insert(recipes)
          // The form doesn't ask for a cuisine, and nothing shows one.
          .values({ slug, name: recipe.name, cuisine: '', serves: recipe.serves, isBuiltin: false })
          .returning({ id: recipes.id })
          .get().id;

        // Grows as new names are added, so the same new name twice is added once.
        const known = tx
          .select({ id: ingredients.id, name: ingredients.name })
          .from(ingredients)
          .all();
        const ingredientId = (ingredient: NewRecipe['ingredients'][number]['ingredient']) => {
          if (ingredient.kind === 'existing') return ingredient.id;
          const match = matchIngredient(ingredient.name, known);
          if (match) return match.id;
          const added = tx
            .insert(ingredients)
            .values({ name: ingredient.name })
            .returning({ id: ingredients.id, name: ingredients.name })
            .get();
          known.push(added);
          return added.id;
        };

        tx.insert(recipeSteps)
          .values(recipe.method.map((text, position) => ({ recipeId, position, text })))
          .run();
        tx.insert(recipeIngredients)
          .values(
            recipe.ingredients.map((line, position) => ({
              recipeId,
              position,
              ingredientId: ingredientId(line.ingredient),
              quantity: line.quantity,
              unit: line.unit,
              prep: line.prep,
            })),
          )
          .run();
        tx.insert(recipeMealTypes)
          .values(recipe.mealTypes.map((mealType) => ({ recipeId, mealType })))
          .run();
        if (recipe.dietary.length > 0) {
          tx.insert(recipeDietary)
            .values(recipe.dietary.map((dietary) => ({ recipeId, dietary })))
            .run();
        }
        return slug;
      });
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

      const plannedOn = db
        .selectDistinct({ day: planEntries.day })
        .from(planEntries)
        .where(eq(planEntries.recipeId, row.id))
        .orderBy(asc(planEntries.day))
        .all();

      return {
        ...labelsFor(row.id)(row),
        ingredients: lines,
        method: steps.map((step) => step.text),
        plannedOn: plannedOn.map((entry) => entry.day),
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
