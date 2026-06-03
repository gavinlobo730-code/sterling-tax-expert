/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Hero Canvas: Constellation
   Phase-2 optimised: static starfield + 30fps cap + half-res render
   ─────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var TAU      = Math.PI * 2;
  var FRAME_MS = 1000 / 30;   /* 30fps cap: ~33ms budget per frame */
  var SCALE    = 0.5;          /* render at 50% — blends perfectly for a bg anim */
  var paused   = false;
  var lastTime = 0;

  function start() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d', { alpha: false });

    var W, H;           /* logical (half-res) dimensions              */
    var activePts = []; /* ~30 moving particles drawn every frame     */
    var bgCanvas, staticCanvas, vigGrad, tick = 0;

    /* ── Offscreen: background gradient + two bloom radials (static) ── */
    function buildBackground() {
      bgCanvas        = document.createElement('canvas');
      bgCanvas.width  = W;
      bgCanvas.height = H;
      var bc = bgCanvas.getContext('2d', { alpha: false });

      var bg = bc.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0,    '#010207');
      bg.addColorStop(0.45, '#05091B');
      bg.addColorStop(1,    '#02040E');
      bc.fillStyle = bg;
      bc.fillRect(0, 0, W, H);

      var bL = bc.createRadialGradient(W*.22, H*.5, 0, W*.22, H*.5, W*.48);
      bL.addColorStop(0, 'rgba(166,124,0,0.07)');
      bL.addColorStop(1, 'rgba(0,0,0,0)');
      bc.fillStyle = bL;
      bc.fillRect(0, 0, W, H);

      var bR = bc.createRadialGradient(W*.78, H*.42, 0, W*.78, H*.42, W*.42);
      bR.addColorStop(0, 'rgba(99,102,241,0.07)');
      bR.addColorStop(1, 'rgba(0,0,0,0)');
      bc.fillStyle = bR;
      bc.fillRect(0, 0, W, H);
    }

    /* ── Offscreen: dense static star layer (drawn once, composited each frame) ── */
    /* 120 stars rendered to an offscreen canvas — never redrawn.                   */
    /* The whole layer is blit with varying globalAlpha to simulate group twinkle.  */
    function buildStaticStars() {
      staticCanvas        = document.createElement('canvas');
      staticCanvas.width  = W;
      staticCanvas.height = H;
      var sc = staticCanvas.getContext('2d');

      var count = Math.max(80, Math.min(120, Math.floor(W * H / 2000)));
      sc.fillStyle = 'rgba(215,225,255,1)';
      sc.beginPath();
      for (var i = 0; i < count; i++) {
        var x = Math.random() * W;
        var y = Math.random() * H;
        var r = 0.4 + Math.random() * 0.9;
        sc.moveTo(x + r, y);
        sc.arc(x, y, r, 0, TAU);
      }
      sc.globalAlpha = 0.55;
      sc.fill();

      /* Gold accent stars */
      sc.fillStyle = 'rgba(220,178,80,1)';
      sc.beginPath();
      var gCount = Math.floor(count * 0.3);
      for (var j = 0; j < gCount; j++) {
        var gx = Math.random() * W;
        var gy = Math.random() * H;
        var gr = 0.3 + Math.random() * 0.7;
        sc.moveTo(gx + gr, gy);
        sc.arc(gx, gy, gr, 0, TAU);
      }
      sc.globalAlpha = 0.40;
      sc.fill();
      sc.globalAlpha = 1;
    }

    /* ── Active (moving) particles: just 30, split white/gold ── */
    function mkPt() {
      var angle = Math.random() * TAU;
      var speed = 0.06 + Math.random() * 0.10; /* slow — speed is per-frame at 30fps */
      return {
        x:    Math.random() * W,
        y:    Math.random() * H,
        vx:   Math.cos(angle) * speed,
        vy:   Math.sin(angle) * speed,
        drift:(Math.random() - 0.5) * 0.004,
        r:    0.7 + Math.random() * 1.3,
        gold: Math.random() < 0.28
      };
    }

    function buildVignette() {
      vigGrad = ctx.createRadialGradient(W*.5, H*.45, H*.08, W*.5, H*.45, H*.9);
      vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vigGrad.addColorStop(1, 'rgba(1,2,10,0.82)');
    }

    function resize() {
      /* Render at 50% of CSS pixels — GPU scales up smoothly for a bg anim */
      var cw = window.innerWidth;
      var ch = window.innerHeight;
      W = Math.round(cw * SCALE);
      H = Math.round(ch * SCALE);
      canvas.width  = W;
      canvas.height = H;
      canvas.style.width  = cw + 'px';
      canvas.style.height = ch + 'px';

      activePts = [];
      var aCount = window.innerWidth < 768 ? 15 : 30;
      for (var i = 0; i < aCount; i++) activePts.push(mkPt());

      buildBackground();
      buildStaticStars();
      buildVignette();
    }

    /* ── Draw active moving particles (two-pass soft glow, no shadowBlur) ── */
    function drawActive() {
      var whitePts = [], goldPts = [];
      for (var i = 0; i < activePts.length; i++) {
        (activePts[i].gold ? goldPts : whitePts).push(activePts[i]);
      }

      var wA = 0.78 + 0.22 * Math.sin(tick * 0.025);
      var gA = 0.70 + 0.30 * Math.sin(tick * 0.030 + 1.4);

      function drawGroup(group, style, alpha) {
        if (!group.length) return;
        ctx.fillStyle   = style;
        ctx.beginPath();
        for (var i = 0; i < group.length; i++) {
          ctx.moveTo(group[i].x + group[i].r * 3, group[i].y);
          ctx.arc(group[i].x, group[i].y, group[i].r * 3, 0, TAU);
        }
        ctx.globalAlpha = alpha * 0.14;
        ctx.fill();

        ctx.beginPath();
        for (var j = 0; j < group.length; j++) {
          ctx.moveTo(group[j].x + group[j].r, group[j].y);
          ctx.arc(group[j].x, group[j].y, group[j].r, 0, TAU);
        }
        ctx.globalAlpha = alpha * 0.92;
        ctx.fill();
      }

      drawGroup(whitePts, 'rgba(215,225,255,1)', wA);
      drawGroup(goldPts,  'rgba(220,178,80,1)',  gA);
      ctx.globalAlpha = 1;
    }

    /* ── Move active particles (no trig: rotation-matrix approximation) ── */
    function moveActive() {
      var m = 20;
      for (var k = 0; k < activePts.length; k++) {
        var p   = activePts[k];
        var d   = p.drift;
        var cor = 1 - d * d;
        var nvx = p.vx * cor - p.vy * d;
        var nvy = p.vx * d  + p.vy * cor;
        p.vx = nvx;  p.vy = nvy;
        p.x += p.vx; p.y += p.vy;
        if (p.x < -m)    p.x = W + m;
        if (p.x > W + m) p.x = -m;
        if (p.y < -m)    p.y = H + m;
        if (p.y > H + m) p.y = -m;
      }
    }

    function frame(now) {
      /* ── 30fps throttle: skip if not enough time has elapsed ── */
      var dt = now - lastTime;
      if (!paused && dt >= FRAME_MS) {
        lastTime = now - (dt % FRAME_MS); /* prevent drift accumulation */
        tick++;

        /* 1. Static background — single GPU blit */
        ctx.drawImage(bgCanvas, 0, 0);

        /* 2. Static star layer — single blit with varying alpha for twinkle */
        ctx.globalAlpha = 0.70 + 0.30 * Math.sin(tick * 0.018);
        ctx.drawImage(staticCanvas, 0, 0);
        ctx.globalAlpha = 1;

        /* 3. Active (moving) particles — only 30 arcs */
        drawActive();
        moveActive();

        /* 4. Vignette overlay */
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, W, H);
      }

      requestAnimationFrame(frame);
    }

    /* ── Pause when tab hidden ── */
    document.addEventListener('visibilitychange', function () {
      paused = document.hidden;
    });

    /* ── Pause when hero scrolled out of view ── */
    if (typeof IntersectionObserver !== 'undefined') {
      new IntersectionObserver(function (entries) {
        if (!document.hidden) paused = !entries[0].isIntersecting;
      }, { threshold: 0 }).observe(canvas);
    }

    window.addEventListener('resize', function () {
      clearTimeout(window._heroResizeTimer);
      window._heroResizeTimer = setTimeout(resize, 150);
    }, { passive: true });

    resize();
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
