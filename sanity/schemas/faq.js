// ── QUESTION FRÉQUENTE — la FAQ de la page Première fois ──────
// Une fiche par question. L'ordre détermine la position dans la
// liste dépliante.
//
// Sans fiche, la page garde les questions écrites dedans.
export const faq = {
  name:  'faq',
  title: 'Question fréquente',
  type:  'document',

  fields: [
    {
      name: 'question', title: 'Question', type: 'string',
      description: 'Telle qu\'une personne la poserait. Ex : Je débute, est-ce adapté ?',
      validation: R => R.required().max(140),
    },
    {
      name: 'reponse', title: 'Réponse', type: 'text', rows: 4,
      description: 'Trois phrases maximum. Répondez d\'abord, expliquez ensuite.',
      validation: R => R.required().max(600),
    },
    {
      name: 'ordre', title: 'Ordre d\'affichage', type: 'number',
      description: '1 en premier. Mettez les questions les plus posées en haut.',
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
    select: { question: 'question', ordre: 'ordre', actif: 'actif' },
    prepare({ question, ordre, actif }) {
      return { title: `${ordre != null ? ordre + '. ' : ''}${actif === false ? '⏸ ' : ''}${question}` }
    },
  },
}
