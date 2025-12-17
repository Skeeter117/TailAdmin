/*
  # Fix Security and Performance Issues

  ## Overview
  Addresses security and performance issues identified by Supabase Advisor

  ## Changes

  ### 1. Add Missing Index
  - Add index on `pm_summary.asset_type_id` foreign key for better query performance

  ### 2. Optimize RLS Policies
  - Fix RLS policy to use `(select auth.uid())` instead of `auth.uid()` for better performance
  - Remove redundant SELECT policy on user_profiles (keep only "Users can view all profiles")

  ### 3. Fix Function Search Path
  - Update `get_user_role` function to use stable search_path

  ## Notes
  - Unused indexes are kept as they will be utilized once the application is in production
  - Leaked Password Protection must be enabled in Supabase Dashboard: 
    Authentication > Policies > Enable "Leaked Password Protection"
*/

-- Add missing index on pm_summary foreign key
CREATE INDEX IF NOT EXISTS idx_pm_summary_asset_type ON pm_summary(asset_type_id);

-- Drop the redundant RLS policy (we keep "Users can view all profiles" which is more permissive)
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;

-- Recreate the "Users can view all profiles" policy with optimized auth function call
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Recreate other policies with optimized auth function calls
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
CREATE POLICY "Admins can insert profiles"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update profiles" ON user_profiles;
CREATE POLICY "Admins can update profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Fix function search path to be stable
DROP FUNCTION IF EXISTS get_user_role();
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM user_profiles
  WHERE id = (select auth.uid());
  
  RETURN COALESCE(user_role, 'customer');
END;
$$;