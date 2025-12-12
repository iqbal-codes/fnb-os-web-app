import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  api,
  type CreateBusinessRequest,
  type UpdateBusinessRequest,
} from "@/lib/api/client";

export const businessKeys = {
  all: ["business"] as const,
  current: () => [...businessKeys.all, "current"] as const,
};

export function useBusiness() {
  return useQuery({
    queryKey: businessKeys.current(),
    queryFn: () => api.business.get(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBusinessRequest) => api.business.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.all });
    },
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBusinessRequest) => api.business.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.all });
    },
  });
}

