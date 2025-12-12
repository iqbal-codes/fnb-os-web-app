// Sales History Hooks
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useBusinessStore } from "@/stores/businessStore";

export interface Transaction {
  id: string;
  business_id: string;
  order_number: string;
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  total: number;
  payment_type: "cash" | "qris" | "transfer" | "card";
  status: "completed" | "cancelled" | "refunded";
  notes?: string;
  created_at: string;
  completed_at?: string;
}

export interface TransactionItem {
  menu_id: string;
  menu_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface SalesHistoryFilters {
  startDate?: string;
  endDate?: string;
  paymentType?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface SalesHistoryResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Fetch sales history with filters and pagination
 */
export function useSalesHistory(filters: SalesHistoryFilters = {}) {
  const { currentBusiness } = useBusinessStore();
  const {
    page = 1,
    limit = 20,
    startDate,
    endDate,
    paymentType,
    status,
  } = filters;

  return useQuery({
    queryKey: ["sales-history", currentBusiness?.id, filters],
    queryFn: async (): Promise<SalesHistoryResponse> => {
      if (!currentBusiness?.id) {
        return { transactions: [], total: 0, page: 1, totalPages: 0 };
      }

      try {
        const params = new URLSearchParams({
          business_id: currentBusiness.id,
          page: page.toString(),
          limit: limit.toString(),
        });

        if (startDate) params.append("start_date", startDate);
        if (endDate) params.append("end_date", endDate);
        if (paymentType) params.append("payment_type", paymentType);
        if (status) params.append("status", status);

        const response = await apiClient.get<SalesHistoryResponse>(
          `/api/sales?${params.toString()}`
        );
        return response.data;
      } catch {
        // Return mock data for development
        return getMockSalesHistory(page, limit);
      }
    },
    enabled: !!currentBusiness?.id,
    staleTime: 30000,
  });
}

/**
 * Get a single transaction detail
 */
export function useTransaction(transactionId: string) {
  return useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: async (): Promise<Transaction | null> => {
      try {
        const response = await apiClient.get<{ transaction: Transaction }>(
          `/api/sales/${transactionId}`
        );
        return response.data.transaction;
      } catch {
        return null;
      }
    },
    enabled: !!transactionId,
  });
}

/**
 * Create a new transaction (from POS)
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { currentBusiness } = useBusinessStore();

  return useMutation({
    mutationFn: async (
      data: Omit<
        Transaction,
        "id" | "created_at" | "business_id" | "order_number"
      >
    ) => {
      const response = await apiClient.post<{ transaction: Transaction }>(
        "/api/sales",
        {
          ...data,
          business_id: currentBusiness?.id,
        }
      );
      return response.data.transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-history"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

/**
 * Cancel/refund a transaction
 */
export function useCancelTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await apiClient.patch<{ transaction: Transaction }>(
        `/api/sales/${id}/cancel`,
        { reason }
      );
      return response.data.transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-history"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

// Mock data for development
function getMockSalesHistory(
  page: number,
  limit: number
): SalesHistoryResponse {
  const mockTransactions: Transaction[] = [
    {
      id: "1",
      business_id: "mock",
      order_number: "ORD-001",
      items: [
        {
          menu_id: "1",
          menu_name: "Es Kopi Susu",
          quantity: 2,
          unit_price: 25000,
          subtotal: 50000,
        },
        {
          menu_id: "2",
          menu_name: "Croissant",
          quantity: 1,
          unit_price: 18000,
          subtotal: 18000,
        },
      ],
      subtotal: 68000,
      tax: 0,
      total: 68000,
      payment_type: "qris",
      status: "completed",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      completed_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "2",
      business_id: "mock",
      order_number: "ORD-002",
      items: [
        {
          menu_id: "1",
          menu_name: "Americano",
          quantity: 1,
          unit_price: 22000,
          subtotal: 22000,
        },
      ],
      subtotal: 22000,
      tax: 0,
      total: 22000,
      payment_type: "cash",
      status: "completed",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      completed_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  return {
    transactions: mockTransactions.slice((page - 1) * limit, page * limit),
    total: mockTransactions.length,
    page,
    totalPages: Math.ceil(mockTransactions.length / limit),
  };
}

/**
 * Format transaction date
 */
export function formatTransactionDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get payment type label
 */
export function getPaymentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    cash: "Tunai",
    qris: "QRIS",
    transfer: "Transfer",
    card: "Kartu",
  };
  return labels[type] || type;
}

/**
 * Get status badge variant
 */
export function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" {
  switch (status) {
    case "completed":
      return "default";
    case "cancelled":
    case "refunded":
      return "destructive";
    default:
      return "secondary";
  }
}

