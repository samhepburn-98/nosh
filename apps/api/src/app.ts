import express from 'express';

import type { Db } from './db/client.ts';
import { handleErrors, notFound } from './http/errors.ts';
import { createPlanRepository } from './repositories/plan-repository.ts';
import { createRecipesRepository } from './repositories/recipes-repository.ts';
import { planRouter } from './routes/plan.ts';
import { recipesRouter } from './routes/recipes.ts';

/** Builds the API over a database, so tests can pass in their own. */
export function createApp(db: Db) {
  const recipes = createRecipesRepository(db);
  const plan = createPlanRepository(db);

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  app.use('/api/recipes', recipesRouter(recipes));
  app.use('/api/plan', planRouter(plan, recipes));

  app.use(notFound);
  app.use(handleErrors);
  return app;
}
