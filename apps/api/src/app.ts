import express from 'express';

import type { Db } from './db/client.ts';
import { handleErrors, notFound } from './http/errors.ts';
import { createIngredientsRepository } from './repositories/ingredients-repository.ts';
import { createPlanRepository } from './repositories/plan-repository.ts';
import { createPreferencesRepository } from './repositories/preferences-repository.ts';
import { createRecipesRepository } from './repositories/recipes-repository.ts';
import { ingredientsRouter } from './routes/ingredients.ts';
import { planRouter } from './routes/plan.ts';
import { preferencesRouter } from './routes/preferences.ts';
import { recipesRouter } from './routes/recipes.ts';
import { shoppingListRouter } from './routes/shopping-list.ts';

/** Builds the API over a database, so tests can pass in their own. */
export function createApp(db: Db) {
  const recipes = createRecipesRepository(db);
  const plan = createPlanRepository(db);
  const preferences = createPreferencesRepository(db);
  const ingredients = createIngredientsRepository(db);

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  app.use('/api/recipes', recipesRouter(recipes, preferences, ingredients));
  app.use('/api/ingredients', ingredientsRouter(ingredients));
  app.use('/api/plan', planRouter(plan, recipes));
  app.use('/api/shopping-list', shoppingListRouter(plan));
  app.use('/api/preferences', preferencesRouter(preferences));

  app.use(notFound);
  app.use(handleErrors);
  return app;
}
