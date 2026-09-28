import { z } from 'zod';

import { dietarySchema } from './dietary.ts';
import { mealTypeSchema } from './meal-types.ts';

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
});
export type Recipe = z.infer<typeof recipeSchema>;
