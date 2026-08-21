// ── EN-TÊTE DE PAGE — le bandeau en haut de chaque page ───────
// Un document par page. Le label, le titre et le texte
// d'introduction sont modifiables sans toucher au code.
//
// L'accueil n'est pas dans la liste : son titre est animé lettre
// par lettre, le piloter depuis le CMS casserait l'animation.
//
// Sans document pour une page, celle-ci garde le texte écrit
// dans le HTML : le CMS ne peut pas vider un en-tête.
export const pageHero = {
  name:  'pageHero',
  title: 'En-tête de page',
  type:  'document',

  fields: [
    {
      name: 'page', title: 'Page concernée', type: 'string',
      description: 'Un seul document par page.',
      options: {
        list: [
          { title: '✨  Première fois', value: 'premiere-fois' },
          { title: '🧘  Cours',         value: 'cours' },
          { title: '📅  Calendrier',    value: 'calendrier' },
          { title: '💰  Tarifs',        value: 'tarifs' },
          { title: '👤  À propos',      value: 'apropos' },
          { title: '🏛  Location de salle', value: 'location' },
          { title: '🏢  Entreprises',   value: 'corpo' },
          { title: '📍  Contact',       value: 'contact' },
        ],
      },
      validation: R => R.required(),
    },
    {
      name: 'label', title: 'Petit texte au-dessus du titre', type: 'string',
      description: 'Deux ou trois mots en capitales. Ex : Le studio, Planning, Contact.',
      validation: R => R.max(60),
    },
    {
      name: 'titre', title: 'Grand titre', type: 'text', rows: 2,
      description: 'Retour à la ligne = nouvelle ligne à l\'écran. '
                 + 'Entourez des mots d\'astérisques pour les mettre en valeur : '
                 + 'Choisissez comment *vous voulez avancer.*',
      validation: R => R.max(160),
    },
    {
      name: 'sousTitre', title: 'Texte d\'introduction', type: 'text', rows: 4,
      description: 'Une ligne vide entre deux phrases crée un nouveau paragraphe. '
                 + 'Les astérisques fonctionnent aussi ici.',
      validation: R => R.max(400),
    },
    {
      name: 'actif', title: 'Utiliser ce texte', type: 'boolean',
      description: 'Décochez pour revenir au texte d\'origine du site.',
      initialValue: true,
    },
  ],

  preview: {
    select: { page: 'page', titre: 'titre', actif: 'actif' },
    prepare({ page, titre, actif }) {
      const noms = {
        'premiere-fois': '✨ Première fois', cours: '🧘 Cours',
        calendrier: '📅 Calendrier', tarifs: '💰 Tarifs',
        apropos: '👤 À propos', location: '🏛 Location',
        corpo: '🏢 Entreprises', contact: '📍 Contact',
      }
      return {
        title: (actif === false ? '⏸ ' : '') + (noms[page] || page),
        subtitle: String(titre || '').replace(/\n/g, ' ').replace(/\*/g, ''),
      }
    },
  },
}
