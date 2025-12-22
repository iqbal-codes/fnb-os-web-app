// Offline Order Queue Hook
// Stores orders locally when offline and syncs when back online
import { useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useBusinessStore } from '@/stores/businessStore';
import { toast } from 'sonner';

interface OfflineOrder {
  id: string;
  business_id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  payment_type: string;
  created_at: string;
  synced: boolean;
}

interface OrderItem {
  menu_id: string;
  menu_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

const STORAGE_KEY = 'efenbi_offline_orders';

/**
 * Get pending orders from localStorage
 */
export function getPendingOrders(): OfflineOrder[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save orders to localStorage
 */
function saveOrders(orders: OfflineOrder[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

/**
 * Add order to offline queue
 */
export function addOfflineOrder(order: Omit<OfflineOrder, 'id' | 'synced' | 'created_at'>): string {
  const id = `offline_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const newOrder: OfflineOrder = {
    ...order,
    id,
    synced: false,
    created_at: new Date().toISOString(),
  };

  const orders = getPendingOrders();
  orders.push(newOrder);
  saveOrders(orders);

  return id;
}

/**
 * Mark order as synced
 */
function markOrderSynced(id: string) {
  const orders = getPendingOrders();
  const updated = orders.map((o) => (o.id === id ? { ...o, synced: true } : o));
  saveOrders(updated);
}

/**
 * Remove synced orders
 */
function clearSyncedOrders() {
  const orders = getPendingOrders();
  const pending = orders.filter((o) => !o.synced);
  saveOrders(pending);
}

/**
 * Hook for syncing offline orders when online
 */
export function useOfflineOrderSync() {
  const { currentBusiness } = useBusinessStore();
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: async (order: OfflineOrder) => {
      const response = await apiClient.post('/api/sales', {
        business_id: order.business_id,
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        payment_type: order.payment_type,
        offline_id: order.id,
      });
      return response.data;
    },
    onSuccess: (_, order) => {
      markOrderSynced(order.id);
    },
  });

  const syncPendingOrders = useCallback(async () => {
    const pending = getPendingOrders().filter((o) => !o.synced);

    if (pending.length === 0) return;

    let syncedCount = 0;

    for (const order of pending) {
      try {
        await syncMutation.mutateAsync(order);
        syncedCount++;
      } catch (error) {
        console.error('Failed to sync order:', order.id, error);
      }
    }

    if (syncedCount > 0) {
      clearSyncedOrders();
      queryClient.invalidateQueries({ queryKey: ['sales-history'] });
      toast.success(`${syncedCount} pesanan offline berhasil disinkronkan`);
    }
  }, [syncMutation, queryClient]);

  // Sync when online
  useEffect(() => {
    const handleOnline = () => {
      syncPendingOrders();
    };

    window.addEventListener('online', handleOnline);

    // Also try to sync on mount if online
    if (navigator.onLine) {
      syncPendingOrders();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncPendingOrders]);

  return {
    pendingCount: getPendingOrders().filter((o) => !o.synced).length,
    syncPendingOrders,
    isSyncing: syncMutation.isPending,
  };
}

/**
 * Get order number for offline order
 */
export function getOfflineOrderNumber(id: string): string {
  return `OFF-${id.slice(-8).toUpperCase()}`;
}
