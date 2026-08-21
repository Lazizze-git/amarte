// ── SETTINGS — paramètres globaux du site (singleton) ─────────
export const settings = {
  name:  'settings',
  title: 'Paramètres du site',
  type:  'document',

  // Singleton : un seul document de ce type
  __experimental_actions: ['update', 'publish'],

  fields: [
    {
      name: 'adresse', title: 'Adresse', type: 'string',
      initialValue: 'Route du Village 1A, 2ème étage, 1066 Épalinges',
    },
    {
      name: 'telephone', title: 'Téléphone', type: 'string',
      initialValue: '+41 78 810 64 64',
    },
    {
      name: 'email', title: 'Email', type: 'string',
      initialValue: 'hello@amarte.ch',
    },
    {
      name: 'instagram', title: 'URL Instagram', type: 'url',
      initialValue: 'https://instagram.com/amarte_epalinges',
    },
    {
      name: 'facebook', title: 'URL Facebook', type: 'url',
      initialValue: 'https://facebook.com/AmarteEpalinges',
    },
    {
      name: 'glofoxBranchId', title: 'Glofox Branch ID', type: 'string',
      description: 'ID de votre espace Glofox — ex: 66cca39faa7ce5d29003a6e3',
      initialValue: '66cca39faa7ce5d29003a6e3',
    },
    {
      name: 'horairesOuverture', title: 'Horaires d\'ouverture', type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'jours',  title: 'Jours',   type: 'string' },
          { name: 'heures', title: 'Horaires', type: 'string' },
        ],
        preview: {
          select: { title: 'jours', subtitle: 'heures' },
        },
      }],
      initialValue: [
        { jours: 'Lundi – Vendredi', heures: '08:30 – 20:30' },
        { jours: 'Samedi',           heures: '09:00 – 13:00' },
        { jours: 'Dimanche',         heures: '09:00 – 19:00' },
      ],
    },
  ],

  preview: {
    prepare() {
      return { title: '⚙️  Paramètres du site' }
    },
  },
}
