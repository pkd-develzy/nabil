/**
 * AZLUNA LIVING WIND ENGINE
 * Semua rangkaian bunga bergerak seperti bunga hidup tertiup angin:
 * - Setiap rangkaian = batang lentur (pegas teredam) dengan kekakuan & berat berbeda,
 *   jadi gerakannya terlambat, memantul, dan meliuk (rotate + skew dari pangkal batang).
 * - Angin dasar berlapis (beberapa gelombang sinus) + hembusan (gust) acak yang
 *   merambat dari satu sisi layar ke sisi lain.
 * - Scroll dan sapuan jari/mouse ikut menggerakkan udara di sekitar bunga.
 * - Bunga "mekar" (tumbuh + muncul) saat pertama kali terlihat.
 * - Hanya bunga yang terlihat yang dihitung (hemat baterai); berhenti saat tab disembunyikan.
 */
(function () {
  'use strict';

  var SEL = '.gl-img,.card-flora-img,.card-crown,.arch-swag,.dress-bouquet,.fam-bouquet';
  var reduced = document.documentElement.classList.contains('rm');
  var items = [];
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var vw = window.innerWidth;

  /* ---------- angin ---------- */
  var gust = { t0: -99, dur: 1.8, power: 0, dir: 1, next: 2.5 };
  var scrollWind = 0, lastScrollY = window.scrollY, lastScrollT = performance.now();
  var pointer = { x: -9999, y: -9999, vx: 0, vy: 0, t: 0 };

  function scheduleGust(t) {
    gust.t0 = t;
    gust.dur = rnd(1.5, 2.6);
    gust.power = rnd(0.9, 1.8);
    gust.dir = Math.random() < 0.78 ? 1 : -1;      // kebanyakan dari kiri ke kanan
    gust.next = t + gust.dur + rnd(3.2, 8.5);
  }

  // kekuatan angin di posisi x (px layar) pada waktu t (detik)
  function wind(t, x) {
    var base = 0.55 * Math.sin(t * 0.83 + x * 0.0042)
             + 0.30 * Math.sin(t * 1.61 + 1.3 + x * 0.0071)
             + 0.16 * Math.sin(t * 3.07 + 2.1 + x * 0.0113);
    var g = 0;
    var p = (t - gust.t0) / gust.dur;
    if (p >= 0 && p <= 1.35) {
      var travel = gust.dir > 0 ? (-320 + p * (vw + 640)) : (vw + 320 - p * (vw + 640));
      var d = (x - travel) / 260;
      g = gust.power * gust.dir * Math.exp(-d * d) * Math.sin(Math.min(1, p) * Math.PI * 0.5 + 0.6);
    }
    return base + g + scrollWind;
  }

  /* ---------- registrasi bunga ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var w = e.target.__wind; if (!w) return;
      w.visible = e.isIntersecting;
      if (e.isIntersecting && !w.born) w.born = performance.now() + w.bloomDelay;
    });
  }, { rootMargin: '60px' }) : null;

  function register(el) {
    if (el.__wind) return;
    var r = el.getBoundingClientRect();
    var size = Math.max(r.width, r.height) || 200;
    var cs = getComputedStyle(el);
    var oy = parseFloat((cs.transformOrigin || '').split(' ')[1]);
    var anchorBottom = !(oy < (r.height || 1) * 0.5);   // pangkal di bawah atau di atas
    // Rangkaian sudut (menempel tepi layar): ayunan dibatasi agar bagian cerminan
    // tersembunyi selalu menutupi tepi (tidak ada sisi lurus yang terlihat)
    var corner = !!(el.parentElement && el.parentElement.classList.contains('bleed'));
    el.__wind = {
      corner: corner,
      lim: corner ? 6 : 13,
      skewF: corner ? 0.45 : 0.55,
      a: 0, v: 0,
      // bunga besar = batang lebih berat & kaku, bunga kecil = lebih lincah
      k: size > 320 ? rnd(7, 10) : size > 160 ? rnd(10, 15) : rnd(14, 22),
      c: rnd(1.5, 2.4),
      amp: corner ? rnd(2.4, 3.1) : size > 320 ? rnd(2.8, 3.6) : size > 160 ? rnd(3.8, 4.8) : rnd(5, 6.4),
      sign: anchorBottom ? 1 : -1,
      ph: rnd(0, 6.28),
      breathe: rnd(0.008, 0.016),
      visible: !io,
      born: io ? 0 : performance.now(),
      bloomDelay: rnd(0, 380),
      cx: r.left + r.width / 2, cy: r.top + r.height / 2
    };
    el.style.willChange = 'transform';
    if (!reduced) el.style.opacity = '0';
    items.push(el);
    if (io) io.observe(el);
  }

  function collect() {
    var list = document.querySelectorAll(SEL);
    for (var i = 0; i < list.length; i++) register(list[i]);
    // buang elemen yang sudah dihapus dari DOM (mis. kartu ucapan diganti)
    items = items.filter(function (el) { return el.isConnected; });
  }

  /* ---------- interaksi: scroll & sentuhan ---------- */
  window.addEventListener('scroll', function () {
    var now = performance.now(), dy = window.scrollY - lastScrollY, dt = Math.max(16, now - lastScrollT);
    var v = dy / dt; // px per ms
    scrollWind += Math.max(-1.2, Math.min(1.2, v * 0.9)) * 0.35;
    lastScrollY = window.scrollY; lastScrollT = now;
  }, { passive: true });

  function onPointer(x, y) {
    var now = performance.now(), dt = Math.max(16, now - pointer.t);
    if (pointer.t) { pointer.vx = (x - pointer.x) / dt; pointer.vy = (y - pointer.y) / dt; }
    pointer.x = x; pointer.y = y; pointer.t = now;
  }
  window.addEventListener('pointermove', function (e) { onPointer(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener('touchmove', function (e) { if (e.touches[0]) onPointer(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });

  /* ---------- loop fisika ---------- */
  var easeOutBack = function (p) { var c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
  var last = performance.now(), frame = 0;

  function tick(now) {
    requestAnimationFrame(tick);
    if (document.hidden) { last = now; return; }
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    var t = now / 1000;
    if (t > gust.next) scheduleGust(t);
    scrollWind *= Math.pow(0.08, dt);              // hembusan dari scroll mereda
    pointer.vx *= Math.pow(0.02, dt); pointer.vy *= Math.pow(0.02, dt);
    vw = window.innerWidth;
    var refresh = (frame++ % 30) === 0;            // posisi diperbarui berkala (murah)

    for (var i = 0; i < items.length; i++) {
      var el = items[i], w = el.__wind;
      if (!w.visible) continue;
      if (refresh) { var r = el.getBoundingClientRect(); w.cx = r.left + r.width / 2; w.cy = r.top + r.height / 2; }

      // gaya angin + tiupan jari di dekat bunga
      var f = wind(t + w.ph * 0.05, w.cx);
      var dx = pointer.x - w.cx, dy = pointer.y - w.cy, dist2 = dx * dx + dy * dy;
      if (dist2 < 260 * 260) f += pointer.vx * 3.2 * (1 - Math.sqrt(dist2) / 260);
      var target = f * w.amp;

      // pegas teredam: batang mengikuti angin dengan sedikit terlambat & memantul
      var acc = w.k * (target - w.a) - w.c * w.v;
      w.v += acc * dt; w.a += w.v * dt;
      if (w.a > w.lim) w.a = w.lim; if (w.a < -w.lim) w.a = -w.lim;

      var rot = w.a * w.sign;
      var skew = -rot * w.skewF;                     // melengkung dari pangkal (meliuk)
      // napas: rangkaian sudut hanya membesar (>=1) agar tepi tetap tertutup
      var breath = w.corner ? 1 + w.breathe * (0.5 + 0.5 * Math.sin(t * 1.25 + w.ph)) : 1 + w.breathe * Math.sin(t * 1.25 + w.ph);
      var s = breath, op = 1;
      if (w.born && now >= w.born) {
        var p = Math.min(1, (now - w.born) / 1500);
        if (p < 1) { s *= 0.55 + 0.45 * easeOutBack(p); op = Math.min(1, p * 1.8); }
        else if (!w.done) { w.done = true; el.style.opacity = ''; }
      } else if (!reduced) { op = 0; }
      el.style.transform = 'rotate(' + rot.toFixed(3) + 'deg) skewX(' + skew.toFixed(3) + 'deg) scale(' + s.toFixed(4) + ')';
      if (!w.done && !reduced) el.style.opacity = op.toFixed(3);
    }
  }

  function start() {
    collect();
    if (reduced) { items.forEach(function (el) { el.style.opacity = ''; }); return; }
    scheduleGust(performance.now() / 1000 - 3);
    requestAnimationFrame(tick);
    // kartu & ucapan ditambahkan dinamis -> daftarkan bunga baru otomatis
    if ('MutationObserver' in window) {
      var pending = false;
      new MutationObserver(function () {
        if (pending) return; pending = true;
        setTimeout(function () { pending = false; collect(); }, 120);
      }).observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
