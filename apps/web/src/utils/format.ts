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
