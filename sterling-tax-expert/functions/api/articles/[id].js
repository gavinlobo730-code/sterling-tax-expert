import { corsHeaders, jsonResponse, validateSession } from '../../_shared/auth.js';

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

// GET /api/articles/:id
export async function onRequestGet({ request, env, params }) {
  const username = await validateSession(request, env);
  const row = await env.DB.prepare('SELECT * FROM articles WHERE id = ?').bind(params.id).first();

  if (!row) return jsonResponse({ error: 'Not found' }, 404, request);
  if (row.status !== 'published' && !username) {
    return jsonResponse({ error: 'Unauthorised' }, 401, request);
  }

  return jsonResponse({ ...row, tags: safeParseJSON(row.tags, []) }, 200, request);
}

// PUT /api/articles/:id — update article (auth required)
export async function onRequestPut({ request, env, params }) {
  const username = await validateSession(request, env);
  if (!username) return jsonResponse({ error: 'Unauthorised' }, 401, request);

  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, request);
  }

  const existing = await env.DB.prepare('SELECT id FROM articles WHERE id = ?').bind(params.id).first();
  if (!existing) return jsonResponse({ error: 'Not found' }, 404, request);

  const now = new Date().toISOString();
  await env.DB.prepare(`
    UPDATE articles SET
      title = ?, slug = ?, body = ?, excerpt = ?, status = ?,
      author = ?, category = ?, tags = ?, scheduled_at = ?, updated_at = ?
    WHERE id = ?
  `).bind(
    body.title,
    body.slug,
    body.body || '',
    body.excerpt || '',
    body.status || 'draft',
    body.author || 'Sterling Tax Expert',
    body.category || 'Tax',
    JSON.stringify(body.tags || []),
    body.scheduled_at || null,
    now,
    params.id
  ).run();

  return jsonResponse({ ok: true }, 200, request);
}

// DELETE /api/articles/:id (auth required)
export async function onRequestDelete({ request, env, params }) {
  const username = await validateSession(request, env);
  if (!username) return jsonResponse({ error: 'Unauthorised' }, 401, request);

  await env.DB.prepare('DELETE FROM articles WHERE id = ?').bind(params.id).run();
  return jsonResponse({ ok: true }, 200, request);
}

function safeParseJSON(s, fallback) {
  try { return JSON.parse(s); } catch { return fallback; }
}
