/**
 * AZLUNA SUBTLE AMBIENT PETAL & PARALLAX ENGINE
 * Strictly background-only (z-index: 1) — never covers or obstructs main components, cards, or text.
 */
(function () {
  'use strict';

  if (document.documentElement.classList.contains('rm')) return;

  var clamp = function (v, min, max) { return Math.max(min, Math.min(max, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };

  var pointer = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.5,
    nx: 0,
    ny: 0,
    tx: 0,
    ty: 0
  };

  window.addEventListener('mousemove', function (e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.tx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
    pointer.ty = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
  }, { passive: true });

  // Hide legacy CSS petals and cartoon birds/doves completely
  var legacyEls = document.querySelectorAll('.petals, .sky, .dove, .bird');
  for (var lIdx = 0; lIdx < legacyEls.length; lIdx++) {
    legacyEls[lIdx].style.display = 'none';
  }

  // Background-only canvas (z-index: 1 — strictly behind .inner [z-index: 5] and #cover [z-index: 100])
  var canvas = document.getElementById('azlunaGpuCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'azlunaGpuCanvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;';
    document.body.appendChild(canvas);
  }

  var ctx = canvas.getContext('2d', { alpha: true });
  var cw = window.innerWidth;
  var ch = window.innerHeight;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas() {
    cw = window.innerWidth;
    ch = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(cw * dpr);
    canvas.height = Math.floor(ch * dpr);
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  var isMobile = window.innerWidth < 680;

  var PALETTES = [
    { inner: '#9e193b', outer: '#380412', rim: '#e6c687' },
    { inner: '#c43258', outer: '#54091d', rim: '#f0d59c' },
    { inner: '#e88ead', outer: '#7a1b38', rim: '#fae0ea' }
  ];

  var petalCount = isMobile ? 8 : 12;
  var petals = [];

  function createPetal(randomY) {
    var pal = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    return {
      x: rnd(0, cw),
      y: randomY ? rnd(-40, ch + 40) : rnd(-60, -15),
      size: rnd(6.5, 11.5),
      vx: rnd(-0.22, 0.28),
      vy: rnd(0.42, 0.88),
      rx: rnd(0, Math.PI * 2),
      ry: rnd(0, Math.PI * 2),
      rz: rnd(0, Math.PI * 2),
      vrx: rnd(-0.015, 0.015),
      vry: rnd(-0.018, 0.018),
      vrz: rnd(-0.01, 0.01),
      swayPhase: rnd(0, Math.PI * 2),
      swaySpeed: rnd(0.01, 0.02),
      swayAmp: rnd(0.3, 0.75),
      pal: pal,
      alpha: rnd(0.38, 0.62)
    };
  }

  for (var i = 0; i < petalCount; i++) {
    petals.push(createPetal(true));
  }

  function drawPetal(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rz);

    var scaleX = Math.cos(p.rx) * 0.7 + 0.3;
    var scaleY = Math.sin(p.ry) * 0.65 + 0.35;
    ctx.scale(scaleX, scaleY);
    ctx.globalAlpha = p.alpha;

    var s = p.size;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.85);
    ctx.bezierCurveTo(-s * 0.95, s * 0.55, -s * 1.15, -s * 0.45, -s * 0.42, -s * 0.88);
    ctx.bezierCurveTo(-s * 0.15, -s * 1.02, -s * 0.04, -s * 0.78, 0, -s * 0.72);
    ctx.bezierCurveTo(s * 0.04, -s * 0.78, s * 0.15, -s * 1.02, s * 0.42, -s * 0.88);
    ctx.bezierCurveTo(s * 1.15, -s * 0.45, s * 0.95, s * 0.55, 0, s * 0.85);
    ctx.closePath();

    var grad = ctx.createRadialGradient(-s * 0.2, -s * 0.25, s * 0.1, 0, 0, s * 1.1);
    grad.addColorStop(0, p.pal.inner);
    grad.addColorStop(1, p.pal.outer);

    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 0.45;
    ctx.strokeStyle = p.pal.rim;
    ctx.stroke();
    ctx.restore();
  }

  function animateFrame() {
    if (document.hidden) {
      requestAnimationFrame(animateFrame);
      return;
    }
    pointer.nx = lerp(pointer.nx, pointer.tx, 0.05);
    pointer.ny = lerp(pointer.ny, pointer.ty, 0.05);

    if (ctx) {
      ctx.clearRect(0, 0, cw, ch);
      for (var i = 0; i < petals.length; i++) {
        var p = petals[i];
        p.swayPhase += p.swaySpeed;
        p.rx += p.vrx;
        p.ry += p.vry;
        p.rz += p.vrz;
        p.x += p.vx + Math.sin(p.swayPhase) * p.swayAmp;
        p.y += p.vy;

        if (p.y > ch + 40) {
          p.y = -30;
          p.x = rnd(0, cw);
        }
        if (p.x > cw + 40) p.x = -30;
        if (p.x < -40) p.x = cw + 30;

        drawPetal(ctx, p);
      }
    }

    requestAnimationFrame(animateFrame);
  }

  requestAnimationFrame(animateFrame);
})();
