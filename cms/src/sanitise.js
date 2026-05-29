/**
 * Input sanitisation and validation utilities.
 * Called by article and category route handlers before any DB write.
 */

// Valid slug pattern: lowercase letters, numbers, single hyphens, no leading/trailing hyphens
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ── TEXT ──────────────────────────────────────────────────────────────────────

/** Trim whitespace, collapse interior spaces, strip HTML tags. */
export function sanitiseText(value) {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/<[^>]*>/g, '');
}

/** Normalise a slug: lowercase, replace non-slug characters with hyphens. */
export function sanitiseSlug(value) {
  if (typeof value !== 'string') return '';
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Derive a slug from a title. */
export function slugFromTitle(title) {
  return sanitiseSlug(title);
}

/** Validate that a colour is #rrggbb. Falls back to indigo if not. */
function sanitiseColour(value) {
  if (typeof value !== 'string') return '#6366F1';
  return /^#[0-9a-fA-F]{6}$/.test(value.trim()) ? value.trim() : '#6366F1';
}

// ── ARTICLE ───────────────────────────────────────────────────────────────────

/**
 * Sanitise raw article input from the request body.
 * Returns null if the input is not an object.
 */
export function sanitiseArticleInput(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    title:          sanitiseText(raw.title      ?? '').slice(0, 300),
    slug:           sanitiseSlug(raw.slug       ?? ''),
    excerpt:        sanitiseText(raw.excerpt    ?? '').slice(0, 500),
    content:        typeof raw.content === 'string' ? raw.content.slice(0, 500_000) : '',
    category_id:    raw.category_id != null ? (parseInt(raw.category_id, 10) || null) : null,
    featured:       raw.featured ? 1 : 0,
    meta_title:     sanitiseText(raw.meta_title ?? '').slice(0, 60),
    meta_desc:      sanitiseText(raw.meta_desc  ?? '').slice(0, 160),
    featured_image: sanitiseFeaturedImage(raw.featured_image),
  };
}

/** Allow only R2 keys matching the media upload pattern. Rejects path traversal. */
function sanitiseFeaturedImage(val) {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (!trimmed) return null;
  // Key pattern: YYYY/MM/<timestamp>-<safe-name>.<ext>
  if (trimmed.includes('..')) return null;
  if (!/^[a-zA-Z0-9/._-]+$/.test(trimmed)) return null;
  if (trimmed.startsWith('backups/')) return null;
  return trimmed;
}

/** Validate fields required for any save (draft or update). */
export function validateForSave(data) {
  const errors = [];
  if (!data.title) errors.push('Title is required');
  if (!data.slug)  errors.push('Slug is required');
  if (data.slug && !SLUG_RE.test(data.slug)) {
    errors.push('Slug must use only lowercase letters, numbers, and hyphens, with no leading or trailing hyphens');
  }
  return errors;
}

/** Stricter validation applied before publishing an article. */
export function validateForPublish(data) {
  const errors = validateForSave(data);
  if (!data.content) errors.push('Content is required before publishing');
  if (!data.excerpt) errors.push('Excerpt is required before publishing');
  return errors;
}

// ── CATEGORY ──────────────────────────────────────────────────────────────────

/**
 * Sanitise raw category input from the request body.
 * Returns null if the input is not an object.
 */
export function sanitiseCategoryInput(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    name:        sanitiseText(raw.name        ?? ''),
    slug:        sanitiseSlug(raw.slug        ?? ''),
    colour:      sanitiseColour(raw.colour    ?? ''),
    description: sanitiseText(raw.description ?? ''),
  };
}

/** Validate fields required for a category save. */
export function validateCategoryForSave(data) {
  const errors = [];
  if (!data.name) errors.push('Category name is required');
  if (!data.slug) errors.push('Category slug is required');
  if (data.slug && !SLUG_RE.test(data.slug)) {
    errors.push('Slug must use only lowercase letters, numbers, and hyphens');
  }
  return errors;
}
