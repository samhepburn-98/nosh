import { Router } from 'express';

import { kitchenSchema, type Kitchen, type KitchenMatches } from '@nosh/shared/kitchen';

import { rankByMissing } from '../domain/kitchen.ts';
import { groupByPreferences } from '../domain/preferences.ts';
import { invalidInput } from '../http/errors.ts';
import type { IngredientsRepository } from '../repositories/ingredients-repository.ts';
import type { KitchenRepository } from '../repositories/kitchen-repository.ts';
import type { PreferencesRepository } from '../repositories/preferences-repository.ts';
import type { RecipesRepository } from '../repositories/recipes-repository.ts';

export function kitchenRouter(
  kitchen: KitchenRepository,
  ingredients: IngredientsRepository,
  recipes: RecipesRepository,
  preferences: PreferencesRepository,
) {
  const router = Router();

  const current = (): Kitchen => ({ ingredientIds: kitchen.list().map((item) => item.id) });

  router.get('/', (_req, res) => {
    res.json(current());
  });

  router.put('/', (req, res) => {
    const { ingredientIds } = kitchenSchema.parse(req.body);

    const knownIds = new Set(ingredients.list().map((ingredient) => ingredient.id));
    const fields: Record<string, string> = {};
    ingredientIds.forEach((id, index) => {
      if (!knownIds.has(id)) fields[`ingredientIds.${index}`] = "We can't find that ingredient.";
    });
    if (Object.keys(fields).length > 0) {
      res.status(400).json(invalidInput(fields));
      return;
    }

    kitchen.set(ingredientIds);
    res.json(current());
  });

  // Worked out on each request from what you have, never stored.
  router.get('/matches', (_req, res) => {
    const ingredientNames = recipes.listIngredientNames();
    const ranked = rankByMissing(
      recipes.listSummaries().map((recipe) => ({
        recipe,
        ingredients: ingredientNames.get(recipe.slug) ?? [],
      })),
      kitchen.list().map((item) => item.name),
    );
    const body: KitchenMatches = groupByPreferences(
      ranked,
      preferences.get(),
      (match) => match.recipe.dietary,
    );
    res.json(body);
  });

  return router;
}
