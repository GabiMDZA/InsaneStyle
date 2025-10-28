(() => {
  document.querySelectorAll('.carrusel').forEach((carrusel) => {
    const carruselInterno = carrusel.querySelector('.carrusel-interno');
    const btnPrev = carrusel.querySelector('.boton-izq');
    const btnNext = carrusel.querySelector('.boton-der');

    if (!carruselInterno || !btnPrev || !btnNext) return;

    let autoslideTimer = null;
    let animando = false;

    let visibles = 3;
    let gap = 20;
    let anchoProducto = 400;
    let index = 0;
    let originalCount = 0;

    function getOriginals() {
      return Array.from(carruselInterno.querySelectorAll('.producto')).filter(
        el => !el.classList.contains('clone')
      );
    }

    function removeClones() {
      carruselInterno.querySelectorAll('.producto.clone').forEach(c => c.remove());
    }

    function medirDimensiones() {
      const first = carruselInterno.querySelector('.producto');
      const computed = getComputedStyle(carruselInterno);
      const gapVal = computed.gap || computed.columnGap || computed.getPropertyValue('gap');
      gap = gapVal ? parseFloat(gapVal) : 20;

      if (first) {
        const rect = first.getBoundingClientRect();
        anchoProducto = Math.round(rect.width);
      }

      // Definir visibles según carrusel
      if (carrusel.classList.contains('destacados')) {
        visibles = window.innerWidth <= 1024 ? 2 : 3; // Productos destacados
      } else {
        visibles = window.innerWidth <= 1024 ? 3 : 4; // Gorras, Vans, DC
      }
    }

    function addClones() {
      removeClones();
      const originals = getOriginals();
      originalCount = originals.length;
      if (originalCount === 0) return;

      // IMPORTANTE: si hay menos originales que "visibles", ajustamos visibles
      // para evitar huecos y que el índice inicial sea mayor que la cantidad real.
      if (originalCount < visibles) {
        visibles = originalCount;
      }

      // Clones al inicio y al final
      const lastSlice = originals.slice(-visibles);
      lastSlice.forEach(node => {
        const clone = node.cloneNode(true);
        clone.classList.add('clone');
        carruselInterno.insertBefore(clone, carruselInterno.firstChild);
      });

      const firstSlice = originals.slice(0, visibles);
      firstSlice.forEach(node => {
        const clone = node.cloneNode(true);
        clone.classList.add('clone');
        carruselInterno.appendChild(clone);
      });
    }

    function setInitialPosition() {
      index = visibles;
      const offset = index * (anchoProducto + gap);
      carruselInterno.style.transition = 'none';
      carruselInterno.style.transform = `translateX(${-offset}px)`;
      requestAnimationFrame(() => {
        carruselInterno.style.transition = '';
      });
    }

    function moverCarrusel(direccion = 1) {
      if (animando) return;
      animando = true;
      index += direccion;
      const offset = index * (anchoProducto + gap);
      carruselInterno.style.transition = 'transform 0.5s ease';
      carruselInterno.style.transform = `translateX(${-offset}px)`;
    }

    function onTransitionEnd() {
      animando = false;

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

    function initCarousel() {
      stopAutoSlide();
      carruselInterno.removeEventListener('transitionend', onTransitionEnd);
      medirDimensiones();
      addClones();
      setInitialPosition();
      carruselInterno.addEventListener('transitionend', onTransitionEnd);
      startAutoSlide();
    }

    btnNext.addEventListener('click', () => {
      stopAutoSlide();
      moverCarrusel(1);
      startAutoSlide();
    });

    btnPrev.addEventListener('click', () => {
      stopAutoSlide();
      moverCarrusel(-1);
      startAutoSlide();
    });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => initCarousel(), 200);
    });

    carrusel.addEventListener('mouseenter', stopAutoSlide);
    carrusel.addEventListener('mouseleave', startAutoSlide);

    initCarousel();
  });
})();
