import { Router } from 'express';

import { preferencesSchema, type Preferences } from '@nosh/shared/preferences';

import type { PreferencesRepository } from '../repositories/preferences-repository.ts';

export function preferencesRouter(preferences: PreferencesRepository) {
  const router = Router();

  router.get('/', (_req, res) => {
    const body: Preferences = { dietary: preferences.get() };
    res.json(body);
  });

  router.put('/', (req, res) => {
    const { dietary } = preferencesSchema.parse(req.body);
    preferences.set(dietary);
    const body: Preferences = { dietary };
    res.json(body);
  });

  return router;
}
