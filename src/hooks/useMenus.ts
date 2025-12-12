import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Menu } from '@/types';

export const menuKeys = {
  all: ['menus'] as const,
  lists: () => [...menuKeys.all, 'list'] as const,
  list: (filters: object) => [...menuKeys.lists(), filters] as const,
  details: () => [...menuKeys.all, 'detail'] as const,
  detail: (id: string) => [...menuKeys.details(), id] as const,
};

interface MenusResponse {
  menus: Menu[];
}

interface MenuResponse {
  menu: Menu & { recipes?: unknown[] };
}

interface CreateMenuRequest {
  name: string;
  category?: string;
  description?: string;
  selling_price: number;
  image_url?: string;
}

interface UpdateMenuRequest {
  name?: string;
  category?: string;
  description?: string;
  selling_price?: number;
  image_url?: string;
  is_active?: boolean;
  sort_order?: number;
  cogs?: number;
  margin_percent?: number;
}

export function useMenus(params?: { category?: string; active?: boolean }) {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.active) searchParams.set('active', 'true');
  const query = searchParams.toString();

  return useQuery({
    queryKey: menuKeys.list(params || {}),
    queryFn: () =>
      apiClient.get<MenusResponse>(`/api/menus${query ? `?${query}` : ''}`).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMenu(id: string) {
  return useQuery({
    queryKey: menuKeys.detail(id),
    queryFn: () => apiClient.get<MenuResponse>(`/api/menus/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMenuRequest) =>
      apiClient.post<MenuResponse>('/api/menus', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });
    },
  });
}

export function useUpdateMenu(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMenuRequest) =>
      apiClient.put<MenuResponse>(`/api/menus/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });
      queryClient.invalidateQueries({ queryKey: menuKeys.detail(id) });
    },
  });
}

export function useDeleteMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/menus/${id}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });
    },
  });
}
