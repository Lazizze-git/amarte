/* ============================================================
   Amarte Studio — CMS Sanity.io
   Hydratation du contenu depuis l'API GROQ Sanity au runtime.
   Le site fonctionne sans ce fichier (contenu statique en repli).

   PÉRIMÈTRE — volontairement réduit à deux contenus :
     · les témoignages de la page d'accueil ;
     · les coordonnées (email, téléphone, réseaux) du pied de page.
   Les cours, le planning et les tarifs ne sont plus pilotés par le CMS :
   ils sont écrits en dur dans les pages, qui font désormais foi.
   Ne pas y rebrancher le CMS sans remettre les données à jour côté Sanity.

   SETUP :
   1. Projet sur https://sanity.io/manage
   2. Renseigner SANITY_PROJECT_ID
   3. Déployer le studio : cd sanity && npm install && npm run deploy
   ============================================================ */

(function () {
  'use strict';

  // ── CONFIG ────────────────────────────────────────────────────
  const SANITY_PROJECT_ID  = 'pvvt7no0';
  const SANITY_DATASET     = 'production';
  const SANITY_API_VERSION = '2024-01-01';
  // false = API directe (contenu toujours frais) → les modifications publiées
  // apparaissent immédiatement, sans attendre le cache du CDN.
  const SANITY_CDN         = false;

  // Ne rien faire si le project ID n'est pas configuré
  if (SANITY_PROJECT_ID === 'VOTRE_PROJECT_ID') return;

  const host = SANITY_CDN
    ? `https://${SANITY_PROJECT_ID}.apicdn.sanity.io`
    : `https://${SANITY_PROJECT_ID}.api.sanity.io`;

  // ── FETCH GROQ ────────────────────────────────────────────────
  async function query(groq) {
    const q   = encodeURIComponent(groq);
    const url = `${host}/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${q}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Sanity: ${res.status}`);
    return (await res.json()).result;
  }

  // Échappe le HTML pour éviter toute casse de la mise en page.
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // ── DÉTECTION DE PAGE ─────────────────────────────────────────
  const raw  = location.pathname.split('/').pop().replace(/^$/, 'index');
  const page = raw.endsWith('.html') ? raw : raw + '.html';

  // ── TÉMOIGNAGES (index.html) ──────────────────────────────────
  if (page === 'index.html') {
    query(`*[_type == "temoignage" && actif == true] | order(ordre asc) {
      texte, auteur, detail
    }`).then(renderTemoignages).catch(() => {/* garder les avis statiques */});
  }

  function renderTemoignages(temoignages) {
    if (!temoignages || temoignages.length === 0) return;

    const grid = document.querySelector('.tcards');
    if (!grid) return;

    // Palette d'avatars de la charte, alternée pour éviter la monotonie.
    const TONES = ['tav-a', 'tav-b', 'tav-c', 'tav-d'];
    const initial = (nom) => (String(nom || '?').trim()[0] || '?').toUpperCase();

    grid.innerHTML = temoignages.map((t, i) => `
      <div class="tcard">
        <p class="stars" aria-label="5 étoiles sur 5">★★★★★</p>
        <p class="tq">«&nbsp;${esc(t.texte)}&nbsp;»</p>
        <p class="twho">
          <span class="tav ${TONES[i % TONES.length]}" aria-hidden="true">${esc(initial(t.auteur))}</span>
          <span>
            <span class="tn">${esc(t.auteur)}</span><br>
            <span class="tc">${esc(t.detail || '')}</span>
          </span>
        </p>
      </div>`).join('');
  }

  // ── COORDONNÉES (toutes les pages : pied de page, contacts) ───
  query(`*[_id == "siteSettings"][0]{
    telephone, email, instagram, facebook
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
  }

})();
