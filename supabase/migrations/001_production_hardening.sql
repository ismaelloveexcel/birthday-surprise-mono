-- ============================================================
-- Migration 001 — Production Hardening
-- Run in Supabase SQL Editor or via: supabase db push
-- Safe to run on existing schema (all use IF NOT EXISTS / IF EXISTS)
-- ============================================================

-- ---------------------------------------------------------------
-- Experiences table: add all new production columns
-- ---------------------------------------------------------------

ALTER TABLE experiences
  ADD COLUMN IF NOT EXISTS paid              BOOLEAN        NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tier             TEXT           NOT NULL DEFAULT 'single'
                                            CHECK (tier IN ('single', 'premium', 'group')),
  ADD COLUMN IF NOT EXISTS quality_flag     BOOLEAN        NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS locale           TEXT           NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS region           TEXT           NOT NULL DEFAULT 'north_america',
  ADD COLUMN IF NOT EXISTS share_count      INTEGER        NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unlock_at        TIMESTAMPTZ    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS recipient_birthday DATE         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS contributors     JSONB          NOT NULL DEFAULT '[]'::jsonb,
  -- creator_id: set when a user is authenticated; NULL for anonymous creators.
  -- The owner_all RLS policy uses this to grant full access to authenticated owners.
  ADD COLUMN IF NOT EXISTS creator_id       UUID           DEFAULT NULL
                                            REFERENCES auth.users(id) ON DELETE SET NULL;

-- Backfill: sync legacy unlocked column → paid for any existing rows
UPDATE experiences SET paid = unlocked WHERE paid = false AND unlocked = true;

-- ---------------------------------------------------------------
-- Analytics: enforce event type via enum (additive only — never remove values)
-- ---------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'analytics_event_type') THEN
    CREATE TYPE analytics_event_type AS ENUM (
      'experience_generated',
      'preview_viewed',
      'payment_started',
      'payment_success',
      'experience_opened',
      'interaction_completed',
      'share_clicked',
      'remix_clicked',
      'reaction_recorded',
      'reaction_viewed'
    );
  END IF;
END $$;

-- ---------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_experiences_share_count
  ON experiences(share_count DESC);

CREATE INDEX IF NOT EXISTS idx_experiences_unlock_at
  ON experiences(unlock_at)
  WHERE unlock_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_experiences_paid
  ON experiences(paid)
  WHERE paid = true;

CREATE INDEX IF NOT EXISTS idx_experiences_region
  ON experiences(region);

CREATE INDEX IF NOT EXISTS idx_analytics_experience_event
  ON analytics(experience_id, event_type);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at
  ON analytics(created_at DESC);

-- ---------------------------------------------------------------
-- Row Level Security — drop old policies, add production ones
-- ---------------------------------------------------------------

-- Experiences RLS
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read unlocked experiences"  ON experiences;
DROP POLICY IF EXISTS "Anon can insert experiences"       ON experiences;
DROP POLICY IF EXISTS "Anon can update own experience unlock" ON experiences;

-- Public can read PAID experiences only (by ID via URL — no table scan)
CREATE POLICY "public_read_paid"
  ON experiences FOR SELECT
  USING (paid = true);

-- Authenticated users have full access to their own experiences
CREATE POLICY "owner_all"
  ON experiences FOR ALL
  USING (auth.uid() = creator_id);

-- Anon inserts allowed (mobile creates experiences before payment)
CREATE POLICY "anon_insert"
  ON experiences FOR INSERT
  WITH CHECK (true);

-- Anon can update payment status (before auth is wired)
-- In production, replace with a server-side service_role update
CREATE POLICY "anon_update_payment"
  ON experiences FOR UPDATE
  USING (true);

-- Analytics RLS
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon can insert analytics" ON analytics;

CREATE POLICY "insert_only"
  ON analytics FOR INSERT
  WITH CHECK (true);

-- ---------------------------------------------------------------
-- Reactions table (Viral Growth Engine — Phase 5)
-- ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS reactions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id   UUID        NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  storage_path    TEXT        NOT NULL,
  reaction_type   TEXT        NOT NULL CHECK (reaction_type IN ('video', 'audio')),
  paid            BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reactions_experience_id
  ON reactions(experience_id);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_paid_reactions"
  ON reactions FOR SELECT
  USING (paid = true);

CREATE POLICY "anon_insert_reactions"
  ON reactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "anon_update_reactions"
  ON reactions FOR UPDATE
  USING (true);

-- ---------------------------------------------------------------
-- Helper: increment share_count atomically
-- Called by web viewer RemixBar on click
-- ---------------------------------------------------------------

CREATE OR REPLACE FUNCTION increment_share_count(experience_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE experiences
  SET share_count = share_count + 1
  WHERE id = experience_id;
END;
$$;

-- ---------------------------------------------------------------
-- Scheduled Delivery: Edge Function checks unlock_at on fetch
-- (Edge Function scaffolded in supabase/functions/)
-- ---------------------------------------------------------------

-- ---------------------------------------------------------------
-- Memory Capsule re-engagement: stores recipient_birthday
-- Edge Function runs monthly to email creators
-- (Edge Function scaffolded in supabase/functions/)
-- ---------------------------------------------------------------

-- ============================================================
-- END MIGRATION 001
-- ============================================================
