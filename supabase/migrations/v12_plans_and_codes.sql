-- V12: Plans + Mango Codes tables
-- Run in Supabase SQL Editor

-- User plans
CREATE TABLE IF NOT EXISTS user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'standard' CHECK (tier IN ('guest','standard','pro','admin')),
  granted_by TEXT DEFAULT 'signup',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_plans_user ON user_plans(user_id);
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own plan" ON user_plans FOR SELECT USING (auth.uid() = user_id);

-- Mango Codes
CREATE TABLE IF NOT EXISTS mango_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  plan_granted TEXT NOT NULL DEFAULT 'standard' CHECK (plan_granted IN ('standard','pro','admin')),
  duration_days INT NOT NULL DEFAULT 0,
  max_redemptions INT NOT NULL DEFAULT 1,
  used_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','used','expired','disabled')),
  created_by TEXT NOT NULL DEFAULT 'founder',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mango_codes_code ON mango_codes(code);
ALTER TABLE mango_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active codes" ON mango_codes FOR SELECT USING (status = 'active');

-- Redemption records
CREATE TABLE IF NOT EXISTS code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_before TEXT NOT NULL,
  plan_after TEXT NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_redemptions_user ON code_redemptions(user_id);
ALTER TABLE code_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own redemptions" ON code_redemptions FOR SELECT USING (auth.uid() = user_id);

-- Seed: default Mango Codes
INSERT INTO mango_codes (code, plan_granted, duration_days, max_redemptions, status, created_by) VALUES
  ('MANGO-ADMIN-2026', 'admin', 0, 5, 'active', 'founder'),
  ('MANGO-PRO-TEST', 'pro', 30, 20, 'active', 'founder'),
  ('MANGO-STD-2026', 'standard', 0, 50, 'active', 'founder')
ON CONFLICT (code) DO NOTHING;
