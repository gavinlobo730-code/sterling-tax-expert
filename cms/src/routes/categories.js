/**
 * Category route handlers — Phase 3
 *
 * D1 does not enforce foreign key cascades.
 * deleteCategory() manually sets category_id = NULL on affected articles.
 */

import {
  sanitiseCategoryInput,
  validateCategoryForSave,
  slugFromTitle,
} from '../sanitise.js';

function ok(data, status = 200)      { return Response.json(data, { status }); }
function fail(message, status = 400) { return Response.json({ error: message }, { status }); }

// ── LIST ──────────────────────────────────────────────────────────────────────

export async function listCategories(request, env) {
  const rows = await env.DB
    .prepare(`
      SELECT   c.id, c.name, c.slug, c.colour, c.description, c.created_at,
               COUNT(a.id) AS article_count
      FROM     categories c
      LEFT JOIN articles a ON a.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `)
    .all();

  return ok({ categories: rows.results });
}

// ── CREATE ────────────────────────────────────────────────────────────────────

export async function createCategory(request, env) {
  const raw = await parseBody(request);
  if (raw === null) return fail('Invalid JSON body');

  const data = sanitiseCategoryInput(raw);
  if (!data) return fail('Invalid request body');

  if (!data.slug && data.name) data.slug = slugFromTitle(data.name);

  const errors = validateCategoryForSave(data);
  if (errors.length) return fail(errors.join('; '), 422);

  const conflict = await env.DB
    .prepare('SELECT id FROM categories WHERE slug = ? OR name = ?')
    .bind(data.slug, data.name)
    .first();
  if (conflict) return fail('A category with that name or slug already exists', 409);

  const result = await env.DB
    .prepare('INSERT INTO categories (name, slug, colour, description) VALUES (?, ?, ?, ?)')
    .bind(data.name, data.slug, data.colour, data.description)
    .run();

  const category = await env.DB
    .prepare('SELECT * FROM categories WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first();

  return ok({ category }, 201);
}

// ── UPDATE ────────────────────────────────────────────────────────────────────

export async function updateCategory(request, env, id) {
  const existing = await env.DB
    .prepare('SELECT * FROM categories WHERE id = ?')
    .bind(id)
    .first();
  if (!existing) return fail('Category not found', 404);

  const raw = await parseBody(request);
  if (raw === null) return fail('Invalid JSON body');

  const data = sanitiseCategoryInput(raw);
  if (!data) return fail('Invalid request body');

  // Keep existing slug if none supplied
  if (!data.slug) data.slug = existing.slug;

  const errors = validateCategoryForSave(data);
  if (errors.length) return fail(errors.join('; '), 422);

  const conflict = await env.DB
    .prepare('SELECT id FROM categories WHERE (slug = ? OR name = ?) AND id != ?')
    .bind(data.slug, data.name, id)
    .first();
  if (conflict) return fail('A category with that name or slug already exists', 409);

  await env.DB
    .prepare('UPDATE categories SET name = ?, slug = ?, colour = ?, description = ? WHERE id = ?')
    .bind(data.name, data.slug, data.colour, data.description, id)
    .run();

  const category = await env.DB
    .prepare('SELECT * FROM categories WHERE id = ?')
    .bind(id)
    .first();

  return ok({ category });
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function deleteCategory(request, env, id) {
  const existing = await env.DB
    .prepare('SELECT id FROM categories WHERE id = ?')
    .bind(id)
    .first();
  if (!existing) return fail('Category not found', 404);

  // D1 does not enforce FK ON DELETE SET NULL — do it manually
  await env.DB
    .prepare('UPDATE articles SET category_id = NULL WHERE category_id = ?')
    .bind(id)
    .run();

  await env.DB
    .prepare('DELETE FROM categories WHERE id = ?')
    .bind(id)
    .run();

  return ok({ deleted: true });
}

// ── INTERNAL ──────────────────────────────────────────────────────────────────

async function parseBody(request) {
  const ct = request.headers.get('Content-Type') ?? '';
  if (!ct.includes('application/json')) return null;
  try   { return await request.json(); }
  catch { return null; }
}
