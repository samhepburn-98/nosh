import { loadStarterRecipes } from '../db/seed.ts';

const starterRecipes = loadStarterRecipes();

/** Every ingredient name in the client's recipes, each once, as written. */
export const starterIngredientNames = [
  ...new Set(starterRecipes.flatMap((recipe) => recipe.ingredients.map(({ item }) => item))),
];
