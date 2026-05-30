/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Hero Canvas: Constellation
   Dim drifting particles with gold/indigo connections.
   ─────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var raf = null;

  function start() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, pts;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      pts = [];
      var count = Math.min(110, Math.floor(W * H / 9000));
      for (var i = 0; i < count; i++) {
        pts.push({
          x:    Math.random() * W,
          y:    Math.random() * H,
          vx:   (Math.random() - 0.5) * 0.22,
          vy:   (Math.random() - 0.5) * 0.14,
          r:    1.0 + Math.random() * 1.8,
          a:    0.35 + Math.random() * 0.45,
          gold: Math.random() < 0.3
        });
      }
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);

      /* Background */
      var bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0,   '#020308');
      bg.addColorStop(0.5, '#060A1E');
      bg.addColorStop(1,   '#03050F');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      /* Very subtle centre bloom */
      var bloom = ctx.createRadialGradient(W * .5, H * .42, 0, W * .5, H * .42, W * .5);
      bloom.addColorStop(0,   'rgba(166,124,0,0.04)');
      bloom.addColorStop(0.5, 'rgba(99,102,241,0.025)');
      bloom.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, W, H);

      var connDist = Math.min(W, H) * 0.17;

      /* Connections */
      for (var i = 0; i < pts.length; i++) {
        for (var j = i + 1; j < pts.length; j++) {
          var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connDist) {
            var alpha = (1 - dist / connDist) * 0.22;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = (pts[i].gold || pts[j].gold)
              ? 'rgba(166,124,0,' + alpha + ')'
              : 'rgba(165,180,252,' + alpha + ')';
            ctx.lineWidth = 0.45;
            ctx.stroke();
          }
        }
      }

      /* Dots */
      for (var k = 0; k < pts.length; k++) {
        var p = pts[k];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? 'rgba(212,175,80,' + p.a + ')'
          : 'rgba(210,220,255,' + p.a + ')';
        ctx.fill();

        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
      }

      /* Vignette */
      var vig = ctx.createRadialGradient(W * .5, H * .5, H * .18, W * .5, H * .5, H * .88);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(2,3,10,0.82)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(frame);
    }

    window.addEventListener('resize', function () {
      resize();
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
