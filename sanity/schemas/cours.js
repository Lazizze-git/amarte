// ── COURS — une fiche par cours de la page Cours ──────────────
// Ces fiches pilotent réellement la page : titre, horaire,
// intervenant·e, description, niveau, tag et photo. Les quatre
// cours mis en avant sur l'accueil reprennent la même photo.
//
// Si Sanity est injoignable, la page garde les cours écrits dans
// le HTML : le site ne peut pas se retrouver sans contenu.
export const cours = {
  name:  'cours',
  title: 'Cours',
  type:  'document',

  fields: [
    {
      name: 'titre', title: 'Nom du cours', type: 'string',
      description: 'Ex : Hatha Flow, Pilates Tonus.',
      validation: R => R.required().max(60),
    },
    {
      name: 'categorie', title: 'Catégorie', type: 'string',
      description: 'Détermine la pastille de couleur et le filtre de la page.',
      options: {
        list: [
          { title: 'Yoga',    value: 'yoga' },
          { title: 'Pilates', value: 'pilates' },
          { title: 'Autres',  value: 'autres' },
        ],
        layout: 'radio',
      },
      validation: R => R.required(),
    },
    {
      name: 'horaire', title: 'Jour et heure', type: 'string',
      description: 'Affiché tel quel. Format : Lundi · 9h30',
      validation: R => R.required().max(40),
    },
    {
      name: 'instructeur', title: 'Intervenant·e', type: 'string',
      description: 'Le prénom seul. Le site affiche « Avec Laurence ».',
      validation: R => R.max(40),
    },
    {
      name: 'description', title: 'Description', type: 'text', rows: 3,
      description: 'Deux phrases maximum, c\'est ce qui donne envie de venir.',
      validation: R => R.max(400),
    },
    {
      name: 'niveau', title: 'Intensité', type: 'string',
      description: 'Affichée en bas de la carte.',
      options: {
        list: [
          { title: 'Doux',      value: '1' },
          { title: 'Moyen',     value: '2' },
          { title: 'Dynamique', value: '3' },
        ],
        layout: 'radio',
      },
      initialValue: '2',
      validation: R => R.required(),
    },
    {
      name: 'tag', title: 'Mention', type: 'string',
      description: 'Petite mention à côté de l\'intensité. Ex : tout niveau.',
      initialValue: 'tout niveau',
      validation: R => R.max(30),
    },
    {
      name: 'image', title: 'Photo du cours', type: 'image',
      description: 'Format paysage, au moins 1200 px de large. ' +
                   'Sans photo, celle d\'origine du site reste affichée.',
      options: { hotspot: true },
    },
    {
      name: 'imageAlt', title: 'Description de la photo', type: 'string',
      description: 'Lue par les lecteurs d\'écran. Ex : « Cours de Hatha Flow chez Amarte ».',
      validation: R => R.max(160),
    },
    {
      name: 'ordre', title: 'Ordre d\'affichage', type: 'number',
      description: '1 en premier. Les cours sont listés dans cet ordre.',
      initialValue: 99,
      validation: R => R.required(),
    },
    {
      name: 'actif', title: 'Visible sur le site', type: 'boolean',
      description: 'Décochez pour retirer le cours sans le supprimer.',
      initialValue: true,
    },

    // ── Champs techniques, renseignés à la reprise du site ──
    {
      // Identifiant stable : il relie ce cours à sa photo sur la page
      // d'accueil. Renommer le cours ne doit pas casser ce lien.
      name: 'cle', title: 'Identifiant technique', type: 'string',
      hidden: true,
    },
    {
      // Nom du fichier d'origine, utilisé tant qu'aucune photo n'a
      // été déposée. Permet de reprendre le site à l'identique.
      name: 'imageFichier', title: 'Photo d\'origine', type: 'string',
      hidden: true,
    },
  ],

  orderings: [
    {
      title: 'Ordre d\'affichage',
      name: 'ordreAsc',
      by: [{ field: 'ordre', direction: 'asc' }],
    },
  ],

  preview: {
    select: {
      title: 'titre', cat: 'categorie', horaire: 'horaire',
      media: 'image', actif: 'actif', ordre: 'ordre',
    },
    prepare({ title, cat, horaire, media, actif, ordre }) {
      const pastille = { yoga: '🧘', pilates: '🏋️', autres: '🌿' }
      return {
        title: `${ordre != null ? ordre + '. ' : ''}${actif === false ? '⏸ ' : ''}${title}`,
        subtitle: `${pastille[cat] || ''} ${horaire || ''}`.trim(),
        media,
      }
    },
  },
}
