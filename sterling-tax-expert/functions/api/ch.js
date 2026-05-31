// Cloudflare Pages Function — Companies House API proxy
// Keeps the API key server-side; forwards GET requests to the CH REST API.
// Endpoint: /api/ch?path=/search/companies%3Fq%3Dacme

import { corsHeaders } from '../_shared/auth.js';

const CH_BASE = 'https://api.company-information.service.gov.uk';

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const path = url.searchParams.get('path');

  if (!path || !path.startsWith('/')) {
    return new Response(JSON.stringify({ error: 'Missing or invalid path parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(request) }
    });
  }

  const apiKey = env.CH_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(request) }
    });
  }

  const upstream = await fetch(CH_BASE + path, {
    headers: {
      'Authorization': 'Basic ' + btoa(apiKey + ':'),
      'Accept': 'application/json'
    }
  });

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300', // cache 5 min
      ...corsHeaders(request)
    }
  });
}
