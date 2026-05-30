/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Data layer (UK 2026/27 tax year)
   ───────────────────────────────────────────────────────────
   Tax year 2026/27 runs 6 April 2026 → 5 April 2027.
   Most thresholds are frozen until April 2028 (per Autumn Budget).
   Statutory rates (NLW, SSP, SMP) are confirmed for 2026/27 (in force from 6 April 2026).
   ─────────────────────────────────────────────────────────── */

window.TAX_YEAR = '2026/27';
window.TAX_YEAR_LABEL = 'Updated for 2026/27 UK tax rules';

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

/* ── Tool registry ─────────────────────────────────────────
   Every calculator that's fully implemented is listed here.
   Placeholder-only tools have been removed.
   ────────────────────────────────────────────────────────── */
window.TOOLS = [
  // Payroll
  { id:'paye',          cat:'Payroll',     icon:'💷', title:'PAYE Tax & NI Calculator',           desc:'Income tax, employee NI, net take-home pay and full employer cost — for any UK salary.',                        tags:['Income tax','NI','Pension','Student loan'], badge:'tb-pop', badgeText:'Most used', color:'tc-blue',   iconBg:'ti-blue'   },
  { id:'employer-ni',   cat:'Payroll',     icon:'🏛', title:'Employer NI Calculator',              desc:'Class 1 secondary contributions at 15% above £5,000, with Employment Allowance applied where eligible.',         tags:['Class 1','£5k threshold','£10.5k allowance'], badge:'tb-upd', badgeText:'2026/27', color:'tc-gold',   iconBg:'ti-gold'   },
  { id:'net-to-gross',  cat:'Payroll',     icon:'⇄',  title:'Net-to-Gross Salary Calculator',      desc:'Work backwards from take-home pay to the gross salary you need to offer — with NI and tax solved.',              tags:['Reverse','Take-home','Offers'], badge:'tb-new', badgeText:'New', color:'tc-green',  iconBg:'ti-green'  },
  { id:'payroll-cost',  cat:'Payroll',     icon:'📊', title:'True Payroll Cost Calculator',        desc:'The full annual cost of hiring: salary + employer NI + pension + apprenticeship levy where applicable.',           tags:['Total cost','Hiring','Budgeting'], badge:'tb-new', badgeText:'New', color:'tc-purple', iconBg:'ti-purple' },
  { id:'salary-sacrifice', cat:'Payroll',  icon:'🔁', title:'Salary Sacrifice Calculator',         desc:'Compare gross-pay vs salary-sacrifice pension contributions and the NI saving for employee and employer.',        tags:['Pensions','NI saving','Director'], badge:'tb-new', badgeText:'New', color:'tc-blue',   iconBg:'ti-blue'   },

  // Statutory pay
  { id:'ssp',           cat:'Statutory',   icon:'🏥', title:'SSP Calculator',                       desc:'Statutory Sick Pay from day one at £123.25/week (or 80% of AWE if lower) for up to 28 weeks — 2026/27 rules, no waiting days.',                       tags:['Sickness','Qualifying days','PIWs'], badge:'tb-upd', badgeText:'2026/27', color:'tc-gold',   iconBg:'ti-gold'   },
  { id:'smp',           cat:'Statutory',   icon:'👶', title:'SMP Calculator',                       desc:'Statutory Maternity Pay — 90% AWE for 6 weeks, then £194.32 or 90% (whichever lower) for 33 weeks. Includes due-date and qualifying-week handling.',                tags:['Maternity','AWE','39 weeks'], badge:'tb-upd', badgeText:'2026/27', color:'tc-purple', iconBg:'ti-purple' },
  { id:'holiday',       cat:'Statutory',   icon:'🌴', title:'Holiday Pay Calculator',               desc:'Statutory holiday entitlement (5.6 weeks) and accrual for full-time, part-time and irregular-hours workers.',     tags:['28 days','Accrual','Part-time'], badge:'tb-new', badgeText:'New', color:'tc-green',  iconBg:'ti-green'  },
  { id:'redundancy',    cat:'Statutory',   icon:'📤', title:'Statutory Redundancy Pay Calculator', desc:'Age-banded weekly multiplier × capped weekly pay × completed years (max 20). Updated for 2026/27 cap.',           tags:['Statutory','Cap','Service'], badge:'tb-upd', badgeText:'2026/27', color:'tc-blue',   iconBg:'ti-blue'   },

  // Compliance
  { id:'auto-enrol',    cat:'Compliance',  icon:'🪙', title:'Auto-Enrolment Pension Calculator',   desc:'Workplace pension contributions on qualifying earnings (£6,240–£50,270) at the 8% statutory minimum.',           tags:['Workplace pension','Qualifying earnings'], badge:'tb-new', badgeText:'New', color:'tc-purple', iconBg:'ti-purple' },
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

  // v4 additions — Gross-to-Net, Marginal Relief, SPP, SAP, ShPP (employee-ni retired; CALCS entry preserved for URL compatibility)
  { id:'gross-to-net',  cat:'Payroll',     icon:'➡',  title:'Gross-to-Net Salary Calculator',        desc:'Calculate take-home pay across annual, monthly, weekly, daily and hourly frequencies.',                            tags:['Frequency table','Hourly','Daily'],     badge:'tb-new', badgeText:'New',      color:'tc-blue',   iconBg:'ti-blue'   },
  { id:'spp',           cat:'Statutory',   icon:'👨', title:'SPP Calculator',                         desc:'Statutory Paternity Pay — up to 2 weeks at £194.32 or 90% AWE (whichever lower).',                                          tags:['Paternity','2 weeks','AWE'],            badge:'tb-new', badgeText:'New',      color:'tc-blue',   iconBg:'ti-blue'   },
  { id:'sap',           cat:'Statutory',   icon:'🏡', title:'SAP Calculator',                         desc:'Statutory Adoption Pay — SMP structure for adoptive parents (39 weeks total).',                                       tags:['Adoption','39 weeks','AWE'],            badge:'tb-new', badgeText:'New',      color:'tc-green',  iconBg:'ti-green'  },
  { id:'shpp',          cat:'Statutory',   icon:'👪', title:'Shared Parental Pay Calculator',         desc:'Up to 37 weeks of shared parental pay divisible between parents at £194.32 or 90% AWE.',                             tags:['Shared parental','37 weeks','Split'],   badge:'tb-new', badgeText:'New',      color:'tc-purple', iconBg:'ti-purple' },
  { id:'marginal',      cat:'Tax',         icon:'📐', title:'Marginal Relief Calculator',             desc:'Standalone marginal-relief explorer for profits between £50,000 and £250,000 — the CT band.',                         tags:['MR fraction','£50k–£250k','26.5% eff'], badge:'tb-new', badgeText:'New',      color:'tc-purple', iconBg:'ti-purple' },

  // Healthcare
  { id:'nhs-payroll',   cat:'Healthcare',  icon:'🏥', title:'NHS Payroll & Pension Calculator',        desc:'Take-home pay, NHS pension contribution tier and annual allowance risk for NHS doctors, consultants, salaried GPs, nurses and AHPs — 2026/27.',  tags:['NHS pension','CARE scheme','Annual allowance'], badge:'tb-new', badgeText:'New', color:'tc-blue', iconBg:'ti-blue' },
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

  // Corp tax
  { date:'2026-10-01', name:'Corporation tax — Mar 2025 y/e',       cat:'Corp tax',  desc:'CT payable 9 months and 1 day after accounting period end.',                      urgency:'blue'  },
  { date:'2026-12-31', name:'CT600 filing — Dec 2025 y/e',          cat:'Corp tax',  desc:'Company tax return due 12 months after end of accounting period.',                urgency:'blue'  },

  // Self assessment
  { date:'2026-07-31', name:'Second payment on account',            cat:'Self assessment', desc:'Second 2025/26 self-assessment payment on account.',                          urgency:'red'   },
  { date:'2026-10-05', name:'Register for self assessment',         cat:'Self assessment', desc:'Deadline to notify HMRC of new self-employment for 2025/26.',                 urgency:'amber' },
  { date:'2026-10-31', name:'Paper self assessment return',         cat:'Self assessment', desc:'Last day to file 2025/26 self assessment on paper.',                          urgency:'amber' },
  { date:'2027-01-31', name:'Self assessment — online filing',      cat:'Self assessment', desc:'Online filing and balancing payment for 2025/26 personal tax.',               urgency:'red'   },

  // Pension / auto-enrol
  { date:'2026-04-22', name:'Auto-enrol declaration of compliance', cat:'Pension',   desc:'Re-declare auto-enrolment compliance with the Pensions Regulator (3-yearly).',     urgency:'blue'  },
];

/* ── Insights / Blog seed posts (in localStorage if absent) ── */
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
