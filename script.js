/* =========================================================
   CV / Portafolio — Karina Arichavala
   Interacciones: menú hamburguesa, tarjetas expandibles y
   scroll spy. JavaScript vanilla, sin dependencias.

   Cada bloque es independiente y comprueba que sus elementos
   existan antes de enlazar eventos.
   ========================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. Menú hamburguesa (mobile)
     --------------------------------------------------------- */
  function initMenu() {
    const burger = document.querySelector('.topbar__burger');
    const nav = document.querySelector('.nav');
    if (!burger || !nav) return;

    function setOpen(isOpen) {
      nav.classList.toggle('nav--open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      burger.setAttribute(
        'aria-label',
        isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'
      );
    }

    burger.addEventListener('click', function () {
      setOpen(!nav.classList.contains('nav--open'));
    });

    // Al elegir una sección, el menú se cierra para no tapar el contenido
    nav.addEventListener('click', function (event) {
      if (event.target.closest('.nav__link')) {
        setOpen(false);
      }
    });

    // Escape cierra el menú y devuelve el foco al botón
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('nav--open')) {
        setOpen(false);
        burger.focus();
      }
    });
  }

  /* ---------------------------------------------------------
     2. Tarjetas expandibles (Experiencia y Proyectos)
     La animación usa max-height calculado a partir del alto
     real del contenido, para que la transición sea suave sin
     depender de un valor fijo.
     --------------------------------------------------------- */
  function initCards() {
    const cards = document.querySelectorAll('.card');
    if (!cards.length) return;

    cards.forEach(function (card) {
      const header = card.querySelector('.card__header');
      const detail = card.querySelector('.card__detail');
      if (!header || !detail) return;

      header.addEventListener('click', function () {
        const willOpen = !card.classList.contains('card--open');

        card.classList.toggle('card--open', willOpen);
        header.setAttribute('aria-expanded', String(willOpen));

        // El alto real del contenido es el destino al abrir y el punto de
        // partida al cerrar, así que se fija en ambos casos.
        detail.style.maxHeight = detail.scrollHeight + 'px';

        if (!willOpen) {
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
  }

  /* ---------------------------------------------------------
     3. Scroll spy: marca en el menú la sección visible
     --------------------------------------------------------- */
  function initScrollSpy() {
    const navLinks = Array.from(document.querySelectorAll('.nav__link'));
    const sections = navLinks
      .map(function (link) {
        return document.querySelector(link.getAttribute('href'));
      })
      .filter(Boolean);

    if (!sections.length || !('IntersectionObserver' in window)) return;

    function setActiveLink(id) {
      navLinks.forEach(function (link) {
        link.classList.toggle('nav__link--active', link.getAttribute('href') === '#' + id);
      });
    }

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

  /* ---------------------------------------------------------
     4. Respaldo del correo
     Si el sistema no tiene un cliente de correo asociado, el
     enlace mailto: no produce ninguna reacción visible. El
     popover muestra la dirección y deja copiarla. El enlace
     conserva su comportamiento: nunca se cancela el evento.
     --------------------------------------------------------- */
  function initEmailFallback() {
    const trigger = document.querySelector('.contact__item--email');
    const popover = document.querySelector('.contact__popover');
    if (!trigger || !popover) return;

    const copyButton = popover.querySelector('.contact__copy');
    const status = popover.querySelector('[role="status"]');
    if (!copyButton) return;

    const address = trigger.getAttribute('href').replace('mailto:', '');
    const AUTO_CLOSE_MS = 4000;   // cierre si no hay interacción
    const FEEDBACK_MS = 2000;     // el ✓ visible tras copiar, antes de cerrarse
    const RESET_MS = 250;         // margen para restablecer el icono ya oculto
    let autoCloseTimer;
    let feedbackTimer;

    function isOpen() {
      return popover.classList.contains('contact__popover--open');
    }

    /* restoreFocus devuelve el foco al icono cuando se cierra por su cuenta;
       sin eso el foco quedaría en un botón ya invisible. No aplica al cerrar
       por clic afuera, donde el foco debe seguir a donde el usuario hizo clic. */
    function close(restoreFocus) {
      clearTimeout(autoCloseTimer);
      if (restoreFocus && popover.contains(document.activeElement)) {
        trigger.focus();
      }
      popover.classList.remove('contact__popover--open');
    }

    trigger.addEventListener('click', function (event) {
      popover.classList.add('contact__popover--open');
      clearTimeout(autoCloseTimer);

      // detail === 0 significa activación por teclado: en ese caso no se
      // cierra solo, o el foco se perdería antes de poder tabular al botón.
      if (event.detail !== 0) {
        autoCloseTimer = setTimeout(function () {
          close(false);
        }, AUTO_CLOSE_MS);
      }
    });

    // Cualquier interacción cancela el cierre automático
    ['pointerenter', 'focusin', 'click'].forEach(function (type) {
      popover.addEventListener(type, function () {
        clearTimeout(autoCloseTimer);
      });
    });

    /* navigator.clipboard solo existe en contextos seguros (https o
       localhost); al abrir el archivo con file:// hace falta el método antiguo. */
    function copyAddress() {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(address);
      }

      return new Promise(function (resolve, reject) {
        const field = document.createElement('textarea');
        field.value = address;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(field);
        copied ? resolve() : reject(new Error('execCommand falló'));
      });
    }

    copyButton.addEventListener('click', function () {
      copyAddress().then(
        function () {
          copyButton.classList.add('is-copied');
          if (status) status.textContent = 'Dirección de correo copiada';

          /* El ✓ se mantiene visible mientras el popover se desvanece, para
             que lo último que vea el usuario sea la confirmación. El icono
             se restablece después, ya oculto, listo para la próxima vez. */
          clearTimeout(feedbackTimer);
          feedbackTimer = setTimeout(function () {
            close(true);
            setTimeout(function () {
              copyButton.classList.remove('is-copied');
              if (status) status.textContent = '';
            }, RESET_MS);
          }, FEEDBACK_MS);
        },
        function () {
          if (status) status.textContent = 'No se pudo copiar, seleccioná la dirección a mano';
        }
      );
    });

    // Clic fuera: ni en el popover ni en el propio icono de correo
    document.addEventListener('click', function (event) {
      if (!isOpen()) return;
      if (event.target.closest('.contact__popover, .contact__item--email')) return;
      close();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen()) {
        close();
        trigger.focus();
      }
    });
  }

  initMenu();
  initCards();
  initScrollSpy();
  initEmailFallback();
})();
