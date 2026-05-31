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
