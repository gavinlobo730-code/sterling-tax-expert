/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Page mounts
   Home, Services, Tools, Insights, Post, Deadlines, About, Contact
   ─────────────────────────────────────────────────────────── */

// ─────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────
function mountHome(){

  // ── Section 1: Trust & Credibility ──────────────────────
  const trust = document.getElementById('home-trust');
  if (trust) trust.innerHTML = `
    <section class="hp-trust">
      <div class="hp-inner">
        <div class="hp-trust-grid ta-stagger">
          <div class="hp-trust-item ta-up">
            <div class="hp-trust-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"/></svg>
            </div>
            <div class="hp-trust-body">
              <div class="hp-trust-heading">HMRC-Aligned Advice</div>
              <p class="hp-trust-text">Every recommendation reflects current UK tax legislation and HMRC guidance, updated for the 2026/27 tax year.</p>
            </div>
          </div>
          <div class="hp-trust-item ta-up">
            <div class="hp-trust-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
            </div>
            <div class="hp-trust-body">
              <div class="hp-trust-heading">End-to-End Tax &amp; Payroll Support</div>
              <p class="hp-trust-text">Payroll, self assessment, corporation tax, VAT, CIS and advisory services managed under one roof.</p>
            </div>
          </div>
          <div class="hp-trust-item ta-up">
            <div class="hp-trust-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div class="hp-trust-body">
              <div class="hp-trust-heading">Personalised Service</div>
              <p class="hp-trust-text">Your circumstances drive the advice, not a template. We take time to understand your situation before making any recommendation.</p>
            </div>
          </div>
          <div class="hp-trust-item ta-up">
            <div class="hp-trust-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 5.18 2 2 0 0 1 5.07 3h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L9.91 10.9a16 16 0 0 0 6.16 6.16l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div class="hp-trust-body">
              <div class="hp-trust-heading">Dedicated Point of Contact</div>
              <p class="hp-trust-text">You speak to the same expert every time. No call centres, no rotating teams — just consistent, reliable professional support.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // ── Section 3: Who We Help ───────────────────────────────
  const audience = document.getElementById('home-audience');
  if (audience) {
    const groups = [
      { icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`, label: 'Individuals' },
      { icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`, label: 'Sole Traders' },
      { icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`, label: 'Contractors' },
      { icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`, label: 'SMEs' },
      { icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`, label: 'Established Businesses' },
      { icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="8" height="14" rx="1"/><rect x="9" y="3" width="6" height="18" rx="1"/><rect x="14" y="9" width="8" height="12" rx="1"/></svg>`, label: 'Complex Structures' },
    ];
    audience.innerHTML = `
      <section class="hp-audience">
        <div class="hp-inner">
          <div class="hp-section-header" style="text-align:center">
            <div class="hp-kicker ta-up">Who We Help</div>
            <h2 class="hp-h2 hp-h2-center ta-up ta-d1">From sole traders to multi-entity businesses —<br>we understand the full range of UK tax complexity</h2>
          </div>
          <div class="hp-audience-row ta-stagger">
            ${groups.map((g, i) => `
              <div class="hp-audience-tile ta-up">
                <div class="hp-audience-icon">${g.icon}</div>
                <div class="hp-audience-label">${g.label}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  // ── Section 4: Why Sterling Tax Expert ──────────────────
  const why = document.getElementById('home-why');
  if (why) {
    const reasons = [
      { h: 'Personalised Service',         b: 'We take the time to understand your specific circumstances — your structure, your goals, your obligations — before offering any advice. You are not a case number.' },
      { h: 'Responsive &amp; Reliable',        b: 'When you have a question, you get an answer promptly. Tax and payroll decisions are often time-critical — we treat them accordingly.' },
      { h: 'Compliance Confidence',        b: 'We stay current with every HMRC update and legislative change — from routine returns to complex multi-entity obligations. Your exposure is managed, year-round.' },
      { h: 'Long-term Relationships',      b: 'The same adviser stays with you as your business evolves — building genuine, deep knowledge of your affairs rather than starting from scratch each year.' },
    ];
    why.innerHTML = `
      <section class="hp-why">
        <div class="hp-inner">
          <div class="hp-section-header">
            <div class="hp-kicker hp-kicker-light ta-left">Why Choose Us</div>
            <h2 class="hp-h2 hp-h2-light ta-left ta-d1">Why clients choose<br>Sterling Tax Expert</h2>
          </div>
          <div class="hp-why-grid ta-stagger">
            ${reasons.map((r, i) => `
              <div class="hp-why-item ta-up">
                <div class="hp-why-heading">${r.h}</div>
                <p class="hp-why-body">${r.b}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  // ── Section 5: How We Work ───────────────────────────────
  const process = document.getElementById('home-process');
  if (process) {
    const steps = [
      { n: '01', h: 'Initial Consultation', b: 'We take time to understand your situation, goals and obligations — no charge, no obligation.' },
      { n: '02', h: 'Tailored Solution',    b: 'We design an approach that fits your specific needs, timeline and circumstances.' },
      { n: '03', h: 'Ongoing Support',      b: 'We remain your dedicated point of contact as your business and tax needs evolve.' },
    ];
    process.innerHTML = `
      <section class="hp-process">
        <div class="hp-inner">
          <div class="hp-section-header" style="text-align:center">
            <div class="hp-kicker ta-up">How We Work</div>
            <h2 class="hp-h2 hp-h2-center ta-up ta-d1">A straightforward process</h2>
          </div>
          <div class="hp-process-steps ta-stagger">
            ${steps.map((s, i) => `
              <div class="hp-step ta-up">
                <div class="hp-step-num">${s.n}</div>
                <div class="hp-step-rule"></div>
                <div class="hp-step-heading">${s.h}</div>
                <p class="hp-step-body">${s.b}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  // ── Section 6: Final CTA ─────────────────────────────────
  const cta = document.getElementById('home-cta');
  if (cta) cta.innerHTML = `
    <section class="hp-cta">
      <div class="hp-inner hp-cta-inner">
        <h2 class="hp-cta-h ta-up">Let&rsquo;s Discuss Your Tax and<br>Payroll Requirements</h2>
        <p class="hp-cta-p ta-up" style="transition-delay:.12s">
          Book a free 30-minute call with a senior UK tax expert. No commitment —
          just a straight conversation about your situation and what good advice looks like for you.
        </p>
        <div class="hp-cta-acts ta-up" style="transition-delay:.24s">
          <button class="btn btn-white" onclick="navigate('contact')">Book a Consultation</button>
          <button class="hp-cta-ghost" onclick="navigate('contact')">Contact Us</button>
        </div>
      </div>
    </section>
  `;

  if (typeof window.initReveal === 'function') setTimeout(window.initReveal, 50);
}


function daysUntil(dateStr){
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(dateStr); target.setHours(0,0,0,0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function toolCardHTML(t){
  return `<div class="tool-card ${t.color}" onclick="navigate('calc','${t.id}')">
    <span class="tool-badge ${t.badge}">${t.badgeText}</span>
    <div class="tool-icon ${t.iconBg}">${t.icon}</div>
    <div class="tool-t">${t.title}</div>
    <div class="tool-d">${t.desc}</div>
    <div class="tool-tags">${t.tags.map(tag => `<span class="ttag">${tag}</span>`).join('')}</div>
  </div>`;
}

function blogCardHTML(a){
  const cc = catColor(a.cat);
  const ic = iconBg(a.cat);
  return `<div class="bc" onclick="navigate('post',${a.id})">
    <div class="bc-th" style="background:${ic.bg}">
      <div class="bc-tg"></div>
      <div class="bc-ti" style="background:${ic.tint}">${a.e}</div>
    </div>
    <div class="bc-body">
      <div class="bc-cat" style="color:${cc}">${a.cat}</div>
      <div class="bc-t">${a.t}</div>
      <div class="bc-ft">
        <span class="bc-m">${a.r || 5} min · ${formatDate(a.d)}</span>
        <span class="bc-r">Read →</span>
      </div>
    </div>
  </div>`;
}

function formatDate(s){
  if (!s) return '';
  try { return new Date(s).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); }
  catch(e) { return s; }
}

function catColor(cat){
  return ({
    'Payroll':'#16A34A', 'VAT':'#EA580C', 'Self assessment':'var(--blue2)',
    'Corporation tax':'#7C3AED', 'CIS':'#B45309', 'Pension':'#0F766E',
    'Bookkeeping':'#0369A1', 'Business advisory':'#0F766E',
  })[cat] || 'var(--blue2)';
}
function iconBg(cat){
  return ({
    'Payroll':         {bg:'#F0FDF4',     tint:'#DCFCE7'},
    'VAT':             {bg:'#FFF7ED',     tint:'#FFEDD5'},
    'Self assessment': {bg:'var(--bluel)',tint:'var(--bluel2)'},
    'Corporation tax': {bg:'#F5F3FF',     tint:'#EDE9FE'},
    'CIS':             {bg:'#FFFBEB',     tint:'#FEF3C7'},
    'Pension':         {bg:'#F0FDFA',     tint:'#CCFBF1'},
    'Bookkeeping':     {bg:'#F0F9FF',     tint:'#E0F2FE'},
    'Business advisory':{bg:'#F0FDFA',    tint:'#CCFBF1'},
  })[cat] || {bg:'var(--bluel)', tint:'var(--bluel2)'};
}

// ─────────────────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────────────────
function mountServices(){
  const wrap = document.getElementById('page-services');
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="crumbs"></div>
    <div style="background:var(--g50);border-bottom:1px solid var(--br)">
      <div style="max-width:1280px;margin:0 auto;padding:48px 28px">
        <div class="eyebrow ey-blue ta-left">Services</div>
        <h1 class="ta-left ta-d1" style="font-family:var(--sans);font-size:34px;font-weight:800;color:var(--navy);letter-spacing:-1.2px;margin-bottom:11px">Eight pillars of UK tax expertise</h1>
        <p class="ta-left ta-d2" style="font-size:14.5px;color:var(--t2);max-width:560px;line-height:1.75">Full-service accounting for limited companies, sole traders and partnerships. Every engagement is fixed-fee, with a named senior accountant assigned from day one.</p>
      </div>
    </div>
    <div class="sec"><div class="sec-inner">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px" class="ta-stagger">
        ${(window.SVCS || []).map(s => `
          <div class="ta-up" style="background:var(--w);border:1px solid var(--br);border-radius:var(--r);padding:24px;transition:border-color .15s,box-shadow .15s,transform .15s;cursor:pointer" onmouseover="this.style.borderColor='var(--blue2)';this.style.boxShadow='var(--shadow)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--br)';this.style.boxShadow='none';this.style.transform='translateY(0)'" onclick="navigate('contact')">
            <div style="width:42px;height:42px;background:var(--bluel);border-radius:10px;display:grid;place-items:center;font-size:19px;margin-bottom:14px">${s.icon}</div>
            <div style="font-family:var(--sans);font-size:16px;font-weight:700;color:var(--navy);margin-bottom:8px">${s.t}</div>
            <div style="font-size:12.5px;color:var(--t3);line-height:1.65;margin-bottom:14px">${s.d}</div>
            <div style="display:flex;flex-wrap:wrap;gap:5px">${s.tags.map(tag => `<span class="ttag">${tag}</span>`).join('')}</div>
          </div>
        `).join('')}
      </div>
    </div></div>
    ${renderCTABand()}
    ${renderFooter()}
  `;
  updateBreadcrumbs('services');
  if (typeof window.initReveal === 'function') setTimeout(window.initReveal, 50);
}

// ─────────────────────────────────────────────────────────
// TOOLS HUB
// ─────────────────────────────────────────────────────────
let CURRENT_TOOL_CAT = 'All';
function mountTools(){
  const wrap = document.getElementById('page-tools');
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="crumbs"></div>
    <div class="tools-hero">
      <div class="th-bg"></div><div class="th-glow"></div>
      <div class="th-inner">
        <div>
          <div class="th-kicker ta-up">⚡ ${window.TAX_YEAR_LABEL}</div>
          <h1 class="th-h ta-up ta-d1">UK payroll &amp; tax tools — <em>built on HMRC rates</em></h1>
          <p class="th-p ta-up ta-d2">${window.TOOLS.length} fully-functional calculators for payroll, statutory pay, compliance and tax — every one updated for the 2026/27 UK tax year.</p>
          <div class="th-acts">
            <button class="btn btn-blue" style="padding:11px 18px;font-size:13px" onclick="navigate('calc','paye')">Try the PAYE calculator</button>
            <button class="btn btn-white" style="padding:11px 18px;font-size:13px" onclick="navigate('deadlines')">View deadlines hub →</button>
          </div>
        </div>
        <div class="th-stats">
          <div class="th-stat"><div><div class="th-stat-n">${window.TOOLS.length}</div><div class="th-stat-l">Free calculators</div></div></div>
          <div class="th-stat"><div><div class="th-stat-n">2026/27</div><div class="th-stat-l">Tax year covered</div></div></div>
          <div class="th-stat"><div><div class="th-stat-n">£0</div><div class="th-stat-l">Cost · no signup</div></div></div>
        </div>
      </div>
    </div>
    <div class="sec"><div class="sec-inner">
      <div class="row-hdr">
        <div>
          <div class="eyebrow ey-blue">Latest HMRC rates</div>
          <div class="sec-h" style="margin-bottom:0">Current 2026/27 figures</div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="navigate('deadlines')">All deadlines →</button>
      </div>
      <div class="rates-grid">${(window.RATES_HEADLINE || []).map(r => `
        <div class="rate-card">
          <div class="rc-label">${r.l}</div>
          <div class="rc-rate">${r.r}</div>
          <div class="rc-sub">${r.s}</div>
          <div class="rc-upd">✓ ${r.u}</div>
        </div>
      `).join('')}</div>
    </div></div>
    <div class="sec bg-g25"><div class="sec-inner">
      <div class="row-hdr">
        <div>
          <div class="eyebrow ey-blue">Calculators</div>
          <div class="sec-h" style="margin-bottom:0">All free tools</div>
        </div>
      </div>
      <div class="tools-cats" id="tools-cats">
        ${(window.TOOL_CATS || []).map(c => `
          <button class="tcat-btn ${c===CURRENT_TOOL_CAT?'on':''}" onclick="setToolCat('${c}')">${c}</button>
        `).join('')}
      </div>
      <div class="tools-search-wrap">
        <input type="text" id="tools-search" placeholder="Search tools…" oninput="filterTools(this.value)" class="tools-search-input">
      </div>
      <div class="tools-grid" id="tools-grid"></div>
    </div></div>
    ${renderCTABand()}
    ${renderFooter()}
  `;
  renderToolsGrid();
  updateBreadcrumbs('tools');
  if (typeof window.initReveal === 'function') setTimeout(window.initReveal, 50);
}
function setToolCat(c){
  CURRENT_TOOL_CAT = c;
  document.querySelectorAll('.tcat-btn').forEach(b => b.classList.toggle('on', b.textContent === c));
  renderToolsGrid();
}
function renderToolsGrid(){
  const grid = document.getElementById('tools-grid');
  if (!grid) return;
  const items = CURRENT_TOOL_CAT === 'All' ? window.TOOLS : window.TOOLS.filter(t => t.cat === CURRENT_TOOL_CAT);
  grid.innerHTML = items.map(t => toolCardHTML(t)).join('');
}
function filterTools(query) {
  var q = (query || '').toLowerCase().trim();
  var cards = document.querySelectorAll('#tools-grid .tool-card');
  cards.forEach(function(card) {
    var text = card.textContent.toLowerCase();
    card.style.display = (!q || text.indexOf(q) !== -1) ? '' : 'none';
  });
}

// ─────────────────────────────────────────────────────────
// INSIGHTS / BLOG
// ─────────────────────────────────────────────────────────
let CURRENT_BLOG_CAT = 'All';
let CURRENT_BLOG_QUERY = '';
function mountInsights(){
  const wrap = document.getElementById('page-insights');
  if (!wrap) return;
  const posts = (window.cmsPosts ? cmsPosts() : window.SEED_POSTS || []).filter(p => p.st === 'Published');
  const featured = posts[0];
  const cats = ['All', ...new Set(posts.map(p => p.cat))];
  wrap.innerHTML = `
    <div class="crumbs"></div>
    <div style="background:var(--g50);border-bottom:1px solid var(--br)">
      <div style="max-width:1280px;margin:0 auto;padding:42px 28px 32px">
        <div class="eyebrow ey-blue">Insights</div>
        <h1 style="font-family:var(--sans);font-size:32px;font-weight:800;color:var(--navy);letter-spacing:-1px;margin-bottom:14px;text-wrap:balance">UK payroll, tax &amp; compliance — explained plainly</h1>
        <div class="blog-toolbar">
          <div class="blog-search-wrap">
            <span style="color:var(--t3)">🔍</span>
            <input id="blog-search" type="text" placeholder="Search articles..." oninput="searchBlog(this.value)">
          </div>
          <div class="cat-pills" id="cat-pills">
            ${cats.map(c => `<button class="tcat-btn ${c===CURRENT_BLOG_CAT?'on':''}" onclick="setCatFilter('${c}')">${c}</button>`).join('')}
          </div>
        </div>
      </div>
    </div>
    <div class="sec sec-sm"><div class="sec-inner">
      ${featured ? renderFeaturedArticle(featured) : ''}
      <div class="bc-grid" id="blog-grid"></div>
    </div></div>
    ${renderCTABand()}
    ${renderFooter()}
  `;
  renderBlogGrid();
  updateBreadcrumbs('insights');
}
function renderFeaturedArticle(p){
  const cc = catColor(p.cat);
  const ic = iconBg(p.cat);
  return `<div class="featured-art" onclick="navigate('post',${p.id})">
    <div class="fa-thumb" style="background:${ic.bg}">
      <div class="fa-thumb-grid"></div>
      <div class="fa-thumb-ic" style="background:${ic.tint}">${p.e}</div>
    </div>
    <div class="fa-body">
      <div class="fa-tag" style="color:${cc}">⭐ Featured · ${p.cat}</div>
      <h2 class="fa-h">${p.t}</h2>
      <p class="fa-p">${(p.excerpt || stripHTML(p.bodyHTML || '').slice(0, 200) + '…')}</p>
      <div class="fa-meta">
        <span>By <strong style="color:var(--navy)">${p.author || 'Sarah Mitchell'}</strong></span>
        <span>·</span>
        <span>${formatDate(p.d)}</span>
        <span>·</span>
        <span>${p.r || 5} min read</span>
      </div>
    </div>
  </div>`;
}
function stripHTML(html){ const d = document.createElement('div'); d.innerHTML = html; return d.textContent || ''; }
function renderBlogGrid(){
  const all = (window.cmsPosts ? cmsPosts() : window.SEED_POSTS || []).filter(p => p.st === 'Published');
  let filtered = CURRENT_BLOG_CAT === 'All' ? all : all.filter(p => p.cat === CURRENT_BLOG_CAT);
  if (CURRENT_BLOG_QUERY) {
    const q = CURRENT_BLOG_QUERY.toLowerCase();
    filtered = filtered.filter(p => p.t.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q) || stripHTML(p.bodyHTML || '').toLowerCase().includes(q));
  }
  // Skip the featured one we already showed
  filtered = filtered.slice(CURRENT_BLOG_CAT === 'All' && !CURRENT_BLOG_QUERY ? 1 : 0);
  const grid = document.getElementById('blog-grid');
  if (!grid) return;
  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--t3);font-size:13.5px">No articles found${CURRENT_BLOG_QUERY ? ` for "${CURRENT_BLOG_QUERY}"` : ''}.</div>`;
    return;
  }
  grid.innerHTML = filtered.map(p => blogCardHTML(p)).join('');
}
function setCatFilter(c){
  CURRENT_BLOG_CAT = c;
  document.querySelectorAll('#cat-pills .tcat-btn').forEach(b => b.classList.toggle('on', b.textContent === c));
  renderBlogGrid();
}
function searchBlog(v){
  CURRENT_BLOG_QUERY = v;
  renderBlogGrid();
}

// ─────────────────────────────────────────────────────────
// POST (single article)
// ─────────────────────────────────────────────────────────
function mountPost(id){
  const wrap = document.getElementById('page-post');
  if (!wrap) return;
  const posts = window.cmsPosts ? cmsPosts() : (window.SEED_POSTS || []);
  const post = posts.find(p => p.id == id) || posts[0];
  if (!post) {
    wrap.innerHTML = `<div class="crumbs"></div><div class="sec"><h1 class="sec-h">Article not found</h1></div>`;
    return;
  }
  const cc = catColor(post.cat);
  const ic = iconBg(post.cat);
  // bump views
  post.v = (post.v || 0) + 1;
  cmsSavePosts(posts);

  // related — same category
  const related = posts.filter(p => p.cat === post.cat && p.id !== post.id && p.st === 'Published').slice(0, 3);

  wrap.innerHTML = `
    <div class="crumbs"></div>
    <div class="post-head">
      <div class="post-head-inner">
        <div class="post-tags">
          <span class="post-tag" style="color:${cc};background:${ic.tint}">${post.cat}</span>
          ${(post.tags || []).slice(0, 4).map(t => `<span class="post-tag" style="background:var(--g100);color:var(--t3)">${t}</span>`).join('')}
        </div>
        <h1 class="post-h1">${post.t}</h1>
        <div class="post-meta">
          <span>By <strong>${post.author || 'Sarah Mitchell'}</strong></span>
          <span>·</span>
          <span>${formatDate(post.d)}</span>
          <span>·</span>
          <span>${post.r || 5} min read</span>
          <span>·</span>
          <span>${fmtInt(post.v)} views</span>
        </div>
      </div>
    </div>
    <article class="post-body">
      ${post.bodyHTML || `<p>${post.t}</p>`}
      <hr style="margin:32px 0;border:none;border-top:1px solid var(--br)">
      <div style="display:flex;align-items:center;gap:14px;padding:18px;background:var(--g50);border:1px solid var(--br);border-radius:12px;flex-wrap:wrap">
        <div style="width:44px;height:44px;border-radius:50%;background:var(--bluel);display:grid;place-items:center;font-size:18px;flex-shrink:0">📖</div>
        <div style="flex:1;min-width:200px">
          <div style="font-size:13px;font-weight:700;color:var(--navy)">Need help applying this in practice?</div>
          <div style="font-size:12.5px;color:var(--t3);line-height:1.6;margin-top:3px">Book a free 30-minute call with a senior tax advisor.</div>
        </div>
        <button class="btn btn-navy btn-sm" onclick="navigate('contact')">Book free call</button>
      </div>
    </article>
    ${related.length > 0 ? `
      <div class="sec sec-sm bg-g"><div class="sec-inner">
        <div class="row-hdr"><div><div class="eyebrow ey-blue">Related</div><div class="sec-h" style="margin-bottom:0">More on ${post.cat}</div></div><button class="btn btn-ghost btn-sm" onclick="navigate('insights')">All articles →</button></div>
        <div class="bc-grid">${related.map(p => blogCardHTML(p)).join('')}</div>
      </div></div>
    ` : ''}
    ${renderCTABand()}
    ${renderFooter()}
  `;
  updateBreadcrumbs('post', id);
}

// ─────────────────────────────────────────────────────────
// DEADLINES HUB
// ─────────────────────────────────────────────────────────
let CURRENT_DL_VIEW = 'list';
let CURRENT_DL_CAT = 'All';
function mountDeadlines(){
  const wrap = document.getElementById('page-deadlines');
  if (!wrap) return;
  const cats = ['All', ...new Set(window.DEADLINES.map(d => d.cat))];
  wrap.innerHTML = `
    <div class="crumbs"></div>
    <div style="background:var(--g50);border-bottom:1px solid var(--br)">
      <div style="max-width:1280px;margin:0 auto;padding:42px 28px 28px">
        <div class="eyebrow ey-blue">Compliance calendar</div>
        <h1 style="font-family:var(--sans);font-size:32px;font-weight:800;color:var(--navy);letter-spacing:-1px;margin-bottom:11px">UK tax &amp; payroll deadlines hub</h1>
        <p style="font-size:14px;color:var(--t2);max-width:600px;line-height:1.75">All HMRC and statutory deadlines for the 2026/27 tax year. Filter by type, switch between list and calendar view, and export reminders straight to your calendar — Google, Outlook, Apple or any app that reads .ics.</p>
        <div style="display:flex;gap:8px;margin-top:18px;flex-wrap:wrap">
          <button class="btn btn-navy btn-sm" onclick="downloadIcs()">⬇ Download all (.ics)</button>
          <button class="btn btn-ghost btn-sm" onclick="printSummary()">🖨 Print as PDF</button>
        </div>
        <div style="margin-top:22px">
          <div style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--t3);margin-bottom:9px">Export deadlines by category</div>
          <div style="display:flex;gap:7px;flex-wrap:wrap">
            ${['PAYE','RTI','VAT','CIS','Self assessment','Corp tax','Pension'].map(c =>
              `<button class="pa-b" onclick="exportCategoryIcs('${escapeAttr(c)}')" title="Download a .ics file of all ${escapeAttr(c)} deadlines">📅 ${c}</button>`
            ).join('')}
          </div>
        </div>
      </div>
    </div>
    <div class="sec sec-sm"><div class="sec-inner">
      <div class="dh-tabs">
        <button class="dh-tab ${CURRENT_DL_VIEW==='list'?'on':''}" onclick="setDLView('list')">List view</button>
        <button class="dh-tab ${CURRENT_DL_VIEW==='cal'?'on':''}" onclick="setDLView('cal')">Calendar view</button>
        <button class="dh-tab ${CURRENT_DL_VIEW==='cards'?'on':''}" onclick="setDLView('cards')">Card view</button>
        <div style="flex:1"></div>
        <select class="ci-select" style="width:220px;margin-bottom:9px" id="dl-cat" onchange="setDLCat(this.value)">
          ${cats.map(c => `<option value="${c}" ${c===CURRENT_DL_CAT?'selected':''}>${c}</option>`).join('')}
        </select>
      </div>
      <div id="dl-content"></div>
    </div></div>
    <div class="sec sec-sm" style="background:var(--g50);border-top:1px solid var(--br)">
      <div class="sec-inner">
        <div class="eyebrow ey-blue" style="margin-bottom:10px">Companies House</div>
        <h2 style="font-family:var(--sans);font-size:22px;font-weight:800;color:var(--navy);letter-spacing:-0.5px;margin-bottom:8px">Company filing deadline lookup</h2>
        <p style="font-size:14px;color:var(--t2);max-width:560px;line-height:1.75;margin-bottom:20px">Search by company name or number to see live filing deadlines direct from Companies House — then export them straight to your calendar.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;max-width:620px">
          <input id="ch-query" class="ci-input no-prefix" type="text" placeholder="Company name or number (e.g. 12345678)" style="flex:1;min-width:220px;padding:10px 14px;border-radius:8px;border:1.5px solid var(--br);font-size:14px;outline:none">
          <button class="btn btn-indigo" onclick="chSearch()" style="white-space:nowrap">🔍 Search</button>
        </div>
        <div id="ch-results" style="margin-top:22px"></div>
      </div>
    </div>
    <div class="sec sec-sm" style="border-top:1px solid var(--br)">
      <div class="sec-inner">
        <div class="eyebrow ey-blue" style="margin-bottom:10px">HMRC VAT</div>
        <h2 style="font-family:var(--sans);font-size:22px;font-weight:800;color:var(--navy);letter-spacing:-0.5px;margin-bottom:8px">VAT number lookup</h2>
        <p style="font-size:14px;color:var(--t2);max-width:560px;line-height:1.75;margin-bottom:20px">Verify any UK VAT number instantly using HMRC's live API — checks registration status, business name and address. Useful before reclaiming input tax from a supplier.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;max-width:620px">
          <input id="vat-query" class="ci-input no-prefix" type="text" placeholder="VAT number (e.g. GB123456789 or 123456789)" style="flex:1;min-width:220px;padding:10px 14px;border-radius:8px;border:1.5px solid var(--br);font-size:14px;outline:none">
          <button class="btn btn-indigo" onclick="vatLookup()" style="white-space:nowrap">🔍 Verify</button>
        </div>
        <div id="vat-results" style="margin-top:22px"></div>
      </div>
    </div>
    ${renderCTABand()}
    ${renderFooter()}
  `;
  renderDLContent();
  updateBreadcrumbs('deadlines');
  setTimeout(() => {
    const q = document.getElementById('ch-query');
    if (q) q.addEventListener('keydown', e => { if (e.key === 'Enter') chSearch(); });
    const v = document.getElementById('vat-query');
    if (v) v.addEventListener('keydown', e => { if (e.key === 'Enter') vatLookup(); });
  }, 100);
}
function setDLView(v){ CURRENT_DL_VIEW = v; mountDeadlines(); }
function setDLCat(c){ CURRENT_DL_CAT = c; renderDLContent(); }

// ── Companies House deadline lookup ───────────────────────
async function chFetch(path) {
  const res = await fetch('/api/ch?path=' + encodeURIComponent(path));
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

async function chSearch() {
  const raw = (document.getElementById('ch-query') || {}).value || '';
  const q = raw.trim();
  if (!q) return;
  const out = document.getElementById('ch-results');
  if (!out) return;
  out.innerHTML = '<div style="color:var(--t2);font-size:14px">Searching…</div>';

  try {
    // If it looks like a company number (8 digits, possibly with leading zeros) go direct
    const isNum = /^[0-9A-Za-z]{8}$/.test(q.replace(/\s/g,''));
    if (isNum) {
      await chLoadCompany(q.replace(/\s/g,'').toUpperCase(), out);
    } else {
      const data = await chFetch('/search/companies?q=' + encodeURIComponent(q) + '&items_per_page=8');
      const items = (data.items || []);
      if (!items.length) { out.innerHTML = '<div style="color:var(--t2);font-size:14px">No companies found. Try the company number instead.</div>'; return; }
      out.innerHTML = '<div style="font-size:13px;font-weight:600;color:var(--t2);margin-bottom:10px">Select a company</div>'
        + items.map(c => `
          <div class="ch-result-row" onclick="chLoadCompany('${escapeAttr(c.company_number)}', document.getElementById('ch-results'))">
            <div class="ch-res-name">${escapeHtml(c.title)}</div>
            <div class="ch-res-meta">${escapeHtml(c.company_number)} · ${escapeHtml(c.company_status || '')} · ${escapeHtml((c.address_snippet||'').split(',')[0] || '')}</div>
          </div>`).join('');
    }
  } catch(e) {
    out.innerHTML = '<div style="color:var(--red);font-size:14px">Error: ' + escapeHtml(e.message) + '. Please try again.</div>';
  }
}

async function chLoadCompany(number, out) {
  out.innerHTML = '<div style="color:var(--t2);font-size:14px">Loading company details…</div>';
  try {
    const [profile, filing] = await Promise.all([
      chFetch('/company/' + number),
      chFetch('/company/' + number + '/filing-history?items_per_page=5')
    ]);

    const name = profile.company_name || number;
    const status = profile.company_status || '';
    const type = profile.type || '';
    const inc = profile.date_of_creation || '';
    const addr = profile.registered_office_address || {};
    const addrStr = [addr.address_line_1, addr.address_line_2, addr.locality, addr.postal_code].filter(Boolean).join(', ');

    // Deadlines
    const deadlines = [];
    const ar = profile.annual_return || {};
    const acc = profile.accounts || {};
    const conf = profile.confirmation_statement || {};

    if (conf.next_due) deadlines.push({ label: 'Confirmation statement due', date: conf.next_due, overdue: conf.overdue, icon: '📋' });
    if (conf.next_made_up_to) deadlines.push({ label: 'Confirmation statement made up to', date: conf.next_made_up_to, overdue: false, icon: '📅', note: true });
    if (acc.next_due) deadlines.push({ label: 'Accounts due', date: acc.next_due, overdue: acc.overdue, icon: '📊' });
    if (acc.next_accounts && acc.next_accounts.due_on) deadlines.push({ label: 'Accounts due', date: acc.next_accounts.due_on, overdue: acc.next_accounts.overdue, icon: '📊' });
    if (acc.next_accounts && acc.next_accounts.period_end_on) deadlines.push({ label: 'Accounts period end', date: acc.next_accounts.period_end_on, overdue: false, icon: '📅', note: true });

    // Remove duplicates by label
    const seen = new Set();
    const unique = deadlines.filter(d => { if (seen.has(d.label)) return false; seen.add(d.label); return true; });

    const dlRows = unique.length ? unique.map(d => {
      const dObj = new Date(d.date);
      const diff = Math.ceil((dObj - new Date()) / 86400000);
      const badge = d.overdue
        ? '<span style="background:#FEE2E2;color:#DC2626;font-size:11px;font-weight:700;padding:2px 7px;border-radius:4px;margin-left:8px">OVERDUE</span>'
        : diff <= 30
          ? '<span style="background:#FEF3C7;color:#D97706;font-size:11px;font-weight:700;padding:2px 7px;border-radius:4px;margin-left:8px">Due soon</span>'
          : '<span style="background:#DCFCE7;color:#16A34A;font-size:11px;font-weight:700;padding:2px 7px;border-radius:4px;margin-left:8px">On track</span>';
      return `<div class="ch-dl-row">
        <span class="ch-dl-icon">${d.icon}</span>
        <div class="ch-dl-info">
          <div class="ch-dl-label">${escapeHtml(d.label)}${d.note ? '' : badge}</div>
          <div class="ch-dl-date">${dObj.toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}${!d.note && diff >= 0 ? ' <span style="color:var(--t3)">(' + diff + ' days)</span>' : ''}</div>
        </div>
      </div>`;
    }).join('') : '<div style="color:var(--t2);font-size:14px;padding:12px 0">No upcoming deadline data available for this company.</div>';

    // Build .ics for this company's deadlines
    const exportable = unique.filter(d => !d.note && d.date);

    out.innerHTML = `
      <div class="ch-card">
        <div class="ch-card-header">
          <div>
            <div class="ch-card-name">${escapeHtml(name)}</div>
            <div class="ch-card-meta">
              ${escapeHtml(number)} · ${escapeHtml(type)} · <span style="color:${status==='active'?'#16A34A':'#DC2626'};font-weight:600;text-transform:capitalize">${escapeHtml(status)}</span>
              ${inc ? ' · Incorporated ' + new Date(inc).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : ''}
            </div>
            ${addrStr ? `<div class="ch-card-addr">${escapeHtml(addrStr)}</div>` : ''}
          </div>
          <button class="btn btn-ghost btn-sm" onclick="chSearch()" style="white-space:nowrap;margin-top:4px">← Back</button>
        </div>
        <div class="ch-dl-list">${dlRows}</div>
        ${exportable.length ? `
        <div class="ch-card-actions">
          <button class="btn btn-navy btn-sm" onclick="chExportIcs(${JSON.stringify(exportable)}, ${JSON.stringify(name)})">⬇ Download .ics (Google / Outlook / Apple)</button>
          <a class="btn btn-ghost btn-sm" href="https://find-and-update.company-information.service.gov.uk/company/${encodeURIComponent(number)}" target="_blank" rel="noopener">View on Companies House ↗</a>
        </div>` : ''}
      </div>`;
  } catch(e) {
    out.innerHTML = '<div style="color:var(--red);font-size:14px">Could not load company. Check the number and try again. (' + escapeHtml(e.message) + ')</div>';
  }
}

function chExportIcs(deadlines, companyName) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sterling Tax Expert//Companies House Deadlines//EN',
    'X-WR-CALNAME:' + companyName + ' — Companies House deadlines',
    'X-WR-TIMEZONE:Europe/London',
    'CALSCALE:GREGORIAN'
  ];
  deadlines.forEach(d => {
    const dt = d.date.replace(/-/g,'');
    const uid = 'ch-' + dt + '-' + d.label.replace(/\s+/g,'-').toLowerCase() + '@sterling-tax-expert';
    lines.push('BEGIN:VEVENT',
      'UID:' + uid,
      'DTSTART;VALUE=DATE:' + dt,
      'DTEND;VALUE=DATE:' + dt,
      'SUMMARY:' + companyName + ' — ' + d.label,
      'DESCRIPTION:Filing deadline for ' + companyName + ' (' + d.label + '). Via Sterling Tax Expert.',
      'BEGIN:VALARM','TRIGGER:-P14D','ACTION:DISPLAY','DESCRIPTION:14-day reminder: ' + d.label,'END:VALARM',
      'BEGIN:VALARM','TRIGGER:-P7D','ACTION:DISPLAY','DESCRIPTION:7-day reminder: ' + d.label,'END:VALARM',
      'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  triggerDownload(lines.join('\r\n'), companyName.replace(/[^a-z0-9]/gi,'-').toLowerCase() + '-deadlines.ics', 'text/calendar');
  showToast('Calendar file downloaded');
}

function escapeHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── HMRC VAT number lookup ────────────────────────────────
async function vatLookup() {
  const raw = (document.getElementById('vat-query') || {}).value || '';
  // Strip GB prefix and spaces/dashes
  const num = raw.trim().replace(/^GB/i,'').replace(/[\s\-]/g,'');
  const out = document.getElementById('vat-results');
  if (!out) return;

  if (!/^\d{9}(\d{3})?$/.test(num)) {
    out.innerHTML = '<div style="color:var(--red);font-size:14px">Enter a valid UK VAT number — 9 digits, optionally preceded by GB (e.g. GB123456789).</div>';
    return;
  }

  out.innerHTML = '<div style="color:var(--t2);font-size:14px">Verifying with HMRC…</div>';

  try {
    const res = await fetch('https://api.service.hmrc.gov.uk/organisations/vat/check-vat-number/lookup/' + num);
    if (res.status === 404) {
      out.innerHTML = '<div class="vat-card vat-invalid"><div class="vat-status-row"><span class="vat-badge vat-badge-invalid">✗ Not registered</span></div><div class="vat-msg">VAT number <strong>GB' + escapeHtml(num) + '</strong> is not registered for VAT with HMRC.</div></div>';
      return;
    }
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const t = data.target || {};
    const addr = t.address || {};
    const addrParts = [addr.line1, addr.line2, addr.line3, addr.line4, addr.line5, addr.postcode].filter(Boolean);
    const regDate = t.vatRegistrationDate ? new Date(t.vatRegistrationDate).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) : null;

    out.innerHTML = `
      <div class="vat-card vat-valid">
        <div class="vat-status-row">
          <span class="vat-badge vat-badge-valid">✓ Valid VAT number</span>
          <span style="font-size:12px;color:var(--t2)">Source: HMRC live API</span>
        </div>
        <div class="vat-grid">
          <div class="vat-field"><div class="vat-field-label">VAT number</div><div class="vat-field-value">GB${escapeHtml(num)}</div></div>
          <div class="vat-field"><div class="vat-field-label">Business name</div><div class="vat-field-value">${escapeHtml(t.name || '—')}</div></div>
          ${regDate ? `<div class="vat-field"><div class="vat-field-label">VAT registration date</div><div class="vat-field-value">${regDate}</div></div>` : ''}
          ${addrParts.length ? `<div class="vat-field"><div class="vat-field-label">Registered address</div><div class="vat-field-value">${addrParts.map(escapeHtml).join(', ')}</div></div>` : ''}
        </div>
        <div class="vat-disclaimer">This result is from HMRC's live VAT registration API. Always verify supplier VAT numbers before reclaiming input tax.</div>
      </div>`;
  } catch(e) {
    out.innerHTML = '<div style="color:var(--red);font-size:14px">Could not verify — HMRC API may be temporarily unavailable. Try again shortly. (' + escapeHtml(e.message) + ')</div>';
  }
}

function filteredDLs(){
  return window.DEADLINES.filter(d => CURRENT_DL_CAT === 'All' || d.cat === CURRENT_DL_CAT)
    .map(d => ({ ...d, daysUntil: daysUntil(d.date) }))
    .filter(d => d.daysUntil >= -7)  // include recent past for context
    .sort((a,b) => a.daysUntil - b.daysUntil);
}

function renderDLContent(){
  const el = document.getElementById('dl-content');
  if (!el) return;
  if (CURRENT_DL_VIEW === 'list') {
    const items = filteredDLs();
    el.innerHTML = `<div class="dh-list">${items.map(d => {
      const dt = new Date(d.date);
      const urgClass = d.urgency === 'red' ? 'dy-r' : d.urgency === 'amber' ? 'dy-a' : d.urgency === 'blue' ? 'dy-b' : 'dy-g';
      const dayLabel = d.daysUntil < 0 ? `${Math.abs(d.daysUntil)} day${Math.abs(d.daysUntil)!==1?'s':''} ago` : d.daysUntil === 0 ? 'Today' : `${d.daysUntil} day${d.daysUntil!==1?'s':''}`;
      return `<div class="dh-list-row">
        <div class="dh-list-date">${dt.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}<small>${dt.getFullYear()}</small></div>
        <div>
          <div class="dh-list-nm">${d.name}</div>
          <div class="dh-list-ds">${d.desc}</div>
        </div>
        <span class="dh-list-cat ${urgClass}">${d.cat} · ${dayLabel}</span>
        <div class="pa">
          <button class="pa-b" onclick="addToGoogle('${d.date}','${escapeAttr(d.name)}','${escapeAttr(d.desc)}')" title="Add to Google Calendar">📆 Google</button>
          <button class="pa-b" onclick="addToOutlook('${d.date}','${escapeAttr(d.name)}','${escapeAttr(d.desc)}')" title="Add to Outlook Calendar">📧 Outlook</button>
          <button class="pa-b" onclick="downloadSingleIcs('${d.date}','${escapeAttr(d.name)}','${escapeAttr(d.desc)}')" title="Download .ics for Apple Calendar / Outlook desktop / any app"> Apple / .ics</button>
        </div>
      </div>`;
    }).join('')}</div>`;
  } else if (CURRENT_DL_VIEW === 'cards') {
    const items = filteredDLs();
    el.innerHTML = `<div class="dl-grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">${items.map(d => {
      const dt = new Date(d.date);
      const cc = d.urgency === 'red' ? 'dlr' : d.urgency === 'amber' ? 'dlo' : d.urgency === 'blue' ? 'dlb' : 'dlg';
      const dc = d.urgency === 'red' ? 'dy-r' : d.urgency === 'amber' ? 'dy-a' : d.urgency === 'blue' ? 'dy-b' : 'dy-g';
      const dayLabel = d.daysUntil < 0 ? `${Math.abs(d.daysUntil)}d ago` : d.daysUntil === 0 ? 'Today' : `${d.daysUntil} day${d.daysUntil!==1?'s':''}`;
      return `<div class="dl-c ${cc}">
        <div class="dl-dt">${dt.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</div>
        <div class="dl-nm">${d.name}</div>
        <div class="dl-ds">${d.desc}</div>
        <div class="dl-dy ${dc}">${dayLabel}</div>
      </div>`;
    }).join('')}</div>`;
  } else {
    // Calendar view — next 12 weeks rolling
    el.innerHTML = renderCalendarView();
  }
}
function renderCalendarView(){
  // 12-week grid starting from today
  const today = new Date(); today.setHours(0,0,0,0);
  const dow = today.getDay() === 0 ? 6 : today.getDay() - 1; // Mon = 0
  const start = new Date(today); start.setDate(start.getDate() - dow);
  const items = filteredDLs();
  const dlByDate = {};
  items.forEach(d => { (dlByDate[d.date] = dlByDate[d.date] || []).push(d); });

  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const headers = days.map(d => `<div class="dh-cal-h">${d}</div>`).join('');
  const cells = [];
  for (let w = 0; w < 12; w++) {
    for (let d = 0; d < 7; d++) {
      const cur = new Date(start); cur.setDate(cur.getDate() + w*7 + d);
      const iso = cur.toISOString().split('T')[0];
      const isToday = cur.getTime() === today.getTime();
      const out = cur.getMonth() !== (today.getMonth() + Math.floor(w/4)) % 12;
      const events = dlByDate[iso] || [];
      cells.push(`<div class="dh-cal-c ${isToday?'today':''} ${out?'':''}">
        <div class="dh-cal-n">${cur.getDate()}${cur.getDate()===1?' '+cur.toLocaleDateString('en-GB',{month:'short'}):''}</div>
        ${events.slice(0,2).map(e => {
          const c = e.urgency === 'red' ? 'background:#FEE2E2;color:#991B1B' : e.urgency === 'amber' ? 'background:#FEF3C7;color:#92400E' : e.urgency === 'blue' ? 'background:var(--bluel);color:var(--blue)' : 'background:var(--g100);color:var(--t3)';
          return `<div class="dh-cal-tag" style="${c}" title="${escapeAttr(e.name)}">${truncate(e.name, 18)}</div>`;
        }).join('')}
        ${events.length > 2 ? `<div style="font-size:9px;color:var(--t3)">+${events.length-2} more</div>` : ''}
      </div>`);
    }
  }
  return `<div class="dh-cal">${headers}${cells.join('')}</div>`;
}

// ── Calendar export — .ics, Google, Outlook, Apple ─────────
// .ics works for Apple Calendar, Outlook desktop, and any standard
// calendar app. Google and Outlook web get deep links instead.

function downloadSingleIcs(date, name, desc){
  const ics = buildIcs([{ date, name, desc }]);
  triggerDownload(ics, icsFilename(name), 'text/calendar');
  showToast('Calendar file downloaded — open it to add to Apple Calendar or Outlook', 'ok');
}
function downloadIcs(){
  const items = filteredDLs();
  const ics = buildIcs(items);
  triggerDownload(ics, 'sterling-tax-deadlines.ics', 'text/calendar');
  showToast(`${items.length} deadline${items.length!==1?'s':''} exported to .ics`, 'ok');
}
// Export every deadline in a given category (PAYE, VAT, RTI, etc.)
function exportCategoryIcs(cat){
  // "RTI" deadlines are PAYE real-time submissions — match PAYE rows that mention RTI/FPS/EPS,
  // otherwise match the category exactly.
  let items;
  if (cat === 'RTI') {
    items = window.DEADLINES.filter(d =>
      /RTI|FPS|EPS|real.time|PAYE & NIC|monthly PAYE/i.test(d.name + ' ' + d.desc) || d.cat === 'PAYE'
    );
  } else {
    items = window.DEADLINES.filter(d => d.cat === cat);
  }
  if (!items.length){ showToast(`No ${cat} deadlines found`, 'err'); return; }
  const ics = buildIcs(items);
  triggerDownload(ics, `sterling-${cat.toLowerCase().replace(/\s+/g,'-')}-deadlines.ics`, 'text/calendar');
  showToast(`${items.length} ${cat} deadline${items.length!==1?'s':''} exported`, 'ok');
}

// Google Calendar event link (all-day). Reminder is set by the user in Google.
function addToGoogle(date, name, desc){
  const d = date.replace(/-/g,'');
  const next = new Date(date + 'T00:00:00'); next.setDate(next.getDate()+1);
  const end = next.toISOString().slice(0,10).replace(/-/g,'');
  const url = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + '&text=' + encodeURIComponent('Sterling: ' + name)
    + '&dates=' + d + '/' + end
    + '&details=' + encodeURIComponent((desc||'') + '\n\nvia Sterling Tax Expert deadlines hub')
    + '&ctz=Europe/London';
  window.open(url, '_blank', 'noopener');
}
// Outlook web compose link (all-day).
function addToOutlook(date, name, desc){
  const start = date + 'T00:00:00';
  const next = new Date(date + 'T00:00:00'); next.setDate(next.getDate()+1);
  const end = next.toISOString().slice(0,10) + 'T00:00:00';
  const url = 'https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent'
    + '&allday=true'
    + '&startdt=' + encodeURIComponent(start)
    + '&enddt=' + encodeURIComponent(end)
    + '&subject=' + encodeURIComponent('Sterling: ' + name)
    + '&body=' + encodeURIComponent((desc||'') + '\n\nvia Sterling Tax Expert deadlines hub');
  window.open(url, '_blank', 'noopener');
}

function icsFilename(name){
  return 'sterling-' + (name||'deadline').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40) + '.ics';
}
function icsEscape(t){
  return String(t || '').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');
}
function buildIcs(items){
  const stamp = new Date().toISOString().replace(/[-:.]/g,'').slice(0,15) + 'Z';
  const lines = [
    'BEGIN:VCALENDAR','VERSION:2.0',
    'PRODID:-//Sterling Tax Expert//Deadlines//EN',
    'CALSCALE:GREGORIAN','METHOD:PUBLISH',
    'X-WR-CALNAME:Sterling Tax Expert — UK deadlines'
  ];
  items.forEach(it => {
    const date = it.date.replace(/-/g,'');
    const next = new Date(it.date + 'T00:00:00'); next.setDate(next.getDate()+1);
    const end = next.toISOString().slice(0,10).replace(/-/g,'');
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${date}-${Math.random().toString(36).slice(2,8)}@sterlingtaxexpert.co.uk`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART;VALUE=DATE:${date}`);
    lines.push(`DTEND;VALUE=DATE:${end}`);
    lines.push(`SUMMARY:${icsEscape(it.name)}`);
    lines.push(`DESCRIPTION:${icsEscape((it.desc||'') + ' — via Sterling Tax Expert')}`);
    lines.push('TRANSP:TRANSPARENT');
    // 7-day-ahead reminder
    lines.push('BEGIN:VALARM');
    lines.push('TRIGGER:-P7D');
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:${icsEscape('Upcoming: ' + it.name)}`);
    lines.push('END:VALARM');
    // 1-day-ahead reminder
    lines.push('BEGIN:VALARM');
    lines.push('TRIGGER:-P1D');
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:${icsEscape('Tomorrow: ' + it.name)}`);
    lines.push('END:VALARM');
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
function triggerDownload(text, filename, mime){
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─────────────────────────────────────────────────────────
// ABOUT
// ─────────────────────────────────────────────────────────
function mountAbout(){
  const wrap = document.getElementById('page-about');
  if (!wrap) return;

  const principles = [
    { icon:'✓', text:'Every calculator runs in your browser — nothing you enter leaves your device' },
    { icon:'✓', text:'Rates, thresholds and statutory amounts are sourced from HMRC, GOV.UK and Statutory Instruments' },
    { icon:'✓', text:'Every formula is documented inline — open the notes panel on any tool to see the working' },
    { icon:'✓', text:'All tools are updated on 6 April each year, and on any in-year HMRC announcement' },
    { icon:'✓', text:'Estimates and projections are flagged explicitly — nothing is presented as definitive advice' },
    { icon:'✓', text:'Free and accessible — no account, no paywall, no usage caps' },
  ];

  const audiences = [
    { label:'Small businesses', desc:'Run payroll calculations, check employer NI, track compliance deadlines and understand what you owe — without guesswork.' },
    { label:'Company directors', desc:'Model salary vs dividend decisions, understand corporation tax and marginal relief, and keep on top of filing obligations.' },
    { label:'Sole traders', desc:'Calculate self-assessment liability, payments on account, Class 2 and Class 4 NI, and statutory pay entitlements.' },
    { label:'Individuals', desc:'Check your take-home pay, understand your tax position, calculate student loan repayments and plan for the tax year ahead.' },
  ];

  const services = [
    { title:'Payroll', desc:'RTI submissions, P60s, P45s, auto-enrolment and monthly payroll management — fully aligned with 2026/27 rules.' },
    { title:'Accounting', desc:'Management accounts, year-end accounts and cloud bookkeeping, giving you a clear picture of your business throughout the year.' },
    { title:'Self Assessment', desc:'Personal tax returns filed accurately and on time, including sole traders, directors, landlords and those with complex income.' },
    { title:'Compliance', desc:'CIS management, VAT returns, corporation tax and HMRC liaison — keeping your business on the right side of every obligation.' },
  ];

  const toolCount = (window.TOOLS||[]).length;
  const dlCount   = (window.DEADLINES||[]).length;

  wrap.innerHTML = `
    <div class="crumbs"></div>

    <!-- ── Hero ── -->
    <div class="about-hero">
      <div class="about-hero-bg"></div>
      <div class="about-hero-inner">
        <div class="eyebrow ey-indigo-light ta-up">About Sterling Tax Expert</div>
        <h1 class="about-hero-h ta-up ta-d1">Built to make UK tax <em>easier to understand</em></h1>
        <p class="about-hero-p ta-up ta-d2">UK tax rules are precise, frequently updated, and spread across a landscape of HMRC guidance, statutory instruments and Finance Acts. Businesses and individuals deserve clear, accurate, free access to that information — not locked behind paywalls or buried in jargon.</p>
        <p class="about-hero-p ta-up ta-d3" style="margin-top:12px">Sterling Tax Expert exists to provide that access: practical tools, plain-English insights, and professional services — all built on the same foundation of accuracy and transparency.</p>
      </div>
    </div>

    <!-- ── Platform facts strip ── -->
    <div class="about-facts">
      <div class="about-facts-inner">
        <div class="about-fact">
          <div class="about-fact-n">${toolCount}</div>
          <div class="about-fact-l">Free calculators</div>
          <div class="about-fact-s">Live · no signup</div>
        </div>
        <div class="about-fact-sep"></div>
        <div class="about-fact">
          <div class="about-fact-n">${dlCount}</div>
          <div class="about-fact-l">Deadlines tracked</div>
          <div class="about-fact-s">2026/27 calendar</div>
        </div>
        <div class="about-fact-sep"></div>
        <div class="about-fact">
          <div class="about-fact-n">6 Apr</div>
          <div class="about-fact-l">Annual update date</div>
          <div class="about-fact-s">Last updated 2026</div>
        </div>
        <div class="about-fact-sep"></div>
        <div class="about-fact">
          <div class="about-fact-n">£0</div>
          <div class="about-fact-l">Cost to use</div>
          <div class="about-fact-s">Every tool, always free</div>
        </div>
      </div>
    </div>

    <!-- ── Why this platform exists ── -->
    <div class="sec"><div class="sec-inner">
      <div class="about-split">
        <div class="about-split-main">
          <div class="eyebrow ey-blue ta-left">Why it exists</div>
          <div class="sec-h ta-left ta-d1">Accurate tax information should not be a privilege</div>
          <p class="about-body-p ta-left ta-d2">Tax rules in the UK change every April. Rates shift, thresholds move, statutory amounts are updated by statutory instrument. Keeping up requires constant attention to HMRC guidance, GOV.UK publications, and the Finance Acts that underpin them.</p>
          <p class="about-body-p">Most free tools on the internet lag behind by months, apply approximate formulae, or hide the key edge cases — the personal allowance taper above £100,000, the Class 2 NI reform that took effect in April 2024, the day-one SSP entitlement introduced by the Employment Rights Act 2025. These details matter. Getting them wrong costs money.</p>
          <p class="about-body-p">Sterling Tax Expert is built on the principle that clarity and precision are not luxuries. Every calculator documents its source. Every rate is cited. Every known limitation is disclosed. The goal is tools you can actually rely on — and insights that help you understand <em>why</em> the numbers are what they are, not just what they are.</p>
        </div>
        <div class="about-split-side">
          <div class="about-methodology-card">
            <div class="eyebrow ey-blue" style="margin-bottom:14px">How accuracy is maintained</div>
            <ul class="about-method-list">
              ${principles.map(p => `
                <li class="about-method-item">
                  <span class="about-method-ck">✓</span>
                  <span>${p.text}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div></div>

    <!-- ── Who it is for ── -->
    <div class="sec" style="background:var(--g50);border-top:1px solid var(--br);border-bottom:1px solid var(--br)">
      <div class="sec-inner">
        <div style="text-align:center;margin-bottom:40px">
          <div class="eyebrow ey-blue ta-up">Who it is for</div>
          <div class="sec-h ta-up ta-d1">Practical tools for anyone navigating UK tax</div>
          <p class="sec-p ta-up ta-d2" style="margin:0 auto;text-align:center;max-width:520px">Whether you run a business, file your own tax return, or are trying to understand what you actually take home — the platform is built for you.</p>
        </div>
        <div class="about-audience-grid">
          ${audiences.map(a => `
            <div class="about-audience-card">
              <div class="about-audience-label">${a.label}</div>
              <div class="about-audience-desc">${a.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- ── Services ── -->
    <div class="sec"><div class="sec-inner">
      <div class="row-hdr">
        <div>
          <div class="eyebrow ey-blue">Professional services</div>
          <div class="sec-h" style="margin-bottom:0">Beyond the free tools</div>
        </div>
        <button class="btn btn-indigo" onclick="navigate('contact')">Book a free consultation</button>
      </div>
      <p class="about-body-p" style="margin-bottom:32px;max-width:640px">The calculators and insights are free for everyone. For those who want professional support — someone to handle the filings, review the numbers, and be accountable for the outcomes — Sterling Tax Expert offers a focused range of services.</p>
      <div class="about-services-grid">
        ${services.map(s => `
          <div class="about-service-card">
            <div class="about-service-title">${s.title}</div>
            <div class="about-service-desc">${s.desc}</div>
            <button class="btn btn-ghost btn-sm" style="margin-top:16px" onclick="navigate('contact')">Enquire →</button>
          </div>
        `).join('')}
      </div>
    </div></div>

    <!-- ── Transparency note ── -->
    <div class="about-transparency">
      <div class="about-transparency-inner">
        <div class="eyebrow ey-indigo-light" style="margin-bottom:12px">A note on transparency</div>
        <p class="about-transparency-p">This platform does not use fake reviews, fabricated client numbers, invented awards or fictional company history. The credentials here are the tools themselves — if they calculate correctly, cite their sources, and disclose their limitations, that is a more honest signal of quality than anything else we could say about ourselves.</p>
        <p class="about-transparency-p" style="margin-top:12px">If you find an error in a calculator — a wrong rate, a missing edge case, an outdated threshold — please get in touch. Accuracy is the only thing that matters.</p>
        <div style="margin-top:24px">
          <button class="btn btn-indigo" onclick="navigate('contact')">Contact us</button>
          <button class="btn btn-ghost" style="margin-left:9px" onclick="navigate('tools')">Browse free tools</button>
        </div>
      </div>
    </div>

    ${renderCTABand()}
    ${renderFooter()}
  `;
  updateBreadcrumbs('about');
  if (typeof window.initReveal === 'function') setTimeout(window.initReveal, 50);
}

// ─────────────────────────────────────────────────────────
// CONTACT
// ─────────────────────────────────────────────────────────
function mountContact(){
  const wrap = document.getElementById('page-contact');
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="crumbs"></div>
    <div style="background:var(--g50);border-bottom:1px solid var(--br)">
      <div style="max-width:1280px;margin:0 auto;padding:48px 28px">
        <div class="eyebrow ey-blue ta-left">Get in touch</div>
        <h1 class="ta-left ta-d1" style="font-family:var(--sans);font-size:34px;font-weight:800;color:var(--navy);letter-spacing:-1.2px;margin-bottom:11px">Book your free consultation</h1>
        <p class="ta-left ta-d2" style="font-size:14px;color:var(--t2);max-width:520px;line-height:1.8">A free, no-obligation 30-minute call with a senior UK tax expert. We'll assess your situation and recommend the right approach.</p>
      </div>
    </div>
    <div class="sec"><div class="sec-inner">
      <div style="display:grid;grid-template-columns:1fr 340px;gap:36px;align-items:start" class="contact-grid">
        <div class="ta-left ta-d1" style="background:var(--w);border:1px solid var(--br);border-radius:13px;padding:28px">
          <div style="font-family:var(--sans);font-size:18px;font-weight:700;color:var(--navy);margin-bottom:20px">Your details</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:11px">
            <div class="fg"><div class="fl">First name *</div><input class="fi" id="cf-fn" type="text" placeholder="Sarah"></div>
            <div class="fg"><div class="fl">Last name *</div><input class="fi" id="cf-ln" type="text" placeholder="Mitchell"></div>
          </div>
          <div class="fg"><div class="fl">Email address *</div><input class="fi" id="cf-em" type="email" placeholder="sarah@yourbusiness.co.uk" autocomplete="email"></div>
          <div class="fg"><div class="fl">Phone number</div><input class="fi" id="cf-ph" type="tel" placeholder="07700 000000" autocomplete="tel"></div>
          <div class="fg"><div class="fl">Service required *</div>
            <select class="fi fsel" id="cf-sv">
              <option value="">Select...</option>
              ${(window.SVCS || []).map(s => `<option>${s.t}</option>`).join('')}
              <option>General enquiry</option>
            </select>
          </div>
          <div class="fg"><div class="fl">Your message</div><textarea class="fi" id="cf-msg" style="min-height:110px;resize:vertical" placeholder="Tell us about your business and what you're looking for..."></textarea></div>
          <input type="text" id="cf-website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" placeholder="Leave this empty">
          <button class="btn btn-navy" id="cf-submit" style="width:100%;padding:12px" onclick="submitContact()">Send enquiry →</button>
          <div class="succ" id="cf-suc">✓ Enquiry sent — we'll be in touch within 48 hours.</div>
        </div>
        <aside class="ta-right ta-d2">
          <div style="background:var(--w);border:1px solid var(--br);border-radius:var(--r);padding:22px;margin-bottom:14px">
            <div class="eyebrow ey-blue">Quick contact</div>
            <div style="font-family:var(--sans);font-size:17px;font-weight:700;color:var(--navy);margin-bottom:14px">Direct contact</div>
            <div style="font-size:12.5px;color:var(--t2);line-height:1.85">
              <div style="margin-bottom:10px"><strong>✉</strong> <a href="mailto:sterlingtaxexpert@gmail.com" style="color:var(--blue2)">sterlingtaxexpert@gmail.com</a></div>
              <div style="margin-bottom:10px"><strong>💬</strong> Replies within 48 hours, weekdays</div>
              <div><strong>🕐</strong> Mon–Fri, 09:00–18:00 GMT</div>
            </div>
          </div>
          <div style="background:var(--bluel);border:1px solid var(--bluel2);border-radius:var(--r);padding:18px">
            <div style="font-size:12.5px;font-weight:700;color:var(--navy);margin-bottom:6px">⏱ Response time</div>
            <div style="font-size:12px;color:var(--t2);line-height:1.65">All enquiries are responded to within <strong>48 hours</strong> by a named senior accountant. Urgent matters answered same-day.</div>
          </div>
        </aside>
      </div>
    </div></div>
    ${renderFooter()}
  `;
  updateBreadcrumbs('contact');
  if (typeof window.initReveal === 'function') setTimeout(window.initReveal, 50);
}

// ─────────────────────────────────────────────────────────
// Shared bands
// ─────────────────────────────────────────────────────────
function renderCTABand(){
  return `<div class="cta-band">
    <div class="cta-bi">
      <div>
        <div class="cta-bh">Need expert tax advice you can trust?</div>
        <div class="cta-bp">Free 30-minute consultation with a senior UK accountant. Fixed-fee proposals. No pressure.</div>
      </div>
      <div class="cta-ba">
        <button class="btn btn-navy" style="padding:11px 22px;font-size:13px" onclick="navigate('contact')">Book free consultation →</button>
        <div class="cta-note">No credit card · No commitment</div>
      </div>
    </div>
  </div>`;
}

function renderFooter(){
  return `<footer>
    <div class="f-main">
      <div>
        <div class="f-lw">
          <!-- The Pillar mark in footer -->
          <svg width="32" height="32" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0" aria-hidden="true">
            <rect width="48" height="48" rx="11" fill="rgba(255,255,255,0.08)"/>
            <rect x="5" y="7" width="38" height="3.5" rx="1.5" fill="white"/>
            <rect x="5" y="10.5" width="38" height="1.5" rx="0.75" fill="#818CF8"/>
            <rect x="8" y="14" width="7" height="22" rx="1.5" fill="white"/>
            <rect x="20.5" y="14" width="7" height="22" rx="1.5" fill="white"/>
            <rect x="33" y="14" width="7" height="22" rx="1.5" fill="white"/>
            <rect x="5" y="37" width="38" height="3.5" rx="1.5" fill="white"/>
          </svg>
          <div class="f-ln">Sterling Tax Expert</div>
        </div>
        <p class="f-bd">Free HMRC-aligned calculators, the full UK statutory deadlines hub, and plain-English insights. Updated for the 2026/27 tax year.</p>
        <div style="display:flex;align-items:center;gap:7px;background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.25);border-radius:6px;padding:6px 11px;font-size:11px;color:#a5b4fc;width:fit-content">
          <span style="width:6px;height:6px;border-radius:50%;background:#6366F1;box-shadow:0 0 6px rgba(99,102,241,.6)"></span> Live for 2026/27 · refreshed 6 Apr 2026
        </div>
      </div>
      <div class="f-col"><h4>Free tools</h4>
        ${window.TOOLS.slice(0,6).map(t => `<a onclick="navigate('calc','${t.id}')">${t.title.replace(/Calculator|Checker/,'').trim()}</a>`).join('')}
        <a onclick="navigate('tools')" style="color:#818CF8">All tools →</a>
      </div>
      <div class="f-col"><h4>Resources</h4>
        <a onclick="navigate('insights')">Insights</a>
        <a onclick="navigate('deadlines')">Tax deadlines</a>
        <a onclick="navigate('insights');setTimeout(()=>setCatFilter('Payroll'),300)">Payroll guides</a>
        <a onclick="navigate('insights');setTimeout(()=>setCatFilter('VAT'),300)">VAT guides</a>
        <a onclick="navigate('insights');setTimeout(()=>setCatFilter('Corporation tax'),300)">Corp tax guides</a>
      </div>
      <div class="f-col"><h4>Sterling</h4>
        <a onclick="navigate('services')">Services</a>
        <a onclick="navigate('about')">About</a>
        <a onclick="navigate('contact')">Contact</a>
      </div>
    </div>
    <div class="f-bot">
      <span class="f-bl">© 2026 Sterling Tax Expert</span>
      <div class="f-bls">
        <a onclick="navigate('contact')">Contact</a><a>Privacy</a><a>Terms</a>
      </div>
    </div>
    <div class="f-rule"></div>
  </footer>`;
}
