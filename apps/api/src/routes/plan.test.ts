import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { errorBodySchema } from '@nosh/shared/errors';
import { planSchema, plannedMealSchema } from '@nosh/shared/plan';

import { createTestApp } from '../testing/create-test-app.ts';

async function planOf(app: ReturnType<typeof createTestApp>) {
  const res = await request(app).get('/api/plan').expect(200);
  return planSchema.parse(res.body);
}

function namesOn(plan: Awaited<ReturnType<typeof planOf>>, day: number) {
  return plan.days[day - 1]?.meals.map((meal) => meal.recipe.name);
}

describe('GET /api/plan', () => {
  it('starts as seven empty days, Monday first', async () => {
    const plan = await planOf(createTestApp());

    expect(plan.days.map((d) => d.day)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(plan.days.every((d) => d.meals.length === 0)).toBe(true);
  });
});

describe('POST /api/plan', () => {
  it('adds meals to a day in order: Monday holds Porridge, Tomato Soup and Chilli con Carne', async () => {
    const app = createTestApp();
    for (const recipeSlug of [
      'porridge-with-berries-and-honey',
      'tomato-soup',
      'chilli-con-carne',
    ]) {
      await request(app).post('/api/plan').send({ day: 1, recipeSlug }).expect(201);
    }

    expect(namesOn(await planOf(app), 1)).toEqual([
      'Porridge with Berries and Honey',
      'Tomato Soup',
      'Chilli con Carne',
    ]);
  });

  it('answers with the new meal, including the recipe summary', async () => {
    const res = await request(createTestApp())
      .post('/api/plan')
      .send({ day: 2, recipeSlug: 'tomato-soup' })
      .expect(201);
    const meal = plannedMealSchema.parse(res.body);

    expect(meal.day).toBe(2);
    expect(meal.recipe).toMatchObject({
      slug: 'tomato-soup',
      name: 'Tomato Soup',
      tags: ['batch-cook'],
    });
  });

  it('lets one recipe go on two days', async () => {
    const app = createTestApp();
    await request(app).post('/api/plan').send({ day: 2, recipeSlug: 'tomato-soup' }).expect(201);
    await request(app).post('/api/plan').send({ day: 5, recipeSlug: 'tomato-soup' }).expect(201);
    const plan = await planOf(app);

    expect(namesOn(plan, 2)).toEqual(['Tomato Soup']);
    expect(namesOn(plan, 5)).toEqual(['Tomato Soup']);
  });

  it.each([
    [{}, { day: 'Choose a day.', recipeSlug: 'Choose a recipe.' }],
    [{ day: 8, recipeSlug: 'tomato-soup' }, { day: 'Choose a day from Monday to Sunday.' }],
    [{ day: 1, recipeSlug: 'beans-on-toast' }, { recipeSlug: "We can't find that recipe." }],
  ])('rejects %j with a message per field and saves nothing', async (input, fields) => {
    const app = createTestApp();
    const res = await request(app).post('/api/plan').send(input).expect(400);

    expect(errorBodySchema.parse(res.body).error).toMatchObject({ code: 'invalid_input', fields });
    expect((await planOf(app)).days.every((d) => d.meals.length === 0)).toBe(true);
  });

  it('rejects a body that is not JSON', async () => {
    const res = await request(createTestApp())
      .post('/api/plan')
      .set('Content-Type', 'application/json')
      .send('{"day": 1,')
      .expect(400);

    expect(errorBodySchema.parse(res.body).error.code).toBe('invalid_json');
  });
});

describe('DELETE /api/plan/:id', () => {
  it('removes one meal, and is a 404 once it has gone', async () => {
    const app = createTestApp();
    const added = await request(app).post('/api/plan').send({ day: 3, recipeSlug: 'lentil-dahl' });
    const { id } = plannedMealSchema.parse(added.body);

    await request(app).delete(`/api/plan/${id}`).expect(204);
    expect(namesOn(await planOf(app), 3)).toEqual([]);

    const res = await request(app).delete(`/api/plan/${id}`).expect(404);
    expect(errorBodySchema.parse(res.body).error.code).toBe('meal_not_found');
  });

  it('is a 404 for an id that is not a number', async () => {
    await request(createTestApp()).delete('/api/plan/soup').expect(404);
  });
});

describe('DELETE /api/plan', () => {
  it('clears the whole week', async () => {
    const app = createTestApp();
    await request(app).post('/api/plan').send({ day: 1, recipeSlug: 'tomato-soup' });
    await request(app).post('/api/plan').send({ day: 6, recipeSlug: 'sausage-and-mash' });

    await request(app).delete('/api/plan').expect(204);
    expect((await planOf(app)).days.every((d) => d.meals.length === 0)).toBe(true);
  });
});
