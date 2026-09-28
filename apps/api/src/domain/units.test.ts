import { describe, expect, it } from 'vitest';

import type { Amount, Unit } from '@nosh/shared/units';

import { addAmounts, formatAmount, formatAmounts } from './units.ts';

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

describe('addAmounts', () => {
  const amount = (quantity: number, unit: Unit | null = null): Amount => ({ quantity, unit });

  it('gives nothing for no amounts', () => {
    expect(addAmounts([])).toEqual([]);
  });

  it('adds counts', () => {
    expect(addAmounts([amount(1), amount(3)])).toEqual([amount(4)]);
  });

  it('adds the same named unit', () => {
    expect(addAmounts([amount(3, 'clove'), amount(8, 'clove')])).toEqual([amount(11, 'clove')]);
  });

  it('converts volumes to ml and adds them: 500 ml + 2 tbsp = 530 ml', () => {
    expect(addAmounts([amount(500, 'ml'), amount(2, 'tbsp')])).toEqual([amount(530, 'ml')]);
  });

  it('converts weights to g and adds them: 1 kg + 100 g = 1.1 kg', () => {
    expect(addAmounts([amount(1, 'kg'), amount(100, 'g')])).toEqual([amount(1.1, 'kg')]);
  });

  it('keeps a unit every amount shares: 1 tbsp + 2 tbsp = 3 tbsp', () => {
    expect(addAmounts([amount(1, 'tbsp'), amount(2, 'tbsp')])).toEqual([amount(3, 'tbsp')]);
    expect(addAmounts([amount(1, 'kg'), amount(1, 'kg')])).toEqual([amount(2, 'kg')]);
  });

  it('adds tsp and tbsp in ml when they differ: 1 tsp + 1 tbsp = 20 ml', () => {
    expect(addAmounts([amount(1, 'tsp'), amount(1, 'tbsp')])).toEqual([amount(20, 'ml')]);
  });

  it('shows 1000 g or more as kg, and 1000 ml or more as l', () => {
    expect(addAmounts([amount(600, 'g'), amount(600, 'g')])).toEqual([amount(1.2, 'kg')]);
    expect(addAmounts([amount(999, 'g')])).toEqual([amount(999, 'g')]);
    expect(addAmounts([amount(500, 'ml'), amount(0.5, 'l')])).toEqual([amount(1, 'l')]);
  });

  it('never converts between kinds: weight, volume, count, then named units', () => {
    expect(addAmounts([amount(2), amount(600, 'g')])).toEqual([amount(600, 'g'), amount(2)]);
    expect(addAmounts([amount(1, 'tin'), amount(200, 'ml')])).toEqual([
      amount(200, 'ml'),
      amount(1, 'tin'),
    ]);
  });

  it('never adds different named units together', () => {
    expect(addAmounts([amount(1, 'tin'), amount(2, 'handful'), amount(1, 'tin')])).toEqual([
      amount(2, 'tin'),
      amount(2, 'handful'),
    ]);
  });

  describe('rounding, after adding up', () => {
    it('rounds counts and named units up to whole numbers', () => {
      expect(addAmounts([amount(0.5), amount(0.5)])).toEqual([amount(1)]);
      expect(addAmounts([amount(1.2)])).toEqual([amount(2)]);
      expect(addAmounts([amount(0.3, 'tin')])).toEqual([amount(1, 'tin')]);
    });

    it('rounds g and ml to the nearest whole number', () => {
      expect(addAmounts([amount(12.4, 'g')])).toEqual([amount(12, 'g')]);
      expect(addAmounts([amount(12.5, 'ml')])).toEqual([amount(13, 'ml')]);
      // 24.8 g, not 12 g + 12 g.
      expect(addAmounts([amount(12.4, 'g'), amount(12.4, 'g')])).toEqual([amount(25, 'g')]);
    });

    it('rounds tsp and tbsp to the nearest 0.5', () => {
      expect(addAmounts([amount(1.2, 'tsp')])).toEqual([amount(1, 'tsp')]);
      expect(addAmounts([amount(1.3, 'tbsp')])).toEqual([amount(1.5, 'tbsp')]);
    });

    it('never rounds down to nothing', () => {
      expect(addAmounts([amount(0.2, 'g')])).toEqual([amount(1, 'g')]);
      expect(addAmounts([amount(0.1, 'tsp')])).toEqual([amount(0.5, 'tsp')]);
    });
  });
});

describe('formatAmounts', () => {
  it('joins amounts with a plus: "600 g + 2"', () => {
    expect(
      formatAmounts([
        { quantity: 600, unit: 'g' },
        { quantity: 2, unit: null },
      ]),
    ).toBe('600 g + 2');
    expect(
      formatAmounts([
        { quantity: 200, unit: 'ml' },
        { quantity: 1, unit: 'tin' },
      ]),
    ).toBe('200 ml + 1 tin');
  });

  it('reads 1.1 kg and 5 tins', () => {
    expect(formatAmounts([{ quantity: 1.1, unit: 'kg' }])).toBe('1.1 kg');
    expect(formatAmounts([{ quantity: 5, unit: 'tin' }])).toBe('5 tins');
  });

  it('gives nothing when there are no amounts', () => {
    expect(formatAmounts([])).toBeNull();
  });
});
