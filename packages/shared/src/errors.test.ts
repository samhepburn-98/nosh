import { describe, expect, it } from 'vitest';

import { toFieldErrors } from './errors.ts';
import { addMealInputSchema } from './plan.ts';

function fieldErrorsFor(input: unknown) {
  const result = addMealInputSchema.safeParse(input);
  if (result.success) throw new Error('Expected the input to fail');
  return toFieldErrors(result.error);
}

describe('toFieldErrors', () => {
  it('gives one plain message per bad field', () => {
    expect(fieldErrorsFor({})).toEqual({ day: 'Choose a day.', recipeSlug: 'Choose a recipe.' });
  });

  it('explains a day out of range', () => {
    expect(fieldErrorsFor({ day: 8, recipeSlug: 'tomato-soup' })).toEqual({
      day: 'Choose a day from Monday to Sunday.',
    });
  });
});
