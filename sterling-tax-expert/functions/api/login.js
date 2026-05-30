import { corsHeaders, jsonResponse, verifyPassword, generateToken } from '../_shared/auth.js';

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400, request);
  }

  const { username, password } = body;
  if (!username || !password) {
    return jsonResponse({ error: 'Username and password are required' }, 400, request);
  }

  const user = await env.DB.prepare(
    'SELECT password_hash FROM admin_users WHERE username = ?'
  ).bind(username.trim().toLowerCase()).first();

  // Constant-time failure to prevent user enumeration
  const stored = user ? user.password_hash : 'aGFzaA==';
  const valid = user && await verifyPassword(password, stored);

  if (!valid) {
    return jsonResponse({ error: 'Invalid username or password' }, 401, request);
  }

  const token = generateToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await env.DB.prepare(
    'INSERT INTO sessions (token, username, expires_at) VALUES (?, ?, ?)'
  ).bind(token, username.trim().toLowerCase(), expires).run();

  const headers = {
    ...corsHeaders(request),
    'Content-Type': 'application/json',
    'Set-Cookie': `ste_sess=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`,
  };

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
