import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { Ingredient } from "@/types";

export const ingredientKeys = {
  all: ["ingredients"] as const,
  lists: () => [...ingredientKeys.all, "list"] as const,
  list: (filters: object) => [...ingredientKeys.lists(), filters] as const,
  details: () => [...ingredientKeys.all, "detail"] as const,
  detail: (id: string) => [...ingredientKeys.details(), id] as const,
};

interface IngredientsResponse {
  ingredients: Ingredient[];
}

interface IngredientResponse {
  ingredient: Ingredient;
}

interface CreateIngredientRequest {
  name: string;
  category?: string;
  market_unit: string;
  market_qty?: number;
  price_per_market_unit?: number;
  recipe_unit?: string;
  conversion_factor?: number;
}

interface UpdateIngredientRequest {
  name?: string;
  category?: string;
  market_unit?: string;
  market_qty?: number;
  price_per_market_unit?: number;
  recipe_unit?: string;
  conversion_factor?: number;
  is_active?: boolean;
}

export function useIngredients(params?: {
  category?: string;
  active?: boolean;
}) {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.active) searchParams.set("active", "true");
  const query = searchParams.toString();

  return useQuery({
    queryKey: ingredientKeys.list(params || {}),
    queryFn: () =>
      apiClient
        .get<IngredientsResponse>(`/api/ingredients${query ? `?${query}` : ""}`)
        .then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useIngredient(id: string) {
  return useQuery({
    queryKey: ingredientKeys.detail(id),
    queryFn: () =>
      apiClient
        .get<IngredientResponse>(`/api/ingredients/${id}`)
        .then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIngredientRequest) =>
      apiClient
        .post<IngredientResponse>("/api/ingredients", data)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ingredientKeys.lists() });
    },
  });
}

export function useUpdateIngredient(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateIngredientRequest) =>
      apiClient
        .put<IngredientResponse>(`/api/ingredients/${id}`, data)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ingredientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ingredientKeys.detail(id) });
    },
  });
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/api/ingredients/${id}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ingredientKeys.lists() });
    },
  });
}

