/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Cinematic Hero Canvas
   City of London skyline at blue hour — canvas renderer.
   Seeded LCG RNG ensures identical render every load/resize.
   ─────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var canvas = null;
  var ctx    = null;
  var resizeTimer = null;

  /* ── Seeded LCG — identical skyline on every render ── */
  function mkRand(s) {
    var seed = (s | 0) >>> 0;
    return function () {
      seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
      return seed / 0xFFFFFFFF;
    };
  }

  /* ── Main render ── */
  function render() {
    if (!canvas || !ctx) return;

    var W = canvas.width  = window.innerWidth;
    var H = canvas.height = window.innerHeight;

    /* Horizon at 52% — towers fill the frame */
    var HZ = H * 0.52;
    ctx.clearRect(0, 0, W, H);

    /* ── 1. Sky gradient ── */
    var sky = ctx.createLinearGradient(0, 0, 0, HZ);
    sky.addColorStop(0,    '#020308');
    sky.addColorStop(0.15, '#03050F');
    sky.addColorStop(0.42, '#060A1C');
    sky.addColorStop(0.68, '#0A1030');
    sky.addColorStop(0.85, '#0C1540');
    sky.addColorStop(0.94, '#0D1745');
    sky.addColorStop(1,    '#0E183F');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, HZ + 2);

    /* Warm residual twilight near horizon */
    var warmH = ctx.createLinearGradient(0, HZ * 0.62, 0, HZ);
    warmH.addColorStop(0,    'rgba(0,0,0,0)');
    warmH.addColorStop(0.65, 'rgba(28,18,6,0.07)');
    warmH.addColorStop(1,    'rgba(40,24,8,0.16)');
    ctx.fillStyle = warmH;
    ctx.fillRect(0, HZ * 0.62, W, HZ - HZ * 0.62);

    /* ── 2. City glow — two focal clusters ── */
    var sc  = Math.min(1, W / 1440);
    var mid = W * 0.5;

    var cg1 = ctx.createRadialGradient(mid + 65 * sc, HZ, 0, mid + 65 * sc, HZ, W * 0.42);
    cg1.addColorStop(0,    'rgba(20,48,124,0.72)');
    cg1.addColorStop(0.28, 'rgba(14,34,92,0.42)');
    cg1.addColorStop(0.65, 'rgba(8,18,58,0.18)');
    cg1.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.fillStyle = cg1; ctx.fillRect(0, 0, W, HZ + 2);

    var cg2 = ctx.createRadialGradient(mid - 240 * sc, HZ, 0, mid - 240 * sc, HZ, W * 0.3);
    cg2.addColorStop(0,   'rgba(16,38,106,0.48)');
    cg2.addColorStop(0.5, 'rgba(10,24,72,0.2)');
    cg2.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = cg2; ctx.fillRect(0, 0, W, HZ + 2);

    var cg3 = ctx.createRadialGradient(W * 0.12, HZ, 0, W * 0.12, HZ, W * 0.22);
    cg3.addColorStop(0, 'rgba(14,32,90,0.38)');
    cg3.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cg3; ctx.fillRect(0, 0, W, HZ + 2);

    /* ── 3. Stars ── */
    var rs = mkRand(9001);
    for (var i = 0; i < 110; i++) {
      var sx = rs() * W, sy = rs() * HZ * 0.58;
      var sa = 0.05 + rs() * 0.26, sr = 0.25 + rs() * 0.75;
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(210,220,255,' + sa + ')'; ctx.fill();
    }

    /* ── 4. Building layers ── */
    function drawLayer(seed, minH, maxH, minW, maxW, R, G, B, winAlphaMid, gapChance) {
      var r = mkRand(seed), x = -r() * 80;
      while (x < W + 120) {
        var bw = (minW + r() * (maxW - minW)) | 0;
        var bh = (minH + r() * (maxH - minH)) | 0;
        var bTop = HZ - bh;

        var bg = ctx.createLinearGradient(0, bTop, 0, HZ);
        var dim = r() * 6 | 0;
        bg.addColorStop(0, 'rgba(' + (R + 4) + ',' + (G + 4) + ',' + (B + 4) + ',1)');
        bg.addColorStop(1, 'rgba(' + (R - dim) + ',' + (G - dim) + ',' + (B - dim) + ',1)');
        ctx.fillStyle = bg; ctx.fillRect(x, bTop, bw, (HZ - bTop + 2) | 0);

        var density = 0.08 + r() * 0.78;
        var isBanded = r() < 0.28;
        var bandPeriod = 2 + Math.floor(r() * 3);
        var wgx = 5 + r() * 3.5, wgy = 5 + r() * 3.5;
        var floorH = wgy + 2;
        var floorIdx = 0;
        for (var wy = bTop + 8; wy < HZ - 5; wy += floorH, floorIdx++) {
          var rowLit = isBanded ? (floorIdx % bandPeriod === 0) : true;
          for (var wx = x + 5; wx < x + bw - 3; wx += wgx + 2) {
            if (rowLit && r() < density) {
              var wm = r();
              var cool = r() < 0.14;
              var wr, wg, wb;
              if (cool) { wr = (160 + wm * 30) | 0; wg = (185 + wm * 25) | 0; wb = 240; }
              else      { wr = (196 + wm * 50) | 0; wg = (160 + wm * 38) | 0; wb = (58 + wm * 24) | 0; }
              ctx.shadowBlur = 2 + r() * 4;
              ctx.shadowColor = 'rgba(' + wr + ',' + wg + ',' + wb + ',0.9)';
              ctx.fillStyle = 'rgba(' + wr + ',' + wg + ',' + wb + ',' + (winAlphaMid * (0.7 + density * 0.4)).toFixed(2) + ')';
              ctx.fillRect(wx | 0, wy | 0, 2, 2);
            }
          }
        }
        ctx.shadowBlur = 0;
        x += bw + (r() < gapChance ? r() * 4 : 0);
      }
    }

    /* Far background */
    drawLayer(11111, 55, 155, 28, 72, 14, 28, 68, 0.24, 0.15);
    /* Midground */
    drawLayer(22222, 110, 255, 42, 108, 9, 16, 44, 0.50, 0.20);

    /* ── 5. Iconic buildings ── */
    function winDots(bx, bTop2, bw2, seed2, density2) {
      var rw = mkRand(seed2);
      var isBanded = rw() < 0.3, bandP = 2 + Math.floor(rw() * 3), fi = 0;
      var wgx2 = 5, wgy2 = 6;
      for (var wy2 = bTop2 + 10; wy2 < HZ - 5; wy2 += wgy2 + 2, fi++) {
        var rowLit = isBanded ? (fi % bandP === 0) : true;
        for (var wx2 = bx + 5; wx2 < bx + bw2 - 3; wx2 += wgx2 + 2) {
          if (rowLit && rw() < density2) {
            var wm2 = rw(), cool2 = rw() < 0.12;
            var wr2, wg2, wb2;
            if (cool2) { wr2 = (162 + wm2 * 28) | 0; wg2 = (188 + wm2 * 22) | 0; wb2 = 245; }
            else       { wr2 = (200 + wm2 * 50) | 0; wg2 = (164 + wm2 * 36) | 0; wb2 = (62 + wm2 * 24) | 0; }
            ctx.shadowBlur = 4;
            ctx.shadowColor = 'rgba(' + wr2 + ',' + wg2 + ',' + wb2 + ',0.88)';
            ctx.fillStyle   = 'rgba(' + wr2 + ',' + wg2 + ',' + wb2 + ',0.72)';
            ctx.fillRect(wx2 | 0, wy2 | 0, 2, 2);
          }
        }
      }
      ctx.shadowBlur = 0;
    }

    /* St Paul's area */
    (function () {
      var spCx = mid - 280 * sc, bh = HZ * 0.38, bTop2 = HZ - bh, bw2 = 95 * sc;
      ctx.fillStyle = '#08162F';
      ctx.fillRect((spCx - bw2 / 2 - 55 * sc) | 0, (HZ - bh * 0.65) | 0, (42 * sc) | 0, (bh * 0.65) | 0);
      ctx.fillRect((spCx + bw2 / 2 + 8 * sc) | 0,  (HZ - bh * 0.58) | 0, (38 * sc) | 0, (bh * 0.58) | 0);
      ctx.fillStyle = '#091732'; ctx.fillRect((spCx - bw2 / 2) | 0, bTop2 | 0, bw2 | 0, bh | 0);
      ctx.beginPath();
      ctx.ellipse(spCx, bTop2, bw2 * 0.22, bh * 0.18, 0, Math.PI, 0);
      ctx.fillStyle = '#0A1830'; ctx.fill();
      winDots((spCx - bw2 / 2) | 0, bTop2 | 0, bw2 | 0, 44444, 0.42);
    })();

    /* The Gherkin */
    (function () {
      var gcx = mid - 92 * sc, gh = HZ * 0.58, gTop = HZ - gh, gwM = 44 * sc;
      var cx2 = gcx - gwM * 0.52;
      ctx.beginPath();
      ctx.moveTo(gcx, gTop + 5);
      ctx.bezierCurveTo(gcx + gwM * 0.72, gTop + gh * 0.26, gcx + gwM, gTop + gh * 0.52, gcx + gwM * 0.52, HZ);
      ctx.lineTo(cx2, HZ);
      ctx.bezierCurveTo(gcx - gwM, gTop + gh * 0.52, gcx - gwM * 0.72, gTop + gh * 0.26, gcx, gTop + 5);
      ctx.closePath(); ctx.fillStyle = '#06102D'; ctx.fill();
      ctx.save(); ctx.clip();
      var rDi = mkRand(55555);
      for (var gy = gTop + 12; gy < HZ - 4; gy += 9) {
        for (var gx = gcx - gwM; gx < gcx + gwM; gx += 8) {
          if (rDi() < 0.44) {
            var wmG = rDi(), wrG = (198 + wmG * 52) | 0, wgG = (162 + wmG * 38) | 0, wbG = (62 + wmG * 26) | 0;
            ctx.shadowBlur = 4; ctx.shadowColor = 'rgba(' + wrG + ',' + wgG + ',' + wbG + ',0.9)';
            ctx.fillStyle  = 'rgba(' + wrG + ',' + wgG + ',' + wbG + ',0.7)';
            ctx.fillRect(gx | 0, gy | 0, 2, 2);
          }
        }
      }
      ctx.restore(); ctx.shadowBlur = 0;
      var rB = mkRand(55550);
      for (var bi = 0; bi < 3; bi++) {
        var bx2 = (gcx - gwM * 1.5 + bi * 40 * sc) | 0, bh2 = (HZ * (0.18 + rB() * 0.12)) | 0;
        ctx.fillStyle = '#050D25';
        ctx.fillRect(bx2, HZ - bh2, (28 * sc) | 0, bh2);
        winDots(bx2, HZ - bh2, 28 * sc | 0, 55540 + bi, 0.38);
      }
    })();

    /* Walkie-Talkie */
    (function () {
      var wcx = mid + 26 * sc, wh = HZ * 0.50, wTop = HZ - wh;
      var wTopW = 72 * sc, wBotW = 50 * sc;
      ctx.beginPath();
      ctx.moveTo(wcx - wTopW / 2, wTop); ctx.lineTo(wcx + wTopW / 2, wTop);
      ctx.bezierCurveTo(wcx + wBotW / 2 * 1.1, wTop + wh * 0.7, wcx + wBotW / 2, HZ - 4, wcx + wBotW / 2, HZ);
      ctx.lineTo(wcx - wBotW / 2, HZ);
      ctx.bezierCurveTo(wcx - wBotW / 2, HZ - 4, wcx - wBotW / 2 * 1.1, wTop + wh * 0.7, wcx - wTopW / 2, wTop);
      ctx.closePath(); ctx.fillStyle = '#050E27'; ctx.fill();
      winDots((wcx - wTopW / 2) | 0, wTop | 0, wTopW | 0, 66666, 0.68);
    })();

    /* Leadenhall */
    (function () {
      var lcx = mid + 120 * sc, lh = HZ * 0.64, lTop = HZ - lh, lw = 52 * sc;
      ctx.beginPath();
      ctx.moveTo(lcx - lw / 2, lTop + lh * 0.1);
      ctx.lineTo(lcx + lw / 2, lTop);
      ctx.lineTo(lcx + lw / 2, HZ);
      ctx.lineTo(lcx - lw / 2, HZ);
      ctx.closePath(); ctx.fillStyle = '#060F29'; ctx.fill();
      winDots((lcx - lw / 2) | 0, lTop | 0, lw | 0, 77777, 0.70);
      var adj = (lcx + lw / 2) | 0;
      ctx.fillStyle = '#050C24';
      ctx.fillRect(adj, (HZ - HZ * 0.36) | 0, (38 * sc) | 0, (HZ * 0.36) | 0);
      winDots(adj, (HZ - HZ * 0.36) | 0, 38 * sc | 0, 77770, 0.52);
    })();

    /* Tower 42 */
    (function () {
      var t42cx = mid + 208 * sc, t42h = HZ * 0.46, t42Top = HZ - t42h, t42w = 36 * sc;
      ctx.fillStyle = '#060F28';
      ctx.fillRect((t42cx - t42w / 2) | 0, t42Top | 0, t42w | 0, t42h | 0);
      ctx.fillRect((t42cx - t42w * 0.72) | 0, (HZ - t42h * 0.3) | 0, (t42w * 1.44) | 0, (t42h * 0.3) | 0);
      winDots((t42cx - t42w / 2) | 0, t42Top | 0, t42w | 0, 88888, 0.62);
    })();

    /* Dense fabric + foreground */
    drawLayer(44444, 140, 310, 36, 88, 6, 11, 28, 0.62, 0.12);
    drawLayer(33333, 170, 360, 55, 140, 4, 7, 18, 0.78, 0.08);

    /* ── 6. Thames water ── */
    var wTop2 = HZ + 2, wBot = HZ + H * 0.075;
    var wg = ctx.createLinearGradient(0, wTop2, 0, wBot);
    wg.addColorStop(0, 'rgba(7,13,36,0.97)'); wg.addColorStop(1, 'rgba(2,3,11,1)');
    ctx.fillStyle = wg; ctx.fillRect(0, wTop2 | 0, W, (wBot - wTop2) | 0);

    var rr2 = mkRand(55556);
    for (var ri = 0; ri < 90; ri++) {
      var rx = rr2() * W, rlen = 8 + rr2() * 52, rA = 0.03 + rr2() * 0.1;
      var rwm = rr2(), coolR = rr2() < 0.15;
      var rwr, rwgr, rwb;
      if (coolR) { rwr = (155 + rwm * 30) | 0; rwgr = (180 + rwm * 25) | 0; rwb = 235; }
      else       { rwr = (176 + rwm * 56) | 0; rwgr = (142 + rwm * 44) | 0; rwb = (55 + rwm * 28) | 0; }
      var rfl = ctx.createLinearGradient(0, wTop2, 0, wTop2 + rlen);
      rfl.addColorStop(0, 'rgba(' + rwr + ',' + rwgr + ',' + rwb + ',' + rA + ')');
      rfl.addColorStop(1, 'rgba(' + rwr + ',' + rwgr + ',' + rwb + ',0)');
      ctx.fillStyle = rfl; ctx.fillRect((rx - 0.9) | 0, wTop2 + 1, 1.8, rlen | 0);
      if (rr2() < 0.25) {
        var rx2 = rx + (rr2() * 8 - 4), rlen2 = rlen * 0.6;
        var rfl2 = ctx.createLinearGradient(0, wTop2, 0, wTop2 + rlen2);
        rfl2.addColorStop(0, 'rgba(' + rwr + ',' + rwgr + ',' + rwb + ',' + (rA * 0.4) + ')');
        rfl2.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rfl2; ctx.fillRect((rx2 - 0.6) | 0, wTop2 + 1, 1.2, rlen2 | 0);
      }
    }

    ctx.fillStyle = '#01020A';
    ctx.fillRect(0, wBot | 0, W, H - (wBot | 0));

    /* ── 7. Radial vignette ── */
    var vig = ctx.createRadialGradient(W * 0.5, H * 0.55, H * 0.18, W * 0.5, H * 0.55, H * 0.88);
    vig.addColorStop(0,    'rgba(0,0,0,0)');
    vig.addColorStop(0.65, 'rgba(2,3,10,0.08)');
    vig.addColorStop(1,    'rgba(2,3,10,0.72)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
  }

  /* ── Init ── */
  function init() {
    var el = document.getElementById('hero-canvas');
    if (!el) return;
    canvas = el;
    ctx    = el.getContext('2d');
    render();
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(render, 80);
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window._heroAnimStop = function () { /* no-op: static render */ };
})();
