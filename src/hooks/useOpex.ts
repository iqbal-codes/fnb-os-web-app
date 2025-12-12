// OPEX (Operational Expenses) Hooks
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useBusinessStore } from "@/stores/businessStore";

export interface OpexItem {
  id: string;
  business_id: string;
  name: string;
  category: OpexCategory;
  amount: number;
  frequency: "daily" | "weekly" | "monthly" | "yearly" | "one-time";
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type OpexCategory =
  | "rent" // Sewa tempat
  | "utilities" // Listrik, air, gas
  | "salary" // Gaji karyawan
  | "marketing" // Pemasaran
  | "supplies" // Perlengkapan
  | "maintenance" // Perawatan
  | "insurance" // Asuransi
  | "license" // Izin & lisensi
  | "other"; // Lainnya

export interface OpexFormData {
  name: string;
  category: OpexCategory;
  amount: number;
  frequency: "daily" | "weekly" | "monthly" | "yearly" | "one-time";
  is_active?: boolean;
  notes?: string;
}

interface OpexSummary {
  totalMonthly: number;
  byCategory: Record<OpexCategory, number>;
  items: OpexItem[];
}

// Category labels
export const OPEX_CATEGORIES: { value: OpexCategory; label: string }[] = [
  { value: "rent", label: "Sewa Tempat" },
  { value: "utilities", label: "Utilitas (Listrik/Air/Gas)" },
  { value: "salary", label: "Gaji Karyawan" },
  { value: "marketing", label: "Pemasaran" },
  { value: "supplies", label: "Perlengkapan" },
  { value: "maintenance", label: "Perawatan" },
  { value: "insurance", label: "Asuransi" },
  { value: "license", label: "Izin & Lisensi" },
  { value: "other", label: "Lainnya" },
];

// Frequency labels
export const OPEX_FREQUENCIES = [
  { value: "daily", label: "Harian" },
  { value: "weekly", label: "Mingguan" },
  { value: "monthly", label: "Bulanan" },
  { value: "yearly", label: "Tahunan" },
  { value: "one-time", label: "Sekali" },
];

/**
 * Fetch all OPEX items
 */
export function useOpex() {
  const { currentBusiness } = useBusinessStore();

  return useQuery({
    queryKey: ["opex", currentBusiness?.id],
    queryFn: async (): Promise<OpexSummary> => {
      if (!currentBusiness?.id) {
        return {
          totalMonthly: 0,
          byCategory: {} as Record<OpexCategory, number>,
          items: [],
        };
      }

      try {
        const response = await apiClient.get<{ data: OpexItem[] }>(
          `/api/opex?business_id=${currentBusiness.id}`
        );
        const items = response.data.data;
        return calculateOpexSummary(items);
      } catch {
        // Return mock data for development
        return getMockOpexSummary();
      }
    },
    enabled: !!currentBusiness?.id,
  });
}

/**
 * Create a new OPEX item
 */
export function useCreateOpex() {
  const queryClient = useQueryClient();
  const { currentBusiness } = useBusinessStore();

  return useMutation({
    mutationFn: async (data: OpexFormData) => {
      const response = await apiClient.post<{ opex: OpexItem }>("/api/opex", {
        ...data,
        business_id: currentBusiness?.id,
        is_active: data.is_active ?? true,
      });
      return response.data.opex;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opex"] });
      queryClient.invalidateQueries({ queryKey: ["business-health"] });
    },
  });
}

/**
 * Update an OPEX item
 */
export function useUpdateOpex(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<OpexFormData>) => {
      const response = await apiClient.patch<{ opex: OpexItem }>(
        `/api/opex/${id}`,
        data
      );
      return response.data.opex;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opex"] });
      queryClient.invalidateQueries({ queryKey: ["business-health"] });
    },
  });
}

/**
 * Delete an OPEX item
 */
export function useDeleteOpex() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/opex/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opex"] });
      queryClient.invalidateQueries({ queryKey: ["business-health"] });
    },
  });
}

// Calculate monthly equivalent
export function toMonthlyAmount(amount: number, frequency: string): number {
  switch (frequency) {
    case "daily":
      return amount * 30;
    case "weekly":
      return amount * 4;
    case "monthly":
      return amount;
    case "yearly":
      return amount / 12;
    case "one-time":
      return amount / 12; // Amortize over a year
    default:
      return amount;
  }
}

// Calculate summary from items
function calculateOpexSummary(items: OpexItem[]): OpexSummary {
  const activeItems = items.filter((item) => item.is_active);
  const byCategory: Record<OpexCategory, number> = {} as Record<
    OpexCategory,
    number
  >;
  let totalMonthly = 0;

  for (const item of activeItems) {
    const monthlyAmount = toMonthlyAmount(item.amount, item.frequency);
    totalMonthly += monthlyAmount;
    byCategory[item.category] =
      (byCategory[item.category] || 0) + monthlyAmount;
  }

  return { totalMonthly, byCategory, items };
}

// Mock data for development
function getMockOpexSummary(): OpexSummary {
  const mockItems: OpexItem[] = [
    {
      id: "1",
      business_id: "mock",
      name: "Sewa Ruko",
      category: "rent",
      amount: 5000000,
      frequency: "monthly",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      business_id: "mock",
      name: "Listrik",
      category: "utilities",
      amount: 800000,
      frequency: "monthly",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "3",
      business_id: "mock",
      name: "Gaji Barista",
      category: "salary",
      amount: 3500000,
      frequency: "monthly",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  return calculateOpexSummary(mockItems);
}

/**
 * Get category label
 */
export function getCategoryLabel(category: OpexCategory): string {
  return OPEX_CATEGORIES.find((c) => c.value === category)?.label || category;
}

/**
 * Get frequency label
 */
export function getFrequencyLabel(frequency: string): string {
  return (
    OPEX_FREQUENCIES.find((f) => f.value === frequency)?.label || frequency
  );
}

/**
 * Format currency
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

