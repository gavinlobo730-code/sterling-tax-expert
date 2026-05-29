/**
 * Public API route handlers — Phase 4
 *
 * No authentication required. Returns published articles only.
 * Draft, scheduled and archived articles are never exposed here.
 */

// ── ARTICLES LIST ─────────────────────────────────────────────────────────────

/**
 * GET /api/articles
 * Query params: page, limit (max 20), category (slug), featured (true)
 */
export async function publicListArticles(request, env) {
  const url      = new URL(request.url);
  const page     = Math.max(1, parseInt(url.searchParams.get('page')  ?? '1',  10));
  const limit    = Math.min(20, Math.max(1, parseInt(url.searchParams.get('limit') ?? '12', 10)));
  const offset   = (page - 1) * limit;
  const catSlug  = url.searchParams.get('category') ?? null;
  const featured = url.searchParams.get('featured') === 'true';

  // Build WHERE clause dynamically to avoid binding nulls
  const conditions = ["a.status = 'published'"];
  const binds      = [];

  if (catSlug) {
    conditions.push('c.slug = ?');
    binds.push(catSlug);
  }
  if (featured) {
    conditions.push('a.featured = 1');
  }

  const where = 'WHERE ' + conditions.join(' AND ');

  const totalRow = await env.DB
    .prepare(`
      SELECT COUNT(*) AS n
      FROM   articles a
      LEFT JOIN categories c ON c.id = a.category_id
      ${where}
    `)
    .bind(...binds)
    .first();

  const total      = totalRow?.n ?? 0;
  const totalPages = Math.ceil(total / limit);

  const rows = await env.DB
    .prepare(`
      SELECT a.id, a.title, a.slug, a.excerpt, a.featured_image,
             a.featured, a.published_at, a.updated_at, a.reading_time,
             c.name   AS category_name,
             c.slug   AS category_slug,
             c.colour AS category_colour
      FROM   articles a
      LEFT JOIN categories c ON c.id = a.category_id
      ${where}
      ORDER  BY a.published_at DESC
      LIMIT  ? OFFSET ?
    `)
    .bind(...binds, limit, offset)
    .all();

  return publicJson({ articles: rows.results, total, page, limit, totalPages }, 120);
}

// ── SINGLE ARTICLE ────────────────────────────────────────────────────────────

/**
 * GET /api/articles/:slug
 *
 * Returns the published article for the given slug.
 * If the slug has been redirected (article was renamed), returns 301
 * to the new API URL. The client follows the redirect and receives the
 * new article, then updates the browser URL accordingly.
 */
export async function publicGetArticle(request, env, slug) {
  // Check the redirects table first
  const redirect = await env.DB
    .prepare('SELECT to_path FROM redirects WHERE from_path = ?')
    .bind(`/insights/${slug}`)
    .first();

  if (redirect) {
    const newSlug = redirect.to_path.replace('/insights/', '');
    return new Response(null, {
      status: 301,
      headers: {
        'Location':      `/api/articles/${newSlug}`,
        'Cache-Control': 'public, max-age=31536000',
        'X-Robots-Tag':  'noindex',
      },
    });
  }

  // Fetch the published article
  const article = await env.DB
    .prepare(`
      SELECT a.id, a.title, a.slug, a.excerpt, a.content, a.featured_image,
             a.featured, a.published_at, a.updated_at, a.reading_time,
             a.meta_title, a.meta_desc,
             c.name   AS category_name,
             c.slug   AS category_slug,
             c.colour AS category_colour
      FROM   articles a
      LEFT JOIN categories c ON c.id = a.category_id
      WHERE  a.slug = ? AND a.status = 'published'
    `)
    .bind(slug)
    .first();

  if (!article) {
    return Response.json({ error: 'Article not found' }, { status: 404 });
  }

  return publicJson({ article }, 120);
}

// ── CATEGORIES ────────────────────────────────────────────────────────────────

/**
 * GET /api/categories
 * Returns all categories with their published article counts.
 */
export async function publicListCategories(request, env) {
  const rows = await env.DB
    .prepare(`
      SELECT   c.id, c.name, c.slug, c.colour, c.description,
               COUNT(a.id) AS article_count
      FROM     categories c
      LEFT JOIN articles a
             ON a.category_id = c.id AND a.status = 'published'
      GROUP BY c.id
      ORDER BY c.name ASC
    `)
    .all();

  return publicJson({ categories: rows.results }, 3600);
}

// ── SITEMAP ───────────────────────────────────────────────────────────────────

/**
 * GET /sitemap.xml
 * Generates an XML sitemap for all published articles.
 * Also includes the homepage and the insights listing.
 */
export async function publicSitemap(request, env) {
  const base = (env.PUBLIC_ORIGIN ?? 'https://sterling-tax.co.uk').replace(/\/$/, '');
  const now  = isoDate(Date.now() / 1000);

  const rows = await env.DB
    .prepare(`
      SELECT slug, published_at, updated_at
      FROM   articles
      WHERE  status = 'published'
      ORDER  BY published_at DESC
    `)
    .all();

  const staticUrls = [
    urlEntry(base + '/',         now,  'weekly',  '1.0'),
    urlEntry(base + '/insights', now,  'daily',   '0.9'),
  ];

  const articleUrls = rows.results.map(a =>
    urlEntry(
      `${base}/insights/${a.slug}`,
      isoDate(a.updated_at ?? a.published_at),
      'monthly',
      '0.7',
    )
  );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticUrls,
    ...articleUrls,
    '</urlset>',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type':  'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function publicJson(body, maxAge = 120) {
  return Response.json(body, {
    headers: {
      'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
    },
  });
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

function isoDate(unixTs) {
  return new Date(unixTs * 1000).toISOString().split('T')[0];
}
