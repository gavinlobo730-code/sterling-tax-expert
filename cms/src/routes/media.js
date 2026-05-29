/**
 * Media route handlers — Phase 5
 *
 * All upload/list/delete routes require authentication (called from
 * dispatchAdmin in index.js). The public serve route (/media/:key) is
 * open and proxies R2 objects with long-lived Cache-Control headers.
 *
 * R2 key format: YYYY/MM/<timestamp>-<safe-filename>.<ext>
 * Backups live under the "backups/" prefix and are excluded from listing.
 * Public URL:  /media/YYYY/MM/<timestamp>-<safe-filename>.<ext>
 */

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const ALLOWED_MIME = {
  'image/jpeg':    'jpg',
  'image/jpg':     'jpg',
  'image/png':     'png',
  'image/webp':    'webp',
  'image/gif':     'gif',
  'image/svg+xml': 'svg',
};

const MAX_BYTES  = 5 * 1024 * 1024; // 5 MB
const MAX_FILES  = 200;

// ── PUBLIC SERVE ──────────────────────────────────────────────────────────────

/**
 * GET /media/:key* — publicly serves an R2 media object.
 * key must not traverse directories or touch the backups prefix.
 */
export async function serveMedia(request, env, key) {
  if (!isValidKey(key)) {
    return new Response('Not found', { status: 404 });
  }

  const obj = await env.ASSETS.get(key);
  if (!obj) return new Response('Not found', { status: 404 });

  const ct = obj.httpMetadata?.contentType || 'application/octet-stream';

  // Range request support (browsers need this for large images in <img> tags)
  const rangeHeader = request.headers.get('Range');
  if (rangeHeader) {
    const buf    = await obj.arrayBuffer();
    const total  = buf.byteLength;
    const match  = rangeHeader.match(/bytes=(\d+)-(\d*)/);
    if (match) {
      const start = parseInt(match[1], 10);
      const end   = match[2] ? parseInt(match[2], 10) : total - 1;
      return new Response(buf.slice(start, end + 1), {
        status: 206,
        headers: {
          'Content-Type':  ct,
          'Content-Range': `bytes ${start}-${end}/${total}`,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
  }

  return new Response(obj.body, {
    headers: {
      'Content-Type':  ct,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Robots-Tag':  'noindex',
    },
  });
}

// ── UPLOAD ────────────────────────────────────────────────────────────────────

/**
 * POST /api/admin/media  (multipart/form-data, field name: "file")
 */
export async function uploadMedia(request, env) {
  const ct = request.headers.get('Content-Type') || '';
  if (!ct.includes('multipart/form-data')) {
    return fail('Content-Type must be multipart/form-data');
  }

  let formData;
  try { formData = await request.formData(); }
  catch { return fail('Invalid multipart body'); }

  const file = formData.get('file');
  if (!file || typeof file === 'string') return fail('No file provided');

  const mime = file.type;
  const ext  = ALLOWED_MIME[mime];
  if (!ext) {
    return fail('File type not allowed. Accepted: JPEG, PNG, WebP, GIF, SVG');
  }

  let buffer;
  try { buffer = await file.arrayBuffer(); }
  catch { return fail('Could not read file'); }

  if (buffer.byteLength === 0) return fail('File is empty');
  if (buffer.byteLength > MAX_BYTES) {
    return fail(`File too large — maximum is 5 MB (uploaded ${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB)`);
  }

  const safeName = buildSafeFilename(file.name || 'upload', ext);
  const now      = new Date();
  const yyyy     = now.getUTCFullYear();
  const mm       = String(now.getUTCMonth() + 1).padStart(2, '0');
  const ts       = Date.now();
  const key      = `${yyyy}/${mm}/${ts}-${safeName}`;

  await env.ASSETS.put(key, buffer, {
    httpMetadata: {
      contentType:  mime,
      cacheControl: 'public, max-age=31536000, immutable',
    },
    customMetadata: {
      originalName: file.name,
      uploadedAt:   now.toISOString(),
    },
  });

  return Response.json({
    key,
    url:  `/media/${key}`,
    name: file.name,
    size: buffer.byteLength,
    type: mime,
  }, { status: 201 });
}

// ── LIST ──────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/media
 * Lists all objects that are not in the backups/ prefix.
 */
export async function listMedia(request, env) {
  const list = await env.ASSETS.list({ limit: MAX_FILES });

  const media = (list.objects || [])
    .filter(o => !o.key.startsWith('backups/') && isValidKey(o.key))
    .sort((a, b) => (b.uploaded || 0) - (a.uploaded || 0))
    .map(o => ({
      key:      o.key,
      url:      `/media/${o.key}`,
      size:     o.size,
      uploaded: o.uploaded ? new Date(o.uploaded).toISOString() : null,
    }));

  return Response.json({ media });
}

// ── DELETE ────────────────────────────────────────────────────────────────────

/**
 * DELETE /api/admin/media/:encodedKey
 */
export async function deleteMedia(request, env, key) {
  if (!isValidKey(key)) return fail('Invalid key', 400);

  const obj = await env.ASSETS.head(key);
  if (!obj) return fail('Object not found', 404);

  await env.ASSETS.delete(key);
  return Response.json({ deleted: true });
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function isValidKey(key) {
  if (!key || typeof key !== 'string') return false;
  if (key.includes('..'))             return false;
  if (key.startsWith('backups/'))     return false;
  // Allow only safe path characters
  if (!/^[a-zA-Z0-9/._-]+$/.test(key)) return false;
  return true;
}

function buildSafeFilename(originalName, ext) {
  const base = (originalName || 'upload')
    .replace(/\.[^.]+$/, '')   // strip original extension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'upload';
  return `${base}.${ext}`;
}

function fail(message, status = 400) {
  return Response.json({ error: message }, { status });
}
