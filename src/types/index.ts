// Core TypeScript types for SajiPlan F&B Business OS

// ============ Business & User Types ============
export interface Business {
  id: string;
  user_id: string;
  name: string;
  type: BusinessType;
  description?: string;
  location?: string;
  currency: string;
  target_margin: number; // e.g., 0.30 for 30%
  is_planning_mode: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export type BusinessType =
  | 'coffee_shop'
  | 'restaurant'
  | 'food_stall'
  | 'bakery'
  | 'beverage_stall'
  | 'dessert_shop'
  | 'catering'
  | 'cloud_kitchen'
  | 'other';

// ============ Menu & Recipe Types ============
export interface Menu {
  id: string;
  business_id: string;
  name: string;
  category: string;
  description?: string;
  image_url?: string;
  selling_price: number;
  cogs?: number; // Computed COGS from recipe ingredients
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  menu_id: string;
  yield_qty: number;
  yield_unit: string;
  notes?: string;
  created_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  ingredient?: Ingredient;
}

// ============ Ingredient Types ============
export interface Ingredient {
  id: string;
  business_id: string;
  name: string;
  category: IngredientCategory;
  market_unit: string; // e.g., "kg", "liter", "pack"
  market_qty: number; // e.g., 1 for 1kg
  price_per_market_unit: number;
  price_per_base_unit: number; // price per gram/ml/pcs
  base_unit: string; // e.g., "gram", "ml", "pcs"
  supplier?: string;
  last_price_update: string;
  created_at: string;
}

export type IngredientCategory =
  | 'protein'
  | 'vegetable'
  | 'dairy'
  | 'dry_goods'
  | 'beverage'
  | 'spices'
  | 'packaging'
  | 'other';

export interface IngredientPriceHistory {
  id: string;
  ingredient_id: string;
  price: number;
  recorded_at: string;
}

// ============ OPEX Types ============
export interface OpexCategory {
  id: string;
  business_id: string;
  name: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  is_variable: boolean;
  notes?: string;
}

// ============ Order/POS Types ============
export interface Order {
  id: string;
  business_id: string;
  order_number: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_type: PaymentType;
  payment_status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  synced_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_id: string;
  menu_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
}

export type PaymentType = 'cash' | 'qris' | 'transfer' | 'ewallet' | 'card';

// ============ Inventory Types ============
export interface Inventory {
  id: string;
  business_id: string;
  ingredient_id: string;
  current_stock: number;
  unit: string;
  min_stock: number;
  last_updated: string;
  ingredient?: Ingredient;
}

export interface InventoryLog {
  id: string;
  inventory_id: string;
  change_type: 'purchase' | 'usage' | 'adjustment' | 'waste';
  quantity: number;
  reason?: string;
  created_at: string;
}

// ============ Analytics Types ============
export interface DailySummary {
  id: string;
  business_id: string;
  date: string;
  total_sales: number;
  total_orders: number;
  total_items_sold: number;
  cogs: number;
  gross_profit: number;
  avg_order_value: number;
}

export interface MenuPerformance {
  menu_id: string;
  menu_name: string;
  total_sold: number;
  total_revenue: number;
  total_cogs: number;
  profit: number;
  margin: number;
}

// ============ Business Planning Types ============
export interface StartupCapital {
  id: string;
  business_id: string;
  category: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  is_one_time: boolean;
}

export interface BepAnalysis {
  fixed_costs_monthly: number;
  variable_cost_per_unit: number;
  avg_selling_price: number;
  contribution_margin: number;
  bep_units_daily: number;
  bep_units_monthly: number;
  bep_revenue_monthly: number;
}

export interface RoiAnalysis {
  total_investment: number;
  monthly_profit: number;
  payback_months: number;
  annual_roi: number;
}

// ============ AI Types ============
export interface BusinessHealthScore {
  overall_score: number; // 0-100
  revenue_health: number;
  cost_efficiency: number;
  inventory_health: number;
  pricing_health: number;
  generated_at: string;
}

export interface AIRecommendation {
  id: string;
  type: RecommendationType;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  action_items: string[];
  potential_impact?: string;
  created_at: string;
}

export type RecommendationType =
  | 'pricing'
  | 'cost_reduction'
  | 'inventory'
  | 'menu_optimization'
  | 'opex'
  | 'sales';

// ============ Offline Sync Types ============
export interface OfflineQueueItem {
  id: string;
  type: 'order' | 'inventory_log' | 'menu_update';
  data: Record<string, unknown>;
  created_at: string;
  retry_count: number;
}

// ============ Shopping List Types ============
export interface ShoppingListItem {
  ingredient_id: string;
  ingredient_name: string;
  required_qty: number;
  current_stock: number;
  to_purchase: number;
  unit: string;
  estimated_cost: number;
}

// ============ Form Types ============
export interface MenuFormData {
  name: string;
  category: string;
  description?: string;
  selling_price: number;
  is_active: boolean;
  recipe: {
    yield_qty: number;
    yield_unit: string;
    ingredients: {
      ingredient_id: string;
      quantity: number;
      unit: string;
    }[];
  };
}

export interface IngredientFormData {
  name: string;
  category: IngredientCategory;
  market_unit: string;
  market_qty: number;
  price_per_market_unit: number;
  base_unit: string;
  supplier?: string;
}
