import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
};

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => api.dashboard.getStats(),
    staleTime: 60 * 1000, // 1 minute - stats should refresh more often
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}
