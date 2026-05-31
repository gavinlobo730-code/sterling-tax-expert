// Cloudflare Pages Function — HMRC VAT number verification proxy
// Forwards requests to HMRC's check-vat-number API to avoid CORS restrictions.
// Endpoint: /api/vat?number=123456789

import { corsHeaders } from '../_shared/auth.js';

const HMRC_VAT_BASE = 'https://api.service.hmrc.gov.uk/organisations/vat/check-vat-number/lookup';

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const number = (url.searchParams.get('number') || '').replace(/[^0-9]/g, '');

  if (!/^\d{9}(\d{3})?$/.test(number)) {
    return new Response(JSON.stringify({ error: 'Invalid VAT number format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(request) }
    });
  }

  const upstream = await fetch(HMRC_VAT_BASE + '/' + number, {
    headers: { 'Accept': 'application/json' }
  });

  const body = await upstream.text();
  // Only cache successful responses — never cache 404s
  const cacheControl = upstream.status === 200 ? 'public, max-age=3600' : 'no-store';
  return new Response(body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': cacheControl,
      ...corsHeaders(request)
    }
  });
}
