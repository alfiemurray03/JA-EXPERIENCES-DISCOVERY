ALTER TABLE profiles ADD COLUMN suspended_at TEXT;
ALTER TABLE profiles ADD COLUMN suspended_by TEXT;
ALTER TABLE profiles ADD COLUMN suspension_reason TEXT;
ALTER TABLE profiles ADD COLUMN reactivated_at TEXT;
ALTER TABLE profiles ADD COLUMN reactivated_by TEXT;
ALTER TABLE profiles ADD COLUMN reactivation_reason TEXT;
