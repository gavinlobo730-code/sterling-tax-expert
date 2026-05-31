/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Calculators (Payroll + Statutory)
   All calculations use the 2026/27 UK tax-year constants in TAX.
   ─────────────────────────────────────────────────────────── */

// ── Shared tax functions ───────────────────────────────────
function scottishIncomeTaxOn(gross){
  // Scottish income tax 2026/27 — confirmed by Scottish Budget.
  // Rates: starter 19%, basic 20%, intermediate 21%, higher 42%, top 48%.
  const T = window.TAX;
  let pa = T.PA;
  if (gross > T.PA_TAPER_START) {
    pa = Math.max(0, T.PA - Math.floor((gross - T.PA_TAPER_START) / 2));
  }
  const taxable = Math.max(0, gross - pa);
  let tax = 0;
  const s1 = Math.min(taxable, T.SCOT_STARTER_LIMIT - pa);
  const s2 = Math.min(Math.max(0, taxable - (T.SCOT_STARTER_LIMIT - pa)), T.SCOT_BASIC_LIMIT - T.SCOT_STARTER_LIMIT);
  const s3 = Math.min(Math.max(0, taxable - (T.SCOT_BASIC_LIMIT - pa)), T.SCOT_INTER_LIMIT - T.SCOT_BASIC_LIMIT);
  const s4 = Math.min(Math.max(0, taxable - (T.SCOT_INTER_LIMIT - pa)), T.SCOT_HR_LIMIT - T.SCOT_INTER_LIMIT);
  const s5 = Math.max(0, taxable - (T.SCOT_HR_LIMIT - pa));
  if (s1 > 0) tax += s1 * T.SCOT_STARTER;
  if (s2 > 0) tax += s2 * T.SCOT_BASIC;
  if (s3 > 0) tax += s3 * T.SCOT_INTER;
  if (s4 > 0) tax += s4 * T.SCOT_HR;
  if (s5 > 0) tax += s5 * T.SCOT_TOP;
  return { tax: Math.max(0, tax), paUsed: pa };
}

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
