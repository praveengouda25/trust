-- Enhance branches table with additional fields for complete Branch Management
-- This migration adds all required fields for the Branch Management module

-- Add branch_type enum
CREATE TYPE public.branch_type AS ENUM (
  'main_campus',
  'branch_campus',
  'trust_hostel',
  'boys_hostel',
  'girls_hostel',
  'residential_school',
  'other'
);

-- Add new columns to branches table
ALTER TABLE public.branches
  ADD COLUMN IF NOT EXISTS branch_type public.branch_type DEFAULT 'main_campus',
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS registration_number text,
  ADD COLUMN IF NOT EXISTS gst_number text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone_country_code text DEFAULT '+91',
  ADD COLUMN IF NOT EXISTS alternate_contact text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS taluk text,
  ADD COLUMN IF NOT EXISTS village text,
  ADD COLUMN IF NOT EXISTS pincode text,
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric,
  ADD COLUMN IF NOT EXISTS description text;

-- Add indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_branches_type ON public.branches(branch_type);
CREATE INDEX IF NOT EXISTS idx_branches_city ON public.branches(city);
CREATE INDEX IF NOT EXISTS idx_branches_state ON public.branches(state);

-- Update updated_at trigger to include new columns
DROP TRIGGER IF EXISTS trg_branches_updated ON public.branches;
CREATE TRIGGER trg_branches_updated BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
