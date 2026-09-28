import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { errorBodySchema } from '@nosh/shared/errors';
import { ingredientSchema } from '@nosh/shared/ingredients';
import { recipeGroupsSchema, recipeSchema } from '@nosh/shared/recipes';
import { shoppingListSchema } from '@nosh/shared/shopping-list';

import { createTestApp } from '../testing/create-test-app.ts';

async function recipeGroupsOf(app: ReturnType<typeof createTestApp>) {
  const res = await request(app).get('/api/recipes').expect(200);
  return recipeGroupsSchema.parse(res.body);
}

describe('GET /api/recipes', () => {
  it('lists all 20 recipes A–Z as matching, with no preferences saved', async () => {
    const { matching, others } = await recipeGroupsOf(createTestApp());
    const names = matching.map((recipe) => recipe.name);

    expect(matching).toHaveLength(20);
    expect(others).toEqual([]);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    expect(names[0]).toBe('Apple Crumble');
  });

  it('splits them by the saved preferences, each group A–Z', async () => {
    const app = createTestApp();
    await request(app)
      .put('/api/preferences')
      .send({ dietary: ['vegan'] });

    const { matching, others } = await recipeGroupsOf(app);

    expect(matching.map((recipe) => recipe.name)).toEqual(['Lentil Dahl', 'Tomato Soup']);
    expect(others).toHaveLength(18);
    expect(others[0]?.name).toBe('Apple Crumble');
  });

  it("includes the client's tags: Porridge is quick", async () => {
    const { matching: summaries } = await recipeGroupsOf(createTestApp());

    expect(summaries.find((r) => r.slug === 'porridge-with-berries-and-honey')).toEqual({
      slug: 'porridge-with-berries-and-honey',
      name: 'Porridge with Berries and Honey',
      serves: 2,
      mealTypes: ['breakfast'],
      dietary: ['vegetarian'],
      tags: ['quick'],
      isOwn: false,
    });
  });

  it('lists dietary tags and meal types in display order', async () => {
    const { matching: summaries } = await recipeGroupsOf(createTestApp());

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

  it('says which days the recipe is planned for, each once, Monday first', async () => {
    const app = createTestApp();
    const plannedOn = async () =>
      recipeSchema.parse((await request(app).get('/api/recipes/tomato-soup')).body).plannedOn;

    expect(await plannedOn()).toEqual([]);

    for (const day of [5, 2, 2]) {
      await request(app).post('/api/plan').send({ day, recipeSlug: 'tomato-soup' }).expect(201);
    }
    await request(app).post('/api/plan').send({ day: 3, recipeSlug: 'lentil-dahl' }).expect(201);

    expect(await plannedOn()).toEqual([2, 5]);
  });

  it('is a 404 for a recipe that does not exist', async () => {
    const res = await request(createTestApp()).get('/api/recipes/beans-on-toast').expect(404);

    expect(errorBodySchema.parse(res.body).error.code).toBe('recipe_not_found');
  });
});

describe('POST /api/recipes', () => {
  const leekSoup = {
    name: 'Leek Soup',
    serves: 4,
    mealTypes: ['lunch'],
    dietary: ['vegetarian'],
    ingredients: [
      { quantity: 2, unit: null, ingredient: { kind: 'new', name: 'leeks' }, prep: 'sliced' },
      {
        quantity: 500,
        unit: 'ml',
        ingredient: { kind: 'new', name: 'Vegetable Stock' },
        prep: null,
      },
      {
        quantity: null,
        unit: null,
        ingredient: { kind: 'new', name: 'salt and pepper' },
        prep: null,
      },
    ],
    method: ['Soften the leeks.', 'Add the stock and simmer for 20 minutes.'],
  };

  async function ingredientsOf(app: ReturnType<typeof createTestApp>) {
    const res = await request(app).get('/api/ingredients').expect(200);
    return ingredientSchema.array().parse(res.body);
  }

  it('adds the recipe and answers 201 with it in full, as your own', async () => {
    const app = createTestApp();

    const res = await request(app).post('/api/recipes').send(leekSoup).expect(201);

    expect(recipeSchema.parse(res.body)).toEqual({
      slug: 'leek-soup',
      name: 'Leek Soup',
      serves: 4,
      mealTypes: ['lunch'],
      dietary: ['vegetarian'],
      tags: [],
      isOwn: true,
      ingredients: [
        { amount: '2', name: 'leeks', prep: 'sliced' },
        { amount: '500 ml', name: 'vegetable stock', prep: null },
        { amount: null, name: 'salt and pepper', prep: null },
      ],
      method: ['Soften the leeks.', 'Add the stock and simmer for 20 minutes.'],
      plannedOn: [],
    });
    await request(app).get('/api/recipes/leek-soup').expect(200);
    const { matching } = await recipeGroupsOf(app);
    expect(matching.find((recipe) => recipe.slug === 'leek-soup')?.isOwn).toBe(true);
  });

  it('adds a new ingredient once, and links names it already knows', async () => {
    const app = createTestApp();
    await request(app)
      .post('/api/recipes')
      .send({
        ...leekSoup,
        ingredients: [
          ...leekSoup.ingredients,
          { quantity: 1, unit: null, ingredient: { kind: 'new', name: 'Leeks' }, prep: null },
        ],
      })
      .expect(201);

    const names = (await ingredientsOf(app)).map((ingredient) => ingredient.name);
    // 79 starter ingredients, plus "leeks". "Vegetable Stock" and "salt and pepper" are known.
    expect(names).toHaveLength(80);
    expect(names).toContain('leeks');
    expect(names).not.toContain('Vegetable Stock');
  });

  it('links "Carrot" to "carrot", so it adds up with Shepherd\'s Pie\'s carrots', async () => {
    const app = createTestApp();
    const res = await request(app)
      .post('/api/recipes')
      .send({
        ...leekSoup,
        name: 'Carrot Mash',
        ingredients: [
          { quantity: 3, unit: null, ingredient: { kind: 'new', name: 'Carrot' }, prep: null },
        ],
      })
      .expect(201);
    for (const recipeSlug of [recipeSchema.parse(res.body).slug, 'shepherds-pie']) {
      await request(app).post('/api/plan').send({ day: 1, recipeSlug }).expect(201);
    }

    const list = shoppingListSchema.parse((await request(app).get('/api/shopping-list')).body);
    expect(list.items.find((item) => item.name === 'carrots')).toMatchObject({
      amountText: '5',
      usedIn: ['Carrot Mash', "Shepherd's Pie"],
    });
  });

  it('gives a second "Tomato Soup" the slug tomato-soup-2', async () => {
    const res = await request(createTestApp())
      .post('/api/recipes')
      .send({ ...leekSoup, name: 'Tomato Soup' })
      .expect(201);

    expect(recipeSchema.parse(res.body).slug).toBe('tomato-soup-2');
  });

  it('answers an empty form with a message per field, and saves nothing', async () => {
    const app = createTestApp();

    const res = await request(app).post('/api/recipes').send({}).expect(400);

    expect(Object.keys(errorBodySchema.parse(res.body).error.fields ?? {})).toEqual([
      'name',
      'serves',
      'mealTypes',
      'ingredients',
      'method',
    ]);
    expect((await recipeGroupsOf(app)).matching).toHaveLength(20);
  });

  it('refuses an ingredient id it does not know, and saves nothing', async () => {
    const app = createTestApp();

    const res = await request(app)
      .post('/api/recipes')
      .send({
        ...leekSoup,
        ingredients: [
          leekSoup.ingredients[0],
          { quantity: 1, unit: null, ingredient: { kind: 'existing', id: 9999 }, prep: null },
        ],
      })
      .expect(400);

    expect(errorBodySchema.parse(res.body).error.fields).toEqual({
      'ingredients.1.ingredient': "We can't find that ingredient.",
    });
    expect((await recipeGroupsOf(app)).matching).toHaveLength(20);
    expect(await ingredientsOf(app)).toHaveLength(79);
  });
});
