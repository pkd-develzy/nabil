/* ---------- MOTION MAP: setiap komponen punya gerak masuk sendiri ----------
   [selector, motion, stagger(detik) untuk elemen berikutnya dalam satu grup]
   motion: rise, drop, left, right, zoom, pop, spin, blur, spread, flip, unfold, swing, curtain, wipe */
var MOTION_MAP = [
  ['.sec:not(.hero) .eyebrow-ar', 'blur'],
  ['.sec:not(.hero) .eyebrow', 'drop'],
  ['.title', 'spread'],
  ['.salam-ar', 'blur'],
  ['.salam-lt', 'spread'],
  ['#salam .lead, #acara .sub, #hadiah .lead, #rsvp .lead, #ucapan .lead', 'rise'],
  ['.divider', 'curtain'],
  ['.ayat', 'flip'],
  ['.couple .person:first-child', 'left'],
  ['.couple .person:last-child', 'right'],
  ['.amp-big', 'swing'],
  ['.cd > div', 'pop', .12],
  ['.events .ev:nth-child(odd)', 'left'],
  ['.events .ev:nth-child(even)', 'right'],
  ['.ev dl > div', 'rise', .1],
  ['.dress', 'zoom'],
  ['.dress-bouquet', 'rise'],
  ['.sw i', 'pop', .1],
  ['.locs .loc:nth-child(odd)', 'left'],
  ['.locs .loc:nth-child(even)', 'right'],
  ['.mapframe', 'curtain'],
  ['.loc .btn', 'pop'],
  ['.banks .bank:nth-child(odd)', 'left'],
  ['.banks .bank:nth-child(even)', 'right'],
  ['.form', 'unfold'],
  ['.form > div, .form > button', 'rise', .09],
  ['.wish-carousel-wrap', 'zoom'],
  ['.wish-controls-bottom', 'rise'],
  ['#penutup .lead', 'rise'],
  ['.doa', 'blur'],
  ['#penutup .sub', 'rise', .12],
  ['.cl-names', 'zoom'],
  ['.fam', 'rise'],
  ['.credit > *', 'rise', .15]
];
function applyMotions(root) {
  root = root || document;
  MOTION_MAP.forEach(function(m) {
    var els = $$(m[0], root), step = m[2] || 0;
    els.forEach(function(el, i) {
      if (el.dataset.m) return;
      if (el.closest('#cover') || el.matches('.card-flora-cluster,.card-bg,.card-crown')) return;
      el.dataset.m = m[1];
      el.classList.add('rv');
      if (step) el.style.setProperty('--d', (i * step).toFixed(2) + 's');
    });
  });
}
applyMotions();
window.__applyMotions = applyMotions;

/* ---------- REVEAL ON SCROLL ---------- */
(function(){
  var rvs=$$('.rv'),secs=$$('.sec');
  if(!('IntersectionObserver' in window)){rvs.forEach(function(e){e.classList.add('in')});secs.forEach(function(e){e.classList.add('vis')});window.__observeReveal=function(root){$$('.rv',root).forEach(function(e){e.classList.add('in')})};return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -5% 0px'});
  rvs.forEach(function(e){io.observe(e)});
  window.__observeReveal=function(root){applyMotions(root);$$('.rv:not(.in)',root).forEach(function(e){io.observe(e)})};
  var io2=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('vis',e.isIntersecting)})},{rootMargin:'80px'});
  secs.forEach(function(e){io2.observe(e)});
  setTimeout(function(){rvs.forEach(function(e){if(!e.classList.contains('in')&&e.getBoundingClientRect().top<innerHeight)e.classList.add('in')})},9000);
})();

