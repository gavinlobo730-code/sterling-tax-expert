/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Hero Dashboard Animation
   Animated SVG composition using live window.TAX data
   and window.DEADLINES. Respects prefers-reduced-motion.
   ─────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var ANIM_ID = null;
  var CANVAS_EL = null;
  var CTX = null;
  var W = 0, H = 0;
  var PHASE = 0;       // animation phase 0–1, loops
  var START_T = null;
  var CYCLE_MS = 9000; // full loop duration

  // ── colour tokens (match CSS vars) ──────────────────────────
  var C = {
    bg:       '#050D1A',
    grid:     'rgba(255,255,255,0.025)',
    indigo:   '#6366F1',
    teal:     '#14B8A6',
    white:    '#FFFFFF',
    dim:      'rgba(255,255,255,0.15)',
    dimmer:   'rgba(255,255,255,0.06)',
    amber:    '#fbbf24',
    green:    '#4ade80',
    indigoDim:'rgba(99,102,241,0.18)',
    tealDim:  'rgba(20,184,166,0.12)',
    monoFont: "'JetBrains Mono', 'Courier New', monospace",
    sansFont: "'Inter', sans-serif",
  };

  // ── easing ───────────────────────────────────────────────────
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOut(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // Phase helpers — each phase occupies a fraction of the cycle
  function phaseProgress(start, end) {
    if (PHASE < start) return 0;
    if (PHASE > end) return 1;
    return (PHASE - start) / (end - start);
  }

  // ── data from live tax constants ─────────────────────────────
  function getTaxData() {
    var T = window.TAX || {};
    return {
      pa:     T.PA     || 12570,
      brLim:  T.BR_LIMIT || 50270,
      taper:  T.PA_TAPER_START || 100000,
      hrLim:  T.HR_LIMIT || 125140,
      nlw:    T.NLW_21 || 12.71,
      er:     T.NI_ER  || 0.15,
      ea:     T.EMPLOYMENT_ALLOWANCE || 10500,
    };
  }

  function getUpcomingDeadlines() {
    var all = window.DEADLINES || [];
    var today = new Date(); today.setHours(0,0,0,0);
    return all
      .filter(function(d) {
        var dt = new Date(d.date); dt.setHours(0,0,0,0);
        return dt >= today;
      })
      .sort(function(a, b) { return new Date(a.date) - new Date(b.date); })
      .slice(0, 4);
  }

  function getTaxYearProgress() {
    var now = new Date();
    var start = new Date(now.getFullYear(), 3, 6); // 6 Apr
    if (now < start) start = new Date(now.getFullYear() - 1, 3, 6);
    var end = new Date(start.getFullYear() + 1, 3, 5);
    var elapsed = now - start;
    var total = end - start;
    return Math.min(1, Math.max(0, elapsed / total));
  }

  // ── draw utilities ───────────────────────────────────────────
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ── main draw ────────────────────────────────────────────────
  function draw(timestamp) {
    if (!CTX) return;
    if (!START_T) START_T = timestamp;
    var elapsed = timestamp - START_T;
    PHASE = (elapsed % CYCLE_MS) / CYCLE_MS;

    CTX.clearRect(0, 0, W, H);

    var t = getTaxData();
    var deadlines = getUpcomingDeadlines();
    var taxYearPct = getTaxYearProgress();

    // ── Layer 1: tax liability curve (draws left to right, phases 0–0.35) ──
    var curveP = easeOut(phaseProgress(0, 0.35));
    drawTaxCurve(t, curveP);

    // ── Layer 2: threshold markers (phase 0.20–0.55, stagger) ──
    var threshP = phaseProgress(0.20, 0.55);
    drawThresholds(t, threshP);

    // ── Layer 3: KPI cards (phase 0.38–0.60) ──
    var kpiP = easeOut(phaseProgress(0.38, 0.60));
    drawKPICards(t, kpiP);

    // ── Layer 4: Tax year progress ring (phase 0.50–0.70) ──
    var ringP = easeOut(phaseProgress(0.50, 0.70));
    drawProgressRing(taxYearPct, ringP);

    // ── Layer 5: Deadline timeline (phase 0.62–0.85) ──
    var dlP = easeOut(phaseProgress(0.62, 0.85));
    drawDeadlineTimeline(deadlines, dlP);

    // ── Fade out gently (phase 0.88–1.0) ──
    var fadeP = phaseProgress(0.88, 1.0);
    if (fadeP > 0) {
      CTX.globalAlpha = fadeP * 0.85;
      CTX.fillStyle = C.bg;
      CTX.fillRect(0, 0, W, H);
      CTX.globalAlpha = 1;
    }

    ANIM_ID = requestAnimationFrame(draw);
  }

  // ── Tax curve ────────────────────────────────────────────────
  function drawTaxCurve(t, progress) {
    if (progress <= 0) return;
    var cx = CTX;
    var maxIncome = 130000;
    var chartX = 40, chartY = H * 0.55, chartW = W * 0.6, chartH = H * 0.3;

    // Draw curve up to progress fraction
    cx.save();
    cx.beginPath();
    cx.rect(chartX, chartY - chartH, chartW * progress, chartH + 4);
    cx.clip();

    cx.beginPath();
    var steps = 200;
    for (var i = 0; i <= steps; i++) {
      var inc = (i / steps) * maxIncome;
      var tax = calcEffectiveTax(inc, t);
      var px = chartX + (inc / maxIncome) * chartW;
      var py = chartY - (tax / inc || 0) * chartH * 1.8;
      py = Math.max(chartY - chartH, Math.min(chartY, py));
      if (i === 0) cx.moveTo(px, py); else cx.lineTo(px, py);
    }
    cx.strokeStyle = C.indigo;
    cx.lineWidth = 2;
    cx.stroke();

    // Area fill under curve
    cx.lineTo(chartX + chartW * progress, chartY);
    cx.lineTo(chartX, chartY);
    cx.closePath();
    var grad = cx.createLinearGradient(0, chartY - chartH, 0, chartY);
    grad.addColorStop(0, 'rgba(99,102,241,0.18)');
    grad.addColorStop(1, 'rgba(99,102,241,0)');
    cx.fillStyle = grad;
    cx.fill();

    // Teal second line: NI effective rate
    cx.beginPath();
    for (var j = 0; j <= steps; j++) {
      var inc2 = (j / steps) * maxIncome;
      var ni = calcNIRate(inc2, t);
      var px2 = chartX + (inc2 / maxIncome) * chartW;
      var py2 = chartY - ni * chartH * 3;
      py2 = Math.max(chartY - chartH, Math.min(chartY, py2));
      if (j === 0) cx.moveTo(px2, py2); else cx.lineTo(px2, py2);
    }
    cx.strokeStyle = C.teal;
    cx.lineWidth = 1.5;
    cx.setLineDash([4, 3]);
    cx.stroke();
    cx.setLineDash([]);

    cx.restore();

    // Axis labels
    if (progress > 0.5) {
      cx.save();
      cx.globalAlpha = (progress - 0.5) * 2;
      cx.font = '10px ' + C.monoFont;
      cx.fillStyle = C.dim;
      cx.fillText('effective tax rate', chartX + 4, chartY - chartH + 14);
      cx.fillStyle = 'rgba(20,184,166,0.6)';
      cx.fillText('NI contribution', chartX + 4, chartY - chartH + 28);
      cx.restore();
    }
  }

  function calcEffectiveTax(income, t) {
    if (income <= 0) return 0;
    var pa = t.pa;
    if (income > t.taper) pa = Math.max(0, pa - Math.floor((income - t.taper) / 2));
    var taxable = Math.max(0, income - pa);
    var tax = 0;
    var br = Math.min(taxable, t.brLim - t.pa);
    tax += br * 0.20;
    var hr = Math.max(0, Math.min(taxable - br, t.hrLim - t.brLim));
    tax += hr * 0.40;
    var ar = Math.max(0, taxable - br - hr);
    tax += ar * 0.45;
    return tax / income;
  }

  function calcNIRate(income, t) {
    if (income <= 12570) return 0;
    var niMain = Math.min(income, 50270) - 12570;
    var niAdd = Math.max(0, income - 50270);
    return (niMain * 0.08 + niAdd * 0.02) / income;
  }

  // ── Threshold markers ────────────────────────────────────────
  function drawThresholds(t, progress) {
    if (progress <= 0) return;
    var maxIncome = 130000;
    var chartX = 40, chartY = H * 0.55, chartW = W * 0.6;
    var thresholds = [
      { income: t.pa,    label: '£' + (t.pa/1000).toFixed(0) + 'k PA',     color: 'rgba(165,180,252,0.6)' },
      { income: t.brLim, label: '£' + (t.brLim/1000).toFixed(0) + 'k BR',  color: 'rgba(99,102,241,0.7)' },
      { income: t.taper, label: '£100k taper',                               color: 'rgba(251,191,36,0.7)' },
      { income: t.hrLim, label: '£' + (t.hrLim/1000 | 0) + 'k PA=0',       color: 'rgba(248,113,113,0.7)' },
    ];

    thresholds.forEach(function(th, i) {
      var stagger = phaseProgress(i * 0.18, i * 0.18 + 0.4);
      if (stagger <= 0) {
        stagger = progress > 0.5 ? 1 : 0; // simplified: show all after progress>0.5
      }
      var alpha = easeOut(clamp(progress * 4 - i * 0.5, 0, 1));
      if (alpha <= 0) return;

      var x = chartX + (th.income / maxIncome) * chartW;
      CTX.save();
      CTX.globalAlpha = alpha * 0.7;
      CTX.setLineDash([3, 4]);
      CTX.strokeStyle = th.color;
      CTX.lineWidth = 1;
      CTX.beginPath();
      CTX.moveTo(x, chartY);
      CTX.lineTo(x, chartY - H * 0.3);
      CTX.stroke();
      CTX.setLineDash([]);

      // Label
      CTX.globalAlpha = alpha;
      CTX.font = '9px ' + C.monoFont;
      CTX.fillStyle = th.color;
      CTX.fillText(th.label, x + 3, chartY - H * 0.3 + 4);
      CTX.restore();
    });
  }

  // ── KPI cards ────────────────────────────────────────────────
  function drawKPICards(t, progress) {
    if (progress <= 0) return;
    var cards = [
      { label: 'Employer NI', value: (t.er * 100).toFixed(0) + '%', sub: 'from £5,000 ST' },
      { label: 'Employment Allow.', value: '£' + (t.ea / 1000).toFixed(1) + 'k', sub: 'for eligible employers' },
      { label: 'Nat. Living Wage', value: '£' + t.nlw.toFixed(2), sub: 'per hour (21+)' },
    ];

    var startX = W * 0.65;
    var cardW = (W * 0.32) / cards.length - 8;
    var cardH = 60;
    var startY = H * 0.18;

    cards.forEach(function(card, i) {
      var staggerP = easeOut(clamp(progress * 3 - i * 0.4, 0, 1));
      if (staggerP <= 0) return;
      var x = startX + i * (cardW + 8);
      var y = startY;

      CTX.save();
      CTX.globalAlpha = staggerP;

      // Card background
      roundRect(CTX, x, y, cardW, cardH, 8);
      CTX.fillStyle = 'rgba(255,255,255,0.04)';
      CTX.fill();
      CTX.strokeStyle = 'rgba(255,255,255,0.08)';
      CTX.lineWidth = 1;
      CTX.stroke();

      // Top accent
      CTX.fillStyle = C.indigo;
      CTX.fillRect(x + 12, y, cardW - 24, 2);

      // Label
      CTX.font = '9px ' + C.sansFont;
      CTX.fillStyle = 'rgba(255,255,255,0.35)';
      CTX.fillText(card.label, x + 10, y + 18);

      // Value
      CTX.font = '600 18px ' + C.monoFont;
      CTX.fillStyle = '#fff';
      CTX.fillText(card.value, x + 10, y + 40);

      // Sub
      CTX.font = '9px ' + C.sansFont;
      CTX.fillStyle = 'rgba(255,255,255,0.25)';
      CTX.fillText(card.sub, x + 10, y + 54);

      CTX.restore();
    });
  }

  // ── Tax year progress ring ───────────────────────────────────
  function drawProgressRing(taxYearPct, progress) {
    if (progress <= 0) return;
    var cx = W * 0.82, cy = H * 0.62;
    var r = 38;
    var displayPct = taxYearPct * progress;

    CTX.save();
    CTX.globalAlpha = progress;

    // Background ring
    CTX.beginPath();
    CTX.arc(cx, cy, r, 0, Math.PI * 2);
    CTX.strokeStyle = 'rgba(255,255,255,0.06)';
    CTX.lineWidth = 3;
    CTX.stroke();

    // Progress arc
    var startAngle = -Math.PI / 2;
    var endAngle = startAngle + (Math.PI * 2 * displayPct);
    CTX.beginPath();
    CTX.arc(cx, cy, r, startAngle, endAngle);
    CTX.strokeStyle = C.indigo;
    CTX.lineWidth = 3;
    CTX.lineCap = 'round';
    CTX.stroke();

    // Teal inner ring (partial)
    var innerR = r - 8;
    CTX.beginPath();
    CTX.arc(cx, cy, innerR, startAngle, startAngle + (Math.PI * 2 * displayPct * 0.7));
    CTX.strokeStyle = 'rgba(20,184,166,0.4)';
    CTX.lineWidth = 1.5;
    CTX.stroke();

    // Centre label
    CTX.font = '700 13px ' + C.monoFont;
    CTX.fillStyle = '#fff';
    CTX.textAlign = 'center';
    CTX.fillText(Math.round(taxYearPct * 100) + '%', cx, cy + 5);

    CTX.font = '9px ' + C.sansFont;
    CTX.fillStyle = 'rgba(255,255,255,0.3)';
    CTX.fillText('2026/27', cx, cy + 18);

    CTX.textAlign = 'left';
    CTX.restore();
  }

  // ── Deadline timeline ────────────────────────────────────────
  function drawDeadlineTimeline(deadlines, progress) {
    if (progress <= 0 || !deadlines.length) return;
    var y = H * 0.88;
    var startX = 40, lineW = W - 80;

    CTX.save();
    CTX.globalAlpha = progress;

    // Timeline base line
    CTX.beginPath();
    CTX.moveTo(startX, y);
    CTX.lineTo(startX + lineW * progress, y);
    CTX.strokeStyle = 'rgba(255,255,255,0.08)';
    CTX.lineWidth = 1;
    CTX.stroke();

    // Label
    CTX.font = '9px ' + C.sansFont;
    CTX.fillStyle = 'rgba(255,255,255,0.2)';
    CTX.fillText('UPCOMING DEADLINES', startX, y - 14);

    // Deadline points
    var spacing = lineW / (deadlines.length + 1);
    deadlines.forEach(function(d, i) {
      var staggerP = easeOut(clamp(progress * 4 - i * 0.5, 0, 1));
      if (staggerP <= 0) return;
      var x = startX + spacing * (i + 1);
      var isUrgent = d.urgency === 'red';
      var dotColor = isUrgent ? 'rgba(248,113,113,0.9)' : (i === 0 ? C.teal : 'rgba(255,255,255,0.35)');

      CTX.save();
      CTX.globalAlpha = staggerP;

      // Dot
      CTX.beginPath();
      CTX.arc(x, y, isUrgent ? 5 : 4, 0, Math.PI * 2);
      CTX.fillStyle = dotColor;
      CTX.fill();

      // Vertical tick
      CTX.beginPath();
      CTX.moveTo(x, y - 4);
      CTX.lineTo(x, y - 22);
      CTX.strokeStyle = dotColor;
      CTX.lineWidth = 1;
      CTX.setLineDash(isUrgent ? [] : [2, 3]);
      CTX.stroke();
      CTX.setLineDash([]);

      // Date
      var dt = new Date(d.date);
      var dateStr = dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      CTX.font = '600 9px ' + C.monoFont;
      CTX.fillStyle = dotColor;
      CTX.textAlign = 'center';
      CTX.fillText(dateStr, x, y - 26);

      // Name (truncated)
      var name = d.name.length > 16 ? d.name.slice(0, 14) + '…' : d.name;
      CTX.font = '9px ' + C.sansFont;
      CTX.fillStyle = 'rgba(255,255,255,0.3)';
      CTX.fillText(name, x, y - 36);

      CTX.textAlign = 'left';
      CTX.restore();
    });

    CTX.restore();
  }

  // ── Resize handler ───────────────────────────────────────────
  function resize() {
    if (!CANVAS_EL) return;
    var parent = CANVAS_EL.parentElement;
    W = parent ? parent.offsetWidth : 480;
    H = parent ? parent.offsetHeight : 280;
    CANVAS_EL.width = W;
    CANVAS_EL.height = H;
  }

  // ── Init ─────────────────────────────────────────────────────
  function init() {
    // Respect prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      renderStatic();
      return;
    }

    var el = document.getElementById('hero-canvas');
    if (!el) return;

    CANVAS_EL = el;
    CTX = el.getContext('2d');
    resize();

    window.addEventListener('resize', function() { resize(); START_T = null; });
    ANIM_ID = requestAnimationFrame(draw);
  }

  // ── Static fallback (reduced motion) ─────────────────────────
  function renderStatic() {
    var el = document.getElementById('hero-canvas');
    if (!el) return;
    var ctx = el.getContext('2d');
    var parent = el.parentElement;
    el.width  = parent ? parent.offsetWidth : 480;
    el.height = parent ? parent.offsetHeight : 280;
    // Just draw the KPI cards and ring in full opacity
    CANVAS_EL = el; CTX = ctx;
    W = el.width; H = el.height;
    PHASE = 0.65; // mid-cycle snapshot
    START_T = 0;
    draw(0);
    cancelAnimationFrame(ANIM_ID);
  }

  // ── Boot ─────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Slight delay to let tax data load
    setTimeout(init, 100);
  }

  window._heroAnimStop = function() {
    if (ANIM_ID) cancelAnimationFrame(ANIM_ID);
  };
})();
