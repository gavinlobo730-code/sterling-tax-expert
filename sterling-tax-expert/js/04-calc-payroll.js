/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Calculators (Payroll + Statutory)
   All calculations use the 2026/27 UK tax-year constants in TAX.
   ─────────────────────────────────────────────────────────── */

// ── Shared tax functions ───────────────────────────────────
function incomeTaxOn(gross){
  // English/Welsh/NI rates. Personal allowance taper above £100k.
  const T = window.TAX;
  let pa = T.PA;
  if (gross > T.PA_TAPER_START) {
    pa = Math.max(0, T.PA - Math.floor((gross - T.PA_TAPER_START) / 2));
  }
  let tax = 0;
  if (gross > T.HR_LIMIT) {
    tax = (gross - T.HR_LIMIT) * T.AR + (T.HR_LIMIT - T.BR_LIMIT) * T.HR + Math.max(0, T.BR_LIMIT - pa) * T.BR;
  } else if (gross > T.BR_LIMIT) {
    tax = (gross - T.BR_LIMIT) * T.HR + Math.max(0, T.BR_LIMIT - pa) * T.BR;
  } else if (gross > pa) {
    tax = (gross - pa) * T.BR;
  }
  return { tax: Math.max(0, tax), paUsed: pa };
}

function employeeNI(gross){
  const T = window.TAX;
  let ni = 0;
  if (gross > T.NI_PT) {
    ni += (Math.min(gross, T.NI_UEL) - T.NI_PT) * T.NI_MAIN;
    if (gross > T.NI_UEL) ni += (gross - T.NI_UEL) * T.NI_ADDL;
  }
  return ni;
}

function employerNI(gross, claimAllowance = false, payBillNI = null){
  const T = window.TAX;
  let ni = Math.max(0, gross - T.NI_ST) * T.NI_ER;
  if (claimAllowance && payBillNI === null) {
    ni = Math.max(0, ni - T.EMPLOYMENT_ALLOWANCE);
  }
  return ni;
}

function studentLoan(gross, plan){
  if (!plan || plan === '0') return 0;
  const cfg = window.TAX.SL[plan];
  if (!cfg) return 0;
  return Math.max(0, gross - cfg.thr) * cfg.rate;
}

// ─────────────────────────────────────────────────────────
// PAYE TAX & NI CALCULATOR
// ─────────────────────────────────────────────────────────
CALCS['paye'] = {
  id: 'paye',
  title: 'PAYE Tax & NI Calculator',
  subtitle: 'Work out income tax, employee NI, net take-home pay and the employer\'s total cost — for any UK salary at 2026/27 rates.',
  inputs: [
    { id:'salary',    type:'currency', label:'Annual salary (gross)',    default:45000, hint:'Before tax & NI' },
    { id:'freq',      type:'toggle',   label:'Salary frequency',          default:'annual', options:[{v:'annual',l:'Annual'},{v:'monthly',l:'Monthly'}] },
    { type:'section', label:'Deductions' },
    { id:'pension',   type:'number',   label:'Pension contribution',      default:5, suffix:'% of gross', step:0.5, min:0, max:100, hint:'Salary sacrifice (reduces taxable pay)' },
    { id:'plan',      type:'select',   label:'Student loan plan',         default:'0', options:[
      {v:'0',l:'No student loan'},{v:'1',l:'Plan 1'},{v:'2',l:'Plan 2'},
      {v:'4',l:'Plan 4 (Scottish)'},{v:'5',l:'Plan 5 (post-Aug 2023)'},{v:'PG',l:'Postgraduate loan'}
    ]},
    { id:'allowance', type:'checkbox', label:'Employer claims Employment Allowance (£10,500)', default:true },
  ],
  calculate(s){
    const annual = s.freq === 'monthly' ? s.salary * 12 : s.salary;
    const pensionAmt = annual * (s.pension / 100);
    const taxablePay = annual - pensionAmt;
    const { tax: incomeTax, paUsed } = incomeTaxOn(taxablePay);
    const empNI = employeeNI(taxablePay);
    // Employer NI is on the sacrificed (reduced) gross — pension is salary sacrifice.
    const erNI = employerNI(taxablePay, s.allowance);
    const sl = studentLoan(annual, s.plan);
    const netPay = annual - pensionAmt - incomeTax - empNI - sl;
    const totalDeductions = incomeTax + empNI + sl;
    const employerCost = annual + erNI;
    const effRate = annual > 0 ? ((incomeTax + empNI + sl) / annual * 100) : 0;
    return { annual, pensionAmt, taxablePay, incomeTax, empNI, erNI, sl, netPay, totalDeductions, employerCost, effRate, paUsed };
  },
  render(r){
    const colors = { net:'#16A34A', tax:'#C0392B', ni:'#C49A2E', pension:'#7C3AED', sl:'#EA580C' };
    const donutData = [
      { name:'Net pay',      val:r.netPay,     color:colors.net },
      { name:'Income tax',   val:r.incomeTax,  color:colors.tax },
      { name:'Employee NI',  val:r.empNI,      color:colors.ni },
      ...(r.pensionAmt > 0 ? [{ name:'Pension', val:r.pensionAmt, color:colors.pension }] : []),
      ...(r.sl > 0 ? [{ name:'Student loan', val:r.sl, color:colors.sl }] : []),
    ];
    return `
      ${kpiRow([
        kpi('Net annual pay',     fmt(r.netPay),     { color:'primary', monthly: fmt(r.netPay/12) + ' / month' }),
        kpi('Total deductions',   fmt(r.totalDeductions + r.pensionAmt), { color:'red', monthly: fmt((r.totalDeductions + r.pensionAmt)/12) + ' / month' }),
        kpi('Employer total cost',fmt(r.employerCost),{ color:'navy', monthly: fmt(r.employerCost/12) + ' / month' }),
      ])}
      ${kpiRow([
        kpi('Income tax',  fmt(r.incomeTax), { color:'gold',  monthly: fmt(r.incomeTax/12) + ' / month' }),
        kpi('Employee NI', fmt(r.empNI),     { color:'green', monthly: fmt(r.empNI/12) + ' / month' }),
        kpi('Effective rate', r.effRate.toFixed(1) + '%', { color:'navy', sub:'Combined income tax + NI + SL' }),
      ])}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px" class="paye-charts">
        <div class="chart-section">
          <div class="chart-title"><span>Salary breakdown</span><span style="font-size:11px;color:var(--t3)">Annual</span></div>
          <div class="donut-wrap">
            ${donutSVG(donutData, r.annual)}
            <div class="donut-legend">${donutData.map(d => `
              <div class="dl-item">
                <div class="dl-dot" style="background:${d.color}"></div>
                <span class="dl-name">${d.name}</span>
                <span class="dl-val">${fmt(d.val)}</span>
                <span class="dl-pct">${r.annual>0?(d.val/r.annual*100).toFixed(1)+'%':''}</span>
              </div>`).join('')}
            </div>
          </div>
        </div>
        <div class="breakdown">
          <div class="bk-header"><div class="bk-title">Full breakdown</div></div>
          ${bkRow('Gross salary', '#6B748F', r.annual, r.annual, true)}
          ${r.pensionAmt > 0 ? bkRow('Pension (salary sacrifice)', colors.pension, r.pensionAmt, r.annual) : ''}
          ${bkRow('Income tax', colors.tax, r.incomeTax, r.annual)}
          ${bkRow('Employee NI', colors.ni, r.empNI, r.annual)}
          ${r.sl > 0 ? bkRow('Student loan', colors.sl, r.sl, r.annual) : ''}
          ${bkRow('Total deductions', '#C0392B', r.totalDeductions + r.pensionAmt, r.annual, true)}
          ${bkRow('Net take-home pay', '#1A55CC', r.netPay, r.annual, false, true)}
        </div>
      </div>
      <div class="chart-section">
        <div class="chart-title"><span>Monthly summary</span></div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:9px" class="paye-monthly">
          <div style="text-align:center;background:var(--g50);border:1px solid var(--br);border-radius:9px;padding:14px"><div style="font-family:var(--sans);font-size:18px;font-weight:800;color:var(--navy)">${fmt(r.annual/12,0)}</div><div style="font-size:10px;color:var(--t3);margin-top:3px">Gross / month</div></div>
          <div style="text-align:center;background:var(--g50);border:1px solid var(--br);border-radius:9px;padding:14px"><div style="font-family:var(--sans);font-size:18px;font-weight:800;color:var(--red)">${fmt(r.incomeTax/12,0)}</div><div style="font-size:10px;color:var(--t3);margin-top:3px">Tax / month</div></div>
          <div style="text-align:center;background:var(--g50);border:1px solid var(--br);border-radius:9px;padding:14px"><div style="font-family:var(--sans);font-size:18px;font-weight:800;color:var(--amber)">${fmt(r.empNI/12,0)}</div><div style="font-size:10px;color:var(--t3);margin-top:3px">NI / month</div></div>
          <div style="text-align:center;background:var(--bluel);border:1px solid var(--bluel2);border-radius:9px;padding:14px"><div style="font-family:var(--sans);font-size:18px;font-weight:800;color:var(--blue2)">${fmt(r.netPay/12,0)}</div><div style="font-size:10px;color:var(--blue2);margin-top:3px;font-weight:600">Net / month</div></div>
        </div>
      </div>
      ${r.paUsed < window.TAX.PA ? notesCard('Personal allowance tapered', `Your gross income exceeds £100,000, so your personal allowance has tapered from £${fmtInt(window.TAX.PA)} to <strong>£${fmtInt(r.paUsed)}</strong> (£1 lost for every £2 above £100,000). This produces an effective marginal rate of 60% in the taper band.`) : ''}
      ${r.pensionAmt > 0 ? notesCard('Salary sacrifice & employer NI', `Employer NI is calculated on the <strong>post-sacrifice gross</strong> (${fmt(r.taxablePay)}). If your company has other employees, the £${fmtInt(window.TAX.EMPLOYMENT_ALLOWANCE)} Employment Allowance is a <strong>company-wide</strong> offset against the total employer NI bill — not a per-employee reduction. This calculator applies it to this one employee\'s NI, which is correct for single-employee companies only.`) : notesCard('Employment Allowance', `The £${fmtInt(window.TAX.EMPLOYMENT_ALLOWANCE)} Employment Allowance offsets your <strong>total</strong> employer NI liability across all employees — not each individual\'s NI separately. For multi-employee companies, use the Employer NI calculator which models the allowance against the whole pay-bill.`)}
      ${actionsRow()}
    `;
  },
  related: ['employer-ni','net-to-gross','salary-sacrifice','dividend','sal-vs-div']
};

// ─────────────────────────────────────────────────────────
// EMPLOYER NI CALCULATOR
// ─────────────────────────────────────────────────────────
CALCS['employer-ni'] = {
  id: 'employer-ni',
  title: 'Employer NI Calculator',
  subtitle: 'Calculate Class 1 secondary contributions at 15% above £5,000 — including the £10,500 Employment Allowance where eligible.',
  inputs: [
    { id:'salary',    type:'currency', label:'Annual salary (gross)', default:35000 },
    { id:'employees',type:'number',   label:'Number of employees on this salary', default:1, min:1, max:9999 },
    { id:'allowance', type:'checkbox', label:'Eligible for Employment Allowance (£10,500/yr)', default:true },
    { type:'section', label:'About Employment Allowance' },
  ],
  calculate(s){
    const T = window.TAX;
    const perEmp = Math.max(0, s.salary - T.NI_ST) * T.NI_ER;
    const gross = perEmp * s.employees;
    const ea = s.allowance ? Math.min(T.EMPLOYMENT_ALLOWANCE, gross) : 0;
    const net = gross - ea;
    const oldRate = Math.max(0, s.salary - 9100) * 0.138 * s.employees; // pre-Apr 25 for comparison
    return { perEmp, gross, ea, net, oldRate, employees:s.employees, salary:s.salary };
  },
  render(r){
    return `
      ${kpiRow([
        kpi('NI per employee',  fmt(r.perEmp), { color:'gold', sub:`@ 15% above £${fmtInt(window.TAX.NI_ST)}` }),
        kpi('Total annual NI',  fmt(r.gross),  { color:'red',  sub:`${r.employees} employee${r.employees>1?'s':''}` }),
        kpi('Net of allowance', fmt(r.net),    { color:'primary', monthly: `Allowance saved: ${fmt(r.ea)}` }),
      ])}
      <div class="chart-section">
        <div class="chart-title"><span>Comparison with 2024/25 rules</span></div>
        ${barChart([
          { l:'2024/25 (13.8% / £9,100)', v: r.oldRate, c:'var(--g400)' },
          { l:'2025/26+ (15% / £5,000)',  v: r.gross,   c:'var(--red)' },
          { l:'Net after EA',              v: r.net,     c:'var(--blue2)' },
        ])}
      </div>
      ${notesCard('How Employment Allowance works', `Eligible employers can reduce their <strong>total annual employer NI bill</strong> by up to <strong>£${fmtInt(window.TAX.EMPLOYMENT_ALLOWANCE)}</strong>. This is a single company-wide allowance — not per employee. You must re-elect each tax year via your EPS. Single-director companies with no other employees are <strong>not eligible</strong>; connected companies share one allowance between them.`)}
      ${actionsRow()}
    `;
  },
  related: ['paye','payroll-cost','sal-vs-div']
};

// ─────────────────────────────────────────────────────────
// NET-TO-GROSS SALARY CALCULATOR
// ─────────────────────────────────────────────────────────
CALCS['net-to-gross'] = {
  id: 'net-to-gross',
  title: 'Net-to-Gross Salary Calculator',
  subtitle: 'Work backwards from take-home pay to the gross salary you need to offer. Useful for offer-letters and counter-offers.',
  inputs: [
    { id:'net',       type:'currency', label:'Desired net pay (annual)', default:35000 },
    { id:'pension',   type:'number',   label:'Pension contribution',     default:0, suffix:'% of gross', step:0.5, min:0, max:100 },
    { id:'plan',      type:'select',   label:'Student loan plan',        default:'0', options:[
      {v:'0',l:'None'},{v:'1',l:'Plan 1'},{v:'2',l:'Plan 2'},{v:'4',l:'Plan 4'},{v:'5',l:'Plan 5'},{v:'PG',l:'Postgrad'}
    ]},
  ],
  calculate(s){
    // Bisection — net is monotonic in gross.
    let lo = s.net, hi = s.net * 2.5 + 50000;
    let gross = s.net;
    for (let i = 0; i < 60; i++) {
      gross = (lo + hi) / 2;
      const pensionAmt = gross * (s.pension / 100);
      const taxable = gross - pensionAmt;
      const { tax } = incomeTaxOn(taxable);
      const ni = employeeNI(taxable);
      const sl = studentLoan(gross, s.plan);
      const net = gross - pensionAmt - tax - ni - sl;
      if (Math.abs(net - s.net) < 0.5) break;
      if (net < s.net) lo = gross; else hi = gross;
    }
    const pensionAmt = gross * (s.pension / 100);
    const taxable = gross - pensionAmt;
    const { tax } = incomeTaxOn(taxable);
    const ni = employeeNI(taxable);
    const sl = studentLoan(gross, s.plan);
    const erNI = employerNI(gross, true);
    return { gross, pensionAmt, tax, ni, sl, erNI, net: s.net, employerCost: gross + erNI };
  },
  render(r){
    return `
      ${kpiRow([
        kpi('Required gross salary',  fmt(r.gross),       { color:'primary', monthly: fmt(r.gross/12) + ' / month' }),
        kpi('Net pay (target)',       fmt(r.net),         { color:'green',   monthly: fmt(r.net/12) + ' / month' }),
        kpi('True employer cost',     fmt(r.employerCost),{ color:'navy',    sub:'Salary + employer NI' }),
      ])}
      <div class="breakdown">
        <div class="bk-header"><div class="bk-title">Walk from gross to net</div></div>
        ${bkRow('Gross salary',  '#6B748F', r.gross,        r.gross, true)}
        ${r.pensionAmt > 0 ? bkRow('Pension (sacrifice)', '#7C3AED', r.pensionAmt, r.gross) : ''}
        ${bkRow('Income tax',    '#C0392B', r.tax,          r.gross)}
        ${bkRow('Employee NI',   '#C49A2E', r.ni,           r.gross)}
        ${r.sl > 0 ? bkRow('Student loan', '#EA580C', r.sl, r.gross) : ''}
        ${bkRow('Net take-home', '#1A55CC', r.net,          r.gross, false, true)}
      </div>
      ${notesCard('Why this number?', `To hand an employee <strong>${fmt(r.net)}</strong> net, you need to offer <strong>${fmt(r.gross)}</strong> gross. The marginal "cost-of-a-pay-rise" goes up sharply once an employee crosses £50,270 (40% tax kicks in) and £100,000 (PA taper). Above £125,140 they pay 45% on every extra pound.`)}
      ${notesCard('Accuracy note', `This result is solved by binary search to within <strong>±50p</strong> of the target net — suitable for offer-letter estimates. It assumes a standard 1257L tax code (England/Wales/NI), no benefits in kind, and no cumulative PAYE. For payroll software accuracy, confirm with a full PAYE calculation.`)}
      ${actionsRow()}
    `;
  },
  related: ['paye','payroll-cost','employer-ni']
};

// ─────────────────────────────────────────────────────────
// TRUE PAYROLL COST CALCULATOR
// ─────────────────────────────────────────────────────────
CALCS['payroll-cost'] = {
  id: 'payroll-cost',
  title: 'True Payroll Cost Calculator',
  subtitle: 'The full annual cost of hiring: gross salary + employer NI + pension + apprenticeship levy (where applicable).',
  inputs: [
    { id:'salary',    type:'currency', label:'Gross annual salary',         default:40000 },
    { id:'pension',   type:'number',   label:'Employer pension contribution', default:3, suffix:'%', step:0.5, min:0, max:25 },
    { id:'benefits',  type:'currency', label:'Benefits cost (annual)',      default:0, hint:'Private health, life insurance, etc.' },
    { id:'levy',      type:'checkbox', label:'Apply Apprenticeship Levy (pay-bill > £3m)', default:false },
    { id:'allowance', type:'checkbox', label:'Eligible for Employment Allowance', default:true },
  ],
  calculate(s){
    const T = window.TAX;
    const erNI = employerNI(s.salary, s.allowance);
    const erPension = s.salary * (s.pension / 100);
    const levy = s.levy ? s.salary * T.AL_RATE : 0;
    const total = s.salary + erNI + erPension + s.benefits + levy;
    const overhead = total - s.salary;
    const overheadPct = s.salary > 0 ? (overhead / s.salary * 100) : 0;
    return { salary:s.salary, erNI, erPension, benefits:s.benefits, levy, total, overhead, overheadPct };
  },
  render(r){
    return `
      ${kpiRow([
        kpi('Total annual cost', fmt(r.total),  { color:'primary', monthly: fmt(r.total/12) + ' / month' }),
        kpi('Overhead vs salary',r.overheadPct.toFixed(1) + '%', { color:'red', sub:`${fmt(r.overhead)} on top of salary` }),
        kpi('Cost per working day', fmt(r.total/220), { color:'navy', sub:'Based on 220 working days' }),
      ])}
      <div class="breakdown">
        <div class="bk-header"><div class="bk-title">Cost stack</div></div>
        ${bkRow('Gross salary',                  '#6B748F', r.salary,    r.total)}
        ${bkRow('Employer NI (15% over £5k)',   '#C49A2E', r.erNI,      r.total)}
        ${r.erPension > 0 ? bkRow('Employer pension contribution', '#7C3AED', r.erPension, r.total) : ''}
        ${r.benefits > 0 ? bkRow('Benefits',     '#0EA5E9', r.benefits,  r.total) : ''}
        ${r.levy > 0 ? bkRow('Apprenticeship Levy (0.5%)', '#EA580C', r.levy, r.total) : ''}
        ${bkRow('Total employment cost',        '#0B1D4E', r.total,     r.total, false, true)}
      </div>
      ${notesCard('Rule of thumb', `For UK SMEs at 2026/27 rates, the true cost of a hire is typically <strong>${(100+r.overheadPct).toFixed(0)}%</strong> of the headline salary. Budget around <strong>£${fmtInt(r.total/12)}/month</strong> for this role — that's what hits the P&L.`)}
      ${notesCard('Employment Allowance — company-wide offset', `The £${fmtInt(window.TAX.EMPLOYMENT_ALLOWANCE)} Employment Allowance is applied above against this employee\'s NI. In reality it offsets your <strong>total employer NI bill across all staff</strong>. If you have multiple employees, the allowance may already be consumed by other salaries — the true marginal NI cost for an additional hire could be the full 15% rate with no offset.`)}
      ${actionsRow()}
    `;
  },
  related: ['employer-ni','paye','apprenticeship']
};

// ─────────────────────────────────────────────────────────
// SALARY SACRIFICE CALCULATOR
// ─────────────────────────────────────────────────────────
CALCS['salary-sacrifice'] = {
  id: 'salary-sacrifice',
  title: 'Salary Sacrifice Calculator',
  subtitle: 'Compare contributing to pension from gross salary vs salary-sacrifice. Quantifies the NI saving for both employee and employer.',
  inputs: [
    { id:'salary',     type:'currency', label:'Gross annual salary',     default:50000 },
    { id:'pension',    type:'number',   label:'Pension contribution',    default:8, suffix:'%', step:0.5, min:0, max:60 },
  ],
  calculate(s){
    const pensionAmt = s.salary * (s.pension / 100);

    // Without salary sacrifice (relief at source — net pay)
    // Employee pays from net; gross stays full; tax + NI on full salary.
    const t1 = incomeTaxOn(s.salary).tax;
    const n1 = employeeNI(s.salary);
    const er1 = employerNI(s.salary, true);
    const net1 = s.salary - t1 - n1 - pensionAmt;
    // (Relief at source adds 20% basic-rate tax back into the pension pot.)
    const pensionPot1 = pensionAmt / 0.80; // grossed up by basic-rate relief
    const totalCompForEmployee1 = net1 + pensionPot1;

    // With salary sacrifice — reduced gross
    const reducedGross = s.salary - pensionAmt;
    const t2 = incomeTaxOn(reducedGross).tax;
    const n2 = employeeNI(reducedGross);
    const er2 = employerNI(reducedGross, true);
    const net2 = reducedGross - t2 - n2;
    const pensionPot2 = pensionAmt; // goes in directly, no relief needed
    const totalCompForEmployee2 = net2 + pensionPot2;

    const employeeBenefit = totalCompForEmployee2 - totalCompForEmployee1;
    const employerSaving  = er1 - er2;

    return { pensionAmt, t1, n1, er1, net1, pensionPot1, totalCompForEmployee1, t2, n2, er2, net2, pensionPot2, totalCompForEmployee2, employeeBenefit, employerSaving };
  },
  render(r){
    return `
      ${kpiRow([
        kpi('Employee gain',      fmt(r.employeeBenefit), { color:'green',   sub:'Higher total comp (net + pension)' }),
        kpi('Employer NI saving', fmt(r.employerSaving),  { color:'primary', sub:'15% of sacrificed amount' }),
        kpi('Pension contribution', fmt(r.pensionAmt),    { color:'navy',    sub:'Either route, same nominal' }),
      ])}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        <div class="breakdown">
          <div class="bk-header"><div class="bk-title">Without sacrifice (relief at source)</div></div>
          ${bkRow('Gross salary',  '#6B748F', window._lastCalc?.state.salary || 0, window._lastCalc?.state.salary || 0)}
          ${bkRow('Income tax',    '#C0392B', r.t1, window._lastCalc?.state.salary || 0)}
          ${bkRow('Employee NI',   '#C49A2E', r.n1, window._lastCalc?.state.salary || 0)}
          ${bkRow('Pension (from net)', '#7C3AED', r.pensionAmt, window._lastCalc?.state.salary || 0)}
          ${bkRow('Net pay',       '#1A55CC', r.net1, window._lastCalc?.state.salary || 0, true)}
        </div>
        <div class="breakdown">
          <div class="bk-header"><div class="bk-title">With salary sacrifice</div></div>
          ${bkRow('Reduced gross', '#6B748F', (window._lastCalc?.state.salary || 0) - r.pensionAmt, window._lastCalc?.state.salary || 0)}
          ${bkRow('Income tax',    '#C0392B', r.t2, window._lastCalc?.state.salary || 0)}
          ${bkRow('Employee NI',   '#C49A2E', r.n2, window._lastCalc?.state.salary || 0)}
          ${bkRow('Pension (direct)', '#7C3AED', r.pensionAmt, window._lastCalc?.state.salary || 0)}
          ${bkRow('Net pay',       '#1A55CC', r.net2, window._lastCalc?.state.salary || 0, true)}
        </div>
      </div>
      ${notesCard('Why sacrifice wins on NI', `Salary sacrifice swaps the employee\'s pre-tax salary for an employer pension contribution. Because employer pension contributions aren\'t subject to employee NI (8%) <em>or</em> employer NI (15%), both sides save. The pension pot is the same; everything else is the saving.`)}
      ${notesCard('Higher-rate taxpayers: non-sacrifice relief', `The "without sacrifice" column models <strong>relief at source</strong> — the pension provider automatically adds 20% basic-rate tax relief to the employee\'s contribution. Higher-rate and additional-rate taxpayers can claim a <strong>further 20% or 25%</strong> of their contribution back via Self Assessment, reducing their effective pension cost. This extra relief is <strong>not shown above</strong> — for a 40% taxpayer it makes the non-sacrifice route more competitive than it appears here.`)}
      ${actionsRow()}
    `;
  },
  related: ['paye','auto-enrol','sal-vs-div']
};

// ─────────────────────────────────────────────────────────
// SSP CALCULATOR
// ─────────────────────────────────────────────────────────
CALCS['ssp'] = {
  id: 'ssp',
  title: 'Statutory Sick Pay (SSP) Calculator',
  subtitle: 'SSP from day one of sickness for up to 28 weeks. From 6 April 2026 the weekly amount is the lower of £123.25 or 80% of average weekly earnings — with no waiting days and no lower earnings limit.',
  inputs: [
    { id:'awe',     type:'currency', label:'Average weekly earnings (AWE)',  default:300, hint:'Gross, over the 8 weeks before sickness' },
    { id:'days',    type:'number',   label:'Qualifying days off sick',       default:10, min:1, max:200, hint:'Days the employee would normally have worked' },
    { id:'qdays',   type:'number',   label:'Qualifying days per week',       default:5, min:1, max:7, hint:'Days normally worked in a week' },
  ],
  calculate(s){
    const T = window.TAX;
    // 2026/27: SSP weekly amount = lower of the flat rate or 80% of AWE.
    const weeklyAmount = Math.min(T.SSP_RATE, s.awe * T.SSP_PCT_CAP);
    const cappedByAwe  = (s.awe * T.SSP_PCT_CAP) < T.SSP_RATE;
    const qDailyRate   = weeklyAmount / s.qdays;
    // No waiting days from 6 Apr 2026 — every qualifying day is paid,
    // up to the 28-week statutory maximum.
    const maxPaidDays  = T.SSP_MAX_WEEKS * s.qdays;
    const paidDays     = Math.min(s.days, maxPaidDays);
    const totalPaid    = paidDays * qDailyRate;
    const cappedByMax  = s.days > maxPaidDays;
    return {
      weeklyAmount, qDailyRate, paidDays, totalPaid,
      sspRate:T.SSP_RATE, pctCap:T.SSP_PCT_CAP, awe:s.awe,
      cappedByAwe, cappedByMax, maxPaidDays
    };
  },
  render(r){
    const capNote = r.cappedByAwe
      ? `Because 80% of this employee's AWE (£${(r.awe*r.pctCap).toFixed(2)}/wk) is below the £${r.sspRate.toFixed(2)} flat rate, SSP is paid at the lower <strong>80% figure</strong>.`
      : `The £${r.sspRate.toFixed(2)} flat rate applies, as it is lower than 80% of this employee's AWE.`;
    return `
      ${kpiRow([
        kpi('Total SSP payable', fmt(r.totalPaid), { color:'primary', sub:`${r.paidDays} qualifying day${r.paidDays!==1?'s':''} paid (from day 1)` }),
        kpi('Weekly SSP',        fmt(r.weeklyAmount), { color:'gold', sub:`Lower of £${r.sspRate.toFixed(2)} or 80% AWE` }),
        kpi('Daily rate',        fmt(r.qDailyRate), { color:'navy', sub:'Weekly ÷ qualifying days/week' }),
      ])}
      ${r.cappedByMax ? notesCard('28-week maximum reached', `SSP is capped at <strong>28 weeks</strong> per period of incapacity. This calculation pays the maximum ${r.maxPaidDays} qualifying days; any further absence is unpaid for SSP purposes.`) : ''}
      ${notesCard('How SSP works (2026/27)', `Following the Employment Rights Act 2025, from <strong>6 April 2026</strong>:<br>• SSP is payable from the <strong>first qualifying day</strong> — the three unpaid "waiting days" have been abolished.<br>• There is <strong>no Lower Earnings Limit</strong> — all employees qualify regardless of earnings.<br>• The weekly amount is the <strong>lower of £${r.sspRate.toFixed(2)} or 80% of AWE</strong>. ${capNote}<br>• SSP is payable for up to <strong>28 weeks</strong> per period of incapacity, and linked periods within 8 weeks count together.`)}
      ${actionsRow()}
    `;
  },
  related: ['smp','holiday','paye']
};

// ─────────────────────────────────────────────────────────
// SMP CALCULATOR
// ─────────────────────────────────────────────────────────
CALCS['smp'] = {
  id: 'smp',
  title: 'Statutory Maternity Pay (SMP) Calculator',
  subtitle: 'SMP — 90% of average weekly earnings for 6 weeks, then £194.32 or 90% AWE (whichever lower) for 33 weeks. Includes expected week of childbirth, qualifying-week and leave-start handling for 2026/27.',
  inputs: [
    { id:'due',     type:'date',     label:'Baby due date (EWC)',           default:'', hint:'Expected week of childbirth' },
    { id:'leave',   type:'date',     label:'Maternity leave start date',    default:'', hint:'Earliest: 11 weeks before the due date' },
    { id:'awe',     type:'currency', label:'Average weekly earnings (AWE)',  default:500, hint:'Gross, over the 8 weeks up to the qualifying week' },
    { id:'service', type:'number',   label:'Weeks employed by qualifying week', default:52, min:0, max:520, hint:'Continuous service into the 15th week before EWC' },
  ],
  calculate(s){
    const T = window.TAX;
    // ── Key maternity dates ──
    // EWC = the Sunday on/before the due date (start of the expected week of childbirth).
    // Qualifying week (QW) = the 15th week before the EWC.
    // Continuous-employment test: at least 26 weeks' service into the QW.
    let ewcStart = null, qualWeek = null, earliestLeave = null, leaveDate = null, leaveTooEarly = false;
    if (s.due) {
      const due = new Date(s.due + 'T00:00:00');
      ewcStart = new Date(due); ewcStart.setDate(ewcStart.getDate() - due.getDay()); // back to Sunday
      qualWeek = new Date(ewcStart); qualWeek.setDate(qualWeek.getDate() - 15*7);     // 15 weeks before EWC
      earliestLeave = new Date(ewcStart); earliestLeave.setDate(earliestLeave.getDate() - 11*7); // 11 weeks before EWC
      if (s.leave) {
        leaveDate = new Date(s.leave + 'T00:00:00');
        leaveTooEarly = leaveDate < earliestLeave;
      }
    }

    // ── Eligibility ──
    // Earnings test (>= LEL) AND continuous-employment test (>= 26 weeks by QW).
    const earnsEnough = s.awe >= T.LEL;
    const longEnough  = s.service >= 26;
    const eligible    = earnsEnough && longEnough;

    // ── Payment ──
    const weeklyHigher = s.awe * T.SMP_HIGHER;                       // weeks 1-6: 90% AWE (uncapped)
    const weeklyLower  = Math.min(s.awe * T.SMP_HIGHER, T.SMP_LOWER); // weeks 7-39: lower of 90% AWE or flat rate
    const first6  = weeklyHigher * 6;
    const next33  = weeklyLower * 33;
    const total   = first6 + next33;
    const cappedByFlat = (s.awe * T.SMP_HIGHER) > T.SMP_LOWER;

    return {
      eligible, earnsEnough, longEnough,
      first6, weeklyHigher, weeklyLower, next33, total, cappedByFlat,
      lel:T.LEL, flat:T.SMP_LOWER,
      ewcStart, qualWeek, earliestLeave, leaveDate, leaveTooEarly
    };
  },
  render(r){
    const fmtD = d => d ? d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—';
    const datesCard = r.ewcStart ? notesCard('Key maternity dates', `
      • Expected week of childbirth (EWC) begins: <strong>${fmtD(r.ewcStart)}</strong><br>
      • Qualifying week (15th week before EWC): <strong>${fmtD(r.qualWeek)}</strong> — eligibility and AWE are assessed up to this week<br>
      • Earliest SMP/leave start (11 weeks before EWC): <strong>${fmtD(r.earliestLeave)}</strong>
      ${r.leaveDate ? `<br>• Chosen leave start: <strong>${fmtD(r.leaveDate)}</strong>${r.leaveTooEarly ? ' <span style="color:var(--red);font-weight:700">⚠ earlier than the 11-week limit</span>' : ' ✓'}` : ''}
    `) : notesCard('Tip', 'Enter the baby\'s due date to see the expected week of childbirth, qualifying week and earliest leave date worked out automatically.');

    if (!r.eligible) {
      const reasons = [];
      if (!r.earnsEnough) reasons.push(`average weekly earnings must be at least <strong>£${r.lel.toFixed(2)}/week</strong> (the Lower Earnings Limit for 2026/27)`);
      if (!r.longEnough)  reasons.push(`there must be at least <strong>26 weeks'</strong> continuous employment by the qualifying week`);
      return `<div style="background:#FEF2F2;border:1px solid #FCA5A5;border-radius:12px;padding:24px">
        <div style="font-size:14px;font-weight:700;color:#991B1B;margin-bottom:6px">Not eligible for SMP</div>
        <div style="font-size:13px;color:var(--t2);line-height:1.7">To qualify, ${reasons.join(' and ')}. Where SMP isn't payable, <strong>Maternity Allowance</strong> from the DWP may be available instead — the employer issues form SMP1.</div>
      </div>${datesCard}${actionsRow()}`;
    }
    return `
      ${kpiRow([
        kpi('Total SMP (39 weeks)', fmt(r.total),         { color:'primary', sub:'Across the full payment period' }),
        kpi('Weeks 1–6 (90% AWE)',  fmt(r.weeklyHigher),   { color:'green',   sub:`${fmt(r.first6)} for 6 weeks` }),
        kpi('Weeks 7–39',           fmt(r.weeklyLower),    { color:'gold',    sub:`${fmt(r.next33)} over 33 weeks` }),
      ])}
      <div class="breakdown">
        <div class="bk-header"><div class="bk-title">Period-by-period</div></div>
        ${bkRow('First 6 weeks @ 90% AWE',  '#16A34A', r.first6, r.total)}
        ${bkRow('Weeks 7–39 @ lower rate', '#C49A2E', r.next33, r.total)}
        ${bkRow('Total SMP', '#1A55CC', r.total, r.total, false, true)}
      </div>
      ${datesCard}
      ${notesCard('How the lower rate works', `Weeks 7–39 are paid at the <strong>lower</strong> of 90% of AWE or the £${r.flat.toFixed(2)} flat rate. ${r.cappedByFlat ? `Here 90% of AWE exceeds the flat rate, so the <strong>£${r.flat.toFixed(2)}</strong> flat rate applies.` : `Here 90% of AWE is below the flat rate, so the <strong>90% figure</strong> applies.`}`)}
      ${notesCard('Employer recovery', `HMRC reimburses <strong>92%</strong> of SMP paid, or <strong>103%</strong> for small employers eligible for Small Employers' Relief. Recovery is claimed via your EPS.`)}
      ${actionsRow()}
    `;
  },
  related: ['ssp','holiday','paye']
};

// ─────────────────────────────────────────────────────────
// HOLIDAY PAY CALCULATOR
// ─────────────────────────────────────────────────────────
CALCS['holiday'] = {
  id: 'holiday',
  title: 'Holiday Pay Calculator',
  subtitle: 'Statutory entitlement (5.6 weeks/year) and accrual for full-time, part-time and irregular-hours workers.',
  inputs: [
    { id:'mode',        type:'toggle',   label:'Worker type',                  default:'fixed', options:[{v:'fixed',l:'Fixed hours'},{v:'irreg',l:'Irregular / part-year'}] },
    { id:'daysPerWeek', type:'number',   label:'Days worked per week',         default:5, min:1, max:7 },
    { id:'hoursPerDay', type:'number',   label:'Hours per day',                default:7.5, step:0.5, min:1, max:24, hint:'Used for fixed-hours holiday pay calculation' },
    { id:'hoursWorked', type:'number',   label:'Total hours worked in period', default:160, hint:'Only used for irregular workers' },
    { id:'hourlyRate',  type:'currency', label:'Hourly rate',                  default:13 },
  ],
  calculate(s){
    const T = window.TAX;
    if (s.mode === 'irreg') {
      const accrued = s.hoursWorked * 0.1207; // 5.6/46.4
      const pay = accrued * s.hourlyRate;
      return { mode:'irreg', accruedHours:accrued, pay, entitlementDays: null };
    }
    const hoursPerDay = s.hoursPerDay || 7.5;
    const days = s.daysPerWeek * T.HOLIDAY_WEEKS;
    const cappedDays = Math.min(days, 28); // statutory cap
    const annualPay = s.hourlyRate * (s.daysPerWeek * hoursPerDay) * 52;
    const weekPay = annualPay / 52;
    const totalHolidayPay = weekPay * T.HOLIDAY_WEEKS;
    return { mode:'fixed', entitlementDays: cappedDays, weekPay, totalHolidayPay, hoursPerDay };
  },
  render(r){
    if (r.mode === 'irreg') {
      return `
        ${kpiRow([
          kpi('Holiday hours accrued', r.accruedHours.toFixed(2) + ' hrs', { color:'primary', sub:'12.07% of hours worked' }),
          kpi('Holiday pay due',       fmt(r.pay),                          { color:'green',   sub:'Hours × hourly rate' }),
          kpi('Rolled-up rate',        '12.07%',                            { color:'navy',    sub:'Of hours worked' }),
        ])}
        ${notesCard('Rolled-up holiday pay', `For irregular-hours and part-year workers, employers can pay holiday as an enhancement of <strong>12.07%</strong> on top of normal hourly pay in each pay period — provided it is shown as a separate line on the payslip and the worker is genuinely irregular-hours.`)}
        ${actionsRow()}
      `;
    }
    return `
      ${kpiRow([
        kpi('Statutory entitlement', r.entitlementDays.toFixed(1) + ' days/yr', { color:'primary', sub:'Capped at 28 days statutory' }),
        kpi('Week\'s pay',           fmt(r.weekPay),     { color:'gold',    sub:'For holiday pay calculation' }),
        kpi('Annual holiday pay',    fmt(r.totalHolidayPay), { color:'green', sub:'5.6 weeks × week\'s pay' }),
      ])}
      ${notesCard('Statutory minimums', `Full-time workers (5 days/week) are entitled to <strong>28 days paid leave</strong> per year — this can include bank holidays. Part-time workers get pro-rata entitlement. Employers can give more, but never less.`)}
      ${notesCard('Holiday pay calculation basis', `A week\'s pay for holiday purposes is based on the worker\'s <strong>normal working hours and rate</strong>. The calculation above uses <strong>${r.hoursPerDay} hours/day</strong> — adjust this if your workers have different contracted daily hours. For workers with variable pay (commission, overtime), the ERA 2023 requires a 52-week average; this calculator uses the current hourly rate as a proxy.`)}
      ${actionsRow()}
    `;
  },
  related: ['ssp','smp','min-wage']
};

// ─────────────────────────────────────────────────────────
// REDUNDANCY PAY CALCULATOR
// ─────────────────────────────────────────────────────────
CALCS['redundancy'] = {
  id: 'redundancy',
  title: 'Statutory Redundancy Pay Calculator',
  subtitle: 'Age-banded weekly multiplier × capped weekly pay × completed years of service (max 20).',
  inputs: [
    { id:'age',       type:'number',   label:'Age at redundancy',          default:42, min:16, max:80 },
    { id:'years',     type:'number',   label:'Complete years of service',  default:10, min:0, max:50 },
    { id:'weeklyPay', type:'currency', label:'Weekly pay (gross)',         default:650 },
  ],
  calculate(s){
    const T = window.TAX;
    if (s.years < 2) return { eligible:false };
    const cappedYears = Math.min(s.years, T.REDUNDANCY_MAX_YEARS);
    const cappedWeek  = Math.min(s.weeklyPay, T.REDUNDANCY_WEEK_CAP);
    // Walk back from current age, count weeks per year served.
    let weeks = 0;
    for (let i = 0; i < cappedYears; i++) {
      const ageAtYear = s.age - i - 1; // age at start of that year of service
      if (ageAtYear >= 41) weeks += 1.5;
      else if (ageAtYear >= 22) weeks += 1.0;
      else weeks += 0.5;
    }
    const totalPay = weeks * cappedWeek;
    return { eligible:true, weeks, cappedWeek, totalPay, cappedYears, weekCap:T.REDUNDANCY_WEEK_CAP };
  },
  render(r){
    if (!r.eligible) {
      return `<div style="background:#FEF2F2;border:1px solid #FCA5A5;border-radius:12px;padding:24px">
        <div style="font-size:14px;font-weight:700;color:#991B1B;margin-bottom:6px">No statutory redundancy entitlement</div>
        <div style="font-size:13px;color:var(--t2);line-height:1.7">An employee must have <strong>at least 2 years\' continuous service</strong> to qualify for statutory redundancy pay. Contractual redundancy schemes may still apply.</div>
      </div>${actionsRow()}`;
    }
    return `
      ${kpiRow([
        kpi('Statutory redundancy pay', fmt(r.totalPay), { color:'primary', sub:`${r.weeks} weeks × ${fmt(r.cappedWeek)}` }),
        kpi('Weeks of pay',             r.weeks.toFixed(1), { color:'gold',  sub:'Age-banded weekly multiplier' }),
        kpi('Capped weekly pay',        fmt(r.cappedWeek), { color:'navy',  sub:`Statutory cap £${r.weekCap}` }),
      ])}
      ${notesCard('How the weeks add up', `The multiplier depends on age in each year of service: <strong>0.5 weeks/year</strong> for years aged under 22, <strong>1 week/year</strong> for 22–40, and <strong>1.5 weeks/year</strong> for 41+. Both the weekly-pay cap (£${r.weekCap}) and the 20-year service cap apply. Statutory redundancy is tax-free up to £30,000.`)}
      ${actionsRow()}
    `;
  },
  related: ['paye','holiday']
};
