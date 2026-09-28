import { describe, expect, it } from 'vitest';

import { starterRecipe } from '../testing/starter-recipes.ts';
import { buildShoppingList } from './shopping-list.ts';

const plan = (...names: string[]) => names.map(starterRecipe);

function lineFor(list: ReturnType<typeof buildShoppingList>, name: string) {
  const line = list.find((item) => item.name === name);
  if (!line) throw new Error(`The list has no "${name}".`);
  return line;
}

describe('buildShoppingList', () => {
  it('gives nothing for an empty plan', () => {
    expect(buildShoppingList([])).toEqual([]);
  });

  it('lists every ingredient once, A–Z, with its amount', () => {
    expect(buildShoppingList(plan('Cheese and Ham Toastie'))).toEqual([
      {
        name: 'bread',
        amounts: [{ quantity: 2, unit: 'slice' }],
        amountText: '2 slices',
        usedIn: ['Cheese and Ham Toastie'],
      },
      {
        name: 'butter',
        amounts: [{ quantity: 15, unit: 'g' }],
        amountText: '15 g',
        usedIn: ['Cheese and Ham Toastie'],
      },
      {
        name: 'cheddar',
        amounts: [{ quantity: 60, unit: 'g' }],
        amountText: '60 g',
        usedIn: ['Cheese and Ham Toastie'],
      },
      {
        name: 'ham',
        amounts: [{ quantity: 2, unit: 'slice' }],
        amountText: '2 slices',
        usedIn: ['Cheese and Ham Toastie'],
      },
    ]);
  });

  describe('the F7 plan', () => {
    const list = buildShoppingList(
      plan(
        'Porridge with Berries and Honey',
        'Scrambled Eggs on Toast',
        'Tomato Soup',
        'Chilli con Carne',
        'Lentil Dahl',
        'Chicken Tikka Masala',
        'Chicken Stir-Fry',
        'Thai Green Curry',
      ),
    );

    it.each([
      ['milk', '530 ml'],
      ['onion', '4'],
      ['garlic', '11 cloves'],
      ['chopped tomatoes', '5 tins'],
      ['chicken breast', '600 g + 2'],
      ['coconut milk', '200 ml + 1 tin'],
      ['rice', '600 g'],
      ['basmati rice', '300 g'],
      ['jasmine rice', '300 g'],
      ['red pepper', '2'],
      ['salt and pepper', null],
    ])('gives %s: %s', (name, amountText) => {
      expect(lineFor(list, name).amountText).toBe(amountText);
    });

    it('keeps weight and count apart for chicken breast', () => {
      expect(lineFor(list, 'chicken breast').amounts).toEqual([
        { quantity: 600, unit: 'g' },
        { quantity: 2, unit: null },
      ]);
    });

    it('gives salt and pepper no amounts', () => {
      expect(lineFor(list, 'salt and pepper').amounts).toEqual([]);
    });

    it('is A–Z', () => {
      const names = list.map((item) => item.name);
      expect(names).toEqual(names.toSorted((a, b) => a.localeCompare(b, 'en-GB')));
    });
  });

  it('merges carrot and carrots under the plural name: carrots 3', () => {
    const list = buildShoppingList(plan('Spaghetti Bolognese', "Shepherd's Pie"));

    expect(lineFor(list, 'carrots').amountText).toBe('3');
    expect(list.some((item) => item.name === 'carrot')).toBe(false);
  });

  it('keeps names as stored, whatever the amount: "onion 3", not "onions 3"', () => {
    const list = buildShoppingList(plan('Tomato Soup', 'Spaghetti Bolognese', "Shepherd's Pie"));

    expect(lineFor(list, 'onion').amountText).toBe('3');
    expect(list.some((item) => item.name === 'onions')).toBe(false);
  });

  it('counts a recipe planned twice twice', () => {
    const list = buildShoppingList(plan('Tomato Soup', 'Tomato Soup'));

    expect(lineFor(list, 'chopped tomatoes').amountText).toBe('4 tins');
    expect(lineFor(list, 'olive oil').amountText).toBe('4 tbsp');
  });

  it('says which recipes use each line, each once, A–Z', () => {
    const list = buildShoppingList(plan('Tomato Soup', 'Spaghetti Bolognese', 'Tomato Soup'));

    expect(lineFor(list, 'onion').usedIn).toEqual(['Spaghetti Bolognese', 'Tomato Soup']);
    expect(lineFor(list, 'beef mince').usedIn).toEqual(['Spaghetti Bolognese']);
  });

  it('keeps the amounts recipes give when another gives none', () => {
    const list = buildShoppingList([
      { name: 'Chips', ingredients: [{ name: 'oil', quantity: 2, unit: 'tbsp' }] },
      { name: 'Salad', ingredients: [{ name: 'oil', quantity: null, unit: null }] },
    ]);

    expect(list).toEqual([
      {
        name: 'oil',
        amounts: [{ quantity: 2, unit: 'tbsp' }],
        amountText: '2 tbsp',
        usedIn: ['Chips', 'Salad'],
      },
    ]);
  });
});
