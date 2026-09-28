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
