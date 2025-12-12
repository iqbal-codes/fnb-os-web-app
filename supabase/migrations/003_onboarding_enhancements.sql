-- Enhanced Onboarding Schema Additions
-- Adds equipment table and extended business columns for onboarding flow

-- ================================================================
-- EQUIPMENT TABLE (for starter kit recommendations)
-- ================================================================
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  quantity INTEGER DEFAULT 1,
  estimated_price DECIMAL(15,2) DEFAULT 0,
  is_ai_suggested BOOLEAN DEFAULT true,
  is_purchased BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can access own equipment"
  ON equipment FOR ALL
  USING (business_id = get_user_business_id());

-- Index
CREATE INDEX IF NOT EXISTS idx_equipment_business_id ON equipment(business_id);

-- ================================================================
-- EXTEND BUSINESSES TABLE
-- ================================================================
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS operating_model VARCHAR(50);
-- Options: 'home_based', 'booth', 'cafe', 'cloud_kitchen'

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS team_size VARCHAR(20);
-- Options: 'solo', '2-3', '4-5', '6+'

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS target_daily_sales INTEGER DEFAULT 0;

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;
-- Tracks current step for resume functionality

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS onboarding_path VARCHAR(20);
-- 'new' or 'existing'

-- ================================================================
-- ONBOARDING PROGRESS TABLE (for auto-save)
-- ================================================================
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_data JSONB DEFAULT '{}',
  current_step INTEGER DEFAULT 1,
  path VARCHAR(20), -- 'new' or 'existing'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can access own onboarding progress"
  ON onboarding_progress FOR ALL
  USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER trigger_equipment_updated_at
  BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_onboarding_progress_updated_at
  BEFORE UPDATE ON onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
