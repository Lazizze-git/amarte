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

  // ── PHOTOS DU SITE (toutes les pages) ─────────────────────────
  // Chaque <picture data-cms-img="cle"> peut être remplacé depuis le
  // Studio. Sans document pour la clé, la photo d'origine reste :
  // le CMS ne peut pas vider une image par inadvertance.
  // Deux types alimentent le même mécanisme : les photos générales du
  // site (mediaBloc) et celles propres à chaque cours (coursPhoto).
  // `cle` est unifiée pour que le remplacement ne connaisse qu'un cas.
  if (document.querySelector('[data-cms-img]')) {
    query(`*[_type in ["mediaBloc", "coursPhoto"] && actif != false]{
      "cle": select(_type == "coursPhoto" => cours, cle),
      alt, "ref": image.asset._ref
    }`).then(renderMedias).catch(() => {/* garder les photos du site */});
  }

  // Transforme une référence Sanity (image-<id>-<largeur>x<hauteur>-<ext>)
  // en URL de son CDN. `auto=format` sert du WebP aux navigateurs qui le
  // acceptent, ce qui remplace les <source type="image/webp"> du HTML.
  function urlImage(ref, largeur) {
    const p = String(ref || '').split('-');
    if (p.length < 4 || p[0] !== 'image') return null;
    const ext = p[p.length - 1];
    const dim = p[p.length - 2];
    const id  = p.slice(1, -2).join('-');
    return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/`
         + `${id}-${dim}.${ext}?w=${largeur}&q=75&auto=format&fit=max`;
  }

  // La référence Sanity porte les dimensions du fichier d'origine.
  function dimensions(ref) {
    const m = /-(\d+)x(\d+)-[a-z]+$/.exec(String(ref || ''));
    return m ? { l: parseInt(m[1], 10), h: parseInt(m[2], 10) } : null;
  }

  function renderMedias(medias) {
    if (!medias || medias.length === 0) return;

    // Une clé peut apparaître plusieurs fois dans le site : on indexe
    // une seule fois, puis on applique à tous les emplacements.
    const parCle = {};
    medias.forEach((m) => { if (m.cle && m.ref) parCle[m.cle] = m; });

    document.querySelectorAll('[data-cms-img]').forEach((picture) => {
      const media = parCle[picture.dataset.cmsImg];
      if (!media) return;

      const img = picture.querySelector('img');
      if (!img) return;

      const url = urlImage(media.ref, 1600);
      if (!url) return;

      // Les <source> pointent vers les fichiers d'origine : les retirer,
      // sinon le navigateur les préfère et la nouvelle photo ne s'affiche pas.
      picture.querySelectorAll('source').forEach((s) => s.remove());

      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.src = url;
      img.srcset = url + ' 1x, ' + urlImage(media.ref, 2400) + ' 2x';
      if (media.alt) img.alt = media.alt;

      // Reprendre les dimensions réelles de la nouvelle photo : sans
      // elles le navigateur ne peut plus réserver la bonne hauteur et
      // la page sursaute au chargement.
      const dim = dimensions(media.ref);
      if (dim) { img.width = dim.l; img.height = dim.h; }
    });
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
    // Téléphone — VOLONTAIREMENT NON PILOTÉ PAR LE CMS.
    // Le numéro officiel est +41 78 810 64 64 (document client du 28.07.2026).
    // Sanity contient encore l'ancien numéro et l'imposait ici par-dessus le
    // HTML, sur les 9 pages. Le numéro reste donc écrit en dur dans les pages.
    // Pour rebrancher : mettre `telephone` à jour dans siteSettings (Sanity),
    // vérifier la valeur, puis restaurer le bloc — et penser aux liens wa.me,
    // que ce code ne couvrait de toute façon pas.
    // Réseaux sociaux
    if (s.instagram) {
      document.querySelectorAll('a[href*="instagram.com"]').forEach(a => { a.href = s.instagram; });
    }
    if (s.facebook) {
      document.querySelectorAll('a[href*="facebook.com"]').forEach(a => { a.href = s.facebook; });
    }
  }

})();
