/** The week always has seven days, 1 (Monday) to 7 (Sunday), each with its meals in order. */
export function groupByDay<Meal extends { day: number }>(
  meals: Meal[],
): { day: number; meals: Meal[] }[] {
  return Array.from({ length: 7 }, (_, index) => ({
    day: index + 1,
    meals: meals.filter((meal) => meal.day === index + 1),
  }));
}
