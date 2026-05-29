/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Admin tax-configuration module
   ───────────────────────────────────────────────────────────
   Extracted from the former accounts module. This is INTERNAL
   admin tooling only (surfaced inside /admin → Tax configuration).
   It is NOT public-facing. The public freemium account system
   (signup / signin / pricing / premium) has been removed entirely.

   Centralised, editable tax rules: every numeric rate, threshold
   and statutory amount in window.TAX can be overridden here by
   Sterling staff during in-year Budget changes — no code release
   needed. Calculation formulae remain protected in the calc modules.
   ─────────────────────────────────────────────────────────── */

/* ═══════════════════════════════════════════════════════════
   TAX CONFIGURATION (admin-editable values)
   ───────────────────────────────────────────────────────────
   The TAX object in data.js is the canonical default. Admins can
   override individual values via the CMS — those overrides are
   persisted to localStorage and merged on every page load.
   Calculation logic (formulae) is NOT exposed for editing — only
   numeric rates, thresholds and statutory amounts.
   ─────────────────────────────────────────────────────────── */

const TAX_OVERRIDES_KEY = 'ste_tax_overrides_v1';

function taxOverrides(){
  try { return JSON.parse(localStorage.getItem(TAX_OVERRIDES_KEY)) || {}; } catch(e) { return {}; }
}
function applyTaxOverrides(){
  const overrides = taxOverrides();
  Object.entries(overrides).forEach(([k, v]) => {
    if (k === 'SL' && typeof v === 'object') {
      window.TAX.SL = { ...window.TAX.SL, ...v };
    } else {
      window.TAX[k] = v;
    }
  });
}
function setTaxOverride(key, value){
  const o = taxOverrides();
  o[key] = value;
  localStorage.setItem(TAX_OVERRIDES_KEY, JSON.stringify(o));
  applyTaxOverrides();
}
function resetTaxOverrides(){
  if (!confirm('Reset ALL tax values to the 2026/27 defaults? This cannot be undone.')) return;
  localStorage.removeItem(TAX_OVERRIDES_KEY);
  location.reload();
}

// Apply overrides as soon as auth.js loads (which is after data.js)
if (window.TAX) applyTaxOverrides();

/* ── Tax-config CMS tab (called from cms.js cmsTab handler) ── */
window.renderTaxConfigTab = function(){
  const T = window.TAX;
  const fields = [
    { section:'Income tax bands' },
    { k:'PA',          l:'Personal allowance',         u:'£/yr', step:10  },
    { k:'BR_LIMIT',    l:'Basic-rate band ceiling',     u:'£/yr', step:10  },
    { k:'HR_LIMIT',    l:'Higher-rate band ceiling',    u:'£/yr', step:10  },
    { k:'PA_TAPER_START', l:'PA taper threshold',       u:'£/yr', step:1000 },
    { section:'National Insurance — employee (Class 1 primary)' },
    { k:'NI_PT',       l:'Primary threshold',           u:'£/yr', step:10  },
    { k:'NI_UEL',      l:'Upper earnings limit',        u:'£/yr', step:10  },
    { k:'NI_MAIN',     l:'Main rate',                   u:'(decimal)', step:0.001 },
    { k:'NI_ADDL',     l:'Additional rate (over UEL)',  u:'(decimal)', step:0.001 },
    { section:'National Insurance — employer (Class 1 secondary)' },
    { k:'NI_ST',       l:'Secondary threshold',         u:'£/yr', step:100 },
    { k:'NI_ER',       l:'Employer rate',               u:'(decimal)', step:0.001 },
    { k:'EMPLOYMENT_ALLOWANCE', l:'Employment Allowance', u:'£/yr', step:100 },
    { section:'Corporation tax' },
    { k:'CT_LOWER',    l:'Small profits ceiling',       u:'£/yr', step:1000 },
    { k:'CT_UPPER',    l:'Main rate floor',             u:'£/yr', step:1000 },
    { k:'CT_SMALL',    l:'Small profits rate',          u:'(decimal)', step:0.001 },
    { k:'CT_MAIN',     l:'Main rate',                   u:'(decimal)', step:0.001 },
    { section:'VAT' },
    { k:'VAT_STD',     l:'Standard rate',               u:'(decimal)', step:0.001 },
    { k:'VAT_RED',     l:'Reduced rate',                u:'(decimal)', step:0.001 },
    { k:'VAT_REG_THR', l:'Registration threshold',      u:'£/yr', step:1000 },
    { section:'Dividends' },
    { k:'DIV_ALLOWANCE', l:'Dividend allowance',        u:'£/yr', step:100 },
    { k:'DIV_BR',        l:'Basic-rate dividend tax',    u:'(decimal)', step:0.0001 },
    { k:'DIV_HR',        l:'Higher-rate dividend tax',   u:'(decimal)', step:0.0001 },
    { k:'DIV_AR',        l:'Additional-rate dividend',   u:'(decimal)', step:0.0001 },
    { section:'National Minimum Wage (April 2026)' },
    { k:'NLW_21',       l:'21 and over (NLW)',          u:'£/hr', step:0.01 },
    { k:'NMW_18_20',    l:'18–20',                       u:'£/hr', step:0.01 },
    { k:'NMW_U18',      l:'16–17',                       u:'£/hr', step:0.01 },
    { k:'NMW_APP',      l:'Apprentice',                  u:'£/hr', step:0.01 },
    { section:'Statutory pay (2026/27)' },
    { k:'SSP_RATE',     l:'SSP weekly flat rate',        u:'£/wk', step:0.01 },
    { k:'SSP_PCT_CAP',  l:'SSP % of AWE cap',            u:'(decimal)', step:0.01 },
    { k:'SMP_LOWER',    l:'SMP/SAP weeks 7+ rate',       u:'£/wk', step:0.01 },
    { k:'SPP_RATE',     l:'SPP weekly rate',             u:'£/wk', step:0.01 },
    { k:'SAP_RATE',     l:'SAP weekly rate',             u:'£/wk', step:0.01 },
    { k:'SHPP_RATE',    l:'ShPP weekly rate',            u:'£/wk', step:0.01 },
    { k:'LEL',          l:'Lower earnings limit (SMP/SPP qual.)', u:'£/wk', step:0.01 },
    { section:'Statutory redundancy' },
    { k:'REDUNDANCY_WEEK_CAP', l:'Weekly pay cap',       u:'£/wk', step:1 },
    { section:'Self-employed NI (Class 2 & 4)' },
    { k:'CLASS2_RATE',  l:'Class 2 weekly rate',         u:'£/wk', step:0.01 },
    { k:'CLASS2_SPT',   l:'Class 2 small profits threshold', u:'£/yr', step:5 },
    { k:'CLASS4_MAIN',  l:'Class 4 main rate',           u:'(decimal)', step:0.001 },
    { k:'CLASS4_ADDL',  l:'Class 4 additional rate',     u:'(decimal)', step:0.001 },
    { section:'Auto-enrolment & levies' },
    { k:'AE_LOWER',     l:'AE qualifying earnings — lower', u:'£/yr', step:10 },
    { k:'AE_UPPER',     l:'AE qualifying earnings — upper', u:'£/yr', step:10 },
    { k:'AL_RATE',      l:'Apprenticeship Levy rate',     u:'(decimal)', step:0.0001 },
    { k:'AL_ALLOWANCE', l:'Apprenticeship Levy allowance', u:'£/yr', step:100 },
  ];
  const overrides = taxOverrides();
  return `
    <div class="adm-bar">
      <div>
        <div class="adm-t">Tax configuration</div>
        <div style="font-size:11.5px;color:var(--t3);margin-top:3px">${Object.keys(overrides).length === 0 ? 'Using 2026/27 defaults — no overrides set.' : `<span style="color:var(--goldd);font-weight:600">${Object.keys(overrides).length} override${Object.keys(overrides).length>1?'s':''} active.</span> Overrides apply across every calculator on the platform.`}</div>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn btn-ghost btn-sm" onclick="resetTaxOverrides()">Reset all to defaults</button>
        <button class="btn btn-navy btn-sm" onclick="cmsTab('taxconfig');showToast('All changes already saved live','ok')">↻ Reload</button>
      </div>
    </div>
    <div class="notes-section" style="margin-bottom:18px">
      <div class="notes-title">ⓘ How this works</div>
      <div class="notes-body">Edit any field — changes save automatically and apply to every calculator instantly. Calculation logic and formulae are protected and not editable. Reset returns everything to the 2026/27 defaults shipped with the platform. Use this during in-year Budget changes to roll out updated rates without a code release.</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px" class="taxcfg-grid">
      ${fields.reduce((html, f) => {
        if (f.section) return html + `<div style="grid-column:1/-1;margin-top:8px;padding-bottom:6px;border-bottom:1px solid var(--br);font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--t3)">${f.section}</div>`;
        const v = T[f.k];
        const isOverride = overrides.hasOwnProperty(f.k);
        return html + `
          <div class="ed-card">
            <div class="ed-card-b" style="padding:13px 16px">
              <div class="fg" style="margin-bottom:6px">
                <div class="fl">${f.l} ${isOverride ? '<span style="color:var(--goldd);font-weight:600">· override</span>' : ''}<span class="fl-hint">${f.u}</span></div>
                <input class="fi" type="number" step="${f.step}" value="${v}" oninput="setTaxOverride('${f.k}', parseFloat(this.value))" style="font-family:var(--mono);font-weight:600">
              </div>
              <div style="font-size:10.5px;color:var(--t3);font-family:var(--mono)">TAX.${f.k}</div>
            </div>
          </div>
        `;
      }, '')}
    </div>
  `;
};
