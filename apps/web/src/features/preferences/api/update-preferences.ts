import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Preferences } from '@nosh/shared/preferences';

import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { MutationConfig } from '@/lib/react-query';

export const updatePreferences = (preferences: Preferences): Promise<Preferences> =>
  api.put('/preferences', preferences);

/** Shows the new preferences straight away, and puts the saved ones back if saving fails. */
export const useUpdatePreferences = ({
  mutationConfig,
}: { mutationConfig?: MutationConfig<typeof updatePreferences> } = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restConfig } = mutationConfig ?? {};

  return useMutation({
    ...restConfig,
    onMutate: async (preferences) => {
      // So a refresh already on its way can't overwrite what was just ticked.
      await queryClient.cancelQueries({ queryKey: queryKeys.preferences });
      queryClient.setQueryData(queryKeys.preferences, preferences);
    },
    onSuccess: (...args) => {
      // Every list of recipes is split by the preferences.
      void queryClient.invalidateQueries({ queryKey: queryKeys.recipes });
      return onSuccess?.(...args);
    },
    onError: (...args) => {
      // Back to what's saved.
      void queryClient.invalidateQueries({ queryKey: queryKeys.preferences });
      return onError?.(...args);
    },
    mutationFn: updatePreferences,
  });
};
