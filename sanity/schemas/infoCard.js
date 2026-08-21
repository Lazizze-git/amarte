// ── REPÈRE — les petits blocs explicatifs des pages ───────────
// Trois séries, chacune sur une page :
//   · Calendrier — comment réserver, annuler, les places
//   · Cours      — ce qu'il faut savoir avant de venir
//   · Contact    — accès et transports
//
// Les cartes gardent leur icône et leur numéro : seuls le titre et
// le texte sont repris du CMS. Sans fiche pour une série, la page
// garde ce qui y est écrit.
export const infoCard = {
  name:  'infoCard',
  title: 'Repère',
  type:  'document',

  fields: [
    {
      name: 'groupe', title: 'Série', type: 'string',
      description: 'Sur quelle page ce repère apparaît.',
      options: {
        list: [
          { title: '📅  Calendrier — réserver, annuler, places', value: 'calendrier' },
          { title: '🧘  Cours — ce qu\'il faut savoir',           value: 'cours' },
          { title: '📍  Contact — accès et transports',           value: 'contact' },
        ],
        layout: 'radio',
      },
      validation: R => R.required(),
    },
    {
      name: 'titre', title: 'Titre', type: 'string',
      description: 'Pour la série Contact, c\'est la ligne entière : ex. Parking souterrain gratuit.',
      validation: R => R.required().max(90),
    },
    {
      name: 'texte', title: 'Texte', type: 'text', rows: 3,
      description: 'Deux lignes suffisent. Laissez vide pour la série Contact, qui n\'affiche que le titre.',
      hidden: ({ parent }) => parent?.groupe === 'contact',
      validation: R => R.max(220),
    },
    {
      name: 'ordre', title: 'Ordre d\'affichage', type: 'number',
      description: '1 en premier, dans sa série.',
      initialValue: 99,
      validation: R => R.required(),
    },
    {
      name: 'actif', title: 'Visible sur le site', type: 'boolean',
      initialValue: true,
    },
  ],

  orderings: [
    { title: 'Ordre', name: 'ordreAsc', by: [{ field: 'ordre', direction: 'asc' }] },
  ],

  preview: {
    select: { titre: 'titre', groupe: 'groupe', ordre: 'ordre', actif: 'actif' },
    prepare({ titre, groupe, ordre, actif }) {
      const g = { calendrier: '📅 Calendrier', cours: '🧘 Cours', contact: '📍 Contact' }
      return {
        title: `${ordre != null ? ordre + '. ' : ''}${actif === false ? '⏸ ' : ''}${titre}`,
        subtitle: g[groupe] || groupe,
      }
    },
  },
}
