/* =========================================================
   Anna Green — site vitrine
   Vanilla JS, sans dépendance.
   ========================================================= */
(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* -------------------------------------------------------
     1. Préchargeur — compteur 0 → 100
     ------------------------------------------------------- */
  const loader    = $('#loader');
  const loaderNum = $('#loaderNum');
  const loaderBar = $('#loaderBar');

  function runLoader(done) {
    if (!loader) return done();
    if (reduced) {
      loader.classList.add('is-done');
      return done();
    }

    let value = 0;
    const tick = () => {
      // progression irrégulière, plus lente vers la fin — ~1,3 s au total
      value = Math.min(100, value + Math.random() * (value > 80 ? 7 : 18));
      const shown = Math.floor(value);
      loaderNum.textContent = shown;
      loaderBar.style.width = shown + '%';

      if (value < 100) {
        setTimeout(tick, 38 + Math.random() * 62);
      } else {
        setTimeout(() => {
          loader.classList.add('is-done');
          done();
        }, 300);
      }
    };
    tick();
  }

  /* -------------------------------------------------------
     2. Curseur personnalisé (halo + point)
     ------------------------------------------------------- */
  function initCursor() {
    const ring = $('#cursor');
    const dot  = $('#cursorDot');
    if (!ring || !dot || !finePointer || reduced) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let visible = false;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;

      if (!visible) {
        visible = true;
        ring.classList.add('is-visible');
        dot.classList.add('is-visible');
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      visible = false;
      ring.classList.remove('is-visible');
      dot.classList.remove('is-visible');
    });

    // le cercle suit avec du retard : c'est ce décalage qui donne la traîne
    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    })();

    // états au survol
    const setState = (el, on) => {
      const kind = el.dataset.cursor;                 // "link" | "view"
      ring.classList.toggle('is-' + kind, on);
    };

    $$('[data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', () => setState(el, true));
      el.addEventListener('mouseleave', () => setState(el, false));
    });
  }

  /* -------------------------------------------------------
     3. Révélations au scroll
     ------------------------------------------------------- */
  function initReveal() {
    // le hero est animé par revealHero() à la fin du préchargeur
    const targets = [
      ...$$('.reveal'),
      ...$$('[data-rule]'),
      ...$$('.line__in')
    ].filter((el) => !el.closest('.hero'));

    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = el.dataset.delay || stagger(el);
        el.style.transitionDelay = delay + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    targets.forEach((el) => io.observe(el));

    // décalage automatique entre frères d'une même liste
    function stagger(el) {
      const parent = el.closest('.services, .projects, .socials');
      if (!parent) return 0;
      const item = el.closest('li') || el;
      return [...parent.children].indexOf(item) * 90;
    }
  }

  // Titre + méta du hero : révélation enchaînée dès la fin du préchargeur
  function revealHero() {
    $$('.hero .line__in, .hero .reveal').forEach((el, i) => {
      el.style.transitionDelay = (reduced ? 0 : 100 + i * 120) + 'ms';
      el.classList.add('is-in');
    });
  }

  /* -------------------------------------------------------
     4. Machine à écrire (rôles)
     ------------------------------------------------------- */
  function initTypewriter() {
    const el = $('#typewriter');
    if (!el) return;

    // TODO : vos intitulés — s'enchaînent en boucle sous le nom
    const roles = [
      'Développeur web',
      'HTML · CSS · JavaScript',
      'PHP & WordPress'
    ];

    if (reduced) {
      el.textContent = roles.join(' · ');
      return;
    }

    const caret = document.createElement('span');
    caret.className = 'caret';
    const text = document.createElement('span');
    el.append(text, caret);

    let i = 0, j = 0, deleting = false;

    (function type() {
      const word = roles[i];
      text.textContent = word.slice(0, j);

      let wait = deleting ? 34 : 62;

      if (!deleting && j === word.length) {
        deleting = true;
        wait = 1900;
      } else if (deleting && j === 0) {
        deleting = false;
        i = (i + 1) % roles.length;
        wait = 320;
      } else {
        j += deleting ? -1 : 1;
      }

      setTimeout(type, wait);
    })();
  }

  /* -------------------------------------------------------
     5. Header : masquage, fond, lien actif
     ------------------------------------------------------- */
  function initHeader() {
    const header = $('#header');
    const links  = $$('.nav__link');
    const sections = links
      .map((a) => $(a.getAttribute('href')))
      .filter(Boolean);

    let last = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY;

      header.classList.toggle('is-solid', y > 40);
      // on masque en descendant, on ré-affiche en remontant
      header.classList.toggle('is-hidden', y > last && y > 300 && !$('#nav').classList.contains('is-open'));
      last = y;

      // section courante
      const mid = y + window.innerHeight * 0.35;
      let current = null;
      sections.forEach((s) => { if (s.offsetTop <= mid) current = s; });

      links.forEach((a) => {
        a.classList.toggle('is-active', current && a.getAttribute('href') === '#' + current.id);
      });

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(onScroll);
    }, { passive: true });

    onScroll();
  }

  /* -------------------------------------------------------
     6. Menu mobile
     ------------------------------------------------------- */
  function initMenu() {
    const burger = $('#burger');
    const nav    = $('#nav');
    if (!burger || !nav) return;

    const close = () => {
      burger.classList.remove('is-open');
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Ouvrir le menu');
      document.body.classList.remove('is-locked');
    };

    burger.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      burger.classList.toggle('is-open', open);
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      document.body.classList.toggle('is-locked', open);
    });

    $$('.nav__link', nav).forEach((a) => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* -------------------------------------------------------
     7. Horloge + année
     ------------------------------------------------------- */
  function initClock() {
    const year  = $('#year');
    const clock = $('#clock');
    if (year) year.textContent = new Date().getFullYear();
    if (!clock) return;

    const fmt = new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false, timeZone: 'Europe/Paris'
    });

    const tick = () => { clock.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 1000);
  }

  /* -------------------------------------------------------
     8. Démarrage
     ------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initReveal();
    initTypewriter();
    initHeader();
    initMenu();
    initClock();

    runLoader(revealHero);
  });
})();
