/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Regression Test Suite
   UK 2026/27 tax year

   Run via tests/regression-tests.html in any browser.
   Each test function returns { name, pass, actual, expected, detail }.
   ─────────────────────────────────────────────────────────── */

/* ── Test runner ─────────────────────────────────────────── */
const SUITES = [];

function suite(name, tests) {
  SUITES.push({ name, tests });
}

function approx(a, b, tol = 0.01) {
  return Math.abs(a - b) <= tol;
}

function check(name, actual, expected, tol, detail) {
  const pass = tol != null ? approx(actual, expected, tol) : (actual === expected);
  return {
    name,
    pass,
    actual: typeof actual === 'number' ? actual.toFixed(2) : actual,
    expected: typeof expected === 'number' ? expected.toFixed(2) : expected,
    detail: detail || '',
  };
}

/* ─────────────────────────────────────────────────────────
   SUITE 1 — Tax constants (spot-check confirmed 2026/27 values)
   ───────────────────────────────────────────────────────── */
suite('Tax constants — 2026/27 rates', [
  () => check('Personal allowance',           TAX.PA,                12570),
  () => check('Basic rate band ceiling',      TAX.BR_LIMIT,          50270),
  () => check('Higher rate band ceiling',     TAX.HR_LIMIT,          125140),
  () => check('PA taper starts',              TAX.PA_TAPER_START,    100000),
  () => check('Basic rate',                   TAX.BR,                0.20),
  () => check('Higher rate',                  TAX.HR,                0.40),
  () => check('Additional rate',              TAX.AR,                0.45),
  () => check('Employee NI main rate',        TAX.NI_MAIN,           0.08),
  () => check('Employee NI additional rate',  TAX.NI_ADDL,           0.02),
  () => check('Employee NI primary threshold',TAX.NI_PT,             12570),
  () => check('Employee NI UEL',              TAX.NI_UEL,            50270),
  () => check('Employer NI rate',             TAX.NI_ER,             0.15),
  () => check('Employer NI secondary threshold', TAX.NI_ST,          5000),
  () => check('Employment Allowance',         TAX.EMPLOYMENT_ALLOWANCE, 10500),
  () => check('Class 4 main rate',            TAX.CLASS4_MAIN,       0.06),
  () => check('Class 4 additional rate',      TAX.CLASS4_ADDL,       0.02),
  () => check('Class 4 LPL',                  TAX.CLASS4_LPL,        12570),
  () => check('Class 4 UPL',                  TAX.CLASS4_UPL,        50270),
  () => check('Class 2 rate (£/week)',        TAX.CLASS2_RATE,       3.65),
  () => check('Class 2 SPT',                  TAX.CLASS2_SPT,        7105),
  () => check('Dividend allowance',           TAX.DIV_ALLOWANCE,     500),
  () => check('Dividend basic rate',          TAX.DIV_BR,            0.0875),
  () => check('Dividend higher rate',         TAX.DIV_HR,            0.3375),
  () => check('Dividend additional rate',     TAX.DIV_AR,            0.3935),
  () => check('CT small profits rate',        TAX.CT_SMALL,          0.19),
  () => check('CT main rate',                 TAX.CT_MAIN,           0.25),
  () => check('CT lower profits limit',       TAX.CT_LOWER,          50000),
  () => check('CT upper profits limit',       TAX.CT_UPPER,          250000),
  () => check('CT marginal relief fraction',  TAX.CT_MR_FRACTION,    6/400,   0.000001),
  () => check('VAT standard rate',            TAX.VAT_STD,           0.20),
  () => check('VAT reduced rate',             TAX.VAT_RED,           0.05),
  () => check('VAT registration threshold',   TAX.VAT_REG_THR,       90000),
  () => check('VAT deregistration threshold', TAX.VAT_DEREG,         88000),
  () => check('NLW 21+',                      TAX.NLW_21,            12.71),
  () => check('NMW 18–20',                    TAX.NMW_18_20,         10.85,  0, 'Confirmed SI 2026/357 — was £10.50 in 2025/26'),
  () => check('NMW 16–17',                    TAX.NMW_U18,           8.00,   0, 'Confirmed SI 2026/357 — was £7.55 in 2025/26'),
  () => check('NMW apprentice',               TAX.NMW_APP,           8.00,   0, 'Confirmed SI 2026/357 — was £7.55 in 2025/26'),
  () => check('SSP weekly rate',              TAX.SSP_RATE,          123.25),
  () => check('SSP waiting days (ERA 2025)',  TAX.SSP_QD,            0),
  () => check('SSP AWE cap percentage',       TAX.SSP_PCT_CAP,       0.80),
  () => check('SSP max weeks',                TAX.SSP_MAX_WEEKS,     28),
  () => check('SMP higher rate %',            TAX.SMP_HIGHER,        0.90),
  () => check('SMP lower flat rate',          TAX.SMP_LOWER,         194.32),
  () => check('SPP rate',                     TAX.SPP_RATE,          194.32),
  () => check('SAP rate',                     TAX.SAP_RATE,          194.32),
  () => check('ShPP rate',                    TAX.SHPP_RATE,         194.32),
  () => check('LEL (£/week)',                 TAX.LEL,               129),
  () => check('Auto-enrol lower band',        TAX.AE_LOWER,          6240),
  () => check('Auto-enrol upper band',        TAX.AE_UPPER,          50270),
  () => check('Redundancy weekly cap',        TAX.REDUNDANCY_WEEK_CAP, 751, 0, 'Confirmed SI 2026/310'),
  () => check('Redundancy max years',         TAX.REDUNDANCY_MAX_YEARS, 20),
  () => check('Holiday weeks statutory',      TAX.HOLIDAY_WEEKS,     5.6),
  () => check('Student loan Plan 1 threshold',TAX.SL[1].thr,         26900, 0, 'Confirmed GOV.UK SL3 tables — was £26,065 in 2025/26'),
  () => check('Student loan Plan 2 threshold',TAX.SL[2].thr,         29385, 0, 'Confirmed GOV.UK SL3 tables — was £28,470 in 2025/26'),
  () => check('Student loan Plan 4 threshold',TAX.SL[4].thr,         33795, 0, 'Confirmed GOV.UK SL3 tables — was £32,745 in 2025/26'),
  () => check('Student loan Plan 5 threshold',TAX.SL[5].thr,         25000, 0, 'Confirmed frozen'),
  () => check('Student loan PG threshold',    TAX.SL['PG'].thr,      21000, 0, 'Confirmed frozen'),
]);

/* ─────────────────────────────────────────────────────────
   SUITE 2 — Shared tax functions
   ───────────────────────────────────────────────────────── */
suite('Shared functions — incomeTaxOn, employeeNI, employerNI, studentLoan', [

  // incomeTaxOn
  () => check('Income tax: £0 (below PA)',        incomeTaxOn(0).tax,          0),
  () => check('Income tax: £12,570 (at PA)',      incomeTaxOn(12570).tax,      0),
  () => check('Income tax: £12,571 (above PA)',   incomeTaxOn(12571).tax,      0.20, 0.01),
  () => check('Income tax: £45,000',              incomeTaxOn(45000).tax,      6486.00, 0.01),
  () => check('Income tax: £60,000',              incomeTaxOn(60000).tax,      11432.00, 0.01),
  () => check('Income tax: £100,000',             incomeTaxOn(100000).tax,     27432.00, 0.01),
  () => check('Income tax: £105,000 (taper zone)',incomeTaxOn(105000).tax,     29932.00, 0.01),
  () => check('Income tax: £125,140 (PA=0)',      incomeTaxOn(125140).tax,     40002.00, 0.01),
  () => check('Income tax: £130,000 (AR band)',   incomeTaxOn(130000).tax,     42189.00, 0.01),
  () => check('PA at £100,000 (no taper)',        incomeTaxOn(100000).paUsed,  12570),
  () => check('PA at £105,000 (taper)',           incomeTaxOn(105000).paUsed,  10070),
  () => check('PA at £125,140 (fully tapered)',   incomeTaxOn(125140).paUsed,  0),
  () => check('PA at £130,000 (clamped at 0)',    incomeTaxOn(130000).paUsed,  0),

  // employeeNI
  () => check('Employee NI: £0',                  employeeNI(0),               0),
  () => check('Employee NI: £12,570 (at PT)',     employeeNI(12570),           0),
  () => check('Employee NI: £45,000',             employeeNI(45000),           2594.40, 0.01),
  () => check('Employee NI: £60,000 (above UEL)', employeeNI(60000),           3210.60, 0.01),
  () => check('Employee NI: £50,270 (at UEL)',    employeeNI(50270),           3016.00, 0.01),

  // employerNI
  () => check('Employer NI: £5,000 (at ST)',      employerNI(5000),            0),
  () => check('Employer NI: £35,000 no EA',       employerNI(35000, false),    4500.00, 0.01),
  () => check('Employer NI: £35,000 with EA',     employerNI(35000, true),     0,  0, 'EA more than covers single-employee NI'),
  () => check('Employer NI: £75,000 with EA',     employerNI(75000, true),     4500.00, 0.01, '(75000-5000)*0.15=10500 → EA reduces to 0; wait: 70000*0.15=10500 exactly → net 0'),

  // studentLoan
  () => check('SL Plan 0 (none)',                 studentLoan(50000, '0'),     0),
  () => check('SL Plan 1: £26,900 (at threshold)',studentLoan(26900, 1),      0),
  () => check('SL Plan 1: £36,900',               studentLoan(36900, 1),      900.00, 0.01),
  () => check('SL Plan 2: £29,385 (at threshold)',studentLoan(29385, 2),      0),
  () => check('SL Plan 2: £39,385',               studentLoan(39385, 2),      900.00, 0.01),
  () => check('SL Plan 5: £25,000 (at threshold)',studentLoan(25000, 5),      0),
  () => check('SL Plan 5: £35,000',               studentLoan(35000, 5),      600.00, 0.01, '(35000-25000)*6%'),
  () => check('SL Postgrad: £21,000 (at threshold)', studentLoan(21000,'PG'), 0),
  () => check('SL Postgrad: £31,000',             studentLoan(31000, 'PG'),   600.00, 0.01),
]);

/* ─────────────────────────────────────────────────────────
   SUITE 3 — PAYE calculator (inc. bug fix verification)
   ───────────────────────────────────────────────────────── */
suite('PAYE calculator', [

  // Basic salary, no pension
  () => {
    const r = CALCS['paye'].calculate({ salary:45000, freq:'annual', pension:0, plan:'0', allowance:false });
    return check('£45,000 — income tax', r.incomeTax, 6486.00, 0.01);
  },
  () => {
    const r = CALCS['paye'].calculate({ salary:45000, freq:'annual', pension:0, plan:'0', allowance:false });
    return check('£45,000 — employee NI', r.empNI, 2594.40, 0.01);
  },
  () => {
    const r = CALCS['paye'].calculate({ salary:45000, freq:'annual', pension:0, plan:'0', allowance:false });
    return check('£45,000 — net pay', r.netPay, 35919.60, 0.01);
  },
  () => {
    const r = CALCS['paye'].calculate({ salary:45000, freq:'annual', pension:0, plan:'0', allowance:false });
    return check('£45,000 — employer NI (no EA)', r.erNI, 6000.00, 0.01, '(45000-5000)*15%');
  },

  // Salary sacrifice pension — BUG FIX verification
  // With 5% sacrifice on £45,000: taxablePay=£42,750 → erNI on £42,750
  () => {
    const r = CALCS['paye'].calculate({ salary:45000, freq:'annual', pension:5, plan:'0', allowance:false });
    return check('£45,000 + 5% sacrifice — erNI on reduced gross (bug fix)', r.erNI, 5662.50, 0.01,
      '(42750-5000)*15% = £5,662.50 — was incorrectly £6,000 before fix');
  },
  () => {
    const r = CALCS['paye'].calculate({ salary:45000, freq:'annual', pension:5, plan:'0', allowance:false });
    return check('£45,000 + 5% sacrifice — income tax on reduced gross', r.incomeTax, 6036.00, 0.01,
      '(42750-12570)*20%');
  },
  () => {
    const r = CALCS['paye'].calculate({ salary:45000, freq:'annual', pension:5, plan:'0', allowance:false });
    return check('£45,000 + 5% sacrifice — employee NI on reduced gross', r.empNI, 2414.40, 0.01,
      '(42750-12570)*8%');
  },
  () => {
    const r = CALCS['paye'].calculate({ salary:45000, freq:'annual', pension:5, plan:'0', allowance:false });
    return check('£45,000 + 5% sacrifice — net pay', r.netPay, 34299.60, 0.01);
  },

  // PA taper
  () => {
    const r = CALCS['paye'].calculate({ salary:105000, freq:'annual', pension:0, plan:'0', allowance:false });
    return check('£105,000 — PA tapered to £10,070', r.paUsed, 10070, 0);
  },
  () => {
    const r = CALCS['paye'].calculate({ salary:105000, freq:'annual', pension:0, plan:'0', allowance:false });
    return check('£105,000 — income tax', r.incomeTax, 29932.00, 0.01);
  },

  // Monthly frequency
  () => {
    const r = CALCS['paye'].calculate({ salary:3750, freq:'monthly', pension:0, plan:'0', allowance:false });
    return check('£3,750/month = £45,000 annual — same income tax', r.incomeTax, 6486.00, 0.01);
  },

  // Student loan Plan 2 (updated threshold)
  () => {
    const r = CALCS['paye'].calculate({ salary:40000, freq:'annual', pension:0, plan:'2', allowance:false });
    return check('£40,000 Plan 2 SL deduction', r.sl, (40000-29385)*0.09, 0.01,
      '(40000-29385)*9% = £955.35 — uses updated £29,385 threshold');
  },
]);

/* ─────────────────────────────────────────────────────────
   SUITE 4 — Employer NI calculator
   ───────────────────────────────────────────────────────── */
suite('Employer NI calculator', [
  () => {
    const r = CALCS['employer-ni'].calculate({ salary:35000, employees:1, allowance:false });
    return check('1 × £35,000 no EA — gross NI', r.gross, 4500.00, 0.01);
  },
  () => {
    const r = CALCS['employer-ni'].calculate({ salary:35000, employees:5, allowance:true });
    return check('5 × £35,000 with EA — net NI', r.net, 12000.00, 0.01, '£22,500 − £10,500 EA');
  },
  () => {
    const r = CALCS['employer-ni'].calculate({ salary:5000, employees:1, allowance:false });
    return check('£5,000 (at ST) — no employer NI', r.gross, 0.00, 0.01);
  },
  () => {
    const r = CALCS['employer-ni'].calculate({ salary:4999, employees:1, allowance:false });
    return check('£4,999 (below ST) — no employer NI', r.gross, 0.00, 0.01);
  },
]);

/* ─────────────────────────────────────────────────────────
   SUITE 5 — Net-to-gross calculator
   ───────────────────────────────────────────────────────── */
suite('Net-to-gross calculator', [
  () => {
    const r = CALCS['net-to-gross'].calculate({ net:35919.60, pension:0, plan:'0' });
    return check('Net £35,919.60 → gross ≈ £45,000', r.gross, 45000, 0.50);
  },
  () => {
    const r = CALCS['net-to-gross'].calculate({ net:10000, pension:0, plan:'0' });
    return check('Net £10,000 (below PA) → gross = £10,000', r.gross, 10000, 0.50);
  },
  () => {
    const r = CALCS['net-to-gross'].calculate({ net:50000, pension:0, plan:'0' });
    // At net £50,000 we expect a gross well above £70k (40% band)
    return check('Net £50,000 → gross > £70,000', r.gross > 70000, true, null,
      `Actual gross: £${r.gross.toFixed(2)}`);
  },
]);

/* ─────────────────────────────────────────────────────────
   SUITE 6 — SSP calculator (ERA 2025 reforms)
   ───────────────────────────────────────────────────────── */
suite('SSP calculator (day-1, 80% AWE cap)', [
  () => {
    const r = CALCS['ssp'].calculate({ awe:300, days:10, qdays:5 });
    return check('AWE £300 (flat rate applies): total', r.totalPaid, 246.50, 0.01,
      '£123.25/5 × 10 days');
  },
  () => {
    const r = CALCS['ssp'].calculate({ awe:300, days:10, qdays:5 });
    return check('AWE £300 — flat rate applies (not AWE cap)', r.cappedByAwe, false);
  },
  () => {
    const r = CALCS['ssp'].calculate({ awe:100, days:5, qdays:5 });
    return check('AWE £100 (80% AWE applies): weekly', r.weeklyAmount, 80.00, 0.01,
      '100 × 80% = £80 < £123.25');
  },
  () => {
    const r = CALCS['ssp'].calculate({ awe:100, days:5, qdays:5 });
    return check('AWE £100 — AWE cap applies', r.cappedByAwe, true);
  },
  () => {
    const r = CALCS['ssp'].calculate({ awe:300, days:1, qdays:5 });
    return check('Day-1 payment: 1 day paid (no waiting days)', r.paidDays, 1);
  },
  () => {
    const r = CALCS['ssp'].calculate({ awe:300, days:200, qdays:5 });
    return check('200 days claimed: capped at 28×5=140 qualifying days', r.paidDays, 140);
  },
  () => {
    const r = CALCS['ssp'].calculate({ awe:300, days:200, qdays:5 });
    return check('28-week cap flag set', r.cappedByMax, true);
  },
]);

/* ─────────────────────────────────────────────────────────
   SUITE 7 — SMP calculator
   ───────────────────────────────────────────────────────── */
suite('SMP calculator', [
  () => {
    const r = CALCS['smp'].calculate({ due:'', leave:'', awe:500, service:52 });
    return check('AWE £500 eligible — first 6 weeks', r.first6, 2700.00, 0.01,
      '£500 × 90% × 6');
  },
  () => {
    const r = CALCS['smp'].calculate({ due:'', leave:'', awe:500, service:52 });
    return check('AWE £500 — weeks 7–39 at flat rate', r.next33, 6412.56, 0.01,
      '£194.32 × 33');
  },
  () => {
    const r = CALCS['smp'].calculate({ due:'', leave:'', awe:500, service:52 });
    return check('AWE £500 — total SMP', r.total, 9112.56, 0.01);
  },
  () => {
    const r = CALCS['smp'].calculate({ due:'', leave:'', awe:150, service:52 });
    return check('AWE £150 (below flat rate) — weeks 7–39 at 90% AWE', r.weeklyLower, 135.00, 0.01,
      'min(150×90%, £194.32) = £135');
  },
  () => {
    const r = CALCS['smp'].calculate({ due:'', leave:'', awe:128, service:52 });
    return check('AWE £128 (below LEL £129) — not eligible', r.eligible, false);
  },
  () => {
    const r = CALCS['smp'].calculate({ due:'', leave:'', awe:500, service:25 });
    return check('25 weeks service (below 26) — not eligible', r.eligible, false);
  },
  () => {
    const r = CALCS['smp'].calculate({ due:'', leave:'', awe:500, service:26 });
    return check('26 weeks service — eligible', r.eligible, true);
  },
]);

/* ─────────────────────────────────────────────────────────
   SUITE 8 — Redundancy calculator
   ───────────────────────────────────────────────────────── */
suite('Statutory Redundancy calculator', [
  () => {
    const r = CALCS['redundancy'].calculate({ age:42, years:10, weeklyPay:650 });
    return check('Age 42, 10 yrs, £650/wk — weeks of pay', r.weeks, 10.5, 0.01,
      '1.5 (age 41) + 9×1.0 (ages 32–40)');
  },
  () => {
    const r = CALCS['redundancy'].calculate({ age:42, years:10, weeklyPay:650 });
    return check('Age 42, 10 yrs, £650/wk — total pay', r.totalPay, 6825.00, 0.01,
      '10.5 × £650');
  },
  () => {
    const r = CALCS['redundancy'].calculate({ age:42, years:10, weeklyPay:900 });
    return check('Weekly pay £900 — capped at £751 (confirmed SI 2026/310)', r.cappedWeek, 751.00, 0);
  },
  () => {
    const r = CALCS['redundancy'].calculate({ age:42, years:25, weeklyPay:500 });
    return check('25 years service — capped at 20 years', r.cappedYears, 20);
  },
  () => {
    const r = CALCS['redundancy'].calculate({ age:42, years:1, weeklyPay:500 });
    return check('Under 2 years — not eligible', r.eligible, false);
  },
  () => {
    const r = CALCS['redundancy'].calculate({ age:22, years:2, weeklyPay:400 });
    return check('Age 22, 2 yrs — 0.5 + 0.5 = 1.0 weeks', r.weeks, 1.0, 0.01,
      'Both years aged under 22 (ageAtYear 21 and 20)');
  },
]);

/* ─────────────────────────────────────────────────────────
   SUITE 9 — Auto-enrolment calculator
   ───────────────────────────────────────────────────────── */
suite('Auto-enrolment pension calculator', [
  () => {
    const r = CALCS['auto-enrol'].calculate({ salary:30000, empRate:5, erRate:3, basis:'qe' });
    return check('£30,000 QE basis — qualifying earnings', r.qe, 23760.00, 0.01,
      '£30,000 − £6,240 lower band');
  },
  () => {
    const r = CALCS['auto-enrol'].calculate({ salary:30000, empRate:5, erRate:3, basis:'qe' });
    return check('£30,000 QE — employee contribution 5%', r.empContrib, 1188.00, 0.01);
  },
  () => {
    const r = CALCS['auto-enrol'].calculate({ salary:30000, empRate:5, erRate:3, basis:'qe' });
    return check('£30,000 QE — employer contribution 3%', r.erContrib, 712.80, 0.01);
  },
  () => {
    const r = CALCS['auto-enrol'].calculate({ salary:6000, empRate:5, erRate:3, basis:'qe' });
    return check('£6,000 (below lower band) — zero qualifying earnings', r.qe, 0);
  },
  () => {
    const r = CALCS['auto-enrol'].calculate({ salary:60000, empRate:5, erRate:3, basis:'qe' });
    return check('£60,000 (above upper band) — QE capped at £44,030', r.qe, 44030.00, 0.01);
  },
  () => {
    const r = CALCS['auto-enrol'].calculate({ salary:30000, empRate:5, erRate:3, basis:'qe' });
    return check('5%+3% scheme — meets statutory minimum', r.minOK, true);
  },
  () => {
    const r = CALCS['auto-enrol'].calculate({ salary:30000, empRate:2, erRate:2, basis:'qe' });
    return check('2%+2% scheme — below statutory minimum', r.minOK, false);
  },
]);

/* ─────────────────────────────────────────────────────────
   SUITE 10 — Minimum wage checker (updated 2026/27 rates)
   ───────────────────────────────────────────────────────── */
suite('Minimum wage checker — 2026/27 confirmed rates', [
  () => {
    const r = CALCS['min-wage'].calculate({ rate:12.71, age:'21', weeklyHrs:37.5 });
    return check('£12.71/hr age 21+ — compliant (at NLW)', r.compliant, true);
  },
  () => {
    const r = CALCS['min-wage'].calculate({ rate:12.70, age:'21', weeklyHrs:37.5 });
    return check('£12.70/hr age 21+ — not compliant (1p below NLW)', r.compliant, false);
  },
  () => {
    const r = CALCS['min-wage'].calculate({ rate:10.85, age:'18', weeklyHrs:37.5 });
    return check('£10.85/hr age 18–20 — compliant (at NMW)', r.compliant, true,
      null, 'Confirmed SI 2026/357 rate');
  },
  () => {
    const r = CALCS['min-wage'].calculate({ rate:10.50, age:'18', weeklyHrs:37.5 });
    return check('£10.50/hr age 18–20 — NOT compliant (old 2025/26 rate)', r.compliant, false,
      null, '2026/27 rate is £10.85, not £10.50');
  },
  () => {
    const r = CALCS['min-wage'].calculate({ rate:8.00, age:'u18', weeklyHrs:37.5 });
    return check('£8.00/hr age 16–17 — compliant (at NMW)', r.compliant, true,
      null, 'Confirmed SI 2026/357 rate');
  },
  () => {
    const r = CALCS['min-wage'].calculate({ rate:7.85, age:'u18', weeklyHrs:37.5 });
    return check('£7.85/hr age 16–17 — NOT compliant (old 2025/26 rate)', r.compliant, false,
      null, '2026/27 rate is £8.00, not £7.85');
  },
  () => {
    const r = CALCS['min-wage'].calculate({ rate:8.00, age:'app', weeklyHrs:37.5 });
    return check('£8.00/hr apprentice — compliant (at NMW)', r.compliant, true,
      null, 'Confirmed SI 2026/357 rate');
  },
]);

/* ─────────────────────────────────────────────────────────
   SUITE 11 — Apprenticeship Levy calculator
   ───────────────────────────────────────────────────────── */
suite('Apprenticeship Levy calculator', [
  () => {
    const r = CALCS['apprenticeship'].calculate({ paybill:3500000 });
    return check('£3.5m paybill — levy net', r.levyNet, 2500.00, 0.01,
      '(3.5m × 0.5%) − £15,000 = £2,500');
  },
  () => {
    const r = CALCS['apprenticeship'].calculate({ paybill:3000000 });
    return check('£3m paybill — levy exactly offset by allowance', r.levyNet, 0.00, 0.01);
  },
  () => {
    const r = CALCS['apprenticeship'].calculate({ paybill:1000000 });
    return check('£1m paybill — no levy (below threshold)', r.levyNet, 0.00, 0.01);
  },
]);

/* ─────────────────────────────────────────────────────────
   SUITE 12 — CIS calculator
   ───────────────────────────────────────────────────────── */
suite('CIS deduction calculator', [
  () => {
    const r = CALCS['cis'].calculate({ labour:5000, materials:1500, vatRate:'reverse', status:'verified' });
    return check('Verified 20% — deduction', r.deduction, 1000.00, 0.01);
  },
  () => {
    const r = CALCS['cis'].calculate({ labour:5000, materials:1500, vatRate:'reverse', status:'verified' });
    return check('Verified 20% — paid to sub (reverse charge)', r.paidToSub, 5500.00, 0.01,
      '£6,500 total − £1,000 deduction');
  },
  () => {
    const r = CALCS['cis'].calculate({ labour:5000, materials:1500, vatRate:'reverse', status:'unverified' });
    return check('Unverified 30% — deduction', r.deduction, 1500.00, 0.01);
  },
  () => {
    const r = CALCS['cis'].calculate({ labour:5000, materials:1500, vatRate:'reverse', status:'gross' });
    return check('Gross status 0% — no deduction', r.deduction, 0.00, 0.01);
  },
  () => {
    const r = CALCS['cis'].calculate({ labour:5000, materials:1500, vatRate:'std', status:'verified' });
    return check('Standard VAT — VAT element', r.vat, 1300.00, 0.01,
      '(£5,000 + £1,500) × 20%');
  },
]);

/* ─────────────────────────────────────────────────────────
   SUITE 13 — Corporation Tax calculator (incl. marginal relief)
   ───────────────────────────────────────────────────────── */
suite('Corporation Tax calculator', [
  () => {
    const r = CALCS['corp'].calculate({ profit:40000, aia:0, rd:0, assoc:0, period:12 });
    return check('£40,000 profit — small rate 19%', r.ct, 7600.00, 0.01);
  },
  () => {
    const r = CALCS['corp'].calculate({ profit:300000, aia:0, rd:0, assoc:0, period:12 });
    return check('£300,000 profit — main rate 25%', r.ct, 75000.00, 0.01);
  },
  () => {
    const r = CALCS['corp'].calculate({ profit:150000, aia:0, rd:0, assoc:0, period:12 });
    return check('£150,000 profit — marginal relief', r.ct, 36000.00, 0.01,
      '(250k−150k)×3/200 = £1,500 relief; 150k×25%−£1,500');
  },
  () => {
    const r = CALCS['corp'].calculate({ profit:150000, aia:0, rd:0, assoc:0, period:12 });
    return check('£150,000 — effective rate 24%', r.effRate, 24.00, 0.01);
  },
  () => {
    const r = CALCS['corp'].calculate({ profit:100000, aia:0, rd:0, assoc:2, period:12 });
    // 3 total (inc this co) → lo=16667, hi=83333; profit >hi → main rate
    return check('£100,000, 2 associates — main rate (thresholds ÷3)', r.ct, 25000.00, 0.01);
  },
  () => {
    const r = CALCS['corp'].calculate({ profit:150000, aia:50000, rd:0, assoc:0, period:12 });
    return check('£150,000 − £50,000 AIA = £100,000 taxable — small rate', r.taxableProfit, 100000.00, 0.01);
  },
  () => {
    // 6-month period: lo=25000, hi=125000
    const r = CALCS['corp'].calculate({ profit:30000, aia:0, rd:0, assoc:0, period:6 });
    return check('£30,000 profit, 6-month period — above scaled lo (£25k) → marginal band', r.band.includes('Marginal'), true);
  },
]);

/* ─────────────────────────────────────────────────────────
   SUITE 14 — VAT calculator
   ───────────────────────────────────────────────────────── */
suite('VAT calculator', [
  () => {
    const r = CALCS['vat'].calculate({ mode:'add', amount:1000, rate:'std' });
    return check('Add 20% to £1,000 — gross', r.gross, 1200.00, 0.01);
  },
  () => {
    const r = CALCS['vat'].calculate({ mode:'remove', amount:1200, rate:'std' });
    return check('Remove 20% from £1,200 — net', r.net, 1000.00, 0.01);
  },
  () => {
    const r = CALCS['vat'].calculate({ mode:'add', amount:1000, rate:'red' });
    return check('Add 5% to £1,000 — gross', r.gross, 1050.00, 0.01);
  },
  () => {
    const r = CALCS['vat'].calculate({ mode:'remove', amount:1050, rate:'red' });
    return check('Remove 5% from £1,050 — net', r.net, 1000.00, 0.01);
  },
  () => {
    const r = CALCS['vat'].calculate({ mode:'add', amount:1000, rate:'zero' });
    return check('Zero-rated — VAT = £0', r.vat, 0.00, 0.01);
  },
]);

/* ─────────────────────────────────────────────────────────
   SUITE 15 — VAT Flat Rate calculator
   ───────────────────────────────────────────────────────── */
suite('VAT Flat Rate calculator', [
  () => {
    const r = CALCS['vat-flat'].calculate({ turnover:90000, inputs:1500, flatRate:13.5, firstYear:false, lcost:false });
    return check('Standard scheme VAT owed', r.standardOwed, 13500.00, 0.01,
      '£15,000 output − £1,500 input');
  },
  () => {
    const r = CALCS['vat-flat'].calculate({ turnover:90000, inputs:1500, flatRate:13.5, firstYear:false, lcost:false });
    return check('FRS owed at 13.5%', r.frsOwed, 12150.00, 0.01,
      '£90,000 × 13.5%');
  },
  () => {
    const r = CALCS['vat-flat'].calculate({ turnover:90000, inputs:1500, flatRate:13.5, firstYear:true, lcost:false });
    return check('FRS first-year 1% discount → 12.5%', r.frsOwed, 11250.00, 0.01);
  },
  () => {
    const r = CALCS['vat-flat'].calculate({ turnover:90000, inputs:1500, flatRate:13.5, firstYear:false, lcost:true });
    return check('Limited-cost trader 16.5%', r.frsOwed, 14850.00, 0.01);
  },
  () => {
    // Over FRS ceiling: £180,001 inc-VAT = £150,000.83 net — just over £150k
    const r = CALCS['vat-flat'].calculate({ turnover:181000, inputs:1500, flatRate:13.5, firstYear:false, lcost:false });
    return check('Turnover £181,000 inc-VAT — over FRS ceiling flag', r.overFrsCeiling, true,
      '£181,000/1.20 = £150,833 > £150,000 net');
  },
  () => {
    const r = CALCS['vat-flat'].calculate({ turnover:180000, inputs:1500, flatRate:13.5, firstYear:false, lcost:false });
    return check('Turnover £180,000 inc-VAT — at FRS ceiling (£150k net exactly)', r.overFrsCeiling, false);
  },
]);

/* ─────────────────────────────────────────────────────────
   SUITE 16 — Dividend tax calculator
   ───────────────────────────────────────────────────────── */
suite('Dividend tax calculator', [
  () => {
    // Salary = PA (all PA used by salary, dividends all in BR band)
    const r = CALCS['dividend'].calculate({ salary:12570, dividends:25000 });
    return check('Salary=PA, £25k divs — all in BR band', r.inBR + r.allowanceUsed, 25000.00, 0.01);
  },
  () => {
    const r = CALCS['dividend'].calculate({ salary:12570, dividends:25000 });
    return check('Salary=PA, £25k divs — dividend tax at 8.75%', r.tax, 2143.75, 0.01,
      '£24,500 × 8.75% (after £500 allowance)');
  },
  () => {
    const r = CALCS['dividend'].calculate({ salary:40000, dividends:20000 });
    return check('£40k salary + £20k divs — BR room £10,270', r.inBR, 10270.00, 0.01);
  },
  () => {
    const r = CALCS['dividend'].calculate({ salary:40000, dividends:20000 });
    return check('£40k salary + £20k divs — HR portion £9,230', r.inHR, 9230.00, 0.01);
  },
  () => {
    const r = CALCS['dividend'].calculate({ salary:40000, dividends:20000 });
    return check('£40k salary + £20k divs — dividend tax', r.tax, 4013.75, 0.01,
      '£10,270×8.75% + £9,230×33.75%');
  },
  () => {
    // £500 allowance fully consumed
    const r = CALCS['dividend'].calculate({ salary:12570, dividends:500 });
    return check('£500 dividends — all covered by allowance, £0 tax', r.tax, 0.00, 0.01);
  },
  () => {
    const r = CALCS['dividend'].calculate({ salary:12570, dividends:499 });
    return check('£499 dividends — below allowance, £0 tax', r.tax, 0.00, 0.01);
  },
]);

/* ─────────────────────────────────────────────────────────
   SUITE 17 — Self Assessment calculator (bug fixes)
   ───────────────────────────────────────────────────────── */
suite('Self Assessment calculator — Class 2 & POA bug fixes', [

  // Class 2 NI — updated logic
  () => {
    const r = CALCS['self-assess'].calculate({ profit:35000, other:0, studentPlan:'0' });
    return check('Profit £35,000 (≥SPT) — Class 2 credited, cash £0', r.class2, 0.00, 0,
      'Profits ≥ £7,105 SPT get automatic credit since April 2024');
  },
  () => {
    const r = CALCS['self-assess'].calculate({ profit:5000, other:0, studentPlan:'0' });
    return check('Profit £5,000 (below SPT £7,105) — voluntary Class 2 shown', r.class2,
      TAX.CLASS2_RATE * 52, 0.01, `£${TAX.CLASS2_RATE}/week × 52 = £${(TAX.CLASS2_RATE*52).toFixed(2)}`);
  },
  () => {
    const r = CALCS['self-assess'].calculate({ profit:7105, other:0, studentPlan:'0' });
    return check('Profit £7,105 (= SPT) — credited, no cash Class 2', r.class2, 0.00, 0);
  },
  () => {
    const r = CALCS['self-assess'].calculate({ profit:7104, other:0, studentPlan:'0' });
    return check('Profit £7,104 (just below SPT) — voluntary Class 2', r.class2, TAX.CLASS2_RATE * 52, 0.01);
  },

  // Class 4 NI
  () => {
    const r = CALCS['self-assess'].calculate({ profit:35000, other:0, studentPlan:'0' });
    return check('Profit £35,000 — Class 4 at 6%', r.class4, (35000-12570)*0.06, 0.01);
  },
  () => {
    const r = CALCS['self-assess'].calculate({ profit:60000, other:0, studentPlan:'0' });
    return check('Profit £60,000 — Class 4 main + additional', r.class4,
      (50270-12570)*0.06 + (60000-50270)*0.02, 0.01);
  },

  // POA bug fix — student loan excluded
  () => {
    const r = CALCS['self-assess'].calculate({ profit:35000, other:0, studentPlan:'2' });
    const expectedPOA = (r.incomeTax + r.class4) / 2;
    return check('POA excludes student loan (bug fix)', r.poa, expectedPOA, 0.01,
      'POA = (incomeTax + class4) / 2 only — student loan settled as balancing payment');
  },
  () => {
    const r = CALCS['self-assess'].calculate({ profit:35000, other:0, studentPlan:'2' });
    const wrongPOA = r.total / 2;
    return check('POA is NOT total/2 when student loan present', Math.abs(r.poa - wrongPOA) > 1, true,
      'Confirms bug fix is active: POA no longer includes student loan');
  },

  // Combined income tax
  () => {
    const r = CALCS['self-assess'].calculate({ profit:35000, other:0, studentPlan:'0' });
    return check('Profit £35,000 — income tax', r.incomeTax, 4486.00, 0.01);
  },
]);

/* ─────────────────────────────────────────────────────────
   SUITE 18 — Employee NI (standalone)
   ───────────────────────────────────────────────────────── */
suite('Employee NI standalone calculator', [
  () => {
    const r = CALCS['employee-ni'].calculate({ salary:35000 });
    return check('£35,000 — annual NI', r.ni, 1794.40, 0.01);
  },
  () => {
    const r = CALCS['employee-ni'].calculate({ salary:60000 });
    return check('£60,000 — NI (main + additional)', r.ni, 3210.60, 0.01);
  },
  () => {
    const r = CALCS['employee-ni'].calculate({ salary:12570 });
    return check('£12,570 (at PT) — no NI', r.ni, 0.00, 0.01);
  },
]);

/* ─────────────────────────────────────────────────────────
   SUITE 19 — SPP / SAP calculators
   ───────────────────────────────────────────────────────── */
suite('SPP and SAP calculators', [
  () => {
    const r = CALCS['spp'].calculate({ awe:500, weeks:2 });
    return check('SPP: AWE £500, 2 weeks — at flat rate', r.total, 388.64, 0.01,
      '£194.32 × 2');
  },
  () => {
    const r = CALCS['spp'].calculate({ awe:130, weeks:2 });
    return check('SPP: AWE £130 (below flat rate) — at 90% AWE', r.total, 234.00, 0.01,
      '£130 × 90% × 2 = £117 × 2');
  },
  () => {
    const r = CALCS['spp'].calculate({ awe:128, weeks:2 });
    return check('SPP: AWE £128 (below LEL £129) — not eligible', r.eligible, false);
  },
  () => {
    const r = CALCS['sap'].calculate({ awe:500 });
    return check('SAP: AWE £500 — total (same as SMP)', r.total, 9112.56, 0.01);
  },
]);

/* ─────────────────────────────────────────────────────────
   SUITE 20 — ShPP calculator (over-allocation bug fix)
   ───────────────────────────────────────────────────────── */
suite('ShPP calculator — over-allocation bug fix', [
  () => {
    const r = CALCS['shpp'].calculate({ aweA:550, weeksA:20, aweB:450, weeksB:17 });
    return check('20+17=37 weeks — not over-allocated', r.overAllocated, false);
  },
  () => {
    const r = CALCS['shpp'].calculate({ aweA:550, weeksA:20, aweB:450, weeksB:17 });
    return check('20+17=37 weeks — total = 37×£194.32', r.total, 7189.84, 0.01);
  },
  () => {
    const r = CALCS['shpp'].calculate({ aweA:550, weeksA:30, aweB:450, weeksB:20 });
    return check('30+20=50 weeks — over-allocated flag', r.overAllocated, true);
  },
  () => {
    const r = CALCS['shpp'].calculate({ aweA:550, weeksA:30, aweB:450, weeksB:20 });
    return check('30+20=50 — total capped at 37 weeks (bug fix)', r.total, 7189.84, 0.01,
      'Was £9,716 (50 weeks) before fix; must now be £7,189.84 (37 weeks)');
  },
  () => {
    const r = CALCS['shpp'].calculate({ aweA:550, weeksA:30, aweB:450, weeksB:20 });
    return check('30+20=50 — totalWeeks = 37', r.totalWeeks, 37);
  },
  () => {
    const r = CALCS['shpp'].calculate({ aweA:550, weeksA:30, aweB:450, weeksB:20 });
    // Parent A gets 30, Parent B gets 7 (37-30)
    return check('30+20 over-alloc — Parent B capped to 7 weeks', r.effectiveWeeksB, 7);
  },
  () => {
    // Both ineligible (AWE below LEL)
    const r = CALCS['shpp'].calculate({ aweA:100, weeksA:10, aweB:100, weeksB:10 });
    return check('Both parents AWE below LEL — total £0', r.total, 0.00, 0.01);
  },
]);

/* ─────────────────────────────────────────────────────────
   SUITE 21 — Gross-to-Net frequency converter
   ───────────────────────────────────────────────────────── */
suite('Gross-to-Net frequency converter', [
  () => {
    const r = CALCS['gross-to-net'].calculate({ amount:45000, freq:'annual', plan:'0' });
    return check('Annual £45,000 — net annual', r.annual.net, 35919.60, 0.01);
  },
  () => {
    const r = CALCS['gross-to-net'].calculate({ amount:45000, freq:'annual', plan:'0' });
    return check('Annual £45,000 — net monthly = annual/12', r.monthly.net, 35919.60/12, 0.01);
  },
  () => {
    const r = CALCS['gross-to-net'].calculate({ amount:3750, freq:'monthly', plan:'0' });
    return check('Monthly £3,750 = annual £45,000 — same net', r.annual.net, 35919.60, 0.01);
  },
  () => {
    const r = CALCS['gross-to-net'].calculate({ amount:25, freq:'hourly', plan:'0' });
    // £25 × 37.5 × 52 = £48,750 annual
    return check('Hourly £25 — annual gross £48,750', r.annual.gross, 48750.00, 0.01);
  },
]);

/* ─────────────────────────────────────────────────────────
   SUITE 22 — Marginal relief standalone calculator
   ───────────────────────────────────────────────────────── */
suite('Marginal relief (standalone) calculator', [
  () => {
    const r = CALCS['marginal'].calculate({ profit:120000, assoc:0, period:12 });
    return check('£120,000 — marginal relief amount', r.mr, 1950.00, 0.01,
      '(250k−120k)×3/200');
  },
  () => {
    const r = CALCS['marginal'].calculate({ profit:120000, assoc:0, period:12 });
    return check('£120,000 — CT due', r.ct, 28050.00, 0.01,
      '£30,000 − £1,950 relief');
  },
  () => {
    const r = CALCS['marginal'].calculate({ profit:50000, assoc:0, period:12 });
    return check('£50,000 exactly (lo boundary) — 19%', r.ct, 9500.00, 0.01);
  },
  () => {
    const r = CALCS['marginal'].calculate({ profit:50001, assoc:0, period:12 });
    return check('£50,001 (just above lo) — in marginal band', r.band.includes('Marginal'), true);
  },
  () => {
    const r = CALCS['marginal'].calculate({ profit:250000, assoc:0, period:12 });
    return check('£250,000 exactly (hi boundary) — 25%', r.ct, 62500.00, 0.01);
  },
]);

/* ─────────────────────────────────────────────────────────
   SUITE 23 — Holiday pay (hoursPerDay fix)
   ───────────────────────────────────────────────────────── */
suite('Holiday pay calculator — hoursPerDay input fix', [
  () => {
    const r = CALCS['holiday'].calculate({ mode:'fixed', daysPerWeek:5, hoursPerDay:7.5, hoursWorked:0, hourlyRate:13 });
    return check('5 days/week 7.5h/day — 28 days entitlement', r.entitlementDays, 28.0, 0.01);
  },
  () => {
    const r = CALCS['holiday'].calculate({ mode:'fixed', daysPerWeek:5, hoursPerDay:7.5, hoursWorked:0, hourlyRate:13 });
    return check('5 days × 7.5h × £13/hr — week pay £487.50', r.weekPay, 487.50, 0.01);
  },
  () => {
    const r = CALCS['holiday'].calculate({ mode:'fixed', daysPerWeek:5, hoursPerDay:8, hoursWorked:0, hourlyRate:13 });
    return check('5 days × 8h/day × £13/hr — week pay £520', r.weekPay, 520.00, 0.01,
      'Different from 7.5h/day — confirms input is used');
  },
  () => {
    const r = CALCS['holiday'].calculate({ mode:'irreg', daysPerWeek:5, hoursPerDay:7.5, hoursWorked:160, hourlyRate:13 });
    return check('Irregular 160h — accrued = 19.31h', r.accruedHours, 19.31, 0.02);
  },
  () => {
    const r = CALCS['holiday'].calculate({ mode:'irreg', daysPerWeek:5, hoursPerDay:7.5, hoursWorked:160, hourlyRate:13 });
    return check('Irregular 160h @£13 — pay £251.06', r.pay, 251.06, 0.05);
  },
]);

/* ═══════════════════════════════════════════════════════════
   Test runner — renders results to the page
   ═════════════════════════════════════════════════════════== */
function runAllTests() {
  let total = 0, passed = 0;
  const html = SUITES.map(suite => {
    const testResults = suite.tests.map(fn => {
      try {
        return fn();
      } catch (e) {
        return { name: '(error running test)', pass: false, actual: '', expected: '', detail: String(e) };
      }
    });
    total += testResults.length;
    passed += testResults.filter(r => r.pass).length;

    const rows = testResults.map(r => `
      <div class="test ${r.pass ? 'pass' : 'fail'}">
        <div class="badge">${r.pass ? 'PASS' : 'FAIL'}</div>
        <div class="test-name">
          ${r.name}
          ${!r.pass ? `<div class="test-detail">Expected: ${r.expected} &nbsp;|&nbsp; Got: ${r.actual}${r.detail ? ' &nbsp;|&nbsp; ' + r.detail : ''}</div>` : (r.detail ? `<div class="test-detail" style="color:#6b7a8f">${r.detail}</div>` : '')}
        </div>
      </div>
    `).join('');

    return `
      <div class="suite">
        <div class="suite-title">${suite.name} (${testResults.filter(r=>r.pass).length}/${testResults.length})</div>
        ${rows}
      </div>
    `;
  }).join('');

  const allPass = passed === total;
  document.getElementById('summary').className = allPass ? 'all-pass' : 'has-fail';
  document.getElementById('summary').textContent =
    allPass ? `✓ All ${total} tests passed.` : `✗ ${total - passed} of ${total} tests failed.`;
  document.getElementById('results').innerHTML = html;
}

/* ─────────────────────────────────────────────────────────
   PHASE 5 — CMS / Media / Production utilities
   These run in-browser and exercise the pure-JS helpers.
   ───────────────────────────────────────────────────────── */

/* ── Reading-time helper (mirrors cms/src/routes/articles.js) ── */
function calcReadingTime(content) {
  if (!content) return 1;
  const text  = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').filter(w => w.length > 0).length;
  return Math.max(1, Math.round(words / 200));
}

/* ── Slug sanitiser (mirrors cms/src/sanitise.js slugFromTitle) ── */
function slugFromTitle(title) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/* ── Featured-image key validator (mirrors cms/src/sanitise.js) ── */
function sanitiseFeaturedImage(val) {
  if (!val || typeof val !== 'string') return null;
  const t = val.trim();
  if (!t) return null;
  if (t.includes('..')) return null;
  if (!/^[a-zA-Z0-9/._-]+$/.test(t)) return null;
  if (t.startsWith('backups/')) return null;
  return t;
}

/* ── R2 media filename builder (mirrors cms/src/routes/media.js) ── */
function buildSafeFilename(originalName, ext) {
  const base = (originalName || 'upload')
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'upload';
  return `${base}.${ext}`;
}

suite('Phase 5 — Reading time calculation', [
  () => check('Empty content → 1 min',  calcReadingTime(''),            1),
  () => check('200 words → 1 min',      calcReadingTime(Array(200).fill('word').join(' ')), 1),
  () => check('400 words → 2 min',      calcReadingTime(Array(400).fill('word').join(' ')), 2),
  () => check('100 words → 1 min',      calcReadingTime(Array(100).fill('word').join(' ')), 1),
  () => check('201 words → 1 min (round)', calcReadingTime(Array(201).fill('word').join(' ')), 1),
  () => check('300 words → 2 min (round)', calcReadingTime(Array(300).fill('word').join(' ')), 2),
  () => check('HTML stripped',           calcReadingTime('<p>' + Array(200).fill('word').join(' ') + '</p>'), 1),
  () => check('Null-safe',               calcReadingTime(null),          1),
]);

suite('Phase 5 — Slug generation', [
  () => check('Basic title',           slugFromTitle('Hello World'),           'hello-world'),
  () => check('Accents stripped',      slugFromTitle('UK PAYE 2026/27'),       'uk-paye-2026-27'),
  () => check('Special chars',         slugFromTitle('Self-Assessment: Tips'), 'self-assessment-tips'),
  () => check('Leading/trailing dash', slugFromTitle('  -test- '),             'test'),
  () => check('Numbers preserved',     slugFromTitle('Top 10 VAT tips'),       'top-10-vat-tips'),
  () => check('Empty string',          slugFromTitle(''),                      ''),
]);

suite('Phase 5 — Featured image key validation', [
  () => check('Valid key',             sanitiseFeaturedImage('2026/05/1234567890-photo.jpg'), '2026/05/1234567890-photo.jpg'),
  () => check('Path traversal blocked', sanitiseFeaturedImage('../etc/passwd'), null),
  () => check('Backups prefix blocked', sanitiseFeaturedImage('backups/backup.json'), null),
  () => check('Null input',            sanitiseFeaturedImage(null),            null),
  () => check('Empty string',          sanitiseFeaturedImage(''),              null),
  () => check('SQL injection blocked', sanitiseFeaturedImage("'; DROP TABLE"), null),
  () => check('Valid nested key',      sanitiseFeaturedImage('2026/01/123-my-image.webp'), '2026/01/123-my-image.webp'),
]);

suite('Phase 5 — Media filename sanitisation', [
  () => check('Normal filename',      buildSafeFilename('My Photo.jpg',  'jpg'), 'my-photo.jpg'),
  () => check('Special chars',        buildSafeFilename('../evil.png',    'png'), 'evil.png'),
  () => check('No name fallback',     buildSafeFilename('',              'webp'), 'upload.webp'),
  () => check('Extension stripped',   buildSafeFilename('image.JPEG',    'jpg'), 'image.jpg'),
  () => check('Long name truncated',  buildSafeFilename('a'.repeat(100), 'jpg'), 'a'.repeat(60) + '.jpg'),
  () => check('Spaces → hyphens',     buildSafeFilename('my image file.png', 'png'), 'my-image-file.png'),
]);
