import { z } from 'zod';

/** The meal types, in display order. */
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'dessert'] as const;

export const mealTypeSchema = z.enum(MEAL_TYPES);
export type MealType = z.infer<typeof mealTypeSchema>;
