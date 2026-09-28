import { UNITS, type Amount, type Unit } from '@nosh/shared/units';

/**
 * How an amount reads on a recipe: "2 cloves", "1 tin", "500 ml", or "4" for a count.
 * Units are plural when the quantity isn't 1. No quantity (salt and pepper) gives null.
 */
export function formatAmount(quantity: number | null, unit: Unit | null): string | null {
  if (quantity === null) return null;
  if (unit === null) return String(quantity);
  return `${quantity} ${quantity === 1 ? unit : UNITS[unit].plural}`;
}

/** How added-up amounts read: "600 g + 2". No amounts gives null. */
export function formatAmounts(amounts: Amount[]): string | null {
  if (amounts.length === 0) return null;
  return amounts.map(({ quantity, unit }) => formatAmount(quantity, unit)).join(' + ');
}

/**
 * Adds amounts up, one per kind, in this order: weight, volume, count, then each named unit.
 * - Weights and volumes are added in g or ml, unless every amount shares a unit, which is kept.
 * - Kinds are never converted into each other: 600 g and 2 chicken breasts stay "600 g + 2".
 * - Totals are rounded after adding up, never down to nothing.
 * - 1000 g or more is shown as kg, and 1000 ml or more as l.
 */
export function addAmounts(amounts: Amount[]): Amount[] {
  const groups = new Map<string, Amount[]>();
  for (const amount of amounts) {
    const group = groupOf(amount.unit);
    groups.set(group, [...(groups.get(group) ?? []), amount]);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => groupOrder.indexOf(a) - groupOrder.indexOf(b))
    .map(([, group]) => total(group));
}

/** Amounts that can be added together share a group: 'weight', 'volume', 'count', or a named unit. */
function groupOf(unit: Unit | null): string {
  if (unit === null) return 'count';
  const { kind } = UNITS[unit];
  return kind === 'named' ? unit : kind;
}

const groupOrder = [
  'weight',
  'volume',
  'count',
  ...(Object.keys(UNITS) as Unit[]).filter((unit) => UNITS[unit].kind === 'named'),
];

function total(amounts: Amount[]): Amount {
  const { unit } = amounts[0];

  if (amounts.every((amount) => amount.unit === unit)) {
    const quantity = amounts.reduce((total, amount) => total + amount.quantity, 0);
    return inLargerUnit({ quantity: round(quantity, unit), unit });
  }

  // Only weights or volumes get here, in different units, so they're added in g or ml.
  const base = groupOf(unit) === 'weight' ? 'g' : 'ml';
  const quantity = amounts.reduce((total, amount) => total + inBase(amount), 0);
  return inLargerUnit({ quantity: round(quantity, base), unit: base });
}

/** A weight in g, or a volume in ml. */
function inBase({ quantity, unit }: Amount): number {
  const entry = unit === null ? null : UNITS[unit];
  return entry === null || entry.kind === 'named' ? quantity : quantity * entry.size;
}

/**
 * Counts and named units round up to whole numbers, tsp and tbsp to the nearest 0.5, and
 * weights and volumes to the nearest g or ml, even when kept in kg or l. Never down to nothing.
 */
function round(quantity: number, unit: Unit | null): number {
  const entry = unit === null ? null : UNITS[unit];
  if (entry === null || entry.kind === 'named') return Math.ceil(quantity);
  if (unit === 'tsp' || unit === 'tbsp') return Math.max(0.5, Math.round(quantity * 2) / 2);
  return Math.max(1, Math.round(quantity * entry.size)) / entry.size;
}

/** 1000 g or more as kg, and 1000 ml or more as l. */
function inLargerUnit(amount: Amount): Amount {
  if (amount.unit === 'g' && amount.quantity >= 1000) {
    return { quantity: amount.quantity / 1000, unit: 'kg' };
  }
  if (amount.unit === 'ml' && amount.quantity >= 1000) {
    return { quantity: amount.quantity / 1000, unit: 'l' };
  }
  return amount;
}
