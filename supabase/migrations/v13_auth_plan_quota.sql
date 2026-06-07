-- ═══════════════════════════════════════════════════════════════
-- V13: Auth / Plan / Quota / Mango Code Foundation
-- Run in Supabase SQL Editor:
--   https://app.supabase.com/project/gwhlkumqkcyclvlahkkp/sql
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Profiles: add plan columns ──────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'standard'
    CHECK (plan IN ('standard','pro','admin')),
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);

-- ── 2. Daily Quota Tracking ───────────────────────────────────
-- Records daily usage per user, reset at Beijing midnight (UTC+8)
CREATE TABLE IF NOT EXISTS daily_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL, -- yyyy-mm-dd in Beijing Time (UTC+8)
  agent_tasks INT NOT NULL DEFAULT 0,
  study_packs INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_quotas_user_date ON daily_quotas(user_id, date);

ALTER TABLE daily_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quotas" ON daily_quotas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own quotas" ON daily_quotas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotas" ON daily_quotas
  FOR UPDATE USING (auth.uid() = user_id);

-- ── 3. Mango Codes — production-grade ─────────────────────────
CREATE TABLE IF NOT EXISTS mango_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  plan_granted TEXT NOT NULL DEFAULT 'pro'
    CHECK (plan_granted IN ('standard','pro','admin')),
  duration_days INT NOT NULL DEFAULT 30, -- 0 = permanent
  max_redemptions INT NOT NULL DEFAULT 1,
  used_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','used','expired','disabled','revoked')),
  created_by TEXT NOT NULL DEFAULT 'founder',
  redeemed_by UUID REFERENCES auth.users(id),
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- code itself expires
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mango_codes_code ON mango_codes(code);
CREATE INDEX IF NOT EXISTS idx_mango_codes_status ON mango_codes(status);

ALTER TABLE mango_codes ENABLE ROW LEVEL SECURITY;

-- Read: anyone can check if a code is valid (needed for validateOnly)
CREATE POLICY "Anyone can read active codes" ON mango_codes
  FOR SELECT USING (status = 'active');

-- Admin: insert/update/delete (enforced at API level, not RLS)
CREATE POLICY "Admins can insert codes" ON mango_codes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update codes" ON mango_codes
  FOR UPDATE USING (true);

-- ── 4. Code Redemptions — audit log ────────────────────────────
CREATE TABLE IF NOT EXISTS code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_before TEXT NOT NULL,
  plan_after TEXT NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_redemptions_user ON code_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_code ON code_redemptions(code);

ALTER TABLE code_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemptions" ON code_redemptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert redemptions" ON code_redemptions
  FOR INSERT WITH CHECK (true);

-- ── 5. User Plans — plan change history ────────────────────────
CREATE TABLE IF NOT EXISTS user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('guest','standard','pro','admin')),
  granted_by TEXT DEFAULT 'signup', -- 'signup' | 'mango_code' | 'admin'
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_plans_user ON user_plans(user_id);

ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plan history" ON user_plans
  FOR SELECT USING (auth.uid() = user_id);

-- ── 6. Seed Data ───────────────────────────────────────────────

-- Trigger: auto-create user_plan on signup
CREATE OR REPLACE FUNCTION handle_new_user_plan()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_plans (user_id, tier, granted_by)
  VALUES (NEW.id, 'standard', 'signup');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created_plan ON auth.users;
CREATE TRIGGER on_auth_user_created_plan
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_plan();

-- Seed Mango Codes (idempotent with ON CONFLICT DO NOTHING)
INSERT INTO mango_codes (code, plan_granted, duration_days, max_redemptions, status, created_by, notes)
VALUES
  ('MANGO-ADMIN-2026', 'admin', 0, 5, 'active', 'founder', 'Admin code — permanent, 5 uses'),
  ('MANGO-PRO-TEST',   'pro',   30, 20, 'active', 'founder', 'Pro test code — 30 days, 20 uses'),
  ('MANGO-STD-2026',   'standard', 0, 100, 'active', 'founder', 'Standard code — permanent, 100 uses'),
  ('MANGO-PRO-DEMO-2026', 'pro', 30, 50, 'active', 'founder', 'Pro demo code — 30 days, 50 uses')
ON CONFLICT (code) DO NOTHING;

-- Set founder account as admin (uncomment and fill in user ID):
-- UPDATE profiles SET is_admin = true, plan = 'admin'
-- WHERE id = 'YOUR-USER-UUID-HERE';

-- ── 7. Function: Atomic code redemption with row lock ──────────
CREATE OR REPLACE FUNCTION redeem_mango_code(
  p_code TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code RECORD;
  v_current_plan TEXT;
  v_new_plan TEXT;
  v_new_expires_at TIMESTAMPTZ;
BEGIN
  -- Lock the code row (FOR UPDATE prevents double-spend)
  SELECT * INTO v_code
  FROM mango_codes
  WHERE code = p_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', '兑换码不存在', 'errorCode', 'INVALID_CODE');
  END IF;

  -- Status checks
  IF v_code.status IN ('disabled','revoked') THEN
    RETURN jsonb_build_object('success', false, 'error', '此兑换码已失效', 'errorCode', 'DISABLED');
  END IF;

  IF v_code.used_count >= v_code.max_redemptions THEN
    RETURN jsonb_build_object('success', false, 'error', '此兑换码已被使用', 'errorCode', 'ALREADY_USED');
  END IF;

  IF v_code.expires_at IS NOT NULL AND v_code.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', '此兑换码已过期', 'errorCode', 'EXPIRED');
  END IF;

  IF v_code.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', '此兑换码不可用', 'errorCode', 'INVALID_CODE');
  END IF;

  -- Get current plan
  SELECT plan INTO v_current_plan
  FROM profiles
  WHERE id = p_user_id;

  v_new_plan := v_code.plan_granted;

  -- Calculate new expiration
  IF v_code.duration_days > 0 THEN
    -- If user is already on this plan and has existing expiry, extend it
    IF v_current_plan = v_new_plan THEN
      SELECT plan_expires_at INTO v_new_expires_at
      FROM profiles
      WHERE id = p_user_id;

      IF v_new_expires_at IS NOT NULL AND v_new_expires_at > now() THEN
        v_new_expires_at := v_new_expires_at + (v_code.duration_days || ' days')::INTERVAL;
      ELSE
        v_new_expires_at := now() + (v_code.duration_days || ' days')::INTERVAL;
      END IF;
    ELSE
      v_new_expires_at := now() + (v_code.duration_days || ' days')::INTERVAL;
    END IF;
  ELSE
    v_new_expires_at := NULL; -- permanent
  END IF;

  -- Atomic update: mark code as used
  UPDATE mango_codes
  SET used_count = used_count + 1,
      status = CASE WHEN used_count + 1 >= max_redemptions THEN 'used' ELSE 'active' END,
      redeemed_by = p_user_id,
      redeemed_at = now(),
      updated_at = now()
  WHERE id = v_code.id;

  -- Update user's plan
  UPDATE profiles
  SET plan = v_new_plan,
      plan_expires_at = v_new_expires_at
  WHERE id = p_user_id;

  -- Record redemption
  INSERT INTO code_redemptions (code, user_id, plan_before, plan_after)
  VALUES (p_code, p_user_id, v_current_plan, v_new_plan);

  -- Record plan change
  INSERT INTO user_plans (user_id, tier, granted_by, expires_at)
  VALUES (p_user_id, v_new_plan, 'mango_code', v_new_expires_at);

  RETURN jsonb_build_object(
    'success', true,
    'newPlan', v_new_plan,
    'planExpiresAt', v_new_expires_at
  );
END;
$$;

-- ── 8. Function: Get or create daily quota ─────────────────────
CREATE OR REPLACE FUNCTION get_daily_quota(
  p_user_id UUID,
  p_date TEXT -- yyyy-mm-dd in Beijing Time
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_quota RECORD;
BEGIN
  SELECT * INTO v_quota
  FROM daily_quotas
  WHERE user_id = p_user_id AND date = p_date;

  IF NOT FOUND THEN
    INSERT INTO daily_quotas (user_id, date, agent_tasks, study_packs)
    VALUES (p_user_id, p_date, 0, 0)
    RETURNING * INTO v_quota;
  END IF;

  RETURN jsonb_build_object(
    'agentTasks', jsonb_build_object('current', v_quota.agent_tasks, 'max', 20),
    'studyPacks', jsonb_build_object('current', v_quota.study_packs, 'max', 3)
  );
END;
$$;

-- ── 9. Function: Increment daily quota (atomic) ────────────────
CREATE OR REPLACE FUNCTION increment_quota(
  p_user_id UUID,
  p_date TEXT,
  p_type TEXT -- 'agent_tasks' or 'study_packs'
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_quota RECORD;
  v_new_count INT;
  v_max INT;
BEGIN
  -- Upsert quota row
  INSERT INTO daily_quotas (user_id, date, agent_tasks, study_packs)
  VALUES (p_user_id, p_date, 0, 0)
  ON CONFLICT (user_id, date) DO NOTHING;

  -- Lock and read
  SELECT * INTO v_quota
  FROM daily_quotas
  WHERE user_id = p_user_id AND date = p_date
  FOR UPDATE;

  -- Get plan info
  IF p_type = 'agent_tasks' THEN
    v_max := CASE
      WHEN (SELECT plan FROM profiles WHERE id = p_user_id) = 'pro' THEN 100
      WHEN (SELECT plan FROM profiles WHERE id = p_user_id) = 'admin' THEN 9999
      ELSE 20
    END;

    v_new_count := v_quota.agent_tasks + 1;

    IF v_new_count > v_max THEN
      RETURN jsonb_build_object('allowed', false, 'current', v_quota.agent_tasks, 'max', v_max);
    END IF;

    UPDATE daily_quotas SET agent_tasks = v_new_count, updated_at = now()
    WHERE id = v_quota.id;
  ELSE
    v_max := CASE
      WHEN (SELECT plan FROM profiles WHERE id = p_user_id) = 'pro' THEN 20
      WHEN (SELECT plan FROM profiles WHERE id = p_user_id) = 'admin' THEN 9999
      ELSE 3
    END;

    v_new_count := v_quota.study_packs + 1;

    IF v_new_count > v_max THEN
      RETURN jsonb_build_object('allowed', false, 'current', v_quota.study_packs, 'max', v_max);
    END IF;

    UPDATE daily_quotas SET study_packs = v_new_count, updated_at = now()
    WHERE id = v_quota.id;
  END IF;

  RETURN jsonb_build_object('allowed', true, 'current', v_new_count, 'max', v_max);
END;
$$;
