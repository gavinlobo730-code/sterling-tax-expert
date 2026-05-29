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
} from './routes/articles.js';

import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from './routes/categories.js';

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
        },
      });
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

// ── AUTH HANDLERS ─────────────────────────────────────────────────────────────

async function handleLogin(request, env) {
  const ct = request.headers.get('Content-Type') ?? '';
  if (!ct.includes('application/json')) return json({ error: 'Content-Type must be application/json' }, 400);

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

  const ip = request.headers.get('CF-Connecting-IP') ?? null;
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
  return json({ status: allOk ? 'ok' : 'degraded', phase: 3, checks, errors: errors.length ? errors : undefined, ts: new Date().toISOString() }, allOk ? 200 : 503);
}

// ── CRON STUB ─────────────────────────────────────────────────────────────────

async function handleCron(event, env) {
  console.log('[cron] trigger fired at', new Date().toISOString(), '— Phase 4 not yet implemented');
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
