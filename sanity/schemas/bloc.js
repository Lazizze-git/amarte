// ── TITRE DE SECTION — les en-têtes à l'intérieur des pages ───
// Chaque grande section d'une page a un petit label, un titre et
// parfois une phrase d'introduction. Une fiche par section.
//
// Sans fiche, la section garde le texte écrit dans la page : le CMS
// ne peut pas vider un titre.
export const bloc = {
  name:  'bloc',
  title: 'Titre de section',
  type:  'document',

  fields: [
    {
      name: 'zone', title: 'Section', type: 'string',
      description: 'Un seul document par section.',
      options: {
        list: [
          { title: '🏠  Accueil — Nos disciplines',        value: 'index-disciplines' },
          { title: '🏠  Accueil — Témoignages',            value: 'index-avis' },
          { title: '✨  Première fois — Les deux offres',  value: 'pf-offres' },
          { title: '✨  Première fois — Les résultats',    value: 'pf-resultats' },
          { title: '✨  Première fois — Ce qu\'il faut savoir', value: 'pf-savoir' },
          { title: '✨  Première fois — Les cours',        value: 'pf-cours' },
          { title: '✨  Première fois — Questions fréquentes', value: 'pf-faq' },
          { title: '📅  Calendrier — Comment ça marche',   value: 'cal-info' },
          { title: '🧘  Cours — Ce qu\'il faut savoir',     value: 'cours-savoir' },
        ],
      },
      validation: R => R.required(),
    },
    {
      name: 'label', title: 'Petit texte au-dessus', type: 'string',
      description: 'Deux ou trois mots. Ex : Nos disciplines, Les résultats.',
      validation: R => R.max(60),
    },
    {
      name: 'titre', title: 'Titre', type: 'text', rows: 2,
      description: 'Entourez des mots d\'astérisques pour les mettre en valeur : '
                 + 'Plusieurs profs, *plusieurs styles.*',
      validation: R => R.max(160),
    },
    {
      name: 'intro', title: 'Phrase d\'introduction', type: 'text', rows: 3,
      description: 'Sous le titre. Facultative — laissez vide si la section n\'en a pas.',
      validation: R => R.max(300),
    },
    {
      name: 'actif', title: 'Utiliser ce texte', type: 'boolean',
      description: 'Décochez pour revenir au texte d\'origine du site.',
      initialValue: true,
    },
  ],

  preview: {
    select: { zone: 'zone', titre: 'titre', actif: 'actif' },
    prepare({ zone, titre, actif }) {
      const p = String(zone || '').split('-')[0]
      const pages = { index: '🏠 Accueil', pf: '✨ Première fois', cal: '📅 Calendrier', cours: '🧘 Cours' }
      return {
        title: (actif === false ? '⏸ ' : '') + String(titre || zone).replace(/\*/g, '').replace(/\n/g, ' '),
        subtitle: pages[p] || zone,
      }
    },
  },
}
