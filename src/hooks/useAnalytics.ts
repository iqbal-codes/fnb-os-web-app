// Analytics Hooks for Reports & Dashboard
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useBusinessStore } from "@/stores/businessStore";

// ============ Types ============

export interface SalesSummary {
  today: number;
  todayOrders: number;
  week: number;
  weekOrders: number;
  month: number;
  monthOrders: number;
  avgOrderValue: number;
}

export interface DailySales {
  date: string;
  revenue: number;
  orders: number;
  profit: number;
}

export interface MenuPerformance {
  menuId: string;
  menuName: string;
  category: string;
  quantitySold: number;
  revenue: number;
  cogs: number;
  profit: number;
  margin: number;
}

export interface CostBreakdown {
  totalRevenue: number;
  totalCogs: number;
  totalOpex: number;
  grossProfit: number;
  netProfit: number;
  cogsPercent: number;
  opexPercent: number;
  profitPercent: number;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  period?: "today" | "week" | "month" | "year" | "custom";
}

// ============ Hooks ============

/**
 * Fetch sales summary (today, week, month)
 */
export function useSalesSummary() {
  const { currentBusiness } = useBusinessStore();

  return useQuery({
    queryKey: ["analytics", "sales-summary", currentBusiness?.id],
    queryFn: async (): Promise<SalesSummary> => {
      if (!currentBusiness?.id) {
        return {
          today: 0,
          todayOrders: 0,
          week: 0,
          weekOrders: 0,
          month: 0,
          monthOrders: 0,
          avgOrderValue: 0,
        };
      }

      try {
        const response = await apiClient.get<{ summary: SalesSummary }>(
          `/api/analytics/summary?business_id=${currentBusiness.id}`
        );
        return response.data.summary;
      } catch {
        // Return mock data for now
        return {
          today: 0,
          todayOrders: 0,
          week: 0,
          weekOrders: 0,
          month: 0,
          monthOrders: 0,
          avgOrderValue: 0,
        };
      }
    },
    enabled: !!currentBusiness?.id,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Fetch daily sales trend
 */
export function useSalesTrend(filters?: AnalyticsFilters) {
  const { currentBusiness } = useBusinessStore();
  const period = filters?.period || "month";

  return useQuery({
    queryKey: ["analytics", "sales-trend", currentBusiness?.id, period],
    queryFn: async (): Promise<DailySales[]> => {
      if (!currentBusiness?.id) return [];

      try {
        const response = await apiClient.get<{ data: DailySales[] }>(
          `/api/analytics/trend?business_id=${currentBusiness.id}&period=${period}`
        );
        return response.data.data;
      } catch {
        // Return empty for now
        return [];
      }
    },
    enabled: !!currentBusiness?.id,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Fetch menu performance ranking
 */
export function useMenuPerformance(filters?: AnalyticsFilters) {
  const { currentBusiness } = useBusinessStore();
  const period = filters?.period || "month";

  return useQuery({
    queryKey: ["analytics", "menu-performance", currentBusiness?.id, period],
    queryFn: async (): Promise<MenuPerformance[]> => {
      if (!currentBusiness?.id) return [];

      try {
        const response = await apiClient.get<{ data: MenuPerformance[] }>(
          `/api/analytics/menu-performance?business_id=${currentBusiness.id}&period=${period}`
        );
        return response.data.data;
      } catch {
        // Return empty for now
        return [];
      }
    },
    enabled: !!currentBusiness?.id,
    staleTime: 60000,
  });
}

/**
 * Fetch cost breakdown (COGS, OPEX, Profit)
 */
export function useCostBreakdown(filters?: AnalyticsFilters) {
  const { currentBusiness } = useBusinessStore();
  const period = filters?.period || "month";

  return useQuery({
    queryKey: ["analytics", "cost-breakdown", currentBusiness?.id, period],
    queryFn: async (): Promise<CostBreakdown> => {
      if (!currentBusiness?.id) {
        return {
          totalRevenue: 0,
          totalCogs: 0,
          totalOpex: 0,
          grossProfit: 0,
          netProfit: 0,
          cogsPercent: 0,
          opexPercent: 0,
          profitPercent: 0,
        };
      }

      try {
        const response = await apiClient.get<{ breakdown: CostBreakdown }>(
          `/api/analytics/costs?business_id=${currentBusiness.id}&period=${period}`
        );
        return response.data.breakdown;
      } catch {
        return {
          totalRevenue: 0,
          totalCogs: 0,
          totalOpex: 0,
          grossProfit: 0,
          netProfit: 0,
          cogsPercent: 0,
          opexPercent: 0,
          profitPercent: 0,
        };
      }
    },
    enabled: !!currentBusiness?.id,
    staleTime: 60000,
  });
}

// ============ Utility Functions ============

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format compact number (e.g., 1.2M, 500K)
 */
export function formatCompact(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    notation: "compact",
    compactDisplay: "short",
  }).format(amount);
}

/**
 * Calculate percentage change
 */
export function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get date range for period
 */
export function getDateRange(period: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "week":
      start.setDate(start.getDate() - 7);
      break;
    case "month":
      start.setMonth(start.getMonth() - 1);
      break;
    case "year":
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setMonth(start.getMonth() - 1);
  }

  return { start, end };
}

