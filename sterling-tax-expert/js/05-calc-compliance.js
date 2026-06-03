CALCS['min-wage'] = {
  id: 'min-wage',
  title: 'Minimum Wage Checker',
  subtitle: 'Check whether an hourly rate meets the NMW/NLW for the worker\'s age band — 2026/27 rates.',
  inputs: [
    { id:'rate',     type:'currency', label:'Hourly rate',     default:11.50, step:0.01 },
    { id:'age',      type:'select',   label:'Age band',        default:'21', options:[
      {v:'21',l:'21 and over (NLW)'},
      {v:'18',l:'18–20'},
      {v:'u18',l:'16–17'},
      {v:'app',l:'Apprentice (1st year or under 19)'},
    ]},
    { id:'weeklyHrs', type:'number',  label:'Hours per week', default:37.5, step:0.5 },
  ],
  calculate(s){
    const T = window.TAX;
    const required = s.age === '21' ? T.NLW_21 : s.age === '18' ? T.NMW_18_20 : s.age === 'u18' ? T.NMW_U18 : T.NMW_APP;
    const compliant = s.rate >= required;
    const shortfall = compliant ? 0 : (required - s.rate) * s.weeklyHrs * 52;
    const annual = s.rate * s.weeklyHrs * 52;
    return { required, compliant, shortfall, annual, ageLabel: s.age==='21'?'21+':s.age==='18'?'18–20':s.age==='u18'?'16–17':'Apprentice' };
  },
  render(r){
    return `
      ${kpiRow([
        kpi(r.compliant ? '✓ Compliant' : '✗ Below minimum', fmt(r.required) + '/hr', { color: r.compliant ? 'green' : 'red', sub:`Required for ${r.ageLabel}` }),
        kpi('Annual gross at this rate', fmt(r.annual), { color:'primary', sub:`${window._lastCalc?.state.weeklyHrs || 0} hrs/week × 52` }),
        kpi(r.compliant ? 'Headroom above NMW' : 'Annual shortfall', fmt(r.compliant ? r.annual - (r.required * (window._lastCalc?.state.weeklyHrs || 0) * 52) : r.shortfall), { color: r.compliant ? 'navy' : 'red' }),
      ])}
      <div class="chart-section">
        <div class="chart-title">All 2026/27 NMW/NLW rates (from 1 April 2026)</div>
        ${barChart([
          { l:'21+ (NLW)',  v:window.TAX.NLW_21*1000,    c:'var(--green)' },
          { l:'18–20',       v:window.TAX.NMW_18_20*1000, c:'var(--blue2)' },
          { l:'16–17',       v:window.TAX.NMW_U18*1000,   c:'var(--goldd)' },
          { l:'Apprentice',  v:window.TAX.NMW_APP*1000,   c:'var(--g400)' },
        ]).replace(/£([\d,]+)/g, (m, n) => '£' + (parseFloat(n.replace(',',''))/1000).toFixed(2) + '/hr')}
      </div>
      ${notesCard('Notice', `These are the 2026/27 minimum wage rates, in force from 1 April 2026. Apprentices move to the age-band rate from year 2 of their apprenticeship (or once they turn 19).`)}
      ${actionsRow()}
    `;
  },
  related: ['paye','holiday','payroll-cost']
};
CALCS['apprenticeship'] = {
  id: 'apprenticeship',
  title: 'Apprenticeship Levy Calculator',
  subtitle: '0.5% of annual pay-bill above £3m equivalent — with the £15,000 annual allowance applied.',
  inputs: [
    { id:'paybill', type:'currency', label:'Annual pay-bill (gross)', default:3500000 },
  ],
  calculate(s){
    const T = window.TAX;
    const levyGross = s.paybill * T.AL_RATE;
    const allowance = T.AL_ALLOWANCE;
    const levyNet = Math.max(0, levyGross - allowance);
    const monthlyNet = levyNet / 12;
    const inScope = s.paybill > 3000000;
    return { levyGross, allowance, levyNet, monthlyNet, inScope };
  },
  render(r){
    return `
      ${kpiRow([
        kpi('Annual levy payable',  fmt(r.levyNet),    { color:'primary', monthly: fmt(r.monthlyNet) + ' / month' }),
        kpi('Gross levy @ 0.5%',    fmt(r.levyGross),  { color:'gold',    sub:'Before allowance' }),
        kpi('Allowance applied',    fmt(r.allowance),  { color:'green',   sub:'Annual fixed' }),
      ])}
      ${!r.inScope ? notesCard('Below threshold', `Your pay-bill is below the £3m equivalent that triggers the Apprenticeship Levy in practice. The £15,000 annual allowance more than covers a 0.5% charge at this scale — no levy is payable.`)
                  : notesCard('In scope', `Pay-bills above £3m incur the Apprenticeship Levy. It\'s reported and paid monthly via your EPS alongside PAYE/NIC. Funds appear in your Apprenticeship Service account and can be used to fund training.`) }
      ${actionsRow()}
    `;
  },
  related: ['employer-ni','payroll-cost']
};
CALCS['cis'] = {
  id: 'cis',
  title: 'CIS Deduction Calculator',
  subtitle: 'Construction Industry Scheme: 20% verified, 30% unverified, 0% gross — with materials, plant hire and VAT excluded.',
  inputs: [
    { id:'labour',    type:'currency', label:'Labour element of invoice',  default:5000 },
    { id:'materials', type:'currency', label:'Materials (excluded)',        default:1500 },
    { id:'vatRate',   type:'select',   label:'VAT treatment',               default:'reverse', options:[
      {v:'reverse',l:'Reverse charge (CIS)'},{v:'std',l:'Standard 20% VAT'},{v:'none',l:'No VAT'}
    ]},
    { id:'status',    type:'select',   label:'Subcontractor status',        default:'verified', options:[
      {v:'gross',l:'Gross payment (0%)'},
      {v:'verified',l:'Verified (20%)'},
      {v:'unverified',l:'Unverified (30%)'},
    ]},
  ],
  calculate(s){
    const rate = s.status === 'gross' ? 0 : s.status === 'verified' ? 0.20 : 0.30;
    const deduction = s.labour * rate;
    const net = s.labour - deduction + s.materials;
    const vatable = s.labour + s.materials;
    const vat = s.vatRate === 'std' ? vatable * 0.20 : 0;
    const totalInvoice = vatable + vat;
    const paidToSub = totalInvoice - deduction;
    return { rate: rate*100, deduction, net, totalInvoice, vat, paidToSub };
  },
  render(r){
    return `
      ${kpiRow([
        kpi('CIS deduction',         fmt(r.deduction),   { color:'gold', sub:`${r.rate.toFixed(0)}% of labour element` }),
        kpi('Payable to subcontractor', fmt(r.paidToSub), { color:'primary', sub:'After CIS deduction' }),
        kpi('Total invoice value',   fmt(r.totalInvoice),{ color:'navy', sub:r.vat > 0 ? `Includes ${fmt(r.vat)} VAT` : 'Reverse-charge / no VAT' }),
      ])}
      <div class="breakdown">
        <div class="bk-header"><div class="bk-title">Payment breakdown</div></div>
        ${bkRow('Labour element',          '#6B748F', window._lastCalc?.state.labour || 0,    r.totalInvoice)}
        ${bkRow('Materials (excluded)',    '#9BA3BD', window._lastCalc?.state.materials || 0, r.totalInvoice)}
        ${r.vat > 0 ? bkRow('VAT (standard rate)', '#0EA5E9', r.vat, r.totalInvoice) : ''}
        ${bkRow(`CIS deduction (${r.rate.toFixed(0)}%)`, '#C0392B', -r.deduction, r.totalInvoice)}
        ${bkRow('Net paid to subcontractor', '#1A55CC', r.paidToSub, r.totalInvoice, false, true)}
      </div>
      ${notesCard('CIS rules in brief', `Only deduct from the <strong>labour element</strong> — materials, plant hire, fuel for plant, and VAT are excluded. Pay the deduction over to HMRC monthly via CIS300 (due 19th of the following month). Issue a payment-and-deduction statement to the subcontractor within 14 days of the tax-month end.`)}
      ${actionsRow()}
    `;
  },
  related: ['vat','paye']
};
CALCS['corp'] = {
  id: 'corp',
  title: 'Corporation Tax Calculator',
  subtitle: 'CT600 estimate for 2026/27 — including marginal relief between £50,000 and £250,000, scaled for associated companies and short accounting periods.',
  inputs: [
    { id:'profit',   type:'currency', label:'Taxable profit (before reliefs)',   default:150000 },
    { id:'aia',      type:'currency', label:'Capital allowances (AIA)',          default:0, hint:'Plant & machinery, Annual Investment Allowance' },
    { id:'rd',       type:'currency', label:'R&D relief / other deductions',     default:0 },
    { id:'assoc',    type:'number',   label:'Associated companies (excluding this one)', default:0, min:0, max:50 },
    { id:'period',   type:'number',   label:'Accounting period length',          default:12, min:1, max:18, suffix:'months' },
  ],
  calculate(s){
    const T = window.TAX;
    const div = s.assoc + 1;
    const lo = (T.CT_LOWER / div) * (s.period / 12);
    const hi = (T.CT_UPPER / div) * (s.period / 12);
    const taxableProfit = Math.max(0, s.profit - s.aia - s.rd);
    let ct = 0, band = '', marginalRelief = 0;
    if (taxableProfit <= lo) { ct = taxableProfit * T.CT_SMALL; band = `Small profits rate (${(T.CT_SMALL*100).toFixed(0)}%)`; }
    else if (taxableProfit >= hi) { ct = taxableProfit * T.CT_MAIN;  band = `Main rate (${(T.CT_MAIN*100).toFixed(0)}%)`; }
    else {
      marginalRelief = (hi - taxableProfit) * T.CT_MR_FRACTION;
      ct = taxableProfit * T.CT_MAIN - marginalRelief;
      band = 'Marginal relief band';
    }
    const effRate = taxableProfit > 0 ? (ct / taxableProfit * 100) : 0;
    const profitAfter = taxableProfit - ct;
    return { taxableProfit, ct, band, marginalRelief, effRate, profitAfter, lo, hi, profit:s.profit, aia:s.aia, rd:s.rd };
  },
  render(r){
    const bandColor = r.band.includes('Small') ? 'var(--green)' : r.band.includes('Main') ? 'var(--red)' : 'var(--goldd)';
    const donutD = [
      { name:'Profit after tax', val:r.profitAfter, color:'#16A34A' },
      { name:'Corporation tax',  val:r.ct,          color:'#C0392B' },
    ];
    return `
      ${kpiRow([
        kpi('Corporation tax due', fmt(r.ct),          { color:'red',     sub:`${r.effRate.toFixed(2)}% effective rate` }),
        kpi('Profit after tax',    fmt(r.profitAfter), { color:'green',   sub:'Available for dividends / retention' }),
        kpi('Rate band applied',   `<span style="color:${bandColor}">${r.band}</span>`, { color:'primary', sub:`Profit: ${fmt(r.taxableProfit)}` }),
      ])}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px" class="paye-charts">
        <div class="chart-section">
          <div class="chart-title"><span>Profit vs tax</span></div>
          <div class="donut-wrap">
            ${donutSVG(donutD, r.taxableProfit, { label:'Kept' })}
            <div class="donut-legend">${donutD.map(d => `
              <div class="dl-item">
                <div class="dl-dot" style="background:${d.color}"></div>
                <span class="dl-name">${d.name}</span>
                <span class="dl-val">${fmt(d.val)}</span>
                <span class="dl-pct">${r.taxableProfit>0?(d.val/r.taxableProfit*100).toFixed(1)+'%':''}</span>
              </div>`).join('')}
            </div>
          </div>
        </div>
        <div class="breakdown">
          <div class="bk-header"><div class="bk-title">Tax computation</div></div>
          ${bkRow('Trading profit',           '#6B748F', r.profit, r.taxableProfit || 1)}
          ${r.aia > 0 ? bkRow('AIA / capital allowances', '#1A55CC', -r.aia, r.taxableProfit || 1) : ''}
          ${r.rd > 0  ? bkRow('R&D relief',               '#2E6FE8', -r.rd,  r.taxableProfit || 1) : ''}
          ${bkRow('Taxable profits',          '#0B1D4E', r.taxableProfit, r.taxableProfit || 1, true)}
          ${r.marginalRelief > 0 ? bkRow('Marginal relief', '#C49A2E', -r.marginalRelief, r.taxableProfit || 1) : ''}
          ${bkRow('Corporation tax due',      '#C0392B', r.ct, r.taxableProfit || 1, false, true)}
        </div>
      </div>
      <div class="chart-section">
        <div class="chart-title">Rate band thresholds <span style="font-size:11px;color:var(--t3)">Adjusted for ${window._lastCalc?.state.assoc || 0} associated companies × ${window._lastCalc?.state.period || 12}-month period</span></div>
        <div class="corp-band">
          <div class="corp-band-row">
            <span class="corp-band-label">Small profits (19%) — up to ${fmt(r.lo,0)}</span>
            <div class="corp-band-bar"><div class="corp-band-fill" style="width:${r.taxableProfit<=r.lo?100:0}%;background:var(--green)"></div></div>
            <span class="corp-band-val">${r.taxableProfit<=r.lo?'In band':''}</span>
          </div>
          <div class="corp-band-row">
            <span class="corp-band-label">Marginal relief — up to ${fmt(r.hi,0)}</span>
            <div class="corp-band-bar"><div class="corp-band-fill" style="width:${r.taxableProfit>r.lo&&r.taxableProfit<r.hi?100:0}%;background:var(--goldd)"></div></div>
            <span class="corp-band-val">${r.taxableProfit>r.lo&&r.taxableProfit<r.hi?'In band':''}</span>
          </div>
          <div class="corp-band-row">
            <span class="corp-band-label">Main rate (25%) — above ${fmt(r.hi,0)}</span>
            <div class="corp-band-bar"><div class="corp-band-fill" style="width:${r.taxableProfit>=r.hi?100:0}%;background:var(--red)"></div></div>
            <span class="corp-band-val">${r.taxableProfit>=r.hi?'In band':''}</span>
          </div>
        </div>
      </div>
      ${(window._lastCalc?.state.assoc > 0) ? notesCard('Associated companies', `The £50,000 and £250,000 thresholds are <strong>divided by ${(window._lastCalc?.state.assoc || 0) + 1}</strong> (this company plus associates). This pulls more profit into the higher rate. Common-control tests apply — see CTA 2010 s18E.`) : ''}
      ${actionsRow()}
    `;
  },
  related: ['marginal','sal-vs-div','vat','dividend']
};
CALCS['vat'] = {
  id: 'vat',
  title: 'VAT Calculator',
  subtitle: 'Add VAT to a net figure or remove it from a gross figure — at 20% standard, 5% reduced or 0% zero-rated.',
  inputs: [
    { id:'mode',     type:'toggle',   label:'Direction',       default:'add', options:[{v:'add',l:'Add VAT (net → gross)'},{v:'remove',l:'Remove VAT (gross → net)'}] },
    { id:'amount',   type:'currency', label:'Amount',           default:1000 },
    { id:'rate',     type:'select',   label:'VAT rate',         default:'std', options:[
      {v:'std',l:'Standard (20%)'},{v:'red',l:'Reduced (5%)'},{v:'zero',l:'Zero-rated (0%)'},
    ]},
  ],
  calculate(s){
    const r = s.rate === 'std' ? 0.20 : s.rate === 'red' ? 0.05 : 0;
    let net, vat, gross;
    if (s.mode === 'add') { net = s.amount; vat = net * r; gross = net + vat; }
    else                  { gross = s.amount; net = gross / (1 + r); vat = gross - net; }
    return { net, vat, gross, rate: r * 100 };
  },
  render(r){
    return `
      ${kpiRow([
        kpi('Net (ex VAT)', fmt(r.net),   { color:'navy' }),
        kpi(`VAT (${r.rate}%)`, fmt(r.vat), { color:'gold' }),
        kpi('Gross (inc VAT)', fmt(r.gross), { color:'primary' }),
      ])}
      ${notesCard('VAT thresholds & rates', `<strong>Registration threshold:</strong> £${fmtInt(window.TAX.VAT_REG_THR)} taxable turnover per rolling 12 months.<br><strong>Deregistration threshold:</strong> £${fmtInt(window.TAX.VAT_DEREG)}.<br>Standard 20%; reduced 5% (some energy, sanitary products, child car seats); zero (most food, children\'s clothes, books).`)}
      ${actionsRow()}
    `;
  },
  related: ['vat-flat','corp','cis']
};
CALCS['vat-flat'] = {
  id: 'vat-flat',
  title: 'Flat Rate VAT Calculator',
  subtitle: 'Compare standard VAT accounting with the Flat Rate Scheme for your sector. Includes the 1% first-year discount.',
  inputs: [
    { id:'turnover',type:'currency', label:'Annual VAT-inclusive turnover', default:90000 },
    { id:'inputs',  type:'currency', label:'Recoverable input VAT (annual)', default:1500, hint:'On standard scheme only' },
    { id:'flatRate',type:'number',   label:'Flat rate for your sector',      default:13.5, step:0.5, suffix:'%' },
    { id:'firstYear',type:'checkbox',label:'First year of VAT registration (1% discount)', default:false },
    { id:'lcost',   type:'checkbox', label:'Limited-cost trader (16.5%)',    default:false },
  ],
  calculate(s){
    const net = s.turnover / 1.20;
    const outputVat = s.turnover - net;
    const standardOwed = outputVat - s.inputs;
    const effectiveRate = s.lcost ? 16.5 : (s.flatRate - (s.firstYear ? 1 : 0));
    const frsOwed = s.turnover * (effectiveRate / 100);
    const saving = standardOwed - frsOwed;
    const overFrsCeiling = (s.turnover / 1.20) > 150000;
    return { net, outputVat, standardOwed, frsOwed, saving, effectiveRate, overFrsCeiling };
  },
  render(r){
    const advice = r.saving > 0 ? 'Flat Rate Scheme is cheaper' : r.saving < 0 ? 'Standard scheme is cheaper' : 'Schemes are roughly equal';
    return `
      ${r.overFrsCeiling ? `<div style="background:#FEF2F2;border:1px solid #FCA5A5;border-radius:10px;padding:14px 18px;margin-bottom:12px;font-size:13px;color:#991B1B;line-height:1.65"><strong>⚠ Turnover exceeds FRS eligibility ceiling.</strong> The Flat Rate Scheme is only available to businesses with net (VAT-exclusive) turnover of <strong>£150,000 or less</strong> (HMRC VAT Notice 733). At this level you would need to leave the scheme. The FRS figures below are shown for comparison only.</div>` : ''}
      ${kpiRow([
        kpi('Standard scheme — VAT owed', fmt(r.standardOwed), { color:'red',  sub:'Output VAT − input VAT' }),
        kpi('FRS — VAT owed',             fmt(r.frsOwed),      { color:'gold', sub:`${r.effectiveRate}% of gross turnover` }),
        kpi('Annual difference',          fmt(Math.abs(r.saving)), { color: r.saving > 0 ? 'green' : 'red', sub: advice }),
      ])}
      ${barChart([
        { l:'Standard scheme', v:r.standardOwed, c:'var(--red)' },
        { l:'Flat Rate Scheme', v:r.frsOwed,     c:'var(--gold)' },
      ])}
      ${notesCard('Flat Rate Scheme rules', `The FRS is available to VAT-registered businesses with <strong>net turnover of £150,000 or less</strong> (HMRC VAT Notice 733). The flat percentage depends on your business sector — pick the closest from HMRC\'s list. <strong>Limited-cost traders</strong> (those spending less than 2% of turnover on goods, or under £1,000/yr) must use the 16.5% rate regardless of sector.`)}
      ${notesCard('Standard scheme assumption', `The standard VAT calculation above assumes <strong>all turnover is standard-rated at 20%</strong>. If your sales include zero-rated or reduced-rated supplies, your actual output VAT will be lower — making the standard scheme relatively more attractive than shown here. Adjust the recoverable input VAT field to reflect your actual input VAT position.`)}
      ${actionsRow()}
    `;
  },
  related: ['vat','corp']
};
CALCS['dividend'] = {
  id: 'dividend',
  title: 'Dividend Tax Calculator',
  subtitle: 'Tax on dividend income alongside salary — with the £500 allowance and 8.75%/33.75%/39.35% rates applied correctly.',
  inputs: [
    { id:'salary',     type:'currency', label:'Other income (salary, etc.)',  default:12570, hint:'Used to find which band dividends fall in' },
    { id:'dividends',  type:'currency', label:'Dividend income (gross)',      default:25000 },
  ],
  calculate(s){
    const T = window.TAX;
    const totalIncome = s.salary + s.dividends;
    let pa = T.PA;
    if (totalIncome > T.PA_TAPER_START) pa = Math.max(0, T.PA - Math.floor((totalIncome - T.PA_TAPER_START) / 2));
    const paUsedBySalary = Math.min(s.salary, pa);
    const paLeft = Math.max(0, pa - paUsedBySalary);
    let remainingDiv = Math.max(0, s.dividends - paLeft);
    const allowanceUsed = Math.min(T.DIV_ALLOWANCE, remainingDiv);
    remainingDiv -= allowanceUsed;
    const taxableSalary = Math.max(0, s.salary - paUsedBySalary);
    const brRoom = Math.max(0, T.BR_LIMIT - T.PA - taxableSalary);
    const hrRoom = Math.max(0, T.HR_LIMIT - T.PA - taxableSalary - brRoom);
    const inBR = Math.min(remainingDiv, brRoom);
    const inHR = Math.min(Math.max(remainingDiv - brRoom, 0), hrRoom);
    const inAR = Math.max(remainingDiv - brRoom - hrRoom, 0);
    const tax = inBR * T.DIV_BR + inHR * T.DIV_HR + inAR * T.DIV_AR;
    const netDividend = s.dividends - tax;
    const effectiveRate = s.dividends > 0 ? (tax / s.dividends * 100) : 0;
    return { tax, netDividend, allowanceUsed, paLeft, inBR, inHR, inAR, effectiveRate };
  },
  render(r){
    return `
      ${kpiRow([
        kpi('Dividend tax owed', fmt(r.tax),         { color:'red',  sub:`${r.effectiveRate.toFixed(2)}% effective` }),
        kpi('Net dividend',      fmt(r.netDividend), { color:'primary', sub:'After dividend tax' }),
        kpi('Allowance used',    fmt(r.allowanceUsed), { color:'green', sub:`Of £${window.TAX.DIV_ALLOWANCE} dividend allowance` }),
      ])}
      <div class="breakdown">
        <div class="bk-header"><div class="bk-title">Band-by-band</div></div>
        ${bkRow('Tax-free (personal allowance unused)', '#9BA3BD', r.paLeft, r.paLeft + r.allowanceUsed + r.inBR + r.inHR + r.inAR)}
        ${bkRow('Tax-free (£500 dividend allowance)', '#16A34A', r.allowanceUsed, r.paLeft + r.allowanceUsed + r.inBR + r.inHR + r.inAR)}
        ${r.inBR > 0 ? bkRow('Basic rate (8.75%)',   '#1A55CC', r.inBR, r.paLeft + r.allowanceUsed + r.inBR + r.inHR + r.inAR) : ''}
        ${r.inHR > 0 ? bkRow('Higher rate (33.75%)', '#C49A2E', r.inHR, r.paLeft + r.allowanceUsed + r.inBR + r.inHR + r.inAR) : ''}
        ${r.inAR > 0 ? bkRow('Additional rate (39.35%)', '#C0392B', r.inAR, r.paLeft + r.allowanceUsed + r.inBR + r.inHR + r.inAR) : ''}
        ${bkRow('Total dividend tax', '#C0392B', r.tax, r.paLeft + r.allowanceUsed + r.inBR + r.inHR + r.inAR, true)}
      </div>
      ${notesCard('How band-stacking works', `Other income is stacked first against your personal allowance and the basic-rate band. Dividends then fill whatever room is left. The £500 dividend allowance taxes the dividends in this slice at 0% — but those pounds still count towards your total income for band purposes.`)}
      ${actionsRow()}
    `;
  },
  related: ['sal-vs-div','paye','corp']
};
CALCS['sal-vs-div'] = {
  id: 'sal-vs-div',
  title: 'Salary vs Dividend Calculator',
  subtitle: 'For directors of limited companies: model the take-home from any salary/dividend split for 2026/27.',
  inputs: [
    { id:'totalDraw', type:'currency', label:'Total to draw from company (post-CT profit + salary)', default:60000 },
    { id:'salary',    type:'currency', label:'Salary element',                                       default:12570, hint:'Try £12,570 (PA), £5,000 (NI ST), or higher' },
    { id:'allowance', type:'checkbox', label:'Company eligible for Employment Allowance',            default:false, },
  ],
  calculate(s){
    const erNI = employerNI(s.salary, s.allowance);
    const profitForDiv = Math.max(0, s.totalDraw - s.salary - erNI);
    const dividend = profitForDiv;
    const { tax: salaryTax } = incomeTaxOn(s.salary);
    const empNI = employeeNI(s.salary);
    const div = CALCS['dividend'].calculate({ salary: s.salary, dividends: dividend });
    const totalTax = salaryTax + empNI + div.tax;
    const netTakeHome = (s.salary - salaryTax - empNI) + (dividend - div.tax);
    const totalCorpAndPersonal = erNI + salaryTax + empNI + div.tax;
    return { erNI, dividend, salaryTax, empNI, divTax:div.tax, totalTax, netTakeHome, totalCorpAndPersonal, salary:s.salary, totalDraw:s.totalDraw };
  },
  render(r){
    const efficiency = r.totalDraw > 0 ? (r.netTakeHome / r.totalDraw * 100) : 0;
    return `
      ${kpiRow([
        kpi('Net take-home',           fmt(r.netTakeHome), { color:'primary', monthly: fmt(r.netTakeHome/12) + ' / month' }),
        kpi('Total tax & NI',          fmt(r.totalCorpAndPersonal), { color:'red', sub:'Employer NI + tax + dividend tax' }),
        kpi('Take-home efficiency',    efficiency.toFixed(1) + '%', { color:'green', sub:'Net ÷ total cash drawn' }),
      ])}
      <div class="breakdown">
        <div class="bk-header"><div class="bk-title">Salary route</div></div>
        ${bkRow('Salary',           '#6B748F', r.salary,    r.totalDraw)}
        ${bkRow('Employer NI',      '#C49A2E', r.erNI,      r.totalDraw)}
        ${bkRow('Income tax',       '#C0392B', r.salaryTax, r.totalDraw)}
        ${bkRow('Employee NI',      '#C49A2E', r.empNI,     r.totalDraw)}
      </div>
      <div class="breakdown">
        <div class="bk-header"><div class="bk-title">Dividend route</div></div>
        ${bkRow('Dividend declared', '#7C3AED', r.dividend, r.totalDraw)}
        ${bkRow('Dividend tax',      '#C0392B', r.divTax,   r.totalDraw)}
        ${bkRow('Net take-home',     '#1A55CC', r.netTakeHome, r.totalDraw, false, true)}
      </div>
      ${notesCard('Three common salary levels for directors', `<strong>£0 / £5,000:</strong> No employee NI, but no qualifying NI year for state pension.<br><strong>£6,500 (LEL + buffer):</strong> Earns a qualifying NI year for state pension, still no employee NI to pay.<br><strong>£12,570 (full PA):</strong> Uses up the personal allowance against salary, but triggers employer NI on £7,570 (or zero if Employment Allowance available).<br>The "best" choice depends on EA eligibility and your other income.`)}
      ${notesCard('Modelling assumption', `This calculator treats the <strong>total draw as post-corporation-tax cash</strong>. In reality, salary and employer NI are deductible business expenses that reduce the company\'s taxable profit before CT is applied. A higher salary therefore reduces the CT bill, freeing slightly more cash for dividends. The CT saving is approximately <strong>19–25%</strong> of the salary and employer NI paid. For marginal-band companies (profits £50k–£250k) the interaction is material — use the Corporation Tax calculator alongside this tool to model the full picture.`)}
      ${actionsRow()}
    `;
  },
  related: ['paye','dividend','corp','employer-ni']
};
CALCS['self-assess'] = {
  id: 'self-assess',
  title: 'Self Assessment Calculator',
  subtitle: 'Sole-trader income tax, Class 2 & 4 NI, and payments on account for the 2026/27 return.',
  inputs: [
    { id:'profit',  type:'currency', label:'Trading profit (after expenses)', default:35000 },
    { id:'other',   type:'currency', label:'Other taxable income',            default:0, hint:'Employment, rental, etc.' },
    { id:'studentPlan', type:'select', label:'Student loan plan', default:'0', options:[
      {v:'0',l:'None'},{v:'1',l:'Plan 1'},{v:'2',l:'Plan 2'},{v:'4',l:'Plan 4'},{v:'5',l:'Plan 5'},{v:'PG',l:'Postgrad'}
    ]},
  ],
  calculate(s){
    const T = window.TAX;
    const totalIncome = s.profit + s.other;
    const { tax: incomeTax } = incomeTaxOn(totalIncome);
    const class2 = s.profit < T.CLASS2_SPT ? T.CLASS2_RATE * 52 : 0;
    let class4 = 0;
    if (s.profit > T.CLASS4_LPL) {
      class4 += (Math.min(s.profit, T.CLASS4_UPL) - T.CLASS4_LPL) * T.CLASS4_MAIN;
      if (s.profit > T.CLASS4_UPL) class4 += (s.profit - T.CLASS4_UPL) * T.CLASS4_ADDL;
    }
    const sl = studentLoan(totalIncome, s.studentPlan);
    const total = incomeTax + class2 + class4 + sl;
    const poa = (incomeTax + class4) / 2;
    const netProfit = s.profit - (incomeTax + class4 + class2);
    return { incomeTax, class2, class4, sl, total, poa, netProfit, totalIncome };
  },
  render(r){
    return `
      ${kpiRow([
        kpi('Total tax & NI for 2026/27', fmt(r.total), { color:'red',  sub:'Income tax + Class 2/4 NI + SL' }),
        kpi('Take-home from trade',       fmt(r.netProfit), { color:'green', sub:'After tax — before student loan' }),
        kpi('Each payment on account',    fmt(r.poa), { color:'primary', sub:'31 Jan & 31 Jul 2027/28' }),
      ])}
      <div class="breakdown">
        <div class="bk-header"><div class="bk-title">Liability breakdown</div></div>
        ${bkRow('Income tax',                            '#C0392B', r.incomeTax, r.total)}
        ${r.class2 > 0 ? bkRow('Class 2 NI (voluntary)', '#9BA3BD', r.class2,    r.total) : ''}
        ${bkRow('Class 4 NI',                            '#C49A2E', r.class4,    r.total)}
        ${r.sl > 0 ? bkRow('Student loan',               '#EA580C', r.sl,        r.total) : ''}
        ${bkRow('Total due',                             '#0B1D4E', r.total,     r.total, false, true)}
      </div>
      ${notesCard('Class 2 NI — 2026/27 rules', `Since April 2024 there is no <em>mandatory</em> Class 2 liability. <strong>Profits at or above the SPT (£${fmtInt(window.TAX.CLASS2_SPT)})</strong> receive an automatic HMRC credit — your NI record is protected with no cash payment. <strong>Profits below £${fmtInt(window.TAX.CLASS2_SPT)}</strong> may pay Class 2 <em>voluntarily</em> at £${window.TAX.CLASS2_RATE.toFixed(2)}/week (£${fmtInt(window.TAX.CLASS2_RATE*52)}/yr) to accumulate qualifying years for State Pension and contributory benefits. ${r.class2 > 0 ? 'This voluntary payment is <strong>included in the totals above</strong> — it is strongly recommended if building State Pension entitlement.' : 'Class 2 is credited automatically for your profit level — no cash payment required.'}`)}
      ${notesCard('Key 2026/27 dates', `<strong>5 Oct 2026:</strong> register if newly self-employed.<br><strong>31 Oct 2026:</strong> paper-return deadline (2025/26).<br><strong>31 Jan 2027:</strong> online filing + balancing payment + 1st POA for 2026/27 (based on income tax + Class 4 only).<br><strong>31 Jul 2027:</strong> 2nd POA for 2026/27.<br>From April 2026 sole traders with gross income above £50,000 must comply with MTD for Income Tax.`)}
      ${actionsRow()}
    `;
  },
  related: ['paye','dividend','vat']
};
