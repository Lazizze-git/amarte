// ── PAGE HERO — bandeau d'en-tête de chaque page ──────────────
// Un document par page. Le client peut éditer le label, le titre
// et le sous-titre du hero sans toucher au code.
// Note : la page Accueil a un hero spécial animé et n'est pas pilotée ici.
export const pageHero = {
  name:  'pageHero',
  title: 'Hero de page',
  type:  'document',

  fields: [
    {
      name: 'page', title: 'Page', type: 'string',
      options: {
        list: [
          { title: 'À propos',       value: 'apropos' },
          { title: 'Cours',          value: 'cours' },
          { title: 'Tarifs',         value: 'tarifs' },
          { title: 'Calendrier',     value: 'calendrier' },
          { title: 'Contact',        value: 'contact' },
          { title: 'Location',       value: 'location' },
          { title: 'Corpo B2B',      value: 'corpo' },
          { title: 'Première fois',  value: 'premiere-fois' },
        ],
      },
      validation: R => R.required(),
    },
    {
      name: 'label', title: 'Petit label au-dessus du titre', type: 'string',
      description: 'Ex : Le studio · Cours & disciplines · Planning. Court (< 40 caractères).',
      validation: R => R.max(60),
    },
    {
      name: 'titre', title: 'Titre principal (H1)', type: 'text', rows: 2,
      description: 'Sautez une ligne pour faire un retour à la ligne visuel. Utilisez *mot* pour mettre en italique.',
      validation: R => R.required().max(120),
    },
    {
      name: 'sousTitre', title: 'Sous-titre', type: 'text', rows: 3,
      description: 'Phrase d\'introduction sous le titre. Utilisez *mot* pour mettre en italique.',
      validation: R => R.max(300),
    },
  ],

  preview: {
    select: { title: 'page', subtitle: 'titre' },
    prepare({ title, subtitle }) {
      const pages = {
        apropos: '👤 À propos', cours: '🧘 Cours', tarifs: '💰 Tarifs',
        calendrier: '📅 Calendrier', contact: '📍 Contact',
        location: '🏛️ Location', corpo: '🏢 Corpo',
        'premiere-fois': '✨ Première fois',
      }
      return { title: pages[title] || title, subtitle: (subtitle || '').replace(/\n/g, ' · ') }
    },
  },
}
