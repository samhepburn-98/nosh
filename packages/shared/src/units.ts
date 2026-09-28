import { z } from 'zod';

/**
 * Every unit an ingredient line can use, with its plural ("2 cloves").
 * A line with no unit is a count ("2 onions").
 */
export const UNITS = {
  g: { plural: 'g' },
  kg: { plural: 'kg' },
  ml: { plural: 'ml' },
  l: { plural: 'l' },
  tsp: { plural: 'tsp' },
  tbsp: { plural: 'tbsp' },
  tin: { plural: 'tins' },
  slice: { plural: 'slices' },
  rasher: { plural: 'rashers' },
  clove: { plural: 'cloves' },
  thumb: { plural: 'thumbs' },
  ball: { plural: 'balls' },
  handful: { plural: 'handfuls' },
} as const;

export type Unit = keyof typeof UNITS;
export const unitSchema = z.enum(Object.keys(UNITS) as [Unit, ...Unit[]]);
