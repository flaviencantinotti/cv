(() => {
  'use strict';

  const selectionner     = (selecteur, racine = document) => racine.querySelector(selecteur);
  const selectionnerTous = (selecteur, racine = document) => [...racine.querySelectorAll(selecteur)];

  const animationsReduites = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointeurPrecis     = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function lancerChargement(surFin) {
    const ecran  = selectionner('#chargement');
    const nombre = selectionner('#chargementNombre');
    const barre  = selectionner('#chargementBarre');

    if (!ecran) return surFin();

    if (animationsReduites) {
      ecran.classList.add('termine');
      return surFin();
    }

    let progression = 0;

    const avancer = () => {
      progression = Math.min(100, progression + Math.random() * (progression > 80 ? 7 : 18));
      const affiche = Math.floor(progression);
      nombre.textContent = affiche;
      barre.style.width = affiche + '%';

      if (progression < 100) {
        setTimeout(avancer, 38 + Math.random() * 62);
      } else {
        setTimeout(() => {
          ecran.classList.add('termine');
          surFin();
        }, 300);
      }
    };

    avancer();
  }

  function initCurseur() {
    const cercle = selectionner('#curseur');
    const point  = selectionner('#curseurPoint');
    if (!cercle || !point || !pointeurPrecis || animationsReduites) return;

    let sourisX = window.innerWidth / 2;
    let sourisY = window.innerHeight / 2;
    let cercleX = sourisX;
    let cercleY = sourisY;
    let affiche = false;

    window.addEventListener('mousemove', (evenement) => {
      sourisX = evenement.clientX;
      sourisY = evenement.clientY;
      point.style.transform = `translate3d(${sourisX}px, ${sourisY}px, 0)`;

      if (!affiche) {
        affiche = true;
        cercle.classList.add('actif');
        point.classList.add('actif');
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      affiche = false;
      cercle.classList.remove('actif');
      point.classList.remove('actif');
    });

    const suivre = () => {
      cercleX += (sourisX - cercleX) * 0.16;
      cercleY += (sourisY - cercleY) * 0.16;
      cercle.style.transform = `translate3d(${cercleX}px, ${cercleY}px, 0)`;
      requestAnimationFrame(suivre);
    };
    suivre();

    selectionnerTous('[data-curseur]').forEach((element) => {
      const etat = 'sur-' + element.dataset.curseur;
      element.addEventListener('mouseenter', () => cercle.classList.add(etat));
      element.addEventListener('mouseleave', () => cercle.classList.remove(etat));
    });
  }

  function decalageDansListe(element) {
    const liste = element.closest('.competences, .projets, .reseaux');
    if (!liste) return 0;
    const item = element.closest('li') || element;
    return [...liste.children].indexOf(item) * 90;
  }

  function initApparitions() {
    const cibles = [
      ...selectionnerTous('.apparition'),
      ...selectionnerTous('[data-separateur]'),
      ...selectionnerTous('.ligne__interieur')
    ].filter((element) => !element.closest('.accueil'));

    if (animationsReduites || !('IntersectionObserver' in window)) {
      cibles.forEach((element) => element.classList.add('visible'));
      return;
    }

    const observateur = new IntersectionObserver((entrees) => {
      entrees.forEach((entree) => {
        if (!entree.isIntersecting) return;
        const element = entree.target;
        element.style.transitionDelay = decalageDansListe(element) + 'ms';
        element.classList.add('visible');
        observateur.unobserve(element);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    cibles.forEach((element) => observateur.observe(element));
  }

  function afficherAccueil() {
    selectionnerTous('.accueil .ligne__interieur, .accueil .apparition').forEach((element, index) => {
      element.style.transitionDelay = (animationsReduites ? 0 : 100 + index * 120) + 'ms';
      element.classList.add('visible');
    });
  }

  function initRoleAnime() {
    const zone = selectionner('#roleAnime');
    if (!zone) return;

    const roles = [
      'Développeur web',
      'HTML · CSS · JavaScript',
      'PHP & WordPress'
    ];

    if (animationsReduites) {
      zone.textContent = roles.join(' · ');
      return;
    }

    const texte = document.createElement('span');
    const curseurTexte = document.createElement('span');
    curseurTexte.className = 'curseur-texte';
    zone.append(texte, curseurTexte);

    let indexRole = 0;
    let lettres = 0;
    let effacement = false;

    const ecrire = () => {
      const role = roles[indexRole];
      texte.textContent = role.slice(0, lettres);

      let attente = effacement ? 34 : 62;

      if (!effacement && lettres === role.length) {
        effacement = true;
        attente = 1900;
      } else if (effacement && lettres === 0) {
        effacement = false;
        indexRole = (indexRole + 1) % roles.length;
        attente = 320;
      } else {
        lettres += effacement ? -1 : 1;
      }

      setTimeout(ecrire, attente);
    };

    ecrire();
  }

  function initEntete() {
    const entete = selectionner('#entete');
    const menu   = selectionner('#menu');
    const liens  = selectionnerTous('.menu__lien');
    const sections = liens
      .map((lien) => selectionner(lien.getAttribute('href')))
      .filter(Boolean);

    let dernierY = window.scrollY;
    let enAttente = false;

    const auDefilement = () => {
      const y = window.scrollY;

      entete.classList.toggle('fond', y > 40);
      entete.classList.toggle('masque', y > dernierY && y > 300 && !menu.classList.contains('ouvert'));
      dernierY = y;

      const milieu = y + window.innerHeight * 0.35;
      let courante = null;
      sections.forEach((section) => {
        if (section.offsetTop <= milieu) courante = section;
      });

      liens.forEach((lien) => {
        lien.classList.toggle('courant', courante && lien.getAttribute('href') === '#' + courante.id);
      });

      enAttente = false;
    };

    window.addEventListener('scroll', () => {
      if (enAttente) return;
      enAttente = true;
      requestAnimationFrame(auDefilement);
    }, { passive: true });

    auDefilement();
  }

  function initMenu() {
    const bouton = selectionner('#boutonMenu');
    const menu   = selectionner('#menu');
    if (!bouton || !menu) return;

    const fermer = () => {
      bouton.classList.remove('ouvert');
      menu.classList.remove('ouvert');
      bouton.setAttribute('aria-expanded', 'false');
      bouton.setAttribute('aria-label', 'Ouvrir le menu');
      document.body.classList.remove('bloque');
    };

    bouton.addEventListener('click', () => {
      const ouvrir = !menu.classList.contains('ouvert');
      bouton.classList.toggle('ouvert', ouvrir);
      menu.classList.toggle('ouvert', ouvrir);
      bouton.setAttribute('aria-expanded', String(ouvrir));
      bouton.setAttribute('aria-label', ouvrir ? 'Fermer le menu' : 'Ouvrir le menu');
      document.body.classList.toggle('bloque', ouvrir);
    });

    selectionnerTous('.menu__lien', menu).forEach((lien) => lien.addEventListener('click', fermer));
    document.addEventListener('keydown', (evenement) => {
      if (evenement.key === 'Escape') fermer();
    });
  }

  function initHorloge() {
    const annee = selectionner('#annee');
    const heure = selectionner('#heure');

    if (annee) annee.textContent = new Date().getFullYear();
    if (!heure) return;

    const format = new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false, timeZone: 'Europe/Paris'
    });

    const afficher = () => { heure.textContent = format.format(new Date()); };
    afficher();
    setInterval(afficher, 1000);
  }

  function initApercus() {
    const liste = selectionner('.projets');
    if (!liste || !pointeurPrecis) return;

    liste.classList.add('avec-apercu');

    selectionnerTous('.projet', liste).forEach((projet) => {
      const lien    = selectionner('.projet__lien', projet);
      const capture = selectionner('.projet__capture', projet);
      if (!lien || !capture) return;

      let sourisX = 0, sourisY = 0;
      let imageX = 0, imageY = 0;
      let enCours = false;

      const suivre = () => {
        imageX += (sourisX - imageX) * 0.14;
        imageY += (sourisY - imageY) * 0.14;
        capture.style.left = imageX + 'px';
        capture.style.top  = imageY + 'px';
        if (enCours) requestAnimationFrame(suivre);
      };

      lien.addEventListener('mouseenter', (evenement) => {
        sourisX = imageX = evenement.clientX;
        sourisY = imageY = evenement.clientY;
        capture.classList.add('actif');
        if (!enCours) {
          enCours = true;
          requestAnimationFrame(suivre);
        }
      });

      lien.addEventListener('mousemove', (evenement) => {
        sourisX = evenement.clientX;
        sourisY = evenement.clientY;
      }, { passive: true });

      lien.addEventListener('mouseleave', () => {
        enCours = false;
        capture.classList.remove('actif');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initCurseur();
    initApparitions();
    initRoleAnime();
    initEntete();
    initMenu();
    initHorloge();
    initApercus();

    lancerChargement(afficherAccueil);
  });
})();
