/* ---------- DEF GRADIENTS FOR EMBLEMS & GOLD SHINE ---------- */
if($('#defs')) {
  $('#defs').innerHTML = '<defs>' +
    '<linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff4d4"/><stop offset=".38" stop-color="#e2c286"/><stop offset=".72" stop-color="#b58942"/><stop offset="1" stop-color="#6e4c17"/></linearGradient>' +
    '<radialGradient id="gcore"><stop offset="0" stop-color="#f3e3b8"/><stop offset=".6" stop-color="#c9a56b"/><stop offset="1" stop-color="#8a6730"/></radialGradient>' +
    '<linearGradient id="lamp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe3a0"/><stop offset=".5" stop-color="#f0b24c"/><stop offset="1" stop-color="#b97a22"/></linearGradient>' +
  '</defs>';
}

/* ---------- CORNER BOTANICAL GARLANDS (SEMUA FLORAL MILIK KLIEN) ----------
   Setiap bagian memakai rangkaian bunga yang berbeda agar tidak monoton:
   - frame/*  : bingkai cat air (dari gambar referensi)       -> sampul, hero, hadiah, penutup
   - peony-*  : 4121941_89159.svg                              -> mempelai, ucapan
   - red-spray-* : floral burgundy.svg                         -> acara, rsvp
   - pink-sprig-* : 36610889_fin_9.svg                         -> lokasi
   kind: 'corner' = menempel rapat di sudut, 'float' = rangkaian bebas yang keluar sedikit dari tepi */
var FLORA_BASE = '/images/florals/';
var SECTION_FLORA = {
  mempelai: [{ pos: 'tr', img: 'set/peony-tr', gm: 1.35 }, { pos: 'bl', img: 'set/peony-bl', gm: 1.35 }],
  acara:    [{ pos: 'tl', img: 'set/red-spray-1', kind: 'float', gm: .78, rot: -8 }, { pos: 'br', img: 'set/red-spray-3', kind: 'float', gm: .78, rot: 10 }],
  lokasi:   [{ pos: 'tl', img: 'set/pink-sprig-b', kind: 'float', gm: 1.05, rot: 16 }, { pos: 'br', img: 'set/pink-sprig-a', kind: 'float', gm: 1.05, rot: -12 }],
  hadiah:   [{ pos: 'tr', img: 'frame/frame-tr' }, { pos: 'bl', img: 'frame/frame-bl', gm: .82, cls: 'f-tall' }],
  rsvp:     [{ pos: 'tr', img: 'set/red-spray-2', kind: 'float', gm: .9, rot: 6, fx: -1 }, { pos: 'bl', img: 'set/red-spray-1', kind: 'float', gm: .72, rot: 8, fx: -1 }],
  ucapan:   [{ pos: 'tl', img: 'set/peony-tr', gm: 1.3, fx: -1 }, { pos: 'br', img: 'set/peony-bl', gm: 1.3, fx: -1 }]
};

/* ---------- BUNGA BERLAPIS (alur cerita "bunga yang mekar") ----------
   Tiap sudut bisa punya 3 lapis kedalaman:
   - back  : rangkaian bertepi lembut (spray-*), besar & redup, seolah jauh di belakang; bergerak lebih lambat saat scroll
   - mid   : rangkaian utama (SECTION_FLORA / bingkai default) yang tertiup angin
   - front : tangkai kecil yang menumpuk di tepi rangkaian utama; bergerak sedikit lebih cepat
   Kepadatan mengikuti cerita: Hero (kuncup) > Ayat (hening) > MEMPELAI (mekar penuh) >
   Acara/Lokasi/RSVP (ringan, demi keterbacaan) > Ucapan/Hadiah (sedang) > PENUTUP (mekar penuh).
   off = geser tambahan [x%, y%]; untuk sudut kanan nilai x negatif (ke kiri), sudut bawah nilai y negatif (ke atas). */
var FLORA_LAYERS = {
  hero: {
    back:  [{ pos: 'tr', img: 'frame/spray-a', kind: 'float', gm: 1.05, rot: -6, off: [-6, 8] },
            { pos: 'bl', img: 'frame/spray-b', kind: 'float', gm: 1.05, rot: 8, off: [6, -6] }],
    front: [{ pos: 'tl', img: 'set/pink-sprig-a', kind: 'float', gm: .42, rot: 28, off: [34, 44] },
            { pos: 'br', img: 'set/pink-sprig-b', kind: 'float', gm: .42, rot: -24, off: [-30, -40] }]
  },
  mempelai: {
    back:  [{ pos: 'tl', img: 'frame/spray-c', kind: 'float', gm: 1.25, rot: -4, off: [4, 2] },
            { pos: 'br', img: 'frame/spray-d', kind: 'float', gm: 1.3, rot: 6, off: [-2, -2] }],
    front: [{ pos: 'tr', img: 'set/pink-sprig-b', kind: 'float', gm: .5, rot: -32, off: [-46, 52] },
            { pos: 'bl', img: 'set/pink-sprig-a', kind: 'float', gm: .5, rot: 24, off: [44, -50] }]
  },
  ucapan: {
    back:  [{ pos: 'tr', img: 'frame/spray-a', kind: 'float', gm: 1.1, rot: 4, off: [-4, 4] }]
  },
  hadiah: {
    front: [{ pos: 'tr', img: 'set/pink-sprig-a', kind: 'float', gm: .4, rot: -20, off: [-40, 46] }]
  },
  penutup: {
    back:  [{ pos: 'tl', img: 'frame/spray-d', kind: 'float', gm: 1.15, rot: -8, off: [4, 6] },
            { pos: 'br', img: 'frame/spray-c', kind: 'float', gm: 1.15, rot: 6, off: [-4, -6] }],
    front: [{ pos: 'tr', img: 'set/pink-sprig-b', kind: 'float', gm: .44, rot: -28, off: [-38, 48] },
            { pos: 'bl', img: 'set/pink-sprig-a', kind: 'float', gm: .44, rot: 22, off: [36, -46] }]
  }
};
function frameCorner(pos) {
  return { pos: pos, img: 'frame/frame-' + pos, gm: pos === 'bl' ? .82 : pos === 'br' ? 1.12 : 1, cls: pos === 'bl' ? 'f-tall' : '' };
}
/* Rangkaian sudut punya sisi lurus (terpotong tepi gambar). Agar sisi itu tidak terlihat saat
   bunga bergoyang, dipakai versi "-bleed": bunga dicerminkan melewati sisi lurus dan bagian
   ekstra itu disembunyikan di luar layar. Poros goyang = sudut asli (ox/oy). */
var CORNER_BLEED = {"frame/frame-tl": {"wr": 1.2203, "tx": 18.054, "ty": 11.596, "ox": 18.054, "oy": 11.596}, "frame/frame-tr": {"wr": 1.225, "tx": 18.367, "ty": 11.39, "ox": 81.633, "oy": 11.39}, "frame/frame-bl": {"wr": 1.4183, "tx": 29.495, "ty": 6.472, "ox": 29.495, "oy": 93.528}, "frame/frame-br": {"wr": 1.1632, "tx": 14.027, "ty": 15.035, "ox": 85.973, "oy": 84.965}, "set/roses-tl": {"wr": 1.1184, "tx": 10.588, "ty": 19.516, "ox": 10.588, "oy": 19.516}, "set/roses-br": {"wr": 1.1276, "tx": 11.319, "ty": 18.376, "ox": 88.681, "oy": 81.624}, "set/peony-tr": {"wr": 1.1195, "tx": 10.675, "ty": 19.468, "ox": 89.325, "oy": 19.468}, "set/peony-bl": {"wr": 1.1293, "tx": 11.447, "ty": 18.218, "ox": 11.447, "oy": 81.782}};
function garland(item, size, eager) {
  var kind = item.kind || 'corner';
  var gm = item.gm || 1, img = item.img, extra = '', imgStyle = '';
  var b = kind === 'corner' ? CORNER_BLEED[item.img] : null;
  if (b) {
    img = item.img + '-bleed';
    gm = gm * b.wr;
    var sx = item.pos.charAt(1) === 'l' ? -1 : 1, sy = item.pos.charAt(0) === 't' ? -1 : 1;
    extra = ';translate:' + (sx * b.tx) + '% ' + (sy * b.ty) + '%';
    imgStyle = ' style="transform-origin:' + b.ox + '% ' + b.oy + '%"';
  }
  // geser tambahan dari sudut (nilai sudah ditulis sesuai arah sudut di FLORA_LAYERS)
  if (!b && item.off) extra = ';--ox:' + item.off[0] + '%;--oy:' + item.off[1] + '%';
  var style = '--gm:' + gm + ';--rot:' + (item.rot || 0) + 'deg;--fx:' + (item.fx || 1) + extra;
  return '<div class="gl ' + item.pos + ' ' + size + ' ' + kind + (b ? ' bleed' : '') + (item.cls ? ' ' + item.cls : '') + '" style="' + style + '" aria-hidden="true">' +
    '<img src="' + FLORA_BASE + img + '.webp" class="gl-img" alt="" decoding="async"' + imgStyle + (eager ? '' : ' loading="lazy"') + ' />' +
  '</div>';
}

$$('[data-g],[data-garland]').forEach(function(el) {
  var size = el.dataset.gs || 'sm', out = '';
  var items = SECTION_FLORA[el.id] || (el.dataset.g || el.dataset.garland).split(' ').map(frameCorner);
  // Sampul & hero langsung terlihat: muat segera, sisanya lazy
  var eager = el.hasAttribute('data-garland') || el.id === 'hero';
  var layers = FLORA_LAYERS[el.id] || {};
  var wrap = function (name, list, isEager) {
    if (!list || !list.length) return '';
    return '<div class="gl-par l-' + name + '" aria-hidden="true">' + list.map(function (it) { return garland(it, size, isEager); }).join('') + '</div>';
  };
  out += wrap('back', layers.back, false);
  items.forEach(function(it) { out += garland(it, size, eager); });
  out += wrap('front', layers.front, eager);
  if (el.hasAttribute('data-garland')) {
    el.outerHTML = out;
  } else {
    el.insertAdjacentHTML('afterbegin', out);
  }
});

/* Parallax kedalaman: lapis belakang tertinggal sedikit, lapis depan mendahului.
   Hanya section yang sedang terlihat yang dihitung; satu rAF per frame scroll; hanya translate. */
(function () {
  if (html.classList.contains('rm')) return;
  var pars = $$('.gl-par');
  if (!pars.length) return;
  var F = { back: -0.07, front: 0.06 }, MAX = 28, ticking = false, live = [];
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target.__parLive = e.isIntersecting; });
    live = pars.filter(function (p) { return p.__parLive; });
    req();
  }, { rootMargin: '120px 0px' }) : null;
  pars.forEach(function (p) {
    p.__f = p.classList.contains('l-back') ? F.back : F.front;
    p.__sec = p.parentElement;
    if (io) io.observe(p);
    else { p.__parLive = true; live.push(p); }
  });
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    for (var i = 0; i < live.length; i++) {
      var p = live[i], r = p.__sec.getBoundingClientRect();
      var d = (r.top + Math.min(r.height, vh) / 2) - vh / 2;
      var t = Math.max(-MAX, Math.min(MAX, d * p.__f));
      // hanya variabel; yang benar-benar bergeser adalah gambar bunga (layer kecil), bukan wadah seukuran section
      p.style.setProperty('--py', t.toFixed(1) + 'px');
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req, { passive: true });
  req();
})();

/* ---------- BENANG EMAS: penyambung cerita antar-section ---------- */
var THREAD = '<span class="thread rv" aria-hidden="true"><i class="th-line"></i>' +
  '<svg class="th-bud" viewBox="-10 -10 20 20"><path d="M0-9L2.4-2.4L9 0L2.4 2.4L0 9L-2.4 2.4L-9 0L-2.4-2.4Z" fill="url(#gg)"/></svg></span>';
$$('#page > .sec').forEach(function (sec) {
  if (sec.id === 'hero' || sec.querySelector(':scope > .thread')) return;
  sec.insertAdjacentHTML('beforeend', THREAD);
});

/* ---------- CARD FLORALS (rangkaian mengintip dari balik kartu + mahkota bunga) ---------- */
var CARD_FLORA = {
  ayat:            { corners: [['tl', 'set/pink-sprig-b', 1.15], ['br', 'set/pink-sprig-a', 1.1]] },
  ev:              { crown: 'set/pink-garland', corners: [['br', 'set/red-spray-3', .62]] },
  bank:            { corners: [['tl', 'set/red-spray-2', .82], ['br', 'set/red-spray-3', .62]] },
  form:            { corners: [['tl', 'set/pink-sprig-a', 1.15], ['br', 'set/pink-sprig-b', 1.1]] },
  'wish-env-card': { corners: [['tl', 'frame/spray-c', 1], ['br', 'set/red-spray-1', .58]] }
};
function buildCardCornerCluster(pos, img, cm) {
  return '<div class="card-flora-cluster cf-' + pos + '" style="--cm:' + cm + '" aria-hidden="true">' +
    '<img src="' + FLORA_BASE + img + '.webp" class="card-flora-img" alt="" loading="lazy" decoding="async" />' +
  '</div>';
}

window.__decorateCardsWithFlora = function() {
  Object.keys(CARD_FLORA).forEach(function(cls) {
    var spec = CARD_FLORA[cls];
    $$('.' + cls).forEach(function(card) {
      if (card.querySelector(':scope > .card-flora-cluster, :scope > .card-crown')) return;
      var h = spec.corners.map(function(c) { return buildCardCornerCluster(c[0], c[1], c[2]); }).join('');
      if (spec.crown) h += '<img src="' + FLORA_BASE + spec.crown + '.webp" class="card-crown" alt="" aria-hidden="true" loading="lazy" decoding="async" />';
      // Lapisan latar kartu terpisah: bunga (z:-2) < latar kartu (z:-1) < isi kartu
      card.insertAdjacentHTML('afterbegin', '<span class="card-bg" aria-hidden="true"></span>');
      card.insertAdjacentHTML('beforeend', h);
    });
  });
};
window.__decorateCardsWithFlora();

/* ---------- LANTERNS & RINGS ---------- */
var LANTERN='<svg viewBox="0 0 80 160" aria-hidden="true"><defs><radialGradient id="pearlG" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#f3e6cf"/><stop offset="1" stop-color="#cdb084"/></radialGradient></defs>'+
 '<line x1="40" y1="0" x2="40" y2="17" stroke="#c9a56b" stroke-width="1.4"/><circle cx="40" cy="21.5" r="4.2" fill="none" stroke="url(#gg)" stroke-width="1.8"/>'+
 '<path d="M38.2 25L17 58M41.8 25L63 58" stroke="#c9a56b" stroke-width="1" fill="none"/>'+
 '<line x1="40" y1="25.7" x2="40" y2="47" stroke="#c9a56b" stroke-width="1"/>'+
 '<path d="M14 58A26 26 0 0 0 66 58A32 32 0 0 1 14 58Z" fill="url(#gg)" stroke="#8a6730" stroke-width=".6" stroke-linejoin="round"/>'+
 '<path d="M19 62.5A22 22 0 0 0 40 76" fill="none" stroke="#fff4d2" stroke-width="1" stroke-linecap="round" opacity=".6"/>'+
 '<g transform="translate(40 55)"><g class="hl-star"><rect x="-6.5" y="-6.5" width="13" height="13" fill="url(#gg)" stroke="#8a6730" stroke-width=".6"/><rect x="-6.5" y="-6.5" width="13" height="13" transform="rotate(45)" fill="url(#gg)" stroke="#8a6730" stroke-width=".6"/></g><circle r="2.6" fill="#571024"/><circle r="1.1" fill="#f3e3b8"/></g>'+
 '<line x1="40" y1="84.5" x2="40" y2="94" stroke="#c9a56b" stroke-width="1"/><circle cx="40" cy="96.2" r="2.4" fill="url(#pearlG)"/>'+
 '<g stroke="#c9a56b" stroke-width=".8" fill="none"><path d="M40 98.5L27 124"/><path d="M40 98.5V132"/><path d="M40 98.5L53 124"/></g>'+
 '<g fill="url(#pearlG)"><circle cx="27" cy="126.4" r="2.7"/><circle cx="53" cy="126.4" r="2.7"/><circle cx="33.5" cy="111" r="1.7"/><circle cx="46.5" cy="111" r="1.7"/></g>'+
 '<g transform="translate(40 140)"><rect x="-5" y="-5" width="10" height="10" fill="url(#gg)" stroke="#8a6730" stroke-width=".5"/><rect x="-5" y="-5" width="10" height="10" transform="rotate(45)" fill="url(#gg)" stroke="#8a6730" stroke-width=".5"/><circle r="1.6" fill="#571024"/></g></svg>';
$$('[data-lanterns]').forEach(function(el){
  el.outerHTML='<div class="lantern pa" style="animation-delay:-1.2s" aria-hidden="true"><div class="glow"></div>'+LANTERN+'</div><div class="lantern pb b" style="animation-delay:-3.4s" aria-hidden="true"><div class="glow" style="animation-delay:-1.4s"></div>'+LANTERN+'</div>';
});

var RING='<svg viewBox="0 0 80 150" aria-hidden="true"><defs><radialGradient id="gemG" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#f7dce5"/><stop offset="1" stop-color="#d79bb0"/></radialGradient><clipPath id="ringClip"><rect x="33" y="99" width="14" height="32"/></clipPath></defs>'+
 '<line x1="40" y1="0" x2="40" y2="19" stroke="#c9a56b" stroke-width="1.4"/><circle cx="40" cy="23.5" r="4.2" fill="none" stroke="url(#gg)" stroke-width="1.8"/>'+
 '<path d="M38.4 27.2L29 69.5M41.6 27.2L51 53" stroke="#c9a56b" stroke-width="1" fill="none"/>'+
 '<g fill="none"><circle cx="29" cy="92" r="22" stroke="url(#gg)" stroke-width="5.4"/><circle cx="51" cy="92" r="22" stroke="url(#gg)" stroke-width="5.4"/><circle cx="29" cy="92" r="22" stroke="url(#gg)" stroke-width="5.4" clip-path="url(#ringClip)"/>'+
 '<g class="rshine" stroke="#fff4d2" stroke-width="1" stroke-linecap="round" opacity=".7"><path d="M10.6 82A20 20 0 0 1 23 71.4"/><path d="M32.6 82A20 20 0 0 1 45 71.4"/><path d="M52 112.6A20 20 0 0 0 63 106"/></g>'+
 '<g stroke="#6e4f1f" stroke-width=".6" opacity=".5"><circle cx="29" cy="92" r="19.4"/><circle cx="51" cy="92" r="19.4"/></g></g>'+
 '<g transform="translate(51 61)"><path d="M-6.2-3L-3.3-8.4H3.3L6.2-3L0 9Z" fill="url(#gemG)" stroke="#c9a56b" stroke-width=".9" stroke-linejoin="round"/><path d="M-6.2-3H6.2M-3.3-8.4L-1.7-3L0 9M3.3-8.4L1.7-3L0 9" stroke="#c9a56b" stroke-width=".45" fill="none" opacity=".8"/></g>'+
 '<g transform="translate(57.5 54)"><path class="gem-tw" d="M0-8L1.8-1.8L8 0L1.8 1.8L0 8L-1.8 1.8L-8 0L-1.8-1.8Z" fill="#fff"/></g></svg>';
$$('[data-rings]').forEach(function(el){
  el.outerHTML='<div class="lantern ringorn pa" style="animation-delay:-1.2s" aria-hidden="true"><div class="glow"></div>'+RING+'</div><div class="lantern ringorn pb b" style="animation-delay:-3.4s" aria-hidden="true"><div class="glow" style="animation-delay:-1.4s"></div>'+RING+'</div>';
});

/* ---------- HALO, 3-LAYER LUSH FLORAL DIVIDER CENTERPIECES, SPARKLES ---------- */
function halo(a){
  var rs=a?[170,135,100,65]:[150,118,86],g='';
  rs.forEach(function(r){g+='<g stroke="#c9a56b" stroke-width="1" fill="none"><rect x="'+(-r)+'" y="'+(-r)+'" width="'+2*r+'" height="'+2*r+'"/><rect x="'+(-r)+'" y="'+(-r)+'" width="'+2*r+'" height="'+2*r+'" transform="rotate(45)"/></g>'});
  var R=rs[0]*1.4142;
  for(var k=0;k<8;k++)g+='<circle cx="0" cy="'+(-R)+'" r="3.5" fill="#c9a56b" transform="rotate('+k*45+')"/>';
  g+='<circle r="'+R+'" fill="none" stroke="#c9a56b" stroke-width=".8" stroke-dasharray="2 6"/>';
  return '<svg viewBox="-250 -250 500 500" aria-hidden="true">'+g+'</svg>';
}
$$('[data-halo]').forEach(function(el){el.innerHTML=halo(el.dataset.halo==='a')});

/* ---------- LUXURY GOLD FILIGREE FLOURISH DIVIDER ---------- */
var GOLD_FLOURISH_DIVIDER = '<svg viewBox="0 0 280 24" class="divider-flourish-svg" aria-hidden="true">' +
  '<path d="M140 3 L142.5 9.5 L149 12 L142.5 14.5 L140 21 L137.5 14.5 L131 12 L137.5 9.5 Z" fill="url(#gg)"/>' +
  '<circle cx="140" cy="12" r="1.6" fill="#fff"/>' +
  '<circle cx="124" cy="12" r="2.2" fill="url(#gg)"/><circle cx="156" cy="12" r="2.2" fill="url(#gg)"/>' +
  '<circle cx="112" cy="12" r="1.6" fill="url(#gg)"/><circle cx="168" cy="12" r="1.6" fill="url(#gg)"/>' +
  '<path d="M120 12 C100 12, 85 7, 65 7 C45 7, 30 14, 10 12 M65 7 C65 17, 45 17, 45 12" fill="none" stroke="url(#gg)" stroke-width="1.2" stroke-linecap="round"/>' +
  '<path d="M160 12 C180 12, 195 7, 215 7 C235 7, 250 14, 270 12 M215 7 C215 17, 235 17, 235 12" fill="none" stroke="url(#gg)" stroke-width="1.2" stroke-linecap="round"/>' +
'</svg>';
$$('[data-star]').forEach(function(el){
  el.innerHTML = GOLD_FLOURISH_DIVIDER;
});

$$('[data-sparkles]').forEach(function(el){
  var n=+el.dataset.sparkles,s='';
  for(var i=0;i<n;i++)s+='<span class="sp" style="left:'+rnd(3,97).toFixed(1)+'%;top:'+rnd(3,97).toFixed(1)+'%;--s:'+rnd(5,12).toFixed(1)+'px;--t:'+rnd(2.5,6).toFixed(1)+'s;--dl:'+(-rnd(0,6)).toFixed(1)+'s"></span>';
  el.innerHTML=s;
});

