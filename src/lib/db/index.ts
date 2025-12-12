import Dexie, { type EntityTable } from "dexie";

// Types for offline storage
interface OfflineOrder {
  id: string;
  business_id: string;
  order_number: string;
  items: {
    menu_id: string;
    menu_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_type: string;
  created_at: string;
  synced: boolean;
}

interface OfflineInventoryLog {
  id: string;
  inventory_id: string;
  ingredient_id: string;
  change_type: "purchase" | "usage" | "adjustment" | "waste";
  quantity: number;
  reason?: string;
  created_at: string;
  synced: boolean;
}

interface CachedMenu {
  id: string;
  business_id: string;
  name: string;
  category: string;
  selling_price: number;
  is_active: boolean;
  image_url?: string;
  updated_at: string;
}

interface CachedIngredient {
  id: string;
  business_id: string;
  name: string;
  category: string;
  price_per_base_unit: number;
  base_unit: string;
  current_stock?: number;
  updated_at: string;
}

interface SyncMetadata {
  id: string;
  table_name: string;
  last_synced_at: string;
}

// Dexie database class
class SajiPlanDB extends Dexie {
  offlineOrders!: EntityTable<OfflineOrder, "id">;
  offlineInventoryLogs!: EntityTable<OfflineInventoryLog, "id">;
  cachedMenus!: EntityTable<CachedMenu, "id">;
  cachedIngredients!: EntityTable<CachedIngredient, "id">;
  syncMetadata!: EntityTable<SyncMetadata, "id">;

  constructor() {
    super("SajiPlanDB");

    this.version(1).stores({
      offlineOrders: "id, business_id, created_at, synced",
      offlineInventoryLogs:
        "id, inventory_id, ingredient_id, created_at, synced",
      cachedMenus: "id, business_id, category, is_active",
      cachedIngredients: "id, business_id, category",
      syncMetadata: "id, table_name",
    });
  }
}

// Singleton instance
export const db = new SajiPlanDB();

// Helper functions for offline operations
export const offlineDB = {
  // Orders
  async addOfflineOrder(order: Omit<OfflineOrder, "synced">) {
    return db.offlineOrders.add({ ...order, synced: false });
  },

  async getUnsyncedOrders() {
    return db.offlineOrders.where("synced").equals(0).toArray();
  },

  async markOrderSynced(id: string) {
    return db.offlineOrders.update(id, { synced: true });
  },

  async clearSyncedOrders() {
    return db.offlineOrders.where("synced").equals(1).delete();
  },

  // Inventory Logs
  async addOfflineInventoryLog(log: Omit<OfflineInventoryLog, "synced">) {
    return db.offlineInventoryLogs.add({ ...log, synced: false });
  },

  async getUnsyncedInventoryLogs() {
    return db.offlineInventoryLogs.where("synced").equals(0).toArray();
  },

  async markInventoryLogSynced(id: string) {
    return db.offlineInventoryLogs.update(id, { synced: true });
  },

  // Menu Cache
  async cacheMenus(menus: CachedMenu[]) {
    return db.cachedMenus.bulkPut(menus);
  },

  async getCachedMenus(businessId: string) {
    return db.cachedMenus
      .where("business_id")
      .equals(businessId)
      .and((menu) => menu.is_active)
      .toArray();
  },

  async getCachedMenusByCategory(businessId: string, category: string) {
    return db.cachedMenus
      .where(["business_id", "category"])
      .equals([businessId, category])
      .toArray();
  },

  // Ingredient Cache
  async cacheIngredients(ingredients: CachedIngredient[]) {
    return db.cachedIngredients.bulkPut(ingredients);
  },

  async getCachedIngredients(businessId: string) {
    return db.cachedIngredients
      .where("business_id")
      .equals(businessId)
      .toArray();
  },

  // Sync Metadata
  async updateSyncTime(tableName: string) {
    return db.syncMetadata.put({
      id: tableName,
      table_name: tableName,
      last_synced_at: new Date().toISOString(),
    });
  },

  async getLastSyncTime(tableName: string) {
    const meta = await db.syncMetadata.get(tableName);
    return meta?.last_synced_at;
  },

  // Clear all data (for logout)
  async clearAll() {
    await db.offlineOrders.clear();
    await db.offlineInventoryLogs.clear();
    await db.cachedMenus.clear();
    await db.cachedIngredients.clear();
    await db.syncMetadata.clear();
  },
};

export type { OfflineOrder, OfflineInventoryLog, CachedMenu, CachedIngredient };

