-- eFeNBi Initial Database Schema
-- Phase 3: Core Tables with RLS

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- BUSINESSES
-- ================================================================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  currency VARCHAR(10) DEFAULT 'IDR',
  target_margin DECIMAL(5,4) DEFAULT 0.30,
  is_planning_mode BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ================================================================
-- INGREDIENTS
-- ================================================================
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  market_unit VARCHAR(50) NOT NULL, -- e.g., 'kg', 'liter', 'pack'
  market_qty DECIMAL(10,3) NOT NULL DEFAULT 1, -- e.g., 1 (kg)
  price_per_market_unit DECIMAL(15,2) NOT NULL DEFAULT 0,
  recipe_unit VARCHAR(50), -- e.g., 'gram', 'ml', 'piece'
  conversion_factor DECIMAL(10,4) DEFAULT 1, -- recipe_unit to market_unit
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingredient price history for tracking
CREATE TABLE IF NOT EXISTS ingredient_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  price DECIMAL(15,2) NOT NULL,
  source VARCHAR(50), -- 'manual', 'ai_suggested', 'import'
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- MENUS
-- ================================================================
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  selling_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  cogs DECIMAL(15,2) DEFAULT 0, -- calculated from recipe
  margin_percent DECIMAL(5,4) DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- RECIPES (One recipe per menu item)
-- ================================================================
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID NOT NULL UNIQUE REFERENCES menus(id) ON DELETE CASCADE,
  yield_qty DECIMAL(10,3) DEFAULT 1, -- e.g., 1 cup, 2 portions
  yield_unit VARCHAR(50) DEFAULT 'portion',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe ingredients (many-to-many)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL(10,4) NOT NULL, -- in recipe_unit
  unit VARCHAR(50) NOT NULL, -- e.g., 'gram', 'ml'
  cost DECIMAL(15,4) DEFAULT 0, -- calculated cost for this ingredient
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipe_id, ingredient_id)
);

-- ================================================================
-- OPEX CATEGORIES
-- ================================================================
CREATE TABLE IF NOT EXISTS opex_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  frequency VARCHAR(20) DEFAULT 'monthly', -- 'daily', 'weekly', 'monthly', 'yearly'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ORDERS (POS)
-- ================================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  order_number VARCHAR(50) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_cogs DECIMAL(15,2) DEFAULT 0,
  payment_type VARCHAR(50) DEFAULT 'cash', -- 'cash', 'card', 'qris', 'transfer'
  payment_status VARCHAR(20) DEFAULT 'paid', -- 'pending', 'paid', 'cancelled'
  notes TEXT,
  synced_from_offline BOOLEAN DEFAULT false,
  offline_id VARCHAR(100), -- for deduplication from offline sync
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id UUID REFERENCES menus(id) ON DELETE SET NULL,
  menu_name VARCHAR(255) NOT NULL, -- store name in case menu is deleted
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL,
  unit_cogs DECIMAL(15,2) DEFAULT 0,
  total_price DECIMAL(15,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- INVENTORY
-- ================================================================
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL UNIQUE REFERENCES ingredients(id) ON DELETE CASCADE,
  current_stock DECIMAL(15,4) NOT NULL DEFAULT 0, -- in market_unit
  reorder_level DECIMAL(15,4) DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory logs for tracking changes
CREATE TABLE IF NOT EXISTS inventory_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  change_type VARCHAR(20) NOT NULL, -- 'purchase', 'sale', 'adjustment', 'waste'
  quantity_change DECIMAL(15,4) NOT NULL, -- positive for additions, negative for deductions
  previous_stock DECIMAL(15,4),
  new_stock DECIMAL(15,4),
  reason TEXT,
  reference_id UUID, -- can link to order_id or other source
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- DAILY SUMMARIES (for analytics)
-- ================================================================
CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_sales DECIMAL(15,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_cogs DECIMAL(15,2) DEFAULT 0,
  gross_profit DECIMAL(15,2) DEFAULT 0,
  top_selling_menu_id UUID REFERENCES menus(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, date)
);

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE opex_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

-- Businesses: Users can only access their own business
CREATE POLICY "Users can view own business" ON businesses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business" ON businesses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own business" ON businesses
  FOR DELETE USING (auth.uid() = user_id);

-- Helper function to get user's business_id
CREATE OR REPLACE FUNCTION get_user_business_id()
RETURNS UUID AS $$
  SELECT id FROM businesses WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Ingredients: Access through business ownership
CREATE POLICY "Users can access own ingredients" ON ingredients
  FOR ALL USING (business_id = get_user_business_id());

-- Ingredient price history: Access through ingredient ownership
CREATE POLICY "Users can access own ingredient history" ON ingredient_price_history
  FOR ALL USING (
    ingredient_id IN (SELECT id FROM ingredients WHERE business_id = get_user_business_id())
  );

-- Menus: Access through business ownership
CREATE POLICY "Users can access own menus" ON menus
  FOR ALL USING (business_id = get_user_business_id());

-- Recipes: Access through menu ownership
CREATE POLICY "Users can access own recipes" ON recipes
  FOR ALL USING (
    menu_id IN (SELECT id FROM menus WHERE business_id = get_user_business_id())
  );

-- Recipe ingredients: Access through recipe ownership
CREATE POLICY "Users can access own recipe ingredients" ON recipe_ingredients
  FOR ALL USING (
    recipe_id IN (
      SELECT r.id FROM recipes r
      JOIN menus m ON r.menu_id = m.id
      WHERE m.business_id = get_user_business_id()
    )
  );

-- OPEX: Access through business ownership
CREATE POLICY "Users can access own opex" ON opex_categories
  FOR ALL USING (business_id = get_user_business_id());

-- Orders: Access through business ownership
CREATE POLICY "Users can access own orders" ON orders
  FOR ALL USING (business_id = get_user_business_id());

-- Order items: Access through order ownership
CREATE POLICY "Users can access own order items" ON order_items
  FOR ALL USING (
    order_id IN (SELECT id FROM orders WHERE business_id = get_user_business_id())
  );

-- Inventory: Access through business ownership
CREATE POLICY "Users can access own inventory" ON inventory
  FOR ALL USING (business_id = get_user_business_id());

-- Inventory logs: Access through inventory ownership
CREATE POLICY "Users can access own inventory logs" ON inventory_logs
  FOR ALL USING (
    inventory_id IN (SELECT id FROM inventory WHERE business_id = get_user_business_id())
  );

-- Daily summaries: Access through business ownership
CREATE POLICY "Users can access own summaries" ON daily_summaries
  FOR ALL USING (business_id = get_user_business_id());

-- ================================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_ingredients_updated_at
  BEFORE UPDATE ON ingredients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_menus_updated_at
  BEFORE UPDATE ON menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_opex_updated_at
  BEFORE UPDATE ON opex_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_summaries_updated_at
  BEFORE UPDATE ON daily_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_business_id ON ingredients(business_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients(business_id, category);
CREATE INDEX IF NOT EXISTS idx_menus_business_id ON menus(business_id);
CREATE INDEX IF NOT EXISTS idx_menus_category ON menus(business_id, category);
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_business_id ON inventory(business_id);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_date ON daily_summaries(business_id, date DESC);
