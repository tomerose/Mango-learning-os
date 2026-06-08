-- MangoOS V14.7.5 — Mango Codes table (Supabase-backed)
-- Replaces in-memory storage with persistent database

CREATE TABLE IF NOT EXISTS public.mango_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  plan_granted TEXT NOT NULL DEFAULT 'pro' CHECK (plan_granted IN ('free', 'standard', 'pro', 'admin')),
  duration_type TEXT NOT NULL DEFAULT 'days' CHECK (duration_type IN ('days', 'month', 'year', 'lifetime')),
  duration_value INTEGER NOT NULL DEFAULT 30,
  max_uses INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'disabled', 'revoked')),
  note TEXT,
  created_by TEXT,
  redeemed_by TEXT,
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mango_codes_code ON public.mango_codes(code);
CREATE INDEX IF NOT EXISTS idx_mango_codes_status ON public.mango_codes(status);
CREATE INDEX IF NOT EXISTS idx_mango_codes_created_at ON public.mango_codes(created_at DESC);

-- RLS: Only admins can read/write codes (server-side service_role bypasses RLS)
ALTER TABLE public.mango_codes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read active codes (for validation)
CREATE POLICY "Anyone can validate active codes"
  ON public.mango_codes FOR SELECT
  USING (status = 'active');

-- Plan update function for redemption
CREATE OR REPLACE FUNCTION public.redeem_mango_code(
  p_code TEXT,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_code RECORD;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Lock the row for atomic update
  SELECT * INTO v_code FROM public.mango_codes
  WHERE code = p_code AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', '兑换码不存在或已失效', 'error_code', 'INVALID_CODE');
  END IF;

  -- Check expiry
  IF v_code.expires_at IS NOT NULL AND v_code.expires_at < NOW() THEN
    UPDATE public.mango_codes SET status = 'expired', updated_at = NOW() WHERE id = v_code.id;
    RETURN jsonb_build_object('success', false, 'error', '兑换码已过期', 'error_code', 'EXPIRED');
  END IF;

  -- Check usage
  IF v_code.used_count >= v_code.max_uses THEN
    UPDATE public.mango_codes SET status = 'used', updated_at = NOW() WHERE id = v_code.id;
    RETURN jsonb_build_object('success', false, 'error', '兑换码已被使用', 'error_code', 'ALREADY_USED');
  END IF;

  -- Calculate plan expiration
  IF v_code.duration_type = 'lifetime' OR v_code.duration_value = 0 THEN
    v_expires_at := NULL;
  ELSIF v_code.duration_type = 'days' THEN
    v_expires_at := NOW() + (v_code.duration_value || ' days')::INTERVAL;
  ELSIF v_code.duration_type = 'month' THEN
    v_expires_at := NOW() + (v_code.duration_value || ' months')::INTERVAL;
  ELSIF v_code.duration_type = 'year' THEN
    v_expires_at := NOW() + (v_code.duration_value || ' years')::INTERVAL;
  END IF;

  -- Update code usage
  UPDATE public.mango_codes SET
    used_count = used_count + 1,
    redeemed_by = p_user_id::TEXT,
    redeemed_at = NOW(),
    status = CASE WHEN used_count + 1 >= max_uses THEN 'used' ELSE 'active' END,
    updated_at = NOW()
  WHERE id = v_code.id;

  -- Update user profile
  UPDATE public.profiles SET
    plan = v_code.plan_granted,
    plan_expires_at = v_expires_at,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_plan', v_code.plan_granted,
    'plan_expires_at', v_expires_at,
    'duration_type', v_code.duration_type,
    'duration_value', v_code.duration_value
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
