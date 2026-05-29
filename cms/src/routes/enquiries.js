/**
 * Public enquiry submission endpoint — POST /api/enquiry
 *
 * Validates and stores the contact form submission in D1.
 * Optionally sends an email notification via Resend if RESEND_API_KEY is set.
 * Rate-limited by IP: 5 submissions per 15 minutes.
 */

const MAX_PER_WINDOW = 5;
const WINDOW_SECS    = 900; // 15 minutes

export async function submitEnquiry(request, env) {
  // Parse body
  let body;
  try   { body = await request.json(); }
  catch { return err('Invalid JSON', 400); }

  const { name, email, phone, service, message } = body ?? {};

  // Validate required fields
  if (!name  || typeof name    !== 'string' || name.trim().length    < 2)  return err('Name is required', 400);
  if (!email || typeof email   !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return err('Valid email is required', 400);
  if (!service || typeof service !== 'string' || service.trim().length < 2) return err('Service selection is required', 400);
  if (message && typeof message === 'string' && message.length > 2000)      return err('Message too long', 400);

  const cleanName    = name.trim().slice(0, 120);
  const cleanEmail   = email.trim().toLowerCase().slice(0, 254);
  const cleanPhone   = phone  ? String(phone).trim().slice(0, 30)   : null;
  const cleanService = service.trim().slice(0, 120);
  const cleanMessage = message ? String(message).trim().slice(0, 2000) : null;

  const ip = request.headers.get('CF-Connecting-IP') ?? null;

  // Rate limit by IP
  if (ip) {
    try {
      const key = `enquiry:${ip}`;
      const now = Math.floor(Date.now() / 1000);
      const row = await env.DB
        .prepare('SELECT attempts, window_start FROM rate_limits WHERE key = ?')
        .bind(key).first();

      if (row) {
        const inWindow = (now - row.window_start) < WINDOW_SECS;
        if (inWindow && row.attempts >= MAX_PER_WINDOW) {
          return err('Too many submissions. Please try again later.', 429);
        }
        if (inWindow) {
          await env.DB.prepare('UPDATE rate_limits SET attempts = attempts + 1 WHERE key = ?').bind(key).run();
        } else {
          await env.DB.prepare('UPDATE rate_limits SET attempts = 1, window_start = ?, blocked_until = 0 WHERE key = ?').bind(now, key).run();
        }
      } else {
        await env.DB.prepare('INSERT INTO rate_limits (key, attempts, window_start, blocked_until) VALUES (?, 1, ?, 0)').bind(key, now).run();
      }
    } catch { /* rate_limits table may not exist yet — fail open */ }
  }

  // Store in D1
  try {
    await env.DB
      .prepare('INSERT INTO enquiries (name, email, phone, service, message, ip) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(cleanName, cleanEmail, cleanPhone, cleanService, cleanMessage, ip)
      .run();
  } catch (e) {
    console.error('[enquiry] D1 insert failed:', e.message);
    return err('Could not save enquiry. Please try again.', 503);
  }

  // Attempt email notification via Resend (optional — fails gracefully)
  if (env.RESEND_API_KEY) {
    try {
      const html = `
        <h2>New enquiry from ${cleanName}</h2>
        <p><strong>Email:</strong> ${cleanEmail}</p>
        ${cleanPhone ? `<p><strong>Phone:</strong> ${cleanPhone}</p>` : ''}
        <p><strong>Service:</strong> ${cleanService}</p>
        ${cleanMessage ? `<p><strong>Message:</strong><br>${cleanMessage.replace(/\n/g,'<br>')}</p>` : ''}
        <hr>
        <p style="color:#888;font-size:12px">Submitted ${new Date().toISOString()} · IP ${ip ?? 'unknown'}</p>
      `;
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from:    'Sterling Tax Expert <noreply@sterling-tax.co.uk>',
          to:      ['sterlingtaxexpert@gmail.com'],
          subject: `New enquiry: ${cleanService} — ${cleanName}`,
          html,
          reply_to: cleanEmail,
        }),
      });
    } catch (e) {
      // Email failure is non-fatal — enquiry is already stored in D1
      console.error('[enquiry] email notification failed:', e.message);
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function err(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
