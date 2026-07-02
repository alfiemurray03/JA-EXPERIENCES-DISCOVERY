CREATE TABLE IF NOT EXISTS customer_saved_items (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  item_type TEXT NOT NULL,
  item_key TEXT NOT NULL,
  item_title TEXT NOT NULL,
  item_url TEXT,
  source_page TEXT,
  category TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email, item_type, item_key)
);

CREATE INDEX IF NOT EXISTS idx_customer_saved_items_email_updated
  ON customer_saved_items (email, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_saved_items_email_type
  ON customer_saved_items (email, item_type, created_at DESC);
