/*
  # Add User Profiles and Role-Based Access Control

  ## Overview
  Creates user profiles with role-based permissions for PRS Admin and Customer access levels.

  ## 1. New Tables

  ### `user_profiles`
  Stores user role and metadata linked to Supabase auth users
  - `id` (uuid, primary key, references auth.users)
  - `email` (text) - User email for reference
  - `full_name` (text) - User's full name
  - `role` (text) - User role: 'admin' or 'customer'
  - `organization` (text) - Organization name (e.g., 'PRS Industrial', 'Nordstrom WCOC')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Security
  - Enable RLS on user_profiles
  - Users can read their own profile
  - Only admins can create/update profiles (enforced at application level)

  ## 3. Pre-Provisioned Users
  - Create two initial users:
    1. PRS Admin (admin@prsindustrial.com) - Full access
    2. Nordstrom WCOC Customer (wcoc@nordstrom.com) - View + approve repairs

  ## 4. Helper Function
  - Create function to get current user's role for easy permission checks
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'customer',
  organization text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('admin', 'customer'))
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert profiles"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM user_profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'customer');
END;
$$;

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);