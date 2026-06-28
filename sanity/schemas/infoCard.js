// ── INFO CARD — petites cartes informatives sur les pages ─────
// Couvre :
//   - cal-info       (3 cards calendrier : Réservation, Annulation, Places)
//   - cours-know     (3 cards Cours : Petit comité, Matériel, Guidage)
//   - contact-access (items Accès & Transport)
export const infoCard = {
  name:  'infoCard',
  title: 'Card info',
  type:  'document',

  fields: [
    {
      name: 'groupe', title: 'Groupe (section concernée)', type: 'string',
      options: {
        list: [
          { title: '📅 Calendrier — 3 cards (Réservation / Annulation / Places)', value: 'cal-info' },
          { title: '🧘 Cours — 3 cards (Petit comité / Matériel / Guidage)',     value: 'cours-know' },
          { title: '📍 Contact — Accès & Transport (liste)',                       value: 'contact-access' },
        ],
      },
      validation: R => R.required(),
    },
    {
      name: 'titre', title: 'Titre', type: 'string',
      description: 'Pour Accès & Transport : la phrase complète (ex : Parking souterrain gratuit). Pour les autres : le titre de la card.',
      validation: R => R.required().max(80),
    },
    {
      name: 'texte', title: 'Texte descriptif', type: 'text', rows: 2,
      description: 'Vide pour le groupe Accès & Transport. Max ~140 caractères pour les autres.',
      validation: R => R.max(200),
    },
    {
      name: 'ordre', title: "Ordre d'affichage", type: 'number',
      initialValue: 99,
    },
    {
      name: 'actif', title: 'Actif (visible)', type: 'boolean',
      initialValue: true,
    },
  ],

  preview: {
    select: { title: 'titre', subtitle: 'groupe' },
    prepare({ title, subtitle }) {
      const grps = {
        'cal-info': '📅 Calendrier',
        'cours-know': '🧘 Cours',
        'contact-access': '📍 Accès',
      }
      return { title, subtitle: grps[subtitle] || subtitle }
    },
  },
}
