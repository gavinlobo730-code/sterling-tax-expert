import { corsHeaders, jsonResponse, validateSession } from '../../_shared/auth.js';

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

// GET /api/articles — list all articles (auth required for drafts; published only for public)
export async function onRequestGet({ request, env }) {
  const username = await validateSession(request, env);
  const url = new URL(request.url);
  const publicOnly = url.searchParams.get('public') === '1';

  let rows;
  if (username && !publicOnly) {
    rows = await env.DB.prepare(
      'SELECT * FROM articles ORDER BY created_at DESC'
    ).all();
  } else {
    rows = await env.DB.prepare(
      "SELECT * FROM articles WHERE status = 'published' ORDER BY created_at DESC"
    ).all();
  }

  const articles = (rows.results || []).map(r => ({
    ...r,
    tags: safeParseJSON(r.tags, []),
  }));

  return jsonResponse({ articles }, 200, request);
}

// POST /api/articles — create article (auth required)
export async function onRequestPost({ request, env }) {
  const username = await validateSession(request, env);
  if (!username) return jsonResponse({ error: 'Unauthorised' }, 401, request);

  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, request);
  }

  const id = body.id || String(Date.now());
  const now = new Date().toISOString();
  const slug = body.slug || slugify(body.title || id);

  await env.DB.prepare(`
    INSERT INTO articles (id, title, slug, body, excerpt, status, author, category, tags, scheduled_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    body.title || '',
    slug,
    body.body || '',
    body.excerpt || '',
    body.status || 'draft',
    body.author || 'Sterling Tax Expert',
    body.category || 'Tax',
    JSON.stringify(body.tags || []),
    body.scheduled_at || null,
    now, now
  ).run();

  return jsonResponse({ ok: true, id }, 201, request);
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 80);
}

function safeParseJSON(s, fallback) {
  try { return JSON.parse(s); } catch { return fallback; }
}
