/** Every query key. Mutations invalidate by these keys (docs/plan.md §5). */
export const queryKeys = {
  recipes: ['recipes'],
  // Under `recipes`, so refreshing the recipes also refreshes every recipe page.
  recipe: (slug: string) => ['recipes', slug],
} as const;
