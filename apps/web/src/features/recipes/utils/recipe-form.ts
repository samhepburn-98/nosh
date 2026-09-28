import { z } from 'zod';

import { newRecipeSchema, type NewRecipe } from '@nosh/shared/recipes';

/** The API's schema, except each step is `{ text }`, because field arrays need objects. */
export const recipeFormSchema = newRecipeSchema.extend({
  method: z
    .array(z.object({ text: newRecipeSchema.shape.method.element }), {
      error: 'Add at least one step.',
    })
    .min(1, { error: 'Add at least one step.' }),
});
export type RecipeFormValues = z.input<typeof recipeFormSchema>;
export type RecipeFormOutput = z.output<typeof recipeFormSchema>;

/**
 * A new ingredient row: an amount of 1, as most lines have one, and no unit. Its ingredient is left
 * out until one is chosen or typed.
 */
export const emptyIngredientLine = {
  quantity: 1,
  unit: null,
  prep: '',
} as RecipeFormValues['ingredients'][number];

export function toNewRecipe({ method, ...recipe }: RecipeFormOutput): NewRecipe {
  return { ...recipe, method: method.map((step) => step.text) };
}

/** Where an API field error shows on the form: a step's goes on its text. */
export function toFormPath(path: string): string {
  return /^method\.\d+$/.test(path) ? `${path}.text` : path;
}
