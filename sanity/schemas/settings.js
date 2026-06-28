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
      name: 'telephone', title: 'Téléphone principal', type: 'string',
      initialValue: '+41 79 462 17 47',
    },
    {
      name: 'telephone2', title: 'Téléphone secondaire', type: 'string',
      description: 'Optionnel — affiché sur Contact et Corpo.',
      initialValue: '+41 78 810 64 64',
    },
    {
      name: 'email', title: 'Email', type: 'string',
      initialValue: 'info@amarte.ch',
    },
    {
      name: 'tagline', title: 'Slogan footer', type: 'string',
      description: 'Affiché sur toutes les pages. Utilisez *texte* pour de l\'italique. Ex : Bouger. Respirer. *S\'épanouir.*',
      initialValue: "Bouger. Respirer. *S'épanouir.*",
      validation: R => R.max(80),
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
      name: 'glofoxUrlReservation', title: 'URL Glofox — Réservation', type: 'url',
      description: 'Lien vers la vue calendrier de Glofox.',
      initialValue: 'https://app.glofox.com/portal/#/branch/66cca39faa7ce5d29003a6e3/classes-week-view?header=classes&gt=GTM-K4MSN7T3',
    },
    {
      name: 'glofoxUrlMembership', title: 'URL Glofox — Abonnements', type: 'url',
      description: 'Lien vers la page de paiement des abonnements.',
      initialValue: 'https://app.glofox.com/portal/#/branch/66cca39faa7ce5d29003a6e3/memberships?header=memberships&gt=GTM-K4MSN7T3',
    },
    {
      name: 'glofoxUrlLogin', title: 'URL Glofox — Connexion membre', type: 'url',
      description: 'Lien Se connecter.',
      initialValue: 'https://app.glofox.com/portal/#/branch/66cca39faa7ce5d29003a6e3/memberships?login',
    },
    {
      name: 'horairesOuverture', title: 'Horaires d\'accueil du studio', type: 'array',
      description: 'Affichés sur la page Contact. Mettez "Fermé" pour un jour fermé.',
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
        { jours: 'Lundi – Vendredi', heures: '8h00 – 20h00' },
        { jours: 'Samedi',           heures: '8h00 – 17h00' },
        { jours: 'Dimanche',         heures: 'Fermé' },
      ],
    },
  ],

  preview: {
    prepare() {
      return { title: '⚙️  Paramètres du site' }
    },
  },
}
