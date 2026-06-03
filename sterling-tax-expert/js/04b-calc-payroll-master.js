function parseTaxCode(raw) {
  var s = ((raw || '1257L') + '').toUpperCase().replace(/\s/g, '');
  var w1 = /(W1|M1)$|\/W1$|\/M1$|X$/.test(s);
  var c = s.replace(/\/(W1|M1)$/, '').replace(/(W1|M1|X)$/, '');
  var basis = w1 ? 'week1' : 'cumulative';
  if (c === 'NT') return { type:'NT', pa:0,         basis:basis };
  if (c === 'BR') return { type:'BR', pa:0,         basis:basis };
  if (c === 'D0') return { type:'D0', pa:0,         basis:basis };
  if (c === 'D1') return { type:'D1', pa:0,         basis:basis };
  var k = c.match(/^K(\d+)$/);
  if (k) return { type:'K', pa:-(+k[1] * 10), basis:basis };
  var l = c.match(/^(\d+)[A-Z]?$/);
  if (l) return { type:'L', pa:+l[1] * 10,   basis:basis };
  return { type:'L', pa:window.TAX.PA, basis:'cumulative' };
}
function periodEeNI(grossPd, pdpy, cat) {
  var T = window.TAX;
  if (cat === 'C' || cat === 'X' || cat === 'Z') return 0;
  var pt = T.NI_PT / pdpy, uel = T.NI_UEL / pdpy;
  if (grossPd <= pt) return 0;
  var mainRate = cat === 'B' ? 0.0385 : T.NI_MAIN;
  var ni = (Math.min(grossPd, uel) - pt) * mainRate;
  if (grossPd > uel) ni += (grossPd - uel) * T.NI_ADDL;
  return ni;
}
function periodErNI(grossPd, pdpy, cat) {
  var T = window.TAX;
  if (cat === 'X') return 0;
  var st = T.NI_ST / pdpy, uel = T.NI_UEL / pdpy;
  if (cat === 'H' || cat === 'M' || cat === 'S') {
    if (grossPd <= uel) return 0;
    return (grossPd - uel) * T.NI_ER;
  }
  return Math.max(0, grossPd - st) * T.NI_ER;
}
function nhsEeRate(annualPay) {
  var T = window.TAX;
  if (T.NHS_PENSION_TIERS) {
    var ts = T.NHS_PENSION_TIERS;
    for (var i = 0; i < ts.length; i++) if (annualPay <= ts[i].to) return ts[i].rate;
    return ts[ts.length - 1].rate;
  }
  if (annualPay <= 13259) return 0.052;
  if (annualPay <= 28854) return 0.065;
  if (annualPay <= 35155) return 0.083;
  if (annualPay <= 52778) return 0.098;
  if (annualPay <= 67668) return 0.107;
  return 0.125;
}
CALCS['true-cost'] = {
  id: 'true-cost',
  title: 'True Employment Cost Calculator',
  subtitle: 'Enter a gross salary or a desired take-home — see exactly what the employee costs the business, what they take home, and every deduction in between. Pension, employer NI, student loan, apprenticeship levy and salary sacrifice all included.',
  metaBadges: ['Gross → Net', 'Net → Gross', 'Full employer cost'],
  inputs: [
    { id:'mode',       type:'toggle',  label:'Calculate from',                       default:'gross', options:[{v:'gross',l:'Gross salary'},{v:'net',l:'Desired take-home'}] },
    { id:'gross_in',   type:'currency',label:'Annual gross salary',                  default:45000,   hint:'Before any deductions' },
    { id:'net_in',     type:'currency',label:'Desired net take-home (annual)',        default:35000,   hint:'Cash received after all deductions' },
    { id:'freq_in',    type:'toggle',  label:'Input is',                             default:'annual',options:[{v:'annual',l:'Annual'},{v:'monthly',l:'Monthly × 12'}] },
    { id:'regime',     type:'toggle',  label:'Tax regime',                           default:'england',options:[{v:'england',l:'England & Wales'},{v:'scotland',l:'Scotland'}] },
    { type:'section',                  label:'Pension' },
    { id:'pensionType',type:'select',  label:'Pension scheme',                       default:'ae',    options:[{v:'none',l:'No pension'},{v:'ae',l:'Auto-enrolment — qualifying earnings'},{v:'full',l:'Custom % of full gross'}] },
    { id:'hasNI',      type:'checkbox',label:'Employee has NI number (1% govt tax relief on AE pension)',  default:true },
    { id:'sacrifice',  type:'checkbox',label:'Via salary sacrifice — reduces gross for tax & NI',          default:false },
    { id:'eePct',      type:'number',  label:'Employee pension',                     default:5,       suffix:'%', step:0.5, min:0, max:100 },
    { id:'erPct',      type:'number',  label:'Employer pension',                     default:3,       suffix:'%', step:0.5, min:0, max:25 },
    { type:'section',                  label:'Other deductions' },
    { id:'plan',       type:'select',  label:'Student loan plan',                    default:'0',     options:[{v:'0',l:'None'},{v:'1',l:'Plan 1 — £26,900'},{v:'2',l:'Plan 2 — £29,385'},{v:'4',l:'Plan 4 Scotland — £32,745'},{v:'5',l:'Plan 5 — £25,000'},{v:'PG',l:'Postgrad — £21,000'}] },
    { type:'section',                  label:'Employer extras' },
    { id:'allowance',  type:'checkbox',label:'Employment Allowance (£10,500 / yr)', default:true },
    { id:'levy',       type:'checkbox',label:'Apprenticeship Levy (pay-bill > £3m)',  default:false },
    { id:'benefits',   type:'currency',label:'Benefits & extras (annual)',            default:0,       hint:'Health insurance, car allowance, etc.' },
  ],
  afterRecalc: function(s) {
    if (s.mode === 'net') { _hide('gross_in'); _hide('freq_in'); } else { _show('gross_in'); _show('freq_in'); }
    if (s.mode === 'gross') _hide('net_in'); else _show('net_in');
    var noPension = s.pensionType === 'none';
    if (noPension) {
      _hide('hasNI'); _hide('sacrifice'); _hide('eePct'); _hide('erPct');
    } else {
      if (s.pensionType === 'ae') _show('hasNI'); else _hide('hasNI');
      _show('sacrifice'); _show('eePct'); _show('erPct');
    }
  },
  calculate: function(s) {
    var T = window.TAX;
    var gross;
    if (s.mode === 'gross') {
      gross = (s.freq_in === 'monthly' ? (s.gross_in || 0) * 12 : (s.gross_in || 0));
    } else {
      var target = s.net_in || 0;
      var lo = Math.max(0, target * 0.5), hi = target * 3 + 200000;
      gross = target;
      for (var i = 0; i < 80; i++) {
        var mid = (lo + hi) / 2;
        var tryNet = this._result(mid, s, T).netPay;
        if (Math.abs(tryNet - target) < 0.05) { gross = mid; break; }
        if (tryNet < target) lo = mid; else hi = mid;
        gross = mid;
      }
    }
    return this._result(gross, s, T);
  },
  _result: function(gross, s, T) {
    var eePension = 0, erPension = 0, aeQE = 0;
    if (s.pensionType !== 'none') {
      var eeRate = (s.eePct || 0) / 100;
      var erRate = (s.erPct || 0) / 100;
      if (s.pensionType === 'ae') {
        aeQE = Math.max(0, Math.min(gross, T.AE_UPPER) - T.AE_LOWER);
        eePension = aeQE * eeRate;
        erPension = aeQE * erRate;
      } else {
        eePension = gross * eeRate;
        erPension = gross * erRate;
      }
    }
    var taxableGross = (s.sacrifice && s.pensionType !== 'none') ? Math.max(0, gross - eePension) : gross;
    var taxRes = s.regime === 'scotland' ? scottishIncomeTaxOn(taxableGross) : incomeTaxOn(taxableGross);
    var incomeTax = taxRes.tax, paUsed = taxRes.paUsed !== undefined ? taxRes.paUsed : T.PA;
    var empNI = employeeNI(taxableGross);
    var erNI  = employerNI(taxableGross, s.allowance);
    var sl = studentLoan(gross, s.plan);
    var eeNetCost = 0;
    if (!s.sacrifice && s.pensionType !== 'none') {
      eeNetCost = (s.pensionType === 'ae' && s.hasNI) ? eePension * 0.80 : eePension;
    }
    var netPay = gross - (s.sacrifice ? eePension : 0) - incomeTax - empNI - eeNetCost - sl;
    var levyAmt  = s.levy    ? gross * T.AL_RATE : 0;
    var benefAmt = s.benefits || 0;
    var empCost  = gross + erNI + erPension + levyAmt + benefAmt;
    var totalEeDeductions = incomeTax + empNI + sl + (s.sacrifice ? eePension : eeNetCost);
    var effRate    = gross > 0 ? totalEeDeductions / gross * 100 : 0;
    var overheadPct = gross > 0 ? (empCost - gross) / gross * 100 : 0;
    return {
      gross, taxableGross, incomeTax, empNI, erNI,
      eePension, erPension, aeQE, eeNetCost, sl,
      levyAmt, benefAmt, netPay, empCost,
      effRate, overheadPct, paUsed,
      sacrifice: s.sacrifice, pensionType: s.pensionType,
      hasNI: s.hasNI, regime: s.regime, plan: s.plan, mode: s.mode
    };
  },
  render: function(r) {
    var c = { net:'#16A34A', tax:'#C0392B', ni:'#C49A2E', pension:'#7C3AED', erPension:'#0EA5E9', sl:'#EA580C', levy:'#6B7280', gross:'#6B748F', employer:'#0B1E3D' };
    var donutEe = [
      { name:'Net pay',    val:r.netPay,   color:c.net },
      { name:'Income tax', val:r.incomeTax,color:c.tax },
      { name:'Employee NI',val:r.empNI,    color:c.ni  },
    ];
    if (r.sacrifice && r.eePension > 0) donutEe.push({ name:'Pension (sacrifice)', val:r.eePension,    color:c.pension });
    else if (r.eeNetCost > 0)           donutEe.push({ name:'Pension (net cost)',  val:r.eeNetCost,    color:c.pension });
    if (r.sl > 0) donutEe.push({ name:'Student loan', val:r.sl, color:c.sl });
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
    var pensionNote = '';
    if (r.pensionType === 'ae') {
      pensionNote = 'Auto-enrolment pension on qualifying earnings '
        + '<strong>' + fmt(r.aeQE) + '</strong> (band £6,240–£50,270). '
        + (r.hasNI
          ? 'Employee contributes 4% net — HMRC adds 1% tax relief into the pension pot.'
          : 'No NI number — employee pays full 5% with no tax relief.')
        + (r.sacrifice ? ' Via <strong>salary sacrifice</strong> — reduces both taxable pay and NI.' : ' Via <strong>relief at source</strong>.');
    } else if (r.pensionType === 'full') {
      pensionNote = 'Custom pension on full gross.'
        + (r.sacrifice ? ' Via <strong>salary sacrifice</strong>.' : ' Via <strong>relief at source</strong>.');
    }
    return kpiRow([
      kpi('Employee take-home',  fmt(r.netPay),   { color:'primary', sub: fmt(r.netPay / 12) + ' / month · ' + fmt(r.netPay / 52) + ' / week' }),
      kpi('Total employer cost', fmt(r.empCost),  { color:'navy',    sub: fmt(r.empCost / 12) + ' / month · ' + r.overheadPct.toFixed(1) + '% above salary' }),
      kpi('Effective tax rate',  r.effRate.toFixed(1) + '%', { color:'gold', sub:'Tax + NI' + (r.sl > 0 ? ' + Student loan' : '') }),
    ])
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:0">'
      + '<div class="chart-section">'
        + '<div class="chart-title"><span>Employee breakdown</span><span style="font-size:11px;color:var(--t3)">Annual</span></div>'
        + '<div class="donut-wrap">' + donutSVG(donutEe, r.gross)
        + '<div class="donut-legend">' + donutEe.map(function(d) {
            return '<div class="dl-item"><div class="dl-dot" style="background:' + d.color + '"></div>'
              + '<span class="dl-name">' + d.name + '</span>'
              + '<span class="dl-val">' + fmt(d.val) + '</span>'
              + '<span class="dl-pct">' + (r.gross > 0 ? (d.val / r.gross * 100).toFixed(1) + '%' : '') + '</span>'
              + '</div>';
          }).join('') + '</div></div>'
      + '</div>'
      + '<div>'
        + '<div class="breakdown"><div class="bk-header"><div class="bk-title">Employee — deductions</div></div>'
          + bkRow('Gross salary', c.gross, r.gross, r.gross, true)
          + (r.sacrifice && r.eePension > 0 ? bkRow('Salary sacrifice (pension)', c.pension, r.eePension, r.gross) : '')
          + (r.sacrifice && r.eePension > 0 ? bkRow('Taxable pay', c.gross, r.taxableGross, r.gross) : '')
          + bkRow('Income tax', c.tax, r.incomeTax, r.gross)
          + bkRow('Employee NI', c.ni, r.empNI, r.gross)
          + (!r.sacrifice && r.eeNetCost > 0 ? bkRow('Pension (employee net cost)', c.pension, r.eeNetCost, r.gross) : '')
          + (r.sl > 0 ? bkRow('Student loan', c.sl, r.sl, r.gross) : '')
          + bkRow('Net take-home', c.net, r.netPay, r.gross, false, true)
        + '</div>'
        + '<div class="breakdown" style="margin-top:12px"><div class="bk-header"><div class="bk-title">Employer — true cost</div></div>'
          + bkRow('Gross salary', c.gross, r.gross, r.empCost)
          + bkRow('Employer NI (15%)', c.ni, r.erNI, r.empCost)
          + (r.erPension > 0 ? bkRow('Employer pension', c.erPension, r.erPension, r.empCost) : '')
          + (r.levyAmt > 0 ? bkRow('Apprenticeship Levy (0.5%)', c.levy, r.levyAmt, r.empCost) : '')
          + (r.benefAmt > 0 ? bkRow('Benefits & extras', '#0EA5E9', r.benefAmt, r.empCost) : '')
          + bkRow('Total employer cost', c.employer, r.empCost, r.empCost, false, true)
        + '</div>'
      + '</div>'
    + '</div>'
    + '<div class="chart-section" style="margin-top:14px"><div class="chart-title"><span>All-frequency summary</span></div>'
      + '<div class="freq-table">'
        + '<div class="ft-head"><span>Frequency</span><span>Gross</span><span>Income tax</span><span>Employee NI</span><span>Net pay</span><span>Employer cost</span></div>'
        + freqRow('Annual', 1)
        + freqRow('Monthly', 12)
        + freqRow('Weekly', 52)
        + freqRow('Daily', 260)
      + '</div>'
    + '</div>'
    + (r.mode === 'net' ? notesCard('Net-to-Gross solve', 'To achieve a take-home of <strong>' + fmt(r.netPay) + '</strong>, the gross salary required is <strong>' + fmt(r.gross) + '</strong>. Solved by binary search to within ±5p.') : '')
    + (pensionNote ? notesCard('Pension — how contributions work', pensionNote) : '')
    + (r.paUsed < window.TAX.PA ? notesCard('Personal allowance tapered', 'Gross income exceeds £100,000 — personal allowance has tapered to <strong>£' + fmtInt(r.paUsed) + '</strong>. Effective marginal rate in the taper band is 60%.') : '')
    + (r.regime === 'scotland' ? notesCard('Scottish income tax (2026/27)', 'Scottish rates applied: starter 19% · basic 20% · intermediate 21% · higher 42% · top 48%.') : '')
    + actionsRow();
  },
  related: ['payslip', 'auto-enrol', 'sal-vs-div', 'corp']
};
CALCS['payslip'] = {
  id: 'payslip',
  title: 'Payslip Generator & Verifier',
  subtitle: 'Enter the tax code, NI category, YTD figures and pension scheme. The calculator produces a formatted payslip for any pay period — Standard PAYE or NHS pension. Cumulative and Week1/Month1 basis supported.',
  metaBadges: ['Standard PAYE', 'NHS pension', 'W1/M1 supported', 'Student loan'],
  inputs: [
    { id:'freq',       type:'select',  label:'Pay frequency',            default:'12',  options:[{v:'12',l:'Monthly'},{v:'52',l:'Weekly'},{v:'26',l:'Fortnightly'},{v:'13',l:'4-Weekly'}] },
    { id:'pdNum',      type:'number',  label:'Period number',            default:1, min:1, max:53, hint:'Month 1 = April, Month 6 = September' },
    { type:'section',                  label:'Employee & tax details' },
    { id:'taxCode',    type:'select',  label:'Tax code',                 default:'1257L', options:[
      {v:'1257L',      l:'1257L — standard personal allowance'},
      {v:'1257L/W1',   l:'1257L W1/M1 — non-cumulative'},
      {v:'BR',         l:'BR — basic rate, no personal allowance'},
      {v:'D0',         l:'D0 — higher rate (40%) on all pay'},
      {v:'D1',         l:'D1 — additional rate (45%) on all pay'},
      {v:'NT',         l:'NT — no tax deducted'},
      {v:'0T',         l:'0T — no personal allowance, cumulative'},
      {v:'1000L',      l:'1000L — reduced personal allowance (£10,000)'},
      {v:'K100',       l:'K100 — K code example (neg. allowance)'},
    ]},
    { id:'niCat',      type:'select',  label:'NI category',              default:'A',   options:[
      {v:'A', l:'A — Standard employee (8% / 15%)'},
      {v:'B', l:'B — Married women reduced (3.85% / 15%)'},
      {v:'C', l:'C — Over State Pension Age (0% / 15%)'},
      {v:'H', l:'H / M — Under 21 (8% / 0% to UEL)'},
      {v:'S', l:'S — Apprentice under 25 (8% / 0% to UEL)'},
      {v:'X', l:'X — Exempt, no NI either side'},
    ]},
    { id:'regime',     type:'toggle',  label:'Tax regime',               default:'england', options:[{v:'england',l:'England & Wales'},{v:'scotland',l:'Scotland'}] },
    { type:'section',                  label:'Pay this period' },
    { id:'grossPd',    type:'currency',label:'Gross pay this period',    default:3750 },
    { id:'sacPd',      type:'currency',label:'Salary sacrifice this period', default:0, hint:'Off gross before tax & NI' },
    { type:'section',                  label:'Year to date (before this period)' },
    { id:'ytdGross',   type:'currency',label:'YTD gross pay',            default:0, hint:'Total gross paid in earlier periods this year' },
    { id:'ytdTax',     type:'currency',label:'YTD income tax paid',      default:0 },
    { id:'ytdEeNI',    type:'currency',label:'YTD employee NI paid',     default:0 },
    { type:'section',                  label:'Pension' },
    { id:'pensionType',type:'select',  label:'Pension scheme',           default:'ae',  options:[{v:'none',l:'None'},{v:'ae',l:'Auto-enrolment'},{v:'nhs',l:'NHS Pension Scheme'},{v:'custom',l:'Custom %'}] },
    { id:'hasNI',      type:'checkbox',label:'Employee has NI number (AE: 1% govt tax relief)', default:true },
    { id:'nhsAnnual',  type:'currency',label:'Annual pensionable pay (NHS tier)', default:45000, hint:'Sets the NHS contribution tier' },
    { id:'eePct',      type:'number',  label:'Employee pension %',       default:5, suffix:'%', step:0.5, min:0, max:100 },
    { id:'erPct',      type:'number',  label:'Employer pension %',       default:3, suffix:'%', step:0.5, min:0, max:25 },
    { type:'section',                  label:'Student loan' },
    { id:'plan',       type:'select',  label:'Student loan plan',        default:'0',   options:[{v:'0',l:'None'},{v:'1',l:'Plan 1 — £26,900'},{v:'2',l:'Plan 2 — £29,385'},{v:'4',l:'Plan 4 Scotland — £32,745'},{v:'5',l:'Plan 5 — £25,000'},{v:'PG',l:'Postgrad — £21,000'}] },
  ],
  afterRecalc: function(s) {
    var noPension  = s.pensionType === 'none';
    var isAe       = s.pensionType === 'ae';
    var isNhs      = s.pensionType === 'nhs';
    var isCustom   = s.pensionType === 'custom';
    if (noPension) {
      _hide('hasNI'); _hide('nhsAnnual'); _hide('eePct'); _hide('erPct');
    } else if (isNhs) {
      _show('nhsAnnual'); _hide('hasNI'); _hide('eePct'); _hide('erPct');
    } else {
      _hide('nhsAnnual');
      _show('eePct'); _show('erPct');
      if (isAe) _show('hasNI'); else _hide('hasNI');
    }
  },
  calculate: function(s) {
    var T   = window.TAX;
    var pdpy = parseInt(s.freq) || 12;
    var pdNum = Math.max(1, s.pdNum || 1);
    var tc   = parseTaxCode(s.taxCode);
    var grossPd = s.grossPd || 0;
    var sacPd   = Math.min(s.sacPd || 0, grossPd);
    var taxableGross = Math.max(0, grossPd - sacPd);
    var eePensionPd = 0, erPensionPd = 0, nhsTierRate = 0, nhsAnnual = 0;
    if (s.pensionType === 'nhs') {
      nhsAnnual    = s.nhsAnnual || (grossPd * pdpy);
      nhsTierRate  = nhsEeRate(nhsAnnual);
      eePensionPd  = grossPd * nhsTierRate;
      erPensionPd  = grossPd * 0.1438; // 14.38% — employer payroll contribution
    } else if (s.pensionType === 'ae') {
      var aeLoP = T.AE_LOWER / pdpy, aeHiP = T.AE_UPPER / pdpy;
      var aeQEP = Math.max(0, Math.min(taxableGross, aeHiP) - aeLoP);
      eePensionPd = aeQEP * ((s.eePct || 5) / 100);
      erPensionPd = aeQEP * ((s.erPct || 3) / 100);
    } else if (s.pensionType === 'custom') {
      eePensionPd = taxableGross * ((s.eePct || 0) / 100);
      erPensionPd = taxableGross * ((s.erPct || 0) / 100);
    }
    var taxPd = periodPAYE(taxableGross, s.ytdGross || 0, s.ytdTax || 0, pdNum, pdpy, tc);
    var eeNIPd = periodEeNI(taxableGross, pdpy, s.niCat || 'A');
    var erNIPd = periodErNI(taxableGross, pdpy, s.niCat || 'A');
    var slPd = periodSL(taxableGross, s.plan, pdpy);
    var eeDeductPd;
    if (s.pensionType === 'nhs') {
      eeDeductPd = eePensionPd; // NHS occupational — full amount deducted
    } else if (s.pensionType === 'ae' && s.hasNI && sacPd === 0) {
      eeDeductPd = eePensionPd * 0.80; // relief at source — employee pays 80%
    } else {
      eeDeductPd = eePensionPd; // custom or no NI number
    }
    var netPd = grossPd - sacPd - taxPd - eeNIPd - eeDeductPd - slPd;
    var ytdGrossNew = (s.ytdGross || 0) + grossPd;
    var ytdTaxNew   = (s.ytdTax   || 0) + taxPd;
    var ytdEeNINew  = (s.ytdEeNI  || 0) + eeNIPd;
    return {
      grossPd, sacPd, taxableGross,
      taxPd, eeNIPd, erNIPd,
      eePensionPd, erPensionPd, eeDeductPd,
      slPd, netPd,
      ytdGrossNew, ytdTaxNew, ytdEeNINew,
      pdpy, pdNum, tc,
      nhsTierRate, nhsAnnual,
      pensionType: s.pensionType || 'none',
      niCat: s.niCat || 'A',
      taxCode: s.taxCode || '1257L',
      regime: s.regime, plan: s.plan
    };
  },
  render: function(r) {
    var freqName = {12:'Month', 52:'Week', 26:'Fortnight', 13:'4-Wk'}[r.pdpy] || 'Period';
    var freqAdj  = {12:'Monthly', 52:'Weekly', 26:'Fortnightly', 13:'4-Weekly'}[r.pdpy] || 'Period';
    var tcDesc = {
      NT:'No tax deducted', BR:'All pay taxed at 20% — no personal allowance',
      D0:'All pay taxed at 40%', D1:'All pay taxed at 45%',
      K:'K code — negative allowance added to taxable income',
      L:'Personal allowance £' + fmtInt(r.tc.pa) + '/yr (£' + fmt(r.tc.pa / r.pdpy, 0) + ' this ' + freqName.toLowerCase() + ')',
    }[r.tc.type] || 'Standard';
    tcDesc += ' · Basis: <strong>' + (r.tc.basis === 'week1' ? 'Week1/Month1 — non-cumulative' : 'Cumulative') + '</strong>';
    var totalDeductions = r.taxPd + r.eeNIPd + r.eeDeductPd + r.slPd;
    var ps = '<div class="payslip-card">'
      + '<div class="ps-header">'
        + '<div>'
          + '<div class="ps-header-title">PAYSLIP</div>'
          + '<div class="ps-header-meta">' + freqAdj + ' · ' + freqName + ' ' + r.pdNum + ' of ' + r.pdpy + ' · Tax year 2026/27</div>'
        + '</div>'
        + '<div class="ps-header-right">'
          + '<div class="ps-header-badge">Tax code: ' + r.taxCode + '</div>'
          + '<div class="ps-header-badge">NI: Cat ' + r.niCat + (r.regime === 'scotland' ? ' · Scottish' : '') + '</div>'
        + '</div>'
      + '</div>'
      + '<div class="ps-body">'
        + '<div class="ps-col">'
          + '<div class="ps-section-label">Earnings</div>'
          + '<div class="ps-line"><span>Basic ' + freqAdj.toLowerCase() + ' pay</span><span>' + fmt(r.grossPd) + '</span></div>'
          + (r.sacPd > 0 ? '<div class="ps-line ps-neg"><span>Salary sacrifice</span><span>(' + fmt(r.sacPd) + ')</span></div>' : '')
          + (r.sacPd > 0 ? '<div class="ps-line ps-sub"><span>Taxable pay</span><span>' + fmt(r.taxableGross) + '</span></div>' : '')
          + '<div class="ps-col-total"><span>Total earnings</span><span>' + fmt(r.grossPd) + '</span></div>'
        + '</div>'
        + '<div class="ps-col">'
          + '<div class="ps-section-label">Deductions</div>'
          + '<div class="ps-line"><span>Income tax (' + r.taxCode + ')</span><span>' + fmt(r.taxPd) + '</span></div>'
          + '<div class="ps-line"><span>Employee NI (Cat ' + r.niCat + ')</span><span>' + fmt(r.eeNIPd) + '</span></div>'
          + (r.eePensionPd > 0 ? '<div class="ps-line"><span>Pension'
              + (r.pensionType === 'nhs' ? ' — NHS ' + (r.nhsTierRate * 100).toFixed(1) + '%' : r.pensionType === 'ae' ? ' — AE' : '')
              + '</span><span>' + fmt(r.eeDeductPd) + '</span></div>' : '')
          + (r.slPd > 0 ? '<div class="ps-line"><span>Student loan (' + (r.plan || '') + ')</span><span>' + fmt(r.slPd) + '</span></div>' : '')
          + '<div class="ps-col-total"><span>Total deductions</span><span>' + fmt(totalDeductions) + '</span></div>'
        + '</div>'
      + '</div>'
      + '<div class="ps-net"><span class="ps-net-label">NET PAY</span><span class="ps-net-amount">' + fmt(r.netPd) + '</span></div>'
      + '<div class="ps-ytd">'
        + '<div class="ps-ytd-item"><div class="ps-ytd-val">' + fmt(r.ytdGrossNew, 0) + '</div><div class="ps-ytd-lbl">YTD Gross</div></div>'
        + '<div class="ps-ytd-item"><div class="ps-ytd-val">' + fmt(r.ytdTaxNew, 0) + '</div><div class="ps-ytd-lbl">YTD Tax</div></div>'
        + '<div class="ps-ytd-item"><div class="ps-ytd-val">' + fmt(r.ytdEeNINew, 0) + '</div><div class="ps-ytd-lbl">YTD Ee NI</div></div>'
        + '<div class="ps-ytd-item"><div class="ps-ytd-val">' + fmt(r.erNIPd, 0) + '</div><div class="ps-ytd-lbl">Er NI (period)</div></div>'
      + '</div>'
      + '<div class="ps-employer-row">'
        + 'Employer cost this period: gross <strong>' + fmt(r.grossPd) + '</strong>'
        + ' + employer NI <strong>' + fmt(r.erNIPd) + '</strong>'
        + (r.erPensionPd > 0 ? ' + employer pension <strong>' + fmt(r.erPensionPd) + '</strong>' : '')
        + ' = <strong>' + fmt(r.grossPd + r.erNIPd + r.erPensionPd) + '</strong>'
      + '</div>'
    + '</div>';
    var kpiItems = [
      kpi(freqAdj + ' net pay',  fmt(r.netPd),  { color:'primary', sub:'After all deductions' }),
      kpi('Income tax',          fmt(r.taxPd),  { color:'red',     sub:'PAYE this period' }),
      kpi('Employee NI',         fmt(r.eeNIPd), { color:'gold',    sub:'Category ' + r.niCat }),
    ];
    var kpiItems2 = [kpi('Employer NI', fmt(r.erNIPd), {color:'navy', sub:'Period employer cost'})];
    if (r.eePensionPd > 0) kpiItems2.push(kpi('Employee pension', fmt(r.eeDeductPd), {color:'gold', sub: r.pensionType === 'nhs' ? 'NHS ' + (r.nhsTierRate*100).toFixed(1) + '%' : 'AE deduction'}));
    if (r.erPensionPd > 0) kpiItems2.push(kpi('Employer pension', fmt(r.erPensionPd), {color:'green', sub: r.pensionType === 'nhs' ? '14.38% NHS employer' : 'AE employer'}));
    return ps
      + kpiRow(kpiItems)
      + (kpiItems2.length > 0 ? kpiRow(kpiItems2) : '')
      + notesCard('Tax code — ' + r.taxCode, tcDesc)
      + (r.pensionType === 'nhs' ? notesCard('NHS Pension 2026/27', 'Annual pensionable pay <strong>' + fmt(r.nhsAnnual, 0) + '</strong> → contribution tier <strong>' + (r.nhsTierRate * 100).toFixed(1) + '%</strong>. Employer payroll contribution: 14.38% (NHSBSA covers the remaining 9.4% centrally — it does not appear on the payslip).') : '')
      + notesCard('How YTD fields work', 'Enter the gross, tax and NI paid in <em>all earlier periods this tax year</em> — leave at zero for period 1. For <strong>cumulative</strong> tax codes the YTD figures are used to calculate the correct period tax deduction. For <strong>W1/M1</strong> codes each period is treated independently and YTD figures are shown for reference only.')
      + actionsRow('<button class="btn btn-ghost btn-sm" onclick="printSummary()">⬇ Download payslip PDF</button>');
  },
  related: ['true-cost', 'auto-enrol', 'ssp', 'smp']
};
