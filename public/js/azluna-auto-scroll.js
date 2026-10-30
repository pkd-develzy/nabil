/**
 * Azluna Cinematic Auto-Scroll Guided Tour Engine
 * - Reset otomatis ke tampilan paling pertama saat undangan dibuka.
 * - Wajib scroll otomatis secara elegan dari atas ke bawah.
 * - Tur berhenti begitu tamu menggeser/menggulir sendiri atau mengetik di form.
 * - Setelah berhenti (atau sampai penutup), kontrol sepenuhnya di tangan tamu.
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

  // Tamu selalu memegang kendali: begitu ia menggeser, menggulir, atau mengetik,
  // tur otomatis langsung berhenti dan scroll manual dibuka penuh.
  // (Dulu scroll manual diblokir selama tur. Di HP itu terasa "macet" dan membuat
  //  tamu tidak bisa kembali membaca atau mengisi form, jadi diganti.)
  function yieldToGuest() {
    if (startTimer) { clearTimeout(startTimer); startTimer = null; }
    if (!isAutoScrollFinished) finishAutoScroll();
  }
  function handleManualScrollAttempt() {
    if (isAutoScrolling && !isAutoScrollFinished) yieldToGuest();
  }
  function handleKeyScroll(e) {
    if (isAutoScrolling && !isAutoScrollFinished) {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].indexOf(e.key) !== -1) yieldToGuest();
    }
  }

  window.addEventListener('wheel', handleManualScrollAttempt, { passive: true });
  window.addEventListener('touchmove', handleManualScrollAttempt, { passive: true });
  window.addEventListener('keydown', handleKeyScroll, { passive: true });
  // Fokus ke kolom form (RSVP/ucapan) juga menghentikan tur agar layar tidak bergeser saat mengetik
  document.addEventListener('focusin', function (e) {
    var t = e.target;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) yieldToGuest();
  });
  // Pengguna yang memilih "kurangi gerakan" tidak diajak tur otomatis
  if (document.documentElement.classList.contains('rm')) { isAutoScrollFinished = true; }

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
