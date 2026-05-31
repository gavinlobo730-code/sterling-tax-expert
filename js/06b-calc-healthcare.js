/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Healthcare Calculators
   NHS Payroll & Pension Calculator (2026/27)
   ─────────────────────────────────────────────────────────── */

// scottishIncomeTaxOn() is defined in 04-calc-payroll.js (loads first).

// ── NHS pension tier lookup ────────────────────────────────
function nhsPensionTier(pensionablePay) {
  const tiers = window.TAX.NHS_PENSION_TIERS;
  for (let i = 0; i < tiers.length; i++) {
    if (pensionablePay <= tiers[i].to) return { tierIndex: i, rate: tiers[i].rate, to: tiers[i].to };
  }
  return { tierIndex: tiers.length - 1, rate: tiers[tiers.length - 1].rate, to: Infinity };
}

// ── Tab switching helper (rendered inline, no external deps) ─
function nhsTabHTML(tab1, tab2, tab3) {
  return `
    <div class="nhs-tabs">
      <button class="nhs-tab active" onclick="nhsShowTab(this,'nhs-t1')">Take-Home Pay</button>
      <button class="nhs-tab" onclick="nhsShowTab(this,'nhs-t2')">NHS Pension</button>
      <button class="nhs-tab" onclick="nhsShowTab(this,'nhs-t3')">AA Risk</button>
    </div>
    <div id="nhs-t1" class="nhs-panel">${tab1}</div>
    <div id="nhs-t2" class="nhs-panel" style="display:none">${tab2}</div>
    <div id="nhs-t3" class="nhs-panel" style="display:none">${tab3}</div>
  `;
}

// nhsShowTab is called by inline onclick — must be on window
window.nhsShowTab = function(btn, panelId) {
  btn.closest('.calc-results').querySelectorAll('.nhs-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  btn.closest('.calc-results').querySelectorAll('.nhs-panel').forEach(p => p.style.display = 'none');
  const panel = document.getElementById(panelId);
  if (panel) panel.style.display = '';
};

// ─────────────────────────────────────────────────────────
// NHS PAYROLL & PENSION CALCULATOR
// ─────────────────────────────────────────────────────────
CALCS['nhs-payroll'] = {
  id: 'nhs-payroll',
  title: 'NHS Payroll & Pension Calculator (2026/27)',
  subtitle: 'Take-home pay, NHS pension contributions and annual allowance risk — for NHS doctors, consultants, salaried GPs, nurses and AHPs.',
  metaBadges: ['NHS 2015 CARE Scheme', 'Scotland supported'],
  inputs: [
    { id:'nhs_gross',   type:'currency', label:'Annual NHS salary (gross)', default:45000, hint:'Your full-time equivalent gross salary before any deductions' },
    { id:'nhs_freq',    type:'toggle',   label:'Show results as', default:'monthly', options:[{v:'monthly',l:'Monthly'},{v:'annual',l:'Annual'}] },
    { id:'nhs_pension', type:'toggle',   label:'NHS pension member?', default:'yes', options:[{v:'yes',l:'Yes'},{v:'no',l:'No'}] },
    { id:'nhs_plan',    type:'select',   label:'Student loan plan', default:'0', options:[
      {v:'0',l:'No student loan'},{v:'1',l:'Plan 1'},{v:'2',l:'Plan 2'},
      {v:'4',l:'Plan 4 (Scottish)'},{v:'5',l:'Plan 5 (post-Aug 2023)'},{v:'PG',l:'Postgraduate loan'}
    ]},
    { id:'nhs_regime',  type:'toggle',   label:'Tax regime', default:'england', options:[{v:'england',l:'England & Wales'},{v:'scotland',l:'Scotland'}] },
    { type:'section',   label:'Additional income (optional)' },
    { id:'nhs_extra',   type:'currency', label:'Additional NHS income', default:0, hint:'On-calls, overtime, waiting list initiative payments' },
    { id:'nhs_other',   type:'currency', label:'Other non-NHS income', default:0, hint:'Rental income, self-employment, bank shifts' },
  ],
  calculate(s) {
    const T = window.TAX;
    const optedIn = s.nhs_pension === 'yes';
    const gross = s.nhs_gross;
    const totalGross = gross + (s.nhs_extra || 0) + (s.nhs_other || 0);

    const pensionablePay = gross;
    const tier = nhsPensionTier(pensionablePay);
    const employeePension = optedIn ? pensionablePay * tier.rate : 0;
    const employerPension = optedIn ? pensionablePay * T.NHS_ER_CONTRIB : 0;

    const taxablePay = totalGross - employeePension;

    const taxCalc = s.nhs_regime === 'scotland'
      ? scottishIncomeTaxOn(taxablePay)
      : incomeTaxOn(taxablePay);
    const incomeTax = taxCalc.tax;

    const ni = employeeNI(totalGross);
    const sl = studentLoan(totalGross, s.nhs_plan);

    const netAnnual = totalGross - incomeTax - ni - employeePension - sl;
    const netMonthly = netAnnual / 12;
    const effRate = totalGross > 0 ? ((incomeTax + ni + sl) / totalGross * 100) : 0;
    const totalDeductions = incomeTax + ni + sl + employeePension;

    const pensionInputProxy = optedIn ? (pensionablePay / T.NHS_ACCRUAL_DENOM) * T.AA_DB_FACTOR : 0;
    const adjustedIncome = totalGross + employerPension;
    let taperAA = T.AA_STANDARD;
    if (totalGross > T.AA_THRESHOLD_INCOME && adjustedIncome > T.AA_ADJUSTED_INCOME) {
      const reduction = Math.min(
        (adjustedIncome - T.AA_ADJUSTED_INCOME) * T.AA_TAPER_RATE,
        T.AA_STANDARD - T.AA_MINIMUM
      );
      taperAA = T.AA_STANDARD - reduction;
    }
    const aaRatio = taperAA > 0 ? pensionInputProxy / taperAA : 0;
    let aaStatus = 'green';
    if (aaRatio >= 1) aaStatus = 'red';
    else if (aaRatio >= 0.75) aaStatus = 'amber';

    const annualAccrual = optedIn ? pensionablePay / T.NHS_ACCRUAL_DENOM : 0;
    const cpi = T.NHS_CPI_ASSUMPTION + T.NHS_CPI_ABOVE;
    const proj10 = annualAccrual * ((Math.pow(1 + cpi, 10) - 1) / cpi);
    const proj20 = annualAccrual * ((Math.pow(1 + cpi, 20) - 1) / cpi);
    const proj30 = annualAccrual * ((Math.pow(1 + cpi, 30) - 1) / cpi);

    return {
      gross, totalGross, taxablePay, incomeTax, ni, sl,
      employeePension, employerPension,
      netAnnual, netMonthly, effRate, totalDeductions,
      optedIn, tier, pensionablePay,
      pensionInputProxy, taperAA, aaStatus, aaRatio, adjustedIncome,
      annualAccrual, proj10, proj20, proj30,
      freq: s.nhs_freq, regime: s.nhs_regime,
    };
  },
  render(r) {
    const T = window.TAX;
    const m = r.freq === 'monthly';
    const d = v => m ? fmt(v / 12) : fmt(v);
    const period = m ? '/ month' : '/ year';

    const donutData = [
      { name: 'Net pay',      val: r.netAnnual,        color: '#16A34A' },
      { name: 'Income tax',   val: r.incomeTax,        color: '#C0392B' },
      { name: 'Employee NI',  val: r.ni,               color: '#C49A2E' },
      ...(r.employeePension > 0 ? [{ name: 'NHS pension', val: r.employeePension, color: '#2563EB' }] : []),
      ...(r.sl > 0 ? [{ name: 'Student loan', val: r.sl, color: '#EA580C' }] : []),
    ];

    const tab1 = `
      ${kpiRow([
        kpi(`Net pay ${period}`, d(r.netAnnual), { color: 'primary', sub: m ? fmt(r.netAnnual) + ' / year' : fmt(r.netAnnual / 12) + ' / month' }),
        kpi('Effective tax rate', r.effRate.toFixed(1) + '%', { color: 'navy', sub: 'Income tax + NI' }),
        kpi('Total deductions', d(r.totalDeductions), { color: 'red', sub: period }),
      ])}
      ${kpiRow([
        kpi('Gross pay', d(r.totalGross), { color: 'gold', sub: period }),
        kpi('Income tax', d(r.incomeTax), { color: 'red', sub: period }),
        kpi('National Insurance', d(r.ni), { color: 'green', sub: period }),
        ...(r.optedIn ? [kpi('NHS pension', d(r.employeePension), { color: 'navy', sub: period })] : []),
      ])}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:4px">
        <div class="chart-section">
          <div class="chart-title"><span>Salary breakdown</span><span style="font-size:11px;color:var(--t3)">Annual</span></div>
          <div class="donut-wrap">
            ${donutSVG(donutData, r.totalGross)}
            <div class="donut-legend">${donutData.map(dd => `
              <div class="dl-item">
                <div class="dl-dot" style="background:${dd.color}"></div>
                <span class="dl-name">${dd.name}</span>
                <span class="dl-val">${fmt(dd.val)}</span>
                <span class="dl-pct">${r.totalGross > 0 ? (dd.val / r.totalGross * 100).toFixed(1) + '%' : ''}</span>
              </div>`).join('')}
            </div>
          </div>
        </div>
        <div class="breakdown">
          <div class="bk-header"><div class="bk-title">Full breakdown (annual)</div></div>
          ${bkRow('Gross pay', '#6B748F', r.totalGross, r.totalGross, true)}
          ${r.optedIn ? bkRow('NHS pension (employee)', '#2563EB', r.employeePension, r.totalGross) : ''}
          ${bkRow('Income tax', '#C0392B', r.incomeTax, r.totalGross)}
          ${bkRow('National Insurance', '#C49A2E', r.ni, r.totalGross)}
          ${r.sl > 0 ? bkRow('Student loan', '#EA580C', r.sl, r.totalGross) : ''}
          ${bkRow('Total deductions', '#C0392B', r.totalDeductions, r.totalGross, true)}
          ${bkRow('Net take-home', '#16A34A', r.netAnnual, r.totalGross, false, true)}
        </div>
      </div>
      ${r.regime === 'scotland' ? `<p style="font-size:11px;color:var(--t3);margin-top:8px">Scottish income tax rates applied.</p>` : ''}
      ${actionsRow()}
    `;

    const tierLabels = ['Up to £13,259','£13,260 – £28,854','£28,855 – £35,155','£35,156 – £52,778','£52,779 – £67,668','£67,669+'];
    const tierRows = T.NHS_PENSION_TIERS.map((t, i) => {
      const isCurrent = i === r.tier.tierIndex;
      return `<tr style="${isCurrent ? 'background:var(--blue3,#EFF6FF);font-weight:600' : ''}">
        <td style="padding:6px 10px">${tierLabels[i]}</td>
        <td style="padding:6px 10px;text-align:center">${(t.rate * 100).toFixed(1)}%</td>
        <td style="padding:6px 10px;text-align:right">${isCurrent ? '← Your tier' : ''}</td>
      </tr>`;
    }).join('');

    const tab2 = r.optedIn ? `
      ${kpiRow([
        kpi('Your contribution rate', (r.tier.rate * 100).toFixed(1) + '%', { color: 'primary', sub: 'Employee rate 2026/27' }),
        kpi('Your annual contribution', fmt(r.employeePension), { color: 'navy', sub: fmt(r.employeePension / 12) + ' / month' }),
        kpi('Employer contribution', fmt(r.employerPension), { color: 'green', sub: '23.7% — paid by NHS employer' }),
      ])}
      <div class="breakdown" style="margin-bottom:16px">
        <div class="bk-header"><div class="bk-title">2015 CARE Scheme — contribution tiers 2026/27</div></div>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="background:var(--g50)">
            <th style="padding:6px 10px;text-align:left;font-weight:600">Pensionable pay</th>
            <th style="padding:6px 10px;text-align:center;font-weight:600">Rate</th>
            <th style="padding:6px 10px"></th>
          </tr></thead>
          <tbody>${tierRows}</tbody>
        </table>
      </div>
      <div class="breakdown" style="margin-bottom:16px">
        <div class="bk-header"><div class="bk-title">Pension accrual illustration</div></div>
        <div style="padding:12px 14px;font-size:13px;color:var(--t2)">
          <div style="margin-bottom:8px"><strong>This year's accrual:</strong> ${fmt(r.annualAccrual)} / year added to your pension</div>
          <div style="font-size:11px;color:var(--t3);margin-bottom:12px">Based on 1/54th of pensionable pay. Revalued annually at CPI + 1.5%.</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
            ${[['10 years', r.proj10],['20 years', r.proj20],['30 years', r.proj30]].map(([l,v]) => `
            <div style="text-align:center;padding:10px;background:var(--g50);border-radius:8px">
              <div style="font-size:18px;font-weight:700;color:var(--blue2)">${fmt(v)}</div>
              <div style="font-size:11px;color:var(--t3);margin-top:2px">After ${l}</div>
            </div>`).join('')}
          </div>
          <p style="font-size:11px;color:var(--t3);margin-top:10px;line-height:1.5">Illustration only — assumes 4% compound revaluation (CPI 2.5% + 1.5%). Actual pension depends on future salary, revaluation and scheme rules.</p>
        </div>
      </div>
      ${notesCard('NHS 2015 CARE Scheme', `<strong>CARE</strong> (Career Average Revalued Earnings): you build 1/54th of pensionable pay each year, revalued at CPI + 1.5% until you draw.<br><br><strong>Employer contribution (23.7%)</strong> is paid directly to NHS Pensions — it does not reduce your take-home. Payroll employer contribution is 14.38%; NHSBSA covers the remaining 9.4% centrally.<br><br><strong>Tier thresholds</strong> are based on full-time equivalent (WTE 1.0) pensionable pay.`)}
      ${actionsRow()}
    ` : `<div style="padding:24px;text-align:center;color:var(--t2)"><p style="font-size:13px">Select <strong>Yes</strong> under <em>NHS pension member?</em> to model contributions and accrual.</p></div>${actionsRow()}`;

    const aaColors = { green:'#16A34A', amber:'#D97706', red:'#DC2626' };
    const aaLabels = { green:'Low Risk — No action needed', amber:'Review Recommended', red:'Professional Advice Recommended' };
    const aaDescs  = {
      green:  `Your estimated pension input (${fmt(r.pensionInputProxy)}) is within your annual allowance of ${fmt(r.taperAA)}.`,
      amber:  `Your estimated pension input (${fmt(r.pensionInputProxy)}) is approaching your annual allowance of ${fmt(r.taperAA)}. Request a Pension Savings Statement and speak with a tax adviser.`,
      red:    `Your estimated pension input (${fmt(r.pensionInputProxy)}) may exceed your annual allowance of ${fmt(r.taperAA)}. Consider Scheme Pays and seek professional advice before 31 July.`,
    };

    const tab3 = r.optedIn ? `
      <div style="border:2px solid ${aaColors[r.aaStatus]};border-radius:12px;padding:20px 24px;margin-bottom:16px;background:${r.aaStatus==='green'?'#F0FDF4':r.aaStatus==='amber'?'#FFFBEB':'#FEF2F2'}">
        <div style="font-size:16px;font-weight:700;color:${aaColors[r.aaStatus]};margin-bottom:8px">${r.aaStatus==='green'?'✓':r.aaStatus==='amber'?'⚠':'✗'} ${aaLabels[r.aaStatus]}</div>
        <p style="font-size:13px;color:var(--t2);margin:0">${aaDescs[r.aaStatus]}</p>
      </div>
      <div class="breakdown" style="margin-bottom:16px">
        <div class="bk-header"><div class="bk-title">Annual Allowance summary</div></div>
        <div style="padding:12px 14px;font-size:13px;display:grid;grid-template-columns:1fr 1fr;gap:8px 16px">
          <span style="color:var(--t3)">Estimated pension input</span><span style="text-align:right;font-weight:600">${fmt(r.pensionInputProxy)}</span>
          <span style="color:var(--t3)">Standard annual allowance</span><span style="text-align:right;font-weight:600">${fmt(T.AA_STANDARD)}</span>
          ${r.taperAA < T.AA_STANDARD ? `<span style="color:var(--t3)">Tapered allowance</span><span style="text-align:right;font-weight:600;color:#D97706">${fmt(r.taperAA)}</span>` : ''}
          <span style="color:var(--t3)">Headroom</span><span style="text-align:right;font-weight:600;color:${r.aaStatus==='green'?'#16A34A':'#DC2626'}">${fmt(Math.max(0, r.taperAA - r.pensionInputProxy))}</span>
        </div>
      </div>
      ${notesCard('About this estimate', `Pension input estimated using 1/54 × pensionable pay × 16 proxy — your actual figure comes from NHS Pensions. Taper applies when threshold income > £200,000 and adjusted income > £260,000. Carry forward of unused allowance from prior 3 years is not modelled here. Scheme Pays election deadline: 31 July following the tax year.`)}
      ${actionsRow(`<button class="btn btn-ghost btn-sm" onclick="navigate('contact')">Book a free AA review →</button>`)}
    ` : `<div style="padding:24px;text-align:center;color:var(--t3);font-size:13px">Select <strong>Yes</strong> under <em>NHS pension member?</em> to see your AA position.</div>`;

    return nhsTabHTML(tab1, tab2, tab3)
      + `<div style="font-size:11px;color:var(--t3);border-top:1px solid var(--br);padding-top:10px;margin-top:4px;line-height:1.6"><strong>2026/27:</strong> NHS pension tier thresholds confirmed (3.8% CPI uplift). Employer payroll rate 14.38% confirmed by NHSBSA. All calculations are estimates only.</div>`;
  },
  related: ['payslip', 'true-cost', 'self-assess', 'sal-vs-div'],
};

/* ─────────────────────────────────────────────────────────
   NHS TRUE EMPLOYMENT COST CALCULATOR
   Gross → Net or Net → Gross for NHS staff.
   NHS pension occupational (pre-tax), employee tier rate,
   employer 14.38%, employer NI at 15%.
   ───────────────────────────────────────────────────────── */
CALCS['nhs-true-cost'] = {
  id: 'nhs-true-cost',
  title: 'NHS True Employment Cost Calculator',
  subtitle: 'Enter a gross NHS salary or desired take-home. See the employee\'s net pay, their NHS pension contribution tier, and the full employer cost including 14.38% pension and employer NI.',
  metaBadges: ['NHS pension tiers', 'Gross → Net', 'Net → Gross'],

  inputs: [
    { id:'mode',      type:'toggle',  label:'Calculate from',             default:'gross', options:[{v:'gross',l:'Gross salary'},{v:'net',l:'Desired take-home'}] },
    { id:'gross_in',  type:'currency',label:'Annual gross salary',        default:45000,   hint:'Full-time equivalent, before deductions' },
    { id:'net_in',    type:'currency',label:'Desired net take-home (annual)', default:35000 },
    { id:'regime',    type:'toggle',  label:'Tax regime',                 default:'england', options:[{v:'england',l:'England & Wales'},{v:'scotland',l:'Scotland'}] },
    { id:'nhs_opt',   type:'toggle',  label:'NHS pension member?',        default:'yes',   options:[{v:'yes',l:'Yes'},{v:'no',l:'No'}] },
    { type:'section',                 label:'Other deductions' },
    { id:'plan',      type:'select',  label:'Student loan plan',          default:'0',     options:[{v:'0',l:'None'},{v:'1',l:'Plan 1'},{v:'2',l:'Plan 2'},{v:'4',l:'Plan 4'},{v:'5',l:'Plan 5'},{v:'PG',l:'Postgrad'}] },
    { id:'allowance', type:'checkbox',label:'Employment Allowance (£10,500/yr)', default:false, hint:'Most NHS trusts are not eligible' },
  ],

  afterRecalc: function(s) {
    if (s.mode === 'net') _hide('gross_in'); else _show('gross_in');
    if (s.mode === 'gross') _hide('net_in'); else _show('net_in');
  },

  calculate: function(s) {
    var T = window.TAX;
    var gross;
    if (s.mode === 'gross') {
      gross = s.gross_in || 0;
    } else {
      var target = s.net_in || 0;
      var lo = target * 0.5, hi = target * 3 + 200000;
      gross = target;
      for (var i = 0; i < 80; i++) {
        var mid = (lo + hi) / 2;
        var tryNet = this._calc(mid, s, T).netPay;
        if (Math.abs(tryNet - target) < 0.05) { gross = mid; break; }
        if (tryNet < target) lo = mid; else hi = mid;
        gross = mid;
      }
    }
    return this._calc(gross, s, T);
  },

  _calc: function(gross, s, T) {
    var optedIn = s.nhs_opt === 'yes';
    var tier = nhsPensionTier(gross);
    var eePension  = optedIn ? gross * tier.rate : 0;
    var erPension  = optedIn ? gross * 0.1438 : 0; // payroll employer rate
    // NHS pension is occupational pre-tax — reduces taxable pay
    var taxableGross = Math.max(0, gross - eePension);
    var taxRes = s.regime === 'scotland' ? scottishIncomeTaxOn(taxableGross) : incomeTaxOn(taxableGross);
    var incomeTax = taxRes.tax;
    // NI is on total gross (NHS pension does NOT reduce NI base)
    var empNI = employeeNI(gross);
    var erNI  = employerNI(gross, s.allowance);
    var sl = studentLoan(gross, s.plan);
    var netPay = gross - eePension - incomeTax - empNI - sl;
    var empCost = gross + erNI + erPension;
    var effRate = gross > 0 ? (incomeTax + empNI + sl) / gross * 100 : 0;
    var overheadPct = gross > 0 ? (empCost - gross) / gross * 100 : 0;
    return {
      gross, taxableGross, eePension, erPension,
      incomeTax, empNI, erNI, sl, netPay, empCost,
      tier, effRate, overheadPct,
      optedIn, regime: s.regime, paUsed: taxRes.paUsed
    };
  },

  render: function(r) {
    var c = { net:'#16A34A', tax:'#C0392B', ni:'#C49A2E', pension:'#2563EB', erPension:'#0EA5E9', gross:'#6B748F', employer:'#0B1E3D' };

    var donutData = [
      { name:'Net pay',    val:r.netPay,    color:c.net },
      { name:'Income tax', val:r.incomeTax, color:c.tax },
      { name:'Empl. NI',   val:r.empNI,     color:c.ni  },
    ];
    if (r.eePension > 0) donutData.push({ name:'NHS pension (ee)', val:r.eePension, color:c.pension });
    if (r.sl > 0) donutData.push({ name:'Student loan', val:r.sl, color:'#EA580C' });

    var freqRow = function(lbl, d) {
      var dp = d >= 260 ? 2 : 0;
      return '<div class="ft-row">'
        + '<span>' + lbl + '</span>'
        + '<span>' + fmt(r.gross / d, dp) + '</span>'
        + '<span>' + fmt(r.incomeTax / d, dp) + '</span>'
        + '<span>' + fmt(r.empNI / d, dp) + '</span>'
        + '<span style="color:var(--green);font-weight:700">' + fmt(r.netPay / d, dp) + '</span>'
        + '<span style="color:var(--navy);font-weight:600">' + fmt(r.empCost / d, dp) + '</span>'
        + '</div>';
    };

    return kpiRow([
      kpi('Employee take-home',  fmt(r.netPay),   { color:'primary', sub: fmt(r.netPay / 12) + ' / month · ' + fmt(r.netPay / 52) + ' / week' }),
      kpi('Total employer cost', fmt(r.empCost),  { color:'navy',    sub: fmt(r.empCost / 12) + ' / month · ' + r.overheadPct.toFixed(1) + '% above salary' }),
      kpi('NHS pension tier',    (r.tier.rate * 100).toFixed(1) + '%', { color:'gold', sub: r.optedIn ? 'Employee contribution rate' : 'Not opted in' }),
    ])
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">'
      + '<div class="chart-section"><div class="chart-title"><span>Employee breakdown</span><span style="font-size:11px;color:var(--t3)">Annual</span></div>'
        + '<div class="donut-wrap">' + donutSVG(donutData, r.gross)
        + '<div class="donut-legend">' + donutData.map(function(d) {
          return '<div class="dl-item"><div class="dl-dot" style="background:' + d.color + '"></div>'
            + '<span class="dl-name">' + d.name + '</span>'
            + '<span class="dl-val">' + fmt(d.val) + '</span>'
            + '<span class="dl-pct">' + (r.gross > 0 ? (d.val / r.gross * 100).toFixed(1) + '%' : '') + '</span></div>';
        }).join('') + '</div></div></div>'
      + '<div>'
        + '<div class="breakdown"><div class="bk-header"><div class="bk-title">Employee — deductions</div></div>'
          + bkRow('Gross salary', c.gross, r.gross, r.gross, true)
          + (r.eePension > 0 ? bkRow('NHS pension (pre-tax)', c.pension, r.eePension, r.gross) : '')
          + (r.eePension > 0 ? bkRow('Taxable pay', c.gross, r.taxableGross, r.gross) : '')
          + bkRow('Income tax', c.tax, r.incomeTax, r.gross)
          + bkRow('Employee NI', c.ni, r.empNI, r.gross)
          + (r.sl > 0 ? bkRow('Student loan', '#EA580C', r.sl, r.gross) : '')
          + bkRow('Net take-home', c.net, r.netPay, r.gross, false, true)
        + '</div>'
        + '<div class="breakdown" style="margin-top:12px"><div class="bk-header"><div class="bk-title">Employer — true cost</div></div>'
          + bkRow('Gross salary', c.gross, r.gross, r.empCost)
          + bkRow('Employer NI (15%)', c.ni, r.erNI, r.empCost)
          + (r.erPension > 0 ? bkRow('NHS employer pension (14.38%)', c.erPension, r.erPension, r.empCost) : '')
          + bkRow('Total employer cost', c.employer, r.empCost, r.empCost, false, true)
        + '</div>'
      + '</div>'
    + '</div>'
    + '<div class="chart-section" style="margin-top:14px"><div class="chart-title"><span>All-frequency summary</span></div>'
      + '<div class="freq-table">'
        + '<div class="ft-head"><span>Frequency</span><span>Gross</span><span>Income tax</span><span>Employee NI</span><span>Net pay</span><span>Employer cost</span></div>'
        + freqRow('Annual', 1) + freqRow('Monthly', 12) + freqRow('Weekly', 52) + freqRow('Daily', 260)
      + '</div>'
    + '</div>'
    + (r.mode === 'net' ? notesCard('Net-to-Gross solve', 'To achieve a take-home of <strong>' + fmt(r.netPay) + '</strong>, the gross salary required is <strong>' + fmt(r.gross) + '</strong>. Solved to within ±5p.') : '')
    + notesCard('NHS pension — how it works', 'The NHS pension is an <strong>occupational scheme (pre-tax)</strong> — contributions are deducted from gross before income tax is calculated, saving the employee tax on the full amount. NI, however, is calculated on the <strong>full gross</strong> (not reduced by pension). Employer payroll contribution is <strong>14.38%</strong> — the remaining 9.4% of the 23.7% total is paid centrally by NHSBSA.')
    + (r.paUsed < window.TAX.PA ? notesCard('Personal allowance tapered', 'Gross exceeds £100,000 — PA tapered to <strong>£' + fmtInt(r.paUsed) + '</strong>. 60% effective marginal rate in the taper band.') : '')
    + actionsRow();
  },
  related: ['nhs-payslip', 'nhs-payroll', 'payslip', 'true-cost']
};

/* ─────────────────────────────────────────────────────────
   NHS PAYSLIP GENERATOR
   Monthly NHS payslip. Tier-based employee pension,
   14.38% employer pension, full tax code & NI support.
   ───────────────────────────────────────────────────────── */
CALCS['nhs-payslip'] = {
  id: 'nhs-payslip',
  title: 'NHS Payslip Generator & Verifier',
  subtitle: 'Generate or verify a monthly NHS payslip. Enter the tax code, NI category, annual pensionable pay and YTD figures — the correct NHS pension tier is applied automatically.',
  metaBadges: ['NHS pension tiers', 'Monthly payslip', 'W1/M1 supported'],

  inputs: [
    { id:'pdNum',    type:'number',  label:'Month number (1 = April)',   default:1, min:1, max:12, hint:'Month 1 = April, Month 6 = September' },
    { type:'section',                label:'Employee & tax details' },
    { id:'taxCode',  type:'select',  label:'Tax code',                   default:'1257L', options:[
      {v:'1257L',    l:'1257L — standard'},
      {v:'1257L/W1', l:'1257L W1/M1 — non-cumulative'},
      {v:'BR',       l:'BR — basic rate only'},
      {v:'D0',       l:'D0 — higher rate (40%)'},
      {v:'D1',       l:'D1 — additional rate (45%)'},
      {v:'NT',       l:'NT — no tax'},
      {v:'0T',       l:'0T — no personal allowance'},
      {v:'K100',     l:'K100 — K code example'},
    ]},
    { id:'niCat',    type:'select',  label:'NI category',                default:'A', options:[
      {v:'A', l:'A — Standard (8% / 15%)'},
      {v:'B', l:'B — Married women reduced (3.85% / 15%)'},
      {v:'C', l:'C — Over State Pension Age (0% / 15%)'},
      {v:'H', l:'H/M — Under 21 (8% / 0% to UEL)'},
      {v:'X', l:'X — Exempt'},
    ]},
    { id:'regime',   type:'toggle',  label:'Tax regime',                 default:'england', options:[{v:'england',l:'England & Wales'},{v:'scotland',l:'Scotland'}] },
    { type:'section',                label:'Pay this month' },
    { id:'grossPd',  type:'currency',label:'Gross pay this month',       default:3750 },
    { type:'section',                label:'NHS pension' },
    { id:'nhs_opt',  type:'toggle',  label:'NHS pension member?',        default:'yes', options:[{v:'yes',l:'Yes'},{v:'no',l:'No'}] },
    { id:'nhsAnnual',type:'currency',label:'Annual pensionable pay',     default:45000, hint:'Used to determine your contribution tier' },
    { type:'section',                label:'Year to date (before this month)' },
    { id:'ytdGross', type:'currency',label:'YTD gross pay',              default:0 },
    { id:'ytdTax',   type:'currency',label:'YTD income tax paid',        default:0 },
    { id:'ytdEeNI',  type:'currency',label:'YTD employee NI paid',       default:0 },
    { type:'section',                label:'Student loan' },
    { id:'plan',     type:'select',  label:'Student loan plan',          default:'0', options:[{v:'0',l:'None'},{v:'1',l:'Plan 1'},{v:'2',l:'Plan 2'},{v:'4',l:'Plan 4'},{v:'5',l:'Plan 5'},{v:'PG',l:'Postgrad'}] },
  ],

  calculate: function(s) {
    var T = window.TAX;
    var pdpy = 12;
    var pdNum = Math.max(1, s.pdNum || 1);
    var tc = parseTaxCode(s.taxCode);
    var grossPd = s.grossPd || 0;
    var optedIn = s.nhs_opt === 'yes';

    // NHS pension: pre-tax occupational
    var nhsAnnual = s.nhsAnnual || (grossPd * 12);
    var tier = nhsPensionTier(nhsAnnual);
    var eePensionPd = optedIn ? grossPd * tier.rate : 0;
    var erPensionPd = optedIn ? grossPd * 0.1438 : 0;

    // Taxable gross = gross minus NHS pension contribution
    var taxableGross = Math.max(0, grossPd - eePensionPd);

    // PAYE — on taxable gross
    var taxPd = periodPAYE(taxableGross, s.ytdGross || 0, s.ytdTax || 0, pdNum, pdpy, tc);

    // NI — on full gross (NHS pension does not reduce NI base)
    var eeNIPd = periodEeNI(grossPd, pdpy, s.niCat || 'A');
    var erNIPd = periodErNI(grossPd, pdpy, s.niCat || 'A');

    // Student loan — on full gross
    var slPd = periodSL(grossPd, s.plan, pdpy);

    // Net pay
    var netPd = grossPd - eePensionPd - taxPd - eeNIPd - slPd;

    // YTD updated
    var ytdGrossNew = (s.ytdGross || 0) + grossPd;
    var ytdTaxNew   = (s.ytdTax   || 0) + taxPd;
    var ytdEeNINew  = (s.ytdEeNI  || 0) + eeNIPd;

    return {
      grossPd, taxableGross,
      eePensionPd, erPensionPd,
      taxPd, eeNIPd, erNIPd, slPd, netPd,
      ytdGrossNew, ytdTaxNew, ytdEeNINew,
      pdNum, tc, tier, nhsAnnual, optedIn,
      niCat: s.niCat || 'A',
      taxCode: s.taxCode || '1257L',
      regime: s.regime, plan: s.plan
    };
  },

  render: function(r) {
    var totalDeductions = r.taxPd + r.eeNIPd + r.eePensionPd + r.slPd;
    var tcDesc = { NT:'No tax deducted', BR:'Basic rate 20% on all pay', D0:'Higher rate 40% on all pay', D1:'Additional rate 45% on all pay', K:'K code — negative allowance', L:'Personal allowance £' + fmtInt(r.tc.pa) + '/yr (£' + fmt(r.tc.pa / 12, 0) + '/month)' }[r.tc.type] || '';
    tcDesc += ' · <strong>' + (r.tc.basis === 'week1' ? 'W1/M1 non-cumulative' : 'Cumulative') + '</strong>';

    var ps = '<div class="payslip-card">'
      + '<div class="ps-header">'
        + '<div>'
          + '<div class="ps-header-title">NHS PAYSLIP</div>'
          + '<div class="ps-header-meta">Monthly · Month ' + r.pdNum + ' of 12 · Tax year 2026/27</div>'
        + '</div>'
        + '<div class="ps-header-right">'
          + '<div class="ps-header-badge">Tax code: ' + r.taxCode + '</div>'
          + '<div class="ps-header-badge">NI: Cat ' + r.niCat + (r.regime === 'scotland' ? ' · Scottish' : '') + '</div>'
        + '</div>'
      + '</div>'
      + '<div class="ps-body">'
        + '<div class="ps-col">'
          + '<div class="ps-section-label">Earnings</div>'
          + '<div class="ps-line"><span>Basic monthly pay</span><span>' + fmt(r.grossPd) + '</span></div>'
          + '<div class="ps-col-total"><span>Total earnings</span><span>' + fmt(r.grossPd) + '</span></div>'
        + '</div>'
        + '<div class="ps-col">'
          + '<div class="ps-section-label">Deductions</div>'
          + (r.eePensionPd > 0 ? '<div class="ps-line"><span>NHS pension (' + (r.tier.rate * 100).toFixed(1) + '% tier)</span><span>' + fmt(r.eePensionPd) + '</span></div>' : '')
          + '<div class="ps-line"><span>Income tax (' + r.taxCode + ')</span><span>' + fmt(r.taxPd) + '</span></div>'
          + '<div class="ps-line"><span>Employee NI (Cat ' + r.niCat + ')</span><span>' + fmt(r.eeNIPd) + '</span></div>'
          + (r.slPd > 0 ? '<div class="ps-line"><span>Student loan (' + (r.plan || '') + ')</span><span>' + fmt(r.slPd) + '</span></div>' : '')
          + '<div class="ps-col-total"><span>Total deductions</span><span>' + fmt(totalDeductions) + '</span></div>'
        + '</div>'
      + '</div>'
      + '<div class="ps-net"><span class="ps-net-label">NET PAY</span><span class="ps-net-amount">' + fmt(r.netPd) + '</span></div>'
      + '<div class="ps-ytd">'
        + '<div class="ps-ytd-item"><div class="ps-ytd-val">' + fmt(r.ytdGrossNew, 0) + '</div><div class="ps-ytd-lbl">YTD Gross</div></div>'
        + '<div class="ps-ytd-item"><div class="ps-ytd-val">' + fmt(r.ytdTaxNew, 0) + '</div><div class="ps-ytd-lbl">YTD Tax</div></div>'
        + '<div class="ps-ytd-item"><div class="ps-ytd-val">' + fmt(r.ytdEeNINew, 0) + '</div><div class="ps-ytd-lbl">YTD Ee NI</div></div>'
        + '<div class="ps-ytd-item"><div class="ps-ytd-val">' + fmt(r.erNIPd, 0) + '</div><div class="ps-ytd-lbl">Er NI (month)</div></div>'
      + '</div>'
      + '<div class="ps-employer-row">'
        + 'Employer cost this month: gross <strong>' + fmt(r.grossPd) + '</strong>'
        + ' + employer NI <strong>' + fmt(r.erNIPd) + '</strong>'
        + (r.erPensionPd > 0 ? ' + NHS employer pension (14.38%) <strong>' + fmt(r.erPensionPd) + '</strong>' : '')
        + ' = <strong>' + fmt(r.grossPd + r.erNIPd + r.erPensionPd) + '</strong>'
      + '</div>'
    + '</div>';

    return ps
      + kpiRow([
        kpi('Monthly net pay',    fmt(r.netPd),       { color:'primary', sub:'After all deductions' }),
        kpi('NHS pension tier',   (r.tier.rate * 100).toFixed(1) + '%', { color:'navy', sub:'Annual pensionable pay ' + fmt(r.nhsAnnual, 0) }),
        kpi('Income tax',         fmt(r.taxPd),       { color:'red',     sub:'PAYE this month' }),
      ])
      + kpiRow([
        kpi('Employee NI',        fmt(r.eeNIPd),      { color:'gold',    sub:'Category ' + r.niCat + ' — on full gross' }),
        kpi('Employer NI',        fmt(r.erNIPd),      { color:'navy',    sub:'15% above £' + fmtInt(window.TAX.NI_ST / 12) + '/month' }),
        kpi('Employer pension',   fmt(r.erPensionPd), { color:'green',   sub:'14.38% NHS employer contribution' }),
      ])
      + notesCard('Tax code — ' + r.taxCode, tcDesc)
      + notesCard('NHS pension — key rules', 'Tier rate <strong>' + (r.tier.rate * 100).toFixed(1) + '%</strong> based on annual pensionable pay <strong>' + fmt(r.nhsAnnual, 0) + '</strong>. NHS pension is an <strong>occupational pre-tax deduction</strong> — it reduces taxable income but <strong>not the NI base</strong> (NI is charged on full gross). Employer payroll contribution is 14.38%; NHSBSA pays the remaining 9.4% centrally.')
      + notesCard('How YTD fields work', 'Enter gross, tax and NI paid in all <em>earlier</em> months this tax year — leave at zero for month 1 (April). Cumulative tax codes use these to ensure the correct PAYE is deducted each month. W1/M1 codes treat each month independently.')
      + actionsRow('<button class="btn btn-ghost btn-sm" onclick="printSummary()">⬇ Download payslip PDF</button>');
  },
  related: ['nhs-true-cost', 'nhs-payroll', 'true-cost', 'payslip']
};
