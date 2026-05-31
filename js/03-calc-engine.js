/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Calculator engine
   ───────────────────────────────────────────────────────────
   Each calculator is a config object describing its inputs,
   a `calculate(state)` function returning a results object,
   and a `render(results, state)` function returning HTML.
   The shell takes care of inputs/results layout, live recalc,
   the print button, and the "related calculators" cross-links.
   ─────────────────────────────────────────────────────────── */

const CALCS = {}; // populated by calcs-*.js

// ── Input widget renderers ─────────────────────────────────
function input_currency(id, label, value, opts = {}){
  return `<div class="ci-group">
    <div class="ci-label">${label}${opts.hint ? `<span class="ci-hint">${opts.hint}</span>` : ''}</div>
    <div class="ci-input-wrap">
      <span class="ci-prefix">£</span>
      <input class="ci-input" id="${id}" type="number" inputmode="decimal" min="0" step="${opts.step||1}" value="${value ?? ''}" placeholder="${opts.placeholder||'0'}">
    </div>
  </div>`;
}
function input_number(id, label, value, opts = {}){
  return `<div class="ci-group">
    <div class="ci-label">${label}${opts.hint ? `<span class="ci-hint">${opts.hint}</span>` : ''}</div>
    <div class="ci-input-wrap">
      <input class="ci-input no-prefix${opts.suffix ? ' with-suffix' : ''}" id="${id}" type="number" inputmode="decimal" min="${opts.min ?? 0}" max="${opts.max ?? ''}" step="${opts.step||1}" value="${value ?? ''}" placeholder="${opts.placeholder||'0'}">
      ${opts.suffix ? `<span class="ci-suffix">${opts.suffix}</span>` : ''}
    </div>
  </div>`;
}
function input_select(id, label, value, options, opts = {}){
  return `<div class="ci-group">
    <div class="ci-label">${label}${opts.hint ? `<span class="ci-hint">${opts.hint}</span>` : ''}</div>
    <select class="ci-select" id="${id}">
      ${options.map(o => `<option value="${o.v}" ${String(value)===String(o.v)?'selected':''}>${o.l}</option>`).join('')}
    </select>
  </div>`;
}
function input_toggle(id, label, value, options){
  return `<div class="ci-group">
    <div class="ci-label">${label}</div>
    <div class="ci-toggle">
      ${options.map(o => `<button class="ci-tog-btn ${value===o.v?'on':''}" data-val="${o.v}" onclick="toggleSet('${id}','${o.v}')">${o.l}</button>`).join('')}
    </div>
    <input type="hidden" id="${id}" value="${value}">
  </div>`;
}
function input_checkbox(id, label, checked = false){
  return `<label class="ci-checkbox">
    <input type="checkbox" id="${id}" ${checked?'checked':''}>
    <span class="ci-checkbox-lbl">${label}</span>
  </label>`;
}
function input_date(id, label, value, opts = {}){
  return `<div class="ci-group">
    <div class="ci-label">${label}${opts.hint ? `<span class="ci-hint">${opts.hint}</span>` : ''}</div>
    <div class="ci-input-wrap">
      <input class="ci-input no-prefix" id="${id}" type="date" value="${value || ''}" ${opts.min?`min="${opts.min}"`:''} ${opts.max?`max="${opts.max}"`:''} onchange="recalc()">
    </div>
  </div>`;
}
function input_section(label){
  return `<div class="ci-section-label">${label}</div>`;
}
function input_divider(){ return '<div class="ci-divider"></div>'; }

function toggleSet(id, value){
  const hidden = document.getElementById(id);
  hidden.value = value;
  const wrap = hidden.previousElementSibling;
  wrap.querySelectorAll('.ci-tog-btn').forEach(b => b.classList.toggle('on', b.dataset.val === value));
  recalc();
}

// ── State + recalc ─────────────────────────────────────────
function readState(calc){
  const state = {};
  for (const i of calc.inputs) {
    const el = document.getElementById(i.id);
    if (!el) continue;
    if (i.type === 'currency' || i.type === 'number') state[i.id] = parseFloat(el.value) || 0;
    else if (i.type === 'checkbox') state[i.id] = el.checked;
    else state[i.id] = el.value;
  }
  return state;
}

function recalc(){
  const calc = CALCS[CURRENT_CALC];
  if (!calc) return;
  const state = readState(calc);
  const results = calc.calculate(state);
  const wrap = document.getElementById('calc-results');
  if (!wrap) return;
  wrap.innerHTML = calc.render(results, state);
  window._lastCalc = { calc, state, results };
  if (calc.afterRecalc) calc.afterRecalc(state);
}

function resetCalc(){
  const calc = CALCS[CURRENT_CALC];
  if (!calc) return;
  mountCalc(calc.id);
  showToast('Reset to defaults');
}

// ── Mount calculator into the shared shell ─────────────────
function mountCalc(id){
  const calc = CALCS[id];
  const shell = document.getElementById('page-calc');
  if (!calc) {
    shell.innerHTML = `<div class="crumbs"></div><div class="sec sec-inner"><h1 class="sec-h">Calculator not found</h1><p class="sec-p">The calculator "${id}" doesn't exist. <a onclick="navigate('tools')" style="color:var(--blue2);cursor:pointer">Browse all tools →</a></p></div>`;
    return;
  }
  const tool = window.TOOLS.find(t => t.id === id) || {};
  shell.innerHTML = `
    <div class="crumbs"></div>
    <div class="calc-hero">
      <div class="calc-hero-bg"></div>
      <div class="calc-hero-inner">
        <a class="ch-back" onclick="navigate('tools')">← Back to all tools</a>
        <div class="ch-kicker">${tool.icon || '🧮'} ${tool.cat || 'Calculator'}</div>
        <h1 class="ch-h">${calc.title}</h1>
        <p class="ch-p">${calc.subtitle || ''}</p>
        <div class="ch-meta">
          <span class="ch-badge">✓ ${window.TAX_YEAR_LABEL}</span>
          <span class="ch-badge">HMRC-aligned</span>
          ${calc.metaBadges ? calc.metaBadges.map(b => `<span class="ch-badge">${b}</span>`).join('') : ''}
        </div>
      </div>
    </div>
    <div class="calc-layout">
      <aside class="calc-inputs">
        <div class="ci-header">
          <span class="ci-title">Inputs</span>
          <span class="ci-badge">${window.TAX_YEAR}</span>
        </div>
        <div class="ci-body" id="ci-body">${renderInputs(calc)}</div>
        <div class="ci-footer">
          <button class="ci-calc-btn" onclick="recalc()">↻ Recalculate</button>
          <button class="ci-reset-btn" onclick="resetCalc()">Reset</button>
        </div>
      </aside>
      <main class="calc-results" id="calc-results"></main>
    </div>
    <div style="max-width:1280px;margin:0 auto;padding:0 28px 56px">
      <div class="calc-related">
        <div class="calc-related-t">Related calculators</div>
        <div class="calc-related-grid">${renderRelated(calc)}</div>
      </div>
    </div>
  `;
  updateBreadcrumbs('calc', id);
  // wire live recalc
  setTimeout(() => {
    const body = document.getElementById('ci-body');
    if (body) {
      body.addEventListener('input', () => recalc());
      body.addEventListener('change', () => recalc());
    }
    recalc();
  }, 50);
}

function renderInputs(calc){
  return calc.inputs.map(i => {
    if (i.type === 'section') return input_section(i.label);
    if (i.type === 'divider') return input_divider();
    if (i.type === 'currency') return input_currency(i.id, i.label, i.default, i);
    if (i.type === 'number')   return input_number(i.id, i.label, i.default, i);
    if (i.type === 'select')   return input_select(i.id, i.label, i.default, i.options, i);
    if (i.type === 'toggle')   return input_toggle(i.id, i.label, i.default, i.options);
    if (i.type === 'checkbox') return input_checkbox(i.id, i.label, i.default);
    if (i.type === 'date')     return input_date(i.id, i.label, i.default, i);
    return '';
  }).join('');
}

function renderRelated(calc){
  const related = (calc.related || []).slice(0, 6);
  if (related.length === 0) {
    // fallback to siblings in same category
    const cat = (window.TOOLS.find(t => t.id === calc.id) || {}).cat;
    return window.TOOLS
      .filter(t => t.cat === cat && t.id !== calc.id)
      .slice(0, 3)
      .map(t => relCard(t)).join('');
  }
  return related.map(id => {
    const t = window.TOOLS.find(x => x.id === id);
    return t ? relCard(t) : '';
  }).join('');
}
function relCard(t){
  return `<div class="crel" onclick="navigate('calc','${t.id}')">
    <div class="crel-icon">${t.icon}</div>
    <div><div class="crel-t">${t.title}</div><div class="crel-s">${t.cat}</div></div>
  </div>`;
}

// ── Shared result fragments ────────────────────────────────
function kpi(label, value, opts = {}){
  return `<div class="kpi kpi-${opts.color||'primary'}">
    <div class="kpi-label">${label}</div>
    <div class="kpi-value">${value}</div>
    ${opts.sub ? `<div class="kpi-sub">${opts.sub}</div>` : ''}
    ${opts.monthly ? `<div class="kpi-monthly">${opts.monthly}</div>` : ''}
  </div>`;
}
function kpiRow(items, opts = {}){
  const cls = items.length === 2 ? ' k2' : items.length === 4 ? ' k4' : '';
  return `<div class="kpi-row${cls}">${items.join('')}</div>`;
}
function bkRow(name, color, val, gross, isTotal = false, isNet = false){
  const pct = gross > 0 ? (val / gross * 100).toFixed(1) + '%' : '';
  const cls = isNet ? 'net' : isTotal ? 'total' : '';
  return `<div class="bk-row ${cls}">
    <span class="bk-name"><div class="bk-dot" style="background:${color}"></div>${name}</span>
    <span class="bk-pct">${pct}</span>
    <span class="bk-amt">${fmt(val)}</span>
  </div>`;
}
function actionsRow(extra = ''){
  return `<div class="calc-actions">
    ${extra}
    <button class="btn btn-ghost btn-sm" onclick="printSummary()">⬇ Download PDF summary</button>
    <button class="btn btn-navy btn-sm" onclick="navigate('contact')">Get professional advice →</button>
  </div>`;
}
function notesCard(title, body){
  return `<div class="notes-section">
    <div class="notes-title">ⓘ ${title}</div>
    <div class="notes-body">${body}</div>
  </div>`;
}
