/* ============================================================
   AMARTE STUDIO — Comportements d'interface
   ------------------------------------------------------------
   Aucune dépendance externe. Le site reste entièrement lisible
   et navigable si ce fichier n'est pas exécuté.

   1. Année du pied de page
   2. En-tête au défilement
   3. Panneau de navigation (ouverture, focus, clavier, iOS)
      + barre d'ordinateur : sous-menu « Le studio », bascule 1025 px
   4. Révélations au défilement
   5. Formulaires de contact
   6. Filtres de la page Cours
   7. Simulateur de la page Tarifs
   8. Widget de réservation Glofox
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  /* ── 1 · Année du pied de page ─────────────────────────── */
  var year = String(new Date().getFullYear());
  document.querySelectorAll('.footer-year').forEach(function (el) {
    el.textContent = year;
  });

  /* ── 2 · En-tête au défilement ─────────────────────────── */
  (function header() {
    var el = document.getElementById('nav-header');
    if (!el) return;

    var ticking = false;
    function sync() {
      ticking = false;
      // Le panneau ouvert fige la page (scrollY = 0) : on gèle l'état de
      // l'en-tête pour éviter qu'il ne clignote pendant l'ouverture.
      if (document.body.classList.contains('menu-open')) return;
      el.classList.toggle('is-scrolled', window.scrollY > 40);
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(sync);
    }, { passive: true });
    sync();
  })();

  /* ── 3 · Panneau de navigation ─────────────────────────── */
  /* Le panneau s'ouvre en demi-largeur sur le côté droit : la page reste
     visible derrière, voilée par `.nav-scrim` qui referme au clic. */
  (function navMenu() {
    var burger = document.getElementById('burger-btn');
    var menu   = document.getElementById('nav-menu');
    var scrim  = document.getElementById('nav-scrim');
    var header = document.getElementById('nav-header');
    if (!burger || !menu) return;

    var isOpen = false;
    var scrollY = 0;
    var FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

    // Tout ce qui n'est ni l'en-tête, ni le voile, ni le panneau : rendu
    // inerte pendant l'ouverture (invisible aux lecteurs d'écran et au clavier).
    var pageParts = Array.prototype.filter.call(document.body.children, function (el) {
      if (el === menu || el === scrim || el === header) return false;
      return ['SCRIPT', 'NOSCRIPT', 'TEMPLATE', 'STYLE'].indexOf(el.tagName) === -1;
    });

    function focusables() {
      return Array.prototype.filter.call(
        menu.querySelectorAll(FOCUSABLE),
        function (el) { return el.offsetParent !== null; }
      );
    }

    function open() {
      if (isOpen) return;
      isOpen = true;
      scrollY = window.scrollY;

      // Le verrou de défilement escamote la barre de défilement : on réserve
      // sa largeur pour que la page ne saute pas latéralement.
      var gap = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--sbw', (gap > 0 ? gap : 0) + 'px');

      menu.removeAttribute('inert');
      menu.setAttribute('aria-hidden', 'false');
      menu.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Fermer le menu');
      pageParts.forEach(function (el) { el.setAttribute('inert', ''); });

      // Verrou de défilement compatible iOS : on fige la page à sa position.
      document.body.style.top = '-' + scrollY + 'px';
      document.body.classList.add('menu-open');

      var first = focusables()[0];
      if (first) first.focus({ preventScroll: true });
    }

    function close(returnFocus) {
      if (!isOpen) return;
      isOpen = false;

      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      menu.setAttribute('inert', '');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Ouvrir le menu');
      pageParts.forEach(function (el) { el.removeAttribute('inert'); });

      document.body.classList.remove('menu-open');
      document.body.style.top = '';
      // Restitution exacte de la position, sans défilement animé.
      var behavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, scrollY);
      document.documentElement.style.scrollBehavior = behavior;
      document.documentElement.style.removeProperty('--sbw');

      if (returnFocus) burger.focus({ preventScroll: true });
    }

    // État initial : le panneau est hors du flux d'accessibilité.
    menu.setAttribute('aria-hidden', 'true');
    menu.setAttribute('inert', '');

    burger.addEventListener('click', function () {
      isOpen ? close(true) : open();
    });

    // Un clic à côté du panneau referme.
    if (scrim) scrim.addEventListener('click', function () { close(true); });

    // Un lien cliqué ferme le panneau (la navigation suit).
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) close(false);
    });

    // Échap ferme, Tab reste enfermé dans le panneau.
    document.addEventListener('keydown', function (e) {
      if (!isOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); close(true); return; }
      if (e.key !== 'Tab') return;

      var items = focusables();
      if (!items.length) return;
      var first = items[0];
      var last  = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  })();

  /* ── 3b · Sous-menu « Le studio » (navigation d'ordinateur) ──
     Le seul repli de la barre : les trois pages qui parlent du lieu.
     Sans ce script le bouton reste inerte, mais les trois pages restent
     joignables par le pied de page et par le panneau latéral. */
  (function studioMenu() {
    var btn  = document.getElementById('studio-menu-btn');
    var drop = document.getElementById('studio-menu');
    if (!btn || !drop) return;

    function setOpen(open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) drop.removeAttribute('hidden');
      else drop.setAttribute('hidden', '');
    }
    setOpen(false);

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(btn.getAttribute('aria-expanded') !== 'true');
    });

    // Un clic ailleurs, Échap, ou le départ du focus referment.
    document.addEventListener('click', function (e) {
      if (!drop.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (btn.getAttribute('aria-expanded') !== 'true') return;
      setOpen(false);
      btn.focus();
    });
    document.addEventListener('focusin', function (e) {
      if (e.target !== btn && !drop.contains(e.target)) setOpen(false);
    });
  })();

  /* ── 3c · Passage tablette → ordinateur ──
     Au-delà de 1024 px la barre affiche toutes les pages et le bouton
     du panneau disparaît. Si le panneau était ouvert au moment du
     redimensionnement, son bouton de fermeture s'en irait avec lui :
     on le referme donc nous-mêmes. */
  (function navBreakpoint() {
    if (!window.matchMedia) return;
    var desktop = window.matchMedia('(min-width: 1025px)');
    var burger  = document.getElementById('burger-btn');
    if (!burger) return;

    function sync(e) {
      if (e.matches && burger.getAttribute('aria-expanded') === 'true') burger.click();
    }
    if (desktop.addEventListener) desktop.addEventListener('change', sync);
    else if (desktop.addListener) desktop.addListener(sync);
  })();

  /* ── 4 · Révélations au défilement ─────────────────────── */
  (function reveals() {
    var root = document.documentElement;
    if (!root.classList.contains('js-reveal')) return;

    var targets = [];
    document.querySelectorAll('.gs-reveal').forEach(function (el) {
      if (!el.closest('.gs-stagger')) targets.push(el);
    });
    document.querySelectorAll('.gs-stagger').forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
        targets.push(child);
      });
    });
    document.querySelectorAll('.gs-img-reveal').forEach(function (el) { targets.push(el); });

    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      // Sans observateur, tout est visible d'emblée : les éléments
      // ajoutés plus tard n'ont qu'à recevoir la même classe.
      window.amarteRevele = function (racine) {
        (racine || document).querySelectorAll('.gs-reveal, .gs-img-reveal')
          .forEach(function (el) { el.classList.add('is-in'); });
      };
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    targets.forEach(function (el) { observer.observe(el); });

    // Filet de sécurité : rien ne doit rester invisible.
    window.setTimeout(function () {
      targets.forEach(function (el) { el.classList.add('is-in'); });
    }, 2500);

    // Les cartes insérées après coup (grille des cours pilotée par le
    // CMS) ne sont pas dans `targets` : sans cet appel elles resteraient
    // à opacité zéro, donc invisibles.
    window.amarteRevele = function (racine) {
      var portee = racine || document;

      // Les groupes en cascade appliquent leur décalage aux enfants.
      // Recréés après coup, ceux-ci apparaîtraient tous en même temps.
      var enCascade = [];
      portee.querySelectorAll('.gs-stagger').forEach(function (groupe) {
        Array.prototype.forEach.call(groupe.children, function (enfant, i) {
          enfant.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
          enCascade.push(enfant);
        });
      });

      var nouveaux = Array.prototype.slice.call(
        portee.querySelectorAll('.gs-reveal, .gs-img-reveal')
      ).concat(enCascade);

      nouveaux.forEach(function (el) {
        if (el.classList.contains('is-in')) return;
        observer.observe(el);
      });
      window.setTimeout(function () {
        nouveaux.forEach(function (el) { el.classList.add('is-in'); });
      }, 2500);
    };
  })();

  /* ── 5 · Formulaires de contact ────────────────────────── */

  /* Présélection du sujet depuis l'adresse : /contact?sujet=entreprise.
     Les clés sont les `value` des <option> de /contact. Paramètre absent
     ou inconnu : le champ garde son choix par défaut, rien ne casse. Le
     formulaire reste utilisable si ce script ne s'exécute pas. */
  (function presetSubject() {
    var select = document.getElementById('c-sujet');
    if (!select || !window.URLSearchParams) return;

    var wanted = new URLSearchParams(window.location.search).get('sujet');
    if (!wanted) return;

    var known = Array.prototype.some.call(select.options, function (option) {
      return option.value === wanted;
    });
    if (known) select.value = wanted;
  })();

  /* Les formulaires sont envoyés à `data-endpoint` (contact.php, sur
     l'hébergement) puis confirmés à l'écran. La confirmation rappelle
     toujours WhatsApp et l'e-mail : si l'envoi échoue malgré tout,
     personne ne doit rester sans moyen de nous joindre.
     Un <form> sans `data-endpoint` affiche la confirmation sans rien
     envoyer — à ne laisser que pour une maquette. */
  /* Jeton de page — couche 2 de l'antispam (voir spam-filter.php).

     On écrit ici, au chargement, un horodatage suivi d'une somme de
     contrôle. Le PHP la recalcule à l'identique : un robot qui poste
     directement sur contact.php sans jamais afficher la page ne peut pas
     la produire, et le serveur déduit de l'horodatage le temps de
     remplissage (moins de trois secondes = machine).

     Le sel et le hachage doivent rester identiques à ceux de
     spam-filter.php — hachage 31 sur 32 bits rendu en base 36. Ce n'est
     pas de la cryptographie : ça n'a pas à résister à quelqu'un qui lit
     le code du site, seulement à coûter plus cher qu'un POST à l'aveugle. */
  (function jetonDePage() {
    var champs = document.querySelectorAll('[data-jeton]');
    if (!champs.length) return;

    var SALT = 'antispam-v1';
    var seconds = Math.floor(Date.now() / 1000);
    var source = SALT + ':' + seconds;
    var hash = 0;
    for (var i = 0; i < source.length; i++) {
      hash = (hash * 31 + source.charCodeAt(i)) >>> 0;
    }
    var jeton = seconds + '.' + hash.toString(36);

    champs.forEach(function (champ) { champ.value = jeton; });
  })();

  document.querySelectorAll('.contact-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var wrap = form.closest('.form-wrap');
      if (!wrap) return;

      var endpoint = form.dataset.endpoint;
      // Le délai de réponse annoncé n'est pas le même partout : la page
      // Location ne promet plus de 24 h. `data-success-note` sur le <form>
      // remplace la première phrase de la confirmation.
      var note = form.dataset.successNote || 'On vous répond sous 24&nbsp;heures ouvrées.';
      var done = function () {
        // La confirmation rappelle toujours WhatsApp et l'e-mail : personne
        // ne doit rester sans réponse si le message n'arrive pas.
        wrap.innerHTML =
          '<div class="form-success" role="status" tabindex="-1">' +
            '<p class="form-success-title">Message bien reçu.</p>' +
            '<p class="form-success-sub">' + note + '<br>' +
            'Besoin d\'une réponse tout de suite ? ' +
            '<a href="https://wa.me/41788106464" target="_blank" rel="noopener">WhatsApp</a> ou ' +
            '<a href="mailto:hello@amarte.ch">hello@amarte.ch</a>.</p>' +
          '</div>';
        // Le bouton qui avait le focus vient d'être retiré : on le redonne à
        // la confirmation, sinon le focus retombe en haut de page.
        var success = wrap.firstChild;
        if (success && success.focus) success.focus({ preventScroll: true });
        wrap.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
      };

      if (!endpoint) { done(); return; }

      var button = form.querySelector('[type="submit"]');
      if (button) { button.disabled = true; button.textContent = 'Envoi…'; }

      var data = new FormData(form);
      // Permet de savoir depuis quelle page le message part : les deux
      // formulaires arrivent sur la même boîte mail.
      if (form.dataset.origine) data.append('origine', form.dataset.origine);

      fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          // fetch() ne rejette pas sur une erreur HTTP : sans ce test,
          // un endpoint en panne afficherait quand même « Message reçu »
          // et le visiteur croirait avoir été entendu.
          if (!res.ok) throw new Error('HTTP ' + res.status);
          done();
        })
        .catch(function () {
          if (button) { button.disabled = false; button.textContent = 'Réessayer'; }
        });
    });
  });

  /* ── 6 · Filtres de la page Cours ──────────────────────── */
  (function coursFilters() {
    var bar = document.querySelector('.cours-filters-bar');
    var grid = document.getElementById('cours-grid');
    if (!bar || !grid) return;

    var empty = document.getElementById('cours-empty');

    // L'annonce du nombre de cours affichés (#cours-count) et la synchronisation
    // de l'URL sont gérées par le script de cours.html, qui écoute le même clic.
    function apply(value) {
      var visible = 0;
      grid.querySelectorAll('.cours-item').forEach(function (item) {
        var show = value === 'all' || item.dataset.cat === value;
        item.hidden = !show;
        if (show) visible++;
      });
      if (empty) empty.classList.toggle('is-visible', visible === 0);
    }

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.cours-filter');
      if (!btn) return;
      bar.querySelectorAll('.cours-filter').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      apply(btn.dataset.filter);
    });
  })();

  /* ── 7 · Simulateur de la page Tarifs ──────────────────── */
  (function tarifsSimulateur() {
    var calc = document.getElementById('tarifs-simulateur');
    if (!calc) return;

    var tabs   = document.getElementById('sim-plan-tabs');
    var slider = document.getElementById('freq-slider');
    var freqEl = document.getElementById('freq-value');
    var costEl = document.getElementById('calc-cost');
    var saveEl = document.getElementById('calc-saving');
    var totEl  = document.getElementById('calc-total');
    if (!tabs || !slider || !costEl) return;

    var WEEKS_PER_MONTH = 4.33;

    function activeTab() {
      return tabs.querySelector('.tarifs-calc-tab[aria-pressed="true"]')
          || tabs.querySelector('.tarifs-calc-tab');
    }

    function update() {
      var tab = activeTab();
      if (!tab) return;

      var price     = parseFloat(tab.dataset.price);
      var months    = parseInt(tab.dataset.months, 10);
      var unitPrice = parseFloat(calc.dataset.unitPrice) || 30;
      var frequency = parseInt(slider.value, 10);
      if (!price || !months || !frequency) return;

      var sessions = Math.round(frequency * WEEKS_PER_MONTH * months);
      var perClass = price / sessions;
      var saving   = unitPrice - perClass;

      if (freqEl) freqEl.textContent = String(frequency);
      costEl.textContent = 'CHF ' + perClass.toFixed(2);
      if (totEl)  totEl.textContent = '~' + sessions + ' cours';
      if (saveEl) saveEl.textContent = saving > 0 ? '−CHF ' + saving.toFixed(2) + ' / cours' : '—';
    }

    tabs.addEventListener('click', function (e) {
      var btn = e.target.closest('.tarifs-calc-tab');
      if (!btn) return;
      tabs.querySelectorAll('.tarifs-calc-tab').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      update();
    });
    slider.addEventListener('input', update);
    update();
  })();

  /* ── 8 · Widget de réservation Glofox ──────────────────── */
  /* L'indicateur de chargement n'est posé que par ce script : il disparaît
     dès que l'iframe répond, et au plus tard au bout de quelques secondes.
     Si le widget ne charge jamais, le lien de secours placé juste en dessous
     prend le relais — mais rien ne tourne indéfiniment. */
  (function glofoxEmbed() {
    var wrap  = document.querySelector('.glofox-embed-wrap');
    var frame = wrap && wrap.querySelector('iframe');
    if (!frame) return;

    var timer = 0;
    function settled() {
      window.clearTimeout(timer);
      wrap.classList.remove('is-loading');
      frame.removeEventListener('load', settled);
      window.removeEventListener('load', settled);
    }

    wrap.classList.add('is-loading');
    frame.addEventListener('load', settled);
    window.addEventListener('load', settled);
    timer = window.setTimeout(settled, 10000);
  })();
})();
