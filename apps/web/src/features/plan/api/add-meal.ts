import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { AddMealInput, PlannedMeal } from '@nosh/shared/plan';

import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { MutationConfig } from '@/lib/react-query';

export const addMeal = (input: AddMealInput): Promise<PlannedMeal> => api.post('/plan', input);

export const useAddMeal = ({
  mutationConfig,
}: { mutationConfig?: MutationConfig<typeof addMeal> } = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig ?? {};

  return useMutation({
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.plan });
      // Recipe pages say which days they're planned for.
      void queryClient.invalidateQueries({ queryKey: queryKeys.recipes });
      return onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: addMeal,
  });
};
