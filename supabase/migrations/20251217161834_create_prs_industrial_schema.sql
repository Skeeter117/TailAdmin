/*
  # PRS Industrial Inc. Portal Database Schema

  ## Overview
  Complete database schema for the PRS Industrial customer portal supporting PM tracking,
  annual schedules, asset management, and repair approval workflows.

  ## 1. New Tables

  ### `asset_types`
  Stores the four core asset categories
  - `id` (uuid, primary key)
  - `name` (text) - Asset type name (Dock Doors, PIT, MAXX Reach, Yard Gates)
  - `created_at` (timestamptz)

  ### `pm_summary`
  Dashboard summary for each asset type showing PM status and metrics
  - `id` (uuid, primary key)
  - `asset_type_id` (uuid, foreign key to asset_types)
  - `service_frequency` (text) - Monthly, Quarterly, or Annually
  - `total_units_serviced` (integer) - Total count of units
  - `compliance_percentage` (numeric) - Compliance % (0-100)
  - `next_service_due` (date) - Next scheduled service date
  - `updated_at` (timestamptz)

  ### `assets`
  Individual asset records with details and location
  - `id` (uuid, primary key)
  - `asset_type_id` (uuid, foreign key to asset_types)
  - `asset_number` (text, unique) - Asset ID/number
  - `location` (text) - Physical location
  - `status` (text) - Active, Inactive, etc.
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `pm_schedules`
  Annual schedule grid showing monthly status per asset type
  - `id` (uuid, primary key)
  - `asset_type_id` (uuid, foreign key to asset_types)
  - `year` (integer) - Schedule year (e.g., 2026)
  - `month` (integer) - Month number (1-12)
  - `status` (text) - Completed, Scheduled, Customer Delayed, In Progress
  - `updated_at` (timestamptz)
  - Unique constraint on (asset_type_id, year, month)

  ### `work_orders`
  Repair requests and work history requiring customer approval
  - `id` (uuid, primary key)
  - `asset_id` (uuid, foreign key to assets)
  - `title` (text) - Work order title/summary
  - `description` (text) - Detailed description
  - `status` (text) - Pending Approval, Approved, Completed, Declined
  - `priority` (text) - Low, Medium, High, Critical
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `completed_at` (timestamptz, nullable)

  ### `attachments`
  Documents, photos, and reports linked to assets or work orders
  - `id` (uuid, primary key)
  - `asset_id` (uuid, foreign key to assets, nullable)
  - `work_order_id` (uuid, foreign key to work_orders, nullable)
  - `file_name` (text) - Original filename
  - `file_path` (text) - Storage path/URL
  - `file_type` (text) - MIME type
  - `file_size` (integer) - Size in bytes
  - `category` (text) - PM Report, Repair Recommendation, Photo, Document, etc.
  - `uploaded_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Create policies for authenticated users to read all data
  - Create policies for authenticated users to update specific fields
  - Create policies for authenticated users to insert work orders and attachments

  ## 3. Sample Data
  - Insert the four core asset types
  - Create initial PM summary records for each asset type
*/

-- Create asset_types table
CREATE TABLE IF NOT EXISTS asset_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create pm_summary table
CREATE TABLE IF NOT EXISTS pm_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type_id uuid REFERENCES asset_types(id) ON DELETE CASCADE NOT NULL,
  service_frequency text NOT NULL DEFAULT 'Monthly',
  total_units_serviced integer DEFAULT 0,
  compliance_percentage numeric(5,2) DEFAULT 0.00,
  next_service_due date,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_frequency CHECK (service_frequency IN ('Monthly', 'Quarterly', 'Annually')),
  CONSTRAINT valid_compliance CHECK (compliance_percentage >= 0 AND compliance_percentage <= 100)
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type_id uuid REFERENCES asset_types(id) ON DELETE CASCADE NOT NULL,
  asset_number text UNIQUE NOT NULL,
  location text DEFAULT '',
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pm_schedules table
CREATE TABLE IF NOT EXISTS pm_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type_id uuid REFERENCES asset_types(id) ON DELETE CASCADE NOT NULL,
  year integer NOT NULL,
  month integer NOT NULL,
  status text DEFAULT 'Scheduled',
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_month CHECK (month >= 1 AND month <= 12),
  CONSTRAINT valid_status CHECK (status IN ('Completed', 'Scheduled', 'Customer Delayed', 'In Progress')),
  UNIQUE(asset_type_id, year, month)
);

-- Create work_orders table
CREATE TABLE IF NOT EXISTS work_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'Pending Approval',
  priority text DEFAULT 'Medium',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT valid_wo_status CHECK (status IN ('Pending Approval', 'Approved', 'Completed', 'Declined')),
  CONSTRAINT valid_priority CHECK (priority IN ('Low', 'Medium', 'High', 'Critical'))
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  work_order_id uuid REFERENCES work_orders(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text DEFAULT '',
  file_size integer DEFAULT 0,
  category text DEFAULT 'Document',
  uploaded_at timestamptz DEFAULT now(),
  CONSTRAINT attachment_link CHECK (asset_id IS NOT NULL OR work_order_id IS NOT NULL)
);

-- Enable RLS on all tables
ALTER TABLE asset_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for asset_types
CREATE POLICY "Anyone can view asset types"
  ON asset_types FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for pm_summary
CREATE POLICY "Users can view PM summary"
  ON pm_summary FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update PM summary"
  ON pm_summary FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for assets
CREATE POLICY "Users can view assets"
  ON assets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert assets"
  ON assets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update assets"
  ON assets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for pm_schedules
CREATE POLICY "Users can view PM schedules"
  ON pm_schedules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert PM schedules"
  ON pm_schedules FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update PM schedules"
  ON pm_schedules FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for work_orders
CREATE POLICY "Users can view work orders"
  ON work_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert work orders"
  ON work_orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update work orders"
  ON work_orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for attachments
CREATE POLICY "Users can view attachments"
  ON attachments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert attachments"
  ON attachments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete attachments"
  ON attachments FOR DELETE
  TO authenticated
  USING (true);

-- Insert the four core asset types
INSERT INTO asset_types (name) VALUES
  ('Dock Doors'),
  ('PIT'),
  ('MAXX Reach'),
  ('Yard Gates')
ON CONFLICT (name) DO NOTHING;

-- Create initial PM summary records for each asset type
INSERT INTO pm_summary (asset_type_id, service_frequency, total_units_serviced, compliance_percentage, next_service_due)
SELECT 
  id,
  'Monthly',
  0,
  0.00,
  CURRENT_DATE + INTERVAL '30 days'
FROM asset_types
ON CONFLICT DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(asset_type_id);
CREATE INDEX IF NOT EXISTS idx_assets_number ON assets(asset_number);
CREATE INDEX IF NOT EXISTS idx_pm_schedules_year_month ON pm_schedules(year, month);
CREATE INDEX IF NOT EXISTS idx_work_orders_asset ON work_orders(asset_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_attachments_asset ON attachments(asset_id);
CREATE INDEX IF NOT EXISTS idx_attachments_work_order ON attachments(work_order_id);