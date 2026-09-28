import { readFileSync } from 'node:fs';
import { asc, count, eq } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';
import { describe, expect, it } from 'vitest';

import type { StarterRecipe } from '@nosh/shared/starter-recipes';

import { openDatabase } from './client.ts';
import {
  ingredients,
  recipeDietary,
  recipeIngredients,
  recipeMealTypes,
  recipes,
  recipeSteps,
  recipeTags,
  tags,
} from './schema.ts';
import { loadStarterRecipes, seedStarterRecipes } from './seed.ts';
import { setUpDatabase } from './set-up.ts';

// Compared with the raw file, not the parsed one, so the schema can't hide a change.
const supplied = JSON.parse(
  readFileSync(
    new URL('../../../../data/project-nosh-sample-recipes.json', import.meta.url),
    'utf8',
  ),
) as StarterRecipe[];

type TestDb = ReturnType<typeof setUpDatabase>;

function rowCount(db: TestDb, table: SQLiteTable) {
  return db.select({ n: count() }).from(table).get()?.n;
}

function linesOf(db: TestDb, slug: string) {
  return db
    .select({
      item: ingredients.name,
      quantity: recipeIngredients.quantity,
      unit: recipeIngredients.unit,
      prep: recipeIngredients.prep,
    })
    .from(recipeIngredients)
    .innerJoin(recipes, eq(recipeIngredients.recipeId, recipes.id))
    .innerJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
    .where(eq(recipes.slug, slug))
    .orderBy(asc(recipeIngredients.position))
    .all()
    .map(({ prep, ...line }) => (prep === null ? line : { ...line, prep }));
}

describe('seedStarterRecipes', () => {
  it('makes 20 recipes, 79 ingredients and 132 lines', () => {
    const db = setUpDatabase(':memory:');

    expect(rowCount(db, recipes)).toBe(20);
    expect(rowCount(db, ingredients)).toBe(79);
    expect(rowCount(db, recipeIngredients)).toBe(132);
  });

  it('keeps every ingredient name exactly as written', () => {
    const db = setUpDatabase(':memory:');
    const stored = db.select({ name: ingredients.name }).from(ingredients).all();
    const written = new Set(supplied.flatMap((r) => r.ingredients.map((line) => line.item)));

    expect(new Set(stored.map((row) => row.name))).toEqual(written);
    expect(stored.map((row) => row.name)).toEqual(expect.arrayContaining(['apple', 'apples']));
  });

  it('stores every recipe as supplied: lines, method, meal types, dietary tags and tags', () => {
    const db = setUpDatabase(':memory:');

    for (const recipe of supplied) {
      const row = db.select().from(recipes).where(eq(recipes.slug, recipe.id)).get();
      expect(row).toMatchObject({
        name: recipe.name,
        cuisine: recipe.cuisine,
        serves: recipe.serves,
        isBuiltin: true,
      });
      const recipeId = row!.id;

      expect(linesOf(db, recipe.id)).toEqual(recipe.ingredients);
      expect(
        db
          .select({ text: recipeSteps.text })
          .from(recipeSteps)
          .where(eq(recipeSteps.recipeId, recipeId))
          .orderBy(asc(recipeSteps.position))
          .all()
          .map((step) => step.text),
      ).toEqual(recipe.method);
      expect(
        db
          .select({ mealType: recipeMealTypes.mealType })
          .from(recipeMealTypes)
          .where(eq(recipeMealTypes.recipeId, recipeId))
          .all()
          .map((r) => r.mealType)
          .sort(),
      ).toEqual([...recipe.mealType].sort());
      expect(
        db
          .select({ dietary: recipeDietary.dietary })
          .from(recipeDietary)
          .where(eq(recipeDietary.recipeId, recipeId))
          .all()
          .map((r) => r.dietary)
          .sort(),
      ).toEqual([...recipe.dietary].sort());
      expect(
        db
          .select({ name: tags.name })
          .from(recipeTags)
          .innerJoin(tags, eq(recipeTags.tagId, tags.id))
          .where(eq(recipeTags.recipeId, recipeId))
          .all()
          .map((r) => r.name)
          .sort(),
      ).toEqual([...recipe.tags].sort());
    }
  });

  it('adds nothing when there are already recipes', () => {
    const db = setUpDatabase(':memory:');

    expect(seedStarterRecipes(db, loadStarterRecipes())).toBe(false);
    expect(rowCount(db, recipes)).toBe(20);
    expect(rowCount(db, ingredients)).toBe(79);
  });

  it('saves nothing if any recipe fails', () => {
    const db = setUpDatabase(':memory:');
    db.delete(recipes).run();
    db.delete(ingredients).run();
    const [first] = supplied;

    // The same slug twice breaks the unique index on the second recipe.
    expect(() => seedStarterRecipes(db, [first, first])).toThrow();
    expect(rowCount(db, recipes)).toBe(0);
    expect(rowCount(db, ingredients)).toBe(0);
  });
});

describe('the database', () => {
  it('treats ingredient names as unique ignoring case', () => {
    const db = setUpDatabase(':memory:');

    expect(() => db.insert(ingredients).values({ name: 'Carrot' }).run()).toThrow(/UNIQUE/);
  });

  it('turns foreign keys on for every connection', () => {
    const db = openDatabase(':memory:');

    expect(db.$client.pragma('foreign_keys', { simple: true })).toBe(1);
  });
});
