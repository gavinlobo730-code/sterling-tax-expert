// One-time setup endpoint — creates the first admin user.
// Disabled automatically once any admin user exists.
import { corsHeaders, jsonResponse, hashPassword } from '../_shared/auth.js';

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function onRequestGet({ request, env }) {
  const existing = await env.DB.prepare('SELECT COUNT(*) as n FROM admin_users').first();
  if (existing && existing.n > 0) {
    return jsonResponse({ ready: true, message: 'Admin user already exists. Setup is disabled.' }, 200, request);
  }
  return jsonResponse({ ready: false, message: 'No admin user yet. POST {username, password} to this endpoint to create one.' }, 200, request);
}

export async function onRequestPost({ request, env }) {
  // Only allow setup if no admin user exists yet
  const existing = await env.DB.prepare('SELECT COUNT(*) as n FROM admin_users').first();
  if (existing && existing.n > 0) {
    return jsonResponse({ error: 'Setup already complete. This endpoint is disabled.' }, 403, request);
  }

  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, request);
  }

  const { username, password } = body;
  if (!username || !password) {
    return jsonResponse({ error: 'username and password are required' }, 400, request);
  }
  if (password.length < 10) {
    return jsonResponse({ error: 'Password must be at least 10 characters' }, 400, request);
  }

  const hash = await hashPassword(password);
  await env.DB.prepare(
    'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)'
  ).bind(username.trim().toLowerCase(), hash).run();

  return jsonResponse({ ok: true, message: `Admin user "${username}" created. This endpoint is now disabled.` }, 201, request);
}
