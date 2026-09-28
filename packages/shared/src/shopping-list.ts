import { z } from 'zod';

import { amountSchema } from './units.ts';

/** One line of the shopping list: "chicken breast", 600 g + 2. */
export const shoppingListItemSchema = z.object({
  /** The ingredient's name as stored. Where spellings merge, the plural one: "carrots". */
  name: z.string(),
  /** Added up and rounded, one per kind: [600 g, 2]. Empty when no recipe gives an amount. */
  amounts: z.array(amountSchema),
  /** How the amounts read: "600 g + 2", or null when there are none (salt and pepper). */
  amountText: z.string().nullable(),
  /** The planned recipes that use it, each once, A–Z. */
  usedIn: z.array(z.string()),
});
export type ShoppingListItem = z.infer<typeof shoppingListItemSchema>;

/** Everything the week's meals need, A–Z. */
export const shoppingListSchema = z.object({
  items: z.array(shoppingListItemSchema),
});
export type ShoppingList = z.infer<typeof shoppingListSchema>;
