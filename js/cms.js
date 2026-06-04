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
  const SANITY_CDN         = true;

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

    // La section témoignages est une grille masonry (.testi-masonry).
    // On remplace les cartes statiques par le contenu du CMS.
    const grid = document.querySelector('.testi-masonry');
    if (!grid) return;

    grid.innerHTML = temoignages.map(t => `
        <article class="testi-card">
          <div class="testi-card-stars" role="img" aria-label="Note 5 sur 5">★★★★★</div>
          <blockquote class="testi-card-quote">« ${esc(t.texte)} »</blockquote>
          <footer class="testi-card-footer">
            <p class="testi-card-name">${esc(t.auteur)}</p>
            ${t.detail ? `<p class="testi-card-detail">${esc(t.detail)}</p>` : ''}
          </footer>
        </article>`).join('');
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

    // 1) ── Cartes "Abonnements illimités" ──────────────────────
    const cards = document.querySelectorAll('.tarifs-illimite-card');
    illimites.forEach((tarif, i) => {
      const card = cards[i];
      if (!card) return;
      const set = (sel, val) => { const el = card.querySelector(sel); if (el) el.textContent = val; };
      set('.tarifs-illimite-name', tarif.nom);
      set('.tarifs-illimite-baseline', tarif.sousTitre || '');
      set('.tarifs-illimite-price', `CHF ${chf(tarif.prix)}`);
      if (tarif.prixParCours) set('.tarifs-illimite-rate', `CHF ${chf(tarif.prixParCours)} / mois`);
      const badge = card.querySelector('.tarifs-illimite-badge');
      if (badge) badge.style.display = tarif.recommande ? '' : 'none';
    });

    // 2) ── Calculateur de rentabilité (tabs synchronisés) ──────
    const tabs = document.querySelectorAll('#calc-plan-tabs .tarifs-calc-tab');
    illimites.forEach((tarif, i) => {
      const tab = tabs[i];
      if (!tab) return;
      tab.dataset.price = tarif.prix;
      const span = tab.querySelector('span');
      if (span) span.textContent = `CHF ${chf(tarif.prix)}`;
    });
    // Prix de référence "cours unique" pour le calcul d'économie
    const calcEl = document.getElementById('tarifs-calculator');
    const coursUnique = packs.find(p => /unique/i.test(p.nom)) || packs[0];
    if (calcEl && coursUnique) calcEl.dataset.unitPrice = coursUnique.prix;
    // Recalcule l'affichage avec les nouveaux prix
    if (window.amarteCalc && typeof window.amarteCalc.update === 'function') {
      window.amarteCalc.update();
    }

    // 3) ── Pack Découverte ─────────────────────────────────────
    if (decouverte) {
      const dPrice = document.querySelector('.tarifs-decouverte-price');
      const dSub   = document.querySelector('.tarifs-decouverte-price-sub');
      if (dPrice) dPrice.textContent = `CHF ${chf(decouverte.prix)}`;
      if (dSub && decouverte.sousTitre) dSub.textContent = decouverte.sousTitre;
    }

    // 4) ── Packs de cours ──────────────────────────────────────
    const rows = document.querySelectorAll('.tarifs-row-v2');
    packs.forEach((pack, i) => {
      const row = rows[i];
      if (!row) return;
      const nom   = row.querySelector('.tarifs-row-v2-name');
      const sub   = row.querySelector('.tarifs-row-v2-sub');
      const price = row.querySelector('.tarifs-row-v2-price');
      if (nom)   nom.textContent   = pack.nom;
      if (sub)   sub.textContent   = pack.sousTitre || '';
      if (price) price.textContent = `CHF ${chf(pack.prix)}`;
    });
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
