// carrusel.js — versión responsive y robusta
(() => {
  const carruselInterno = document.querySelector('.carrusel-interno');
  const btnPrev = document.querySelector('.boton-izq');
  const btnNext = document.querySelector('.boton-der');

  if (!carruselInterno || !btnPrev || !btnNext) return;

  let autoslideTimer = null;
  let animando = false;

  // Estado dinámico
  let visibles = 3;
  let gap = 20;
  let anchoProducto = 400;
  let index = 0; // índice en la lista que incluye clones
  let originalCount = 0;

  // Devuelve los productos "originales" (sin contar clones)
  function getOriginals() {
    return Array.from(carruselInterno.querySelectorAll('.producto')).filter(
      el => !el.classList.contains('clone')
    );
  }

  // Elimina clones previos
  function removeClones() {
    const clones = carruselInterno.querySelectorAll('.producto.clone');
    clones.forEach(c => c.remove());
  }

  // Medir gap (flex gap) y ancho producto visibles por CSS
  function medirDimensiones() {
    const first = carruselInterno.querySelector('.producto');
    const computed = getComputedStyle(carruselInterno);
    const gapVal = computed.gap || computed.columnGap || computed.getPropertyValue('gap');
    gap = gapVal ? parseFloat(gapVal) : 20;

    if (first) {
      const rect = first.getBoundingClientRect();
      anchoProducto = Math.round(rect.width);
    } else {
      anchoProducto = 400;
    }

    // Calcular cuántos visibles caben en el contenedor (.carrusel)
    const carrusel = carruselInterno.closest('.carrusel');
    if (carrusel) {
      const contW = carrusel.clientWidth;
      visibles = Math.max(1, Math.floor((contW + gap) / (anchoProducto + gap)));
    } else {
      visibles = 3;
    }
  }

  // Clona últimos visibles al inicio y primeros visibles al final
  function addClones() {
    removeClones();
    const originals = getOriginals();
    originalCount = originals.length;
    if (originalCount === 0) return;

    // clones al inicio (últimos)
    const lastSlice = originals.slice(-visibles);
    lastSlice.forEach(node => {
      const clone = node.cloneNode(true);
      clone.classList.add('clone');
      carruselInterno.insertBefore(clone, carruselInterno.firstChild);
    });

    // clones al final (primeros)
    const firstSlice = originals.slice(0, visibles);
    firstSlice.forEach(node => {
      const clone = node.cloneNode(true);
      clone.classList.add('clone');
      carruselInterno.appendChild(clone);
    });
  }

  // Posicionar en el índice inicial (visibles)
  function setInitialPosition() {
    index = visibles;
    const offset = index * (anchoProducto + gap);
    carruselInterno.style.transition = 'none';
    carruselInterno.style.transform = `translateX(${-offset}px)`;
    requestAnimationFrame(() => {
      carruselInterno.style.transition = '';
    });
  }

  // Mover el carrusel N pasos (positivo = derecha)
  function moverCarrusel(direccion = 1) {
    if (animando) return;
    animando = true;
    index += direccion;
    const offset = index * (anchoProducto + gap);
    carruselInterno.style.transition = 'transform 0.5s ease';
    carruselInterno.style.transform = `translateX(${-offset}px)`;
  }

  // Manejo al terminar la transición (reajustar cuando se pase a clones)
  function onTransitionEnd() {
    animando = false;
    const totalItems = carruselInterno.querySelectorAll('.producto').length; // incluye clones

    if (index >= originalCount + visibles) {
      carruselInterno.style.transition = 'none';
      index = visibles;
      const offset = index * (anchoProducto + gap);
      carruselInterno.style.transform = `translateX(${-offset}px)`;
    }

    if (index < visibles) {
      carruselInterno.style.transition = 'none';
      index = originalCount;
      const offset = index * (anchoProducto + gap);
      carruselInterno.style.transform = `translateX(${-offset}px)`;
    }
  }

  // Auto slide
  function startAutoSlide() {
    stopAutoSlide();
    autoslideTimer = setInterval(() => moverCarrusel(1), 5000);
  }

  function stopAutoSlide() {
    if (autoslideTimer) {
      clearInterval(autoslideTimer);
      autoslideTimer = null;
    }
  }

  // Re-inicializa todo (usa medirDimensiones para ser responsive)
  function initCarousel() {
    stopAutoSlide();
    carruselInterno.removeEventListener('transitionend', onTransitionEnd);
    medirDimensiones();
    addClones();

    const first = carruselInterno.querySelector('.producto');
    if (first) {
      const rect = first.getBoundingClientRect();
      anchoProducto = Math.round(rect.width);
    }

    setInitialPosition();
    carruselInterno.addEventListener('transitionend', onTransitionEnd);
    startAutoSlide();
  }

  // botones
  const btnNextHandler = () => {
    stopAutoSlide();
    moverCarrusel(1);
    startAutoSlide();
  };

  const btnPrevHandler = () => {
    stopAutoSlide();
    moverCarrusel(-1);
    startAutoSlide();
  };

  let btnNextHandlerRef = null;
  let btnPrevHandlerRef = null;

  function attachButtonHandlers() {
    btnNextHandlerRef && btnNext.removeEventListener('click', btnNextHandlerRef);
    btnPrevHandlerRef && btnPrev.removeEventListener('click', btnPrevHandlerRef);

    btnNextHandlerRef = btnNextHandler;
    btnPrevHandlerRef = btnPrevHandler;

    btnNext.addEventListener('click', btnNextHandlerRef);
    btnPrev.addEventListener('click', btnPrevHandlerRef);
  }

  // On resize: reinit but try to preserve approximate visible product
  let resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const leftTranslate = Math.abs(getComputedTranslateX(carruselInterno));
      const approx = Math.round(leftTranslate / (anchoProducto + gap));
      initCarousel();

      index = Math.min(Math.max(visibles, approx), originalCount + visibles);
      const offset = index * (anchoProducto + gap);
      carruselInterno.style.transition = 'none';
      carruselInterno.style.transform = `translateX(${-offset}px)`;

      requestAnimationFrame(() => {
        carruselInterno.style.transition = '';
      });
    }, 150);
  }

  // Utility: get computed translateX of element
  function getComputedTranslateX(el) {
    const style = window.getComputedStyle(el);
    const transform = style.transform || style.webkitTransform;
    if (!transform || transform === 'none') return 0;
    const match = transform.match(/matrix\((.+)\)/);
    if (match) {
      const values = match[1].split(', ');
      return parseFloat(values[4]);
    }
    return 0;
  }

  // Inicializar y listeners de resize
  initCarousel();
  attachButtonHandlers();
  window.addEventListener('resize', onResize);

  // parar autoslide al hover (opcional: mejora UX)
  const carruselRoot = carruselInterno.closest('.carrusel');
  if (carruselRoot) {
    carruselRoot.addEventListener('mouseenter', stopAutoSlide);
    carruselRoot.addEventListener('mouseleave', startAutoSlide);
  }
})();
