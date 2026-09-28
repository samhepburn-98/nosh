import { describe, expect, it } from 'vitest';

import { toFieldErrors } from './errors.ts';
import { newRecipeSchema } from './recipes.ts';

const soup = {
  name: 'Leek Soup',
  serves: 4,
  mealTypes: ['lunch'],
  dietary: [],
  ingredients: [
    { quantity: 2, unit: null, ingredient: { kind: 'new', name: 'leeks' }, prep: 'sliced' },
    { quantity: null, unit: null, ingredient: { kind: 'existing', id: 7 }, prep: null },
  ],
  method: ['Soften the leeks.', 'Add the stock and simmer.'],
};

function fieldErrorsFor(input: unknown) {
  const result = newRecipeSchema.safeParse(input);
  if (result.success) throw new Error('Expected the input to fail');
  return toFieldErrors(result.error);
}

describe('newRecipeSchema', () => {
  it('accepts a whole recipe', () => {
    expect(newRecipeSchema.parse(soup)).toEqual(soup);
  });

  it('trims text, drops an empty prep, and puts tags in display order, each once', () => {
    const parsed = newRecipeSchema.parse({
      ...soup,
      name: '  Leek Soup ',
      mealTypes: ['dinner', 'lunch', 'dinner'],
      dietary: ['dairy-free', 'vegan'],
      ingredients: [{ ...soup.ingredients[0], prep: '  ' }],
      method: [' Soften the leeks. '],
    });

    expect(parsed).toMatchObject({
      name: 'Leek Soup',
      mealTypes: ['lunch', 'dinner'],
      dietary: ['vegan', 'dairy-free'],
      ingredients: [{ prep: null }],
      method: ['Soften the leeks.'],
    });
  });

  it('gives an empty form one message per field', () => {
    expect(fieldErrorsFor({})).toEqual({
      name: 'Give your recipe a name.',
      serves: 'Choose how many it serves, from 1 to 12.',
      mealTypes: 'Choose at least one meal type.',
      ingredients: 'Add at least one ingredient.',
      method: 'Add at least one step.',
    });
    expect(
      fieldErrorsFor({ name: ' ', serves: 0, mealTypes: [], ingredients: [], method: [] }),
    ).toEqual({
      name: 'Give your recipe a name.',
      serves: 'Choose how many it serves, from 1 to 12.',
      mealTypes: 'Choose at least one meal type.',
      ingredients: 'Add at least one ingredient.',
      method: 'Add at least one step.',
    });
  });

  it('keeps serves to a whole number from 1 to 12, and the name to 80 characters', () => {
    expect(fieldErrorsFor({ ...soup, serves: 13 })).toEqual({
      serves: 'Choose how many it serves, from 1 to 12.',
    });
    expect(fieldErrorsFor({ ...soup, serves: 2.5 })).toEqual({
      serves: 'Choose how many it serves, from 1 to 12.',
    });
    expect(fieldErrorsFor({ ...soup, name: 'a'.repeat(81) })).toEqual({
      name: 'Keep the name to 80 characters or fewer.',
    });
  });

  it('puts each ingredient line error on its field', () => {
    const line = soup.ingredients[0];

    expect(
      fieldErrorsFor({
        ...soup,
        ingredients: [
          { ...line, quantity: 0 },
          { ...line, quantity: null, unit: 'tin' },
          { ...line, ingredient: { kind: 'new', name: ' ' } },
          { ...line, ingredient: undefined },
        ],
      }),
    ).toEqual({
      'ingredients.0.quantity': 'Use an amount above 0, or leave it blank.',
      'ingredients.1.quantity': 'Add an amount for this unit, or choose No unit.',
      'ingredients.2.ingredient.name': 'Choose or type an ingredient.',
      'ingredients.3.ingredient': 'Choose or type an ingredient.',
    });
  });

  it('refuses an empty step', () => {
    expect(fieldErrorsFor({ ...soup, method: ['Soften the leeks.', '  '] })).toEqual({
      'method.1': 'Write this step, or remove it.',
    });
  });
});
