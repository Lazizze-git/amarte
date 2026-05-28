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
  const SANITY_PROJECT_ID  = 'VOTRE_PROJECT_ID';  // ← à remplacer
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

    // Remplace le tableau hardcodé dans main.js
    // main.js lit window.amarteTemoignages s'il existe
    window.amarteTemoignages = temoignages.map(t => ({
      text:   t.texte,
      author: t.auteur,
      detail: t.detail || '',
    }));

    // Si le carousel est déjà initialisé, mettre à jour silencieusement
    const quoteEl = document.getElementById('testi-quote');
    if (quoteEl && window.amarteTemoignagesLoaded) {
      // Re-déclenche le premier témoignage avec les données CMS
      const first = window.amarteTemoignages[0];
      if (first) {
        quoteEl.textContent = `"${first.text}"`;
        const authorEl = document.getElementById('testi-author');
        const detailEl = document.getElementById('testi-detail');
        if (authorEl) authorEl.textContent = first.author;
        if (detailEl) detailEl.innerHTML   = first.detail;
      }
    }
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

    const BRANCH = '66cca39faa7ce5d29003a6e3';
    const DEFAULT_URL = `https://app.glofox.com/portal/#/branch/${BRANCH}/memberships?header=memberships`;

    // Mettre à jour les cartes illimitées existantes
    const illimites = tarifs.filter(t => t.type === 'illimite');
    const cards = document.querySelectorAll('.tarifs-illimite-card');

    illimites.forEach((tarif, i) => {
      const card = cards[i];
      if (!card) return;

      const nomEl   = card.querySelector('.tarifs-illimite-name');
      const baseEl  = card.querySelector('.tarifs-illimite-baseline');
      const prixEl  = card.querySelector('.tarifs-illimite-price');
      const rateEl  = card.querySelector('.tarifs-illimite-rate');
      const badgeEl = card.querySelector('.tarifs-illimite-badge');
      const cta     = card.querySelector('a[data-cta]');

      if (nomEl)  nomEl.textContent  = tarif.nom;
      if (baseEl) baseEl.textContent = tarif.sousTitre || '';
      if (prixEl) prixEl.textContent = `CHF ${tarif.prix}`;
      if (rateEl && tarif.prixParCours) rateEl.textContent = `≈ CHF ${tarif.prixParCours}/cours`;
      if (badgeEl) badgeEl.style.display = tarif.recommande ? '' : 'none';
      if (cta) cta.href = tarif.glofoxUrl || DEFAULT_URL;

      // Badge "Aucun renouvellement automatique"
      const noteEl = card.querySelector('.tarifs-illimite-note');
      if (noteEl && tarif.aucunRenouvellement) {
        noteEl.textContent = 'Aucun renouvellement automatique';
      }
    });
  }

})();
