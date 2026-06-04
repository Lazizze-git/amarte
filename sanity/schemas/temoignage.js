// ── TÉMOIGNAGE — carousel de la homepage ─────────────────────
export const temoignage = {
  name:  'temoignage',
  title: 'Témoignage',
  type:  'document',

  fields: [
    {
      name: 'texte', title: 'Texte du témoignage', type: 'text', rows: 4,
      validation: R => R.required().max(400),
    },
    {
      name: 'auteur', title: 'Prénom + initiale', type: 'string',
      description: 'Ex: Sophie M.',
      validation: R => R.required(),
    },
    {
      name: 'detail', title: 'Détail membre', type: 'string',
      description: 'Ex: Membre depuis 6 mois · Yoga Flow',
    },
    {
      name: 'ordre', title: "Ordre d'affichage", type: 'number',
      initialValue: 99,
    },
    {
      name: 'actif', title: 'Actif', type: 'boolean',
      initialValue: true,
    },
  ],

  preview: {
    select: { title: 'auteur', subtitle: 'texte' },
    prepare({ title, subtitle }) {
      return { title, subtitle: (subtitle || '').slice(0, 60) + '…' }
    },
  },
}
