import { z } from 'zod';

import { daySchema } from './days.ts';
import { DIETARY, dietarySchema } from './dietary.ts';
import { MEAL_TYPES, mealTypeSchema } from './meal-types.ts';
import { unitSchema } from './units.ts';

/** A recipe as it's listed: enough for a card. */
export const recipeSummarySchema = z.object({
  slug: z.string(),
  name: z.string(),
  serves: z.int(),
  mealTypes: z.array(mealTypeSchema),
  dietary: z.array(dietarySchema),
  /** The client's other labels, such as "quick" and "batch-cook". */
  tags: z.array(z.string()),
});
export type RecipeSummary = z.infer<typeof recipeSummarySchema>;

/** Every recipe, A–Z, split by the saved preferences. With none saved, `others` is empty. */
export const recipeGroupsSchema = z.object({
  matching: z.array(recipeSummarySchema),
  others: z.array(recipeSummarySchema),
});
export type RecipeGroups = z.infer<typeof recipeGroupsSchema>;

/** One ingredient line as the recipe gives it: "2 cloves" "garlic", "crushed". */
export const recipeIngredientSchema = z.object({
  /** "2 cloves", "500 ml", "4", or null when the recipe gives no amount (salt and pepper). */
  amount: z.string().nullable(),
  /** The ingredient's name, exactly as stored. */
  name: z.string(),
  prep: z.string().nullable(),
});
export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>;

/** A recipe in full, for its page. */
export const recipeSchema = recipeSummarySchema.extend({
  ingredients: z.array(recipeIngredientSchema),
  method: z.array(z.string()),
  /** The days this recipe is in the plan, each once, Monday first: [2, 5] for Tuesday and Friday. */
  plannedOn: z.array(daySchema),
});
export type Recipe = z.infer<typeof recipeSchema>;

/**
 * One ingredient line of a new recipe. The ingredient is a known one by id, or a new name, which
 * the API links to a known ingredient with the same singular form if there is one.
 */
export const newIngredientLineSchema = z
  .object({
    /** Blank (null) when the recipe gives no amount, like "salt and pepper". */
    quantity: z
      .number()
      .positive({ error: 'Use an amount above 0, or leave it blank.' })
      .nullable(),
    unit: unitSchema.nullable(),
    ingredient: z.discriminatedUnion(
      'kind',
      [
        z.object({ kind: z.literal('existing'), id: z.int().positive() }),
        z.object({
          kind: z.literal('new'),
          name: z
            .string()
            .trim()
            .min(1, { error: 'Choose or type an ingredient.' })
            .max(60, { error: 'Keep the ingredient to 60 characters or fewer.' }),
        }),
      ],
      { error: 'Choose or type an ingredient.' },
    ),
    prep: z
      .string()
      .trim()
      .max(80, { error: 'Keep this to 80 characters or fewer.' })
      .nullish()
      .transform((prep) => prep || null),
  })
  .refine((line) => line.unit === null || line.quantity !== null, {
    error: 'Add an amount for this unit, or choose No unit.',
    path: ['quantity'],
  });

/** A recipe added by the user (F3). Messages are written to show next to their field. */
export const newRecipeSchema = z.object({
  name: z
    .string({ error: 'Give your recipe a name.' })
    .trim()
    .min(1, { error: 'Give your recipe a name.' })
    .max(80, { error: 'Keep the name to 80 characters or fewer.' }),
  serves: z
    .int({ error: 'Choose how many it serves, from 1 to 12.' })
    .min(1, { error: 'Choose how many it serves, from 1 to 12.' })
    .max(12, { error: 'Choose how many it serves, from 1 to 12.' }),
  /** Each once, in display order. */
  mealTypes: z
    .array(mealTypeSchema, { error: 'Choose at least one meal type.' })
    .min(1, { error: 'Choose at least one meal type.' })
    .transform((mealTypes) => MEAL_TYPES.filter((value) => mealTypes.includes(value))),
  /** Each once, in display order. Optional, so it may be empty. */
  dietary: z
    .array(dietarySchema)
    .default([])
    .transform((dietary) => DIETARY.filter((value) => dietary.includes(value))),
  ingredients: z
    .array(newIngredientLineSchema, { error: 'Add at least one ingredient.' })
    .min(1, { error: 'Add at least one ingredient.' }),
  method: z
    .array(
      z
        .string()
        .trim()
        .min(1, { error: 'Write this step, or remove it.' })
        .max(500, { error: 'Keep each step to 500 characters or fewer.' }),
      { error: 'Add at least one step.' },
    )
    .min(1, { error: 'Add at least one step.' }),
});
export type NewRecipe = z.infer<typeof newRecipeSchema>;
