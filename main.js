function toggleMenu(){
  const menu=document.getElementById('mobileMenu');
  const btn=document.querySelector('.menu-toggle');
  menu.classList.toggle('open');
  btn.setAttribute('aria-expanded', menu.classList.contains('open'));
}
