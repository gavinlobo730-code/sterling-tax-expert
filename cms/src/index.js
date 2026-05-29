/**
 * Sterling Tax Expert — CMS Worker
 *
 * Phase 1: Infrastructure skeleton + health check
 * Phase 2: Authentication — login, logout, session handling
 * Phase 3: CMS content management — articles, categories, admin UI
 *
 * Phase 4 will add: public API, redirects, backup/restore, cron handler
 */

import adminHtml from '../admin/index.html';

import {
  requireAuth,
  verifyPassword,
  createSession,
  deleteSession,
  getSessionToken,
  buildSessionCookie,
  clearSessionCookie,
} from './auth.js';

import {
  getDashboard,
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
  unpublishArticle,
  previewArticle,
} from './routes/articles.js';

import {
  serveMedia,
  uploadMedia,
  listMedia,
  deleteMedia,
} from './routes/media.js';

import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from './routes/categories.js';

import {
  publicListArticles,
  publicGetArticle,
  publicListCategories,
  publicSitemap,
} from './routes/public.js';

import { submitEnquiry } from './routes/enquiries.js';

// ── ENTRY POINT ───────────────────────────────────────────────────────────────

export default {

  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return handlePreflight(request, env);

    const url    = new URL(request.url);
    const path   = url.pathname;
    const method = request.method;

    // ── Admin panel HTML ────────────────────────────────────────────────────
    // Served at GET /admin — the static HTML SPA that calls the API.
    if ((path === '/admin' || path === '/admin/') && method === 'GET') {
      return new Response(adminHtml, {
        headers: {
          'Content-Type':  'text/html; charset=utf-8',
          'X-Robots-Tag':  'noindex, nofollow',
          'X-Frame-Options': 'DENY',
          'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https://sterling-tax.co.uk",
            "connect-src 'self' https://sterling-tax.co.uk",
            "font-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
          ].join('; '),
        },
      });
    }

    // ── Public media proxy ──────────────────────────────────────────────────
    // Serves R2 objects for <img src="/media/..."> on the public site.
    if (path.startsWith('/media/') && method === 'GET') {
      return serveMedia(request, env, path.slice('/media/'.length));
    }

    // ── Sitemap ─────────────────────────────────────────────────────────────
    if (path === '/sitemap.xml' && method === 'GET') {
      return publicSitemap(request, env);
    }

    // ── Public enquiry submission ───────────────────────────────────────────
    if (path === '/api/enquiry' && method === 'POST') {
      return wrap(await submitEnquiry(request, env), request, env);
    }

    // ── Public API ──────────────────────────────────────────────────────────
    if (path === '/api/articles'    && method === 'GET') return publicListArticles(request, env);
    if (path === '/api/categories'  && method === 'GET') return publicListCategories(request, env);

    {
      const m = path.match(/^\/api\/articles\/([^/]+)$/);
      if (m && method === 'GET') return publicGetArticle(request, env, decodeURIComponent(m[1]));
    }

    // ── Public diagnostic ───────────────────────────────────────────────────
    if (path === '/health' && method === 'GET') {
      return handleHealth(request, env);
    }

    // ── Auth endpoints (no session required) ────────────────────────────────
    if (path === '/api/admin/login'  && method === 'POST') return wrap(await handleLogin(request, env),  request, env);
    if (path === '/api/admin/logout' && method === 'POST') return wrap(await handleLogout(request, env), request, env);
    if (path === '/api/admin/ping'   && method === 'GET')  return wrap(await handlePing(request, env),   request, env);

    // ── Protected admin routes ──────────────────────────────────────────────
    if (path.startsWith('/api/admin/')) {
      const session = await requireAuth(request, env);
      if (!session) return wrap(json({ error: 'Unauthorised' }, 401), request, env);
      return wrap(await dispatchAdmin(path, method, request, env), request, env);
    }

    return json({ error: 'Not found' }, 404);
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleCron(event, env));
  },
};

// ── ADMIN ROUTER ──────────────────────────────────────────────────────────────

async function dispatchAdmin(path, method, request, env) {
  // ── Dashboard ─────────────────────────────────────────────────────────────
  if (path === '/api/admin/dashboard' && method === 'GET') {
    return getDashboard(env);
  }

  // ── Articles ──────────────────────────────────────────────────────────────
  if (path === '/api/admin/articles') {
    if (method === 'GET')  return listArticles(request, env);
    if (method === 'POST') return createArticle(request, env);
  }

  let m;

  // /api/admin/articles/:id
  m = path.match(/^\/api\/admin\/articles\/(\d+)$/);
  if (m) {
    const id = parseInt(m[1], 10);
    if (method === 'GET')    return getArticle(request, env, id);
    if (method === 'PUT')    return updateArticle(request, env, id);
    if (method === 'DELETE') return deleteArticle(request, env, id);
  }

  // /api/admin/articles/:id/publish
  m = path.match(/^\/api\/admin\/articles\/(\d+)\/publish$/);
  if (m && method === 'POST') return publishArticle(request, env, parseInt(m[1], 10));

  // /api/admin/articles/:id/unpublish
  m = path.match(/^\/api\/admin\/articles\/(\d+)\/unpublish$/);
  if (m && method === 'POST') return unpublishArticle(request, env, parseInt(m[1], 10));

  // /api/admin/articles/:id/preview
  m = path.match(/^\/api\/admin\/articles\/(\d+)\/preview$/);
  if (m && method === 'GET') return previewArticle(request, env, parseInt(m[1], 10));

  // ── Media ─────────────────────────────────────────────────────────────────
  if (path === '/api/admin/media') {
    if (method === 'GET')  return listMedia(request, env);
    if (method === 'POST') return uploadMedia(request, env);
  }

  // /api/admin/media/:encodedKey*
  m = path.match(/^\/api\/admin\/media\/(.+)$/);
  if (m && method === 'DELETE') return deleteMedia(request, env, decodeURIComponent(m[1]));

  // ── Categories ────────────────────────────────────────────────────────────
  if (path === '/api/admin/categories') {
    if (method === 'GET')  return listCategories(request, env);
    if (method === 'POST') return createCategory(request, env);
  }

  // /api/admin/categories/:id
  m = path.match(/^\/api\/admin\/categories\/(\d+)$/);
  if (m) {
    const id = parseInt(m[1], 10);
    if (method === 'PUT')    return updateCategory(request, env, id);
    if (method === 'DELETE') return deleteCategory(request, env, id);
  }

  return json({ error: 'Not found' }, 404);
}

// ── IP RATE LIMITER ───────────────────────────────────────────────────────────

/**
 * IP-level rate limit for the login endpoint.
 * Allows 10 attempts per 15-minute window before blocking for 30 minutes.
 * Uses the rate_limits D1 table (created in migration 0002_phase5.sql).
 * Silently skips (allows) if the table doesn't exist yet.
 */
async function checkIpRateLimit(db, ip) {
  if (!ip) return null;
  const key        = `login:${ip}`;
  const now        = Math.floor(Date.now() / 1000);
  const WINDOW     = 900;   // 15 min sliding window
  const MAX        = 10;    // attempts before block
  const BLOCK_SECS = 1800;  // 30 min block

  try {
    const row = await db
      .prepare('SELECT attempts, window_start, blocked_until FROM rate_limits WHERE key = ?')
      .bind(key)
      .first();

    if (row) {
      if (row.blocked_until > now) {
        return { blockedUntil: row.blocked_until };
      }
      const inWindow = (now - row.window_start) < WINDOW;
      if (inWindow && row.attempts >= MAX) {
        const bu = now + BLOCK_SECS;
        await db.prepare('UPDATE rate_limits SET blocked_until = ? WHERE key = ?').bind(bu, key).run();
        return { blockedUntil: bu };
      }
      if (inWindow) {
        await db.prepare('UPDATE rate_limits SET attempts = attempts + 1 WHERE key = ?').bind(key).run();
      } else {
        // New window
        await db.prepare('UPDATE rate_limits SET attempts = 1, window_start = ?, blocked_until = 0 WHERE key = ?')
          .bind(now, key).run();
      }
    } else {
      await db.prepare('INSERT INTO rate_limits (key, attempts, window_start, blocked_until) VALUES (?, 1, ?, 0)')
        .bind(key, now).run();
    }
    return null;
  } catch {
    // Table doesn't exist (migration not yet run) — fail open
    return null;
  }
}

// ── AUTH HANDLERS ─────────────────────────────────────────────────────────────

async function handleLogin(request, env) {
  const ct = request.headers.get('Content-Type') ?? '';
  if (!ct.includes('application/json')) return json({ error: 'Content-Type must be application/json' }, 400);

  // IP-based rate limiting (belt-and-braces on top of per-account lockout)
  const ip        = request.headers.get('CF-Connecting-IP') ?? null;
  const rateLimit = await checkIpRateLimit(env.DB, ip);
  if (rateLimit) {
    const retryIn = Math.max(0, rateLimit.blockedUntil - Math.floor(Date.now() / 1000));
    return json({ error: 'Too many requests. Try again later.' }, 429, { 'Retry-After': String(retryIn) });
  }

  let body;
  try   { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON body' }, 400); }

  const { password } = body ?? {};
  if (typeof password !== 'string' || !password) return json({ error: 'Invalid credentials' }, 401);

  const result = await verifyPassword(env.DB, password);

  if (result.error === 'locked') {
    const retryIn = Math.max(0, result.retryAfter - Math.floor(Date.now() / 1000));
    return json({ error: 'Account temporarily locked. Try again later.' }, 423, { 'Retry-After': String(retryIn) });
  }

  if (result.error === 'invalid') return json({ error: 'Invalid credentials' }, 401);

  const { token, expiresAt } = await createSession(env.DB, ip);

  return json({ ok: true }, 200, { 'Set-Cookie': buildSessionCookie(token, expiresAt) });
}

async function handleLogout(request, env) {
  const token = getSessionToken(request);
  if (token) await deleteSession(env.DB, token);
  return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie() });
}

async function handlePing(request, env) {
  const session = await requireAuth(request, env);
  if (!session) return json({ authenticated: false }, 401);
  return json({ authenticated: true, expiresAt: session.expires_at }, 200);
}

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────

async function handleHealth(request, env) {
  const checks = { worker: true, d1: false, r2: false };
  const errors  = [];

  try {
    const row = await env.DB
      .prepare('SELECT COUNT(*) AS count FROM sqlite_master WHERE type = ? AND name = ?')
      .bind('table', 'articles')
      .first();
    checks.d1 = row?.count === 1;
    if (!checks.d1) errors.push('D1: articles table not found — run migrations');
  } catch (e) { errors.push(`D1: ${e.message}`); }

  try {
    await env.ASSETS.head('health-check-probe');
    checks.r2 = true;
  } catch (e) { errors.push(`R2: ${e.message}`); }

  const allOk = checks.worker && checks.d1 && checks.r2;
  return json({ status: allOk ? 'ok' : 'degraded', phase: 4, checks, errors: errors.length ? errors : undefined, ts: new Date().toISOString() }, allOk ? 200 : 503);
}

// ── CRON STUB ─────────────────────────────────────────────────────────────────

async function handleCron(event, env) {
  const now = Math.floor(Date.now() / 1000);
  console.log('[cron] trigger fired at', new Date().toISOString());

  // ── Session cleanup ─────────────────────────────────────────────────────
  try {
    const del = await env.DB
      .prepare('DELETE FROM sessions WHERE expires_at < ?')
      .bind(now)
      .run();
    console.log('[cron] deleted', del.meta.changes, 'expired sessions');
  } catch (e) { console.error('[cron] session cleanup failed:', e.message); }

  // ── Rate limit cleanup (older than 2 hours) ──────────────────────────────
  try {
    await env.DB
      .prepare('DELETE FROM rate_limits WHERE window_start < ? AND blocked_until < ?')
      .bind(now - 7200, now)
      .run();
  } catch { /* table may not exist yet */ }

  // ── Publish scheduled articles ──────────────────────────────────────────
  const scheduled = await env.DB
    .prepare(`SELECT id, published_at FROM articles WHERE status = 'scheduled' AND scheduled_at <= ?`)
    .bind(now)
    .all();

  for (const row of scheduled.results) {
    const publishedAt = row.published_at ?? now;
    await env.DB
      .prepare(`UPDATE articles SET status = 'published', published_at = ?, updated_at = ? WHERE id = ?`)
      .bind(publishedAt, now, row.id)
      .run();
    console.log('[cron] published scheduled article id=' + row.id);
  }

  // ── Daily backup to R2 ──────────────────────────────────────────────────
  try {
    const [artRows, catRows] = await Promise.all([
      env.DB.prepare('SELECT * FROM articles ORDER BY id').all(),
      env.DB.prepare('SELECT * FROM categories ORDER BY id').all(),
    ]);
    const dateKey = new Date().toISOString().split('T')[0];
    const payload = JSON.stringify({
      exported_at: new Date().toISOString(),
      articles:    artRows.results,
      categories:  catRows.results,
    });
    await env.ASSETS.put(`backups/${dateKey}.json`, payload, {
      httpMetadata: { contentType: 'application/json' },
    });
    console.log('[cron] backup written to backups/' + dateKey + '.json');

    // Delete backups older than 30 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const list = await env.ASSETS.list({ prefix: 'backups/' });
    for (const obj of (list.objects || [])) {
      const fileDateStr = obj.key.replace('backups/', '').replace('.json', '');
      if (fileDateStr < cutoff.toISOString().split('T')[0]) {
        await env.ASSETS.delete(obj.key);
        console.log('[cron] deleted old backup', obj.key);
      }
    }
  } catch (e) {
    console.error('[cron] backup failed:', e.message);
  }
}

// ── CORS PREFLIGHT ────────────────────────────────────────────────────────────

function handlePreflight(request, env) {
  const allowed = resolveOrigin(request.headers.get('Origin') ?? '', env);
  if (!allowed) return new Response(null, { status: 403 });
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':      allowed,
      'Access-Control-Allow-Methods':     'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':     'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age':           '86400',
      'Vary':                             'Origin',
    },
  });
}

// ── SECURITY HEADER WRAPPER ───────────────────────────────────────────────────

function wrap(response, request, env) {
  const origin  = request.headers.get('Origin') ?? '';
  const allowed = resolveOrigin(origin, env);
  const h       = new Headers(response.headers);

  h.set('X-Content-Type-Options', 'nosniff');
  h.set('X-Frame-Options',        'DENY');
  h.set('Referrer-Policy',        'no-referrer');
  h.set('X-Robots-Tag',           'noindex, nofollow');
  h.set('Permissions-Policy',     'camera=(), microphone=(), geolocation=()');

  if (allowed) {
    h.set('Access-Control-Allow-Origin',      allowed);
    h.set('Access-Control-Allow-Credentials', 'true');
    h.set('Vary',                             'Origin');
  }

  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: h });
}

function resolveOrigin(origin, env) {
  if (!origin) return null;
  if (origin === env.ADMIN_ORIGIN)  return env.ADMIN_ORIGIN;
  if (origin === env.PUBLIC_ORIGIN) return env.PUBLIC_ORIGIN;
  return null;
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow', ...extra },
  });
}
