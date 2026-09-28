import { describe, expect, it } from 'vitest';

import { groupByDay } from './plan.ts';

describe('groupByDay', () => {
  it('gives seven empty days, Monday (1) first, for an empty plan', () => {
    expect(groupByDay([])).toEqual([
      { day: 1, meals: [] },
      { day: 2, meals: [] },
      { day: 3, meals: [] },
      { day: 4, meals: [] },
      { day: 5, meals: [] },
      { day: 6, meals: [] },
      { day: 7, meals: [] },
    ]);
  });

  it('puts each meal on its day, in the order given', () => {
    const week = groupByDay([
      { id: 1, day: 1, name: 'Porridge' },
      { id: 2, day: 7, name: 'Sausage and Mash' },
      { id: 3, day: 1, name: 'Tomato Soup' },
      { id: 4, day: 1, name: 'Chilli con Carne' },
    ]);

    expect(week[0]?.meals.map((meal) => meal.name)).toEqual([
      'Porridge',
      'Tomato Soup',
      'Chilli con Carne',
    ]);
    expect(week[6]?.meals.map((meal) => meal.name)).toEqual(['Sausage and Mash']);
    expect(week.slice(1, 6).every((day) => day.meals.length === 0)).toBe(true);
  });

  it('lets one recipe be on several days', () => {
    const week = groupByDay([
      { id: 1, day: 2, name: 'Tomato Soup' },
      { id: 2, day: 5, name: 'Tomato Soup' },
    ]);

    expect(week[1]?.meals).toEqual([{ id: 1, day: 2, name: 'Tomato Soup' }]);
    expect(week[4]?.meals).toEqual([{ id: 2, day: 5, name: 'Tomato Soup' }]);
  });
});
