/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Hero Canvas: Constellation
   ─────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var TAU   = Math.PI * 2;
  var raf   = null;
  var paused = false; /* true when tab hidden OR hero scrolled out of view */

  function start() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    /* ── Context: cap DPR at 1.5 to avoid 4× pixel cost on Retina ── */
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var ctx  = canvas.getContext('2d', { alpha: false }); /* alpha:false → browser skips alpha compositing */

    var W, H, pts, whitePts, goldPts, bgCanvas, bgCtx, tick = 0;

    /* ── Offscreen canvas holds the static background (rebuilt on resize only) ── */
    function buildBackground() {
      bgCanvas        = document.createElement('canvas');
      bgCanvas.width  = W;
      bgCanvas.height = H;
      bgCtx           = bgCanvas.getContext('2d', { alpha: false });

      var bg = bgCtx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0,    '#010207');
      bg.addColorStop(0.45, '#05091B');
      bg.addColorStop(1,    '#02040E');
      bgCtx.fillStyle = bg;
      bgCtx.fillRect(0, 0, W, H);

      /* Two soft bloom glows — drawn once */
      var bL = bgCtx.createRadialGradient(W * 0.22, H * 0.5, 0, W * 0.22, H * 0.5, W * 0.48);
      bL.addColorStop(0, 'rgba(166,124,0,0.07)');
      bL.addColorStop(1, 'rgba(0,0,0,0)');
      bgCtx.fillStyle = bL;
      bgCtx.fillRect(0, 0, W, H);

      var bR = bgCtx.createRadialGradient(W * 0.78, H * 0.42, 0, W * 0.78, H * 0.42, W * 0.42);
      bR.addColorStop(0, 'rgba(99,102,241,0.07)');
      bR.addColorStop(1, 'rgba(0,0,0,0)');
      bgCtx.fillStyle = bR;
      bgCtx.fillRect(0, 0, W, H);
    }

    /* ── Vignette gradient — rebuilt on resize only ── */
    var vigGrad;
    function buildVignette() {
      vigGrad = ctx.createRadialGradient(W * 0.5, H * 0.45, H * 0.1, W * 0.5, H * 0.45, H * 0.9);
      vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vigGrad.addColorStop(1, 'rgba(1,2,10,0.80)');
    }

    function mkPt() {
      var angle = Math.random() * TAU;
      var speed = 0.15 + Math.random() * 0.25;
      return {
        x:      Math.random() * W,
        y:      Math.random() * H,
        vx:     Math.cos(angle) * speed,
        vy:     Math.sin(angle) * speed,
        /* drift: tiny angle added each frame; ±0.003 rad max */
        drift:  (Math.random() - 0.5) * 0.006,
        r:      0.8 + Math.random() * 1.6,
        gold:   Math.random() < 0.28
      };
    }

    function resize() {
      /* Size canvas in CSS pixels (no DPR upscale for a background anim) */
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;

      /* Particle budget: 180 desktop max, 80 mobile max */
      var mobile = W < 768;
      var count  = mobile
        ? Math.max(60,  Math.min(80,  Math.floor(W * H / 12000)))
        : Math.max(100, Math.min(180, Math.floor(W * H /  9000)));

      pts = [];
      for (var i = 0; i < count; i++) pts.push(mkPt());
      whitePts = pts.filter(function(p){ return !p.gold; });
      goldPts  = pts.filter(function(p){ return  p.gold; });

      buildBackground();
      buildVignette();
    }

    /* ── Draw one colour group with a two-pass soft glow (no shadowBlur) ── */
    /* Pass 1: large faint circle  → simulates light scatter / bloom          */
    /* Pass 2: small bright circle → the star core                            */
    /* Both passes share the same pre-built path → 2 fill() calls total       */
    function drawGroup(group, color, batchAlpha) {
      if (!group.length) return;

      ctx.beginPath();
      for (var i = 0; i < group.length; i++) {
        var p = group[i];
        ctx.moveTo(p.x + p.r * 3.2, p.y);
        ctx.arc(p.x, p.y, p.r * 3.2, 0, TAU);
      }
      ctx.fillStyle   = color;
      ctx.globalAlpha = batchAlpha * 0.13;
      ctx.fill();

      ctx.beginPath();
      for (var j = 0; j < group.length; j++) {
        var q = group[j];
        ctx.moveTo(q.x + q.r, q.y);
        ctx.arc(q.x, q.y, q.r, 0, TAU);
      }
      ctx.globalAlpha = batchAlpha * 0.88;
      ctx.fill();
    }

    function frame() {
      if (paused) { raf = requestAnimationFrame(frame); return; }
      tick++;

      /* ── Static background: one fast drawImage instead of 3 gradient fills ── */
      ctx.drawImage(bgCanvas, 0, 0);

      /* ── Batch-level twinkle (one sin sample per group, not per particle) ── */
      var wAlpha = 0.75 + 0.25 * Math.sin(tick * 0.018);
      var gAlpha = 0.72 + 0.28 * Math.sin(tick * 0.021 + 1.3);

      ctx.fillStyle = 'rgba(215,225,255,1)';
      drawGroup(whitePts, 'rgba(215,225,255,1)', wAlpha);

      ctx.fillStyle = 'rgba(220,178,80,1)';
      drawGroup(goldPts, 'rgba(220,178,80,1)', gAlpha);

      ctx.globalAlpha = 1;

      /* ── Move particles: rotation matrix approximation, zero trig ── */
      /* For small angle d: cos(d)≈1-d²/2, sin(d)≈d                   */
      /* Correction (1-d²) keeps speed stable without sqrt/normalize    */
      for (var k = 0; k < pts.length; k++) {
        var pt  = pts[k];
        var d   = pt.drift;
        var cor = 1 - d * d;
        var nvx = (pt.vx * cor - pt.vy * d);
        var nvy = (pt.vx * d  + pt.vy * cor);
        pt.vx   = nvx;
        pt.vy   = nvy;
        pt.x   += pt.vx;
        pt.y   += pt.vy;
        var m = 20;
        if (pt.x < -m)    pt.x = W + m;
        if (pt.x > W + m) pt.x = -m;
        if (pt.y < -m)    pt.y = H + m;
        if (pt.y > H + m) pt.y = -m;
      }

      /* ── Vignette overlay ── */
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(frame);
    }

    /* ── Pause when tab is hidden (Page Visibility API) ── */
    document.addEventListener('visibilitychange', function () {
      paused = document.hidden;
    });

    /* ── Pause when hero scrolls out of view (IntersectionObserver) ── */
    if (typeof IntersectionObserver !== 'undefined') {
      new IntersectionObserver(function (entries) {
        /* Keep paused flag in sync; don't override a visibility-driven pause */
        if (!document.hidden) paused = !entries[0].isIntersecting;
      }, { threshold: 0 }).observe(canvas);
    }

    window.addEventListener('resize', function () {
      clearTimeout(window._heroResizeTimer);
      window._heroResizeTimer = setTimeout(resize, 150);
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
