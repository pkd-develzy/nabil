/* ---------- LIVE WISHES CAROUSEL ENGINE (SLOW, PLAY/STOP, 10S INACTIVITY RESUME) ---------- */
var wishStage = document.getElementById('wishStage');
var wishDots = document.getElementById('wishDots');
var wishBarFill = document.getElementById('wishBarFill');
var btnWishPrev = document.getElementById('btnWishPrev');
var btnWishNext = document.getElementById('btnWishNext');
var btnWishPlay = document.getElementById('btnWishPlay');
var btnWishStop = document.getElementById('btnWishStop');
var wishStatusDot = document.getElementById('wishStatusDot');
var wishStatusText = document.getElementById('wishStatusText');
var wishWrap = document.getElementById('wishCarouselWrap');

var currentWishIndex = 0;
var progressTimer = null;
var autoDuration = 6000; // Slow: 6 detik per kartu
var progressElapsed = 0;
var isPlaying = true;
var isHoveredOrTouched = false;
var isTransitioning = false;

var inactivityCountdownTimer = null;
var secondsRemaining = 10;

function getAllWishSlides() {
  return wishStage ? Array.from(wishStage.querySelectorAll('.wish-slide')) : [];
}

function updateControlsUI(state, secRemaining) {
  if (state === 'playing') {
    if (btnWishPlay) btnWishPlay.classList.add('active');
    if (btnWishStop) btnWishStop.classList.remove('active');
    if (wishStatusDot) {
      wishStatusDot.classList.remove('paused');
      wishStatusDot.classList.add('pulse');
    }
    if (wishStatusText) {
      wishStatusText.textContent = 'Gulir Otomatis (Lambat)';
    }
  } else {
    if (btnWishPlay) btnWishPlay.classList.remove('active');
    if (btnWishStop) btnWishStop.classList.add('active');
    if (wishStatusDot) {
      wishStatusDot.classList.add('paused');
      wishStatusDot.classList.remove('pulse');
    }
    if (wishStatusText) {
      if (typeof secRemaining === 'number' && secRemaining > 0) {
        wishStatusText.textContent = 'Dijeda • Lanjut dlm ' + secRemaining + ' dtk';
      } else {
        wishStatusText.textContent = 'Dijeda (Otomatis dlm 10 dtk)';
      }
    }
  }
}

function clearInactivityTimer() {
  if (inactivityCountdownTimer) {
    clearInterval(inactivityCountdownTimer);
    inactivityCountdownTimer = null;
  }
}

function resetProgressBar() {
  progressElapsed = 0;
  if (wishBarFill) wishBarFill.style.width = '0%';
}

function startAutoAdvance() {
  clearInactivityTimer();
  isPlaying = true;
  updateControlsUI('playing');
  resetProgressBar();

  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }

  var intervalStep = 100;
  progressTimer = setInterval(function() {
    if (!isPlaying || isHoveredOrTouched) return;
    var slides = getAllWishSlides();
    if (slides.length <= 1) return;

    progressElapsed += intervalStep;
    var pct = Math.min(100, (progressElapsed / autoDuration) * 100);
    if (wishBarFill) wishBarFill.style.width = pct + '%';

    if (progressElapsed >= autoDuration) {
      resetProgressBar();
      advanceWishSlide('right');
    }
  }, intervalStep);
}

function pauseWithInactivityResume() {
  isPlaying = false;
  resetProgressBar();
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }

  clearInactivityTimer();
  secondsRemaining = 10;
  updateControlsUI('paused', secondsRemaining);

  inactivityCountdownTimer = setInterval(function() {
    if (!isHoveredOrTouched) {
      secondsRemaining -= 1;
      if (secondsRemaining > 0) {
        updateControlsUI('paused', secondsRemaining);
      } else {
        clearInactivityTimer();
        startAutoAdvance();
      }
    }
  }, 1000);
}

function updateDots() {
  if (!wishDots) return;
  var slides = getAllWishSlides();
  wishDots.innerHTML = '';
  slides.forEach(function(_, idx) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'wish-dot' + (idx === currentWishIndex ? ' active' : '');
    dot.setAttribute('aria-label', 'Lihat ucapan ke-' + (idx + 1));
    dot.addEventListener('click', function(e) {
      e.stopPropagation();
      goToWishSlide(idx, idx > currentWishIndex ? 'right' : 'left');
      pauseWithInactivityResume();
    });
    wishDots.appendChild(dot);
  });
}

function updateStageHeight() {
  if (!wishStage) return;
  var activeSlide = wishStage.querySelector('.wish-slide.active');
  if (activeSlide) {
    var h = activeSlide.offsetHeight;
    if (h > 0) {
      wishStage.style.minHeight = h + 'px';
    }
  }
}

function goToWishSlide(newIndex, direction) {
  if (isTransitioning) return;
  var slides = getAllWishSlides();
  if (slides.length <= 1 || newIndex === currentWishIndex) return;

  isTransitioning = true;
  var currentSlide = slides[currentWishIndex];
  var nextSlide = slides[newIndex];

  slides.forEach(function(s) {
    s.classList.remove('from-left', 'from-right', 'prev-out');
  });

  if (direction === 'left') {
    nextSlide.classList.add('from-left');
  } else {
    nextSlide.classList.add('from-right');
  }

  currentSlide.classList.add('prev-out');
  currentSlide.classList.remove('active');

  void nextSlide.offsetWidth;

  nextSlide.classList.remove('from-left', 'from-right');
  nextSlide.classList.add('active');

  currentWishIndex = newIndex;
  updateDots();
  updateStageHeight();

  setTimeout(function() {
    currentSlide.classList.remove('prev-out');
    isTransitioning = false;
    updateStageHeight();
  }, 750);

  resetProgressBar();
}

function advanceWishSlide(dir) {
  var slides = getAllWishSlides();
  if (slides.length <= 1) return;
  var nextIdx;
  if (dir === 'left') {
    nextIdx = (currentWishIndex - 1 + slides.length) % slides.length;
  } else {
    nextIdx = (currentWishIndex + 1) % slides.length;
  }
  goToWishSlide(nextIdx, dir);
}

if (btnWishPlay) {
  btnWishPlay.addEventListener('click', function(e) {
    e.stopPropagation();
    startAutoAdvance();
  });
}

if (btnWishStop) {
  btnWishStop.addEventListener('click', function(e) {
    e.stopPropagation();
    pauseWithInactivityResume();
  });
}

if (btnWishPrev) {
  btnWishPrev.addEventListener('click', function(e) {
    e.stopPropagation();
    advanceWishSlide('left');
    pauseWithInactivityResume();
  });
}

if (btnWishNext) {
  btnWishNext.addEventListener('click', function(e) {
    e.stopPropagation();
    advanceWishSlide('right');
    pauseWithInactivityResume();
  });
}

if (wishWrap) {
  wishWrap.addEventListener('mouseenter', function() {
    isHoveredOrTouched = true;
    if (!isPlaying) {
      secondsRemaining = 10;
      updateControlsUI('paused', 10);
    }
  });

  wishWrap.addEventListener('mouseleave', function() {
    isHoveredOrTouched = false;
    if (!isPlaying) {
      pauseWithInactivityResume();
    }
  });

  var touchStartX = 0;
  var touchEndX = 0;
  wishWrap.addEventListener('touchstart', function(e) {
    isHoveredOrTouched = true;
    if (!isPlaying) {
      secondsRemaining = 10;
      updateControlsUI('paused', 10);
    }
    if (e.changedTouches && e.changedTouches[0]) {
      touchStartX = e.changedTouches[0].screenX;
    }
  }, { passive: true });

  wishWrap.addEventListener('touchend', function(e) {
    isHoveredOrTouched = false;
    if (e.changedTouches && e.changedTouches[0]) {
      touchEndX = e.changedTouches[0].screenX;
      var diffX = touchEndX - touchStartX;
      if (Math.abs(diffX) > 40) {
        if (diffX < 0) {
          advanceWishSlide('right');
        } else {
          advanceWishSlide('left');
        }
      }
    }
    pauseWithInactivityResume();
  }, { passive: true });
}

window.addEventListener('resize', updateStageHeight);

function wishTimeLabel(iso) {
  var t = new Date(iso || '').getTime();
  if (isNaN(t)) return '';
  var s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return 'Baru saja';
  if (s < 3600) return Math.floor(s / 60) + ' menit lalu';
  if (s < 86400) return Math.floor(s / 3600) + ' jam lalu';
  if (s < 86400 * 30) return Math.floor(s / 86400) + ' hari lalu';
  var bln = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  var d = new Date(t);
  return d.getDate() + ' ' + bln[d.getMonth()] + ' ' + d.getFullYear();
}

// Pastikan selalu ada tepat satu slide aktif (kalau tidak, panggung kartu kosong)
function ensureActiveWishSlide() {
  var slides = getAllWishSlides();
  if (!slides.length) return;
  if (currentWishIndex >= slides.length || currentWishIndex < 0) currentWishIndex = 0;
  slides.forEach(function(s, idx) {
    s.classList.remove('from-left', 'from-right', 'prev-out');
    s.classList.toggle('active', idx === currentWishIndex);
  });
}

function showEmptyWishState() {
  var placeholder = $('#wishPlaceholderSlide');
  if (!placeholder) return;
  var wishNm = placeholder.querySelector('.wish-name');
  var wishTxt = placeholder.querySelector('.wish-text');
  if (wishNm) wishNm.textContent = 'Belum Ada Ucapan';
  if (wishTxt) wishTxt.textContent = 'Jadilah yang pertama memberikan doa restu untuk kedua mempelai melalui formulir RSVP di atas!';
}

// Helper menambahkan ucapan live
window.__addLiveWishToCarousel = function(wish, prepend) {
  if (!wishStage || !wish) return;
  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  var isHadir = (wish.presence || wish.hadir || 'Hadir') === 'Hadir';
  var safeName = esc(wish.name || wish.nama || 'Tamu Undangan');
  var safeText = esc(wish.message || wish.pesan || '');
  if (!safeText) return;
  var placeholderEl = $('#wishPlaceholderSlide');
  if (placeholderEl) placeholderEl.remove();

  var seal = esc(CONFIG.seal || 'N&I');
  var slide = document.createElement('div');
  slide.className = 'wish-slide';
  slide.innerHTML = '<article class="wish-env-card">'+
    '<div class="wish-env-top">'+
      '<div class="wish-env-flap"></div>'+
      '<div class="wish-mini-seal">' + seal + '</div>'+
    '</div>'+
    '<div class="wish-paper">'+
      '<div class="wish-meta">'+
        '<strong class="wish-name">'+safeName+'</strong>'+
        '<span class="wish-badge '+(isHadir?'hadir':'berhalangan')+'">'+(isHadir?'Insya Allah Hadir':'Berhalangan')+'</span>'+
      '</div>'+
      '<p class="wish-text">"'+safeText+'"</p>'+
      '<div class="wish-footer">'+
        '<small>' + esc(wishTimeLabel(wish.created_at || wish.tanggal)) + '</small>'+
        '<span class="wish-dove-icon">✨</span>'+
      '</div>'+
    '</div>'+
  '</article>';

  if (prepend && wishStage.firstChild) {
    wishStage.insertBefore(slide, wishStage.firstChild);
    currentWishIndex = 0;
  } else {
    wishStage.appendChild(slide);
  }
  isTransitioning = false;
  ensureActiveWishSlide();

  if (window.__decorateCardsWithFlora) {
    window.__decorateCardsWithFlora();
  }
  updateDots();
  updateStageHeight();
  if (isPlaying) startAutoAdvance();
  return slide;
};

// Ambil wishes dari localStorage dan Supabase untuk slug saat ini
try {
  var curSlug = window.__WEDDING_SLUG || 'nabil-izza';
  var cachedWishes = [];
  try {
    cachedWishes = JSON.parse(localStorage.getItem('wedding_wishes_' + curSlug) || '[]');
    if (!Array.isArray(cachedWishes)) cachedWishes = [];
    cachedWishes.forEach(function(w){
      window.__addLiveWishToCarousel(w, false);
    });
  } catch(e){ cachedWishes = []; }

  var sb = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (sb) {
    sb.from('wedding_wishes').select('*').eq('wedding_slug', curSlug).order('created_at', {ascending: false}).limit(20).then(function(res){
      if (res && !res.error && res.data && res.data.length > 0) {
        var withMsg = res.data.filter(function(w){ return (w.message || w.pesan || '').trim(); });
        if (!withMsg.length) { if (!getAllWishSlides().length || $('#wishPlaceholderSlide')) showEmptyWishState(); return; }
        if (wishStage) wishStage.innerHTML = '';
        currentWishIndex = 0;
        withMsg.forEach(function(w){
          window.__addLiveWishToCarousel(w, false);
        });
        try { localStorage.setItem('wedding_wishes_' + curSlug, JSON.stringify(withMsg)); } catch(e){}
      } else if ($('#wishPlaceholderSlide')) {
        showEmptyWishState();
      }
    }, function(err){
      console.warn('Supabase wishes load skipped (offline):', err && err.message ? err.message : err);
      if ($('#wishPlaceholderSlide')) showEmptyWishState();
    });
  } else if ($('#wishPlaceholderSlide')) {
    // Database belum dikonfigurasi: jangan tampilkan "Memuat..." selamanya
    showEmptyWishState();
  }
} catch(e){}

updateDots();
setTimeout(function() {
  updateStageHeight();
  startAutoAdvance();
}, 400);

