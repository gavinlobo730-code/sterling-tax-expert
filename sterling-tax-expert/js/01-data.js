window.TAX_YEAR = '2026/27';
window.TAX_YEAR_LABEL = 'Updated for 2026/27 UK tax rules';
window.SELECTED_TAX_YEAR = '2026/27';
window.TAX_RATES = {
  '2022/23': {
    ...window.TAX,
    HR_LIMIT: 150000,
    NI_PT: 12570,
    NI_MAIN: 0.12,
    NI_ADDL: 0.02,
    NI_ST: 9100,
    NI_ER: 0.138,
    EMPLOYMENT_ALLOWANCE: 5000,
    CLASS4_LPL: 11908,
    CLASS4_UPL: 50270,
    CLASS4_MAIN: 0.0925,  // simplified blend of 10.25% / 9.73%
    CLASS4_ADDL: 0.0275,
    CLASS2_RATE: 3.15,
    CLASS2_SPT: 6725,
    DIV_ALLOWANCE: 2000,
    DIV_BR: 0.0875, DIV_HR: 0.3375, DIV_AR: 0.3935,
    VAT_REG_THR: 85000,
    VAT_DEREG: 83000,
    SL: {
      1: { thr: 20195, rate: 0.09 },
      2: { thr: 27295, rate: 0.09 },
      4: { thr: 25375, rate: 0.09 },
      5: { thr: 25000, rate: 0.06 },
      PG: { thr: 21000, rate: 0.06 },
    },
    NLW_21: 9.50, NMW_18_20: 9.18, NMW_U18: 6.83, NMW_APP: 4.81,
    SSP_RATE: 99.35, SSP_PCT_CAP: null, SSP_QD: 3,
    SMP_LOWER: 156.66, SPP_RATE: 156.66, SAP_RATE: 156.66, SHPP_RATE: 156.66,
    LEL: 123, SSP_LEL: 123,
    REDUNDANCY_WEEK_CAP: 571,
    SCOT_STARTER_LIMIT: 14732, SCOT_BASIC_LIMIT: 25688,
    SCOT_INTER_LIMIT: 43662,   SCOT_HR_LIMIT: 150000,
    SCOT_HR: 0.41, SCOT_TOP: 0.46,
    _midYearNote: 'NI rates changed twice in 2022/23. Results use simplified annual rates — figures are approximate.',
  },
  '2023/24': {
    ...window.TAX,
    HR_LIMIT: 125140,
    NI_PT: 12570, NI_MAIN: 0.12, NI_ADDL: 0.02,
    NI_ST: 9100,  NI_ER: 0.138,
    EMPLOYMENT_ALLOWANCE: 5000,
    CLASS4_LPL: 12570, CLASS4_UPL: 50270,
    CLASS4_MAIN: 0.09,   // simplified; cut to 8% from 6 Jan 2024
    CLASS4_ADDL: 0.02,
    CLASS2_RATE: 3.45, CLASS2_SPT: 6725,
    DIV_ALLOWANCE: 1000,
    DIV_BR: 0.0875, DIV_HR: 0.3375, DIV_AR: 0.3935,
    VAT_REG_THR: 85000, VAT_DEREG: 83000,
    SL: {
      1: { thr: 22015, rate: 0.09 },
      2: { thr: 27295, rate: 0.09 },
      4: { thr: 27660, rate: 0.09 },
      5: { thr: 25000, rate: 0.06 },
      PG: { thr: 21000, rate: 0.06 },
    },
    NLW_21: 10.42, NMW_18_20: 10.18, NMW_U18: 7.49, NMW_APP: 5.28,
    SSP_RATE: 109.40, SSP_PCT_CAP: null, SSP_QD: 3,
    SMP_LOWER: 172.48, SPP_RATE: 172.48, SAP_RATE: 172.48, SHPP_RATE: 172.48,
    LEL: 123, SSP_LEL: 123,
    REDUNDANCY_WEEK_CAP: 643,
    SCOT_STARTER_LIMIT: 14732, SCOT_BASIC_LIMIT: 25688,
    SCOT_INTER_LIMIT: 43662,   SCOT_HR_LIMIT: 125140,
    SCOT_HR: 0.42, SCOT_TOP: 0.47,
    _midYearNote: 'Employee NI was cut from 12% to 10% from 6 Jan 2024. Results use simplified annual rate of 12%.',
  },
  '2024/25': {
    ...window.TAX,
    HR_LIMIT: 125140,
    NI_PT: 12570, NI_MAIN: 0.08, NI_ADDL: 0.02,
    NI_ST: 9100,  NI_ER: 0.138,
    EMPLOYMENT_ALLOWANCE: 5000,
    CLASS4_LPL: 12570, CLASS4_UPL: 50270,
    CLASS4_MAIN: 0.06, CLASS4_ADDL: 0.02,
    CLASS2_RATE: 3.45, CLASS2_SPT: 6725,
    DIV_ALLOWANCE: 500,
    DIV_BR: 0.0875, DIV_HR: 0.3375, DIV_AR: 0.3935,
    VAT_REG_THR: 90000, VAT_DEREG: 88000,
    SL: {
      1: { thr: 24990, rate: 0.09 },
      2: { thr: 27295, rate: 0.09 },
      4: { thr: 31395, rate: 0.09 },
      5: { thr: 25000, rate: 0.06 },
      PG: { thr: 21000, rate: 0.06 },
    },
    NLW_21: 11.44, NMW_18_20: 8.60, NMW_U18: 6.40, NMW_APP: 6.40,
    SSP_RATE: 116.75, SSP_PCT_CAP: null, SSP_QD: 3,
    SMP_LOWER: 184.03, SPP_RATE: 184.03, SAP_RATE: 184.03, SHPP_RATE: 184.03,
    LEL: 123, SSP_LEL: 123,
    REDUNDANCY_WEEK_CAP: 643,
    SCOT_STARTER_LIMIT: 14876, SCOT_BASIC_LIMIT: 26561,
    SCOT_INTER_LIMIT: 43662,   SCOT_HR_LIMIT: 125140,
    SCOT_HR: 0.42, SCOT_TOP: 0.48,
  },
  '2025/26': {
    ...window.TAX,
    HR_LIMIT: 125140,
    NI_PT: 12570, NI_MAIN: 0.08, NI_ADDL: 0.02,
    NI_ST: 5000,  NI_ER: 0.15,
    EMPLOYMENT_ALLOWANCE: 10500,
    CLASS4_LPL: 12570, CLASS4_UPL: 50270,
    CLASS4_MAIN: 0.06, CLASS4_ADDL: 0.02,
    CLASS2_RATE: 3.50, CLASS2_SPT: 6845,
    DIV_ALLOWANCE: 500,
    DIV_BR: 0.0875, DIV_HR: 0.3375, DIV_AR: 0.3935,
    VAT_REG_THR: 90000, VAT_DEREG: 88000,
    SL: {
      1: { thr: 26065, rate: 0.09 },
      2: { thr: 28470, rate: 0.09 },
      4: { thr: 32745, rate: 0.09 },
      5: { thr: 25000, rate: 0.06 },
      PG: { thr: 21000, rate: 0.06 },
    },
    NLW_21: 12.21, NMW_18_20: 10.00, NMW_U18: 7.55, NMW_APP: 7.55,
    SSP_RATE: 118.75, SSP_PCT_CAP: null, SSP_QD: 3,
    SMP_LOWER: 187.18, SPP_RATE: 187.18, SAP_RATE: 187.18, SHPP_RATE: 187.18,
    LEL: 125, SSP_LEL: 125,
    REDUNDANCY_WEEK_CAP: 719,
    SCOT_STARTER_LIMIT: 15397, SCOT_BASIC_LIMIT: 27491,
    SCOT_INTER_LIMIT: 43662,   SCOT_HR_LIMIT: 125140,
    SCOT_HR: 0.42, SCOT_TOP: 0.48,
  },
  '2026/27': window.TAX,
};
window.TOOLS = [
  { id:'true-cost', cat:'Payroll', icon:'💷', title:'True Employment Cost Calculator', desc:'Gross → net or net → gross. Employee take-home, employer NI, pension, student loan, apprenticeship levy — every number in one place.', tags:['Gross→Net','Net→Gross','Employer cost','Pension'], badge:'tb-pop', badgeText:'Most used', color:'tc-blue', iconBg:'ti-blue' },
  { id:'payslip',   cat:'Payroll', icon:'🧾', title:'Payslip Generator & Verifier',    desc:'Verify or generate a payslip for any pay period. Full tax code support, NI categories, YTD figures, auto-enrolment and NHS pension — weekly to monthly.', tags:['Payslip','Tax code','PAYE','NHS pension'], badge:'tb-new', badgeText:'New', color:'tc-purple', iconBg:'ti-purple' },
  { id:'ssp',           cat:'Statutory',   icon:'🏥', title:'SSP Calculator',                       desc:'Statutory Sick Pay from day one at £123.25/week (or 80% of AWE if lower) for up to 28 weeks — 2026/27 rules, no waiting days.',                       tags:['Sickness','Qualifying days','PIWs'], badge:'tb-upd', badgeText:'2026/27', color:'tc-gold',   iconBg:'ti-gold'   },
  { id:'smp',           cat:'Statutory',   icon:'👶', title:'SMP Calculator',                       desc:'Statutory Maternity Pay — 90% AWE for 6 weeks, then £194.32 or 90% (whichever lower) for 33 weeks. Includes due-date and qualifying-week handling.',                tags:['Maternity','AWE','39 weeks'], badge:'tb-upd', badgeText:'2026/27', color:'tc-purple', iconBg:'ti-purple' },
  { id:'holiday',       cat:'Statutory',   icon:'🌴', title:'Holiday Pay Calculator',               desc:'Statutory holiday entitlement (5.6 weeks) and accrual for full-time, part-time and irregular-hours workers.',     tags:['28 days','Accrual','Part-time'], badge:'tb-new', badgeText:'New', color:'tc-green',  iconBg:'ti-green'  },
  { id:'redundancy',    cat:'Statutory',   icon:'📤', title:'Statutory Redundancy Pay Calculator', desc:'Age-banded weekly multiplier × capped weekly pay × completed years (max 20). Updated for 2026/27 cap.',           tags:['Statutory','Cap','Service'], badge:'tb-upd', badgeText:'2026/27', color:'tc-blue',   iconBg:'ti-blue'   },
  { id:'min-wage',      cat:'Compliance',  icon:'✅', title:'Minimum Wage Checker',                 desc:'Check whether an hourly rate meets NMW/NLW for the worker\'s age band — 2026/27 rates.',                 tags:['NLW','NMW','Compliance'], badge:'tb-upd', badgeText:'2026/27', color:'tc-green',  iconBg:'ti-green'  },
  { id:'apprenticeship',cat:'Compliance',  icon:'🎓', title:'Apprenticeship Levy Calculator',       desc:'0.5% of pay-bill over £3m equivalent — with the £15,000 annual allowance applied automatically.',                 tags:['0.5%','£15k allowance'], badge:'tb-new', badgeText:'New', color:'tc-blue',   iconBg:'ti-blue'   },
  { id:'cis',           cat:'Compliance',  icon:'🔨', title:'CIS Deduction Calculator',              desc:'Construction Industry Scheme: 20% verified, 30% unverified, 0% gross-payment — with materials excluded.',          tags:['20%','30%','Materials'], badge:'tb-new', badgeText:'New', color:'tc-gold',   iconBg:'ti-gold'   },
  { id:'corp',          cat:'Tax',         icon:'🏢', title:'Corporation Tax Calculator',           desc:'CT600 estimate including marginal relief between £50k and £250k, with associated-company scaling.',                tags:['Marginal relief','Associated cos','CT600'], badge:'tb-upd', badgeText:'2026/27', color:'tc-blue',   iconBg:'ti-blue'   },
  { id:'vat',           cat:'Tax',         icon:'🧾', title:'VAT Calculator',                        desc:'Add or remove VAT at 20%, 5% or 0% — with the net, VAT element and gross totals shown clearly.',                   tags:['20%','5%','0%'], badge:'tb-new', badgeText:'New', color:'tc-green',  iconBg:'ti-green'  },
  { id:'vat-flat',      cat:'Tax',         icon:'⚡', title:'Flat Rate VAT Calculator',              desc:'Compare standard VAT vs the Flat Rate Scheme for your sector — including the 1% first-year discount.',            tags:['FRS','Limited cost trader','1% relief'], badge:'tb-new', badgeText:'New', color:'tc-purple', iconBg:'ti-purple' },
  { id:'dividend',      cat:'Tax',         icon:'💰', title:'Dividend Tax Calculator',               desc:'Tax on dividend income alongside salary — with £500 allowance and 8.75%/33.75%/39.35% rates applied correctly.',  tags:['£500 allowance','8.75%/33.75%/39.35%'], badge:'tb-new', badgeText:'New', color:'tc-gold',   iconBg:'ti-gold'   },
  { id:'sal-vs-div',    cat:'Tax',         icon:'⚖️', title:'Salary vs Dividend Calculator',         desc:'For directors of limited companies: the optimal split between salary and dividends for 2026/27.',                 tags:['Director','Optimal split','Take-home'], badge:'tb-pop', badgeText:'Popular', color:'tc-blue',   iconBg:'ti-blue'   },
  { id:'self-assess',   cat:'Tax',         icon:'📋', title:'Self Assessment Calculator',            desc:'Sole-trader income tax, Class 2 & 4 NI and payments on account — for the 2026/27 return.',                         tags:['Sole trader','Class 2/4','POA'], badge:'tb-upd', badgeText:'2026/27', color:'tc-green',  iconBg:'ti-green'  },
  { id:'spp',           cat:'Statutory',   icon:'👨', title:'SPP Calculator',                         desc:'Statutory Paternity Pay — up to 2 weeks at £194.32 or 90% AWE (whichever lower).',                                          tags:['Paternity','2 weeks','AWE'],            badge:'tb-new', badgeText:'New',      color:'tc-blue',   iconBg:'ti-blue'   },
  { id:'sap',           cat:'Statutory',   icon:'🏡', title:'SAP Calculator',                         desc:'Statutory Adoption Pay — SMP structure for adoptive parents (39 weeks total).',                                       tags:['Adoption','39 weeks','AWE'],            badge:'tb-new', badgeText:'New',      color:'tc-green',  iconBg:'ti-green'  },
  { id:'shpp',          cat:'Statutory',   icon:'👪', title:'Shared Parental Pay Calculator',         desc:'Up to 37 weeks of shared parental pay divisible between parents at £194.32 or 90% AWE.',                             tags:['Shared parental','37 weeks','Split'],   badge:'tb-new', badgeText:'New',      color:'tc-purple', iconBg:'ti-purple' },
  { id:'marginal',      cat:'Tax',         icon:'📐', title:'Marginal Relief Calculator',             desc:'Standalone marginal-relief explorer for profits between £50,000 and £250,000 — the CT band.',                         tags:['MR fraction','£50k–£250k','26.5% eff'], badge:'tb-new', badgeText:'New',      color:'tc-purple', iconBg:'ti-purple' },
  { id:'nhs-true-cost',  cat:'Healthcare', icon:'💷', title:'NHS True Employment Cost Calculator',     desc:'Gross → net or net → gross for NHS staff. Employee take-home, NHS pension at your contribution tier, 14.38% employer pension and employer NI — full cost breakdown.',             tags:['NHS pension','Gross→Net','Net→Gross','14.38%'],             badge:'tb-new', badgeText:'New',     color:'tc-green',  iconBg:'ti-green'  },
  { id:'nhs-payslip',    cat:'Healthcare', icon:'🧾', title:'NHS Payslip Generator & Verifier',        desc:'Generate or verify a monthly NHS payslip. Annual pensionable pay sets your pension tier automatically. Full tax code, NI category and YTD support.',                             tags:['NHS payslip','Pension tier','Monthly','PAYE'],               badge:'tb-new', badgeText:'New',     color:'tc-purple', iconBg:'ti-purple' },
];
window.TOOL_CATS = ['All','Payroll','Statutory','Compliance','Tax','Healthcare'];
window.HMRC_FEED = [
  { pill:'Urgent',   pc:'hp-r', t:'Tax year 2026/27 has started — payroll software must be updated by 6 April 2026', d:'Updated 6 Apr 2026', m:'Payroll · Action required' },
  { pill:'Guidance', pc:'hp-b', t:'Class 1 employer NI remains at 15% above the £5,000 secondary threshold',          d:'Updated 4 Apr 2026', m:'Employer NI' },
  { pill:'Deadline', pc:'hp-a', t:'P11D and P11D(b) for 2025/26 benefits-in-kind — due 6 July 2026',                   d:'Updated 28 Mar 2026', m:'Benefits · Due 6 Jul' },
  { pill:'Update',   pc:'hp-g', t:'NLW for 21+ rises to £12.71/hour from 1 April 2026 (Low Pay Commission)',           d:'Updated 22 Mar 2026', m:'Minimum wage' },
  { pill:'Guidance', pc:'hp-b', t:'Making Tax Digital for Income Tax now applies to self-employed over £30k',          d:'Updated 18 Mar 2026', m:'MTD ITSA' },
];
window.SEED_POSTS = [
  { id:1, t:'2026/27 PAYE thresholds: what payroll teams need to update by 6 April', cat:'Payroll',         st:'Published', v:1247, d:'2026-04-02', e:'👥', r:5, body:'paye_2627' },
  { id:2, t:'Employer NI at 15%: the £5,000 threshold and your Employment Allowance',cat:'Payroll',         st:'Published', v:892,  d:'2026-03-22', e:'🏛',  r:4, body:'employer_ni' },
  { id:3, t:'MTD for Income Tax: who\'s in scope from April 2026',                   cat:'Self assessment', st:'Published', v:1543, d:'2026-03-15', e:'📋', r:6, body:'mtd_itsa' },
  { id:4, t:'Corporation tax marginal relief explained — with worked examples',     cat:'Corporation tax', st:'Published', v:734,  d:'2026-02-28', e:'🏢', r:5, body:'ct_marginal' },
  { id:5, t:'CIS verification: a contractor\'s practical checklist',                cat:'CIS',             st:'Published', v:478,  d:'2026-02-12', e:'🔨', r:7, body:'cis_check' },
  { id:6, t:'Salary or dividend? Director remuneration optimised for 2026/27',      cat:'Corporation tax', st:'Published', v:2109, d:'2026-02-01', e:'⚖️', r:8, body:'salary_div' },
  { id:7, t:'Statutory holiday pay for irregular-hours workers',                     cat:'Payroll',         st:'Published', v:445,  d:'2026-01-22', e:'🌴', r:4, body:'holiday' },
  { id:8, t:'NLW April 2026 — what\'s changing and the budget impact',               cat:'Payroll',         st:'Published', v:678,  d:'2026-01-08', e:'✅', r:4, body:'nlw' },
  { id:9, t:'VAT registration: should you cross the £90k threshold deliberately?',  cat:'VAT',             st:'Published', v:1021, d:'2025-12-18', e:'🧾', r:5, body:'vat_reg' },
];
window.POST_BODIES = {
  paye_2627: `
    <p>The 2026/27 UK tax year starts on 6 April 2026 and runs through 5 April 2027. Payroll software, HR systems and any internal calculators should be updated and tested <strong>before the first pay run</strong> of the new year.</p>
    <h2>What's changing</h2>
    <p>The headline thresholds are frozen until April 2028, so most of the work is recalibrating your software with the same numbers — but employer NI, statutory pay and minimum wage rates all move.</p>
    <ul>
      <li>Personal allowance: £12,570 (frozen)</li>
      <li>Basic-rate band: £12,571–£50,270</li>
      <li>Higher-rate band: £50,271–£125,140</li>
      <li>Employer NI: 15% above the £5,000 secondary threshold</li>
      <li>Employment Allowance: £10,500 for eligible employers</li>
      <li>NLW (21+): £12.71/hour from 1 April 2026</li>
    </ul>
    <div class="callout">💡 <strong>Action:</strong> If your payroll runs monthly, your first 2026/27 pay-period will hit RTI on or after 6 April. Don't include April 2026 pay in 2025/26 EPS — it's a common reconciliation error.</div>
    <h2>Operational checklist for 6 April</h2>
    <ol>
      <li>Confirm your payroll software has applied the 2026/27 tables.</li>
      <li>Roll forward employee tax codes — apply the L-suffix uplift if HMRC has issued P9X.</li>
      <li>Verify Employment Allowance eligibility for the new year (you must re-elect each year).</li>
      <li>Issue P60s for 2025/26 by 31 May 2026.</li>
      <li>Submit your final 2025/26 FPS/EPS by 19 April 2026.</li>
    </ol>
  `,
  employer_ni: `
    <p>Employer National Insurance has been the single biggest pay-bill change of the last two tax years. From April 2025 the rate rose to 15% and the secondary threshold (the wages level above which employer NI is charged) was cut from £9,100 to £5,000.</p>
    <h2>What the 15% / £5,000 rules mean in practice</h2>
    <p>For most full-time staff the increase is material. Take a £35,000 salary: employer NI for 2025/26 onwards is <strong>£4,500</strong> a year — compared with about £3,569 under the old £9,100 threshold and 13.8% rate.</p>
    <div class="callout">💡 The Employment Allowance was raised to £10,500 and the previous "£100k pay-bill" cap was scrapped. Most SMEs now get the full £10,500 reduction off their NI bill.</div>
    <h2>Who can't claim Employment Allowance</h2>
    <ul>
      <li>Companies with a single director and no other paid employees</li>
      <li>Public-sector employers (with limited exceptions)</li>
      <li>Connected companies (the allowance is shared)</li>
    </ul>
  `,
  mtd_itsa: `
    <p>Making Tax Digital for Income Tax Self Assessment (MTD ITSA) phases in from April 2026 — and unlike VAT MTD, this one introduces a fundamentally new filing rhythm.</p>
    <h2>Who's in scope from April 2026</h2>
    <p>Sole traders and landlords with combined gross income above <strong>£50,000</strong> are required to comply from 6 April 2026. The £30,000 threshold follows from April 2027 and £20,000 from April 2028.</p>
    <h2>What you actually have to do</h2>
    <ul>
      <li>Keep digital records of business income and expenses</li>
      <li>Submit a quarterly update to HMRC (1 per quarter, 4 a year)</li>
      <li>Submit a final declaration after the tax year ends</li>
    </ul>
    <p>If you currently file once a year on 31 January, you'll move to five submissions a year. The compliance overhead is real — pick MTD-compatible bookkeeping software early.</p>
  `,
  ct_marginal: `
    <p>Corporation tax has had three rates since April 2023: <strong>19% small profits</strong> rate (under £50,000), <strong>25% main rate</strong> (over £250,000), and a marginal relief band in between.</p>
    <h2>How marginal relief actually works</h2>
    <p>You first apply the 25% main rate to the entire taxable profit, then deduct marginal relief. The fraction is 3/200 — written as 6/400 in HMRC's manuals. The maths:</p>
    <blockquote>Marginal relief = (Upper limit − Profit) × (Standard fraction) × (Augmented profits / Profits)</blockquote>
    <p>For a company with profit of £150,000 and no associated companies:</p>
    <ul>
      <li>Main rate = £150,000 × 25% = £37,500</li>
      <li>Marginal relief = (£250,000 − £150,000) × 3/200 = £1,500</li>
      <li>CT due = £37,500 − £1,500 = <strong>£36,000</strong> (24% effective)</li>
    </ul>
    <div class="callout">💡 If you have <strong>associated companies</strong> (broadly: under common control), both thresholds are divided by the total count. Two associated companies means each only gets £25,000 / £125,000.</div>
  `,
  cis_check: `
    <p>CIS verification is the gate that determines whether you deduct 20%, 30% or nothing from a subcontractor's labour element. Get it wrong and you carry the deduction shortfall yourself.</p>
    <h2>The three deduction rates</h2>
    <ul>
      <li><strong>0% — gross payment status:</strong> verified subcontractor on HMRC's database meeting business, turnover and compliance tests.</li>
      <li><strong>20% — standard rate:</strong> registered subcontractor without gross status.</li>
      <li><strong>30% — higher rate:</strong> unregistered or unverified — the default if you can't confirm them with HMRC.</li>
    </ul>
    <h2>What's deducted from</h2>
    <p>Deduct from the <strong>labour portion only</strong> — materials, plant hire, fuel for plant, and VAT are excluded. Document the split on the payment statement.</p>
  `,
  salary_div: `
    <p>For owner-managed limited companies, the salary-vs-dividend split is the largest annual planning decision. The 2026/27 picture, with employer NI at 15% from £5,000, has shifted the optimum slightly compared to 2024/25.</p>
    <h2>The framework</h2>
    <ol>
      <li>Take a salary up to a sensible threshold for state-pension purposes</li>
      <li>Above that, dividends are usually cheaper — corporation tax is paid by the company, then dividend tax by you</li>
      <li>Cross-check against pension contributions and the £100,000 personal-allowance taper</li>
    </ol>
    <p>The exact crossover depends on whether you can claim the Employment Allowance. Use our <a onclick="navigate('calc','sal-vs-div')">salary vs dividend calculator</a> for your own numbers.</p>
  `,
  holiday: `
    <p>The "rolled-up holiday pay" reform brought in for irregular-hours and part-year workers makes accrual much simpler in practice — but it only applies to those workers, not standard fixed-hours staff.</p>
    <h2>Irregular-hours and part-year workers</h2>
    <p>Holiday pay can be calculated at <strong>12.07% of hours worked</strong> in each pay reference period, paid as it accrues. (12.07% = 5.6/46.4, the statutory weeks of leave divided by working weeks.)</p>
    <h2>Standard fixed-hours staff</h2>
    <p>Statutory minimum remains <strong>5.6 weeks per year</strong> (28 days for a 5-day worker, inclusive of bank holidays). Pay is calculated as a normal week's pay for each week of leave taken.</p>
  `,
  nlw: `
    <p>From 1 April 2026 the National Living Wage for workers aged 21 and over rises to £12.71/hour, following the Low Pay Commission's recommendation. The 18–20 rate moves to £10.50 and the 16–17 / apprentice rates align.</p>
    <h2>Budget impact for employers</h2>
    <p>A 21-year-old full-time worker (37.5h × 52 weeks) at NLW will cost £24,784 in base salary, plus ~£2,968 employer NI — a true cost of approximately £27,750.</p>
    <p>Combined with the 15% employer NI rate and £5,000 secondary threshold, employing minimum-wage staff is materially more expensive than in 2024.</p>
  `,
  vat_reg: `
    <p>The VAT registration threshold rose to £90,000 in April 2024 and remains there for 2026/27. For businesses approaching it, the question is no longer "should I avoid registering?" — it's "should I register strategically?"</p>
    <h2>When voluntary registration pays</h2>
    <ul>
      <li>You sell B2B to VAT-registered customers (they reclaim the VAT you charge)</li>
      <li>You have significant input VAT on stock or capital purchases</li>
      <li>You're heading above £90,000 anyway and want predictable pricing</li>
    </ul>
    <h2>When to stay below</h2>
    <p>Direct-to-consumer businesses generally hit a cliff edge at registration — you either raise prices by 20% or absorb the cost. The Flat Rate Scheme softens this but isn't a free lunch.</p>
  `,
};
window.CATEGORIES = ['Payroll','VAT','Self assessment','Corporation tax','CIS','Pension','Bookkeeping','Business advisory'];
window.FAQS = [
  { q:'How much do your services cost?',                              a:'All services are fixed-fee, agreed upfront before any work begins. We provide a clear written proposal after your free initial consultation — no surprises.' },
  { q:'Are your calculators free to use?',                            a:'Yes — every calculator on Sterling Tax Expert is free, with no registration. They are updated for the 2026/27 UK tax year and built on current HMRC rates.' },
  { q:'How quickly can you take over from my current accountant?',    a:'In most cases within 5 business days. We manage the handover end-to-end, liaising with your outgoing accountant directly.' },
  { q:'Do you support Making Tax Digital for Income Tax (MTD ITSA)?', a:'Yes. From April 2026 sole traders and landlords above £50,000 are in scope. We handle quarterly updates and final declarations, including software selection and onboarding.' },
  { q:'Where are you based — does it matter?',                        a:'We work with clients across the whole UK remotely via secure digital platforms. Location is not a constraint.' },
  { q:'How do I get started?',                                        a:'Book a free 30-minute consultation. We\'ll assess your situation, scope the right services and provide a fixed-fee proposal within 48 hours.' },
];
