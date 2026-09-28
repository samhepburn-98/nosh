import { dayName } from '@nosh/shared/days';
import type { Dietary } from '@nosh/shared/dietary';
import type { MealType } from '@nosh/shared/meal-types';

function capitalise(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "gluten-free" → "Gluten-free". */
export function formatDietary(dietary: Dietary) {
  return capitalise(dietary);
}

/** The client's other tags in plain words: "batch-cook" → "Batch cook". */
export function formatTag(tag: string) {
  return capitalise(tag.replaceAll('-', ' '));
}

/** ["lunch", "dinner"] → "Lunch or dinner". */
export function formatMealTypes(mealTypes: MealType[]) {
  return capitalise(mealTypes.join(' or '));
}

const listFormat = new Intl.ListFormat('en-GB', { type: 'conjunction' });

/** [2, 5] → "Tuesday and Friday"; [1, 3, 5] → "Monday, Wednesday and Friday". */
export function formatDays(days: number[]) {
  return listFormat.format(days.map(dayName));
}

// en-US, for its serial comma: "eggs, bread, and salt and pepper" stays clear when a name has "and".
const serialListFormat = new Intl.ListFormat('en-US', { type: 'conjunction' });

/** ["eggs", "bread", "salt and pepper"] → "eggs, bread, and salt and pepper". */
export function formatSerialList(items: string[]) {
  return serialListFormat.format(items);
}
