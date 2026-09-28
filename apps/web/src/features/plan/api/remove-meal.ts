import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { MutationConfig } from '@/lib/react-query';

export const removeMeal = (id: number): Promise<void> => api.delete(`/plan/${id}`);

export const useRemoveMeal = ({
  mutationConfig,
}: { mutationConfig?: MutationConfig<typeof removeMeal> } = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig ?? {};

  return useMutation({
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.plan });
      return onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: removeMeal,
  });
};
