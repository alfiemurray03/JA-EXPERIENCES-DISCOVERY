/*
# Builder Engine Schema

1. Purpose
This migration creates the core tables for the reusable Builder Engine.
It adds builder definitions (stored in the database, managed by admins),
builder run records (customer progress through guided questionnaires),
and extends the token ledger to support builder-related transactions.

2. New Tables
- `builder_definitions` - Central registry of all available builders (Holiday Planner, etc.)
  Each builder contains its question schema, output instructions, token cost,
  plan eligibility, and publication status. Managed by admins.
- `builder_runs` - Per-customer run records tracking progress through a builder's
  guided questions, saved answers, generation status, and the final result.
  Each run belongs to one customer and references one builder definition.

3. Columns on `builder_definitions`
- `id` (uuid, primary key)
- `builder_key` (text, unique) - stable identifier like "holiday-planner"
- `name` (text) - display name
- `slug` (text, unique) - URL slug
- `category` (text) - e.g. "Travel", "Everyday", "Family"
- `icon` (text) - emoji or icon identifier
- `short_description` (text) - card description
- `creates_description` (text) - "You'll create..." text
- `estimated_minutes` (int) - estimated completion time
- `token_cost` (int) - tokens charged on generation (default 5)
- `min_plan` (enum subscription_plan) - minimum membership plan required
- `trial_eligible` (bool, default true) - can trial users access this builder
- `featured` (bool, default false) - show in featured section
- `status` (enum builder_status) - draft, published, paused, archived
- `display_order` (int, default 0) - sort order in catalogue
- `questions` (jsonb) - array of question definitions with types, options, validation, conditionals
- `output_instructions` (text) - instructions for the generation service
- `version` (int, default 1) - builder definition version number
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

4. Columns on `builder_runs`
- `id` (uuid, primary key)
- `user_id` (uuid, FK -> auth.users, default auth.uid())
- `builder_id` (uuid, FK -> builder_definitions)
- `builder_version` (int) - version of builder definition used
- `status` (enum builder_run_status) - draft, ready_for_generation, generating, completed, failed, cancelled
- `answers` (jsonb) - saved customer answers keyed by question id
- `current_step` (int, default 0) - current question step index
- `started_at` (timestamptz, default now())
- `last_saved_at` (timestamptz) - last autosave timestamp
- `completed_at` (timestamptz) - when generation completed
- `token_price` (int) - token cost at time of generation
- `token_transaction_id` (uuid, nullable) - reference to token_ledger row
- `result` (jsonb, nullable) - generated plan output
- `failure_info` (text, nullable) - error details if generation failed

5. New Enums
- `builder_status` - draft, published, paused, archived
- `builder_run_status` - draft, ready_for_generation, generating, completed, failed, cancelled

6. Security
- RLS enabled on both new tables
- `builder_definitions`: SELECT is public (anyone can browse the catalogue),
  but INSERT/UPDATE/DELETE is restricted to authenticated admins (checked via service role in edge functions)
- `builder_runs`: full owner-scoped CRUD - customers can only see/modify their own runs
- `builder_runs` user_id defaults to auth.uid() so inserts work without client passing the value

7. Important Notes
- Builder definitions are stored in the database (not hard-coded in JS) so admins can manage them
- The `questions` jsonb column contains the full guided questionnaire schema
- Token transactions reference builder_runs via the `reference_id` column in token_ledger
- The `builder_version` column on runs ensures reproducibility even if the builder definition changes
- Only published builders appear in the customer catalogue
*/

-- Create enums
DO $$ BEGIN
  CREATE TYPE builder_status AS ENUM ('draft', 'published', 'paused', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE builder_run_status AS ENUM ('draft', 'ready_for_generation', 'generating', 'completed', 'failed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Builder definitions table
CREATE TABLE IF NOT EXISTS builder_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_key text UNIQUE NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL DEFAULT 'Travel',
  icon text NOT NULL DEFAULT '📋',
  short_description text NOT NULL,
  creates_description text NOT NULL,
  estimated_minutes int NOT NULL DEFAULT 10,
  token_cost int NOT NULL DEFAULT 5,
  min_plan subscription_plan NOT NULL DEFAULT 'membership',
  trial_eligible boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  status builder_status NOT NULL DEFAULT 'draft',
  display_order int NOT NULL DEFAULT 0,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  output_instructions text NOT NULL DEFAULT '',
  version int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE builder_definitions ENABLE ROW LEVEL SECURITY;

-- Published builders are visible to everyone (including anon for catalogue browsing)
DROP POLICY IF EXISTS "select_published_builders" ON builder_definitions;
CREATE POLICY "select_published_builders"
ON builder_definitions FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Only service role can insert/update/delete (admin management via edge functions)
-- No INSERT/UPDATE/DELETE policies for authenticated/anon means they can't modify

-- Builder runs table
CREATE TABLE IF NOT EXISTS builder_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  builder_id uuid NOT NULL REFERENCES builder_definitions(id) ON DELETE CASCADE,
  builder_version int NOT NULL DEFAULT 1,
  status builder_run_status NOT NULL DEFAULT 'draft',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  current_step int NOT NULL DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  last_saved_at timestamptz,
  completed_at timestamptz,
  token_price int NOT NULL DEFAULT 0,
  token_transaction_id uuid,
  result jsonb,
  failure_info text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE builder_runs ENABLE ROW LEVEL SECURITY;

-- Owner-scoped CRUD for builder runs
DROP POLICY IF EXISTS "select_own_runs" ON builder_runs;
CREATE POLICY "select_own_runs"
ON builder_runs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_runs" ON builder_runs;
CREATE POLICY "insert_own_runs"
ON builder_runs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_runs" ON builder_runs;
CREATE POLICY "update_own_runs"
ON builder_runs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_runs" ON builder_runs;
CREATE POLICY "delete_own_runs"
ON builder_runs FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_builder_definitions_status ON builder_definitions(status);
CREATE INDEX IF NOT EXISTS idx_builder_definitions_category ON builder_definitions(category);
CREATE INDEX IF NOT EXISTS idx_builder_definitions_featured ON builder_definitions(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_builder_runs_user_id ON builder_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_builder_runs_builder_id ON builder_runs(builder_id);
CREATE INDEX IF NOT EXISTS idx_builder_runs_status ON builder_runs(status);

-- Add builder_run_id reference to token_ledger (optional, for tracking)
-- The existing reference_id text column can store the run ID as a string
