export const paths = {
  plan: '/',
  recipes: '/recipes',
  recipe: (slug: string) => `/recipes/${slug}`,
  shoppingList: '/shopping-list',
  preferences: '/preferences',
} as const;
