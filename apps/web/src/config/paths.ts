export const paths = {
  plan: '/',
  recipes: '/recipes',
  newRecipe: '/recipes/new',
  recipe: (slug: string) => `/recipes/${slug}`,
  shoppingList: '/shopping-list',
  preferences: '/preferences',
} as const;
