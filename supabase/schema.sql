-- ============================================================
-- Birthday Surprise Experience — Supabase Schema
-- Run this in the Supabase SQL editor for your project.
-- ============================================================

-- Experiences table
CREATE TABLE IF NOT EXISTS experiences (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  output        JSONB NOT NULL,
  unlocked      BOOLEAN NOT NULL DEFAULT FALSE,
  recipient_name TEXT NOT NULL,
  relationship  TEXT NOT NULL,
  vibe          TEXT NOT NULL
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  event_type    TEXT NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata      JSONB
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_experiences_created_at ON experiences(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_experience_id ON analytics(experience_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type    ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at    ON analytics(created_at DESC);

-- ============================================================
-- Row Level Security (enable after confirming anon reads work)
-- ============================================================

-- Allow anyone to read unlocked experiences (public share pages)
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read unlocked experiences"
  ON experiences FOR SELECT
  USING (unlocked = TRUE);

-- Allow service role to do everything (for backend operations)
-- Note: use service_role key only on the server/edge, never in the client.

-- Allow anon inserts for new experiences and analytics (mobile creates them)
CREATE POLICY "Anon can insert experiences"
  ON experiences FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Anon can update own experience unlock"
  ON experiences FOR UPDATE
  USING (TRUE);

ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon can insert analytics"
  ON analytics FOR INSERT
  WITH CHECK (TRUE);
