import { queryOptions, useQuery } from '@tanstack/react-query';

import type { RecipeSummary } from '@nosh/shared/recipes';

import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { QueryConfig } from '@/lib/react-query';

export const getRecipes = (): Promise<RecipeSummary[]> => api.get('/recipes');

export const getRecipesQueryOptions = () =>
  queryOptions({ queryKey: queryKeys.recipes, queryFn: getRecipes });

export const useRecipes = ({
  queryConfig,
}: { queryConfig?: QueryConfig<typeof getRecipesQueryOptions> } = {}) =>
  useQuery({ ...getRecipesQueryOptions(), ...queryConfig });
