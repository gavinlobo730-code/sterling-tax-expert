/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Public Insights (Phase 4)
   Replaces the static-data mountInsights() and mountPost() with
   live CMS data fetched from the public Worker API.

   API base: window.STERLING_CONFIG.cmsApiBase
             (falls back to 'https://sterling-tax.co.uk/api')
   ─────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  // ── API helper ──────────────────────────────────────────────

  function apiBase() {
    return ((window.STERLING_CONFIG || {}).cmsApiBase || 'https://sterling-tax.co.uk/api').replace(/\/$/, '');
  }

  async function apiFetch(path) {
    const res = await fetch(apiBase() + path);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  // ── State ───────────────────────────────────────────────────

  let _insightsPage      = 1;
  let _insightsCat       = '';
  let _insightsTotal     = 0;
  let _insightsTotalPages = 1;
  let _insightsLoading   = false;

  // ── INSIGHTS LISTING ────────────────────────────────────────

  function mountInsights() {
    const wrap = document.getElementById('page-insights');
    if (!wrap) return;

    _insightsPage = 1;
    _insightsCat  = '';

    wrap.innerHTML = `
      <div class="crumbs"></div>
      <div style="background:var(--g50);border-bottom:1px solid var(--br)">
        <div style="max-width:1280px;margin:0 auto;padding:42px 28px 32px">
          <div class="eyebrow ey-blue">Insights</div>
          <h1 style="font-family:var(--sans);font-size:32px;font-weight:800;color:var(--navy);letter-spacing:-1px;margin-bottom:14px;text-wrap:balance">UK payroll, tax &amp; compliance — explained plainly</h1>
          <div class="cat-pills" id="insights-cat-pills">
            <button class="tcat-btn on" onclick="insightsSetCat('')">All</button>
          </div>
        </div>
      </div>
      <div class="sec sec-sm"><div class="sec-inner">
        <div id="insights-featured"></div>
        <div class="bc-grid" id="insights-grid"></div>
        <div id="insights-pagination" style="text-align:center;padding:24px 0"></div>
      </div></div>
      ${renderCTABand()}
      ${renderFooter()}
    `;

    updateBreadcrumbs('insights');
    loadInsightsCategories();
    loadInsightsPage(1, '');
  }

  async function loadInsightsCategories() {
    try {
      const data = await apiFetch('/categories');
      const cats = (data.categories || []).filter(c => c.article_count > 0);
      const pills = document.getElementById('insights-cat-pills');
      if (!pills || !cats.length) return;
      pills.innerHTML = `<button class="tcat-btn on" onclick="insightsSetCat('')">All</button>` +
        cats.map(c => `<button class="tcat-btn" onclick="insightsSetCat('${esc(c.slug)}')" data-slug="${esc(c.slug)}">${esc(c.name)}</button>`).join('');
    } catch (_) { /* non-fatal */ }
  }

  async function loadInsightsPage(page, cat) {
    if (_insightsLoading) return;
    _insightsLoading = true;

    const grid      = document.getElementById('insights-grid');
    const featured  = document.getElementById('insights-featured');
    const pagination = document.getElementById('insights-pagination');
    if (!grid) { _insightsLoading = false; return; }

    if (page === 1) {
      grid.innerHTML = insightsSkeletons(6);
      if (featured) featured.innerHTML = '';
    }

    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (cat) params.set('category', cat);
      const data = await apiFetch('/articles?' + params);

      const articles = data.articles || [];
      _insightsTotal      = data.total || 0;
      _insightsTotalPages = data.totalPages || 1;
      _insightsPage       = data.page || page;

      if (articles.length === 0) {
        if (featured) featured.innerHTML = '';
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--t3);font-size:13.5px">No articles found.</div>`;
        if (pagination) pagination.innerHTML = '';
        _insightsLoading = false;
        return;
      }

      // First page, no filter: show first article as featured
      let gridArticles = articles;
      if (page === 1 && !cat && featured && articles[0]) {
        featured.innerHTML = renderInsightsFeatured(articles[0]);
        gridArticles = articles.slice(1);
      } else if (featured && page === 1) {
        featured.innerHTML = '';
      }

      grid.innerHTML = gridArticles.length
        ? gridArticles.map(a => renderInsightsCard(a)).join('')
        : '';

      if (pagination) pagination.innerHTML = renderPagination(_insightsPage, _insightsTotalPages);

    } catch (err) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--t3);font-size:13.5px">Could not load articles. Please try again.</div>`;
      if (pagination) pagination.innerHTML = '';
    }

    _insightsLoading = false;
  }

  function insightsSetCat(slug) {
    _insightsCat = slug;
    document.querySelectorAll('#insights-cat-pills .tcat-btn').forEach(b => {
      b.classList.toggle('on', (b.dataset.slug || '') === slug);
    });
    loadInsightsPage(1, slug);
  }

  function insightsGoPage(page) {
    loadInsightsPage(page, _insightsCat);
    const wrap = document.getElementById('page-insights');
    if (wrap) wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── ARTICLE PAGE ─────────────────────────────────────────────

  async function mountArticle(slug) {
    if (!slug) { navigate('insights', null, { skipHistory: true }); return; }

    const wrap = document.getElementById('page-article');
    if (!wrap) return;

    wrap.innerHTML = articleSkeleton();
    updateBreadcrumbs('article', slug);

    try {
      const data = await apiFetch('/articles/' + encodeURIComponent(slug));
      const a = data.article;
      if (!a) throw new Error('Not found');

      // Update <title> and meta for SEO
      document.title = (a.meta_title || a.title) + ' — Sterling Tax Expert';
      setMeta('description', a.meta_desc || a.excerpt || '');

      // Open Graph
      setMeta('og:type',        'article');
      setMeta('og:url',         'https://sterling-tax.co.uk/insights/' + a.slug);
      setMeta('og:title',       a.meta_title || a.title);
      setMeta('og:description', a.meta_desc  || a.excerpt || '');
      if (a.featured_image) {
        setMeta('og:image',        'https://sterling-tax.co.uk/media/' + a.featured_image);
        setMeta('og:image:width',  '1200');
        setMeta('og:image:height', '630');
      }

      // Twitter Cards
      setMeta('twitter:card',        a.featured_image ? 'summary_large_image' : 'summary');
      setMeta('twitter:title',       a.meta_title || a.title);
      setMeta('twitter:description', a.meta_desc  || a.excerpt || '');
      if (a.featured_image) {
        setMeta('twitter:image', 'https://sterling-tax.co.uk/media/' + a.featured_image);
      }

      setCanonical('https://sterling-tax.co.uk/insights/' + a.slug);

      // Structured data (Article schema)
      setStructuredData({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: a.title,
        description: a.excerpt || '',
        datePublished: a.published_at ? new Date(a.published_at * 1000).toISOString() : '',
        dateModified:  a.updated_at   ? new Date(a.updated_at   * 1000).toISOString()
                     : a.published_at ? new Date(a.published_at  * 1000).toISOString() : '',
        ...(a.featured_image ? { image: 'https://sterling-tax.co.uk/media/' + a.featured_image } : {}),
        publisher: {
          '@type': 'Organization',
          name: 'Sterling Tax Expert',
          url: 'https://sterling-tax.co.uk',
        },
      });

      const catColour = a.category_colour || 'var(--blue2)';
      const pubDate   = a.published_at ? new Date(a.published_at * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
      const updDate   = a.updated_at && a.updated_at !== a.published_at
        ? new Date(a.updated_at * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : null;
      const readTag   = a.reading_time ? `${a.reading_time} min read` : null;

      const heroImage = a.featured_image
        ? `<div style="max-width:900px;margin:0 auto;padding:0 28px 24px"><img src="/media/${esc(a.featured_image)}" alt="${esc(a.title)}" style="width:100%;max-height:420px;object-fit:cover;border-radius:12px;display:block"></div>`
        : '';

      wrap.innerHTML = `
        <div class="crumbs"></div>
        <div class="post-head">
          <div class="post-head-inner">
            ${a.category_name ? `<div class="post-tags"><span class="post-tag" style="color:${esc(catColour)};background:${hexTint(a.category_colour)}">${esc(a.category_name)}</span></div>` : ''}
            <h1 class="post-h1">${esc(a.title)}</h1>
            <div class="post-meta">
              <span>By <strong>Sterling Tax Expert</strong></span>
              ${pubDate ? `<span>·</span><span>${pubDate}</span>` : ''}
              ${readTag ? `<span>·</span><span>${readTag}</span>` : ''}
              ${updDate ? `<span>·</span><span style="font-style:italic">Updated ${updDate}</span>` : ''}
            </div>
          </div>
        </div>
        ${heroImage}
        <article class="post-body" id="article-body">
          ${a.content || ''}
          <hr style="margin:32px 0;border:none;border-top:1px solid var(--br)">
          <div style="display:flex;align-items:center;gap:14px;padding:18px;background:var(--g50);border:1px solid var(--br);border-radius:12px;flex-wrap:wrap">
            <div style="width:44px;height:44px;border-radius:50%;background:var(--bluel);display:grid;place-items:center;font-size:18px;flex-shrink:0">📖</div>
            <div style="flex:1;min-width:200px">
              <div style="font-weight:600;color:var(--navy);font-size:13.5px">Was this helpful?</div>
              <div style="font-size:12.5px;color:var(--t3);margin-top:3px">For personalised advice on any topic covered here, <a onclick="navigate('contact')" style="color:var(--blue2);cursor:pointer">book a free call</a> with our team.</div>
            </div>
          </div>
        </article>
        <div id="article-related-wrap"></div>
        ${renderCTABand()}
        ${renderFooter()}
      `;

      updateBreadcrumbs('article', a.title);
      if (typeof startReadingProgress === 'function') startReadingProgress();
      loadRelated(a.category_slug, a.slug);

    } catch (err) {
      wrap.innerHTML = `
        <div class="crumbs"></div>
        <div class="sec"><div class="sec-inner" style="text-align:center;padding:64px 0">
          <div style="font-size:48px;margin-bottom:16px">📄</div>
          <h1 style="font-family:var(--sans);font-size:26px;font-weight:800;color:var(--navy);margin-bottom:12px">Article not found</h1>
          <p style="color:var(--t3);font-size:14px;margin-bottom:24px">This article may have been moved or removed.</p>
          <button class="btn btn-navy" onclick="navigate('insights')">Browse all articles</button>
        </div></div>
        ${renderFooter()}
      `;
      document.title = 'Article not found — Sterling Tax Expert';
    }
  }

  async function loadRelated(catSlug, currentSlug) {
    if (!catSlug) return;
    const wrap = document.getElementById('article-related-wrap');
    if (!wrap) return;
    try {
      const data = await apiFetch('/articles?category=' + encodeURIComponent(catSlug) + '&limit=4');
      const related = (data.articles || []).filter(a => a.slug !== currentSlug).slice(0, 3);
      if (!related.length) return;
      wrap.innerHTML = `
        <div class="sec sec-sm bg-g25"><div class="sec-inner">
          <div class="row-hdr"><div>
            <div class="eyebrow ey-blue">Related articles</div>
            <div class="sec-h" style="margin-bottom:0">More on this topic</div>
          </div></div>
          <div class="bc-grid">${related.map(a => renderInsightsCard(a)).join('')}</div>
        </div></div>
      `;
    } catch (_) { /* non-fatal */ }
  }

  // ── Render helpers ───────────────────────────────────────────

  function renderInsightsFeatured(a) {
    const colour  = a.category_colour || 'var(--blue2)';
    const tint    = hexTint(a.category_colour);
    const pubDate = a.published_at ? new Date(a.published_at * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const readTag = a.reading_time ? `${a.reading_time} min read` : '';
    const thumbHtml = a.featured_image
      ? `<div class="fa-thumb" style="background:${tint}">
           <img src="/media/${esc(a.featured_image)}" alt="${esc(a.title)}" style="width:100%;height:100%;object-fit:cover;display:block">
         </div>`
      : `<div class="fa-thumb" style="background:${tint}">
           <div class="fa-thumb-grid"></div>
           <div class="fa-thumb-ic" style="background:${tint};font-size:36px">📰</div>
         </div>`;
    return `<div class="featured-art" onclick="navigate('article','${esc(a.slug)}');history.pushState(null,'','/insights/${esc(a.slug)}')">
      ${thumbHtml}
      <div class="fa-body">
        ${a.category_name ? `<div class="fa-tag" style="color:${colour}">⭐ Featured · ${esc(a.category_name)}</div>` : '<div class="fa-tag">⭐ Featured</div>'}
        <h2 class="fa-h">${esc(a.title)}</h2>
        ${a.excerpt ? `<p class="fa-p">${esc(a.excerpt)}</p>` : ''}
        <div class="fa-meta">
          <span>Sterling Tax Expert</span>
          ${pubDate ? `<span>·</span><span>${pubDate}</span>` : ''}
          ${readTag ? `<span>·</span><span>${readTag}</span>` : ''}
        </div>
      </div>
    </div>`;
  }

  function renderInsightsCard(a) {
    const colour  = a.category_colour || 'var(--blue2)';
    const tint    = hexTint(a.category_colour);
    const pubDate = a.published_at ? new Date(a.published_at * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const readTag = a.reading_time ? `${a.reading_time} min read` : '';
    const thumbHtml = a.featured_image
      ? `<div class="bc-th">
           <img src="/media/${esc(a.featured_image)}" alt="${esc(a.title)}" style="width:100%;height:100%;object-fit:cover;display:block">
         </div>`
      : `<div class="bc-th" style="background:${tint}">
           <div class="bc-tg"></div>
           <div class="bc-ti" style="background:${tint};font-size:24px">📄</div>
         </div>`;
    return `<div class="bc" onclick="navigate('article','${esc(a.slug)}');history.pushState(null,'','/insights/${esc(a.slug)}')">
      ${thumbHtml}
      <div class="bc-body">
        ${a.category_name ? `<div class="bc-cat" style="color:${colour}">${esc(a.category_name)}</div>` : ''}
        <div class="bc-t">${esc(a.title)}</div>
        ${a.excerpt ? `<div style="font-size:12.5px;color:var(--t3);line-height:1.55;margin-bottom:10px">${esc(a.excerpt)}</div>` : ''}
        <div class="bc-ft">
          <span class="bc-m">${pubDate}${readTag ? ` · ${readTag}` : ''}</span>
          <span class="bc-r">Read →</span>
        </div>
      </div>
    </div>`;
  }

  function renderPagination(page, totalPages) {
    if (totalPages <= 1) return '';
    const prev = page > 1
      ? `<button class="btn btn-ghost btn-sm" onclick="insightsGoPage(${page - 1})">← Previous</button>`
      : `<button class="btn btn-ghost btn-sm" disabled style="opacity:.4">← Previous</button>`;
    const next = page < totalPages
      ? `<button class="btn btn-ghost btn-sm" onclick="insightsGoPage(${page + 1})">Next →</button>`
      : `<button class="btn btn-ghost btn-sm" disabled style="opacity:.4">Next →</button>`;
    return `<div style="display:flex;align-items:center;gap:12px;justify-content:center">
      ${prev}
      <span style="font-size:13px;color:var(--t3)">Page ${page} of ${totalPages}</span>
      ${next}
    </div>`;
  }

  function insightsSkeletons(n) {
    const sk = `<div class="bc" style="pointer-events:none">
      <div class="bc-th" style="background:var(--g100)"></div>
      <div class="bc-body">
        <div style="height:11px;width:60px;background:var(--g100);border-radius:4px;margin-bottom:10px"></div>
        <div style="height:14px;background:var(--g100);border-radius:4px;margin-bottom:6px"></div>
        <div style="height:14px;width:80%;background:var(--g100);border-radius:4px"></div>
      </div>
    </div>`;
    return Array(n).fill(sk).join('');
  }

  function articleSkeleton() {
    return `<div class="crumbs"></div>
      <div class="post-head">
        <div class="post-head-inner">
          <div style="height:12px;width:80px;background:var(--g100);border-radius:4px;margin-bottom:14px"></div>
          <div style="height:32px;background:var(--g100);border-radius:6px;margin-bottom:10px"></div>
          <div style="height:32px;width:70%;background:var(--g100);border-radius:6px;margin-bottom:16px"></div>
          <div style="height:12px;width:200px;background:var(--g100);border-radius:4px"></div>
        </div>
      </div>
      <article class="post-body">
        ${Array(6).fill('<div style="height:14px;background:var(--g100);border-radius:4px;margin-bottom:10px"></div>').join('')}
      </article>`;
  }

  // ── DOM / SEO utilities ──────────────────────────────────────

  function esc(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function setMeta(name, content) {
    const isOG = name.startsWith('og:');
    const sel  = isOG
      ? `meta[property="${name}"]`
      : `meta[name="${name}"]`;
    let el = document.querySelector(sel);
    if (!el) {
      el = document.createElement('meta');
      if (isOG) el.setAttribute('property', name);
      else       el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function setCanonical(href) {
    let el = document.querySelector('link[rel="canonical"]');
    if (!el) { el = document.createElement('link'); el.rel = 'canonical'; document.head.appendChild(el); }
    el.href = href;
  }

  function setStructuredData(obj) {
    let el = document.getElementById('ld-article');
    if (!el) { el = document.createElement('script'); el.id = 'ld-article'; el.type = 'application/ld+json'; document.head.appendChild(el); }
    el.textContent = JSON.stringify(obj);
  }

  function hexTint(hex) {
    if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return 'var(--bluel)';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},0.08)`;
  }

  // ── Expose to global scope ───────────────────────────────────

  window.mountInsights   = mountInsights;
  window.mountArticle    = mountArticle;
  window.insightsSetCat  = insightsSetCat;
  window.insightsGoPage  = insightsGoPage;

}());
