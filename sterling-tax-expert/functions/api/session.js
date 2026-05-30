import { corsHeaders, jsonResponse, validateSession } from '../_shared/auth.js';

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function onRequestGet({ request, env }) {
  const username = await validateSession(request, env);
  if (!username) {
    return jsonResponse({ authenticated: false }, 200, request);
  }
  return jsonResponse({ authenticated: true, username }, 200, request);
}
