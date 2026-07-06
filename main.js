(function(){
  function setMenu(open){
    const menu = document.getElementById('mobileMenu');
    const btn = document.querySelector('.menu-toggle');
    if(!menu || !btn) return;
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  window.toggleMenu = function(){
    const menu = document.getElementById('mobileMenu');
    setMenu(!(menu && menu.classList.contains('open')));
  };

  document.addEventListener('DOMContentLoaded', function(){
    const menu = document.getElementById('mobileMenu');
    const btn = document.querySelector('.menu-toggle');
    if(!menu || !btn) return;

    btn.addEventListener('click', function(event){
      event.preventDefault();
      event.stopPropagation();
      window.toggleMenu();
    });

    menu.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click', function(){ setMenu(false); });
    });

    document.addEventListener('click', function(event){
      if(!menu.classList.contains('open')) return;
      if(menu.contains(event.target) || btn.contains(event.target)) return;
      setMenu(false);
    });

    document.addEventListener('keydown', function(event){
      if(event.key === 'Escape') setMenu(false);
    });
  });
})();
