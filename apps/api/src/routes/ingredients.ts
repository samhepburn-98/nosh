import { Router } from 'express';

import type { Ingredient } from '@nosh/shared/ingredients';

import type { IngredientsRepository } from '../repositories/ingredients-repository.ts';

export function ingredientsRouter(ingredients: IngredientsRepository) {
  const router = Router();

  router.get('/', (_req, res) => {
    const body: Ingredient[] = ingredients.list();
    res.json(body);
  });

  return router;
}
