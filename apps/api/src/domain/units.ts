import { UNITS, type Unit } from '@nosh/shared/units';

/**
 * How an amount reads on a recipe: "2 cloves", "1 tin", "500 ml", or "4" for a count.
 * Units are plural when the quantity isn't 1. No quantity (salt and pepper) gives null.
 */
export function formatAmount(quantity: number | null, unit: Unit | null): string | null {
  if (quantity === null) return null;
  if (unit === null) return String(quantity);
  return `${quantity} ${quantity === 1 ? unit : UNITS[unit].plural}`;
}
