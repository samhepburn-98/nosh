import { toKey } from './ingredients.ts';

/** A recipe ranked by what you have: 4 of its 6 ingredients, so buy the other 2. */
export type KitchenMatch<Recipe> = {
  recipe: Recipe;
  haveCount: number;
  ingredientCount: number;
  /** What you'd need to buy, in the recipe's order, names as stored. */
  toBuy: string[];
};

const byName = new Intl.Collator('en-GB').compare;

/**
 * Every recipe, ranked by what you'd need to buy (F8):
 * 1. fewest ingredients to buy
 * 2. then most you already have
 * 3. then name A–Z
 * 4. recipes you have nothing for go last, so a short recipe with nothing in common can't top it.
 *
 * Every ingredient counts, salt and pepper and oil included. Names match by singular form (§3),
 * and an ingredient a recipe lists twice counts once. With nothing picked, it's just A–Z.
 */
export function rankByMissing<Recipe extends { name: string }>(
  recipes: { recipe: Recipe; ingredients: string[] }[],
  have: string[],
): KitchenMatch<Recipe>[] {
  const haveKeys = new Set(have.map(toKey));

  const matches = recipes.map(({ recipe, ingredients }) => {
    // One name per key: the first the recipe gives.
    const firstNames = new Map<string, string>();
    for (const name of ingredients) {
      const key = toKey(name);
      if (!firstNames.has(key)) firstNames.set(key, name);
    }
    const toBuy = [...firstNames].filter(([key]) => !haveKeys.has(key)).map(([, name]) => name);
    return {
      recipe,
      haveCount: firstNames.size - toBuy.length,
      ingredientCount: firstNames.size,
      toBuy,
    };
  });

  if (haveKeys.size === 0) return matches.sort((a, b) => byName(a.recipe.name, b.recipe.name));

  return matches.sort(
    (a, b) =>
      Number(a.haveCount === 0) - Number(b.haveCount === 0) ||
      a.toBuy.length - b.toBuy.length ||
      b.haveCount - a.haveCount ||
      byName(a.recipe.name, b.recipe.name),
  );
}
