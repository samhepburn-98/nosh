import { describe, expect, it } from 'vitest';

import { starterIngredientNames } from '../testing/starter-recipes.ts';
import { toKey } from './ingredients.ts';

describe('toKey', () => {
  it('lowercases and trims', () => {
    expect(toKey('  Onion ')).toBe('onion');
  });

  it('makes the last word singular', () => {
    expect(toKey('carrots')).toBe('carrot');
    expect(toKey('chopped tomatoes')).toBe('chopped tomato');
    expect(toKey('mixed berries')).toBe('mixed berry');
    expect(toKey('salad leaves')).toBe('salad leaf');
  });

  it('leaves singular and uncountable words as they are', () => {
    expect(toKey('carrot')).toBe('carrot');
    expect(toKey('rice')).toBe('rice');
    expect(toKey('spaghetti')).toBe('spaghetti');
    expect(toKey('salt and pepper')).toBe('salt and pepper');
  });

  it('corrects words pluralize gets wrong', () => {
    expect(toKey('cookies')).toBe('cookie');
    expect(toKey('chocolate brownies')).toBe('chocolate brownie');
    expect(toKey('quiches')).toBe('quiche');
  });

  it('keeps different names apart', () => {
    const keys = ['pepper', 'red pepper', 'salt and pepper'].map(toKey);
    expect(new Set(keys).size).toBe(3);
    expect(toKey('rice')).not.toBe(toKey('basmati rice'));
  });

  it('only merges apple/apples and carrot/carrots in the starter recipes', () => {
    const namesByKey = new Map<string, string[]>();
    for (const name of starterIngredientNames) {
      const key = toKey(name);
      namesByKey.set(key, [...(namesByKey.get(key) ?? []), name]);
    }
    const shared = [...namesByKey.values()].filter((names) => names.length > 1);

    expect(shared).toEqual([
      ['apple', 'apples'],
      ['carrot', 'carrots'],
    ]);
  });
});
