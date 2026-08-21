// ── PHOTO DE COURS — une image par discipline ─────────────────
// Chaque cours de la page Cours peut avoir sa propre photo. Les
// quatre cours mis en avant sur l'accueil utilisent la même : les
// changer ici les change aux deux endroits.
//
// Tant qu'aucun document n'existe pour un cours, la photo d'origine
// du site reste affichée.
export const coursPhoto = {
  name:  'coursPhoto',
  title: 'Photo de cours',
  type:  'document',

  fields: [
    {
      name: 'cours', title: 'Cours', type: 'string',
      description: 'Un seul document par cours.',
      options: {
        list: [
          { title: 'Hatha Flow — Yoga',                value: 'cours-hatha-flow' },
          { title: 'Yoga Flow — Yoga  (aussi accueil)', value: 'cours-yoga-flow' },
          { title: 'Vinyasa Flow — Yoga',              value: 'cours-vinyasa-flow' },
          { title: 'Kundalini — Yoga',                 value: 'cours-kundalini' },
          { title: 'Yogilates — Pilates  (aussi accueil)', value: 'cours-yogilates' },
          { title: 'Pilates Tonus  (aussi accueil)',   value: 'cours-pilates-tonus' },
          { title: 'Pilates Fondation  (aussi accueil)', value: 'cours-pilates-fondation' },
          { title: 'Pilates traditionnel',             value: 'cours-pilates-traditionnel' },
          { title: 'Pilates dynamique',                value: 'cours-pilates-dynamique' },
          { title: 'Nia Doux — Autres',                value: 'cours-nia-doux' },
        ],
      },
      validation: R => R.required(),
    },
    {
      name: 'image', title: 'Photo du cours', type: 'image',
      description: 'Format paysage, au moins 1200 px de large. Le cadrage se règle avec le point de focus.',
      options: { hotspot: true },
      validation: R => R.required(),
    },
    {
      name: 'alt', title: 'Description de la photo', type: 'string',
      description: 'Lue par les lecteurs d\'écran. Ex : « Cours de Hatha Flow en cours chez Amarte ».',
      validation: R => R.max(160),
    },
    {
      name: 'actif', title: 'Activer', type: 'boolean',
      description: 'Décochez pour revenir à la photo d\'origine sans supprimer ce document.',
      initialValue: true,
    },
  ],

  preview: {
    select: { cours: 'cours', media: 'image', alt: 'alt', actif: 'actif' },
    prepare({ cours, media, alt, actif }) {
      const nom = String(cours || '')
        .replace(/^cours-/, '')
        .replace(/-/g, ' ')
        .replace(/^./, (c) => c.toUpperCase())
      return {
        title: (actif === false ? '⏸ ' : '') + nom,
        subtitle: alt || 'Sans description',
        media,
      }
    },
  },
}
