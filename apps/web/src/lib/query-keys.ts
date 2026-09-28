/** Every query key. Mutations invalidate by these keys (docs/plan.md §5). */
export const queryKeys = {
  recipes: ['recipes'],
} as const;
