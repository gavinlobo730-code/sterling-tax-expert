/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Data layer (UK 2026/27 tax year)
   ───────────────────────────────────────────────────────────
   Tax year 2026/27 runs 6 April 2026 → 5 April 2027.
   Most thresholds are frozen until April 2028 (per Autumn Budget).
   Statutory rates (NLW, SSP, SMP) are confirmed for 2026/27 (in force from 6 April 2026).
   ─────────────────────────────────────────────────────────── */

window.TAX_YEAR = '2026/27';
window.TAX_YEAR_LABEL = 'Updated for 2026/27 UK tax rules';
window.SELECTED_TAX_YEAR = '2026/27';

/* ── Income tax (England, Wales, NI) ── */
window.TAX = {
  // Personal allowance — frozen until April 2028
  PA: 12570,
  // Income tax bands (above PA)
  BR_LIMIT: 50270,   // basic rate up to
  HR_LIMIT: 125140,  // higher rate up to
  PA_TAPER_START: 100000, // £1 lost per £2 above
  BR: 0.20, HR: 0.40, AR: 0.45,

  // National Insurance — Class 1 (Employee)
  NI_PT: 12570,         // Primary threshold (annual)
  NI_UEL: 50270,        // Upper earnings limit
  NI_MAIN: 0.08,        // Main rate (post-Apr 2024 reduction held)
  NI_ADDL: 0.02,        // Above UEL

  // National Insurance — Class 1 (Employer)
  NI_ST: 5000,          // Secondary threshold (set Apr 2025)
  NI_ER: 0.15,          // Employer rate (set Apr 2025)
  EMPLOYMENT_ALLOWANCE: 10500, // for eligible employers

  // National Insurance — Class 2 & 4 (Self-employed) — 2026/27
  CLASS2_RATE: 3.65,    // £/week (voluntary above SPT) — 2026/27 rate
  CLASS2_SPT: 7105,     // Small profits threshold — 2026/27
  CLASS4_LPL: 12570,    // Lower profits limit
  CLASS4_UPL: 50270,    // Upper profits limit
  CLASS4_MAIN: 0.06,    // Main rate
  CLASS4_ADDL: 0.02,    // Above UPL

  // Dividend tax
  DIV_ALLOWANCE: 500,
  DIV_BR: 0.0875,       // 8.75%
  DIV_HR: 0.3375,       // 33.75%
  DIV_AR: 0.3935,       // 39.35%

  // Corporation tax
  CT_LOWER: 50000,      // Small profits ceiling
  CT_UPPER: 250000,     // Main rate floor
  CT_SMALL: 0.19,
  CT_MAIN: 0.25,
  CT_MR_FRACTION: 6 / 400, // marginal relief fraction = 3/200

  // VAT
  VAT_STD: 0.20,
  VAT_RED: 0.05,
  VAT_REG_THR: 90000,   // Registration threshold (set Apr 2024, held)
  VAT_DEREG: 88000,

  // Student loan thresholds (annual) — confirmed by GOV.UK SL3 deduction tables 2026/27
  SL: {
    1:  { thr: 26900, rate: 0.09 },  // Plan 1 — confirmed (was £26,065 in 2025/26)
    2:  { thr: 29385, rate: 0.09 },  // Plan 2 — confirmed (was £28,470 in 2025/26)
    4:  { thr: 33795, rate: 0.09 },  // Plan 4 (Scottish) — confirmed (was £32,745 in 2025/26)
    5:  { thr: 25000, rate: 0.06 },  // Plan 5 (post-Aug 2023) — confirmed frozen at £25,000
    PG: { thr: 21000, rate: 0.06 },  // Postgrad — confirmed frozen at £21,000
  },

  // National Minimum Wage (from 1 April 2026 — confirmed by SI 2026/357)
  NLW_21: 12.71,        // 21+ (National Living Wage) — confirmed
  NMW_18_20: 10.85,     // 18–20 — confirmed (was £10.50 in 2025/26)
  NMW_U18: 8.00,        // 16–17 — confirmed (was £7.55 in 2025/26)
  NMW_APP: 8.00,        // Apprentice (1st year or under 19) — confirmed (was £7.55 in 2025/26)

  // ── Statutory payments — 2026/27 (effective from 6 April 2026) ──
  // SSP reformed by the Employment Rights Act 2025:
  //   • No waiting days — payable from day 1 of incapacity.
  //   • No Lower Earnings Limit test — all employees qualify.
  //   • Weekly amount = LOWER of the flat rate or 80% of AWE.
  SSP_RATE: 123.25,     // £/week flat rate (2026/27)
  SSP_PCT_CAP: 0.80,    // SSP capped at 80% of AWE (whichever is lower)
  SSP_QD: 0,            // waiting days removed (was 3) — paid from day 1
  SSP_MAX_WEEKS: 28,
  SMP_HIGHER: 0.90,     // first 6 weeks at 90% AWE
  SMP_LOWER: 194.32,    // weeks 7–39: lower of 90% AWE or this (2026/27)
  SMP_WEEKS: 39,
  SPP_RATE: 194.32,     // Statutory Paternity (1–2 weeks) — 2026/27
  SAP_RATE: 194.32,     // Statutory Adoption (matches SMP structure) — 2026/27
  SHPP_RATE: 194.32,    // Shared Parental — 2026/27
  LEL: 129,             // Lower earnings limit £/week — SMP/SPP/SAP/ShPP qualification (2026/27)
  // NOTE: LEL no longer gates SSP eligibility (abolished for SSP from 6 Apr 2026).
  SSP_LEL: 129,         // retained for legacy references; not used to deny SSP

  // Auto-enrolment pension
  AE_LOWER: 6240,       // Qualifying earnings lower (frozen)
  AE_UPPER: 50270,      // Qualifying earnings upper (frozen)
  AE_EMP_MIN: 0.03,     // Min employer contribution
  AE_EE_MIN: 0.05,      // Min employee contribution (incl. tax relief)

  // Apprenticeship levy
  AL_RATE: 0.005,       // 0.5% of payroll
  AL_ALLOWANCE: 15000,  // annual allowance

  // CIS (Construction)
  CIS_STD: 0.20,        // standard deduction
  CIS_HIGH: 0.30,       // unverified subcontractor
  CIS_GROSS: 0,

  // Statutory redundancy (cap on weekly pay reviewed annually)
  REDUNDANCY_WEEK_CAP: 751,  // weekly pay cap from 6 Apr 2026 (Employment Rights (Increase of Limits) Order 2026)
  REDUNDANCY_MAX_YEARS: 20,

  // Holiday pay
  HOLIDAY_WEEKS: 5.6,    // statutory minimum (28 days for 5-day worker)

  // ── NHS Pension 2015 CARE Scheme ──────────────────────────
  // Contribution tiers: 6-tier structure effective 1 April 2024 (SI 2024/No.351).
  // No 2026/27 SI uprating announced at time of publication — tiers and rates shown
  // are 2024/25 confirmed figures pending any revaluation for 2026/27.
  NHS_PENSION_TIERS: [
    { to: 13259,    rate: 0.052 },
    { to: 28854,    rate: 0.065 },
    { to: 35155,    rate: 0.083 },
    { to: 52778,    rate: 0.098 },
    { to: 67668,    rate: 0.107 },
    { to: Infinity, rate: 0.125 },
  ],
  // Employer contribution: 23.7% — confirmed 2024/25 (SI 2023/1007).
  // No 2026/27 SI yet published; rate shown pending confirmation.
  NHS_ER_CONTRIB: 0.237,
  NHS_ACCRUAL_DENOM: 54,          // 1/54th CARE accrual
  NHS_CPI_ASSUMPTION: 0.025,      // 2.5% illustrative revaluation (not guaranteed)
  NHS_CPI_ABOVE: 0.015,           // CPI + 1.5% revaluation above CPI

  // Annual Allowance (confirmed — unchanged since April 2023)
  AA_STANDARD: 60000,
  AA_THRESHOLD_INCOME: 200000,    // taper starts if threshold income > this
  AA_ADJUSTED_INCOME: 260000,     // and adjusted income > this
  AA_MINIMUM: 10000,              // floor for tapered AA
  AA_TAPER_RATE: 0.5,             // £1 reduction per £2 of adjusted income above threshold
  AA_DB_FACTOR: 16,               // pension input = (annual pension increase) × 16

  // Scottish income tax 2026/27 — confirmed by Scottish Budget
  SCOT_STARTER_LIMIT: 15397,   // 19% starter rate up to (above PA)
  SCOT_BASIC_LIMIT:   27491,   // 20% basic rate up to
  SCOT_INTER_LIMIT:   43662,   // 21% intermediate rate up to
  SCOT_HR_LIMIT:     125140,   // 42% higher rate up to
  // Top rate: 48% above £125,140
  SCOT_STARTER: 0.19,
  SCOT_BASIC:   0.20,
  SCOT_INTER:   0.21,
  SCOT_HR:      0.42,
  SCOT_TOP:     0.48,
};

/* ── Historical tax year rates ─────────────────────────────
   Each entry overrides only the fields that differ from 2026/27.
   2022/23: NI changed twice mid-year — simplified annual rates used.
   2023/24: Employee NI cut to 10% from 6 Jan 2024 — simplified at 12%.
   ────────────────────────────────────────────────────────── */
window.TAX_RATES = {
  '2022/23': {
    ...window.TAX,
    // Income tax — additional rate threshold was still £150,000
    HR_LIMIT: 150000,
    // Employee NI — simplified: 13.25% Apr–Oct, 12% Nov–Apr; annual approx 12%
    NI_PT: 12570,
    NI_MAIN: 0.12,
    NI_ADDL: 0.02,
    // Employer NI — 15.05% Apr–Nov, 13.8% Nov–Apr; simplified at 13.8%
    NI_ST: 9100,
    NI_ER: 0.138,
    EMPLOYMENT_ALLOWANCE: 5000,
    // Class 4 — simplified; LPL was annualised £11,908 (PT rise mid-year)
    CLASS4_LPL: 11908,
    CLASS4_UPL: 50270,
    CLASS4_MAIN: 0.0925,  // simplified blend of 10.25% / 9.73%
    CLASS4_ADDL: 0.0275,
    CLASS2_RATE: 3.15,
    CLASS2_SPT: 6725,
    // Dividends
    DIV_ALLOWANCE: 2000,
    DIV_BR: 0.0875, DIV_HR: 0.3375, DIV_AR: 0.3935,
    // VAT
    VAT_REG_THR: 85000,
    VAT_DEREG: 83000,
    // Student loans
    SL: {
      1: { thr: 20195, rate: 0.09 },
      2: { thr: 27295, rate: 0.09 },
      4: { thr: 25375, rate: 0.09 },
      5: { thr: 25000, rate: 0.06 },
      PG: { thr: 21000, rate: 0.06 },
    },
    // NMW (from Apr 2022)
    NLW_21: 9.50, NMW_18_20: 9.18, NMW_U18: 6.83, NMW_APP: 4.81,
    // Statutory pay
    SSP_RATE: 99.35, SSP_PCT_CAP: null, SSP_QD: 3,
    SMP_LOWER: 156.66, SPP_RATE: 156.66, SAP_RATE: 156.66, SHPP_RATE: 156.66,
    LEL: 123, SSP_LEL: 123,
    REDUNDANCY_WEEK_CAP: 571,
    // Scottish income tax
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

/* ── Tool registry ─────────────────────────────────────────
   Every calculator that's fully implemented is listed here.
   Placeholder-only tools have been removed.
   ────────────────────────────────────────────────────────── */
window.TOOLS = [
  // Payroll
  { id:'true-cost', cat:'Payroll', icon:'💷', title:'True Employment Cost Calculator', desc:'Gross → net or net → gross. Employee take-home, employer NI, pension, student loan, apprenticeship levy — every number in one place.', tags:['Gross→Net','Net→Gross','Employer cost','Pension'], badge:'tb-pop', badgeText:'Most used', color:'tc-blue', iconBg:'ti-blue' },
  { id:'payslip',   cat:'Payroll', icon:'🧾', title:'Payslip Generator & Verifier',    desc:'Verify or generate a payslip for any pay period. Full tax code support, NI categories, YTD figures, auto-enrolment and NHS pension — weekly to monthly.', tags:['Payslip','Tax code','PAYE','NHS pension'], badge:'tb-new', badgeText:'New', color:'tc-purple', iconBg:'ti-purple' },

  // Statutory pay
  { id:'ssp',           cat:'Statutory',   icon:'🏥', title:'SSP Calculator',                       desc:'Statutory Sick Pay from day one at £123.25/week (or 80% of AWE if lower) for up to 28 weeks — 2026/27 rules, no waiting days.',                       tags:['Sickness','Qualifying days','PIWs'], badge:'tb-upd', badgeText:'2026/27', color:'tc-gold',   iconBg:'ti-gold'   },
  { id:'smp',           cat:'Statutory',   icon:'👶', title:'SMP Calculator',                       desc:'Statutory Maternity Pay — 90% AWE for 6 weeks, then £194.32 or 90% (whichever lower) for 33 weeks. Includes due-date and qualifying-week handling.',                tags:['Maternity','AWE','39 weeks'], badge:'tb-upd', badgeText:'2026/27', color:'tc-purple', iconBg:'ti-purple' },
  { id:'holiday',       cat:'Statutory',   icon:'🌴', title:'Holiday Pay Calculator',               desc:'Statutory holiday entitlement (5.6 weeks) and accrual for full-time, part-time and irregular-hours workers.',     tags:['28 days','Accrual','Part-time'], badge:'tb-new', badgeText:'New', color:'tc-green',  iconBg:'ti-green'  },
  { id:'redundancy',    cat:'Statutory',   icon:'📤', title:'Statutory Redundancy Pay Calculator', desc:'Age-banded weekly multiplier × capped weekly pay × completed years (max 20). Updated for 2026/27 cap.',           tags:['Statutory','Cap','Service'], badge:'tb-upd', badgeText:'2026/27', color:'tc-blue',   iconBg:'ti-blue'   },

  // Compliance
  { id:'min-wage',      cat:'Compliance',  icon:'✅', title:'Minimum Wage Checker',                 desc:'Check whether an hourly rate meets NMW/NLW for the worker\'s age band — 2026/27 rates.',                 tags:['NLW','NMW','Compliance'], badge:'tb-upd', badgeText:'2026/27', color:'tc-green',  iconBg:'ti-green'  },
  { id:'apprenticeship',cat:'Compliance',  icon:'🎓', title:'Apprenticeship Levy Calculator',       desc:'0.5% of pay-bill over £3m equivalent — with the £15,000 annual allowance applied automatically.',                 tags:['0.5%','£15k allowance'], badge:'tb-new', badgeText:'New', color:'tc-blue',   iconBg:'ti-blue'   },
  { id:'cis',           cat:'Compliance',  icon:'🔨', title:'CIS Deduction Calculator',              desc:'Construction Industry Scheme: 20% verified, 30% unverified, 0% gross-payment — with materials excluded.',          tags:['20%','30%','Materials'], badge:'tb-new', badgeText:'New', color:'tc-gold',   iconBg:'ti-gold'   },

  // Tax
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

  // Healthcare
  { id:'nhs-true-cost',  cat:'Healthcare', icon:'💷', title:'NHS True Employment Cost Calculator',     desc:'Gross → net or net → gross for NHS staff. Employee take-home, NHS pension at your contribution tier, 14.38% employer pension and employer NI — full cost breakdown.',             tags:['NHS pension','Gross→Net','Net→Gross','14.38%'],             badge:'tb-new', badgeText:'New',     color:'tc-green',  iconBg:'ti-green'  },
  { id:'nhs-payslip',    cat:'Healthcare', icon:'🧾', title:'NHS Payslip Generator & Verifier',        desc:'Generate or verify a monthly NHS payslip. Annual pensionable pay sets your pension tier automatically. Full tax code, NI category and YTD support.',                             tags:['NHS payslip','Pension tier','Monthly','PAYE'],               badge:'tb-new', badgeText:'New',     color:'tc-purple', iconBg:'ti-purple' },
];

window.TOOL_CATS = ['All','Payroll','Statutory','Compliance','Tax','Healthcare'];

/* ── HMRC headline rates (for tools hub widget) ─────────── */
window.RATES_HEADLINE = [
  { l:'Personal allowance',   r:'£12,570',         s:'Frozen until April 2028',     u:'2026/27' },
  { l:'Basic rate (20%)',     r:'£12,571–50,270',  s:'Income tax band',             u:'2026/27' },
  { l:'Higher rate (40%)',    r:'£50,271–125,140', s:'Income tax band',             u:'2026/27' },
  { l:'Additional rate (45%)',r:'£125,141+',       s:'Above £125,140',              u:'2026/27' },
  { l:'Employee NI (main)',   r:'8%',              s:'£12,570–£50,270/yr',          u:'2026/27' },
  { l:'Employer NI',          r:'15%',             s:'Above £5,000/yr',             u:'2026/27' },
  { l:'NLW (21+)',            r:'£12.71/hr',       s:'Confirmed — from 1 Apr 2026', u:'2026/27' },
  { l:'Corp tax (small)',     r:'19%',             s:'Profits up to £50,000',       u:'2026/27' },
  { l:'Corp tax (main)',      r:'25%',             s:'Profits above £250,000',      u:'2026/27' },
  { l:'VAT registration',     r:'£90,000',         s:'Annual turnover',             u:'2026/27' },
  { l:'Dividend allowance',   r:'£500',            s:'Per individual',              u:'2026/27' },
  { l:'AE pension band',      r:'£6,240–£50,270',  s:'Qualifying earnings',         u:'2026/27' },
];

/* ── HMRC updates feed ──────────────────────────────────── */
window.HMRC_FEED = [
  { pill:'Urgent',   pc:'hp-r', t:'Tax year 2026/27 has started — payroll software must be updated by 6 April 2026', d:'Updated 6 Apr 2026', m:'Payroll · Action required' },
  { pill:'Guidance', pc:'hp-b', t:'Class 1 employer NI remains at 15% above the £5,000 secondary threshold',          d:'Updated 4 Apr 2026', m:'Employer NI' },
  { pill:'Deadline', pc:'hp-a', t:'P11D and P11D(b) for 2025/26 benefits-in-kind — due 6 July 2026',                   d:'Updated 28 Mar 2026', m:'Benefits · Due 6 Jul' },
  { pill:'Update',   pc:'hp-g', t:'NLW for 21+ rises to £12.71/hour from 1 April 2026 (Low Pay Commission)',           d:'Updated 22 Mar 2026', m:'Minimum wage' },
  { pill:'Guidance', pc:'hp-b', t:'Making Tax Digital for Income Tax now applies to self-employed over £30k',          d:'Updated 18 Mar 2026', m:'MTD ITSA' },
];

/* ── Deadlines hub data (2026/27 dates) ─────────────────── */
window.DEADLINES = [
  // PAYE / Payroll
  { date:'2026-04-19', name:'P60s issued to employees',           cat:'PAYE',      desc:'Give every employee employed on 5 April 2026 their P60 by 31 May 2026.',           urgency:'amber' },
  { date:'2026-05-19', name:'Monthly PAYE & NIC payment',          cat:'PAYE',      desc:'For payroll period ending 5 May — postal payment due 19 May; electronic 22 May.',  urgency:'amber' },
  { date:'2026-05-31', name:'P60 final deadline',                  cat:'PAYE',      desc:'Last day to issue P60s for tax year 2025/26.',                                    urgency:'red' },
  { date:'2026-07-06', name:'P11D & P11D(b) submission',           cat:'PAYE',      desc:'Report 2025/26 benefits in kind and Class 1A NI to HMRC.',                        urgency:'red' },
  { date:'2026-07-19', name:'Class 1A NIC payment',                cat:'PAYE',      desc:'Pay Class 1A on P11D benefits — postal 19 July; electronic 22 July.',             urgency:'amber' },
  { date:'2026-06-22', name:'PAYE monthly (June)',                 cat:'PAYE',      desc:'Electronic payment due for May payroll.',                                         urgency:'blue'  },

  // VAT
  { date:'2026-05-07', name:'VAT return — Q1 (Mar y/e)',           cat:'VAT',       desc:'Quarterly VAT return and payment for businesses with March quarter end.',         urgency:'red'   },
  { date:'2026-08-07', name:'VAT return — Q2 (Jun y/e)',           cat:'VAT',       desc:'Quarterly VAT return and payment for businesses with June quarter end.',          urgency:'blue'  },
  { date:'2026-11-07', name:'VAT return — Q3 (Sep y/e)',           cat:'VAT',       desc:'Quarterly VAT return and payment for businesses with September quarter end.',     urgency:'blue'  },
  { date:'2027-02-07', name:'VAT return — Q4 (Dec y/e)',           cat:'VAT',       desc:'Quarterly VAT return and payment for businesses with December quarter end.',      urgency:'grey'  },

  // CIS
  { date:'2026-05-19', name:'CIS300 monthly return',                cat:'CIS',       desc:'Monthly Construction Industry Scheme return for April 2026.',                     urgency:'amber' },
  { date:'2026-06-19', name:'CIS300 monthly return',                cat:'CIS',       desc:'Monthly Construction Industry Scheme return for May 2026.',                       urgency:'blue'  },
  { date:'2026-07-19', name:'CIS300 monthly return',                cat:'CIS',       desc:'Monthly Construction Industry Scheme return for June 2026.',                      urgency:'blue'  },

  // Self assessment
  { date:'2026-07-31', name:'Second payment on account',            cat:'Self assessment', desc:'Second 2025/26 self-assessment payment on account.',                          urgency:'red'   },
  { date:'2026-10-05', name:'Register for self assessment',         cat:'Self assessment', desc:'Deadline to notify HMRC of new self-employment for 2025/26.',                 urgency:'amber' },
  { date:'2026-10-31', name:'Paper self assessment return',         cat:'Self assessment', desc:'Last day to file 2025/26 self assessment on paper.',                          urgency:'amber' },
  { date:'2027-01-31', name:'Self assessment — online filing',      cat:'Self assessment', desc:'Online filing and balancing payment for 2025/26 personal tax.',               urgency:'red'   },
];

/* ── Insights / Blog seed posts ── */
window.SEED_POSTS = [];
window.POST_BODIES = {};

window.CATEGORIES = ['Payroll','VAT','Self assessment','Corporation tax','CIS','Pension','Bookkeeping','Business advisory'];

/* ── Services ──────────────────────────────────────────── */
window.SVCS = [
  { icon:'👥', t:'Payroll services',    d:'RTI submissions, P60s, P45s and monthly payroll management for teams of any size — fully aligned with the 2026/27 rules.',          tags:['RTI filing','P60/P45','Auto-enrolment','PAYE'] },
  { icon:'🧾', t:'VAT returns',         d:'MTD-compliant VAT submissions, registration and quarterly filing handled end to end.',                                                  tags:['MTD','Quarterly filing','VAT registration','Flat rate'] },
  { icon:'📋', t:'Self assessment',     d:'Personal tax returns filed accurately, well before the 31 January deadline — including MTD ITSA preparation.',                          tags:['Sole traders','Directors','Landlords','MTD ITSA'] },
  { icon:'🏢', t:'Corporation tax',     d:'CT600 preparation, deductions strategy and HMRC liaison for limited companies — marginal relief modelled.',                            tags:['CT600','R&D claims','Marginal relief','HMRC liaison'] },
  { icon:'🔨', t:'CIS returns',         d:'CIS management for contractors and subcontractors. Monthly returns filed accurately with verification.',                                tags:['CIS300','Verification','Monthly filing'] },
  { icon:'🛡', t:'HMRC compliance',     d:'Proactive compliance reviews, audit support and enquiry handling.',                                                                     tags:['Audit support','Enquiry handling','Risk review'] },
  { icon:'🧮', t:'Bookkeeping',         d:'Monthly reconciliation, management accounts and cloud bookkeeping.',                                                                    tags:['Xero/QuickBooks','Reconciliation','Mgmt accounts'] },
  { icon:'📊', t:'Business advisory',   d:'Strategic financial guidance, cash flow forecasting and growth planning.',                                                              tags:['Cash flow','Growth strategy','Financial modelling'] },
];

/* ── FAQ ───────────────────────────────────────────────── */
window.FAQS = [
  { q:'How much do your services cost?',                              a:'All services are fixed-fee, agreed upfront before any work begins. We provide a clear written proposal after your free initial consultation — no surprises.' },
  { q:'Are your calculators free to use?',                            a:'Yes — every calculator on Sterling Tax Expert is free, with no registration. They are updated for the 2026/27 UK tax year and built on current HMRC rates.' },
  { q:'How quickly can you take over from my current accountant?',    a:'In most cases within 5 business days. We manage the handover end-to-end, liaising with your outgoing accountant directly.' },
  { q:'Do you support Making Tax Digital for Income Tax (MTD ITSA)?', a:'Yes. From April 2026 sole traders and landlords above £50,000 are in scope. We handle quarterly updates and final declarations, including software selection and onboarding.' },
  { q:'Where are you based — does it matter?',                        a:'We work with clients across the whole UK remotely via secure digital platforms. Location is not a constraint.' },
  { q:'How do I get started?',                                        a:'Book a free 30-minute consultation. We\'ll assess your situation, scope the right services and provide a fixed-fee proposal within 48 hours.' },
];
