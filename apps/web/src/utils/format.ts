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

/** ["vegetarian", "gluten-free"] → "vegetarian and gluten-free", for the middle of a sentence. */
export function formatDietaryList(dietary: Dietary[]) {
  return listFormat.format(dietary);
}
