/* ---------- FLOATING NAVBAR SCROLLSPY ---------- */
var nav = $('#navBar');
if(nav) {
  var navItems = $$('.nav-item', nav);

  function scrollToActiveItem(item) {
    if(!item || !nav) return;
    if(nav.scrollWidth > nav.clientWidth) {
      try {
        var itemLeft = item.offsetLeft;
        var itemWidth = item.offsetWidth;
        var navWidth = nav.clientWidth;
        nav.scrollTo({
          left: itemLeft - (navWidth / 2) + (itemWidth / 2),
          behavior: 'smooth'
        });
      } catch(e) {
        try { item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); } catch(err){}
      }
    }
  }

  navItems.forEach(function(item){
    item.addEventListener('click', function(e){
      var targetId = item.getAttribute('href');
      var targetEl = document.querySelector(targetId);
      if(targetEl){
        e.preventDefault();
        if (window.__azlunaFinishAutoScroll) window.__azlunaFinishAutoScroll();
        if (window.__azlunaPauseAutoScroll) window.__azlunaPauseAutoScroll();
        var rect = targetEl.getBoundingClientRect();
        var targetY = window.pageYOffset + rect.top - 10;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
        navItems.forEach(function(i){i.classList.remove('active')});
        item.classList.add('active');
        scrollToActiveItem(item);
      }
    });
  });

  var spySections = $$('.sec[id]');
  var spyThrottle = false;
  var currentActiveId = null;
  window.addEventListener('scroll', function(){
    if (spyThrottle) return;
    spyThrottle = true;
    requestAnimationFrame(function(){
      spyThrottle = false;
      var vh = window.innerHeight;
      var activeSecId = null;
      spySections.forEach(function(sec){
        var rect = sec.getBoundingClientRect();
        if(rect.top <= vh * 0.45 && rect.bottom >= vh * 0.2){
          activeSecId = sec.getAttribute('id');
        }
      });
      if(activeSecId && activeSecId !== currentActiveId){
        currentActiveId = activeSecId;
        navItems.forEach(function(item){
          var isMatch = item.getAttribute('href') === '#' + activeSecId;
          item.classList.toggle('active', isMatch);
          if(isMatch){
            scrollToActiveItem(item);
          }
        });
      }
    });
  }, {passive:true});
}
