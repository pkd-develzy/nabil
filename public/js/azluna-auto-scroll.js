/**
 * Azluna Cinematic Auto-Scroll Guided Tour Engine
 * - Reset otomatis ke tampilan paling pertama saat undangan dibuka.
 * - Wajib scroll otomatis secara elegan dari atas ke bawah.
 * - Selama auto-scroll berjalan, layar tidak boleh di-scroll manual sendiri.
 * - Begitu auto-scroll selesai sampai ke penutup, kontrol manual dibuka penuh (boleh scroll sendiri).
 */
(function() {
  'use strict';

  var isAutoScrolling = false;
  var isAutoScrollFinished = false;
  var rafId = null;
  var lastTimestamp = null;
  var speedPxPerSec = 44; // Kecepatan elegan, tenang, dan terbaca dengan nyaman
  var startTimer = null;

  function isInvitationOpened() {
    if (window.__azlunaInvitationReady) return true;
    var cover = document.getElementById('cover');
    if (cover) {
      if (cover.style.display === 'none' || cover.classList.contains('gone') || cover.classList.contains('pulled')) {
        return true;
      }
      return false;
    }
    if (document.documentElement.classList.contains('locked') || document.body.classList.contains('locked')) {
      return false;
    }
    return true;
  }

  function startAutoScroll() {
    if (isAutoScrolling || isAutoScrollFinished) return;
    if (!isInvitationOpened()) return;

    // Pastikan scroll berada tepat di tampilan paling pertama
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    isAutoScrolling = true;
    lastTimestamp = null;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(step);
  }

  function finishAutoScroll() {
    isAutoScrolling = false;
    isAutoScrollFinished = true;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    // Scroll manual pengguna sekarang diizinkan sepenuhnya
    window.__azlunaManualScrollUnlocked = true;
  }

  function step(timestamp) {
    if (!isAutoScrolling || isAutoScrollFinished) return;
    if (!lastTimestamp) lastTimestamp = timestamp;
    var delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    var scrollY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
    var windowH = window.innerHeight || document.documentElement.clientHeight;
    var docH = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );

    // Cek apakah sudah sampai di akhir halaman (selesai 1 kali tour)
    if (scrollY + windowH >= docH - 30) {
      finishAutoScroll();
      return;
    }

    var moveBy = (speedPxPerSec * delta) / 1000;
    if (moveBy > 0 && moveBy < 8) {
      window.scrollBy(0, moveBy);
    }

    rafId = requestAnimationFrame(step);
  }

  // Larang scroll manual sendiri selama auto-scroll otomatis sedang berjalan
  function handleManualScrollAttempt(e) {
    if (isAutoScrolling && !isAutoScrollFinished) {
      // Izinkan klik dan tap normal, tetapi cegah drag/wheel manual yang mengacaukan auto-scroll
      if (e.cancelable && (e.type === 'touchmove' || e.type === 'wheel')) {
        e.preventDefault();
      }
    }
  }

  function handleKeyScroll(e) {
    if (isAutoScrolling && !isAutoScrollFinished) {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].indexOf(e.key) !== -1) {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        if (e.cancelable) e.preventDefault();
      }
    }
  }

  window.addEventListener('wheel', handleManualScrollAttempt, { passive: false });
  window.addEventListener('touchmove', handleManualScrollAttempt, { passive: false });
  window.addEventListener('keydown', handleKeyScroll, { passive: false });

  // Pemicu saat undangan dibuka
  function onInvitationOpened() {
    // Reset instan ke tampilan pertama
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Beri jeda 1.2 detik agar tamu menikmati Hero & animasi nama yang baru muncul
    if (startTimer) clearTimeout(startTimer);
    startTimer = setTimeout(function() {
      startAutoScroll();
    }, 1200);
  }

  window.addEventListener('azluna:invitation-ready', onInvitationOpened);

  // Polling fallback jika event terlewat
  var checkOpenInterval = setInterval(function() {
    if (isInvitationOpened()) {
      clearInterval(checkOpenInterval);
      if (!isAutoScrolling && !isAutoScrollFinished) {
        onInvitationOpened();
      }
    }
  }, 300);

  // API eksternal
  window.__azlunaFinishAutoScroll = finishAutoScroll;
  window.__azlunaPauseAutoScroll = function() {
    // Jika user mengklik navbar menu, langsung selesaikan auto-scroll dan buka kontrol manual
    finishAutoScroll();
  };
})();
