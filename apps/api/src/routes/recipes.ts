import { Router } from 'express';

import { newRecipeSchema, type Recipe, type RecipeGroups } from '@nosh/shared/recipes';

import { groupByPreferences } from '../domain/preferences.ts';
import { formatAmount } from '../domain/units.ts';
import { errorBody, invalidInput } from '../http/errors.ts';
import type { IngredientsRepository } from '../repositories/ingredients-repository.ts';
import type { PreferencesRepository } from '../repositories/preferences-repository.ts';
import type { RecipesRepository, StoredRecipe } from '../repositories/recipes-repository.ts';

export function recipesRouter(
  recipes: RecipesRepository,
  preferences: PreferencesRepository,
  ingredients: IngredientsRepository,
) {
  const router = Router();

  router.get('/', (_req, res) => {
    const body: RecipeGroups = groupByPreferences(
      recipes.listSummaries(),
      preferences.get(),
      (recipe) => recipe.dietary,
    );
    res.json(body);
  });

  router.post('/', (req, res) => {
    const recipe = newRecipeSchema.parse(req.body);

    // A known ingredient's id must exist, so the recipe never points at nothing.
    const knownIds = new Set(ingredients.list().map((ingredient) => ingredient.id));
    const fields: Record<string, string> = {};
    recipe.ingredients.forEach(({ ingredient }, index) => {
      if (ingredient.kind === 'existing' && !knownIds.has(ingredient.id)) {
        fields[`ingredients.${index}.ingredient`] = "We can't find that ingredient.";
      }
    });
    if (Object.keys(fields).length > 0) {
      res.status(400).json(invalidInput(fields));
      return;
    }

    const created = recipes.findBySlug(recipes.create(recipe));
    if (!created) throw new Error('The new recipe was not saved.');
    res.status(201).json(toRecipe(created));
  });

  router.get('/:slug', (req, res) => {
    const recipe = recipes.findBySlug(req.params.slug);
    if (!recipe) {
      res.status(404).json(errorBody('recipe_not_found', "We can't find that recipe."));
      return;
    }
    res.json(toRecipe(recipe));
  });

  return router;
}

/** A stored recipe as the recipe page reads it, each amount written out: "2 cloves". */
function toRecipe(recipe: StoredRecipe): Recipe {
  return {
    ...recipe,
    ingredients: recipe.ingredients.map(({ quantity, unit, ...line }) => ({
      amount: formatAmount(quantity, unit),
      ...line,
    })),
  };
}
