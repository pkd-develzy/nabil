/**
 * Azluna Cinematic Auto-Scroll Engine
 * - Smooth elegant scrolling down the invitation page
 * - Pauses on any user interaction (touch, click, wheel, keydown)
 * - Automatically resumes after 3 seconds of inactivity
 * - Stops gracefully near the bottom of the page
 */
(function() {
  'use strict';

  var isUserInteracting = false;
  var inactivityTimer = null;
  var rafId = null;
  var lastTimestamp = null;
  var speedPxPerSec = 48; // Smooth, readable, elegant velocity

  function isInvitationOpened() {
    // 1. Cover Burgundy / Fresh Magic / [slug]
    var cover = document.getElementById('cover');
    if (cover) {
      if (cover.style.display === 'none' || cover.classList.contains('pulled') || cover.classList.contains('leaving') || cover.classList.contains('gone')) {
        return true;
      }
      return false;
    }

    // 2. Gate Peach Senja / Sakura Luxury / Heritage Sage / Sky Blue
    var gate = document.getElementById('gate');
    if (gate) {
      if (gate.classList.contains('gone') || gate.style.display === 'none' || gate.getAttribute('aria-hidden') === 'true') {
        return true;
      }
      return false;
    }

    // 3. Modal / Envelope in Midnight Celestial / Adat Jawa / Traditional Java
    var amplop = document.getElementById('envelopeModal') || document.getElementById('coverAmplop') || document.getElementById('celestialEnvelope') || document.querySelector('.envelope-modal');
    if (amplop) {
      if (amplop.classList.contains('is-opened') || amplop.classList.contains('opened') || amplop.style.display === 'none' || amplop.classList.contains('hidden') || amplop.classList.contains('gone')) {
        return true;
      }
      return false;
    }

    // 4. Body / HTML locked class check
    if (document.documentElement.classList.contains('locked') || document.body.classList.contains('is-locked') || document.body.classList.contains('locked')) {
      return false;
    }

    return true;
  }

  function canScroll() {
    if (!isInvitationOpened()) return false;
    if (isUserInteracting) return false;

    // Check bottom boundary
    var scrollY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
    var windowH = window.innerHeight || document.documentElement.clientHeight;
    var docH = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );

    // Stop within 15px of page end
    if (scrollY + windowH >= docH - 15) {
      return false;
    }

    return true;
  }

  function step(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    var delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    if (canScroll()) {
      var moveBy = (speedPxPerSec * delta) / 1000;
      // Clamp step to avoid jumps on tab switch / lag
      if (moveBy > 0 && moveBy < 6) {
        window.scrollBy(0, moveBy);
      }
    }

    rafId = requestAnimationFrame(step);
  }

  function registerInteraction() {
    isUserInteracting = true;
    lastTimestamp = null;
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    // 3 seconds of inactivity before continuing elegant auto-scroll
    inactivityTimer = setTimeout(function() {
      isUserInteracting = false;
      lastTimestamp = null;
    }, 3000);
  }

  // Interactivity detection: touch, mouse, wheel, keys
  var userEvents = ['touchstart', 'touchmove', 'touchend', 'pointerdown', 'mousedown', 'wheel', 'keydown'];
  userEvents.forEach(function(evt) {
    window.addEventListener(evt, registerInteraction, { passive: true });
  });

  // Start RAF
  rafId = requestAnimationFrame(step);

  window.__azlunaPauseAutoScroll = function() {
    registerInteraction();
  };

  window.__azlunaResumeAutoScroll = function() {
    isUserInteracting = false;
    lastTimestamp = null;
  };
})();
