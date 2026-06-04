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

  // ── IMAGE URL ─────────────────────────────────────────────────
  function imageUrl(ref, w = 800) {
    if (!ref) return null;
    const [, id, dim, fmt] = ref.split('-');
    return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dim}.${fmt}?w=${w}&auto=format&fit=crop`;
  }

  // ── HELPERS ───────────────────────────────────────────────────
  // Échappe le HTML pour éviter toute casse de la mise en page.
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Format suisse des montants : 1490 → "1'490"
  const chf = (n) => Number(n).toLocaleString('de-CH');

  // Libellés de catégorie
  const CAT = { yoga: 'Yoga', pilates: 'Pilates', bienetre: 'Bien-être' };

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

    // Le carrousel est piloté par main.js (window.amarteInitTesti).
    // On le ré-initialise avec les données Sanity (textContent = sûr).
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

  // ── PARAMÈTRES DU SITE (toutes les pages : footer, contacts) ──
  query(`*[_id == "siteSettings"][0]{
    adresse, telephone, email, instagram, facebook
  }`).then(renderSettings).catch(() => {/* garder le HTML statique */});

  function renderSettings(s) {
    if (!s) return;

    // Email — liens mailto + texte affiché
    if (s.email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
        a.href = `mailto:${s.email}`;
        if (/@/.test(a.textContent)) a.textContent = s.email;
      });
    }
    // Téléphone — liens tel + texte affiché
    if (s.telephone) {
      const telHref = s.telephone.replace(/[^\d+]/g, '');
      document.querySelectorAll('a[href^="tel:"]').forEach(a => {
        a.href = `tel:${telHref}`;
        if (/[\d]/.test(a.textContent)) a.textContent = s.telephone;
      });
    }
    // Réseaux sociaux
    if (s.instagram) {
      document.querySelectorAll('a[href*="instagram.com"]').forEach(a => { a.href = s.instagram; });
    }
    if (s.facebook) {
      document.querySelectorAll('a[href*="facebook.com"]').forEach(a => { a.href = s.facebook; });
    }
    // Adresse (pied de page)
    if (s.adresse) {
      document.querySelectorAll('.footer-addr').forEach(el => { el.textContent = s.adresse; });
    }
  }

})();
