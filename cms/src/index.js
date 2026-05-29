/**
 * Sterling Tax Expert — CMS Worker
 *
 * Phase 1: Infrastructure skeleton + health check
 * Phase 2: Authentication — login, logout, session validation, auth middleware
 *
 * Phase 3 will add: article and category CRUD endpoints
 * Phase 4 will add: public API, redirects, backup/restore, cron handler
 */

import {
  requireAuth,
  verifyPassword,
  createSession,
  deleteSession,
  getSessionToken,
  buildSessionCookie,
  clearSessionCookie,
} from './auth.js';

// ── ENTRY POINT ───────────────────────────────────────────────────────────────

export default {

  async fetch(request, env, ctx) {
    // Handle CORS preflight for admin routes before any auth check
    if (request.method === 'OPTIONS') {
      return handlePreflight(request, env);
    }

    const url    = new URL(request.url);
    const path   = url.pathname;
    const method = request.method;

    // ── Public routes (no auth) ─────────────────────────────────────────────

    if (path === '/health') {
      return handleHealth(request, env);
    }

    if (path === '/api/admin/login' && method === 'POST') {
      return withSecureHeaders(await handleLogin(request, env), request, env);
    }

    if (path === '/api/admin/logout' && method === 'POST') {
      return withSecureHeaders(await handleLogout(request, env), request, env);
    }

    // Lightweight session check — admin panel calls this on load
    if (path === '/api/admin/ping' && method === 'GET') {
      return withSecureHeaders(await handlePing(request, env), request, env);
    }

    // ── Protected admin routes ──────────────────────────────────────────────
    // All /api/admin/* routes beyond login/logout/ping require a valid session.

    if (path.startsWith('/api/admin/')) {
      const session = await requireAuth(request, env);
      if (!session) {
        return withSecureHeaders(
          jsonResponse({ error: 'Unauthorised' }, 401),
          request,
          env,
        );
      }

      // Phase 3 admin routes will be dispatched here.
      // Return 501 for any unimplemented route so the admin panel
      // can detect the phase boundary cleanly.
      return withSecureHeaders(
        jsonResponse({ error: 'Not yet implemented', phase: 3 }, 501),
        request,
        env,
      );
    }

    return jsonResponse({ error: 'Not found' }, 404);
  },

  // Cron Trigger — fires daily at 02:00 UTC (Phase 4 implementation)
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleCron(event, env));
  },
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────

async function handleLogin(request, env) {
  // Reject non-JSON bodies before reading anything
  const ct = request.headers.get('Content-Type') ?? '';
  if (!ct.includes('application/json')) {
    return jsonResponse({ error: 'Content-Type must be application/json' }, 400);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { password } = body ?? {};

  // Basic input validation — the generic error avoids leaking field names
  if (typeof password !== 'string' || password.length === 0) {
    return jsonResponse({ error: 'Invalid credentials' }, 401);
  }

  const result = await verifyPassword(env.DB, password);

  if (result.error === 'locked') {
    const retryIn = Math.max(0, result.retryAfter - Math.floor(Date.now() / 1000));
    return jsonResponse(
      { error: 'Account temporarily locked. Try again later.' },
      423,
      { 'Retry-After': String(retryIn) },
    );
  }

  if (result.error === 'invalid') {
    // Generic message — identical for wrong-password and uninitialised-password
    return jsonResponse({ error: 'Invalid credentials' }, 401);
  }

  // Successful authentication — create session
  const ip = request.headers.get('CF-Connecting-IP') ?? null;
  const { token, expiresAt } = await createSession(env.DB, ip);

  return jsonResponse(
    { ok: true },
    200,
    { 'Set-Cookie': buildSessionCookie(token, expiresAt) },
  );
}

// ── LOGOUT ────────────────────────────────────────────────────────────────────

async function handleLogout(request, env) {
  const token = getSessionToken(request);

  // Delete the session from D1 if it exists
  // If no session exists (already expired, or no cookie), still clear the cookie
  if (token) {
    await deleteSession(env.DB, token);
  }

  return jsonResponse(
    { ok: true },
    200,
    { 'Set-Cookie': clearSessionCookie() },
  );
}

// ── PING ──────────────────────────────────────────────────────────────────────
// Lightweight session check — returns 200 if authenticated, 401 if not.
// The admin panel calls this on every page load to verify the session is still active.

async function handlePing(request, env) {
  const session = await requireAuth(request, env);

  if (!session) {
    return jsonResponse({ authenticated: false }, 401);
  }

  return jsonResponse({
    authenticated: true,
    expiresAt:     session.expires_at,
  }, 200);
}

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────

async function handleHealth(request, env) {
  const checks = { worker: true, d1: false, r2: false };
  const errors  = [];

  // Verify D1 is reachable and schema is applied
  try {
    const row = await env.DB
      .prepare('SELECT COUNT(*) AS count FROM sqlite_master WHERE type = ? AND name = ?')
      .bind('table', 'articles')
      .first();

    checks.d1 = row?.count === 1;
    if (!checks.d1) errors.push('D1: articles table not found — run migrations');
  } catch (e) {
    errors.push(`D1: ${e.message}`);
  }

  // Verify R2 is reachable — head() returns null for missing keys (does not throw)
  try {
    await env.ASSETS.head('health-check-probe');
    // Returns null (key absent) or an object (key present) — either proves R2 is reachable
    checks.r2 = true;
  } catch (e) {
    errors.push(`R2: ${e.message}`);
  }

  const allOk = checks.worker && checks.d1 && checks.r2;

  return jsonResponse({
    status: allOk ? 'ok' : 'degraded',
    phase:  2,
    checks,
    errors: errors.length ? errors : undefined,
    ts:     new Date().toISOString(),
  }, allOk ? 200 : 503);
}

// ── CRON STUB ─────────────────────────────────────────────────────────────────

async function handleCron(event, env) {
  console.log('[cron] trigger fired at', new Date().toISOString(), '— Phase 4 not yet implemented');
}

// ── CORS PREFLIGHT ────────────────────────────────────────────────────────────

function handlePreflight(request, env) {
  const origin = request.headers.get('Origin') ?? '';
  const allowedOrigin = resolveAllowedOrigin(origin, env);

  if (!allowedOrigin) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':      allowedOrigin,
      'Access-Control-Allow-Methods':     'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':     'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age':           '86400',
      'Vary':                             'Origin',
    },
  });
}

// ── SECURITY HEADERS ──────────────────────────────────────────────────────────
// Applied to all admin route responses. Health check omitted intentionally
// (it is a diagnostic endpoint, not an admin surface).

function withSecureHeaders(response, request, env) {
  const origin = request.headers.get('Origin') ?? '';
  const allowedOrigin = resolveAllowedOrigin(origin, env);

  const headers = new Headers(response.headers);

  // Prevent MIME-type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');
  // Deny framing — admin panel must never be embedded in an iframe
  headers.set('X-Frame-Options', 'DENY');
  // Do not leak the admin URL in Referer headers when following links
  headers.set('Referrer-Policy', 'no-referrer');
  // Prevent search engines from indexing admin responses
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  // Restrict powerful features — admin panel does not need camera, mic, etc.
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // CORS — only allow requests from the configured admin origin
  if (allowedOrigin) {
    headers.set('Access-Control-Allow-Origin',      allowedOrigin);
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set('Vary',                             'Origin');
  }

  return new Response(response.body, {
    status:     response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Returns the allowed CORS origin if the incoming origin matches either the
 * configured ADMIN_ORIGIN or PUBLIC_ORIGIN, otherwise null.
 * Comparing against an allowlist rather than reflecting the origin blindly.
 */
function resolveAllowedOrigin(origin, env) {
  if (!origin) return null;
  if (origin === env.ADMIN_ORIGIN)  return env.ADMIN_ORIGIN;
  if (origin === env.PUBLIC_ORIGIN) return env.PUBLIC_ORIGIN;
  return null;
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

/**
 * @param {object} body
 * @param {number} status
 * @param {Record<string,string>} [extraHeaders]
 */
function jsonResponse(body, status = 200, extraHeaders = {}) {
  const headers = new Headers({
    'Content-Type':  'application/json',
    'X-Robots-Tag':  'noindex, nofollow',
    ...extraHeaders,
  });

  return new Response(JSON.stringify(body, null, 2), { status, headers });
}
