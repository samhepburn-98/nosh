import { z } from 'zod';

/**
 * Every unit an ingredient line can use, with its plural ("2 cloves") and its kind.
 * Weights and volumes also have their size in g or ml, so they can be added together.
 * Named units (tin, clove…) have no size: they add up only with the same unit.
 * A line with no unit is a count ("2 onions").
 */
export const UNITS = {
  g: { plural: 'g', kind: 'weight', size: 1 },
  kg: { plural: 'kg', kind: 'weight', size: 1000 },
  ml: { plural: 'ml', kind: 'volume', size: 1 },
  l: { plural: 'l', kind: 'volume', size: 1000 },
  tsp: { plural: 'tsp', kind: 'volume', size: 5 },
  tbsp: { plural: 'tbsp', kind: 'volume', size: 15 },
  tin: { plural: 'tins', kind: 'named' },
  slice: { plural: 'slices', kind: 'named' },
  rasher: { plural: 'rashers', kind: 'named' },
  clove: { plural: 'cloves', kind: 'named' },
  thumb: { plural: 'thumbs', kind: 'named' },
  ball: { plural: 'balls', kind: 'named' },
  handful: { plural: 'handfuls', kind: 'named' },
} as const;

export type Unit = keyof typeof UNITS;
export const unitSchema = z.enum(Object.keys(UNITS) as [Unit, ...Unit[]]);

/** A quantity and its unit: 500 ml, 2 tins, or 4 (a count). */
export const amountSchema = z.object({
  quantity: z.number(),
  unit: unitSchema.nullable(),
});
export type Amount = z.infer<typeof amountSchema>;
