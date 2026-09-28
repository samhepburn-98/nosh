import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { errorBodySchema } from '@nosh/shared/errors';

import { createTestApp } from '../testing/create-test-app.ts';

describe('GET /api/preferences', () => {
  it('starts with none', async () => {
    const res = await request(createTestApp()).get('/api/preferences').expect(200);

    expect(res.body).toEqual({ dietary: [] });
  });
});

describe('PUT /api/preferences', () => {
  it('saves them, each once, in display order', async () => {
    const app = createTestApp();

    const res = await request(app)
      .put('/api/preferences')
      .send({ dietary: ['dairy-free', 'vegetarian', 'dairy-free'] })
      .expect(200);

    expect(res.body).toEqual({ dietary: ['vegetarian', 'dairy-free'] });
    expect((await request(app).get('/api/preferences')).body).toEqual({
      dietary: ['vegetarian', 'dairy-free'],
    });
  });

  it('replaces what was saved, down to none', async () => {
    const app = createTestApp();
    await request(app)
      .put('/api/preferences')
      .send({ dietary: ['vegan'] });
    await request(app).put('/api/preferences').send({ dietary: [] }).expect(200);

    expect((await request(app).get('/api/preferences')).body).toEqual({ dietary: [] });
  });

  it('refuses a preference it does not know, and saves nothing', async () => {
    const app = createTestApp();
    await request(app)
      .put('/api/preferences')
      .send({ dietary: ['vegan'] });

    const res = await request(app)
      .put('/api/preferences')
      .send({ dietary: ['vegetarian', 'pescatarian'] })
      .expect(400);

    expect(errorBodySchema.parse(res.body).error.fields).toEqual({
      'dietary.1': 'Choose vegetarian, vegan, gluten-free or dairy-free.',
    });
    expect((await request(app).get('/api/preferences')).body).toEqual({ dietary: ['vegan'] });
  });

  it('needs a list', async () => {
    const res = await request(createTestApp()).put('/api/preferences').send({}).expect(400);

    expect(errorBodySchema.parse(res.body).error.fields).toEqual({
      dietary: 'Choose your dietary preferences.',
    });
  });
});
