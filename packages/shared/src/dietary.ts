import { z } from 'zod';

/** The dietary tags, in display order. */
export const DIETARY = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'] as const;

export const dietarySchema = z.enum(DIETARY);
export type Dietary = z.infer<typeof dietarySchema>;
