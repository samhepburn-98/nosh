import { queryOptions, useQuery } from '@tanstack/react-query';

import type { RecipeGroups } from '@nosh/shared/recipes';

import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { QueryConfig } from '@/lib/react-query';

/** Every recipe, split into those that fit the saved preferences and the others. */
export const getRecipes = (): Promise<RecipeGroups> => api.get('/recipes');

export const getRecipesQueryOptions = () =>
  queryOptions({ queryKey: queryKeys.recipes, queryFn: getRecipes });

export const useRecipes = ({
  queryConfig,
}: { queryConfig?: QueryConfig<typeof getRecipesQueryOptions> } = {}) =>
  useQuery({ ...getRecipesQueryOptions(), ...queryConfig });
