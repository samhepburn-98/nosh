import type { ShoppingListItem } from '@nosh/shared/shopping-list';
import type { Amount, Unit } from '@nosh/shared/units';

import { toKey } from './ingredients.ts';
import { addAmounts, formatAmounts } from './units.ts';

/** A planned recipe and its ingredient lines. A recipe planned twice is given twice. */
export type PlannedRecipe = {
  name: string;
  ingredients: { name: string; quantity: number | null; unit: Unit | null }[];
};

const byName = new Intl.Collator('en-GB').compare;

/**
 * Every ingredient the planned recipes need, one line per singular form, A–Z.
 * - Each line uses a name as stored. Where spellings merge, the plural one: carrot + carrots
 *   gives "carrots".
 * - Amounts are added up by addAmounts. A line no recipe gives an amount for has none.
 */
export function buildShoppingList(recipes: PlannedRecipe[]): ShoppingListItem[] {
  const lines = new Map<string, { names: Set<string>; amounts: Amount[]; usedIn: Set<string> }>();

  for (const recipe of recipes) {
    for (const { name, quantity, unit } of recipe.ingredients) {
      const key = toKey(name);
      const line = lines.get(key) ?? { names: new Set(), amounts: [], usedIn: new Set() };
      lines.set(key, line);

      line.names.add(name);
      if (quantity !== null) line.amounts.push({ quantity, unit });
      line.usedIn.add(recipe.name);
    }
  }

  return [...lines.entries()]
    .map(([key, line]) => {
      const names = [...line.names];
      const amounts = addAmounts(line.amounts);
      return {
        // A name that isn't its own key is plural.
        name: names.find((name) => name.trim().toLowerCase() !== key) ?? names[0],
        amounts,
        amountText: formatAmounts(amounts),
        usedIn: [...line.usedIn].sort(byName),
      };
    })
    .sort((a, b) => byName(a.name, b.name));
}
