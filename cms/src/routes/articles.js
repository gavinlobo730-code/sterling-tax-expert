/**
 * Article route handlers — Phase 3
 *
 * Exported functions are called by the router in index.js.
 * Each receives (request, env) plus any URL path params.
 */

import {
  sanitiseArticleInput,
  validateForSave,
  validateForPublish,
  slugFromTitle,
} from '../sanitise.js';

// ── TINY RESPONSE HELPERS ─────────────────────────────────────────────────────

function ok(data, status = 200)      { return Response.json(data, { status }); }
function fail(message, status = 400) { return Response.json({ error: message }, { status }); }
function unixNow()                   { return Math.floor(Date.now() / 1000); }

/** Strip HTML tags and estimate reading time in minutes (200 wpm). */
function calcReadingTime(content) {
  if (!content) return 1;
  const text  = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').filter(w => w.length > 0).length;
  return Math.max(1, Math.round(words / 200));
}

// ── DASHBOARD STATS ───────────────────────────────────────────────────────────

export async function getDashboard(env) {
  // Counts per status in a single query
  const countRows = await env.DB
    .prepare('SELECT status, COUNT(*) AS count FROM articles GROUP BY status')
    .all();

  const counts = { draft: 0, published: 0, scheduled: 0, archived: 0, total: 0 };
  for (const row of countRows.results) {
    if (row.status in counts) counts[row.status] = row.count;
    counts.total += row.count;
  }

  // Five most recently updated articles
  const recentRows = await env.DB
    .prepare(`
      SELECT a.id, a.title, a.slug, a.status, a.updated_at,
             c.name AS category_name
      FROM   articles a
      LEFT JOIN categories c ON c.id = a.category_id
      ORDER  BY a.updated_at DESC
      LIMIT  5
    `)
    .all();

  return ok({ counts, recent: recentRows.results });
}

// ── LIST ──────────────────────────────────────────────────────────────────────

export async function listArticles(request, env) {
  const url    = new URL(request.url);
  const status = url.searchParams.get('status') ?? 'all';
  const page   = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
  const limit  = 20;
  const offset = (page - 1) * limit;

  const where   = status !== 'all' ? 'WHERE a.status = ?' : '';
  const binds   = status !== 'all' ? [status] : [];

  const totalRow = await env.DB
    .prepare(`SELECT COUNT(*) AS n FROM articles a ${where}`)
    .bind(...binds)
    .first();

  const rows = await env.DB
    .prepare(`
      SELECT a.id, a.title, a.slug, a.status, a.featured,
             a.published_at, a.updated_at, a.created_at,
             c.name AS category_name
      FROM   articles a
      LEFT JOIN categories c ON c.id = a.category_id
      ${where}
      ORDER  BY a.updated_at DESC
      LIMIT  ? OFFSET ?
    `)
    .bind(...binds, limit, offset)
    .all();

  return ok({
    articles: rows.results,
    total:    totalRow?.n ?? 0,
    page,
    limit,
  });
}

// ── GET ONE ───────────────────────────────────────────────────────────────────

export async function getArticle(request, env, id) {
  const article = await env.DB
    .prepare(`
      SELECT a.*, c.name AS category_name
      FROM   articles a
      LEFT JOIN categories c ON c.id = a.category_id
      WHERE  a.id = ?
    `)
    .bind(id)
    .first();

  if (!article) return fail('Article not found', 404);
  return ok({ article });
}

// ── CREATE ────────────────────────────────────────────────────────────────────

export async function createArticle(request, env) {
  const raw = await parseBody(request);
  if (raw === null) return fail('Invalid JSON body');

  const data = sanitiseArticleInput(raw);
  if (!data) return fail('Invalid request body');

  // Auto-generate slug from title when not supplied
  if (!data.slug && data.title) data.slug = slugFromTitle(data.title);

  const errors = validateForSave(data);
  if (errors.length) return fail(errors.join('; '), 422);

  // Slug uniqueness
  const taken = await env.DB
    .prepare('SELECT id FROM articles WHERE slug = ?')
    .bind(data.slug)
    .first();
  if (taken) return fail(`Slug "${data.slug}" is already in use`, 409);

  // Validate category exists (D1 does not enforce FK)
  if (data.category_id !== null) {
    const cat = await env.DB
      .prepare('SELECT id FROM categories WHERE id = ?')
      .bind(data.category_id)
      .first();
    if (!cat) data.category_id = null;
  }

  const now          = unixNow();
  const readingTime  = calcReadingTime(data.content);
  const result = await env.DB
    .prepare(`
      INSERT INTO articles
        (title, slug, excerpt, content, featured_image, category_id, featured,
         meta_title, meta_desc, reading_time, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)
    `)
    .bind(
      data.title, data.slug, data.excerpt, data.content, data.featured_image,
      data.category_id, data.featured,
      data.meta_title, data.meta_desc, readingTime,
      now, now,
    )
    .run();

  const article = await env.DB
    .prepare('SELECT * FROM articles WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first();

  return ok({ article }, 201);
}

// ── UPDATE ────────────────────────────────────────────────────────────────────

export async function updateArticle(request, env, id) {
  const existing = await env.DB
    .prepare('SELECT id, slug, status, published_at FROM articles WHERE id = ?')
    .bind(id)
    .first();
  if (!existing) return fail('Article not found', 404);

  const raw = await parseBody(request);
  if (raw === null) return fail('Invalid JSON body');

  const data = sanitiseArticleInput(raw);
  if (!data) return fail('Invalid request body');

  if (!data.slug && data.title) data.slug = slugFromTitle(data.title);

  const errors = validateForSave(data);
  if (errors.length) return fail(errors.join('; '), 422);

  // Check slug uniqueness only when slug actually changed
  if (data.slug !== existing.slug) {
    const conflict = await env.DB
      .prepare('SELECT id FROM articles WHERE slug = ? AND id != ?')
      .bind(data.slug, id)
      .first();
    if (conflict) return fail(`Slug "${data.slug}" is already in use`, 409);

    // Auto-create 301 redirect for published articles whose slug changed.
    // D1 UPSERT: update to_path if the from_path already exists.
    if (existing.status === 'published') {
      await env.DB
        .prepare(`
          INSERT INTO redirects (from_path, to_path)
          VALUES (?, ?)
          ON CONFLICT(from_path) DO UPDATE SET to_path = excluded.to_path
        `)
        .bind(`/insights/${existing.slug}`, `/insights/${data.slug}`)
        .run();
    }
  }

  // Validate category (D1 does not enforce FK)
  if (data.category_id !== null) {
    const cat = await env.DB
      .prepare('SELECT id FROM categories WHERE id = ?')
      .bind(data.category_id)
      .first();
    if (!cat) data.category_id = null;
  }

  const readingTime = calcReadingTime(data.content);
  await env.DB
    .prepare(`
      UPDATE articles
      SET title = ?, slug = ?, excerpt = ?, content = ?,
          featured_image = ?, category_id = ?, featured = ?,
          meta_title = ?, meta_desc = ?,
          reading_time = ?, updated_at = ?
      WHERE id = ?
    `)
    .bind(
      data.title, data.slug, data.excerpt, data.content,
      data.featured_image, data.category_id, data.featured,
      data.meta_title, data.meta_desc,
      readingTime, unixNow(), id,
    )
    .run();

  const article = await env.DB
    .prepare('SELECT * FROM articles WHERE id = ?')
    .bind(id)
    .first();

  return ok({ article });
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function deleteArticle(request, env, id) {
  const existing = await env.DB
    .prepare('SELECT id FROM articles WHERE id = ?')
    .bind(id)
    .first();
  if (!existing) return fail('Article not found', 404);

  await env.DB.prepare('DELETE FROM articles WHERE id = ?').bind(id).run();
  return ok({ deleted: true });
}

// ── PUBLISH ───────────────────────────────────────────────────────────────────

export async function publishArticle(request, env, id) {
  const article = await env.DB
    .prepare('SELECT * FROM articles WHERE id = ?')
    .bind(id)
    .first();
  if (!article) return fail('Article not found', 404);

  const errors = validateForPublish(article);
  if (errors.length) return fail(errors.join('; '), 422);

  const now         = unixNow();
  // published_at is set only on the first publish and never overwritten
  const publishedAt = article.published_at ?? now;

  await env.DB
    .prepare(`
      UPDATE articles
      SET status = 'published', published_at = ?, updated_at = ?
      WHERE id = ?
    `)
    .bind(publishedAt, now, id)
    .run();

  const updated = await env.DB
    .prepare('SELECT * FROM articles WHERE id = ?')
    .bind(id)
    .first();

  return ok({ article: updated });
}

// ── UNPUBLISH ─────────────────────────────────────────────────────────────────

export async function unpublishArticle(request, env, id) {
  const article = await env.DB
    .prepare('SELECT id FROM articles WHERE id = ?')
    .bind(id)
    .first();
  if (!article) return fail('Article not found', 404);

  await env.DB
    .prepare("UPDATE articles SET status = 'draft', updated_at = ? WHERE id = ?")
    .bind(unixNow(), id)
    .run();

  const updated = await env.DB
    .prepare('SELECT * FROM articles WHERE id = ?')
    .bind(id)
    .first();

  return ok({ article: updated });
}

// ── PREVIEW ───────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/articles/:id/preview  (auth required)
 *
 * Returns the article (any status) as JSON with the same shape as the
 * public endpoint so the admin UI can render a client-side preview.
 */
export async function previewArticle(request, env, id) {
  const article = await env.DB
    .prepare(`
      SELECT a.*, c.name AS category_name, c.slug AS category_slug,
             c.colour AS category_colour
      FROM   articles a
      LEFT JOIN categories c ON c.id = a.category_id
      WHERE  a.id = ?
    `)
    .bind(id)
    .first();

  if (!article) return fail('Article not found', 404);
  return ok({ article });
}

// ── INTERNAL ──────────────────────────────────────────────────────────────────

async function parseBody(request) {
  const ct = request.headers.get('Content-Type') ?? '';
  if (!ct.includes('application/json')) return null;
  try   { return await request.json(); }
  catch { return null; }
}
