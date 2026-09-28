import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { errorBodySchema } from '@nosh/shared/errors';
import { recipeSchema, recipeSummarySchema } from '@nosh/shared/recipes';

import { createTestApp } from '../testing/create-test-app.ts';

describe('GET /api/recipes', () => {
  it('lists all 20 recipes A–Z', async () => {
    const res = await request(createTestApp()).get('/api/recipes').expect(200);
    const summaries = recipeSummarySchema.array().parse(res.body);
    const names = summaries.map((recipe) => recipe.name);

    expect(summaries).toHaveLength(20);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    expect(names[0]).toBe('Apple Crumble');
  });

  it("includes the client's tags: Porridge is quick", async () => {
    const res = await request(createTestApp()).get('/api/recipes');
    const summaries = recipeSummarySchema.array().parse(res.body);

    expect(summaries.find((r) => r.slug === 'porridge-with-berries-and-honey')).toEqual({
      slug: 'porridge-with-berries-and-honey',
      name: 'Porridge with Berries and Honey',
      serves: 2,
      mealTypes: ['breakfast'],
      dietary: ['vegetarian'],
      tags: ['quick'],
    });
  });

  it('lists dietary tags and meal types in display order', async () => {
    const res = await request(createTestApp()).get('/api/recipes');
    const summaries = recipeSummarySchema.array().parse(res.body);

    expect(summaries.find((r) => r.slug === 'lentil-dahl')?.dietary).toEqual([
      'vegetarian',
      'vegan',
      'gluten-free',
      'dairy-free',
    ]);
    expect(
      summaries.find((r) => r.slug === 'jacket-potato-with-cheese-and-beans')?.mealTypes,
    ).toEqual(['lunch', 'dinner']);
  });
});

describe('an unknown address', () => {
  it('is a 404 with the error body', async () => {
    const res = await request(createTestApp()).get('/api/nothing-here').expect(404);

    expect(errorBodySchema.parse(res.body).error.code).toBe('not_found');
  });
});

describe('GET /api/recipes/:slug', () => {
  it('gives Tomato Soup in full: 6 ingredients as written and 4 steps', async () => {
    const res = await request(createTestApp()).get('/api/recipes/tomato-soup').expect(200);
    const recipe = recipeSchema.parse(res.body);

    expect(recipe).toMatchObject({
      slug: 'tomato-soup',
      name: 'Tomato Soup',
      serves: 4,
      mealTypes: ['lunch'],
      dietary: ['vegetarian', 'vegan', 'gluten-free'],
      tags: ['batch-cook'],
    });
    expect(recipe.ingredients).toEqual([
      { amount: '2 tins', name: 'chopped tomatoes', prep: null },
      { amount: '1', name: 'onion', prep: 'chopped' },
      { amount: '2 cloves', name: 'garlic', prep: 'crushed' },
      { amount: '500 ml', name: 'vegetable stock', prep: null },
      { amount: '2 tbsp', name: 'olive oil', prep: null },
      { amount: null, name: 'salt and pepper', prep: null },
    ]);
    expect(recipe.method).toHaveLength(4);
    expect(recipe.method[0]).toMatch(/^Heat the oil/);
  });

  it('is a 404 for a recipe that does not exist', async () => {
    const res = await request(createTestApp()).get('/api/recipes/beans-on-toast').expect(404);

    expect(errorBodySchema.parse(res.body).error.code).toBe('recipe_not_found');
  });
});
