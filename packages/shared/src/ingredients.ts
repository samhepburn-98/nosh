import { z } from 'zod';

/** A known ingredient, with its name exactly as stored. */
export const ingredientSchema = z.object({
  id: z.int(),
  name: z.string(),
});
export type Ingredient = z.infer<typeof ingredientSchema>;
