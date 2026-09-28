import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { errorBodySchema } from '@nosh/shared/errors';
import { ingredientSchema } from '@nosh/shared/ingredients';
import { kitchenMatchesSchema, kitchenSchema } from '@nosh/shared/kitchen';

import { createTestApp } from '../testing/create-test-app.ts';

type App = ReturnType<typeof createTestApp>;

async function idsOf(app: App, names: string[]) {
  const res = await request(app).get('/api/ingredients');
  const ingredients = ingredientSchema.array().parse(res.body);
  return names.map((name) => ingredients.find((ingredient) => ingredient.name === name)?.id);
}

async function matchesOf(app: App) {
  const res = await request(app).get('/api/kitchen/matches').expect(200);
  return kitchenMatchesSchema.parse(res.body);
}

describe('GET /api/kitchen', () => {
  it('starts with nothing', async () => {
    const res = await request(createTestApp()).get('/api/kitchen').expect(200);

    expect(res.body).toEqual({ ingredientIds: [] });
  });
});

describe('PUT /api/kitchen', () => {
  it('saves what you have, each once, A–Z by name', async () => {
    const app = createTestApp();
    const [onion, butter] = await idsOf(app, ['onion', 'butter']);

    const res = await request(app)
      .put('/api/kitchen')
      .send({ ingredientIds: [onion, butter, onion] })
      .expect(200);

    expect(kitchenSchema.parse(res.body)).toEqual({ ingredientIds: [butter, onion] });
    expect((await request(app).get('/api/kitchen')).body).toEqual({
      ingredientIds: [butter, onion],
    });
  });

  it('refuses an ingredient it does not know, and saves nothing', async () => {
    const app = createTestApp();
    const [onion] = await idsOf(app, ['onion']);
    await request(app)
      .put('/api/kitchen')
      .send({ ingredientIds: [onion] });

    const res = await request(app)
      .put('/api/kitchen')
      .send({ ingredientIds: [onion, 9999] })
      .expect(400);

    expect(errorBodySchema.parse(res.body).error.fields).toEqual({
      'ingredientIds.1': "We can't find that ingredient.",
    });
    expect((await request(app).get('/api/kitchen')).body).toEqual({ ingredientIds: [onion] });
  });
});

describe('GET /api/kitchen/matches', () => {
  it('lists every recipe A–Z when nothing is picked', async () => {
    const { matching, others } = await matchesOf(createTestApp());
    const names = matching.map((match) => match.recipe.name);

    expect(names).toHaveLength(20);
    expect(names[0]).toBe('Apple Crumble');
    expect(others).toEqual([]);
  });

  it('ranks the first F8 example', async () => {
    const app = createTestApp();
    const ingredientIds = await idsOf(app, [
      'potatoes',
      'onion',
      'chopped tomatoes',
      'butter',
      'milk',
    ]);
    await request(app).put('/api/kitchen').send({ ingredientIds }).expect(200);

    const { matching } = await matchesOf(app);

    expect(
      matching.slice(0, 3).map(({ recipe, haveCount, ingredientCount, toBuy }) => ({
        name: recipe.name,
        haveCount,
        ingredientCount,
        toBuy,
      })),
    ).toEqual([
      {
        name: 'Sausage and Mash',
        haveCount: 4,
        ingredientCount: 6,
        toBuy: ['pork sausages', 'gravy granules'],
      },
      {
        name: 'Scrambled Eggs on Toast',
        haveCount: 2,
        ingredientCount: 5,
        toBuy: ['eggs', 'bread', 'salt and pepper'],
      },
      {
        name: 'Cheese and Ham Toastie',
        haveCount: 1,
        ingredientCount: 4,
        toBuy: ['bread', 'cheddar', 'ham'],
      },
    ]);
  });

  it('groups the ranking by the saved preferences', async () => {
    const app = createTestApp();
    const ingredientIds = await idsOf(app, ['onion', 'garlic']);
    await request(app).put('/api/kitchen').send({ ingredientIds });
    await request(app)
      .put('/api/preferences')
      .send({ dietary: ['vegan'] });

    const { matching, others } = await matchesOf(app);

    expect(matching.map((match) => match.recipe.name)).toEqual(['Tomato Soup', 'Lentil Dahl']);
    expect(others).toHaveLength(18);
  });
});
