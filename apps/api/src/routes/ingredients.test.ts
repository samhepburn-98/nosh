import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { ingredientSchema } from '@nosh/shared/ingredients';

import { createTestApp } from '../testing/create-test-app.ts';

describe('GET /api/ingredients', () => {
  it('lists all 79 starter ingredients A–Z, with names as stored', async () => {
    const res = await request(createTestApp()).get('/api/ingredients').expect(200);
    const names = ingredientSchema
      .array()
      .parse(res.body)
      .map((ingredient) => ingredient.name);

    expect(names).toHaveLength(79);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    expect(names.slice(0, 3)).toEqual(['apple', 'apples', 'aubergine']);
    expect(names).toContain('carrot');
    expect(names).toContain('carrots');
  });
});
