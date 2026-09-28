import { Router } from 'express';

import { addMealInputSchema, type Plan, type PlannedMeal } from '@nosh/shared/plan';

import { groupByDay } from '../domain/plan.ts';
import { errorBody, invalidInput } from '../http/errors.ts';
import type { PlanRepository } from '../repositories/plan-repository.ts';
import type { RecipesRepository } from '../repositories/recipes-repository.ts';

export function planRouter(plan: PlanRepository, recipes: RecipesRepository) {
  const router = Router();

  router.get('/', (_req, res) => {
    const summaries = new Map(recipes.listSummaries().map((recipe) => [recipe.slug, recipe]));
    const meals = plan.list().flatMap(({ id, day, recipeSlug }) => {
      const recipe = summaries.get(recipeSlug);
      return recipe ? [{ id, day, recipe }] : [];
    });
    const body: Plan = { days: groupByDay(meals) };
    res.json(body);
  });

  router.post('/', (req, res) => {
    const { day, recipeSlug } = addMealInputSchema.parse(req.body);
    const recipe = recipes.findSummary(recipeSlug);
    if (!recipe) {
      res.status(400).json(invalidInput({ recipeSlug: "We can't find that recipe." }));
      return;
    }
    const body: PlannedMeal = { id: plan.add(day, recipeSlug), day, recipe };
    res.status(201).json(body);
  });

  router.delete('/', (_req, res) => {
    plan.clear();
    res.status(204).end();
  });

  router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || !plan.remove(id)) {
      res.status(404).json(errorBody('meal_not_found', "That meal isn't in your plan."));
      return;
    }
    res.status(204).end();
  });

  return router;
}
