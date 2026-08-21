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

  // Typographie française appliquée au texte venu du CMS : la
  // ponctuation double et les unités ne doivent pas se retrouver
  // seules en début de ligne. La personne qui saisit tape des
  // espaces ordinaires, le site rétablit les insécables.
  const UNITES = 'h|min|s|m|km|cm|kg|g|%|CHF|€|°C';
  function typo(t) {
    return String(t == null ? '' : t)
      .replace(/ ([?!:;»])/g, '\u00A0$1')
      .replace(/(«) /g, '$1\u00A0')
      .replace(new RegExp('(\\d) (' + UNITES + ')\\b', 'g'), '$1\u00A0$2');
  }

  // Échappe le HTML pour éviter toute casse de la mise en page.
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // ── DÉTECTION DE PAGE ─────────────────────────────────────────
  const raw  = location.pathname.split('/').pop().replace(/^$/, 'index');
  const page = raw.endsWith('.html') ? raw : raw + '.html';

  // ── TÉMOIGNAGES (accueil et Première fois) ────────────────────
  if (document.querySelector('.tcards')) {
    query(`*[_type == "temoignage" && actif == true] | order(ordre asc) {
      texte, auteur, detail
    }`).then(renderTemoignages).catch(() => {/* garder les avis statiques */});
  }

  function renderTemoignages(temoignages) {
    if (!temoignages || temoignages.length === 0) return;

    const grid = document.querySelector('.tcards');
    if (!grid) return;

    // La page Première fois n'en présente que quelques-uns : on garde
    // le nombre prévu par la mise en page plutôt que d'en déverser
    // douze dans une section conçue pour quatre.
    const place = grid.children.length;
    if (place > 0 && temoignages.length > place) temoignages = temoignages.slice(0, place);

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

  // ── EN-TÊTE DE PAGE ───────────────────────────────────────────
  // Le label, le titre et l'introduction du bandeau du haut. Sans
  // document pour la page, le texte du HTML reste : le CMS ne peut
  // pas vider un en-tête.
  const pageCourante = document.querySelector('[data-cms-hero-titre]');
  if (pageCourante) {
    const clePage = pageCourante.dataset.cmsHeroTitre;
    query(`*[_type == "pageHero" && page == "${clePage}" && actif != false][0]{
      label, titre, sousTitre
    }`).then(renderHero).catch(() => {/* garder le texte du HTML */});
  }

  // Convention de saisie, volontairement minimale pour rester
  // compréhensible sans formation : *mots* met en valeur, un retour
  // à la ligne coupe la ligne. Le texte est échappé d'abord, donc
  // rien de ce que le CMS contient ne peut injecter de balise.
  function enrichir(texte) {
    return esc(typo(texte))
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
      // Typographie française : la ponctuation double ne doit jamais
      // se retrouver seule en début de ligne. On rétablit l'espace
      // insécable même si la personne a tapé une espace ordinaire.
      .replace(/\n/g, '<br>');
  }

  // Le titre de la page « Première fois » colore son point final.
  // C'est le seul endroit du site où cette règle existe : on la
  // rétablit là, plutôt que d'ajouter une balise inerte partout.
  function pointFinal(html) {
    return html.replace(/\.(<\/em>)?$/, '<span class="dot">.</span>$1');
  }

  function renderHero(h) {
    if (!h) return;

    if (h.label) {
      const el = document.querySelector('[data-cms-hero-label]');
      // Même règle d'espace insécable que pour les titres, mais en
      // texte simple : le label ne contient pas de mise en forme.
      if (el) el.textContent = typo(h.label);
    }

    if (h.titre) {
      const el = document.querySelector('[data-cms-hero-titre]');
      if (el) {
        const html = enrichir(h.titre);
        el.innerHTML = el.classList.contains('defi-hero-title') ? pointFinal(html) : html;
      }
    }

    if (h.sousTitre) {
      const el = document.querySelector('[data-cms-hero-sous]');
      if (el) {
        // Certaines pages présentent l'introduction en plusieurs
        // paragraphes, d'autres en une seule phrase : on suit le
        // balisage déjà en place plutôt que de l'imposer.
        const blocs = String(h.sousTitre).split(/\n\s*\n/).filter((b) => b.trim());
        el.innerHTML = el.tagName === 'P'
          ? enrichir(blocs.join('\n'))
          : blocs.map((b) => `<p>${enrichir(b.trim())}</p>`).join(' ');
      }
    }
  }

  // ── REPÈRES (calendrier, cours, contact) ──────────────────────
  // Les cartes gardent leur icône et leur numéro, dessinés à la main
  // dans le HTML : on ne remplace que les textes. Ajouter un repère
  // duplique la dernière carte, qui sert de gabarit.
  const zoneInfos = document.querySelector('[data-cms-infos]');
  if (zoneInfos) {
    const serie = zoneInfos.dataset.cmsInfos;
    query(`*[_type == "infoCard" && groupe == "${serie}" && actif != false] | order(ordre asc){
      titre, texte
    }`).then((l) => renderInfos(zoneInfos, l)).catch(() => {/* garder le HTML */});
  }

  function renderInfos(zone, liste) {
    if (!liste || liste.length === 0) return;

    const cartes = Array.from(zone.children);
    if (cartes.length === 0) return;
    const gabarit = cartes[cartes.length - 1];

    liste.forEach((info, i) => {
      let carte = cartes[i];
      if (!carte) {
        // Le gabarit porte l'icône et la structure : on le duplique
        // plutôt que de reconstruire un balisage qu'on ne connaît pas.
        carte = gabarit.cloneNode(true);
        zone.appendChild(carte);
      }
      carte.hidden = false;

      // La série Contact tient sur une seule ligne, sans titre séparé.
      const titre = carte.querySelector('h3') || carte;
      const texte = carte.querySelector('p:last-of-type');

      if (titre === carte) {
        // On préserve le tiret décoratif placé avant le texte.
        const tiret = carte.querySelector('span');
        carte.textContent = '';
        if (tiret) { carte.appendChild(tiret); carte.appendChild(document.createTextNode(' ')); }
        carte.appendChild(document.createTextNode(typo(info.titre)));
      } else {
        titre.textContent = typo(info.titre);
        if (texte && info.texte) texte.textContent = typo(info.texte);
      }

      // Les numéros 01, 02, 03 doivent suivre l'ordre, pas rester
      // figés sur ceux du gabarit dupliqué.
      const num = carte.querySelector('.cal-info-num');
      if (num) num.textContent = String(i + 1).padStart(2, '0');
    });

    // Moins de repères qu'à l'origine : on masque les cartes en trop
    // plutôt que de les retirer, pour pouvoir les réafficher.
    cartes.slice(liste.length).forEach((c) => { c.hidden = true; });

    if (typeof window.amarteRevele === 'function') window.amarteRevele(zone);
  }

  // ── TARIFS (page tarifs.html) ─────────────────────────────────
  // Trois sections : abonnements, cartes de cours, cours privés.
  // Sans fiche pour un groupe, la section garde ce que contient le
  // HTML — une erreur de saisie ne peut pas vider la grille.
  if (document.querySelector('[data-cms-tarifs]')) {
    query(`*[_type == "tarif" && actif != false] | order(ordre asc){
      groupe, nom, sousTitre, prix, parCours, mois, recommande,
      lien, texteBouton, cta
    }`).then(renderTarifs).catch(() => {/* garder les tarifs du HTML */});
  }

  // « 1 490 » doit rester insécable : un prix coupé en fin de ligne
  // se lit mal.
  const prixAffiche = (p) => esc(String(p || '').replace(/\s/g, '\u00A0'));

  function renderTarifs(liste) {
    if (!liste || liste.length === 0) return;

    const par = { abonnement: [], pack: [], prive: [] };
    liste.forEach((t) => { if (par[t.groupe]) par[t.groupe].push(t); });

    // ── Abonnements
    const abos = document.querySelector('[data-cms-tarifs="abonnement"]');
    if (abos && par.abonnement.length) {
      abos.innerHTML = par.abonnement.map((t) => `
        <article class="tarifs-plan${t.recommande ? ' tarifs-plan--reco' : ''}">
          ${t.recommande ? '<span class="offre-pill">Recommandé</span>' : ''}
          <h3 class="tarifs-plan-name">${esc(t.nom)}</h3>
          ${t.sousTitre ? `<p class="tarifs-plan-baseline">${esc(t.sousTitre)}</p>` : ''}
          <p class="tarifs-plan-price"><span class="tarifs-plan-cur">CHF</span><span class="tarifs-plan-amount">${prixAffiche(t.prix)}</span></p>
          ${t.parCours ? `<p class="tarifs-plan-rate">${esc(t.parCours)}</p>` : ''}
          ${t.lien ? `<a class="btn ${t.recommande ? 'btn--primary' : 'btn--secondary'} btn--block" href="${esc(t.lien)}" data-cta="${esc(t.cta || '')}">${esc(t.texteBouton || 'Choisir')}</a>` : ''}
        </article>`).join('');
      synchroniserSimulateur(par.abonnement);
    }

    // ── Cartes de cours
    const packs = document.querySelector('[data-cms-tarifs="pack"]');
    if (packs && par.pack.length) {
      packs.innerHTML = par.pack.map((t) => `
        <li class="tarifs-pack">
          <div>
            <h3 class="tarifs-pack-name">${esc(t.nom)}</h3>
            ${t.sousTitre ? `<p class="tarifs-pack-sub">${esc(t.sousTitre)}</p>` : ''}
          </div>
          <div class="tarifs-pack-figures">
            <p class="tarifs-pack-price">CHF ${prixAffiche(t.prix)}</p>
            ${t.parCours ? `<p class="tarifs-pack-rate">${esc(t.parCours)}</p>` : ''}
          </div>
          ${t.lien ? `<a class="btn btn--secondary" href="${esc(t.lien)}" data-cta="${esc(t.cta || '')}" aria-label="${esc(t.texteBouton || 'Acheter')} — ${esc(t.nom)} — CHF ${esc(t.prix)}">${esc(t.texteBouton || 'Acheter')}</a>` : ''}
        </li>`).join('');
    }

    // ── Cours privés
    const prives = document.querySelector('[data-cms-tarifs="prive"]');
    if (prives && par.prive.length) {
      prives.innerHTML = par.prive.map((t) => `
        <div class="tarifs-private-item">
          <span class="tarifs-private-item-name">${esc(t.nom)}</span>
          <span class="tarifs-private-item-price">${esc(t.prix)}</span>
        </div>`).join('');
    }

    if (typeof window.amarteRevele === 'function') window.amarteRevele(document);
  }

  // Le simulateur de la page porte ses propres montants. Sans cette
  // reprise, modifier un abonnement afficherait deux prix différents
  // sur la même page.
  function synchroniserSimulateur(abonnements) {
    const onglets = document.querySelectorAll('#sim-plan-tabs .tarifs-calc-tab');
    if (onglets.length === 0) return;

    onglets.forEach((onglet, i) => {
      const t = abonnements[i];
      if (!t) { onglet.hidden = true; return; }
      const montant = String(t.prix || '').replace(/\s/g, '');
      if (!/^\d+$/.test(montant)) { onglet.hidden = true; return; }
      onglet.hidden = false;
      onglet.dataset.price = montant;
      if (t.mois) onglet.dataset.months = String(t.mois);
      const duree = t.mois === 12 ? '1 an' : `${t.mois} mois`;
      onglet.innerHTML = `${esc(duree)}<br><span>CHF ${prixAffiche(t.prix)}</span>`;
    });

    // Le prix du cours à l'unité sert au calcul de l'économie.
    const unique = abonnements.length && document.getElementById('tarifs-simulateur');
    if (unique) {
      const carte = Array.from(document.querySelectorAll('[data-cms-tarifs="pack"] .tarifs-pack'))[0];
      const p = carte && carte.querySelector('.tarifs-pack-price');
      const v = p && p.textContent.replace(/[^\d]/g, '');
      if (v) document.getElementById('tarifs-simulateur').dataset.unitPrice = v;
    }

    // Le simulateur recalcule sur changement d'onglet : on lui en
    // signale un pour qu'il reparte des nouveaux montants.
    const actif = document.querySelector('#sim-plan-tabs .tarifs-calc-tab[aria-pressed="true"]:not([hidden])')
               || document.querySelector('#sim-plan-tabs .tarifs-calc-tab:not([hidden])');
    if (actif) actif.click();
  }

  // ── COURS (page cours.html) ───────────────────────────────────
  // La grille est réécrite depuis Sanity. Tant que la réponse n'est
  // pas là — ou si elle échoue — les cours écrits dans le HTML
  // restent affichés : la page ne peut pas se vider.
  // La page Cours affiche tout ; l'accueil une sélection. Une seule
  // requête sert les deux, chaque page ne rendant que ce qui la concerne.
  if (document.getElementById('cours-grid') || document.querySelector('.disc2-grid')) {
    query(`*[_type == "cours" && actif != false] | order(ordre asc){
      titre, categorie, horaire, instructeur, description, niveau, tag,
      accueil, ordreAccueil, cle, imageFichier, imageAlt, "ref": image.asset._ref
    }`).then((liste) => {
      renderCours(liste);
      renderDisciplines(liste);
      renderSemaine(liste);
    }).catch(() => {/* garder les cours du HTML */});
  }

  const NIVEAUX = { '1': 'Doux', '2': 'Moyen', '3': 'Dynamique' };

  // Dimensions des photos livrées avec le site. Elles servent à réserver
  // la bonne hauteur avant chargement : sans elles, la page sursaute.
  const TAILLES = {
    'about': [1500, 830],
    'cours-collectif-1': [1500, 1011],
    'cours-collectif-2': [1500, 1240],
    'cta-banner': [1500, 1008],
    'hero': [1537, 1023],
    'salle-ensemble': [1500, 826],
    'salle-tapis': [1100, 806],
  };

  // Attributs width/height de la photo, qu'elle vienne du CMS ou du site.
  function attributsTaille(ref, fichier) {
    const d = ref ? dimensions(ref) : null;
    if (d) return ` width="${d.l}" height="${d.h}"`;
    const t = TAILLES[fichier];
    return t ? ` width="${t[0]}" height="${t[1]}"` : '';
  }
  const CATEGORIES = { yoga: 'Yoga', pilates: 'Pilates', autres: 'Autres' };

  // Identifiant utilisable dans un attribut : sert au suivi des clics.
  const ident = (s) => String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  function renderCours(liste) {
    if (!liste || liste.length === 0) return;

    // Le même balisage sert la page Cours et la liste défilante de la
    // page Première fois : une seule fiche alimente les deux.
    const cibles = [
      document.getElementById('cours-grid'),
      document.querySelector('[data-cms-cours-rail]'),
    ].filter(Boolean);
    if (cibles.length === 0) return;

    const html = liste.map((c) => {
      // Photo : celle déposée dans le CMS, sinon celle d'origine du site.
      const fichier = c.imageFichier || 'cours-collectif-1';
      const src = c.ref
        ? esc(urlImage(c.ref, 1500))
        : `public/images/${esc(fichier)}.jpg`;
      const secours = c.ref
        ? ''
        : `<source srcset="public/images/${esc(fichier)}.webp" type="image/webp" />`;

      const niveau = String(c.niveau || '2');
      const slug = esc(c.cle || 'cours-' + ident(c.titre));

      return `
      <article class="cours-item cours-item--photo gs-reveal" data-cat="${esc(c.categorie)}">
        <div class="cours-card-media gs-img-reveal">
          <picture data-cms-img="${slug}">
            ${secours}
            <img src="${src}"${attributsTaille(c.ref, fichier)} alt="${esc(c.imageAlt || '')}" loading="lazy" decoding="async" class="gs-img-inner" />
          </picture>
        </div>
        <div class="cours-card-body">
          <div class="cours-item-head">
            <span class="cours-item-cat ${esc(c.categorie)}">${esc(CATEGORIES[c.categorie] || c.categorie)}</span>
            <span class="cours-item-schedule">${esc(c.horaire)}</span>
          </div>
          <h3 class="cours-item-title">${esc(c.titre)}</h3>
          ${c.instructeur ? `<p class="cours-item-sub">Avec ${esc(c.instructeur)}</p>` : ''}
          ${c.description ? `<p class="cours-item-desc">${esc(c.description)}</p>` : ''}
          <div class="cours-item-footer">
            <span class="cours-level" data-level="${esc(niveau)}">${esc(NIVEAUX[niveau] || 'Moyen')}</span>
            ${c.tag ? `<span class="cours-item-tag">${esc(c.tag)}</span>` : ''}
          </div>
          <a href="calendrier.html" class="btn btn--secondary cours-card-btn"
             data-cta="cours-reserver-${esc(ident(c.titre))}"
             aria-label="Réserver un cours ${esc(c.titre)}">Réserver <span aria-hidden="true">→</span></a>
        </div>
      </article>`;
    }).join('');

    cibles.forEach((cible) => {
      cible.innerHTML = html;
      // Les cartes viennent d'être créées : sans cet appel elles restent
      // à opacité zéro, l'animation d'apparition ne les connaissant pas.
      if (typeof window.amarteRevele === 'function') window.amarteRevele(cible);
    });

    // Le compteur et la synchronisation d'URL de la page écoutent ceci.
    document.dispatchEvent(new CustomEvent('cours:rendus'));
  }

  // ── PLANNING DE LA SEMAINE (page Première fois) ───────────────
  // Une grille de sept jours sur deux rangées, matin et soir, remplie
  // à partir des mêmes fiches de cours. Un horaire modifié dans le CMS
  // déplace le cours dans le planning sans autre intervention.
  const JOURS_SEMAINE = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

  function renderSemaine(liste) {
    const grille = document.querySelector('[data-cms-semaine]');
    if (!grille || !liste || liste.length === 0) return;

    // Le premier bloc porte les intitulés de rangées : on le conserve.
    const intitules = grille.querySelector('.pf-week-labels');
    if (!intitules) return;

    const parJour = {};
    JOURS_SEMAINE.forEach((j) => { parJour[j] = { matin: null, soir: null }; });

    liste.forEach((c) => {
      const parts = String(c.horaire || '').split('·');
      if (parts.length < 2) return;
      const jour = parts[0].trim();
      const heure = parts.slice(1).join('·').trim();
      if (!parJour[jour]) return;
      // Avant midi au matin, le reste au soir — c'est le découpage
      // qu'utilise déjà la page.
      const h = parseInt(heure, 10);
      const rangee = (isNaN(h) || h < 12) ? 'matin' : 'soir';
      if (!parJour[jour][rangee]) parJour[jour][rangee] = { heure, cours: c };
    });

    const creneau = (x) => {
      if (!x) return '<div class="pf-week-slot pf-week-slot--empty">—</div>';
      const c = x.cours;
      const niveau = String(c.niveau || '2');
      return `<div class="pf-week-slot">
        <p class="pf-slot-time">${esc(typo(x.heure))}</p>
        <p class="pf-slot-name">${esc(c.titre)}</p>
        <p class="pf-slot-teacher">${esc(c.instructeur || '')}</p>
        <span class="disc2-intensity" data-level="${esc(niveau)}" role="img" aria-label="Intensité ${esc(INTENSITES[niveau] || 'moyenne')}"><i aria-hidden="true"></i><i aria-hidden="true"></i><i aria-hidden="true"></i><span class="pf-level-text" aria-hidden="true">${esc(NIVEAUX[niveau] || 'Moyen')}</span></span>
      </div>`;
    };

    const colonnes = JOURS_SEMAINE.map((jour) => {
      const j = parJour[jour];
      // Une journée sans aucun cours est grisée, comme aujourd'hui.
      const vide = !j.matin && !j.soir ? ' pf-week-col--off' : '';
      return `<div class="pf-week-col${vide}">
        <p class="pf-week-dayname">${esc(jour)}</p>
        ${creneau(j.matin)}
        ${creneau(j.soir)}
      </div>`;
    }).join('');

    grille.innerHTML = intitules.outerHTML + colonnes;
    if (typeof window.amarteRevele === 'function') window.amarteRevele(grille);
  }

  // Horaire abrégé pour les cartes de l'accueil, plus étroites :
  // « Mardi · 18h30 » devient « mar. 18h30 ».
  const JOURS_COURTS = {
    lundi: 'lun.', mardi: 'mar.', mercredi: 'mer.', jeudi: 'jeu.',
    vendredi: 'ven.', samedi: 'sam.', dimanche: 'dim.',
  };
  function horaireCourt(horaire) {
    const parts = String(horaire || '').split('·');
    if (parts.length < 2) return String(horaire || '');
    const jour = parts[0].trim().toLowerCase();
    return (JOURS_COURTS[jour] || parts[0].trim()) + ' ' + parts.slice(1).join('·').trim();
  }

  const INTENSITES = { '1': 'douce', '2': 'moyenne', '3': 'dynamique' };

  function renderDisciplines(liste) {
    const grille = document.querySelector('.disc2-grid');
    if (!grille || !liste) return;

    // L'accueil a son propre ordre : les quatre cartes n'y apparaissent
    // pas forcément dans l'ordre du planning.
    const selection = liste
      .filter((c) => c.accueil)
      .sort((a, b) => (a.ordreAccueil ?? 99) - (b.ordreAccueil ?? 99));
    // Aucune mise en avant cochée : on garde les cartes du HTML plutôt
    // que d'afficher une section vide.
    if (selection.length === 0) return;

    grille.innerHTML = selection.map((c) => {
      const fichier = c.imageFichier || 'cours-collectif-1';
      const src = c.ref
        ? esc(urlImage(c.ref, 1500))
        : `public/images/${esc(fichier)}.jpg`;
      const secours = c.ref
        ? ''
        : `<source srcset="public/images/${esc(fichier)}.webp" type="image/webp" />`;

      const niveau = String(c.niveau || '2');
      const prof = c.instructeur ? esc(c.instructeur) + ' · ' : '';
      const initiale = c.instructeur ? esc(c.instructeur.trim().charAt(0).toUpperCase()) : '·';

      return `
      <article class="disc2-card gs-reveal">
        <div class="disc2-media gs-img-reveal">
          <picture data-cms-img="${esc(c.cle || '')}">
            ${secours}
            <img src="${src}"${attributsTaille(c.ref, fichier)} alt="${esc(c.imageAlt || 'Cours de ' + c.titre + ' en cours chez Amarte')}"
                 loading="lazy" decoding="async" class="gs-img-inner" />
          </picture>
        </div>
        <div class="disc2-body">
          <h3 class="disc2-name">${esc(c.titre)}</h3>
          ${c.description ? `<p class="disc2-desc">${esc(c.description)}</p>` : ''}
          <div class="disc2-foot">
            <span class="disc2-teacher"><span class="disc2-avatar" aria-hidden="true">${initiale}</span>${prof}${esc(horaireCourt(c.horaire))}</span>
            <span class="disc2-intensity" data-level="${esc(niveau)}" role="img" aria-label="Intensité ${esc(INTENSITES[niveau] || 'moyenne')}"><i aria-hidden="true"></i><i aria-hidden="true"></i><i aria-hidden="true"></i> ${esc(NIVEAUX[niveau] || 'Moyen')}</span>
          </div>
        </div>
      </article>`;
    }).join('');

    if (typeof window.amarteRevele === 'function') window.amarteRevele(grille);
  }

  // ── PHOTOS DU SITE (toutes les pages) ─────────────────────────
  // Chaque <picture data-cms-img="cle"> peut être remplacé depuis le
  // Studio. Sans document pour la clé, la photo d'origine reste :
  // le CMS ne peut pas vider une image par inadvertance.
  // Deux types alimentent le même mécanisme : les photos générales du
  // site (mediaBloc) et la photo portée par chaque fiche de cours.
  // Les deux exposent une `cle`, le remplacement ne connaît qu'un cas.
  // C'est ce qui met à jour les cartes de cours de la page d'accueil.
  if (document.querySelector('[data-cms-img]')) {
    query(`*[_type in ["mediaBloc", "cours"] && actif != false && defined(image)]{
      cle, "alt": select(_type == "cours" => imageAlt, alt),
      "ref": image.asset._ref
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
