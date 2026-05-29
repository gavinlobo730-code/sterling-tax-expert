/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Page mounts
   Home, Services, Tools, Insights, Post, Deadlines, About, Contact
   ─────────────────────────────────────────────────────────── */

// ─────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────
function mountHome(){
  const tools3 = window.TOOLS.slice(0, 6);
  const featured = (window.cmsPosts ? cmsPosts() : window.SEED_POSTS || []).slice(0, 3);

  // tools grid
  const htg = document.getElementById('home-tools-grid');
  if (htg) htg.innerHTML = tools3.map(t => toolCardHTML(t)).join('');

  // HMRC feed
  const hf = document.getElementById('hmrc-feed');
  if (hf) hf.innerHTML = window.HMRC_FEED.map(u => `
    <div class="hmrc-item" onclick="navigate('insights')">
      <div><span class="hpill ${u.pc}">${u.pill}</span></div>
      <div><div class="hmrc-it">${u.t}</div><div class="hmrc-id">${u.d}</div></div>
      <div class="hmrc-im">${u.m}</div>
    </div>
  `).join('');

  // deadlines mini grid (next 4)
  const dg = document.getElementById('home-deadlines');
  if (dg) {
    const upcoming = window.DEADLINES
      .map(d => ({ ...d, daysUntil: daysUntil(d.date) }))
      .filter(d => d.daysUntil >= 0)
      .sort((a,b) => a.daysUntil - b.daysUntil)
      .slice(0, 4);
    dg.innerHTML = upcoming.map(d => {
      const dt = new Date(d.date);
      const cc = d.urgency === 'red' ? 'dlr' : d.urgency === 'amber' ? 'dlo' : d.urgency === 'blue' ? 'dlb' : 'dlg';
      const dc = d.urgency === 'red' ? 'dy-r' : d.urgency === 'amber' ? 'dy-a' : d.urgency === 'blue' ? 'dy-b' : 'dy-g';
      return `<div class="dl-c ${cc}" onclick="navigate('deadlines')">
        <div class="dl-dt">${dt.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</div>
        <div class="dl-nm">${d.name}</div>
        <div class="dl-ds">${d.desc}</div>
        <div class="dl-dy ${dc}">${d.daysUntil === 0 ? 'Today' : d.daysUntil + ' day' + (d.daysUntil!==1?'s':'')}</div>
      </div>`;
    }).join('');
  }

  // blog teasers
  const hbg = document.getElementById('home-blog-grid');
  if (hbg) hbg.innerHTML = featured.map(a => blogCardHTML(a)).join('');

  // FAQ
  const fq = document.getElementById('faq-set');
  if (fq) fq.innerHTML = (window.FAQS || []).map((f, i) => `
    <div class="faq-item">
      <button class="faq-q" onclick="toggleFAQ(${i})" id="fq${i}"><span>${f.q}</span><span class="faq-ch" id="fc${i}">▾</span></button>
      <div class="faq-a" id="fa${i}">${f.a}</div>
    </div>
  `).join('');
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
        <div class="eyebrow ey-blue">Services</div>
        <h1 style="font-family:var(--serif);font-size:34px;font-weight:700;color:var(--navy);letter-spacing:-.5px;margin-bottom:11px">Eight pillars of UK tax expertise</h1>
        <p style="font-size:14.5px;color:var(--t2);max-width:560px;line-height:1.75">Full-service accounting for limited companies, sole traders and partnerships. Every engagement is fixed-fee, with a named senior accountant assigned from day one.</p>
      </div>
    </div>
    <div class="sec"><div class="sec-inner">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px">
        ${(window.SVCS || []).map(s => `
          <div style="background:var(--w);border:1px solid var(--br);border-radius:var(--r);padding:24px;transition:border-color .15s,box-shadow .15s,transform .15s;cursor:pointer" onmouseover="this.style.borderColor='var(--blue2)';this.style.boxShadow='var(--shadow)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--br)';this.style.boxShadow='none';this.style.transform='translateY(0)'" onclick="navigate('contact')">
            <div style="width:42px;height:42px;background:var(--bluel);border-radius:10px;display:grid;place-items:center;font-size:19px;margin-bottom:14px">${s.icon}</div>
            <div style="font-family:var(--serif);font-size:16px;font-weight:700;color:var(--navy);margin-bottom:8px">${s.t}</div>
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
          <div class="th-kicker">⚡ ${window.TAX_YEAR_LABEL}</div>
          <h1 class="th-h">UK payroll &amp; tax tools — <em>built on HMRC rates</em></h1>
          <p class="th-p">${window.TOOLS.length} fully-functional calculators for payroll, statutory pay, compliance and tax — every one updated for the 2026/27 UK tax year.</p>
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
        <h1 style="font-family:var(--serif);font-size:32px;font-weight:700;color:var(--navy);letter-spacing:-.5px;margin-bottom:14px;text-wrap:balance">UK payroll, tax &amp; compliance — explained plainly</h1>
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
        <h1 style="font-family:var(--serif);font-size:32px;font-weight:700;color:var(--navy);letter-spacing:-.5px;margin-bottom:11px">UK tax &amp; payroll deadlines hub</h1>
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
    ${renderCTABand()}
    ${renderFooter()}
  `;
  renderDLContent();
  updateBreadcrumbs('deadlines');
}
function setDLView(v){ CURRENT_DL_VIEW = v; mountDeadlines(); }
function setDLCat(c){ CURRENT_DL_CAT = c; renderDLContent(); }

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
        <div class="eyebrow ey-indigo-light">About Sterling Tax Expert</div>
        <h1 class="about-hero-h">Built to make UK tax <em>easier to understand</em></h1>
        <p class="about-hero-p">UK tax rules are precise, frequently updated, and spread across a landscape of HMRC guidance, statutory instruments and Finance Acts. Businesses and individuals deserve clear, accurate, free access to that information — not locked behind paywalls or buried in jargon.</p>
        <p class="about-hero-p" style="margin-top:12px">Sterling Tax Expert exists to provide that access: practical tools, plain-English insights, and professional services — all built on the same foundation of accuracy and transparency.</p>
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
          <div class="eyebrow ey-blue">Why it exists</div>
          <div class="sec-h">Accurate tax information should not be a privilege</div>
          <p class="about-body-p">Tax rules in the UK change every April. Rates shift, thresholds move, statutory amounts are updated by statutory instrument. Keeping up requires constant attention to HMRC guidance, GOV.UK publications, and the Finance Acts that underpin them.</p>
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
          <div class="eyebrow ey-blue">Who it is for</div>
          <div class="sec-h">Practical tools for anyone navigating UK tax</div>
          <p class="sec-p" style="margin:0 auto;text-align:center;max-width:520px">Whether you run a business, file your own tax return, or are trying to understand what you actually take home — the platform is built for you.</p>
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
        <div class="eyebrow ey-blue">Get in touch</div>
        <h1 style="font-family:var(--serif);font-size:34px;font-weight:700;color:var(--navy);letter-spacing:-.5px;margin-bottom:11px">Book your free consultation</h1>
        <p style="font-size:14px;color:var(--t2);max-width:520px;line-height:1.8">A free, no-obligation 30-minute call with a senior UK tax expert. We'll assess your situation and recommend the right approach.</p>
      </div>
    </div>
    <div class="sec"><div class="sec-inner">
      <div style="display:grid;grid-template-columns:1fr 340px;gap:36px;align-items:start" class="contact-grid">
        <div style="background:var(--w);border:1px solid var(--br);border-radius:13px;padding:28px">
          <div style="font-family:var(--serif);font-size:18px;font-weight:700;color:var(--navy);margin-bottom:20px">Your details</div>
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
        <aside>
          <div style="background:var(--w);border:1px solid var(--br);border-radius:var(--r);padding:22px;margin-bottom:14px">
            <div class="eyebrow ey-blue">Quick contact</div>
            <div style="font-family:var(--serif);font-size:17px;font-weight:700;color:var(--navy);margin-bottom:14px">Direct contact</div>
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
          <!-- Concept A mark in footer: navy bg, S arc, indigo rule -->
          <svg width="32" height="32" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0" aria-hidden="true">
            <rect width="48" height="48" rx="11" fill="rgba(255,255,255,0.08)"/>
            <path d="M15 15 Q24 12 29 18 Q32 22.5 27 26.5 L20 29 Q14.5 31.5 16.5 36.5 Q20 40.5 31 38.5" stroke="white" stroke-width="2.8" stroke-linecap="round" fill="none"/>
            <rect x="9" y="44" width="30" height="2" rx="1" fill="#6366F1"/>
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
