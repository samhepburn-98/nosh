import { describe, expect, it } from 'vitest';

import { formatAmount } from './units.ts';

describe('formatAmount', () => {
  it.each([
    [2, 'clove', '2 cloves'],
    [1, 'clove', '1 clove'],
    [2, 'tin', '2 tins'],
    [1, 'tin', '1 tin'],
    [1.5, 'tin', '1.5 tins'],
    [4, 'slice', '4 slices'],
    [500, 'ml', '500 ml'],
    [100, 'g', '100 g'],
    [2, 'tbsp', '2 tbsp'],
    [0.5, 'tsp', '0.5 tsp'],
  ] as const)('%d %s reads "%s"', (quantity, unit, expected) => {
    expect(formatAmount(quantity, unit)).toBe(expected);
  });

  it('gives a count with no unit as the number alone', () => {
    expect(formatAmount(4, null)).toBe('4');
    expect(formatAmount(1, null)).toBe('1');
  });

  it('gives nothing when there is no quantity', () => {
    expect(formatAmount(null, null)).toBeNull();
    expect(formatAmount(null, 'tin')).toBeNull();
  });
});
