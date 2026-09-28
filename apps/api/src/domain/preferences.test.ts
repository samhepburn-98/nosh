import { describe, expect, it } from 'vitest';

import type { Dietary } from '@nosh/shared/dietary';

import { starterRecipes } from '../testing/starter-recipes.ts';
import { groupByPreferences, meetsPreferences } from './preferences.ts';

describe('meetsPreferences', () => {
  it('fits every recipe when there are no preferences, untagged ones included', () => {
    expect(meetsPreferences([], [])).toBe(true);
    expect(meetsPreferences(['vegan'], [])).toBe(true);
  });

  it('needs every preference: vegetarian alone does not fit vegetarian and gluten-free', () => {
    expect(meetsPreferences(['vegetarian'], ['vegetarian', 'gluten-free'])).toBe(false);
    expect(meetsPreferences(['vegetarian', 'gluten-free'], ['vegetarian', 'gluten-free'])).toBe(
      true,
    );
  });

  it('counts vegan as vegetarian and dairy-free', () => {
    expect(meetsPreferences(['vegan'], ['vegetarian'])).toBe(true);
    expect(meetsPreferences(['vegan'], ['dairy-free'])).toBe(true);
    expect(meetsPreferences(['vegan'], ['gluten-free'])).toBe(false);
  });

  it('never counts vegetarian and dairy-free as vegan', () => {
    expect(meetsPreferences(['vegetarian', 'dairy-free'], ['vegan'])).toBe(false);
  });

  it('never fits an untagged recipe to a preference', () => {
    expect(meetsPreferences([], ['dairy-free'])).toBe(false);
  });
});

describe('groupByPreferences', () => {
  it('keeps every recipe, in order, split into those that fit and the others', () => {
    const recipes = [
      { name: 'Soup', dietary: ['vegan'] as Dietary[] },
      { name: 'Stew', dietary: [] as Dietary[] },
      { name: 'Salad', dietary: ['vegetarian'] as Dietary[] },
    ];

    expect(groupByPreferences(recipes, ['vegetarian'])).toEqual({
      matching: [recipes[0], recipes[2]],
      others: [recipes[1]],
    });
  });

  it('puts everything in matching when there are no preferences', () => {
    const recipes = [{ name: 'Stew', dietary: [] as Dietary[] }];

    expect(groupByPreferences(recipes, [])).toEqual({ matching: recipes, others: [] });
  });

  describe('the F5 table', () => {
    const matchingNames = (preferences: Dietary[]) =>
      groupByPreferences(starterRecipes, preferences)
        .matching.map((recipe) => recipe.name)
        .sort();

    it('fits all 20 with no preferences', () => {
      expect(matchingNames([])).toHaveLength(20);
    });

    it('fits 5 dairy-free, Tomato Soup via vegan', () => {
      expect(matchingNames(['dairy-free'])).toEqual([
        'Chicken Stir-Fry',
        'Chilli con Carne',
        'Lentil Dahl',
        'Thai Green Curry',
        'Tomato Soup',
      ]);
    });

    it('fits 2 vegan', () => {
      expect(matchingNames(['vegan'])).toEqual(['Lentil Dahl', 'Tomato Soup']);
    });

    it('fits 4 vegetarian and gluten-free', () => {
      expect(matchingNames(['vegetarian', 'gluten-free'])).toEqual([
        'Halloumi and Roasted Vegetable Salad',
        'Jacket Potato with Cheese and Beans',
        'Lentil Dahl',
        'Tomato Soup',
      ]);
    });
  });
});
