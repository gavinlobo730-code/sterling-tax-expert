-- Sterling Tax Expert CMS — Initial Schema
-- Run with: wrangler d1 execute sterling-cms --file=migrations/0001_initial.sql
-- For local dev: wrangler d1 execute sterling-cms --local --file=migrations/0001_initial.sql

-- ── CATEGORIES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  slug        TEXT    NOT NULL UNIQUE,
  colour      TEXT    NOT NULL DEFAULT '#6366F1',
  description TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ── ARTICLES ──────────────────────────────────────────────────────────────────
-- status: 'draft' | 'published' | 'scheduled' | 'archived'
-- featured_image: R2 object key, e.g. "images/abc123.webp"
-- scheduled_at: Unix timestamp; NULL unless status = 'scheduled'
-- published_at: Unix timestamp; set once when first published, never overwritten
CREATE TABLE IF NOT EXISTS articles (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  title           TEXT    NOT NULL,
  slug            TEXT    NOT NULL UNIQUE,
  content         TEXT    NOT NULL DEFAULT '',
  excerpt         TEXT    NOT NULL DEFAULT '',
  featured_image  TEXT,
  -- D1 does not enforce FK constraints or ON DELETE cascades at the DB level.
  -- Phase 3 Worker code must handle category deletion manually (set category_id = NULL).
  category_id     INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  status          TEXT    NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','published','scheduled','archived')),
  featured        INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0,1)),
  meta_title      TEXT    NOT NULL DEFAULT '',
  meta_desc       TEXT    NOT NULL DEFAULT '',
  scheduled_at    INTEGER,
  published_at    INTEGER,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Index for the public API's most common query pattern
CREATE INDEX IF NOT EXISTS idx_articles_status_published
  ON articles(status, published_at DESC);

-- Index for category listing pages
CREATE INDEX IF NOT EXISTS idx_articles_category
  ON articles(category_id, status);

-- ── REDIRECTS ─────────────────────────────────────────────────────────────────
-- Created automatically when an article slug changes.
-- from_path and to_path are full paths, e.g. /insights/old-slug
CREATE TABLE IF NOT EXISTS redirects (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  from_path  TEXT    NOT NULL UNIQUE,
  to_path    TEXT    NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_redirects_from
  ON redirects(from_path);

-- ── SESSIONS ──────────────────────────────────────────────────────────────────
-- id: 32-byte hex token, sent as HttpOnly cookie
-- expires_at: created_at + 14400 (4 hours)
CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT    PRIMARY KEY,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at INTEGER NOT NULL,
  ip         TEXT
);

-- Expired sessions are cleaned up by the daily Cron Trigger
CREATE INDEX IF NOT EXISTS idx_sessions_expires
  ON sessions(expires_at);

-- ── ADMIN ─────────────────────────────────────────────────────────────────────
-- Single row, id always = 1.
-- password_hash: bcrypt hash, cost factor 12.
-- Set with: wrangler d1 execute sterling-cms --command "
--   UPDATE admin SET password_hash = '<hash>' WHERE id = 1;"
-- Or via the seed script: node scripts/hash-password.js
CREATE TABLE IF NOT EXISTS admin (
  id               INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  password_hash    TEXT    NOT NULL DEFAULT 'NOT_SET',
  failed_attempts  INTEGER NOT NULL DEFAULT 0,
  locked_until     INTEGER NOT NULL DEFAULT 0
);

-- Insert the single admin row (safe to run multiple times)
INSERT OR IGNORE INTO admin (id, password_hash) VALUES (1, 'NOT_SET');

-- ── SEED CATEGORIES ───────────────────────────────────────────────────────────
-- Pre-populate the six categories from the mockup.
-- Delete or rename these to match what you want.
INSERT OR IGNORE INTO categories (name, slug, colour, description) VALUES
  ('Income Tax',        'income-tax',        '#6366F1', 'Articles covering income tax rates, allowances and planning for 2026/27.'),
  ('Payroll',           'payroll',           '#14B8A6', 'Payroll guides for employers: NMW, NLW, RTI, holiday pay and more.'),
  ('Self Assessment',   'self-assessment',   '#F59E0B', 'Self Assessment filing, deadlines, payments on account and HMRC penalties.'),
  ('Corporation Tax',   'corporation-tax',   '#EF4444', 'Corporation Tax rates, marginal relief and filing obligations for limited companies.'),
  ('VAT',               'vat',               '#8B5CF6', 'VAT registration, Flat Rate Scheme, Making Tax Digital and returns.'),
  ('National Insurance','national-insurance','#10B981', 'Class 1, 2 and 4 NI contributions for employees, employers and the self-employed.');
