/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Hero Canvas: Constellation
   Optimised: shadowBlur for glow, batched draws, capped count.
   ─────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var raf  = null;
  var tick = 0;

  /* Background and vignette gradients are rebuilt only on resize */
  var bgGrad, vigGrad, bloomL, bloomR;
  var bgW = 0, bgH = 0;

  function start() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, pts;
    var goldPts, whitePts; /* pre-split so we can batch fill by colour */

    function buildStaticGrads() {
      bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0,    '#010207');
      bgGrad.addColorStop(0.45, '#05091B');
      bgGrad.addColorStop(1,    '#02040E');

      vigGrad = ctx.createRadialGradient(W*.5, H*.45, H*.1, W*.5, H*.45, H*.9);
      vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vigGrad.addColorStop(1, 'rgba(1,2,10,0.80)');

      bloomL = ctx.createRadialGradient(W*.22, H*.5, 0, W*.22, H*.5, W*.48);
      bloomL.addColorStop(0,   'rgba(166,124,0,0.07)');
      bloomL.addColorStop(1,   'rgba(0,0,0,0)');

      bloomR = ctx.createRadialGradient(W*.78, H*.42, 0, W*.78, H*.42, W*.42);
      bloomR.addColorStop(0,   'rgba(99,102,241,0.07)');
      bloomR.addColorStop(1,   'rgba(0,0,0,0)');

      bgW = W; bgH = H;
    }

    function mkPt() {
      var angle = Math.random() * Math.PI * 2;
      var speed = 0.15 + Math.random() * 0.28;
      return {
        x:      Math.random() * W,
        y:      Math.random() * H,
        vx:     Math.cos(angle) * speed,
        vy:     Math.sin(angle) * speed,
        drift:  (Math.random() - 0.5) * 0.005,
        r:      0.8 + Math.random() * 1.8,
        baseA:  0.6  + Math.random() * 0.4,
        phase:  Math.random() * Math.PI * 2,
        tSpeed: 0.045 + Math.random() * 0.055,
        gold:   Math.random() < 0.28
      };
    }

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      /* ~300 particles on desktop — smooth at 60fps */
      var count = Math.min(320, Math.max(120, Math.floor(W * H / 4500)));
      pts = [];
      for (var i = 0; i < count; i++) pts.push(mkPt());
      goldPts  = pts.filter(function(p){ return  p.gold; });
      whitePts = pts.filter(function(p){ return !p.gold; });
      buildStaticGrads();
    }

    function frame() {
      tick++;

      /* ── Background (pre-built gradient, no allocation) ── */
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      /* Blooms — static gradients, just painted */
      ctx.fillStyle = bloomL; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = bloomR; ctx.fillRect(0, 0, W, H);

      /* ── Particles — use shadowBlur for glow, not per-particle radialGradient ── */

      /* White/indigo particles */
      ctx.shadowColor = 'rgba(190,205,255,0.6)';
      ctx.shadowBlur  = 8;
      ctx.fillStyle   = 'rgba(215,225,255,1)';
      ctx.beginPath();
      for (var i = 0; i < whitePts.length; i++) {
        var p = whitePts[i];
        p.phase += p.tSpeed;
        var a = p.baseA * (0.65 + 0.35 * Math.sin(p.phase));
        ctx.globalAlpha = a;
        ctx.moveTo(p.x + p.r, p.y);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      }
      ctx.fill();

      /* Gold particles */
      ctx.shadowColor = 'rgba(255,200,60,0.55)';
      ctx.shadowBlur  = 10;
      ctx.fillStyle   = 'rgba(220,178,80,1)';
      ctx.beginPath();
      for (var j = 0; j < goldPts.length; j++) {
        var q = goldPts[j];
        q.phase += q.tSpeed;
        var b = q.baseA * (0.65 + 0.35 * Math.sin(q.phase));
        ctx.globalAlpha = b;
        ctx.moveTo(q.x + q.r, q.y);
        ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2);
      }
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;

      /* ── Move all particles ── */
      for (var k = 0; k < pts.length; k++) {
        var pt = pts[k];
        var va = Math.atan2(pt.vy, pt.vx) + pt.drift;
        var sp = Math.sqrt(pt.vx * pt.vx + pt.vy * pt.vy);
        pt.vx = Math.cos(va) * sp;
        pt.vy = Math.sin(va) * sp;
        pt.x += pt.vx;
        pt.y += pt.vy;
        var m = 20;
        if (pt.x < -m) pt.x = W + m;
        if (pt.x > W + m) pt.x = -m;
        if (pt.y < -m) pt.y = H + m;
        if (pt.y > H + m) pt.y = -m;
      }

      /* ── Vignette ── */
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(frame);
    }

    window.addEventListener('resize', function () {
      clearTimeout(window._heroResizeTimer);
      window._heroResizeTimer = setTimeout(resize, 120);
    }, { passive: true });

    resize();
    frame();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
