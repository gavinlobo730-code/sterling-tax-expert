-- Sterling Tax Expert CMS — Phase 5 Schema Additions
-- Run AFTER 0001_initial.sql:
--   wrangler d1 execute sterling-cms --local --file=migrations/0002_phase5.sql
--   wrangler d1 execute sterling-cms         --file=migrations/0002_phase5.sql   (production)

-- ── ARTICLES: reading time ────────────────────────────────────────────────────
-- Computed and stored on every save so the public API can return it without
-- re-parsing the full content on every request.
ALTER TABLE articles ADD COLUMN reading_time INTEGER NOT NULL DEFAULT 1;

-- ── RATE LIMITS ───────────────────────────────────────────────────────────────
-- IP-based rate limiting for the login endpoint.
-- Separate from per-account lockout in the admin table.
-- key: 'login:<ip>', window is 15 minutes, max 10 attempts per window.
CREATE TABLE IF NOT EXISTS rate_limits (
  key           TEXT    PRIMARY KEY,
  attempts      INTEGER NOT NULL DEFAULT 1,
  window_start  INTEGER NOT NULL,
  blocked_until INTEGER NOT NULL DEFAULT 0
);
