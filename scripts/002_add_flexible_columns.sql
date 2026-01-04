-- Migration: Add flexible columns to financial_records table
-- This allows the system to store any CSV structure dynamically

-- Add the columns array to store column names
ALTER TABLE public.financial_records 
ADD COLUMN IF NOT EXISTS columns text[];

-- Add the data JSONB column to store all row data
ALTER TABLE public.financial_records 
ADD COLUMN IF NOT EXISTS data jsonb;

-- Update the raw_data column to be nullable since we're using the new data column
ALTER TABLE public.financial_records 
ALTER COLUMN raw_data DROP NOT NULL;

-- Make all the specific financial columns nullable since we're now using flexible storage
ALTER TABLE public.financial_records 
ALTER COLUMN revenue DROP NOT NULL,
ALTER COLUMN cost_of_revenue DROP NOT NULL,
ALTER COLUMN gross_profit DROP NOT NULL,
ALTER COLUMN operating_expenses DROP NOT NULL,
ALTER COLUMN operating_income DROP NOT NULL,
ALTER COLUMN net_income DROP NOT NULL,
ALTER COLUMN total_assets DROP NOT NULL,
ALTER COLUMN total_liabilities DROP NOT NULL,
ALTER COLUMN shareholders_equity DROP NOT NULL,
ALTER COLUMN fiscal_year DROP NOT NULL;

-- Create an index on the data column for better query performance
CREATE INDEX IF NOT EXISTS idx_financial_records_data ON public.financial_records USING gin (data);

-- Create an index on file_name for grouping
CREATE INDEX IF NOT EXISTS idx_financial_records_file_name ON public.financial_records (file_name);
