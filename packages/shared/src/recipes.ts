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
