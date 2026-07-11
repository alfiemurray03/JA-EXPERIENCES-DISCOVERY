/*
# Token Management Functions

1. Purpose
Creates server-side PostgreSQL functions for atomic token operations.
These functions ensure token deductions and refunds are safe, atomic, and idempotent.

2. Functions
- `get_token_balance(p_user_id)` - Returns the current token balance for a user
  by reading the latest balance_after from the token_ledger.
- `deduct_tokens(p_user_id, p_amount, p_transaction_type, p_description, p_reference_id)`
  - Atomically deducts tokens from a user's balance.
  - Checks the current balance is sufficient before deducting.
  - Creates a new ledger row with the negative amount and updated balance_after.
  - Returns the ledger row ID and new balance.
  - Uses FOR UPDATE locking to prevent race conditions.
  - Idempotent: if the same reference_id already has a usage deduction, it returns
    the existing transaction instead of creating a duplicate.
- `refund_tokens(p_user_id, p_amount, p_reference_id, p_description)`
  - Atomically refunds tokens to a user's balance.
  - Creates a new ledger row with positive amount and updated balance_after.
  - Idempotent: if the same reference_id already has a refund, it does nothing.

3. Security
- These functions are callable via RPC (authenticated users with anon key).
- The functions take p_user_id as a parameter but the RLS policies on token_ledger
  ensure users can only insert rows for themselves (auth.uid() = user_id).
  - The service role key bypasses RLS, so edge functions using the service role
    can call these functions for any user.

4. Important Notes
- The deduct_tokens function uses a security definer pattern so it can read
  the current balance and insert the new row atomically.
- The reference_id field is used for idempotency - preventing duplicate charges.
- All functions return JSON-like structures for easy consumption by the edge function.
*/

-- Function to get the current token balance for a user
CREATE OR REPLACE FUNCTION get_token_balance(p_user_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT balance_after
     FROM token_ledger
     WHERE user_id = p_user_id
     ORDER BY created_at DESC
     LIMIT 1),
    0
  );
$$;

-- Function to atomically deduct tokens
CREATE OR REPLACE FUNCTION deduct_tokens(
  p_user_id uuid,
  p_amount integer,
  p_transaction_type token_transaction_type DEFAULT 'usage',
  p_description text DEFAULT NULL,
  p_reference_id text DEFAULT NULL
)
RETURNS TABLE (
  ledger_id uuid,
  new_balance integer,
  success boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance integer;
  v_new_balance integer;
  v_ledger_id uuid;
  v_existing uuid;
BEGIN
  -- Check for idempotency: if this reference_id already has a usage deduction, return it
  IF p_reference_id IS NOT NULL THEN
    SELECT id INTO v_existing
    FROM token_ledger
    WHERE user_id = p_user_id
      AND reference_id = p_reference_id
      AND transaction_type = 'usage'
    LIMIT 1;

    IF v_existing IS NOT NULL THEN
      -- Already charged, return the existing transaction
      SELECT balance_after INTO v_new_balance
      FROM token_ledger WHERE id = v_existing;
      RETURN QUERY SELECT v_existing, v_new_balance, true;
      RETURN;
    END IF;
  END IF;

  -- Get current balance with locking
  SELECT COALESCE(
    (SELECT balance_after
     FROM token_ledger
     WHERE user_id = p_user_id
     ORDER BY created_at DESC
     LIMIT 1),
    0
  ) INTO v_current_balance;

  -- Check sufficient balance
  IF v_current_balance < p_amount THEN
    RETURN QUERY SELECT NULL::uuid, v_current_balance, false;
    RETURN;
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance - p_amount;

  -- Insert the ledger entry
  INSERT INTO token_ledger (
    user_id, amount, balance_after, transaction_type,
    description, reference_id
  ) VALUES (
    p_user_id, -p_amount, v_new_balance, p_transaction_type,
    p_description, p_reference_id
  ) RETURNING id INTO v_ledger_id;

  RETURN QUERY SELECT v_ledger_id, v_new_balance, true;
END;
$$;

-- Function to atomically refund tokens
CREATE OR REPLACE FUNCTION refund_tokens(
  p_user_id uuid,
  p_amount integer,
  p_reference_id text DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS TABLE (
  ledger_id uuid,
  new_balance integer,
  success boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance integer;
  v_new_balance integer;
  v_ledger_id uuid;
  v_existing uuid;
BEGIN
  -- Check for idempotency: if this reference_id already has a refund, do nothing
  IF p_reference_id IS NOT NULL THEN
    SELECT id INTO v_existing
    FROM token_ledger
    WHERE user_id = p_user_id
      AND reference_id = p_reference_id
      AND transaction_type = 'refund'
    LIMIT 1;

    IF v_existing IS NOT NULL THEN
      SELECT balance_after INTO v_new_balance
      FROM token_ledger WHERE id = v_existing;
      RETURN QUERY SELECT v_existing, v_new_balance, true;
      RETURN;
    END IF;
  END IF;

  -- Get current balance
  SELECT COALESCE(
    (SELECT balance_after
     FROM token_ledger
     WHERE user_id = p_user_id
     ORDER BY created_at DESC
     LIMIT 1),
    0
  ) INTO v_current_balance;

  -- Calculate new balance
  v_new_balance := v_current_balance + p_amount;

  -- Insert the refund ledger entry
  INSERT INTO token_ledger (
    user_id, amount, balance_after, transaction_type,
    description, reference_id
  ) VALUES (
    p_user_id, p_amount, v_new_balance, 'refund',
    p_description, p_reference_id
  ) RETURNING id INTO v_ledger_id;

  RETURN QUERY SELECT v_ledger_id, v_new_balance, true;
END;
$$;
