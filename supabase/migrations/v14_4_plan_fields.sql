-- MangoOS V14.4 — Membership Plan Fields
-- Adds plan-related columns to profiles table for Pro/Standard tier support.

-- Add plan columns if they don't exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS mango_code_used TEXT,
  ADD COLUMN IF NOT EXISTS mango_code_redeemed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Index for plan queries
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON public.profiles(plan);
CREATE INDEX IF NOT EXISTS idx_profiles_plan_expires ON public.profiles(plan_expires_at);

-- Update existing users: if is_admin is true, set plan to 'admin'
UPDATE public.profiles SET plan = 'admin' WHERE is_admin = true AND plan = 'standard';

-- Set a demo Pro user for testing (optional)
-- UPDATE public.profiles SET plan = 'pro', plan_expires_at = '2027-06-07' WHERE id = 'YOUR_USER_ID';
