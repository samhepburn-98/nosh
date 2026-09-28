import { loadStarterRecipes } from '../db/seed.ts';

/** The client's recipes, as supplied. */
export const starterRecipes = loadStarterRecipes();

/** Every ingredient name in the client's recipes, each once, as written. */
export const starterIngredientNames = [
  ...new Set(starterRecipes.flatMap((recipe) => recipe.ingredients.map(({ item }) => item))),
];

/** One of the client's recipes by name, as the shopping list takes it. */
export function starterRecipe(name: string) {
  const recipe = starterRecipes.find((starter) => starter.name === name);
  if (!recipe) throw new Error(`No starter recipe is called "${name}".`);

  return {
    name: recipe.name,
    ingredients: recipe.ingredients.map(({ item, quantity, unit }) => ({
      name: item,
      quantity,
      unit,
    })),
  };
}
