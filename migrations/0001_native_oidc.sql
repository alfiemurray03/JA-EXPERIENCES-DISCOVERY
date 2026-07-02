CREATE TABLE IF NOT EXISTS oidc_login_transactions (
  state_hash TEXT PRIMARY KEY,
  realm TEXT NOT NULL CHECK (realm IN ('admin', 'customer')),
  nonce TEXT NOT NULL,
  code_verifier TEXT NOT NULL,
  return_to TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL,
  used_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_oidc_login_transactions_expiry
  ON oidc_login_transactions (expires_at);

CREATE TABLE IF NOT EXISTS admin_oidc_sessions (
  token_hash TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  tenant_id TEXT,
  email TEXT NOT NULL,
  name TEXT,
  refresh_token_encrypted TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  idle_expires_at TEXT NOT NULL,
  absolute_expires_at TEXT NOT NULL,
  refresh_after TEXT NOT NULL,
  revoked_at TEXT,
  ip_hash TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_admin_oidc_sessions_email
  ON admin_oidc_sessions (email, revoked_at, absolute_expires_at);

CREATE TABLE IF NOT EXISTS customer_oidc_sessions (
  token_hash TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  tenant_id TEXT,
  email TEXT NOT NULL,
  name TEXT,
  refresh_token_encrypted TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  idle_expires_at TEXT NOT NULL,
  absolute_expires_at TEXT NOT NULL,
  refresh_after TEXT NOT NULL,
  revoked_at TEXT,
  ip_hash TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_customer_oidc_sessions_email
  ON customer_oidc_sessions (email, revoked_at, absolute_expires_at);
