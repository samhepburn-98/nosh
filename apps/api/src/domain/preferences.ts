import type { Dietary } from '@nosh/shared/dietary';

/**
 * Whether a recipe's dietary tags meet every preference. Vegan counts as vegetarian and
 * dairy-free. Tags are never guessed from ingredients, so an untagged recipe fits no preference.
 */
export function meetsPreferences(dietary: Dietary[], preferences: Dietary[]): boolean {
  const tags = new Set(dietary);
  if (tags.has('vegan')) {
    tags.add('vegetarian');
    tags.add('dairy-free');
  }
  return preferences.every((preference) => tags.has(preference));
}

/**
 * Splits items into those whose recipe fits the preferences and the others, each kept in order.
 * `dietaryOf` finds each item's tags: a recipe's own, or those of the recipe inside a ranking.
 */
export function groupByPreferences<Item>(
  items: Item[],
  preferences: Dietary[],
  dietaryOf: (item: Item) => Dietary[],
): { matching: Item[]; others: Item[] } {
  const matching: Item[] = [];
  const others: Item[] = [];
  for (const item of items) {
    (meetsPreferences(dietaryOf(item), preferences) ? matching : others).push(item);
  }
  return { matching, others };
}
