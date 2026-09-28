import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { NewRecipe, Recipe } from '@nosh/shared/recipes';

import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { MutationConfig } from '@/lib/react-query';

export const createRecipe = (recipe: NewRecipe): Promise<Recipe> => api.post('/recipes', recipe);

export const useCreateRecipe = ({
  mutationConfig,
}: { mutationConfig?: MutationConfig<typeof createRecipe> } = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig ?? {};

  return useMutation({
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.recipes });
      // It may have added new ingredients.
      void queryClient.invalidateQueries({ queryKey: queryKeys.ingredients });
      return onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createRecipe,
  });
};
