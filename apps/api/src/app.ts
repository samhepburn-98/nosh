import express from 'express';

import type { Db } from './db/client.ts';
import { handleErrors, notFound } from './http/errors.ts';
import { createRecipesRepository } from './repositories/recipes-repository.ts';
import { recipesRouter } from './routes/recipes.ts';

/** Builds the API over a database, so tests can pass in their own. */
export function createApp(db: Db) {
  const app = express();
  app.disable('x-powered-by');

  app.use('/api/recipes', recipesRouter(createRecipesRepository(db)));

  app.use(notFound);
  app.use(handleErrors);
  return app;
}
