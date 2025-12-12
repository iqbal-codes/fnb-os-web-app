// Price History Hooks
// Track ingredient price changes over time
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useBusinessStore } from "@/stores/businessStore";

export interface PriceChange {
  id: string;
  ingredient_id: string;
  ingredient_name: string;
  old_price: number;
  new_price: number;
  change_percent: number;
  recorded_at: string;
}

export interface PriceAlert {
  ingredient_id: string;
  ingredient_name: string;
  old_price: number;
  current_price: number;
  change_percent: number;
  severity: "low" | "medium" | "high";
  message: string;
}

/**
 * Fetch recent price changes
 */
export function usePriceHistory(ingredientId?: string) {
  const { currentBusiness } = useBusinessStore();

  return useQuery({
    queryKey: ["price-history", currentBusiness?.id, ingredientId],
    queryFn: async (): Promise<PriceChange[]> => {
      if (!currentBusiness?.id) return [];

      try {
        const url = ingredientId
          ? `/api/ingredients/${ingredientId}/price-history`
          : `/api/ingredients/price-history?business_id=${currentBusiness.id}`;

        const response = await apiClient.get<{ history: PriceChange[] }>(url);
        return response.data.history || [];
      } catch {
        return [];
      }
    },
    enabled: !!currentBusiness?.id,
  });
}

/**
 * Fetch price alerts for significant changes
 */
export function usePriceAlerts() {
  const { currentBusiness } = useBusinessStore();

  return useQuery({
    queryKey: ["price-alerts", currentBusiness?.id],
    queryFn: async (): Promise<PriceAlert[]> => {
      if (!currentBusiness?.id) return [];

      try {
        const response = await apiClient.get<{ alerts: PriceAlert[] }>(
          `/api/ingredients/price-alerts?business_id=${currentBusiness.id}`
        );
        return response.data.alerts || [];
      } catch {
        // Return mock alerts for development
        return getMockPriceAlerts();
      }
    },
    enabled: !!currentBusiness?.id,
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

/**
 * Record a new price for an ingredient
 */
export function useRecordPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ingredientId,
      price,
      source = "manual",
    }: {
      ingredientId: string;
      price: number;
      source?: string;
    }) => {
      await apiClient.post(`/api/ingredients/${ingredientId}/price`, {
        price,
        source,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-history"] });
      queryClient.invalidateQueries({ queryKey: ["price-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}

// Mock data for development
function getMockPriceAlerts(): PriceAlert[] {
  return [
    {
      ingredient_id: "1",
      ingredient_name: "Kopi Arabica",
      old_price: 150000,
      current_price: 175000,
      change_percent: 16.67,
      severity: "high",
      message: "Harga naik 16.7% - pertimbangkan update harga menu",
    },
    {
      ingredient_id: "2",
      ingredient_name: "Susu Full Cream",
      old_price: 18000,
      current_price: 19500,
      change_percent: 8.33,
      severity: "medium",
      message: "Harga naik 8.3% - monitor margin profit",
    },
  ];
}

/**
 * Calculate severity based on price change
 */
export function getPriceChangeSeverity(
  changePercent: number
): "low" | "medium" | "high" {
  const absChange = Math.abs(changePercent);
  if (absChange >= 15) return "high";
  if (absChange >= 8) return "medium";
  return "low";
}

/**
 * Format price change for display
 */
export function formatPriceChange(changePercent: number): string {
  const sign = changePercent >= 0 ? "+" : "";
  return `${sign}${changePercent.toFixed(1)}%`;
}

