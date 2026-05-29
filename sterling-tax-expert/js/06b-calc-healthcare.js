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

    // NHS pension tier uses base NHS salary only (WTE-adjusted in advanced mode;
    // default WTE = 1.0 so pensionable pay = gross for full-time staff)
    const pensionablePay = gross;
    const tier = nhsPensionTier(pensionablePay);
    const employeePension = optedIn ? pensionablePay * tier.rate : 0;
    const employerPension = optedIn ? pensionablePay * T.NHS_ER_CONTRIB : 0;

    // Taxable pay: pension is via NHS scheme (occupational, pre-tax under s.188 FA 2004)
    const taxablePay = totalGross - employeePension;

    // Income tax
    const taxCalc = s.nhs_regime === 'scotland'
      ? scottishIncomeTaxOn(taxablePay)
      : incomeTaxOn(taxablePay);
    const incomeTax = taxCalc.tax;

    // NI is on total gross (pension does not reduce NI base for NHS scheme)
    const ni = employeeNI(totalGross);

    // Student loan
    const sl = studentLoan(totalGross, s.nhs_plan);

    const netAnnual = totalGross - incomeTax - ni - employeePension - sl;
    const netMonthly = netAnnual / 12;
    const effRate = totalGross > 0 ? ((incomeTax + ni + sl) / totalGross * 100) : 0;
    const totalDeductions = incomeTax + ni + sl + employeePension;

    // Annual Allowance (simplified proxy — 1/54 × pensionable pay × AA_DB_FACTOR)
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

    // Pension accrual illustration (flat CPI assumption — illustrative only)
    const annualAccrual = optedIn ? pensionablePay / T.NHS_ACCRUAL_DENOM : 0;
    const cpi = T.NHS_CPI_ASSUMPTION + T.NHS_CPI_ABOVE; // total revaluation rate for illustration
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

    // ── Tab 1: Take-Home Pay ──────────────────────────────
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
      ${r.regime === 'scotland' ? `<p style="font-size:11px;color:var(--t3);margin-top:8px">Scottish income tax rates applied (starter 19%, basic 20%, intermediate 21%, higher 42%, top 48%).</p>` : ''}
      ${actionsRow()}
    `;

    // ── Tab 2: NHS Pension ────────────────────────────────
    const tierLabels = [
      'Up to £13,259',
      '£13,260 – £28,854',
      '£28,855 – £35,155',
      '£35,156 – £52,778',
      '£52,779 – £67,668',
      '£67,669+',
    ];
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
        kpi('Your contribution rate', (r.tier.rate * 100).toFixed(1) + '%', { color: 'primary', sub: 'Employee rate (2024/25 confirmed)' }),
        kpi('Your annual contribution', fmt(r.employeePension), { color: 'navy', sub: fmt(r.employeePension / 12) + ' / month' }),
        kpi('Employer contribution', fmt(r.employerPension), { color: 'green', sub: '23.7% — paid by NHS, not deducted from your pay' }),
      ])}
      <div class="breakdown" style="margin-bottom:16px">
        <div class="bk-header"><div class="bk-title">2015 CARE Scheme — contribution tiers</div></div>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="background:var(--bg2,#F8FAFC)">
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
          <div style="margin-bottom:8px"><strong>This year's accrual:</strong> ${fmt(r.annualAccrual)} / year added to your pension pot</div>
          <div style="margin-bottom:4px;font-size:11px;color:var(--t3)">Based on 1/54th of pensionable pay. Revalued annually at CPI + 1.5%.</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px">
            <div style="text-align:center;padding:10px;background:var(--bg2,#F8FAFC);border-radius:8px">
              <div style="font-size:18px;font-weight:700;color:var(--blue1)">${fmt(r.proj10)}</div>
              <div style="font-size:11px;color:var(--t3);margin-top:2px">After 10 years</div>
            </div>
            <div style="text-align:center;padding:10px;background:var(--bg2,#F8FAFC);border-radius:8px">
              <div style="font-size:18px;font-weight:700;color:var(--blue1)">${fmt(r.proj20)}</div>
              <div style="font-size:11px;color:var(--t3);margin-top:2px">After 20 years</div>
            </div>
            <div style="text-align:center;padding:10px;background:var(--bg2,#F8FAFC);border-radius:8px">
              <div style="font-size:18px;font-weight:700;color:var(--blue1)">${fmt(r.proj30)}</div>
              <div style="font-size:11px;color:var(--t3);margin-top:2px">After 30 years</div>
            </div>
          </div>
          <p style="font-size:11px;color:var(--t3);margin-top:10px;line-height:1.5">Illustration only — assumes CPI of 2.5% + 1.5% revaluation = 4% compound. Actual pension depends on future salary, revaluation rates and scheme rules. Figures show cumulative accrued pension at current salary, not a single-year contribution.</p>
        </div>
      </div>
      ${notesCard('NHS 2015 CARE Scheme', `
        <strong>CARE</strong> (Career Average Revalued Earnings): you build 1/54th of your pensionable pay each year.
        That slice is then revalued each April at CPI + 1.5% until you draw your pension.<br><br>
        <strong>Employer contribution (23.7%)</strong> is paid by your NHS employer directly to NHS Pensions — it does not appear on your payslip and does not reduce your take-home pay. Rate shown is 2024/25 confirmed; 2026/27 revaluation pending SI.<br><br>
        <strong>Tier thresholds</strong> are based on your full-time equivalent (WTE 1.0) pensionable pay. Part-time staff: open Advanced Options above to adjust your WTE.
      `)}
      ${actionsRow()}
    ` : `
      <div style="padding:24px;text-align:center;color:var(--t2)">
        <div style="font-size:32px;margin-bottom:12px">💭</div>
        <div style="font-size:15px;font-weight:600;margin-bottom:8px">You are not currently contributing to the NHS Pension Scheme</div>
        <p style="font-size:13px;color:var(--t3);max-width:400px;margin:0 auto 16px">Your NHS employer contributes 23.7% of your salary to the scheme on behalf of all members. By opting out, you forgo significant long-term pension accrual.</p>
        <p style="font-size:13px;color:var(--t3);max-width:400px;margin:0 auto">Select <strong>Yes</strong> under <em>NHS pension member?</em> to model your pension contributions and accrual.</p>
      </div>
      ${actionsRow()}
    `;

    // ── Tab 3: Annual Allowance Risk ──────────────────────
    const aaColors = { green: '#16A34A', amber: '#D97706', red: '#DC2626' };
    const aaLabels = {
      green: 'Low Risk — No action needed',
      amber: 'Review Recommended',
      red:   'Professional Advice Recommended',
    };
    const aaIcons = { green: '✓', amber: '⚠', red: '✗' };
    const aaDescriptions = {
      green: `Your estimated pension input (${fmt(r.pensionInputProxy)}) is comfortably within your annual allowance of ${fmt(r.taperAA)}. You are unlikely to face an annual allowance charge based on your current salary.`,
      amber: `Your estimated pension input (${fmt(r.pensionInputProxy)}) is approaching your annual allowance of ${fmt(r.taperAA)}. We recommend requesting a Pension Savings Statement from NHS Pensions and speaking with a tax adviser.`,
      red:   `Your estimated pension input (${fmt(r.pensionInputProxy)}) may exceed your annual allowance of ${fmt(r.taperAA)}. An annual allowance tax charge may apply. Consider the Scheme Pays facility and seek professional advice before 31 July.`,
    };

    const tab3 = r.optedIn ? `
      <div style="border:2px solid ${aaColors[r.aaStatus]};border-radius:12px;padding:20px 24px;margin-bottom:16px;background:${r.aaStatus === 'green' ? '#F0FDF4' : r.aaStatus === 'amber' ? '#FFFBEB' : '#FEF2F2'}">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
          <div style="font-size:24px;color:${aaColors[r.aaStatus]}">${aaIcons[r.aaStatus]}</div>
          <div style="font-size:16px;font-weight:700;color:${aaColors[r.aaStatus]}">${aaLabels[r.aaStatus]}</div>
        </div>
        <p style="font-size:13px;color:var(--t2);margin:0">${aaDescriptions[r.aaStatus]}</p>
      </div>
      <div class="breakdown" style="margin-bottom:16px">
        <div class="bk-header"><div class="bk-title">Annual Allowance summary</div></div>
        <div style="padding:12px 14px;font-size:13px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px">
            <div style="color:var(--t3)">Estimated pension input (proxy)</div>
            <div style="text-align:right;font-weight:600">${fmt(r.pensionInputProxy)}</div>
            <div style="color:var(--t3)">Standard annual allowance</div>
            <div style="text-align:right;font-weight:600">${fmt(T.AA_STANDARD)}</div>
            ${r.taperAA < T.AA_STANDARD ? `
            <div style="color:var(--t3)">Your tapered allowance</div>
            <div style="text-align:right;font-weight:600;color:#D97706">${fmt(r.taperAA)}</div>` : ''}
            <div style="color:var(--t3)">Estimated headroom</div>
            <div style="text-align:right;font-weight:600;color:${r.aaStatus === 'green' ? '#16A34A' : '#DC2626'}">${fmt(Math.max(0, r.taperAA - r.pensionInputProxy))}</div>
          </div>
        </div>
      </div>
      ${notesCard('About this estimate', `
        <strong>How pension input is estimated:</strong> This calculator uses a 1/54 × pensionable pay × 16 proxy. HMRC uses the actual opening and closing pension values from your NHS Pension record — this estimate may differ from your real figure.<br><br>
        <strong>Taper applies</strong> when your threshold income exceeds £200,000 AND your adjusted income (including employer pension contributions) exceeds £260,000. Your allowance reduces by £1 for every £2 above the adjusted income threshold, down to a minimum of £10,000.<br><br>
        <strong>Carry forward:</strong> Unused allowance from the previous 3 tax years may be added to this year's allowance. Open <em>Advanced pension options</em> to model this.<br><br>
        <strong>Scheme Pays:</strong> If you have an AA charge, the NHS can pay it on your behalf in exchange for a reduced pension. You must elect Scheme Pays by 31 July following the relevant tax year.<br><br>
        This is an estimate only. Obtain your <strong>Pension Savings Statement</strong> from NHS Pensions if your salary exceeds £120,000.
      `)}
      ${actionsRow(`<button class="btn btn-ghost btn-sm" onclick="navigate('contact')">Book a free AA review →</button>`)}
    ` : `
      <div style="padding:24px;text-align:center;color:var(--t2)">
        <div style="font-size:13px;color:var(--t3);max-width:400px;margin:0 auto">Annual allowance risk only applies to NHS pension members. Select <strong>Yes</strong> under <em>NHS pension member?</em> to see your AA position.</div>
      </div>
    `;

    // Assumptions note (always shown at bottom of all tabs via wrapper)
    const assumptionsNote = `<div style="font-size:11px;color:var(--t3);border-top:1px solid var(--border);padding-top:10px;margin-top:4px;line-height:1.6">
      <strong>2026/27 assumptions:</strong> NHS pension tiers and employer rate (23.7%) are 2024/25 confirmed figures — no 2026/27 revaluation SI yet published. Income tax thresholds confirmed for 2026/27. All calculations are estimates only.
    </div>`;

    return nhsTabHTML(tab1, tab2, tab3) + assumptionsNote;
  },
  related: ['paye', 'salary-sacrifice', 'self-assess', 'sal-vs-div'],
};
