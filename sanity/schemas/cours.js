// ── COURS — fiche d'un cours (page cours.html) ────────────────
export const cours = {
  name:  'cours',
  title: 'Cours',
  type:  'document',

  fields: [
    {
      name: 'titre', title: 'Titre du cours', type: 'string',
      validation: R => R.required(),
    },
    {
      name: 'sousTitre', title: 'Sous-titre', type: 'string',
      description: 'Ex: Renforcement & Alignement',
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
      validation: R => R.required(),
    },
    {
      name: 'description', title: 'Description', type: 'text', rows: 4,
    },
    {
      name: 'niveau', title: 'Niveau', type: 'string',
      options: {
        list: [
          { title: 'Tous niveaux',   value: 'Tous niveaux' },
          { title: 'Débutant',       value: 'Débutant' },
          { title: 'Intermédiaire',  value: 'Intermédiaire' },
          { title: 'Avancé',         value: 'Avancé' },
        ],
      },
      initialValue: 'Tous niveaux',
    },
    {
      name: 'joursHoraires', title: 'Jours & horaires (affiché)', type: 'string',
      description: 'Ex: Lun · 09:30 / Mer · 18:30',
    },
    {
      name: 'tags', title: 'Tags', type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          'Doux', 'Dynamique', 'Renforcement', 'Étirement',
          'Respiration', 'Méditation', 'Posture', 'Détox',
        ],
      },
    },
    {
      name: 'instructeur', title: 'Instructeur·trice', type: 'string',
    },
    {
      name: 'ordre', title: 'Ordre d'affichage', type: 'number',
      initialValue: 99,
    },
    {
      name: 'actif', title: 'Actif (visible sur le site)', type: 'boolean',
      initialValue: true,
    },
  ],

  preview: {
    select: { title: 'titre', subtitle: 'categorie' },
    prepare({ title, subtitle }) {
      const cat = { yoga: '🧘', pilates: '🏋️', bienetre: '🌿' }
      return { title, subtitle: `${cat[subtitle] || ''} ${subtitle}` }
    },
  },
}
