const toggle = document.getElementById('menu-toggle');
const nav = document.getElementById('menu-nav');

// abrir/cerrar menú
toggle.addEventListener('click', () => {
  nav.classList.toggle('active');
});

// cerrar al hacer clic fuera o en un enlace
document.addEventListener('click', (e) => {
  if (!toggle.contains(e.target) && !nav.contains(e.target)) {
    nav.classList.remove('active');
  }
  if (e.target.tagName === 'A') {
    nav.classList.remove('active');
  }
});