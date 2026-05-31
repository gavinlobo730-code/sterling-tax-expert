/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — CMS (Admin)
   ───────────────────────────────────────────────────────────
   Password-gated. Auth via Cloudflare Worker + D1.
   - Posts: create / edit / delete / publish / draft / schedule
   - Rich text editor (contenteditable + execCommand toolbar)
   - Media library (drag-drop / picker, base64 stored locally)
   - SEO metadata per post
   - Categories & tags
   ─────────────────────────────────────────────────────────── */

const STERLING_MEDIA_KEY = 'ste_media_v1';

// ── In-memory article cache (populated on admin load) ───────
let _cmsPostsCache = null;

function cmsLoadPosts(){
  return _cmsPostsCache || [];
}

function cmsSavePosts(posts){
  _cmsPostsCache = posts;
}

window.cmsPosts = () => cmsLoadPosts();

async function cmsRefreshPosts(){
  try {
    const res = await fetch('/api/articles', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      _cmsPostsCache = (data.articles || []).map(a => ({
        id: a.id,
        t: a.title,
        cat: a.category,
        st: a.status.charAt(0).toUpperCase() + a.status.slice(1),
        d: (a.created_at || '').split('T')[0],
        r: Math.max(1, Math.ceil((a.body || '').replace(/<[^>]+>/g,'').split(/\s+/).length / 220)),
        excerpt: a.excerpt || '',
        seoTitle: a.title,
        seoDesc: a.excerpt || '',
        slug: a.slug || '',
        tags: a.tags || [],
        bodyHTML: a.body || '',
        author: a.author || 'Sterling Tax Expert',
        scheduledFor: a.scheduled_at || null,
        e: '📝',
      }));
    }
  } catch(e) {
    _cmsPostsCache = _cmsPostsCache || [];
  }
}

function cmsLoadMedia(){
  const raw = localStorage.getItem(STERLING_MEDIA_KEY);
  if (raw) { try { return JSON.parse(raw); } catch(e) {} }
  return [
    { id:'m1', name:'payroll-chart.png', type:'image/png', size:'48 KB', emoji:'📊', date:'2026-04-01' },
    { id:'m2', name:'invoice-template.png', type:'image/png', size:'32 KB', emoji:'🧾', date:'2026-03-28' },
    { id:'m3', name:'self-assess-cover.jpg', type:'image/jpeg', size:'112 KB', emoji:'📋', date:'2026-03-15' },
    { id:'m4', name:'office-photo.jpg', type:'image/jpeg', size:'215 KB', emoji:'🏢', date:'2026-03-10' },
  ];
}
function cmsSaveMedia(media){
  localStorage.setItem(STERLING_MEDIA_KEY, JSON.stringify(media));
}

// ── Auth ───────────────────────────────────────────────────
let _cmsAuthenticated = false;

function cmsLoggedIn(){
  return _cmsAuthenticated;
}

async function cmsCheckSession(){
  try {
    const res = await fetch('/api/session', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      _cmsAuthenticated = data.authenticated === true;
    } else {
      _cmsAuthenticated = false;
    }
  } catch(e) {
    _cmsAuthenticated = false;
  }
}

async function cmsLogout(){
  try {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
  } catch(e) { /* ignore */ }
  _cmsAuthenticated = false;
  mountAdmin();
  showToast('Signed out');
}

// ── Mount ──────────────────────────────────────────────────
async function mountAdmin(){
  const wrap = document.getElementById('page-admin');
  wrap.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:60vh;color:var(--t3);font-size:14px">Checking session…</div>`;
  await cmsCheckSession();
  if (!cmsLoggedIn()) {
    wrap.innerHTML = renderLogin();
    setTimeout(() => {
      const u = document.getElementById('login-user');
      if (u) u.focus();
    }, 100);
    return;
  }
  await cmsRefreshPosts();
  wrap.innerHTML = renderAdminShell();
  cmsTab('dash');
}

function renderLogin(){
  return `
    <div class="crumbs"></div>
    <div class="login-shell">
      <div class="login-card">
        <div class="login-h">Sterling CMS</div>
        <div class="login-s">Sign in to manage articles, media and SEO.</div>
        <form onsubmit="event.preventDefault();doLogin()">
          <div class="fg">
            <div class="fl">Username</div>
            <input class="fi" id="login-user" type="text" autocomplete="username">
          </div>
          <div class="fg">
            <div class="fl">Password</div>
            <input class="fi" id="login-pass" type="password" autocomplete="current-password" placeholder="•••••••••">
          </div>
          <button class="btn btn-navy" style="width:100%;padding:11px;margin-top:6px" type="submit">Sign in →</button>
        </form>
      </div>
    </div>
  `;
}

async function doLogin(){
  const u = (document.getElementById('login-user').value || '').trim();
  const p = document.getElementById('login-pass').value;
  if (!u || !p) { showToast('Enter your username and password', 'err'); return; }

  const btn = document.querySelector('.login-card button[type="submit"]');
  if (btn) { btn.textContent = 'Signing in…'; btn.disabled = true; }

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p }),
    });
    if (res.ok) {
      _cmsAuthenticated = true;
      await cmsRefreshPosts();
      showLoader(() => {
        const wrap = document.getElementById('page-admin');
        if (wrap) { wrap.innerHTML = renderAdminShell(); cmsTab('dash'); }
        showToast('Welcome back — signed in to Sterling CMS', 'ok');
      });
    } else {
      if (btn) { btn.textContent = 'Sign in →'; btn.disabled = false; }
      showToast('Wrong username or password', 'err');
    }
  } catch(e) {
    if (btn) { btn.textContent = 'Sign in →'; btn.disabled = false; }
    showToast('Could not reach server — check your connection', 'err');
  }
}

function renderAdminShell(){
  const posts = cmsLoadPosts();
  const drafts = posts.filter(p => p.st === 'Draft').length;
  const scheduled = posts.filter(p => p.st === 'Scheduled').length;
  return `
    <div class="crumbs"></div>
    <div class="admin-shell">
      <aside class="adm-sb">
        <div class="adm-sbl">
          <div class="asl-t">Sterling CMS</div>
          <div class="asl-s">Content management</div>
        </div>
        <div class="sb-section">Workspace</div>
        <div class="sb-i on" data-tab="dash" onclick="cmsTab('dash')"><span class="sb-ic">▦</span> Dashboard</div>
        <div class="sb-i" data-tab="posts" onclick="cmsTab('posts')"><span class="sb-ic">📝</span> All posts <span style="margin-left:auto;font-size:10px;color:rgba(255,255,255,.4)">${posts.length}</span></div>
        <div class="sb-i" data-tab="new" onclick="cmsTab('new')"><span class="sb-ic">✏️</span> Create new</div>
        <div class="sb-section">Library</div>
        <div class="sb-i" data-tab="drafts" onclick="cmsTab('drafts')"><span class="sb-ic">📄</span> Drafts <span style="margin-left:auto;font-size:10px;color:rgba(255,255,255,.4)">${drafts}</span></div>
        <div class="sb-i" data-tab="scheduled" onclick="cmsTab('scheduled')"><span class="sb-ic">📆</span> Scheduled <span style="margin-left:auto;font-size:10px;color:rgba(255,255,255,.4)">${scheduled}</span></div>
        <div class="sb-i" data-tab="media" onclick="cmsTab('media')"><span class="sb-ic">🖼</span> Media library</div>
        <div class="sb-i" data-tab="categories" onclick="cmsTab('categories')"><span class="sb-ic">🏷</span> Categories</div>
        <div class="sb-section">Settings</div>
        <div class="sb-i" data-tab="seo" onclick="cmsTab('seo')"><span class="sb-ic">🔍</span> SEO defaults</div>
        <div class="sb-i" data-tab="account" onclick="cmsTab('account')"><span class="sb-ic">👤</span> Account</div>
        <div class="sb-sep"></div>
        <div class="sb-i" onclick="navigate('home')"><span class="sb-ic">↗</span> View site</div>
        <div class="sb-i" onclick="cmsLogout()"><span class="sb-ic">⎋</span> Sign out</div>
      </aside>
      <main class="adm-main" id="adm-main"></main>
    </div>
  `;
}

function cmsTab(tab){
  document.querySelectorAll('.sb-i').forEach(i => i.classList.toggle('on', i.dataset.tab === tab));
  const main = document.getElementById('adm-main');
  if (!main) return;
  if (tab === 'dash') main.innerHTML = renderDash();
  if (tab === 'posts') main.innerHTML = renderPostsTable();
  if (tab === 'new') main.innerHTML = renderEditor();
  if (tab === 'drafts') main.innerHTML = renderPostsTable('Draft');
  if (tab === 'scheduled') main.innerHTML = renderPostsTable('Scheduled');
  if (tab === 'media') main.innerHTML = renderMediaTab();
  if (tab === 'categories') main.innerHTML = renderCategoriesTab();
  if (tab === 'seo') main.innerHTML = renderSEOTab();
  if (tab === 'account') main.innerHTML = renderAccountTab();
}

// ── Dashboard ──────────────────────────────────────────────
function renderDash(){
  const posts = cmsLoadPosts();
  const published = posts.filter(p => p.st === 'Published').length;
  const drafts = posts.filter(p => p.st === 'Draft').length;
  const scheduled = posts.filter(p => p.st === 'Scheduled').length;
  const totalViews = posts.reduce((s, p) => s + (p.v || 0), 0);
  return `
    <div class="adm-bar">
      <div>
        <div class="adm-t">Dashboard</div>
        <div style="font-size:11.5px;color:var(--t3);margin-top:3px">Last updated ${new Date().toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
      </div>
      <button class="btn btn-navy btn-sm" onclick="cmsTab('new')">+ New post</button>
    </div>
    <div class="adm-mets">
      <div class="adm-m"><div class="adm-ml">Published posts</div><div class="adm-mn">${published}</div><div class="adm-md">${drafts} draft${drafts!==1?'s':''} in progress</div></div>
      <div class="adm-m"><div class="adm-ml">Total recorded views</div><div class="adm-mn">${fmtInt(totalViews)}</div><div class="adm-md">Across all posts</div></div>
      <div class="adm-m"><div class="adm-ml">Scheduled to publish</div><div class="adm-mn">${scheduled}</div><div class="adm-md">${scheduled>0?'Auto-publishing on schedule':'None scheduled'}</div></div>
      <div class="adm-m"><div class="adm-ml">Calculators live</div><div class="adm-mn">${(window.TOOLS||[]).length}</div><div class="adm-md">2026/27 tax year</div></div>
    </div>
    <div class="adm-tbl">
      <div class="adm-th">
        <div class="adm-tt">Recent posts</div>
        <button class="btn btn-ghost btn-sm" onclick="cmsTab('posts')">All posts →</button>
      </div>
      <div class="adm-tbl-scroll">
        <table>
          <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Views</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>${posts.slice(0,6).map(p => postRow(p, 56)).join('')}</tbody>
        </table>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:18px" class="dash-cards">
      <div class="adm-tbl">
        <div class="adm-th"><div class="adm-tt">Top performing this month</div></div>
        <div style="padding:14px 18px">
          ${posts.slice().sort((a,b) => b.v - a.v).slice(0,4).map(p => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--br);font-size:12.5px;gap:10px">
              <div style="color:var(--t1);flex:1">${truncate(p.t, 50)}</div>
              <div style="color:var(--blue2);font-weight:700;font-family:var(--mono);font-size:11px">${fmtInt(p.v)} views</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="adm-tbl">
        <div class="adm-th"><div class="adm-tt">Quick actions</div></div>
        <div style="padding:14px 18px;display:flex;flex-direction:column;gap:9px">
          <button class="btn btn-ghost" style="justify-content:flex-start;padding:11px 14px" onclick="cmsTab('new')">✏️ Create new post</button>
          <button class="btn btn-ghost" style="justify-content:flex-start;padding:11px 14px" onclick="cmsTab('media')">🖼 Upload media</button>
          <button class="btn btn-ghost" style="justify-content:flex-start;padding:11px 14px" onclick="cmsTab('seo')">🔍 Update SEO defaults</button>
          <button class="btn btn-ghost" style="justify-content:flex-start;padding:11px 14px" onclick="navigate('insights')">↗ Preview blog homepage</button>
        </div>
      </div>
    </div>
  `;
}

function postRow(p, len){
  const sc = p.st === 'Published' ? 'sp-pub' : p.st === 'Draft' ? 'sp-draft' : 'sp-sched';
  const t = p.t.length > len ? p.t.substr(0, len) + '…' : p.t;
  const date = p.d ? new Date(p.d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—';
  return `<tr>
    <td><div style="display:flex;align-items:center;gap:8px"><span>${p.e}</span><span style="font-size:12px;color:var(--t1)">${t}</span></div></td>
    <td style="font-size:11.5px;color:var(--t3)">${p.cat}</td>
    <td><span class="sp ${sc}">${p.st}</span></td>
    <td>${p.v > 0 ? fmtInt(p.v) : '—'}</td>
    <td style="font-size:11px;color:var(--t3)">${date}</td>
    <td><div class="pa">
      <button class="pa-b" onclick="cmsPreview(${p.id})">View</button>
      <button class="pa-b" onclick="cmsEdit(${p.id})">Edit</button>
      <button class="pa-b del" onclick="cmsDelete(${p.id})">Delete</button>
    </div></td>
  </tr>`;
}

// ── Posts table ────────────────────────────────────────────
function renderPostsTable(statusFilter = null){
  const posts = cmsLoadPosts();
  const filtered = statusFilter ? posts.filter(p => p.st === statusFilter) : posts;
  return `
    <div class="adm-bar">
      <div class="adm-t">${statusFilter ? statusFilter + ' posts' : 'All posts'} <span style="font-size:11px;color:var(--t3);font-weight:400;font-family:var(--sans)">${filtered.length} total</span></div>
      <div style="display:flex;gap:8px">
        <div class="tbl-s">🔍 <input type="text" id="post-search" placeholder="Search title or category..." oninput="cmsFilterPosts(this.value, ${statusFilter ? `'${statusFilter}'` : null})"></div>
        <button class="btn btn-navy btn-sm" onclick="cmsTab('new')">+ New post</button>
      </div>
    </div>
    <div class="adm-tbl">
      <div class="adm-tbl-scroll">
        <table>
          <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Views</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody id="post-tbody">${filtered.map(p => postRow(p, 70)).join('') || `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--t3)">No posts found.</td></tr>`}</tbody>
        </table>
      </div>
    </div>
  `;
}
function cmsFilterPosts(q, statusFilter){
  const posts = cmsLoadPosts();
  q = q.toLowerCase();
  let filtered = statusFilter ? posts.filter(p => p.st === statusFilter) : posts;
  filtered = filtered.filter(p => p.t.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q));
  document.getElementById('post-tbody').innerHTML = filtered.map(p => postRow(p, 70)).join('') || `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--t3)">No posts match "${q}".</td></tr>`;
}

// ── Editor ─────────────────────────────────────────────────
let EDITING_POST = null;
function cmsEdit(id){
  EDITING_POST = id;
  cmsTab('new');
}
function cmsPreview(id){
  navigate('post', id);
}
async function cmsDelete(id){
  const posts = cmsLoadPosts();
  const idx = posts.findIndex(p => p.id == id);
  if (idx === -1) return;
  if (!confirm(`Delete "${posts[idx].t}"? This cannot be undone.`)) return;
  const title = posts[idx].t;

  try {
    const res = await fetch(`/api/articles/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error('API error ' + res.status);
  } catch(e) {
    showToast('Delete failed — ' + e.message, 'err');
    return;
  }

  posts.splice(idx, 1);
  cmsSavePosts(posts);
  cmsTab('posts');
  showToast(`Deleted "${truncate(title, 30)}"`, 'err');
}

function renderEditor(){
  const posts = cmsLoadPosts();
  const editing = EDITING_POST ? posts.find(p => p.id == EDITING_POST) : null;
  const post = editing || { id:null, t:'', cat:'Payroll', st:'Draft', tags:[], excerpt:'', seoTitle:'', seoDesc:'', slug:'', author:'Sterling Tax Expert Editorial Team', d: new Date().toISOString().split('T')[0], scheduledFor:'', bodyHTML:'', e:'📝' };
  EDITING_POST = null;
  return `
    <div class="adm-bar">
      <div class="adm-t">${post.id ? 'Edit post' : 'New post'}</div>
      <div style="display:flex;gap:6px">
        <button class="btn btn-ghost btn-sm" onclick="cmsSaveDraft()">Save draft</button>
        <button class="btn btn-ghost btn-sm" onclick="cmsSchedulePrompt()">Schedule…</button>
        <button class="btn btn-navy btn-sm" onclick="cmsPublish()">Publish ${post.id ? 'changes' : 'now'}</button>
      </div>
    </div>
    <div class="ed-grid">
      <div>
        <div class="ed-card" style="margin-bottom:12px">
          <div class="ed-card-b">
            <div class="fg">
              <div class="fl">Title <span class="fl-hint" id="title-count">${post.t.length}/120</span></div>
              <input class="fi" id="ep-title" type="text" placeholder="2026/27 PAYE: what payroll teams need to update" value="${escapeAttr(post.t)}" oninput="cmsUpdateTitle(this.value)" maxlength="120">
            </div>
            <div class="fg">
              <div class="fl">URL slug <span class="fl-hint">/insights/<span id="ep-slug">${post.slug || 'enter-post-title'}</span></span></div>
            </div>
            <div class="fg">
              <div class="fl">Excerpt <span class="fl-hint">Shown on listing pages</span></div>
              <textarea class="fi" id="ep-excerpt" rows="2" placeholder="A short summary (one or two sentences)...">${escapeHTML(post.excerpt)}</textarea>
            </div>
          </div>
        </div>
        <div class="ed-card">
          <div class="ed-toolbar">
            <button class="tb-b" onclick="ed('bold')" title="Bold"><strong>B</strong></button>
            <button class="tb-b" onclick="ed('italic')" title="Italic"><em>I</em></button>
            <button class="tb-b" onclick="ed('underline')" title="Underline"><u>U</u></button>
            <div class="tb-sep"></div>
            <button class="tb-b" onclick="edInsH2()">H2</button>
            <button class="tb-b" onclick="edInsH3()">H3</button>
            <button class="tb-b" onclick="ed('insertUnorderedList')">• List</button>
            <button class="tb-b" onclick="ed('insertOrderedList')">1. List</button>
            <div class="tb-sep"></div>
            <button class="tb-b" onclick="edInsCallout()">💡 Callout</button>
            <button class="tb-b" onclick="edInsQuote()">❝ Quote</button>
            <button class="tb-b" onclick="edInsLink()">🔗 Link</button>
            <button class="tb-b" onclick="edInsImg()">🖼 Image</button>
            <div class="tb-sep"></div>
            <span style="margin-left:auto;font-size:11px;color:var(--t3);align-self:center" id="ep-wordcount">0 words</span>
            <span style="font-size:11px;color:var(--green);align-self:center" id="ep-autosave"></span>
          </div>
          <div class="ed-area" id="ep-body" contenteditable="true" data-placeholder="Start writing your article…" oninput="cmsUpdateWordCount()" onblur="cmsAutosave()">${post.bodyHTML || ''}</div>
        </div>
      </div>
      <aside style="display:flex;flex-direction:column;gap:12px">
        <div class="ed-card">
          <div class="ed-card-h">Status</div>
          <div class="ed-card-b">
            <div class="fg">
              <div class="fl">Current status</div>
              <select class="fi fsel" id="ep-status">
                <option value="Draft" ${post.st==='Draft'?'selected':''}>📄 Draft</option>
                <option value="Scheduled" ${post.st==='Scheduled'?'selected':''}>📆 Scheduled</option>
                <option value="Published" ${post.st==='Published'?'selected':''}>✅ Published</option>
              </select>
            </div>
            <div class="fg">
              <div class="fl">Publish date</div>
              <input class="fi" id="ep-date" type="date" value="${post.d}">
            </div>
            <div class="fg" id="ep-schedule-wrap" style="${post.st==='Scheduled'?'':'display:none'}">
              <div class="fl">Scheduled time</div>
              <input class="fi" id="ep-schedule" type="datetime-local" value="${post.scheduledFor || ''}">
            </div>
          </div>
        </div>
        <div class="ed-card">
          <div class="ed-card-h">Categorisation</div>
          <div class="ed-card-b">
            <div class="fg">
              <div class="fl">Category</div>
              <select class="fi fsel" id="ep-category">
                ${(window.CATEGORIES || []).map(c => `<option ${c===post.cat?'selected':''}>${c}</option>`).join('')}
              </select>
            </div>
            <div class="fg">
              <div class="fl">Tags <span class="fl-hint">Comma-separated</span></div>
              <input class="fi" id="ep-tags" type="text" placeholder="paye, 2026/27, payroll" value="${(post.tags||[]).join(', ')}">
            </div>
            <div class="fg">
              <div class="fl">Icon</div>
              <select class="fi fsel" id="ep-icon">
                ${['📝','👥','🧾','📋','🏢','🔨','💰','📊','✅','📤','🌴','⚖️','🪙','🎓'].map(e => `<option ${e===post.e?'selected':''}>${e}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>
        <div class="ed-card">
          <div class="ed-card-h">SEO metadata</div>
          <div class="ed-card-b">
            <div class="fg">
              <div class="fl">SEO title <span class="fl-hint" id="seo-t-count">${(post.seoTitle||post.t).length}/60</span></div>
              <input class="fi" id="ep-seo-title" type="text" placeholder="Defaults to the post title" value="${escapeAttr(post.seoTitle || '')}" oninput="document.getElementById('seo-t-count').textContent=this.value.length+'/60'" maxlength="65">
            </div>
            <div class="fg">
              <div class="fl">Meta description <span class="fl-hint" id="seo-d-count">${(post.seoDesc||'').length}/155</span></div>
              <textarea class="fi" id="ep-seo-desc" rows="3" placeholder="A 150–160 char description for Google results..." oninput="document.getElementById('seo-d-count').textContent=this.value.length+'/155'" maxlength="160">${escapeHTML(post.seoDesc || '')}</textarea>
            </div>
          </div>
        </div>
        <div class="ed-card">
          <div class="ed-card-h">Featured image</div>
          <div class="ed-card-b">
            <div class="media-upload" onclick="cmsUpload()">
              <div class="media-upload-ic">🖼</div>
              <div>Click or drop to upload</div>
              <div style="font-size:10px;color:var(--t4)">PNG, JPG up to 2 MB</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
    <div class="succ" id="ep-success">✓ Post saved successfully.</div>
  `;
}

/* escapeHTML / escapeAttr now live in 00-core.js (shared) */

function cmsUpdateTitle(v){
  document.getElementById('title-count').textContent = `${v.length}/120`;
  const slug = v.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').slice(0,80);
  document.getElementById('ep-slug').textContent = slug || 'enter-post-title';
}
function cmsUpdateWordCount(){
  const body = document.getElementById('ep-body');
  const text = body.innerText.trim();
  const words = text ? text.split(/\s+/).length : 0;
  const read = Math.max(1, Math.ceil(words / 220));
  document.getElementById('ep-wordcount').textContent = `${words} words · ~${read} min read`;
  clearTimeout(window._autosaveT);
  window._autosaveT = setTimeout(cmsAutosave, 2000);
}
function cmsAutosave(){
  const el = document.getElementById('ep-autosave');
  if (el) {
    el.textContent = 'Auto-saved ✓';
    setTimeout(() => { if (el) el.textContent = ''; }, 1800);
  }
  // Persist current state as a hidden auto-draft
  const state = readEditorState();
  localStorage.setItem('ste_autodraft', JSON.stringify(state));
}
function readEditorState(){
  return {
    id: EDITING_POST,
    t: document.getElementById('ep-title')?.value || '',
    cat: document.getElementById('ep-category')?.value || 'Payroll',
    st: document.getElementById('ep-status')?.value || 'Draft',
    tags: (document.getElementById('ep-tags')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
    e: document.getElementById('ep-icon')?.value || '📝',
    d: document.getElementById('ep-date')?.value || new Date().toISOString().split('T')[0],
    scheduledFor: document.getElementById('ep-schedule')?.value || null,
    excerpt: document.getElementById('ep-excerpt')?.value || '',
    seoTitle: document.getElementById('ep-seo-title')?.value || '',
    seoDesc: document.getElementById('ep-seo-desc')?.value || '',
    bodyHTML: document.getElementById('ep-body')?.innerHTML || '',
    slug: document.getElementById('ep-slug')?.textContent || '',
    author: 'Sterling Tax Expert Editorial Team',
  };
}

function ed(cmd, val = null){
  const body = document.getElementById('ep-body');
  if (body) {
    body.focus();
    document.execCommand(cmd, false, val);
    cmsUpdateWordCount();
  }
}
function edInsH2(){
  ed('insertHTML', '<h2 style="font-family:var(--sans);font-size:20px;font-weight:700;color:var(--navy);margin:18px 0 9px">Section heading</h2><p><br></p>');
}
function edInsH3(){
  ed('insertHTML', '<h3 style="font-family:var(--sans);font-size:16px;font-weight:700;color:var(--navy);margin:14px 0 8px">Sub-heading</h3><p><br></p>');
}
function edInsCallout(){
  ed('insertHTML', '<div class="callout" style="background:var(--bluel);border-left:3px solid var(--blue2);border-radius:0 8px 8px 0;padding:14px 18px;margin:18px 0;font-size:14px;color:var(--t2);line-height:1.7">💡 <strong>Callout:</strong> Replace this with your callout text.</div><p><br></p>');
}
function edInsQuote(){
  ed('insertHTML', '<blockquote style="border-left:3px solid var(--blue2);padding:6px 18px;margin:18px 0;font-style:italic;color:var(--t2)">Replace with your quote.</blockquote><p><br></p>');
}
function edInsLink(){
  const url = prompt('Enter the URL:', 'https://');
  if (url) {
    const text = prompt('Link text:', 'click here') || url;
    ed('insertHTML', `<a href="${url}" style="color:var(--blue2);border-bottom:1px solid var(--bluel2)">${text}</a>`);
  }
}
function edInsImg(){
  const url = prompt('Image URL (or use the upload button in Featured image):', 'https://');
  if (url) ed('insertHTML', `<img src="${url}" style="max-width:100%;border-radius:8px;margin:12px 0" alt=""/>`);
}

async function cmsSaveDraft(){
  const state = readEditorState();
  if (!state.t.trim()) { showToast('Add a title first', 'err'); return; }
  state.st = 'Draft';
  state.v = state.v || 0;
  await persistPost(state);
  showToast('Draft saved', 'ok');
  cmsTab('drafts');
}

async function cmsPublish(){
  const state = readEditorState();
  if (!state.t.trim()) { showToast('Add a title first', 'err'); return; }
  if (!state.bodyHTML || state.bodyHTML.replace(/<[^>]+>/g,'').trim().length < 20) {
    if (!confirm('This post is very short. Publish anyway?')) return;
  }
  state.st = 'Published';
  state.d = state.d || new Date().toISOString().split('T')[0];
  state.v = state.v || 0;
  await persistPost(state);
  showToast('Published — live on the site', 'ok');
  cmsTab('posts');
}

function cmsSchedulePrompt(){
  const wrap = document.getElementById('ep-schedule-wrap');
  if (wrap) wrap.style.display = '';
  document.getElementById('ep-status').value = 'Scheduled';
  const inp = document.getElementById('ep-schedule');
  if (inp && !inp.value) {
    const d = new Date(); d.setDate(d.getDate() + 7);
    inp.value = d.toISOString().slice(0,16);
  }
  showToast('Set the date below and click Publish to schedule');
}

async function persistPost(state){
  const isNew = !state.id;
  if (isNew) {
    state.id = String(Date.now());
    state.r = Math.max(1, Math.ceil((state.bodyHTML.replace(/<[^>]+>/g,'').split(/\s+/).length) / 220));
  }

  const payload = {
    id: state.id,
    title: state.t,
    slug: state.slug,
    body: state.bodyHTML || '',
    excerpt: state.excerpt || '',
    status: (state.st || 'Draft').toLowerCase(),
    author: state.author || 'Sterling Tax Expert',
    category: state.cat || 'Tax',
    tags: state.tags || [],
    scheduled_at: state.scheduledFor || null,
  };

  try {
    const url = isNew ? '/api/articles' : `/api/articles/${state.id}`;
    const method = isNew ? 'POST' : 'PUT';
    const res = await fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('API error ' + res.status);
  } catch(e) {
    showToast('Save failed — ' + e.message, 'err');
    return;
  }

  // Update local cache
  const posts = cmsLoadPosts();
  if (isNew) {
    posts.unshift(state);
  } else {
    const idx = posts.findIndex(p => p.id == state.id);
    if (idx >= 0) posts[idx] = { ...posts[idx], ...state };
  }
  cmsSavePosts(posts);
}

// ── Media ──────────────────────────────────────────────────
function renderMediaTab(){
  const media = cmsLoadMedia();
  return `
    <div class="adm-bar">
      <div class="adm-t">Media library <span style="font-size:11px;color:var(--t3);font-weight:400;font-family:var(--sans)">${media.length} items</span></div>
      <button class="btn btn-navy btn-sm" onclick="cmsUpload()">+ Upload media</button>
    </div>
    <div class="adm-tbl">
      <div class="ed-card-b">
        <div class="media-grid">
          <div class="media-upload" onclick="cmsUpload()">
            <div class="media-upload-ic">+</div>
            <div>Click to upload</div>
            <div style="font-size:10px;color:var(--t4)">or drag a file here</div>
          </div>
          ${media.map(m => `
            <div class="media-tile" onclick="showToast('Selected: ${escapeAttr(m.name)}')">
              ${m.emoji || '📄'}
              <div class="media-tile-name">${truncate(m.name, 22)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
function cmsUpload(){
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'image/*';
  inp.onchange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { showToast('File too large (max 2 MB)', 'err'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const media = cmsLoadMedia();
      media.unshift({
        id: 'm' + Date.now(),
        name: f.name,
        type: f.type,
        size: (f.size/1024).toFixed(0) + ' KB',
        emoji: '🖼',
        date: new Date().toISOString().split('T')[0],
        dataUrl: ev.target.result,
      });
      cmsSaveMedia(media);
      showToast(`Uploaded: ${f.name}`, 'ok');
      cmsTab('media');
    };
    reader.readAsDataURL(f);
  };
  inp.click();
}

// ── Categories ─────────────────────────────────────────────
function renderCategoriesTab(){
  const posts = cmsLoadPosts();
  const cats = window.CATEGORIES || [];
  const counts = {};
  cats.forEach(c => counts[c] = posts.filter(p => p.cat === c).length);
  return `
    <div class="adm-bar">
      <div class="adm-t">Categories & tags</div>
    </div>
    <div class="adm-tbl">
      <div class="adm-th"><div class="adm-tt">Categories — ${cats.length}</div></div>
      <div class="adm-tbl-scroll">
        <table>
          <thead><tr><th>Name</th><th>Posts</th><th>Slug</th><th>Actions</th></tr></thead>
          <tbody>
            ${cats.map(c => `<tr>
              <td style="font-weight:600;color:var(--navy)">${c}</td>
              <td>${counts[c]}</td>
              <td style="font-family:var(--mono);font-size:11.5px;color:var(--t3)">/insights/${c.toLowerCase().replace(/[^a-z0-9]/g,'-')}</td>
              <td><div class="pa">
                <button class="pa-b" onclick="showToast('Rename in production — categories are seed data here')">Rename</button>
                <button class="pa-b" onclick="navigate('insights');setTimeout(()=>setCatFilter('${c}'),300)">View</button>
              </div></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── SEO defaults ───────────────────────────────────────────
function renderSEOTab(){
  return `
    <div class="adm-bar">
      <div class="adm-t">SEO defaults</div>
      <button class="btn btn-navy btn-sm" onclick="showToast('SEO defaults saved', 'ok')">Save changes</button>
    </div>
    <div class="ed-grid">
      <div class="ed-card">
        <div class="ed-card-b">
          <div class="fg">
            <div class="fl">Site title template</div>
            <input class="fi" type="text" value="%title% — Sterling Tax Expert">
          </div>
          <div class="fg">
            <div class="fl">Default meta description</div>
            <textarea class="fi" rows="3">UK payroll, tax and compliance insights for businesses and sole traders. Updated for the 2026/27 tax year.</textarea>
          </div>
          <div class="fg">
            <div class="fl">Default OG image</div>
            <input class="fi" type="text" value="/assets/og-default.png">
          </div>
          <div class="fg">
            <div class="fl">Twitter / X handle</div>
            <input class="fi" type="text" value="@sterlingtax">
          </div>
          <div class="fg">
            <div class="fl">Robots</div>
            <select class="fi fsel">
              <option>index, follow</option>
              <option>noindex, nofollow</option>
            </select>
          </div>
        </div>
      </div>
      <aside class="ed-card">
        <div class="ed-card-h">Search preview</div>
        <div class="ed-card-b" style="font-family:Arial,sans-serif">
          <div style="font-size:18px;color:#1A0DAB;line-height:1.3">Sterling Tax Expert — UK payroll &amp; tax insights</div>
          <div style="font-size:13px;color:#006621;margin-top:3px">sterlingtaxexpert.co.uk › insights</div>
          <div style="font-size:13px;color:#545454;margin-top:6px;line-height:1.5">UK payroll, tax and compliance insights for businesses and sole traders. Updated for the 2026/27 tax year.</div>
        </div>
      </aside>
    </div>
  `;
}

// ── Account ────────────────────────────────────────────────
function renderAccountTab(){
  return `
    <div class="adm-bar">
      <div class="adm-t">Account settings</div>
    </div>
    <div class="ed-grid">
      <div class="ed-card">
        <div class="ed-card-h">Profile</div>
        <div class="ed-card-b">
          <div class="fg"><div class="fl">Username</div><input class="fi" type="text" value="admin" disabled></div>
          <div class="fg"><div class="fl">Display name</div><input class="fi" type="text" value="Sterling Tax Expert Editorial Team"></div>
          <div class="fg"><div class="fl">Email</div><input class="fi" type="email" value="sarah@sterlingtaxexpert.co.uk"></div>
          <button class="btn btn-navy btn-sm" onclick="showToast('Saved')">Save profile</button>
        </div>
      </div>
      <aside class="ed-card">
        <div class="ed-card-h">Session</div>
        <div class="ed-card-b" style="font-size:12px;color:var(--t2);line-height:1.65">
          <p>Active session — expires after 4 hours of inactivity.</p>
          <p style="margin-top:8px;color:var(--t3);font-size:11.5px">In production this CMS would use HTTPS-only session cookies, password hashing (bcrypt/argon2), rate-limited login attempts, and 2FA for editor accounts.</p>
          <button class="btn btn-red btn-sm" style="margin-top:12px;width:100%" onclick="cmsLogout()">Sign out</button>
        </div>
      </aside>
    </div>
  `;
}

// ── Users tab (admin view of all registered users) ─────────
/* Public end-user account management removed — the site has no public
   accounts. Admin staff auth is handled separately above. */
