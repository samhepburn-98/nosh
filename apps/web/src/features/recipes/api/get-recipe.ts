import { queryOptions, useQuery } from '@tanstack/react-query';

import type { Recipe } from '@nosh/shared/recipes';

import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { QueryConfig } from '@/lib/react-query';

export const getRecipe = (slug: string): Promise<Recipe> =>
  api.get(`/recipes/${encodeURIComponent(slug)}`);

export const getRecipeQueryOptions = (slug: string) =>
  queryOptions({ queryKey: queryKeys.recipe(slug), queryFn: () => getRecipe(slug) });

export const useRecipe = ({
  slug,
  queryConfig,
}: {
  slug: string;
  queryConfig?: QueryConfig<typeof getRecipeQueryOptions>;
}) => useQuery({ ...getRecipeQueryOptions(slug), ...queryConfig });
