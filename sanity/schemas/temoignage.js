// ── TÉMOIGNAGE — grille de la homepage (~12 cartes) ──────────
export const temoignage = {
  name:  'temoignage',
  title: 'Témoignage',
  type:  'document',

  fields: [
    {
      name: 'texte', title: 'Texte du témoignage', type: 'text', rows: 4,
      description: 'Sans les guillemets « » — ils sont ajoutés automatiquement sur le site.',
      validation: R => R.required().max(400),
    },
    {
      name: 'auteur', title: 'Auteur', type: 'string',
      description: 'Prénom (ou Prénom + Nom). Ex: Maria Martha. La 1ère lettre génère l\'avatar.',
      validation: R => R.required(),
    },
    {
      name: 'detail', title: 'Détail membre', type: 'string',
      description: 'Format : Discipline · ancienneté ou statut. Ex: Pilates · membre — Yoga & Pilates · +3 mois.',
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
