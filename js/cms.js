/* ============================================================
   Amarte Studio — CMS Sanity.io
   Hydratation du contenu depuis l'API GROQ Sanity au runtime.
   Le site fonctionne sans ce fichier (contenu statique en fallback).

   SETUP :
   1. Créez un projet sur https://sanity.io/manage
   2. Remplacez SANITY_PROJECT_ID par votre vrai ID de projet
   3. Déployez le studio : cd sanity && npm install && npm run deploy
   ============================================================ */

(function () {
  'use strict';

  // ── CONFIG ────────────────────────────────────────────────────
  const SANITY_PROJECT_ID  = 'pvvt7no0';
  const SANITY_DATASET     = 'production';
  const SANITY_API_VERSION = '2024-01-01';
  // false = API directe (contenu toujours frais) → tes modifs publiées
  // apparaissent immédiatement, sans attendre le cache du CDN.
  const SANITY_CDN         = false;

  // Ne rien faire si le project ID n'est pas configuré
  if (SANITY_PROJECT_ID === 'VOTRE_PROJECT_ID') return;

  const host = SANITY_CDN
    ? `https://${SANITY_PROJECT_ID}.apicdn.sanity.io`
    : `https://${SANITY_PROJECT_ID}.api.sanity.io`;

  // ── FETCH GROQ ────────────────────────────────────────────────
  async function query(groq, params = {}) {
    const q   = encodeURIComponent(groq);
    const url = `${host}/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${q}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Sanity: ${res.status}`);
    return (await res.json()).result;
  }

  // ── HELPERS ───────────────────────────────────────────────────
  // Échappe le HTML pour éviter toute casse de la mise en page.
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Convertit un texte libre (Sanity) en HTML sûr :
  //   - \n  → <br>
  //   - *x* → <em>x</em>
  // L'échappement est fait AVANT pour empêcher toute injection.
  const richText = (s) => esc(s)
    .replace(/\n/g, '<br>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

  // Format suisse des montants : 1490 → "1'490"
  const chf = (n) => Number(n).toLocaleString('de-CH');

  // Libellés de catégorie
  const CAT = { yoga: 'Yoga', pilates: 'Pilates', bienetre: 'Bien-être' };

  // Mapping fichier HTML → ID page Sanity (pour les heros)
  const PAGE_ID = {
    'apropos.html':       'apropos',
    'cours.html':         'cours',
    'tarifs.html':        'tarifs',
    'calendrier.html':    'calendrier',
    'contact.html':       'contact',
    'location.html':      'location',
    'corpo.html':         'corpo',
    'premiere-fois.html': 'premiere-fois',
  };

  // ── DÉTECTION DE PAGE ─────────────────────────────────────────
  const raw  = location.pathname.split('/').pop().replace(/^$/, 'index');
  const page = raw.endsWith('.html') ? raw : raw + '.html';

  // ── HORAIRES (calendrier.html) ────────────────────────────────
  if (page === 'calendrier.html') {
    query(`*[_type == "horaire" && actif == true] | order(jourOrdre asc, heure asc) {
      jour, jourOrdre, heure, nom, duree, categorie
    }`).then(renderHoraires).catch(() => {/* garder le HTML statique */});
  }

  function renderHoraires(horaires) {
    if (!horaires || horaires.length === 0) return;

    const grid = document.querySelector('.schedule-grid');
    if (!grid) return;

    // Grouper par jour
    const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const byDay = {};
    horaires.forEach(h => {
      if (!byDay[h.jour]) byDay[h.jour] = [];
      byDay[h.jour].push(h);
    });

    // Tri chronologique à l'intérieur de chaque jour, par l'heure réelle
    // (indépendant de l'ordre Sanity / du champ jourOrdre) : un créneau
    // ajouté se range automatiquement au bon endroit. Gère 09:30 et 9h30.
    const toMin = (hh) => {
      const m = /(\d{1,2})\s*[:hH]\s*(\d{2})/.exec(hh || '');
      return m ? (+m[1]) * 60 + (+m[2]) : 9999;
    };
    Object.values(byDay).forEach(slots =>
      slots.sort((a, b) => toMin(a.heure) - toMin(b.heure))
    );

    const catColor = {
      yoga:     'var(--accent)',
      pilates:  'var(--text)',
      bienetre: 'var(--text-muted)',
    };

    const jours = JOURS.filter(j => byDay[j]);
    grid.style.gridTemplateColumns = `repeat(${jours.length}, 1fr)`;

    grid.innerHTML = jours.map(jour => {
      const slots = byDay[jour].map(h => `
        <div class="schedule-slot">
          <p class="slot-time">${h.heure}</p>
          <p class="slot-name" style="color:${catColor[h.categorie] || 'var(--text)'}">${h.nom}</p>
          <p class="slot-dur">${h.duree || '60 min'}</p>
        </div>`).join('');
      return `
        <div class="schedule-day">
          <div class="schedule-day-head">${jour}</div>
          ${slots}
        </div>`;
    }).join('');
  }

  // ── TÉMOIGNAGES (index.html) ──────────────────────────────────
  if (page === 'index.html') {
    query(`*[_type == "temoignage" && actif == true] | order(ordre asc) {
      texte, auteur, detail
    }`).then(renderTemoignages).catch(() => {});
  }

  function renderTemoignages(temoignages) {
    if (!temoignages || temoignages.length === 0) return;

    // Nouvelle structure — grille de cartes (.tcards / .tcard)
    const grid = document.querySelector('.tcards');
    if (grid) {
      const avatarVariants = ['tav-a','tav-b','tav-c','tav-d','tav-e','tav-f','tav-g','tav-h'];
      grid.innerHTML = temoignages.map((t, idx) => {
        const auteur   = (t.auteur || '').trim();
        const initiale = (auteur[0] || '?').toUpperCase();
        const variant  = avatarVariants[idx % avatarVariants.length];
        return `
          <div class="tcard">
            <div class="stars" aria-hidden="true">★★★★★</div>
            <p class="tq">« ${esc(t.texte || '')} »</p>
            <div class="twho">
              <span class="tav ${variant}">${esc(initiale)}</span>
              <span><span class="tn">${esc(auteur)}</span><br><span class="tc">${esc(t.detail || '')}</span></span>
            </div>
          </div>`;
      }).join('');
      return;
    }

    // Ancienne structure — carrousel (window.amarteInitTesti dans main.js)
    if (typeof window.amarteInitTesti === 'function') {
      window.amarteInitTesti(temoignages);
    }
  }

  // ── COURS (cours.html) ────────────────────────────────────────
  if (page === 'cours.html') {
    query(`*[_type == "cours" && actif == true] | order(ordre asc) {
      titre, sousTitre, categorie, description, niveau, joursHoraires, tags
    }`).then(renderCours).catch(() => {/* garder le HTML statique */});
  }

  function renderCours(cours) {
    if (!cours || cours.length === 0) return;

    const grid = document.getElementById('cours-grid');
    if (!grid) return;

    grid.innerHTML = cours.map(c => {
      const tags = (c.tags || [])
        .map(t => `<span class="cours-item-tag">${esc(t)}</span>`)
        .join('');
      return `
        <article class="cours-item gs-reveal visible" data-cat="${esc(c.categorie)}">
          <div class="cours-item-head">
            <span class="cours-item-cat ${esc(c.categorie)}">${CAT[c.categorie] || ''}</span>
            <span class="cours-item-schedule">${esc(c.joursHoraires || '')}</span>
          </div>
          <h3 class="cours-item-title">${esc(c.titre)}</h3>
          <p class="cours-item-sub">${esc(c.sousTitre || '')}</p>
          <p class="cours-item-desc">${esc(c.description || '')}</p>
          <div class="cours-item-footer">
            ${tags}
            <a href="calendrier.html" class="cours-item-link">Voir les horaires →</a>
          </div>
        </article>`;
    }).join('');

    // Les filtres (script inline de cours.html) re-interrogent le DOM
    // à chaque clic, ils prennent donc en compte ces nouvelles cartes.
  }

  // ── TARIFS (tarifs.html) ──────────────────────────────────────
  if (page === 'tarifs.html') {
    query(`*[_type == "tarif" && actif == true] | order(ordre asc) {
      nom, sousTitre, type, prix, prixParCours,
      description, recommande, aucunRenouvellement, glofoxUrl
    }`).then(renderTarifs).catch(() => {});
  }

  function renderTarifs(tarifs) {
    if (!tarifs || tarifs.length === 0) return;

    const illimites  = tarifs.filter(t => t.type === 'illimite');
    const packs      = tarifs.filter(t => t.type === 'pack');
    const decouverte = tarifs.find(t => t.type === 'decouverte');

    // 1) ── Cartes "Abonnements illimités" — génération complète ──
    //    (on remplace tout le bloc → ajout/suppression dans Sanity reflétés)
    const illimiteWrap = document.querySelector('.tarifs-illimite-card')?.closest('.tarifs-block-rows');
    if (illimiteWrap && illimites.length) {
      illimiteWrap.innerHTML = illimites.map(t => {
        const featured = t.recommande ? ' tarifs-illimite-featured' : '';
        const badge    = t.recommande ? `<span class="tarifs-illimite-badge">Recommandé</span>` : '';
        const note     = t.aucunRenouvellement ? `<p class="tarifs-illimite-note">Aucun renouvellement automatique</p>` : '';
        const rate     = t.prixParCours ? `<p class="tarifs-illimite-rate">CHF ${chf(t.prixParCours)} / mois</p>` : '';
        return `
          <div class="tarifs-illimite-card${featured}">
            ${badge}
            <div class="tarifs-illimite-left">
              <p class="tarifs-illimite-name">${esc(t.nom)}</p>
              <p class="tarifs-illimite-baseline">${esc(t.sousTitre || '')}</p>
              ${note}
            </div>
            <div class="tarifs-illimite-right">
              <p class="tarifs-illimite-price">CHF ${chf(t.prix)}</p>
              ${rate}
            </div>
          </div>`;
      }).join('');
    }

    // 2) ── Calculateur — régénère les onglets depuis les illimités ──
    //    Le script inline de tarifs.html écoute par délégation, donc les
    //    onglets régénérés restent cliquables.
    const tabsWrap = document.getElementById('calc-plan-tabs');
    if (tabsWrap && illimites.length) {
      const moisDe = (nom) => {
        const n = nom || '';
        const num = (/(\d+)/.exec(n) || [])[1];
        return /an/i.test(n) ? (num ? +num * 12 : 12) : (num ? +num : 1);
      };
      const labelDe = (nom) => (nom || '').replace(/illimit[ée]s?/ig, '').trim();
      const reco = illimites.some(t => t.recommande);
      tabsWrap.innerHTML = illimites.map((t, idx) => {
        const active = (t.recommande || (!reco && idx === 0)) ? ' active' : '';
        return `<button class="tarifs-calc-tab${active}" type="button" data-price="${t.prix}" data-months="${moisDe(t.nom)}">${esc(labelDe(t.nom))}<br><span>CHF ${chf(t.prix)}</span></button>`;
      }).join('');
    }

    // 3) ── Pack Découverte ─────────────────────────────────────
    if (decouverte) {
      const dPrice = document.querySelector('.tarifs-decouverte-price');
      const dSub   = document.querySelector('.tarifs-decouverte-price-sub');
      if (dPrice) dPrice.textContent = `CHF ${chf(decouverte.prix)}`;
      if (dSub && decouverte.sousTitre) dSub.textContent = decouverte.sousTitre;
    }

    // 4) ── Packs de cours — génération complète ────────────────
    const packsWrap = document.querySelector('.tarifs-row-v2')?.closest('.tarifs-block-rows');
    if (packsWrap && packs.length) {
      packsWrap.innerHTML = packs.map(p => `
        <div class="tarifs-row-v2">
          <div class="tarifs-row-v2-left">
            <p class="tarifs-row-v2-name">${esc(p.nom)}</p>
            <p class="tarifs-row-v2-sub">${esc(p.sousTitre || '')}</p>
          </div>
          <p class="tarifs-row-v2-price">CHF ${chf(p.prix)}</p>
        </div>`).join('');
    }

    // 5) ── Recalcul du calculateur avec les nouveaux prix ──────
    const calcEl = document.getElementById('tarifs-calculator');
    const coursUnique = packs.find(p => /unique/i.test(p.nom)) || packs[0];
    if (calcEl && coursUnique) calcEl.dataset.unitPrice = coursUnique.prix;
    if (window.amarteCalc && typeof window.amarteCalc.update === 'function') {
      window.amarteCalc.update();
    }
  }

  // ── PARAMÈTRES DU SITE (toutes les pages) ─────────────────────
  query(`*[_id == "siteSettings"][0]{
    adresse, telephone, telephone2, email, instagram, facebook, tagline,
    glofoxUrlReservation, glofoxUrlMembership, glofoxUrlLogin,
    horairesOuverture
  }`).then(renderSettings).catch(() => {/* garder le HTML statique */});

  function renderSettings(s) {
    if (!s) return;

    // ── Email — liens mailto + texte affiché ───────────────────
    if (s.email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
        a.href = `mailto:${s.email}`;
        if (/@/.test(a.textContent)) a.textContent = s.email;
      });
    }

    // ── Téléphone principal — sélection par href existant ──────
    if (s.telephone) {
      const telHref = s.telephone.replace(/[^\d+]/g, '');
      // Sélecteurs des hrefs actuels du HTML statique (fallback)
      document.querySelectorAll('a[href="tel:+41794621747"]').forEach(a => {
        a.href = `tel:${telHref}`;
        a.textContent = a.textContent.replace(/\+\d[\d\s]+/, s.telephone);
      });
      // Liens WhatsApp wa.me — on aligne aussi le numéro
      const waNum = telHref.replace('+', '');
      document.querySelectorAll('a[href*="wa.me/41794621747"]').forEach(a => {
        a.href = a.href.replace(/wa\.me\/\d+/, `wa.me/${waNum}`);
      });
    }

    // ── Téléphone secondaire ───────────────────────────────────
    if (s.telephone2) {
      const tel2Href = s.telephone2.replace(/[^\d+]/g, '');
      document.querySelectorAll('a[href="tel:+41788106464"]').forEach(a => {
        a.href = `tel:${tel2Href}`;
        a.textContent = a.textContent.replace(/\+\d[\d\s]+/, s.telephone2);
      });
    }

    // ── Réseaux sociaux ────────────────────────────────────────
    if (s.instagram) {
      document.querySelectorAll('a[href*="instagram.com"]').forEach(a => { a.href = s.instagram; });
    }
    if (s.facebook) {
      document.querySelectorAll('a[href*="facebook.com"]').forEach(a => { a.href = s.facebook; });
    }

    // ── Tagline du footer (toutes les pages) ───────────────────
    if (s.tagline) {
      document.querySelectorAll('.footer-tagline').forEach(el => {
        el.innerHTML = richText(s.tagline);
      });
    }

    // ── Adresse — page Contact ─────────────────────────────────
    if (s.adresse) {
      // Bloc « Adresse » (1er .contact-info-val de la page)
      const block = document.querySelector('.contact-info-block .contact-info-val');
      if (block) block.innerHTML = richText(s.adresse);
      // Encart sous la carte
      const mapAddr = document.querySelector('.contact-map-address');
      if (mapAddr) mapAddr.innerHTML = richText(s.adresse);
      // Footer (legacy)
      document.querySelectorAll('.footer-addr').forEach(el => { el.textContent = s.adresse; });
    }

    // ── Horaires d'accueil — page Contact ──────────────────────
    if (Array.isArray(s.horairesOuverture) && s.horairesOuverture.length) {
      const hoursWrap = document.querySelector('.contact-hours');
      if (hoursWrap) {
        hoursWrap.innerHTML = s.horairesOuverture.map(h => `
          <div class="contact-hour-row">
            <span class="contact-hour-day">${esc(h.jours || '')}</span>
            <span class="contact-hour-val">${esc(h.heures || '')}</span>
          </div>`).join('');
      }
    }

    // ── URLs Glofox — réservation / abonnements / login ────────
    if (s.glofoxUrlReservation) {
      const iframe = document.getElementById('glofox-calendar');
      if (iframe) iframe.src = s.glofoxUrlReservation;
    }
    if (s.glofoxUrlMembership) {
      document.querySelectorAll('a[href*="/memberships?header=memberships"]').forEach(a => {
        a.href = s.glofoxUrlMembership;
      });
    }
    if (s.glofoxUrlLogin) {
      document.querySelectorAll('a[href*="/memberships?login"]').forEach(a => {
        a.href = s.glofoxUrlLogin;
      });
    }
  }

  // ── HEROS DE PAGE (apropos / cours / tarifs / etc.) ───────────
  const heroPageId = PAGE_ID[page];
  if (heroPageId) {
    query(`*[_type == "pageHero" && page == $page][0]{
      label, titre, sousTitre
    }`, { page: heroPageId }).then((hero) => {
      if (!hero) return;
      renderHero(hero);
    }).catch(() => {/* fallback statique */});
  }

  function renderHero(h) {
    // Label : .page-hero-label OU .defi-hero-label
    if (h.label) {
      const labelEl =
        document.querySelector('.page-hero-label') ||
        document.querySelector('.defi-hero-label');
      if (labelEl) labelEl.innerHTML = richText(h.label);
    }
    // Titre : .page-hero-title OU .cours-hero-title OU .defi-hero-title
    if (h.titre) {
      const titleEl =
        document.querySelector('.page-hero-title') ||
        document.querySelector('.cours-hero-title') ||
        document.querySelector('.defi-hero-title');
      if (titleEl) titleEl.innerHTML = richText(h.titre);
    }
    // Sous-titre : .page-hero-sub OU .cours-hero-sub OU .defi-hero-sub
    if (h.sousTitre) {
      const subEl =
        document.querySelector('.page-hero-sub') ||
        document.querySelector('.cours-hero-sub') ||
        document.querySelector('.defi-hero-sub');
      if (subEl) subEl.innerHTML = richText(h.sousTitre);
    }
  }

  // ── INFO CARDS — Calendrier (3 cards numérotées) ──────────────
  if (page === 'calendrier.html') {
    query(`*[_type == "infoCard" && groupe == "cal-info" && actif == true]
           | order(ordre asc){ titre, texte }`)
      .then(renderCalInfo).catch(() => {/* fallback */});
  }
  function renderCalInfo(cards) {
    if (!cards || !cards.length) return;
    const wrap = document.querySelector('.cal-info-inner');
    if (!wrap) return;
    wrap.innerHTML = cards.map((c, i) => `
      <div class="cal-info-card">
        <p class="cal-info-icon">${String(i + 1).padStart(2, '0')}</p>
        <p class="cal-info-title">${esc(c.titre)}</p>
        <p class="cal-info-text">${esc(c.texte || '')}</p>
      </div>`).join('');
  }

  // ── INFO CARDS — Cours « Bon à savoir » (3 cards, SVGs préservés) ──
  if (page === 'cours.html') {
    query(`*[_type == "infoCard" && groupe == "cours-know" && actif == true]
           | order(ordre asc){ titre, texte }`)
      .then(renderCoursKnow).catch(() => {/* fallback */});
  }
  function renderCoursKnow(cards) {
    if (!cards || !cards.length) return;
    // On préserve les SVG (icônes) — on remplace seulement titre + texte
    const dom = document.querySelectorAll('.cours-know-card');
    cards.forEach((c, i) => {
      const card = dom[i];
      if (!card) return;
      const titleEl = card.querySelector('.cours-know-title');
      const textEl  = card.querySelector('.cours-know-text');
      if (titleEl) titleEl.textContent = c.titre || '';
      if (textEl)  textEl.textContent  = c.texte || '';
    });
  }

  // ── INFO CARDS — Contact « Accès & Transport » ────────────────
  if (page === 'contact.html') {
    query(`*[_type == "infoCard" && groupe == "contact-access" && actif == true]
           | order(ordre asc){ titre }`)
      .then(renderContactAccess).catch(() => {/* fallback */});
  }
  function renderContactAccess(items) {
    if (!items || !items.length) return;
    const wrap = document.querySelector('.contact-access');
    if (!wrap) return;
    wrap.innerHTML = items.map(it => `
      <div class="contact-access-item"><span class="contact-access-dash">—</span> ${esc(it.titre)}</div>
    `).join('');
  }

})();
