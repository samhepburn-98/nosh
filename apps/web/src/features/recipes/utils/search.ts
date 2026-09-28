/** Recipes whose name contains the search, ignoring case. An empty search keeps them all. */
export function filterByName<Recipe extends { name: string }>(
  recipes: Recipe[],
  search: string,
): Recipe[] {
  const term = search.trim().toLowerCase();
  return term ? recipes.filter((recipe) => recipe.name.toLowerCase().includes(term)) : recipes;
}
