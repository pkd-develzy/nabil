/* ---------- SEALED LETTER: BUKA AMPLOP DENGAN MENEKAN SEGEL LILIN ---------- */
var cover=$('#cover'),env=$('#env'),page=$('#page'),skipBtn=$('#skip'),opened=false,pulled=false,timers=[];
var slTilt=$('#slTilt'),slCard=$('#slCard'),slLetter=$('#slLetter'),slLetterCard=$('#slLetterCard'),slEnter=$('#slEnter');
var RM=html.classList.contains('rm');
function at(ms,fn){timers.push(setTimeout(fn,ms*K))}
function pull(){
  if(pulled)return;pulled=true;
  timers.forEach(clearTimeout);timers=[];clearTimeout(seqT);seq=[];
  stopTilt();
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  if($('#music')) $('#music').classList.add('show');
  if(cover) cover.classList.add('pulling');
  html.classList.add('pulling');
  setTimeout(function(){
    window.scrollTo(0, 0);
    html.classList.add('revealed');
  },420*K);
  setTimeout(function(){
    if(cover) cover.style.display='none';
    html.classList.remove('locked');
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.__azlunaInvitationReady = true;
    window.dispatchEvent(new CustomEvent('azluna:invitation-ready'));
  },2600*K);
}

/* Parallax: amplop sedikit miring mengikuti gerakan ponsel (atau kursor di desktop) */
var tilt={tx:0,ty:0,cx:0,cy:0,raf:0,on:false,b0:null,g0:null};
function tiltLoop(){
  tilt.cx+=(tilt.tx-tilt.cx)*.08; tilt.cy+=(tilt.ty-tilt.cy)*.08;
  if(slTilt) slTilt.style.transform='rotateX('+tilt.cy.toFixed(2)+'deg) rotateY('+tilt.cx.toFixed(2)+'deg)';
  if(tilt.on&&(Math.abs(tilt.tx-tilt.cx)>.02||Math.abs(tilt.ty-tilt.cy)>.02)) tilt.raf=requestAnimationFrame(tiltLoop); else tilt.raf=0;
}
function tiltTo(x,y){
  tilt.tx=Math.max(-8,Math.min(8,x)); tilt.ty=Math.max(-8,Math.min(8,y));
  if(tilt.on&&!tilt.raf) tilt.raf=requestAnimationFrame(tiltLoop);
}
function onOrient(e){
  if(e.beta==null||e.gamma==null)return;
  if(tilt.b0==null){tilt.b0=e.beta;tilt.g0=e.gamma}
  tiltTo((e.gamma-tilt.g0)*.35,-(e.beta-tilt.b0)*.35);
}
function onPointer(e){
  if(e.pointerType==='touch')return;
  tiltTo((e.clientX/innerWidth-.5)*12,-(e.clientY/innerHeight-.5)*10);
}
function startTilt(){
  if(RM||!slTilt||!cover)return;
  tilt.on=true;
  window.addEventListener('deviceorientation',onOrient,{passive:true});
  cover.addEventListener('pointermove',onPointer,{passive:true});
}
function stopTilt(){
  if(!tilt.on)return;
  tilt.on=false;
  window.removeEventListener('deviceorientation',onOrient);
  if(cover) cover.removeEventListener('pointermove',onPointer);
  if(tilt.raf) cancelAnimationFrame(tilt.raf);
  tilt.raf=0;
  if(slTilt){slTilt.style.transition='transform .5s ease';slTilt.style.transform='none'}
}
startTilt();

/* Kartu kecil di amplop "membesar" menjadi kartu layar penuh (teknik FLIP, transform saja) */
function expandLetter(){
  if(!cover||!slLetterCard)return;
  if(RM||!slCard){
    cover.classList.add('letter-on');
    if(slLetter) slLetter.setAttribute('aria-hidden','false');
    requestAnimationFrame(function(){cover.classList.add('letter-show')});
    return;
  }
  var r=slCard.getBoundingClientRect();
  cover.classList.add('letter-on');
  if(slLetter) slLetter.setAttribute('aria-hidden','false');
  var L=slLetterCard.getBoundingClientRect();
  var sx=r.width/L.width,sy=r.height/L.height;
  slLetterCard.classList.remove('flip');
  slLetterCard.style.transform='translate('+(r.left-L.left).toFixed(1)+'px,'+(r.top-L.top).toFixed(1)+'px) scale('+sx.toFixed(4)+','+sy.toFixed(4)+')';
  slCard.style.opacity='0';
  slLetterCard.getBoundingClientRect(); // paksa reflow sebelum transisi
  requestAnimationFrame(function(){
    slLetterCard.classList.add('flip');
    slLetterCard.style.transform='none';
  });
  at(700,function(){cover.classList.add('letter-show')});
}

function open(){
  if(opened)return;opened=true;
  // Ketukan ini adalah interaksi pengguna, jadi browser mengizinkan audio diputar
  if(!(CONFIG.visibility&&CONFIG.visibility.music===false)){try{Music.start()}catch(e){}}
  if($('#music')) $('#music').classList.add('show');
  try{if(navigator.vibrate) navigator.vibrate([12,40,20])}catch(e){}
  stopTilt();
  if(!cover)return;
  cover.classList.add('playing','seal-press');
  // [jeda sebelum langkah (ms), fungsi, jeda baca?]. Jeda baca tidak dipercepat oleh reduced-motion.
  runSeq([
    [0,   function(){}],
    [110, function(){cover.classList.remove('seal-press');cover.classList.add('seal-crack')}],
    [310, function(){cover.classList.add('flap-open');at(420,function(){cover.classList.add('flap-behind')})}], // tutup terbuka ±0,85 dtk
    [700, function(){cover.classList.add('sheet-a-out');holdOn('#slSheetA')}],  // kertas 1: salam
    [3400,function(){holdOff();cover.classList.add('sheet-a-away')},true],
    [350, function(){cover.classList.add('sheet-b-out');holdOn('#slSheetB')}],  // kertas 2: ayat
    [3600,function(){holdOff();cover.classList.add('sheet-b-away')},true],
    [350, function(){cover.classList.add('card-out')}],                          // kartu utama keluar
    [750, expandLetter],                                                         // lalu membesar layar penuh
    [1500,function(){if(slEnter){try{slEnter.focus({preventScroll:true})}catch(e){}}}]
  ]);
}
/* Penjadwal langkah: tiap langkah menunggu jeda lalu jalan; saat jeda baca, sentuhan langsung melanjutkan */
var seq=[],seqI=0,seqT=0;
function runSeq(list){seq=list;seqI=0;nextSeq()}
function nextSeq(){
  clearTimeout(seqT);
  if(seqI>=seq.length)return;
  var s=seq[seqI++];s[1]();
  if(seqI<seq.length){var n=seq[seqI];seqT=setTimeout(nextSeq,n[0]*(n[2]?1:K))}
}
function waitingHold(){return seqI<seq.length&&seq[seqI][2]}
function holdOn(sel){var el=$(sel);if(el)el.classList.add('is-hold')}
function holdOff(){$$('.sl-sheet.is-hold').forEach(function(el){el.classList.remove('is-hold')})}
function skipHold(e){if(opened&&!pulled&&waitingHold()){e.stopPropagation();nextSeq()}}
if(env) env.addEventListener('click',function(e){if(opened){skipHold(e);return}open()});
if(cover) cover.addEventListener('click',skipHold);
if(slEnter) slEnter.addEventListener('click',function(e){e.stopPropagation();pull()});
if(skipBtn) skipBtn.addEventListener('click',function(e){e.stopPropagation();pull()});

