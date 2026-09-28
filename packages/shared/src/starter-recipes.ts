import { z } from 'zod';

import { dietarySchema } from './dietary.ts';
import { mealTypeSchema } from './meal-types.ts';
import { unitSchema } from './units.ts';

// The client's recipes, as supplied in data/project-nosh-sample-recipes.json. The schemas are
// strict and never transform, so anything unexpected fails loudly instead of being changed.

export const starterIngredientSchema = z.strictObject({
  item: z.string().min(1),
  quantity: z.number().positive().nullable(),
  unit: unitSchema.nullable(),
  prep: z.string().min(1).optional(),
});

export const starterRecipeSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  name: z.string().min(1),
  cuisine: z.string().min(1),
  mealType: z.array(mealTypeSchema).min(1),
  dietary: z.array(dietarySchema),
  tags: z.array(z.string().min(1)),
  serves: z.int().min(1).max(12),
  ingredients: z.array(starterIngredientSchema).min(1),
  method: z.array(z.string().min(1)).min(1),
});

export const starterRecipesSchema = z.array(starterRecipeSchema);
export type StarterRecipe = z.infer<typeof starterRecipeSchema>;
