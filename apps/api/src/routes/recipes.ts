import { Router } from 'express';

import type { Recipe } from '@nosh/shared/recipes';

import { formatAmount } from '../domain/units.ts';
import { errorBody } from '../http/errors.ts';
import type { RecipesRepository } from '../repositories/recipes-repository.ts';

export function recipesRouter(recipes: RecipesRepository) {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json(recipes.listSummaries());
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
