const carruselInterno = document.querySelector('.carrusel-interno');
const productos = document.querySelectorAll('.producto');
const prev = document.querySelector('.boton-izq');
const next = document.querySelector('.boton-der');

const visibles = 3;
const gap = 20;
const anchoProducto = 400;
let index = visibles;
let animando = false;

// Clonar fotos
const productosArray = Array.from(productos);
productosArray.slice(-visibles).forEach(p => {
  const clone = p.cloneNode(true);
  clone.classList.add('clone');
  carruselInterno.insertBefore(clone, carruselInterno.firstChild);
});
productosArray.slice(0, visibles).forEach(p => {
  const clone = p.cloneNode(true);
  clone.classList.add('clone');
  carruselInterno.appendChild(clone);
});

// Posición inicial
carruselInterno.style.transform = `translateX(${-index * (anchoProducto + gap)}px)`;

// Mover fotos
function moverCarrusel(direccion) {
  if(animando) return;
  animando = true;
  index += direccion;
  carruselInterno.style.transition = 'transform 0.5s ease';
  carruselInterno.style.transform = `translateX(${-index * (anchoProducto + gap)}px)`;
}

// Botones
next.addEventListener('click', () => moverCarrusel(1));
prev.addEventListener('click', () => moverCarrusel(-1));

// Bucle
carruselInterno.addEventListener('transitionend', () => {
  animando = false;
  if(index >= productos.length + visibles) {
    carruselInterno.style.transition = 'none';
    index = visibles;
    carruselInterno.style.transform = `translateX(${-index * (anchoProducto + gap)}px)`;
  }
  if(index < visibles) {
    carruselInterno.style.transition = 'none';
    index = productos.length;
    carruselInterno.style.transform = `translateX(${-index * (anchoProducto + gap)}px)`;
  }
});

// AutoSlide
setInterval(() => moverCarrusel(1), 5000);
