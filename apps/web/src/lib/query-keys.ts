/** Every query key. Mutations invalidate by these keys (docs/plan.md §5). */
export const queryKeys = {
  recipes: ['recipes'],
  // Under `recipes`, so refreshing the recipes also refreshes every recipe page.
  recipe: (slug: string) => ['recipes', slug],
  plan: ['plan'],
  shoppingList: ['shopping-list'],
  preferences: ['preferences'],
  ingredients: ['ingredients'],
  kitchen: ['kitchen'],
  kitchenMatches: ['kitchen-matches'],
} as const;
