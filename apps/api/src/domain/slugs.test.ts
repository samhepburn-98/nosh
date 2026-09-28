import { describe, expect, it } from 'vitest';

import { starterRecipes } from '../testing/starter-recipes.ts';
import { slugify, uniqueSlug } from './slugs.ts';

describe('slugify', () => {
  it('reproduces all 20 starter slugs from their names', () => {
    for (const recipe of starterRecipes) {
      expect(slugify(recipe.name)).toBe(recipe.id);
    }
  });

  it('lowercases and joins words with dashes', () => {
    expect(slugify('Tomato Soup')).toBe('tomato-soup');
  });

  it('drops apostrophes, straight or curly', () => {
    expect(slugify("Nan's Stew")).toBe('nans-stew');
    expect(slugify('Nan’s Stew')).toBe('nans-stew');
  });

  it('drops accents', () => {
    expect(slugify('Crème Brûlée')).toBe('creme-brulee');
  });

  it('turns other characters into single dashes, trimmed', () => {
    expect(slugify('  Fish & Chips!  ')).toBe('fish-chips');
    expect(slugify('Stir-Fry -- Quick')).toBe('stir-fry-quick');
  });

  it('gives "recipe" when nothing usable is left', () => {
    expect(slugify('!!!')).toBe('recipe');
  });
});

describe('uniqueSlug', () => {
  it('uses the slug when it is free', () => {
    expect(uniqueSlug('Tomato Soup', new Set())).toBe('tomato-soup');
  });

  it('adds -2, then -3, when it is taken', () => {
    expect(uniqueSlug('Tomato Soup', new Set(['tomato-soup']))).toBe('tomato-soup-2');
    expect(uniqueSlug('Tomato Soup', new Set(['tomato-soup', 'tomato-soup-2']))).toBe(
      'tomato-soup-3',
    );
  });

  it('never gives "new", which is the New recipe page', () => {
    expect(uniqueSlug('New', new Set())).toBe('new-2');
  });
});
