/*
# Auto-claim Trial on Signup

1. Purpose
Creates a database trigger that automatically claims the 14-day free trial
and grants 30 Builder Usage Tokens when a new user registers.

2. Changes
- Creates a `handle_new_user()` function that:
  - Inserts a profile row for the new user
  - Claims the trial (inserts into trial_claims)
  - Grants 30 trial tokens (inserts into token_ledger)
- Creates a trigger on `auth.users` that fires `handle_new_user()` after insert

3. Security
- The function runs with SECURITY DEFINER so it can insert into all tables
  regardless of RLS policies (needed because the trigger fires before the
  user has a session)
- The trigger fires AFTER INSERT on auth.users

4. Important Notes
- This ensures every new user automatically gets their trial tokens
- The trial_claims table has a unique constraint on user_id preventing duplicates
- The token_ledger row records the initial balance of 30
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  -- Claim trial (one per user, enforced by unique constraint)
  INSERT INTO trial_claims (user_id, tokens_granted, trial_start, trial_end)
  VALUES (NEW.id, 30, now(), now() + interval '14 days')
  ON CONFLICT (user_id) DO NOTHING;

  -- Grant trial tokens
  INSERT INTO token_ledger (user_id, amount, balance_after, transaction_type, description, reference_id)
  VALUES (NEW.id, 30, 30, 'trial_grant', '14-day free trial tokens', 'trial_claim')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Create the trigger (drop if exists first for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
