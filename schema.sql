-- Sterling Tax Expert — D1 Schema
-- Run once via: Cloudflare Dashboard → D1 → sterling_cms → Console

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  body TEXT DEFAULT '',
  excerpt TEXT DEFAULT '',
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft','published','scheduled')),
  author TEXT DEFAULT 'Sterling Tax Expert',
  category TEXT DEFAULT 'Tax',
  tags TEXT DEFAULT '[]',
  scheduled_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Clean up expired sessions (run periodically via cron or manually)
-- DELETE FROM sessions WHERE expires_at < datetime('now');
