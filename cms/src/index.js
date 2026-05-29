/**
 * Sterling Tax Expert — CMS Worker
 * Phase 1: Infrastructure skeleton + health check
 *
 * Phase 2 will add: authentication middleware, session management
 * Phase 3 will add: article and category CRUD endpoints
 * Phase 4 will add: public API, redirects, backup/restore, cron handler
 */

export default {

  // ── HTTP REQUESTS ────────────────────────────────────────────────────────────
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS headers are applied per-response in later phases.
    // For Phase 1 we only expose the health check.

    // Health check — confirm Worker, D1, and R2 are all reachable
    if (url.pathname === '/health') {
      return handleHealth(request, env);
    }

    // Every other route returns 404 until later phases are implemented
    return jsonResponse({ error: 'Not found' }, 404);
  },

  // ── CRON TRIGGER ─────────────────────────────────────────────────────────────
  // Fires daily at 02:00 UTC (configured in wrangler.toml).
  // Phase 4 will implement the full backup and scheduled-publish logic.
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleCron(event, env));
  },
};

// ── HEALTH CHECK ─────────────────────────────────────────────────────────────
async function handleHealth(request, env) {
  const checks = { worker: true, d1: false, r2: false };
  const errors = [];

  // Verify D1 is reachable and schema is applied
  try {
    const row = await env.DB.prepare(
      'SELECT COUNT(*) AS count FROM sqlite_master WHERE type = ? AND name = ?'
    ).bind('table', 'articles').first();
    checks.d1 = row?.count === 1;
    if (!checks.d1) errors.push('D1: articles table not found — run migrations');
  } catch (e) {
    errors.push(`D1: ${e.message}`);
  }

  // Verify R2 is reachable by attempting a head on a known key
  try {
    await env.ASSETS.head('health-check-probe');
    checks.r2 = true;
  } catch (e) {
    // head() throws when the key doesn't exist — that still proves R2 is reachable
    if (e.message?.includes('NoSuchKey') || e.name === 'NoSuchKey') {
      checks.r2 = true;
    } else {
      errors.push(`R2: ${e.message}`);
    }
  }

  // Also confirm the admin row exists (password not yet set is fine at this stage)
  let adminStatus = 'unknown';
  try {
    const adminRow = await env.DB.prepare('SELECT password_hash FROM admin WHERE id = 1').first();
    if (!adminRow) {
      adminStatus = 'missing — re-run migrations';
    } else if (adminRow.password_hash === 'NOT_SET') {
      adminStatus = 'password not set — run scripts/hash-password.js';
    } else {
      adminStatus = 'configured';
    }
  } catch (e) {
    adminStatus = `error: ${e.message}`;
  }

  const allOk = checks.worker && checks.d1 && checks.r2;

  return jsonResponse({
    status:  allOk ? 'ok' : 'degraded',
    phase:   1,
    checks,
    admin:   adminStatus,
    errors:  errors.length ? errors : undefined,
    ts:      new Date().toISOString(),
  }, allOk ? 200 : 503);
}

// ── CRON STUB ─────────────────────────────────────────────────────────────────
// Replaced with full implementation in Phase 4.
async function handleCron(event, env) {
  console.log('[cron] trigger fired at', new Date().toISOString(), '— Phase 4 not yet implemented');
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      // Prevent search engines indexing the API
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
