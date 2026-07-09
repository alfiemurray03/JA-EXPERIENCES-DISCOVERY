/*
# JA Experiences SaaS Platform Schema

1. Purpose
This migration creates the core database schema for the JA Experiences & Discovery SaaS platform. It establishes tables for user profiles, subscriptions, builder credits/token management, saved outputs, and discovery boards.

2. New Tables
- `profiles` - Extended user data linked to Supabase auth.users
- `subscriptions` - Customer subscription records (Membership, Plus, Family plans)
- `token_ledger` - Builder Credits transaction history
- `saved_outputs` - User-saved builder outputs/plans
- `discovery_boards` - User discovery boards for organizing ideas
- `trial_claims` - Trial activation tracking (one per user)

3. Security
- Row Level Security (RLS) enabled on all tables
- Owner-scoped policies using auth.uid() for all user data
- Subscription and token tables only accessible by their owner
- Cascade deletes on foreign keys for data cleanup

4. Notes
- user_id columns default to auth.uid() so inserts work without client passing the value
- Token ledger tracks all credit additions and deductions
- Trial claims are limited to one per user account
- All timestamps use timestamptz with defaults
*/

-- User profiles extending auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(email)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Subscription plans enumeration
CREATE TYPE subscription_plan AS ENUM ('membership', 'plus', 'family');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'expired');

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_subscription" ON subscriptions;
CREATE POLICY "select_own_subscription" ON subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_subscription" ON subscriptions;
CREATE POLICY "insert_own_subscription" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_subscription" ON subscriptions;
CREATE POLICY "update_own_subscription" ON subscriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Token ledger for Builder Credits management
CREATE TYPE token_transaction_type AS ENUM ('trial_grant', 'subscription_grant', 'purchase', 'usage', 'refund', 'admin_adjustment');

CREATE TABLE IF NOT EXISTS token_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  balance_after integer NOT NULL,
  transaction_type token_transaction_type NOT NULL,
  description text,
  reference_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_token_ledger_user_id ON token_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_token_ledger_created_at ON token_ledger(created_at DESC);

ALTER TABLE token_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tokens" ON token_ledger;
CREATE POLICY "select_own_tokens" ON token_ledger FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tokens" ON token_ledger;
CREATE POLICY "insert_own_tokens" ON token_ledger FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Trial claims (one per user)
CREATE TABLE IF NOT EXISTS trial_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tokens_granted integer NOT NULL DEFAULT 30,
  trial_start timestamptz DEFAULT now(),
  trial_end timestamptz DEFAULT (now() + interval '14 days'),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE trial_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_trial" ON trial_claims;
CREATE POLICY "select_own_trial" ON trial_claims FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_trial" ON trial_claims;
CREATE POLICY "insert_own_trial" ON trial_claims FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Saved outputs from builders
CREATE TABLE IF NOT EXISTS saved_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  builder_id text NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL,
  tokens_used integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_outputs_user_id ON saved_outputs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_outputs_builder_id ON saved_outputs(builder_id);

ALTER TABLE saved_outputs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_outputs" ON saved_outputs;
CREATE POLICY "select_own_outputs" ON saved_outputs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_outputs" ON saved_outputs;
CREATE POLICY "insert_own_outputs" ON saved_outputs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_outputs" ON saved_outputs;
CREATE POLICY "update_own_outputs" ON saved_outputs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_outputs" ON saved_outputs;
CREATE POLICY "delete_own_outputs" ON saved_outputs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Discovery boards
CREATE TABLE IF NOT EXISTS discovery_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discovery_boards_user_id ON discovery_boards(user_id);

ALTER TABLE discovery_boards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_boards" ON discovery_boards;
CREATE POLICY "select_own_boards" ON discovery_boards FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_boards" ON discovery_boards;
CREATE POLICY "insert_own_boards" ON discovery_boards FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_boards" ON discovery_boards;
CREATE POLICY "update_own_boards" ON discovery_boards FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_boards" ON discovery_boards;
CREATE POLICY "delete_own_boards" ON discovery_boards FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Helper function to get current token balance
CREATE OR REPLACE FUNCTION get_token_balance(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  balance integer;
BEGIN
  SELECT COALESCE(
    (SELECT balance_after FROM token_ledger WHERE user_id = p_user_id ORDER BY created_at DESC LIMIT 1),
    0
  ) INTO balance;
  RETURN balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to add tokens
CREATE OR REPLACE FUNCTION add_tokens(
  p_user_id uuid,
  p_amount integer,
  p_transaction_type token_transaction_type,
  p_description text DEFAULT NULL,
  p_reference_id text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  current_balance integer;
  new_balance integer;
  new_ledger_id uuid;
BEGIN
  current_balance := get_token_balance(p_user_id);
  new_balance := current_balance + p_amount;
  
  INSERT INTO token_ledger (user_id, amount, balance_after, transaction_type, description, reference_id)
  VALUES (p_user_id, p_amount, new_balance, p_transaction_type, p_description, p_reference_id)
  RETURNING id INTO new_ledger_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'ledger_id', new_ledger_id,
    'previous_balance', current_balance,
    'amount', p_amount,
    'new_balance', new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to deduct tokens
CREATE OR REPLACE FUNCTION deduct_tokens(
  p_user_id uuid,
  p_amount integer,
  p_description text DEFAULT NULL,
  p_reference_id text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  current_balance integer;
  new_balance integer;
  new_ledger_id uuid;
BEGIN
  current_balance := get_token_balance(p_user_id);
  
  IF current_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient token balance',
      'current_balance', current_balance,
      'requested', p_amount
    );
  END IF;
  
  new_balance := current_balance - p_amount;
  
  INSERT INTO token_ledger (user_id, amount, balance_after, transaction_type, description, reference_id)
  VALUES (p_user_id, -p_amount, new_balance, 'usage', p_description, p_reference_id)
  RETURNING id INTO new_ledger_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'ledger_id', new_ledger_id,
    'previous_balance', current_balance,
    'deducted', p_amount,
    'new_balance', new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update profile updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_saved_outputs_updated_at ON saved_outputs;
CREATE TRIGGER update_saved_outputs_updated_at
  BEFORE UPDATE ON saved_outputs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_discovery_boards_updated_at ON discovery_boards;
CREATE TRIGGER update_discovery_boards_updated_at
  BEFORE UPDATE ON discovery_boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
