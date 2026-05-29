-- Sterling Tax Expert CMS — Enquiries Table
-- Run with: wrangler d1 execute sterling-cms --file=migrations/0003_enquiries.sql
-- Local:    wrangler d1 execute sterling-cms --local --file=migrations/0003_enquiries.sql

CREATE TABLE IF NOT EXISTS enquiries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  phone      TEXT,
  service    TEXT    NOT NULL,
  message    TEXT,
  ip         TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  read       INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_read    ON enquiries(read, created_at DESC);
