/**
 * Sterling Tax Expert CMS — Authentication Module (Phase 2)
 *
 * Responsibilities:
 *   - Session token generation, creation, validation, deletion
 *   - Password verification via bcrypt with lockout enforcement
 *   - Cookie building and parsing
 *   - Auth middleware (requireAuth) for protecting admin routes
 *
 * Nothing in this file touches HTTP request/response objects directly,
 * except getSessionToken() which only reads the Cookie header.
 * All HTTP concerns (status codes, headers) live in index.js.
 */

import bcrypt from 'bcryptjs';

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

export const COOKIE_NAME      = 'sterling_session';
export const SESSION_DURATION = 14400;  // 4 hours in seconds
const MAX_FAILED_ATTEMPTS     = 3;
const LOCKOUT_DURATION        = 900;    // 15 minutes in seconds
const TOKEN_LENGTH            = 64;     // hex chars (256 bits)

// ── TOKEN GENERATION ──────────────────────────────────────────────────────────

/**
 * Returns a 64-character hex string (256 bits) suitable for use as a session
 * token. Uses the Web Crypto API available in all Cloudflare Workers.
 */
export function generateSessionToken() {
  return crypto.randomUUID().replace(/-/g, '')
       + crypto.randomUUID().replace(/-/g, '');
}

// ── SESSION CREATION ──────────────────────────────────────────────────────────

/**
 * Inserts a new session row into D1 and returns the token and expiry timestamp.
 * @param {D1Database} db
 * @param {string|null} ip  CF-Connecting-IP value, for audit log only
 * @returns {{ token: string, expiresAt: number }}
 */
export async function createSession(db, ip) {
  const token     = generateSessionToken();
  const now       = unixNow();
  const expiresAt = now + SESSION_DURATION;

  await db
    .prepare('INSERT INTO sessions (id, created_at, expires_at, ip) VALUES (?, ?, ?, ?)')
    .bind(token, now, expiresAt, ip ?? null)
    .run();

  return { token, expiresAt };
}

// ── SESSION VALIDATION ────────────────────────────────────────────────────────

/**
 * Looks up a session token in D1 and checks it has not expired.
 * Deletes the row if the session is found but expired.
 *
 * @param {D1Database} db
 * @param {string|null} token
 * @returns {Promise<{ id: string, expires_at: number }|null>}
 */
export async function validateSession(db, token) {
  if (!token || token.length !== TOKEN_LENGTH) return null;

  const session = await db
    .prepare('SELECT id, expires_at FROM sessions WHERE id = ?')
    .bind(token)
    .first();

  if (!session) return null;

  if (session.expires_at < unixNow()) {
    // Clean up the expired row immediately
    await db.prepare('DELETE FROM sessions WHERE id = ?').bind(token).run();
    return null;
  }

  return session;
}

// ── SESSION DELETION ──────────────────────────────────────────────────────────

/**
 * Deletes a session row from D1. Safe to call with a null/missing token.
 * @param {D1Database} db
 * @param {string|null} token
 */
export async function deleteSession(db, token) {
  if (!token) return;
  await db.prepare('DELETE FROM sessions WHERE id = ?').bind(token).run();
}

// ── PASSWORD VERIFICATION ─────────────────────────────────────────────────────

/**
 * Verifies a password against the stored bcrypt hash.
 * Enforces account lockout after MAX_FAILED_ATTEMPTS consecutive failures.
 *
 * Return shapes:
 *   { ok: true }
 *   { error: 'locked',  retryAfter: <unix timestamp> }
 *   { error: 'invalid' }
 *
 * 'invalid' is returned for both wrong-password AND uninitialised-password
 * so the caller cannot distinguish between the two cases.
 *
 * @param {D1Database} db
 * @param {string} password  Plain-text password from the login form
 */
export async function verifyPassword(db, password) {
  const now   = unixNow();
  const admin = await db
    .prepare('SELECT password_hash, failed_attempts, locked_until FROM admin WHERE id = 1')
    .first();

  // No admin row or password not yet initialised → treat as invalid (not a config error)
  if (!admin || admin.password_hash === 'NOT_SET') {
    return { error: 'invalid' };
  }

  // Account is locked
  if (admin.locked_until > now) {
    return { error: 'locked', retryAfter: admin.locked_until };
  }

  const match = await bcrypt.compare(password, admin.password_hash);

  if (!match) {
    const newCount  = admin.failed_attempts + 1;
    const lockUntil = newCount >= MAX_FAILED_ATTEMPTS ? now + LOCKOUT_DURATION : 0;

    await db
      .prepare('UPDATE admin SET failed_attempts = ?, locked_until = ? WHERE id = 1')
      .bind(newCount, lockUntil)
      .run();

    return { error: 'invalid' };
  }

  // Successful login — clear any previous lockout state
  await db
    .prepare('UPDATE admin SET failed_attempts = 0, locked_until = 0 WHERE id = 1')
    .run();

  return { ok: true };
}

// ── COOKIE HELPERS ────────────────────────────────────────────────────────────

/**
 * Extracts the session token from the Cookie request header.
 * Returns null if the cookie is absent or empty.
 * @param {Request} request
 * @returns {string|null}
 */
export function getSessionToken(request) {
  const cookieHeader = request.headers.get('Cookie') ?? '';

  for (const part of cookieHeader.split(';')) {
    const eqIdx = part.indexOf('=');
    if (eqIdx === -1) continue;

    const name  = part.slice(0, eqIdx).trim();
    const value = part.slice(eqIdx + 1).trim();

    if (name === COOKIE_NAME) return value || null;
  }

  return null;
}

/**
 * Builds a Set-Cookie header value for a valid session.
 * @param {string} token
 * @param {number} expiresAt  Unix timestamp
 * @returns {string}
 */
export function buildSessionCookie(token, expiresAt) {
  const maxAge = expiresAt - unixNow();
  return [
    `${COOKIE_NAME}=${token}`,
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    'Path=/',
    `Max-Age=${maxAge}`,
  ].join('; ');
}

/**
 * Builds a Set-Cookie header value that immediately clears the session cookie.
 * @returns {string}
 */
export function clearSessionCookie() {
  return [
    `${COOKIE_NAME}=`,
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    'Path=/',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ].join('; ');
}

// ── AUTH MIDDLEWARE ───────────────────────────────────────────────────────────

/**
 * Validates the session cookie on an incoming request.
 * Returns the session row from D1 if valid, null if not authenticated.
 *
 * Usage in index.js:
 *   const session = await requireAuth(request, env);
 *   if (!session) return jsonResponse({ error: 'Unauthorised' }, 401);
 *
 * @param {Request}    request
 * @param {{ DB: D1Database }} env
 * @returns {Promise<{ id: string, expires_at: number }|null>}
 */
export async function requireAuth(request, env) {
  const token = getSessionToken(request);
  return validateSession(env.DB, token);
}

// ── INTERNAL HELPERS ──────────────────────────────────────────────────────────

function unixNow() {
  return Math.floor(Date.now() / 1000);
}
