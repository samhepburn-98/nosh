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

/** Splits recipes into those that fit the preferences and the others, each kept in order. */
export function groupByPreferences<Recipe extends { dietary: Dietary[] }>(
  recipes: Recipe[],
  preferences: Dietary[],
): { matching: Recipe[]; others: Recipe[] } {
  const matching: Recipe[] = [];
  const others: Recipe[] = [];
  for (const recipe of recipes) {
    (meetsPreferences(recipe.dietary, preferences) ? matching : others).push(recipe);
  }
  return { matching, others };
}
