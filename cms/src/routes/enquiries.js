const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitEnquiry(request, env) {
  let body;
  try { body = await request.json(); } catch { return err(400, 'Invalid JSON'); }

  const name    = (body.name    || '').trim();
  const email   = (body.email   || '').trim().toLowerCase();
  const phone   = (body.phone   || '').trim().slice(0, 30);
  const service = (body.service || '').trim();
  const message = (body.message || '').trim().slice(0, 2000);

  if (!name || name.length < 2)   return err(400, 'Please enter your full name.');
  if (!EMAIL_RE.test(email))       return err(400, 'Please enter a valid email address.');
  if (!service)                    return err(400, 'Please select a service.');

  const ip = request.headers.get('CF-Connecting-IP') ||
             request.headers.get('X-Forwarded-For')  || 'unknown';

  // Rate limit: 5 per 15 minutes per IP
  const now   = Math.floor(Date.now() / 1000);
  const win   = now - 900;
  const count = await env.DB.prepare(
    'SELECT COUNT(*) AS c FROM rate_limits WHERE key=? AND created_at>?'
  ).bind('enquiry:' + ip, win).first('c');

  if (count >= 5) return err(429, 'Too many submissions. Please try again in 15 minutes.');

  await env.DB.prepare(
    'INSERT INTO rate_limits (key,created_at) VALUES (?,?)'
  ).bind('enquiry:' + ip, now).run();

  const { meta } = await env.DB.prepare(
    'INSERT INTO enquiries (name,email,phone,service,message,ip,created_at) VALUES (?,?,?,?,?,?,?)'
  ).bind(name, email, phone || null, service, message || null, ip, now).run();

  if (env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + env.RESEND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Sterling Tax Expert <noreply@sterling-tax.co.uk>',
          to:   ['sterlingtaxexpert@gmail.com'],
          reply_to: email,
          subject: 'New enquiry from ' + name + ' — ' + service,
          html: '<p><strong>Name:</strong> ' + esc(name) + '</p>' +
                '<p><strong>Email:</strong> ' + esc(email) + '</p>' +
                (phone ? '<p><strong>Phone:</strong> ' + esc(phone) + '</p>' : '') +
                '<p><strong>Service:</strong> ' + esc(service) + '</p>' +
                (message ? '<p><strong>Message:</strong></p><p>' + esc(message).replace(/\n/g,'<br>') + '</p>' : '') +
                '<hr><p style="color:#888;font-size:12px">Submitted via sterling-tax.co.uk &middot; ID #' + meta.last_row_id + '</p>',
        }),
      });
    } catch (_) { /* email failure is non-fatal */ }
  }

  return new Response(JSON.stringify({ ok: true, id: meta.last_row_id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function err(status, message) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
