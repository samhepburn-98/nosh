import { Router } from 'express';

import type { Recipe, RecipeGroups } from '@nosh/shared/recipes';

import { groupByPreferences } from '../domain/preferences.ts';
import { formatAmount } from '../domain/units.ts';
import { errorBody } from '../http/errors.ts';
import type { PreferencesRepository } from '../repositories/preferences-repository.ts';
import type { RecipesRepository } from '../repositories/recipes-repository.ts';

export function recipesRouter(recipes: RecipesRepository, preferences: PreferencesRepository) {
  const router = Router();

  router.get('/', (_req, res) => {
    const body: RecipeGroups = groupByPreferences(recipes.listSummaries(), preferences.get());
    res.json(body);
  });

  router.get('/:slug', (req, res) => {
    const recipe = recipes.findBySlug(req.params.slug);
    if (!recipe) {
      res.status(404).json(errorBody('recipe_not_found', "We can't find that recipe."));
      return;
    }
    const body: Recipe = {
      ...recipe,
      ingredients: recipe.ingredients.map(({ quantity, unit, ...line }) => ({
        amount: formatAmount(quantity, unit),
        ...line,
      })),
    };
    res.json(body);
  });

  return router;
}
