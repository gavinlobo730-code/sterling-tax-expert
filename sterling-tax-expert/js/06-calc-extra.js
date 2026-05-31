/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Extra calculators (v4)
   Employee NI, Gross-to-Net, Marginal Relief, SPP, SAP, ShPP
   ─────────────────────────────────────────────────────────── */

// ─────────────────────────────────────────────────────────
// EMPLOYEE NI CALCULATOR (Class 1 primary, standalone)
// ─────────────────────────────────────────────────────────
CALCS['employee-ni'] = {
  id: 'employee-ni',
  title: 'Employee NI Calculator',
  subtitle: 'Class 1 primary contributions — 8% main rate between £12,570 and £50,270, plus 2% on anything above.',
  inputs: [
    { id:'salary', type:'currency', label:'Annual salary (gross)', default:35000 },
  ],
  calculate(s){
    const T = window.TAX;
    const ni = employeeNI(s.salary);
    let mainBand = 0, addlBand = 0;
    if (s.salary > T.NI_PT) {
      mainBand = (Math.min(s.salary, T.NI_UEL) - T.NI_PT) * T.NI_MAIN;
      if (s.salary > T.NI_UEL) addlBand = (s.salary - T.NI_UEL) * T.NI_ADDL;
    }
    const effectiveRate = s.salary > 0 ? (ni / s.salary * 100) : 0;
    return { ni, mainBand, addlBand, effectiveRate, monthly:ni/12, weekly:ni/52, salary:s.salary };
  },
  render(r){
    return `
      <div style="border:2px solid var(--indigo);border-radius:14px;padding:28px 32px;background:var(--indigol);margin-bottom:18px">
        <div style="display:flex;align-items:flex-start;gap:16px">
          <div style="font-size:32px;flex-shrink:0">💷</div>
          <div>
            <div style="font-size:16px;font-weight:700;color:var(--navy);margin-bottom:6px">This calculator has moved</div>
            <p style="font-size:13.5px;color:var(--t2);line-height:1.65;margin-bottom:16px">
              Employee NI calculations — including the full band-by-band breakdown, monthly and weekly figures, and effective rate — are now included within the <strong>PAYE Tax &amp; NI Calculator</strong>.<br><br>
              The PAYE calculator also shows income tax, pension, student loan, employer NI and total employer cost in a single view.
            </p>
            <button class="btn btn-indigo" onclick="navigate('calc','paye')" style="font-size:13px;padding:10px 20px">
              Open PAYE Tax &amp; NI Calculator →
            </button>
          </div>
        </div>
      </div>
      ${notesCard('Employee NI in 2026/27', `Class 1 primary contributions: <strong>8%</strong> on earnings between £${fmtInt(window.TAX.NI_PT)} and £${fmtInt(window.TAX.NI_UEL)}, then <strong>2%</strong> on anything above. For salary £${fmtInt(r.salary)}: annual NI is <strong>${fmt(r.ni)}</strong> (${r.effectiveRate.toFixed(2)}% effective rate). Use the PAYE calculator for the full picture including income tax and employer costs.`)}
      ${actionsRow()}
    `;
  },
  related: ['paye','employer-ni','net-to-gross']
};

// ─────────────────────────────────────────────────────────
// GROSS-TO-NET — multi-frequency converter
// ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────
// MARGINAL RELIEF — standalone CT marginal-relief explorer
// ─────────────────────────────────────────────────────────
CALCS['marginal'] = {
  id: 'marginal',
  title: 'Corporation Tax Marginal Relief Calculator',
  subtitle: 'Standalone marginal-relief explorer for profits between £50,000 and £250,000 — the awkward CT band.',
  inputs: [
    { id:'profit',  type:'currency', label:'Taxable profit', default:120000 },
    { id:'assoc',   type:'number',   label:'Associated companies', default:0, min:0, max:50 },
    { id:'period',  type:'number',   label:'Accounting period (months)', default:12, min:1, max:18, suffix:'mo' },
  ],
  calculate(s){
    const T = window.TAX;
    const div = s.assoc + 1;
    const lo = (T.CT_LOWER / div) * (s.period / 12);
    const hi = (T.CT_UPPER / div) * (s.period / 12);
    let ct = 0, mr = 0, band = '';
    if (s.profit <= lo)      { ct = s.profit * T.CT_SMALL; band = `Small profits (${(T.CT_SMALL*100)}%)`; }
    else if (s.profit >= hi) { ct = s.profit * T.CT_MAIN;  band = `Main rate (${(T.CT_MAIN*100)}%)`; }
    else                     { mr = (hi - s.profit) * T.CT_MR_FRACTION; ct = s.profit * T.CT_MAIN - mr; band = 'Marginal relief'; }
    const eff = s.profit > 0 ? ct/s.profit*100 : 0;
    return { ct, mr, band, lo, hi, eff, profit:s.profit };
  },
  render(r){
    return `
      ${kpiRow([
        kpi('Corporation tax due', fmt(r.ct),  { color:'red',  sub:r.band }),
        kpi('Marginal relief',     fmt(r.mr),  { color:'green', sub:r.mr > 0 ? 'Applied to your profit' : 'Not in band' }),
        kpi('Effective rate',      r.eff.toFixed(2)+'%', { color:'primary', sub:`Profit \u00a3${fmtInt(r.profit)}` }),
      ])}
      <div class="chart-section">
        <div class="chart-title">Your profit on the marginal relief gradient</div>
        <div class="corp-band">
          <div class="corp-band-row">
            <span class="corp-band-label">Small profits (19%) \u2014 up to ${fmt(r.lo,0)}</span>
            <div class="corp-band-bar"><div class="corp-band-fill" style="width:${r.profit<=r.lo?100:0}%;background:var(--green)"></div></div>
            <span class="corp-band-val">${r.profit<=r.lo?'\u25cf':''}</span>
          </div>
          <div class="corp-band-row">
            <span class="corp-band-label">Marginal relief \u2014 ${fmt(r.lo,0)} to ${fmt(r.hi,0)}</span>
            <div class="corp-band-bar"><div class="corp-band-fill" style="width:${r.profit>r.lo&&r.profit<r.hi?Math.min((r.profit-r.lo)/(r.hi-r.lo)*100,100):0}%;background:var(--goldd)"></div></div>
            <span class="corp-band-val">${r.profit>r.lo&&r.profit<r.hi?'\u25cf':''}</span>
          </div>
          <div class="corp-band-row">
            <span class="corp-band-label">Main rate (25%) \u2014 above ${fmt(r.hi,0)}</span>
            <div class="corp-band-bar"><div class="corp-band-fill" style="width:${r.profit>=r.hi?100:0}%;background:var(--red)"></div></div>
            <span class="corp-band-val">${r.profit>=r.hi?'\u25cf':''}</span>
          </div>
        </div>
      </div>
      ${notesCard('The marginal relief formula', `For 2026/27 the relief = <strong>(Upper limit \u2212 Augmented profit) \u00d7 3/200</strong>. With no associated companies and a 12-month period, the upper limit is \u00a3250,000 and the lower limit is \u00a350,000. The fraction 3/200 produces an effective rate of <strong>26.5%</strong> on profits in the band \u2014 higher than the 25% main rate. The reason: it claws back the small-profits relief that small companies enjoy.`)}
      ${actionsRow()}
    `;
  },
  related: ['corp','sal-vs-div','self-assess']
};

// ─────────────────────────────────────────────────────────
// SPP — Statutory Paternity Pay
// ─────────────────────────────────────────────────────────
CALCS['spp'] = {
  id: 'spp',
  title: 'Statutory Paternity Pay (SPP) Calculator',
  subtitle: 'SPP for fathers, partners and adoptive parents — paid for up to 2 weeks at £194.32 or 90% AWE (whichever lower).',
  inputs: [
    { id:'awe',     type:'currency', label:'Average weekly earnings (AWE)',  default:500 },
    { id:'weeks',   type:'number',   label:'Weeks of paternity leave',        default:2, min:1, max:2 },
  ],
  calculate(s){
    const T = window.TAX;
    const eligible = s.awe >= T.LEL;
    const weeklyRate = Math.min(s.awe * 0.90, T.SPP_RATE);
    const total = weeklyRate * s.weeks;
    return { eligible, weeklyRate, total, lel:T.LEL };
  },
  render(r){
    if (!r.eligible) {
      return `<div style="background:#FEF2F2;border:1px solid #FCA5A5;border-radius:12px;padding:24px">
        <div style="font-size:14px;font-weight:700;color:#991B1B;margin-bottom:6px">Not eligible for SPP</div>
        <div style="font-size:13px;color:var(--t2);line-height:1.7">AWE must be at least <strong>\u00a3${r.lel}/week</strong>.</div>
      </div>${actionsRow()}`;
    }
    return `
      ${kpiRow([
        kpi('Total SPP payable', fmt(r.total),       { color:'primary', sub:'Capped at 2 weeks' }),
        kpi('Weekly rate',       fmt(r.weeklyRate),  { color:'gold',    sub:'Lower of 90% AWE or \u00a3' + window.TAX.SPP_RATE }),
        kpi('Statutory cap',     fmt(window.TAX.SPP_RATE), { color:'navy', sub:'2026/27' }),
      ])}
      ${notesCard('Eligibility', `To qualify, the employee must have continuous employment of at least <strong>26 weeks</strong> ending with the 15th week before the expected week of childbirth, and earn at least the LEL. SPP can be taken as 1 block of 1 week or 2 consecutive weeks, within 52 weeks of birth or placement.`)}
      ${actionsRow()}
    `;
  },
  related: ['smp','ssp','holiday']
};

// ─────────────────────────────────────────────────────────
// SAP — Statutory Adoption Pay
// ─────────────────────────────────────────────────────────
CALCS['sap'] = {
  id: 'sap',
  title: 'Statutory Adoption Pay (SAP) Calculator',
  subtitle: 'SAP follows the SMP structure — 90% AWE for 6 weeks, then £194.32 or 90% AWE (whichever lower) for 33 weeks.',
  inputs: [
    { id:'awe', type:'currency', label:'Average weekly earnings (AWE)', default:500 },
  ],
  calculate(s){
    const T = window.TAX;
    const eligible = s.awe >= T.LEL;
    const first6 = s.awe * T.SMP_HIGHER * 6;
    const lowerRate = Math.min(s.awe * 0.90, T.SAP_RATE);
    const next33 = lowerRate * 33;
    const total = first6 + next33;
    return { eligible, first6, weeklyHigher:s.awe*0.90, lowerRate, next33, total, lel:T.LEL };
  },
  render(r){
    if (!r.eligible) {
      return `<div style="background:#FEF2F2;border:1px solid #FCA5A5;border-radius:12px;padding:24px">
        <div style="font-size:14px;font-weight:700;color:#991B1B;margin-bottom:6px">Not eligible for SAP</div>
        <div style="font-size:13px;color:var(--t2);line-height:1.7">AWE must be at least <strong>\u00a3${r.lel}/week</strong>.</div>
      </div>${actionsRow()}`;
    }
    return `
      ${kpiRow([
        kpi('Total SAP (39 weeks)',  fmt(r.total),         { color:'primary' }),
        kpi('Weeks 1\u20136 (90% AWE)', fmt(r.weeklyHigher), { color:'green',  sub:fmt(r.first6) + ' total' }),
        kpi('Weeks 7\u201339',         fmt(r.lowerRate),    { color:'gold',   sub:fmt(r.next33) + ' total' }),
      ])}
      <div class="breakdown">
        <div class="bk-header"><div class="bk-title">Period-by-period</div></div>
        ${bkRow('First 6 weeks @ 90% AWE',  '#0E7C70', r.first6, r.total)}
        ${bkRow('Weeks 7\u201339 @ lower rate', '#876B14', r.next33, r.total)}
        ${bkRow('Total SAP',                 '#123458', r.total,  r.total, false, true)}
      </div>
      ${notesCard('Eligibility', `Available to one parent of an adopted child (the other may take Statutory Paternity Pay). Employee must have at least 26 weeks of continuous service ending with the week they are matched, and earn at least the LEL. Statutory adoption leave is 52 weeks total \u2014 SAP covers the first 39.`)}
      ${actionsRow()}
    `;
  },
  related: ['smp','spp','shpp']
};

// ─────────────────────────────────────────────────────────
// SHPP — Shared Parental Pay
// ─────────────────────────────────────────────────────────
CALCS['shpp'] = {
  id: 'shpp',
  title: 'Shared Parental Pay (ShPP) Calculator',
  subtitle: 'Up to 37 weeks of shared parental pay at £194.32 or 90% AWE (whichever lower) — divisible between parents.',
  inputs: [
    { id:'aweA',   type:'currency', label:'Parent A — average weekly earnings', default:550 },
    { id:'weeksA', type:'number',   label:'Weeks taken by Parent A',             default:20, min:0, max:37 },
    { id:'aweB',   type:'currency', label:'Parent B — average weekly earnings', default:450 },
    { id:'weeksB', type:'number',   label:'Weeks taken by Parent B',             default:17, min:0, max:37 },
  ],
  calculate(s){
    const T = window.TAX;
    const overAllocated = (s.weeksA + s.weeksB) > 37;
    const eligibleA = s.aweA >= T.LEL;
    const eligibleB = s.aweB >= T.LEL;
    const rateA = eligibleA ? Math.min(s.aweA * 0.90, T.SHPP_RATE) : 0;
    const rateB = eligibleB ? Math.min(s.aweB * 0.90, T.SHPP_RATE) : 0;
    // Cap weeks when over-allocated: Parent A takes priority, Parent B gets the remainder.
    // This ensures the displayed total never exceeds the statutory 37-week maximum.
    const effectiveWeeksA = overAllocated ? Math.min(s.weeksA, 37) : s.weeksA;
    const effectiveWeeksB = overAllocated ? Math.min(s.weeksB, Math.max(0, 37 - effectiveWeeksA)) : s.weeksB;
    const totalWeeks = effectiveWeeksA + effectiveWeeksB;
    const payA = rateA * effectiveWeeksA;
    const payB = rateB * effectiveWeeksB;
    const total = payA + payB;
    const inputWeeksA = s.weeksA;
    const inputWeeksB = s.weeksB;
    return { totalWeeks, eligibleA, eligibleB, rateA, rateB, payA, payB, total, overAllocated, effectiveWeeksA, effectiveWeeksB, inputWeeksA, inputWeeksB };
  },
  render(r){
    return `
      ${r.overAllocated ? `<div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:14px 18px;margin-bottom:12px;font-size:13px;color:#92400E;line-height:1.65"><strong>\u26a0 Over 37-week cap.</strong> Combined ShPP cannot exceed 37 weeks. You entered ${r.inputWeeksA + r.inputWeeksB} weeks total. Figures below are capped: Parent A ${r.effectiveWeeksA} weeks, Parent B ${r.effectiveWeeksB} weeks. Reduce one parent's allocation to match your intended split.</div>` : ''}
      ${kpiRow([
        kpi('Total ShPP payable', fmt(r.total),  { color:'primary', sub:`${r.totalWeeks} weeks total (statutory max 37)` }),
        kpi('Parent A',           fmt(r.payA),   { color:'gold',  sub:r.eligibleA ? `${fmt(r.rateA)}/week \u00d7 ${r.effectiveWeeksA} weeks` : 'Not eligible (AWE below LEL)' }),
        kpi('Parent B',           fmt(r.payB),   { color:'green', sub:r.eligibleB ? `${fmt(r.rateB)}/week \u00d7 ${r.effectiveWeeksB} weeks` : 'Not eligible (AWE below LEL)' }),
      ])}
      ${notesCard('How Shared Parental Leave works', `Available when both parents qualify and the mother/primary adopter curtails their maternity/adoption leave. Total available ShPP is <strong>52 \u2212 weeks of SMP/SAP already taken</strong>, up to a max of 37 weeks. Both parents must meet the employment and earnings tests independently. Notice of leave intervals (SPLIT notices) must be given to employers at least 8 weeks in advance.`)}
      ${actionsRow()}
    `;
  },
  related: ['smp','spp','sap']
};
