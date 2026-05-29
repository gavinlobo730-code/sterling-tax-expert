/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — App shell
   Navigation, breadcrumbs, mobile nav, toast, loader, router
   ─────────────────────────────────────────────────────────── */

// ── Routing state ──────────────────────────────────────────
let CURRENT_PAGE = 'home';
let CURRENT_CALC = null;
let CURRENT_POST = null;
let NAV_HISTORY = [];

// ── Loader / Toast ─────────────────────────────────────────
function showLoader(cb, delay = 240){
  const l = document.getElementById('loader');
  l.classList.add('on');
  setTimeout(() => { l.classList.remove('on'); if (cb) cb(); }, delay);
}
function showToast(msg, type=''){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(window._toastT);
  window._toastT = setTimeout(() => t.className = 'toast', 3000);
}

// ── Navigation ─────────────────────────────────────────────
function navigate(page, param = null, opts = {}){
  if (!opts.skipHistory && CURRENT_PAGE) {
    NAV_HISTORY.push({ page: CURRENT_PAGE, calc: CURRENT_CALC, post: CURRENT_POST });
    if (NAV_HISTORY.length > 30) NAV_HISTORY.shift();
  }
  showLoader(() => {
    document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
    let target = 'page-' + page;
    if (page === 'calc')    target = 'page-calc';
    if (page === 'post')    target = 'page-post';
    if (page === 'article') target = 'page-article';
    const pg = document.getElementById(target);
    if (pg) {
      pg.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    CURRENT_PAGE = page;
    if (page === 'calc') CURRENT_CALC = param;
    if (page === 'post') CURRENT_POST = param;

    updateNavActive(page);
    updateBreadcrumbs(page, param);
    closeMobileMenu();

    // Per-page mounts
    if (page === 'home') mountHome();
    if (page === 'services') mountServices();
    if (page === 'tools') mountTools();
    if (page === 'insights') mountInsights();
    if (page === 'post') mountPost(param);
    if (page === 'deadlines') mountDeadlines();
    if (page === 'about') mountAbout();
    if (page === 'contact') mountContact();
    if (page === 'admin')   mountAdmin();
    if (page === 'calc')    mountCalc(param);
    if (page === 'article') mountArticle(param);

    // Reading bar
    const rb = document.getElementById('rbar');
    if (rb) rb.style.width = '0';
    if (page === 'post' || page === 'article') startReadingProgress();
  }, 220);
}

function goBack(){
  if (NAV_HISTORY.length > 0) {
    const prev = NAV_HISTORY.pop();
    navigate(prev.page, prev.calc || prev.post, { skipHistory: true });
  } else {
    navigate('home', null, { skipHistory: true });
  }
}

function updateNavActive(page){
  document.querySelectorAll('.nl').forEach(x => x.classList.remove('on'));
  document.querySelectorAll('.mob a').forEach(x => x.classList.remove('on'));
  const map = {
    home:'nl-home', services:'nl-services', tools:'nl-tools-link', calc:'nl-tools-link',
    insights:'nl-insights', post:'nl-insights', article:'nl-insights', deadlines:'nl-deadlines',
    about:'nl-about', contact:'nl-contact'
  };
  const cls = map[page];
  if (cls) document.querySelectorAll('.' + cls).forEach(x => x.classList.add('on'));
}

// ── Breadcrumbs ────────────────────────────────────────────
function updateBreadcrumbs(page, param){
  const crumbs = {
    home: null,
    services: [{ l:'Home', p:'home' }, { l:'Services', h:1 }],
    tools: [{ l:'Home', p:'home' }, { l:'Free tools', h:1 }],
    calc: param ? [
      { l:'Home', p:'home' },
      { l:'Free tools', p:'tools' },
      { l: (window.TOOLS.find(t => t.id === param) || {}).title || 'Calculator', h:1 }
    ] : null,
    insights: [{ l:'Home', p:'home' }, { l:'Insights', h:1 }],
    post: param ? [
      { l:'Home', p:'home' },
      { l:'Insights', p:'insights' },
      { l: postTitle(param), h:1 }
    ] : null,
    deadlines: [{ l:'Home', p:'home' }, { l:'Deadlines', h:1 }],
    about: [{ l:'Home', p:'home' }, { l:'About', h:1 }],
    contact: [{ l:'Home', p:'home' }, { l:'Contact', h:1 }],
    admin:   [{ l:'Home', p:'home' }, { l:'Admin', h:1 }],
    article: param ? [
      { l:'Home', p:'home' },
      { l:'Insights', p:'insights' },
      { l: param, h:1 },
    ] : null,
  };
  const path = crumbs[page];
  const wraps = document.querySelectorAll('.crumbs');
  wraps.forEach(w => {
    if (!path) { w.style.display = 'none'; return; }
    w.style.display = '';
    const back = NAV_HISTORY.length > 0
      ? `<a class="crumbs-back" onclick="goBack()">← Back</a>`
      : '';
    const items = path.map((c, i) => {
      const isLast = i === path.length - 1;
      const link = c.p && !isLast ? `<a onclick="navigate('${c.p}')">${c.l}</a>` : `<span class="here">${truncate(c.l, 50)}</span>`;
      return link + (isLast ? '' : '<span class="sep">›</span>');
    }).join('');
    w.innerHTML = back + items;
  });
}

function postTitle(id){
  const posts = window.cmsPosts ? window.cmsPosts() : (window.SEED_POSTS || []);
  const post = posts.find(p => p.id == id);
  return post ? post.t : 'Article';
}
function truncate(s, n){ return s && s.length > n ? s.slice(0, n - 1) + '…' : s; }

// ── Mobile menu ────────────────────────────────────────────
function toggleMobileMenu(){
  const m = document.getElementById('mob');
  const h = document.getElementById('ham');
  m.classList.toggle('open');
  h.classList.toggle('open', m.classList.contains('open'));
}
function closeMobileMenu(){
  const m = document.getElementById('mob');
  const h = document.getElementById('ham');
  if (m) m.classList.remove('open');
  if (h) h.classList.remove('open');
}

// ── Reading bar (post) ─────────────────────────────────────
function startReadingProgress(){
  const b = document.getElementById('rbar');
  if (!b) return;
  function sc(){
    const h = document.body.scrollHeight - innerHeight;
    b.style.width = (h > 0 ? Math.min(scrollY / h * 100, 100) : 0) + '%';
  }
  if (window._rph) window.removeEventListener('scroll', window._rph);
  window._rph = sc;
  window.addEventListener('scroll', sc);
  sc();
}

// ── Number formatting ──────────────────────────────────────
function fmt2(n, dp = 2){
  if (!isFinite(n)) n = 0;
  return '£' + Math.abs(n).toFixed(dp).replace(/\B(?=(\d{3})+(?!\d))/g, ',') * (n < 0 ? -1 : 1);
}
function fmt(n, dp = 2){
  if (!isFinite(n)) n = 0;
  const sign = n < 0 ? '-' : '';
  return sign + '£' + Math.abs(n).toFixed(dp).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function fmtInt(n){
  if (!isFinite(n)) n = 0;
  return n.toLocaleString('en-GB', { maximumFractionDigits:0 });
}

// ── Donut SVG ──────────────────────────────────────────────
function donutSVG(data, total, opts = {}){
  const R = opts.r || 54, cx = 70, cy = 70, stroke = opts.stroke || 22;
  const circ = 2 * Math.PI * R;
  let offset = 0;
  const slices = data.map(d => {
    const pct = total > 0 ? d.val / total : 0;
    const dash = pct * circ;
    const gap = circ - dash;
    const s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${d.color}" stroke-width="${stroke}" stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}" stroke-dashoffset="${(circ - offset).toFixed(2)}" style="transition:all .5s ease"/>`;
    offset += dash; return s;
  });
  const main = data[0] || { val:0 };
  const pct = total > 0 ? (main.val / total * 100).toFixed(0) : 0;
  return `<svg class="donut-svg" width="140" height="140" viewBox="0 0 140 140">
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--g100)" stroke-width="${stroke}"/>
    ${slices.join('')}
    <text x="${cx}" y="${cy-6}" text-anchor="middle" font-size="11" fill="var(--t3)">${opts.label || main.name || ''}</text>
    <text x="${cx}" y="${cy+10}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--navy)" font-family="Inter,system-ui,sans-serif">${pct}%</text>
  </svg>`;
}

// ── Bar chart (horizontal) ─────────────────────────────────
function barChart(rows){
  const max = Math.max(...rows.map(r => r.v), 1);
  return rows.map(r => `
    <div style="display:flex;align-items:center;gap:9px;font-size:12px;margin-bottom:7px">
      <div style="width:120px;color:var(--t2);flex-shrink:0">${r.l}</div>
      <div style="flex:1;height:8px;background:var(--g100);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${(r.v/max*100).toFixed(1)}%;background:${r.c||'var(--blue2)'};border-radius:4px;transition:width .5s ease"></div>
      </div>
      <div style="width:80px;text-align:right;color:var(--navy);font-weight:700;font-family:var(--mono);font-size:11.5px">${fmt(r.v,0)}</div>
    </div>
  `).join('');
}

// ── Print summary ──────────────────────────────────────────
function printSummary(){
  document.body.classList.add('printing');
  window.print();
  setTimeout(() => document.body.classList.remove('printing'), 500);
}

// ── Scroll shadow ──────────────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) nav.classList.toggle('scrolled', scrollY > 8);
});

// ── Contact form ────────────────────────────────────────────
// Primary:  POST /api/enquiry (Worker — stores in D1, sends via Resend)
// Fallback: EmailJS (requires config.emailjs keys to be filled in)
// Last resort: mailto link pre-addressed to the Sterling inbox
async function submitContact(){
  const cfg = window.STERLING_CONFIG || {};
  const get = id => (document.getElementById(id) || {}).value || '';
  const fn = get('cf-fn').trim();
  const ln = get('cf-ln').trim();
  const em = get('cf-em').trim();
  const ph = get('cf-ph').trim();
  const sv = get('cf-sv');
  const msg = get('cf-msg').trim();
  const honey = get('cf-website').trim();

  if (honey) return;

  if (!fn || !em || !sv) { showToast('Please fill in all required fields', 'err'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { showToast('Please enter a valid email address', 'err'); return; }
  if (msg.length > 2000) { showToast('Message is too long (max 2000 characters)', 'err'); return; }

  const btn = document.getElementById('cf-submit');
  if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; btn.style.opacity = '0.7'; }

  const name    = (fn + ' ' + ln).trim();
  const payload = { name, email: em, phone: ph || null, service: sv, message: msg || null };

  function onSuccess() {
    const suc = document.getElementById('cf-suc');
    if (suc) suc.classList.add('show');
    if (btn) btn.textContent = 'Sent ✓';
    showToast("Enquiry sent — we'll be in touch within 48 hours", 'ok');
    ['cf-fn','cf-ln','cf-em','cf-ph','cf-msg'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
    const sel = document.getElementById('cf-sv'); if (sel) sel.value = '';
  }

  function onFail(errMsg) {
    if (btn) { btn.textContent = 'Send enquiry →'; btn.disabled = false; btn.style.opacity = '1'; }
    showToast(errMsg || 'Could not send. Please email sterlingtaxexpert@gmail.com directly.', 'err');
  }

  // ── 1. Try Worker endpoint ──────────────────────────────
  const apiBase = (cfg.cmsApiBase || '/api').replace(/\/api$/, '');
  try {
    const res = await fetch(apiBase + '/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) { onSuccess(); return; }
    // 4xx = validation error from Worker — surface to user, do not fall through
    if (res.status >= 400 && res.status < 500) {
      const data = await res.json().catch(() => ({}));
      onFail(data.error || 'Please check your details and try again.');
      return;
    }
    // 5xx — fall through to EmailJS
  } catch (_) { /* network error or timeout — fall through */ }

  // ── 2. Fallback: EmailJS ────────────────────────────────
  const ejs = cfg.emailjs || {};
  if (window.emailjs && ejs.publicKey && !/^YOUR_/.test(ejs.publicKey) &&
      ejs.serviceId && !/^YOUR_/.test(ejs.serviceId) &&
      ejs.templateId && !/^YOUR_/.test(ejs.templateId)) {
    try {
      await window.emailjs.send(ejs.serviceId, ejs.templateId, {
        from_name: name,
        reply_to:  em,
        phone:     ph || 'Not provided',
        service:   sv,
        message:   msg || '',
        to_email:  cfg.contactEmail || 'sterlingtaxexpert@gmail.com',
      });
      onSuccess();
      return;
    } catch (_) { /* EmailJS failed — fall through to mailto */ }
  }

  // ── 3. Last resort: mailto ──────────────────────────────
  const to      = cfg.contactEmail || 'sterlingtaxexpert@gmail.com';
  const subject = encodeURIComponent('Website enquiry — ' + sv);
  const body    = encodeURIComponent(
    'Name: ' + name + '\nEmail: ' + em +
    (ph ? '\nPhone: ' + ph : '') +
    '\nService: ' + sv +
    (msg ? '\n\nMessage:\n' + msg : '')
  );
  window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body;
  if (btn) { btn.textContent = 'Send enquiry →'; btn.disabled = false; btn.style.opacity = '1'; }
}

// ── FAQ toggle ─────────────────────────────────────────────
function toggleFAQ(i){
  const a = document.getElementById('fa' + i);
  const q = document.getElementById('fq' + i);
  const open = a.classList.contains('open');
  document.querySelectorAll('.faq-a').forEach(x => x.classList.remove('open'));
  document.querySelectorAll('.faq-q').forEach(x => x.classList.remove('open'));
  if (!open) { a.classList.add('open'); q.classList.add('open'); }
}

// ── Init ───────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Path-based routing for /insights/:slug (Cloudflare Pages serves these via _redirects)
  const pathMatch = location.pathname.match(/^\/insights\/([^/]+)\/?$/);
  if (pathMatch) {
    mountHome();
    updateNavActive('article');
    navigate('article', decodeURIComponent(pathMatch[1]), { skipHistory: true });
    return;
  }

  // Mount home content immediately (default page)
  mountHome();
  updateNavActive('home');
  updateBreadcrumbs('home');
  if (typeof updateAccountWidget === 'function') updateAccountWidget();

  // Allow URL hash routing for sharing/deep-linking
  const h = location.hash.replace('#', '');
  if (h && h !== 'home') {
    const [page, param] = h.split('/');
    if (page) navigate(page, param || null, { skipHistory: true });
  }
});

window.addEventListener('hashchange', () => {
  const h = location.hash.replace('#', '');
  if (h) {
    const [page, param] = h.split('/');
    if (page && page !== CURRENT_PAGE) navigate(page, param || null);
  }
});
