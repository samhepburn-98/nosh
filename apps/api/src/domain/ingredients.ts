import pluralize from 'pluralize';

/** Words pluralize makes singular wrongly: it gives "cooky" for "cookies". */
const singularOverrides = new Map([
  ['cookies', 'cookie'],
  ['brownies', 'brownie'],
  ['quiches', 'quiche'],
]);

/**
 * The name the shopping list and matching group ingredients by, never stored: lowercased and
 * trimmed, with the last word made singular. "Carrots" and "carrot" share "carrot", but "pepper",
 * "red pepper" and "salt and pepper" stay apart.
 */
export function toKey(name: string): string {
  const words = name.trim().toLowerCase().split(/\s+/);
  const last = words.length - 1;
  words[last] = singularOverrides.get(words[last]) ?? pluralize.singular(words[last]);
  return words.join(' ');
}

/**
 * The known ingredient a typed name means: an exact match ignoring case first, then one with the
 * same singular form, so "Carrot" uses "carrot" and "Tomato" uses "tomatoes". None if neither.
 */
export function matchIngredient<Ingredient extends { name: string }>(
  name: string,
  ingredients: Ingredient[],
): Ingredient | undefined {
  const exact = name.trim().toLowerCase();
  const key = toKey(name);
  return (
    ingredients.find((ingredient) => ingredient.name.toLowerCase() === exact) ??
    ingredients.find((ingredient) => toKey(ingredient.name) === key)
  );
}
