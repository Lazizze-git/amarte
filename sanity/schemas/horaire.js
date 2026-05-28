// ── HORAIRE — créneau du planning hebdomadaire ────────────────
const JOURS = [
  { title: 'Lundi',    value: 'Lundi',    ordre: 1 },
  { title: 'Mardi',    value: 'Mardi',    ordre: 2 },
  { title: 'Mercredi', value: 'Mercredi', ordre: 3 },
  { title: 'Jeudi',    value: 'Jeudi',    ordre: 4 },
  { title: 'Vendredi', value: 'Vendredi', ordre: 5 },
  { title: 'Samedi',   value: 'Samedi',   ordre: 6 },
  { title: 'Dimanche', value: 'Dimanche', ordre: 7 },
]

export const horaire = {
  name:  'horaire',
  title: 'Horaire',
  type:  'document',

  fields: [
    {
      name: 'jour', title: 'Jour', type: 'string',
      options: { list: JOURS.map(j => ({ title: j.title, value: j.value })) },
      validation: R => R.required(),
    },
    {
      name: 'jourOrdre', title: 'Ordre du jour (pour le tri)', type: 'number',
      description: 'Lundi=1, Mardi=2, … Dimanche=7',
      validation: R => R.required().min(1).max(7),
    },
    {
      name: 'heure', title: 'Heure', type: 'string',
      description: 'Format HH:MM — ex: 09:30',
      validation: R => R.required().regex(/^\d{2}:\d{2}$/, { name: 'heure', invert: false }),
    },
    {
      name: 'nom', title: 'Nom du cours', type: 'string',
      validation: R => R.required(),
    },
    {
      name: 'duree', title: 'Durée', type: 'string',
      description: 'Ex: 60 min',
      initialValue: '60 min',
    },
    {
      name: 'categorie', title: 'Catégorie', type: 'string',
      options: {
        list: [
          { title: 'Yoga',      value: 'yoga' },
          { title: 'Pilates',   value: 'pilates' },
          { title: 'Bien-être', value: 'bienetre' },
        ],
      },
    },
    {
      name: 'actif', title: 'Actif (visible sur le site)', type: 'boolean',
      initialValue: true,
    },
  ],

  orderings: [
    {
      title: 'Jour puis heure',
      name:  'jourHeure',
      by:    [{ field: 'jourOrdre', direction: 'asc' }, { field: 'heure', direction: 'asc' }],
    },
  ],

  preview: {
    select: { title: 'nom', jour: 'jour', heure: 'heure' },
    prepare({ title, jour, heure }) {
      return { title, subtitle: `${jour} · ${heure}` }
    },
  },
}
