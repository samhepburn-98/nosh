import { Router } from 'express';

import type { RecipesRepository } from '../repositories/recipes-repository.ts';

export function recipesRouter(recipes: RecipesRepository) {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json(recipes.listSummaries());
  });

  return router;
}
