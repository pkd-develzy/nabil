/* ---------- FLOATING NAVBAR SCROLLSPY & LOVE TOGGLE ---------- */
var nav = $('#navBar');
var navWrapper = $('#navWrapper');
var loveBtn = $('#navLoveBtn');

function closeMobileMenu() {
  if (navWrapper) navWrapper.classList.remove('menu-open');
  if (loveBtn) {
    loveBtn.classList.remove('open');
    loveBtn.setAttribute('aria-expanded', 'false');
  }
}

function toggleMobileMenu(e) {
  if (e) e.stopPropagation();
  if (!navWrapper || !loveBtn) return;
  var isOpen = navWrapper.classList.toggle('menu-open');
  loveBtn.classList.toggle('open', isOpen);
  loveBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

if (loveBtn) {
  loveBtn.addEventListener('click', toggleMobileMenu);
}

document.addEventListener('click', function (e) {
  if (navWrapper && navWrapper.classList.contains('menu-open')) {
    if (!navWrapper.contains(e.target)) {
      closeMobileMenu();
    }
  }
});

if (nav) {
  var navItems = $$('.nav-item', nav);

  function scrollToActiveItem(item) {
    if (!item || !nav) return;
    if (nav.scrollWidth > nav.clientWidth) {
      try {
        var itemLeft = item.offsetLeft;
        var itemWidth = item.offsetWidth;
        var navWidth = nav.clientWidth;
        nav.scrollTo({
          left: itemLeft - (navWidth / 2) + (itemWidth / 2),
          behavior: 'smooth'
        });
      } catch (e) {
        try { item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); } catch (err) { }
      }
    }
  }

  navItems.forEach(function (item) {
    item.addEventListener('click', function (e) {
      var targetId = item.getAttribute('href');
      var targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        closeMobileMenu();
        if (window.__azlunaFinishAutoScroll) window.__azlunaFinishAutoScroll();
        if (window.__azlunaPauseAutoScroll) window.__azlunaPauseAutoScroll();
        var rect = targetEl.getBoundingClientRect();
        var targetY = window.pageYOffset + rect.top - 10;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
        navItems.forEach(function (i) { i.classList.remove('active') });
        item.classList.add('active');
        scrollToActiveItem(item);
      }
    });
  });

  var spySections = $$('.sec[id]');
  var spyThrottle = false;
  var currentActiveId = null;
  window.addEventListener('scroll', function () {
    if (spyThrottle) return;
    spyThrottle = true;
    requestAnimationFrame(function () {
      spyThrottle = false;
      var vh = window.innerHeight;
      var activeSecId = null;
      spySections.forEach(function (sec) {
        var rect = sec.getBoundingClientRect();
        if (rect.top <= vh * 0.45 && rect.bottom >= vh * 0.2) {
          activeSecId = sec.getAttribute('id');
        }
      });
      if (activeSecId && activeSecId !== currentActiveId) {
        currentActiveId = activeSecId;
        navItems.forEach(function (item) {
          var isMatch = item.getAttribute('href') === '#' + activeSecId;
          item.classList.toggle('active', isMatch);
          if (isMatch) {
            scrollToActiveItem(item);
          }
        });
      }
    });
  }, { passive: true });
}
