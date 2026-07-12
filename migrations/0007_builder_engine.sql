-- Migration: Safe Schema Extension for Reusable Builder Engine and Draft Support

-- 1. Extend experience_builders safely with default values to preserve existing rows
ALTER TABLE experience_builders ADD COLUMN slug TEXT;
ALTER TABLE experience_builders ADD COLUMN icon TEXT DEFAULT '📋';
ALTER TABLE experience_builders ADD COLUMN creates_description TEXT;
ALTER TABLE experience_builders ADD COLUMN estimated_minutes INTEGER DEFAULT 10;
ALTER TABLE experience_builders ADD COLUMN trial_eligible INTEGER DEFAULT 1; -- 1 = true, 0 = false
ALTER TABLE experience_builders ADD COLUMN featured INTEGER DEFAULT 0; -- 1 = true, 0 = false
ALTER TABLE experience_builders ADD COLUMN display_order INTEGER DEFAULT 0;
ALTER TABLE experience_builders ADD COLUMN output_instructions TEXT DEFAULT '';
ALTER TABLE experience_builders ADD COLUMN version INTEGER DEFAULT 1;

-- 2. Create the builder_runs table to support draft persistence/resume
CREATE TABLE IF NOT EXISTS builder_runs (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  builder_id TEXT NOT NULL REFERENCES experience_builders(id) ON DELETE CASCADE,
  builder_version INTEGER NOT NULL DEFAULT 1,
  answers TEXT NOT NULL DEFAULT '{}',
  current_step INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_saved_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_builder_runs_email ON builder_runs(email, status);
