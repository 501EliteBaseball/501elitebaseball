(function(){
  function ready(fn){
    if(document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function setMenu(open){
    const menu = document.getElementById('mobileMenu');
    const btn = document.querySelector('.menu-toggle');
    if(!menu || !btn) return;

    menu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    btn.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  window.toggleMenu = function(){
    const menu = document.getElementById('mobileMenu');
    setMenu(!(menu && menu.classList.contains('open')));
  };

  ready(function(){
    const menu = document.getElementById('mobileMenu');
    const btn = document.querySelector('.menu-toggle');
    if(!menu || !btn) return;

    setMenu(false);

    btn.addEventListener('click', function(event){
      event.preventDefault();
      event.stopPropagation();
      window.toggleMenu();
    });

    menu.addEventListener('click', function(event){
      if(event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('click', function(event){
      if(!menu.classList.contains('open')) return;
      if(menu.contains(event.target) || btn.contains(event.target)) return;
      setMenu(false);
    });

    document.addEventListener('keydown', function(event){
      if(event.key === 'Escape') setMenu(false);
    });

    window.addEventListener('resize', function(){
      if(window.innerWidth > 760) setMenu(false);
    });
  });

  ready(function(){
    const banner = document.querySelector('[data-os-launch-banner]');
    const dismiss = document.querySelector('[data-os-launch-dismiss]');
    if(!banner || !dismiss) return;

    try {
      if(window.localStorage.getItem('501elite-os-banner-dismissed') === 'true') {
        banner.hidden = true;
        return;
      }
    } catch(error) {
      // The banner still works when storage is unavailable.
    }

    dismiss.addEventListener('click', function(){
      banner.hidden = true;
      try {
        window.localStorage.setItem('501elite-os-banner-dismissed', 'true');
      } catch(error) {
        // Dismiss for this page view when storage is unavailable.
      }
    });
  });
})();
