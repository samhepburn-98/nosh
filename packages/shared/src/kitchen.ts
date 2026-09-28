import { z } from 'zod';

import { recipeSummarySchema } from './recipes.ts';

/** The ingredients you have, for "From your kitchen". */
export const kitchenSchema = z.object({
  /** Each once. */
  ingredientIds: z
    .array(z.int().positive(), { error: 'Choose what you have.' })
    .transform((ids) => [...new Set(ids)]),
});
export type Kitchen = z.infer<typeof kitchenSchema>;

/** A recipe ranked by what you have: 4 of its 6 ingredients, so buy the other 2. */
export const kitchenMatchSchema = z.object({
  recipe: recipeSummarySchema,
  haveCount: z.int(),
  ingredientCount: z.int(),
  /** What you'd need to buy, in the recipe's order, names as stored. */
  toBuy: z.array(z.string()),
});
export type KitchenMatch = z.infer<typeof kitchenMatchSchema>;

/** Every recipe ranked by what you'd buy (F8), split by the saved preferences. */
export const kitchenMatchesSchema = z.object({
  matching: z.array(kitchenMatchSchema),
  others: z.array(kitchenMatchSchema),
});
export type KitchenMatches = z.infer<typeof kitchenMatchesSchema>;
