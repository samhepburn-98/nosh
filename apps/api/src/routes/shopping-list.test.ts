import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { shoppingListSchema } from '@nosh/shared/shopping-list';

import { createTestApp } from '../testing/create-test-app.ts';

async function plan(app: ReturnType<typeof createTestApp>, recipeSlugs: string[]) {
  for (const recipeSlug of recipeSlugs) {
    await request(app).post('/api/plan').send({ day: 1, recipeSlug }).expect(201);
  }
}

async function shoppingListOf(app: ReturnType<typeof createTestApp>) {
  const res = await request(app).get('/api/shopping-list').expect(200);
  return shoppingListSchema.parse(res.body).items;
}

describe('GET /api/shopping-list', () => {
  it('is empty for an empty plan', async () => {
    expect(await shoppingListOf(createTestApp())).toEqual([]);
  });

  it('gives every F7 row for the F7 plan', async () => {
    const app = createTestApp();
    await plan(app, [
      'porridge-with-berries-and-honey',
      'scrambled-eggs-on-toast',
      'tomato-soup',
      'chilli-con-carne',
      'lentil-dahl',
      'chicken-tikka-masala',
      'chicken-stir-fry',
      'thai-green-curry',
    ]);
    const amounts = Object.fromEntries(
      (await shoppingListOf(app)).map((item) => [item.name, item.amountText]),
    );

    expect(amounts).toMatchObject({
      milk: '530 ml',
      onion: '4',
      garlic: '11 cloves',
      'chopped tomatoes': '5 tins',
      'chicken breast': '600 g + 2',
      'coconut milk': '200 ml + 1 tin',
      rice: '600 g',
      'basmati rice': '300 g',
      'jasmine rice': '300 g',
      'red pepper': '2',
      'salt and pepper': null,
    });
  });

  it("gives carrots 3 for Bolognese and Shepherd's Pie", async () => {
    const app = createTestApp();
    await plan(app, ['spaghetti-bolognese', 'shepherds-pie']);

    expect((await shoppingListOf(app)).find((item) => item.name === 'carrots')).toMatchObject({
      amountText: '3',
      usedIn: ["Shepherd's Pie", 'Spaghetti Bolognese'],
    });
  });

  it('buys a recipe planned on two days twice, and follows the plan as it changes', async () => {
    const app = createTestApp();
    await plan(app, ['tomato-soup']);
    await request(app).post('/api/plan').send({ day: 3, recipeSlug: 'tomato-soup' }).expect(201);

    const chopped = (items: Awaited<ReturnType<typeof shoppingListOf>>) =>
      items.find((item) => item.name === 'chopped tomatoes')?.amountText;
    expect(chopped(await shoppingListOf(app))).toBe('4 tins');

    await request(app).delete('/api/plan').expect(204);
    expect(await shoppingListOf(app)).toEqual([]);
  });
});
