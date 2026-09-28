import { z } from 'zod';

import { daySchema } from './days.ts';
import { recipeSummarySchema } from './recipes.ts';

/** One meal in the plan: a recipe on a day. */
export const plannedMealSchema = z.object({
  id: z.int(),
  day: daySchema,
  recipe: recipeSummarySchema,
});
export type PlannedMeal = z.infer<typeof plannedMealSchema>;

/** The week: seven days, Monday first, each with its meals in the order they were added. */
export const planSchema = z.object({
  days: z.array(z.object({ day: daySchema, meals: z.array(plannedMealSchema) })),
});
export type Plan = z.infer<typeof planSchema>;

export const addMealInputSchema = z.object({
  day: daySchema,
  recipeSlug: z.string({ error: 'Choose a recipe.' }).min(1, { error: 'Choose a recipe.' }),
});
export type AddMealInput = z.infer<typeof addMealInputSchema>;
