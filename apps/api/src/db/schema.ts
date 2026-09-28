import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { DIETARY, type Dietary } from '@nosh/shared/dietary';
import { MEAL_TYPES } from '@nosh/shared/meal-types';
import { UNITS, type Unit } from '@nosh/shared/units';

export const recipes = sqliteTable('recipes', {
  id: integer().primaryKey(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  cuisine: text().notNull(),
  serves: integer().notNull(),
  isBuiltin: integer({ mode: 'boolean' }).notNull(),
});

export const recipeSteps = sqliteTable(
  'recipe_steps',
  {
    recipeId: integer()
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    position: integer().notNull(),
    text: text().notNull(),
  },
  (t) => [primaryKey({ columns: [t.recipeId, t.position] })],
);

/** One row per ingredient name, stored exactly as written. Names are unique ignoring case. */
export const ingredients = sqliteTable(
  'ingredients',
  {
    id: integer().primaryKey(),
    name: text().notNull(),
  },
  (t) => [uniqueIndex('ingredients_name_unique').on(sql`lower(${t.name})`)],
);

/** A recipe's ingredient lines, in order. Quantity and unit are null when the recipe gives none. */
export const recipeIngredients = sqliteTable(
  'recipe_ingredients',
  {
    recipeId: integer()
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    position: integer().notNull(),
    ingredientId: integer()
      .notNull()
      .references(() => ingredients.id),
    quantity: real(),
    unit: text({ enum: Object.keys(UNITS) as [Unit, ...Unit[]] }),
    prep: text(),
  },
  (t) => [
    primaryKey({ columns: [t.recipeId, t.position] }),
    index('recipe_ingredients_ingredient_id').on(t.ingredientId),
  ],
);

export const recipeDietary = sqliteTable(
  'recipe_dietary',
  {
    recipeId: integer()
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    dietary: text({ enum: DIETARY }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.recipeId, t.dietary] })],
);

export const recipeMealTypes = sqliteTable(
  'recipe_meal_types',
  {
    recipeId: integer()
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    mealType: text({ enum: MEAL_TYPES }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.recipeId, t.mealType] })],
);

/** The client's other labels, such as "quick" and "batch-cook". */
export const tags = sqliteTable('tags', {
  id: integer().primaryKey(),
  name: text().notNull().unique(),
});

export const recipeTags = sqliteTable(
  'recipe_tags',
  {
    recipeId: integer()
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    tagId: integer()
      .notNull()
      .references(() => tags.id),
  },
  (t) => [primaryKey({ columns: [t.recipeId, t.tagId] })],
);

/** The week's plan: one row per meal, a recipe on a day from 1 (Monday) to 7 (Sunday). */
export const planEntries = sqliteTable(
  'plan_entries',
  {
    id: integer().primaryKey(),
    day: integer().notNull(),
    recipeId: integer()
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
  },
  (t) => [check('plan_entries_day', sql`${t.day} between 1 and 7`)],
);

/** A single row (id 1): the dietary preferences, in display order. */
export const preferences = sqliteTable(
  'preferences',
  {
    id: integer().primaryKey(),
    dietary: text({ mode: 'json' }).$type<Dietary[]>().notNull(),
  },
  (t) => [check('preferences_single_row', sql`${t.id} = 1`)],
);
