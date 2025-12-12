"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

// ============ Query Keys ============
export const inventoryKeys = {
  all: ["inventory"] as const,
  list: () => [...inventoryKeys.all, "list"] as const,
  lowStock: () => [...inventoryKeys.all, "low-stock"] as const,
};

// ============ Types ============
export interface InventoryWithIngredient {
  id: string;
  business_id: string;
  ingredient_id: string;
  current_stock: number;
  unit: string;
  min_stock: number;
  last_updated: string;
  ingredient?: {
    id: string;
    name: string;
    market_unit: string;
  };
}

export interface StockAdjustment {
  inventory_id: string;
  change_type: "purchase" | "usage" | "adjustment" | "waste";
  quantity: number;
  reason?: string;
}

interface InventoryResponse {
  inventory: InventoryWithIngredient[];
}

// ============ Hooks ============

/**
 * Fetch all inventory items with ingredient details
 */
export function useInventory() {
  return useQuery({
    queryKey: inventoryKeys.list(),
    queryFn: async (): Promise<InventoryWithIngredient[]> => {
      try {
        const { data } = await apiClient.get<InventoryResponse>(
          "/api/inventory"
        );
        return data.inventory || [];
      } catch {
        // API might not exist yet, return empty array
        return [];
      }
    },
  });
}

/**
 * Fetch low stock items (current_stock < min_stock)
 */
export function useLowStockItems() {
  const { data: inventory, isLoading } = useInventory();

  const lowStockItems =
    inventory?.filter((item) => item.current_stock < item.min_stock) || [];

  const criticalItems = lowStockItems.filter(
    (item) => item.current_stock <= item.min_stock * 0.5
  );

  return {
    lowStockItems,
    criticalItems,
    hasLowStock: lowStockItems.length > 0,
    isLoading,
  };
}

/**
 * Update stock via API
 */
export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      inventoryId,
      newStock,
    }: {
      inventoryId: string;
      newStock: number;
    }) => {
      await apiClient.patch(`/api/inventory/${inventoryId}`, {
        current_stock: newStock,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

/**
 * Add inventory log entry (stock adjustment with tracking)
 */
export function useAddInventoryLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      adjustment: StockAdjustment
    ): Promise<{ newStock: number }> => {
      const { data } = await apiClient.post<{ newStock: number }>(
        "/api/inventory/adjust",
        adjustment
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

/**
 * Calculate restock recommendation
 */
export function calculateRestockAmount(
  currentStock: number,
  minStock: number,
  avgDailyUsage: number = 0
): number {
  // Target: 2 weeks of stock above min_stock
  const targetStock = minStock + avgDailyUsage * 14;
  const restockAmount = Math.max(0, targetStock - currentStock);
  return Math.ceil(restockAmount);
}

/**
 * Get stock status
 */
export function getStockStatus(
  currentStock: number,
  minStock: number
): "ok" | "low" | "critical" {
  if (currentStock <= minStock * 0.5) return "critical";
  if (currentStock < minStock) return "low";
  return "ok";
}

