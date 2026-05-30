import { corsHeaders, jsonResponse, getSessionToken } from '../_shared/auth.js';

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function onRequestPost({ request, env }) {
  const token = getSessionToken(request);
  if (token) {
    await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  }

  const headers = {
    ...corsHeaders(request),
    'Content-Type': 'application/json',
    'Set-Cookie': 'ste_sess=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
  };

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
