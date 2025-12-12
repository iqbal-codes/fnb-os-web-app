-- SajiPlan Additional Tables Migration
-- Note: businesses.user_id is the owner column (not owner_id)
-- Note: orders and opex_categories already exist in 001_initial_schema.sql

-- ================================================================
-- TRANSACTIONS TABLE (alternative to orders for quick POS transactions)
-- This supplements the existing orders table with a simpler structure
-- ================================================================

-- Only create if you need a separate transactions table
-- Otherwise, use the existing 'orders' table from 001_initial_schema.sql

-- If orders table doesn't have all needed columns, add them:
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount DECIMAL(15,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax DECIMAL(15,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- ================================================================
-- OPEX TABLE (if opex_categories doesn't meet needs)
-- The existing opex_categories table should work, but we can add columns
-- ================================================================

ALTER TABLE opex_categories ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'other';

-- ================================================================
-- ADDITIONAL INDEXES
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_type ON orders(payment_type);
CREATE INDEX IF NOT EXISTS idx_opex_categories_active ON opex_categories(business_id, is_active);
