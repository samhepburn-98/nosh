import { describe, expect, it } from 'vitest';

import { starterRecipes } from '../testing/starter-recipes.ts';
import { rankByMissing } from './kitchen.ts';

const everyRecipe = starterRecipes.map((recipe) => ({
  recipe: { name: recipe.name },
  ingredients: recipe.ingredients.map(({ item }) => item),
}));

const summary = (match: ReturnType<typeof rankByMissing>[number]) => ({
  name: match.recipe.name,
  haveCount: match.haveCount,
  ingredientCount: match.ingredientCount,
  toBuy: match.toBuy,
});

describe('rankByMissing', () => {
  it('gives the first F8 example: potatoes, onion, chopped tomatoes, butter and milk', () => {
    const ranked = rankByMissing(everyRecipe, [
      'potatoes',
      'onion',
      'chopped tomatoes',
      'butter',
      'milk',
    ]);

    expect(ranked.slice(0, 3).map(summary)).toEqual([
      {
        name: 'Sausage and Mash',
        haveCount: 4,
        ingredientCount: 6,
        toBuy: ['pork sausages', 'gravy granules'],
      },
      {
        name: 'Scrambled Eggs on Toast',
        haveCount: 2,
        ingredientCount: 5,
        toBuy: ['eggs', 'bread', 'salt and pepper'],
      },
      {
        name: 'Cheese and Ham Toastie',
        haveCount: 1,
        ingredientCount: 4,
        toBuy: ['bread', 'cheddar', 'ham'],
      },
    ]);
  });

  it('gives the second F8 example, with salt and pepper and olive oil too', () => {
    const ranked = rankByMissing(everyRecipe, [
      'potatoes',
      'onion',
      'chopped tomatoes',
      'butter',
      'milk',
      'salt and pepper',
      'olive oil',
    ]);

    expect(ranked.slice(0, 3).map(summary)).toEqual([
      {
        name: 'Sausage and Mash',
        haveCount: 4,
        ingredientCount: 6,
        toBuy: ['pork sausages', 'gravy granules'],
      },
      {
        name: 'Tomato Soup',
        haveCount: 4,
        ingredientCount: 6,
        toBuy: ['garlic', 'vegetable stock'],
      },
      {
        name: 'Scrambled Eggs on Toast',
        haveCount: 3,
        ingredientCount: 5,
        toBuy: ['eggs', 'bread'],
      },
    ]);
  });

  it('matches by singular form: carrot covers carrots', () => {
    const [match] = rankByMissing(
      [{ recipe: { name: 'Pie' }, ingredients: ['carrots', 'lamb mince'] }],
      ['carrot'],
    );

    expect(match?.toBuy).toEqual(['lamb mince']);
  });

  it('never matches "pepper" to red pepper or salt and pepper', () => {
    const [match] = rankByMissing(
      [{ recipe: { name: 'Stir-fry' }, ingredients: ['red pepper', 'salt and pepper'] }],
      ['pepper'],
    );

    expect(match?.haveCount).toBe(0);
  });

  it('counts an ingredient a recipe lists twice once', () => {
    const [match] = rankByMissing(
      [{ recipe: { name: 'Stew' }, ingredients: ['onion', 'onions', 'garlic'] }],
      ['onion'],
    );

    expect(summary(match!)).toEqual({
      name: 'Stew',
      haveCount: 1,
      ingredientCount: 2,
      toBuy: ['garlic'],
    });
  });

  it('puts recipes you have nothing for last, however short', () => {
    const ranked = rankByMissing(
      [
        { recipe: { name: 'Toast' }, ingredients: ['bread'] },
        { recipe: { name: 'Soup' }, ingredients: ['onion', 'garlic', 'stock', 'leeks'] },
      ],
      ['onion'],
    );

    expect(ranked.map((match) => match.recipe.name)).toEqual(['Soup', 'Toast']);
  });

  it('breaks ties by most you have, then by name', () => {
    const ranked = rankByMissing(
      [
        { recipe: { name: 'Bean Stew' }, ingredients: ['beans', 'onion', 'rice'] },
        { recipe: { name: 'Apple Pie' }, ingredients: ['apples', 'onion', 'rice'] },
        { recipe: { name: 'Big Stew' }, ingredients: ['beans', 'onion', 'rice', 'garlic'] },
      ],
      ['onion', 'garlic'],
    );

    expect(ranked.map((match) => match.recipe.name)).toEqual([
      'Big Stew',
      'Apple Pie',
      'Bean Stew',
    ]);
  });

  it('lists every recipe A–Z when nothing is picked', () => {
    const ranked = rankByMissing(everyRecipe, []);
    const names = ranked.map((match) => match.recipe.name);

    expect(names).toHaveLength(20);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});
