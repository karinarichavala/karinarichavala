/* =========================================================
   CV / Portafolio — Karina Arichavala
   Interacciones: menú hamburguesa, tarjetas expandibles y
   scroll spy. JavaScript vanilla, sin dependencias.
   ========================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. Menú hamburguesa (mobile)
     --------------------------------------------------------- */
  const burger = document.querySelector('.topbar__burger');
  const nav = document.querySelector('.nav');

  function closeMenu() {
    nav.classList.remove('nav--open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menú de navegación');
  }

  function toggleMenu() {
    const isOpen = nav.classList.toggle('nav--open');
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
  }

  burger.addEventListener('click', toggleMenu);

  // Al elegir una sección, el menú se cierra para no tapar el contenido
  nav.addEventListener('click', function (event) {
    if (event.target.closest('.nav__link')) {
      closeMenu();
    }
  });

  // Escape cierra el menú y devuelve el foco al botón
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('nav--open')) {
      closeMenu();
      burger.focus();
    }
  });

  /* ---------------------------------------------------------
     2. Tarjetas expandibles (Experiencia y Proyectos)
     La animación usa max-height calculado a partir del alto
     real del contenido, para que la transición sea suave sin
     depender de un valor fijo.
     --------------------------------------------------------- */
  const cards = document.querySelectorAll('.card');

  cards.forEach(function (card) {
    const header = card.querySelector('.card__header');
    const detail = card.querySelector('.card__detail');

    header.addEventListener('click', function () {
      const willOpen = !card.classList.contains('card--open');

      card.classList.toggle('card--open', willOpen);
      header.setAttribute('aria-expanded', String(willOpen));

      if (willOpen) {
        detail.style.maxHeight = detail.scrollHeight + 'px';
      } else {
        // Fija el alto actual antes de colapsar para que la transición arranque
        detail.style.maxHeight = detail.scrollHeight + 'px';
        requestAnimationFrame(function () {
          detail.style.maxHeight = '0px';
        });
      }
    });

    // Una vez abierta, se libera el límite para que el contenido
    // pueda crecer (p. ej. al cambiar el ancho de la ventana)
    detail.addEventListener('transitionend', function (event) {
      if (event.propertyName === 'max-height' && card.classList.contains('card--open')) {
        detail.style.maxHeight = 'none';
      }
    });
  });

  // Al redimensionar, las tarjetas abiertas recalculan su altura
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      document.querySelectorAll('.card--open .card__detail').forEach(function (detail) {
        detail.style.maxHeight = 'none';
      });
    }, 150);
  });

  /* ---------------------------------------------------------
     3. Scroll spy: marca en el menú la sección visible
     --------------------------------------------------------- */
  const navLinks = Array.from(document.querySelectorAll('.nav__link'));
  const sections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute('href'));
    })
    .filter(Boolean);

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle('nav__link--active', link.getAttribute('href') === '#' + id);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    // Se considera "activa" la sección que cruza la franja superior
    // de la pantalla, justo por debajo de la barra fija.
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveLink(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });

    // Estado inicial: la primera sección, salvo que la página cargue con scroll
    if (window.scrollY < 100) {
      setActiveLink(sections[0].id);
    }
  }
})();
