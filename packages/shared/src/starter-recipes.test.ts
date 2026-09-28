import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { starterRecipeSchema, starterRecipesSchema } from './starter-recipes.ts';

const supplied: unknown = JSON.parse(
  readFileSync(new URL('../../../data/project-nosh-sample-recipes.json', import.meta.url), 'utf8'),
);

const porridge = {
  id: 'porridge',
  name: 'Porridge',
  cuisine: 'british',
  mealType: ['breakfast'],
  dietary: ['vegetarian'],
  tags: ['quick'],
  serves: 2,
  ingredients: [{ item: 'porridge oats', quantity: 100, unit: 'g' }],
  method: ['Stir.'],
};

describe('starterRecipesSchema', () => {
  it('accepts all 20 starter recipes without changing them', () => {
    const parsed = starterRecipesSchema.parse(supplied);

    expect(parsed).toHaveLength(20);
    expect(parsed).toEqual(supplied);
  });

  it('accepts an ingredient with no amount', () => {
    const recipe = {
      ...porridge,
      ingredients: [{ item: 'salt and pepper', quantity: null, unit: null }],
    };

    expect(starterRecipeSchema.safeParse(recipe).success).toBe(true);
  });

  it.each([
    ['an unknown unit', { ingredients: [{ item: 'oats', quantity: 1, unit: 'cup' }] }],
    ['an unknown dietary tag', { dietary: ['pescatarian'] }],
    ['an unknown meal type', { mealType: ['supper'] }],
    ['no meal type', { mealType: [] }],
    ['no ingredients', { ingredients: [] }],
    ['no method', { method: [] }],
    ['serves 0', { serves: 0 }],
    ['a field we do not expect', { rating: 5 }],
  ])('rejects %s', (_, change) => {
    expect(starterRecipeSchema.safeParse({ ...porridge, ...change }).success).toBe(false);
  });
});
