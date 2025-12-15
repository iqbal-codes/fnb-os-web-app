import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export const ONBOARDING_KEYS = {
  all: ['onboarding'] as const,
  state: () => [...ONBOARDING_KEYS.all, 'state'] as const,
};

export function useOnboardingState() {
  return useQuery({
    queryKey: ONBOARDING_KEYS.state(),
    queryFn: api.onboarding.getState,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

export function useUpdateOnboardingState() {
  return useMutation({
    mutationFn: api.onboarding.saveState,
  });
}
