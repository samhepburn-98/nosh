import { Router } from 'express';

import type { ShoppingList } from '@nosh/shared/shopping-list';

import { buildShoppingList } from '../domain/shopping-list.ts';
import type { PlanRepository } from '../repositories/plan-repository.ts';

export function shoppingListRouter(plan: PlanRepository) {
  const router = Router();

  // Built from the plan on each request, never stored.
  router.get('/', (_req, res) => {
    const body: ShoppingList = { items: buildShoppingList(plan.listRecipes()) };
    res.json(body);
  });

  return router;
}
