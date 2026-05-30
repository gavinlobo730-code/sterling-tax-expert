/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Hero Canvas: Constellation
   Continuously drifting particles with gold/indigo connections,
   gentle twinkle, and flowing orbital micro-clusters.
   ─────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var raf  = null;
  var tick = 0;

  function start() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, pts;

    function mkPt(i, total) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 0.18 + Math.random() * 0.32;
      return {
        x:      Math.random() * W,
        y:      Math.random() * H,
        vx:     Math.cos(angle) * speed,
        vy:     Math.sin(angle) * speed,
        /* gentle wander — each particle has a slow angular drift */
        drift:  (Math.random() - 0.5) * 0.006,
        r:      0.9 + Math.random() * 2.0,
        baseA:  0.4  + Math.random() * 0.5,
        /* twinkle phase so not all particles pulse together */
        phase:  Math.random() * Math.PI * 2,
        tSpeed: 0.008 + Math.random() * 0.018,
        gold:   Math.random() < 0.28
      };
    }

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      var count = Math.min(720, Math.max(360, Math.floor(W * H / 1375)));
      pts = [];
      for (var i = 0; i < count; i++) pts.push(mkPt(i, count));
    }

    function frame() {
      tick++;
      ctx.clearRect(0, 0, W, H);

      /* ── Background ── */
      var bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0,    '#010207');
      bg.addColorStop(0.45, '#05091B');
      bg.addColorStop(1,    '#02040E');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      /* Slow-breathing dual bloom — gold left, indigo right */
      var breathe = 0.5 + 0.5 * Math.sin(tick * 0.004);
      var g1 = ctx.createRadialGradient(W * .25, H * .5, 0, W * .25, H * .5, W * .5);
      g1.addColorStop(0,   'rgba(166,124,0,' + (0.055 + breathe * 0.03) + ')');
      g1.addColorStop(0.6, 'rgba(120,90,0,0.02)');
      g1.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);

      var g2 = ctx.createRadialGradient(W * .76, H * .44, 0, W * .76, H * .44, W * .45);
      g2.addColorStop(0,   'rgba(99,102,241,' + (0.06 + (1 - breathe) * 0.03) + ')');
      g2.addColorStop(0.6, 'rgba(60,50,180,0.02)');
      g2.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

      var connDist = Math.min(W, H) * 0.19;

      /* ── Connection lines ── */
      for (var i = 0; i < pts.length; i++) {
        for (var j = i + 1; j < pts.length; j++) {
          var dx = pts[i].x - pts[j].x;
          var dy = pts[i].y - pts[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connDist) {
            var t = 1 - dist / connDist;
            /* lines fade with distance and also breathe with particle twinkle */
            var lineA = t * t * 0.28;
            var isGold = pts[i].gold || pts[j].gold;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = isGold
              ? 'rgba(200,158,60,'  + lineA + ')'
              : 'rgba(165,180,252,' + lineA + ')';
            ctx.lineWidth = 0.5 + t * 0.5;
            ctx.stroke();
          }
        }
      }

      /* ── Particles ── */
      for (var k = 0; k < pts.length; k++) {
        var p = pts[k];

        /* Twinkle: alpha pulses on each particle's own phase */
        p.phase += p.tSpeed;
        var twinkle = 0.65 + 0.35 * Math.sin(p.phase);
        var alpha   = p.baseA * twinkle;

        /* Glow halo for brighter particles */
        if (alpha > 0.55) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2);
          var glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.5);
          glow.addColorStop(0, p.gold
            ? 'rgba(212,175,80,' + (alpha * 0.2) + ')'
            : 'rgba(165,180,252,' + (alpha * 0.15) + ')');
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = glow;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? 'rgba(220,180,80,'  + alpha + ')'
          : 'rgba(215,225,255,' + alpha + ')';
        ctx.fill();

        /* Move — wander by rotating velocity vector slightly each frame */
        var vAngle = Math.atan2(p.vy, p.vx) + p.drift;
        var spd    = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        p.vx = Math.cos(vAngle) * spd;
        p.vy = Math.sin(vAngle) * spd;
        p.x += p.vx;
        p.y += p.vy;

        /* Wrap edges with a small margin so particles glide in smoothly */
        var m = 20;
        if (p.x < -m) p.x = W + m;
        if (p.x > W + m) p.x = -m;
        if (p.y < -m) p.y = H + m;
        if (p.y > H + m) p.y = -m;
      }

      /* ── Edge vignette ── */
      var vig = ctx.createRadialGradient(W * .5, H * .45, H * .12, W * .5, H * .45, H * .9);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(1,2,10,0.78)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(frame);
    }

    window.addEventListener('resize', function () { resize(); }, { passive: true });
    resize();
    frame();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
