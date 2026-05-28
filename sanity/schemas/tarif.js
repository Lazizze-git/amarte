// ── TARIF — formules d'abonnement / packs ─────────────────────
export const tarif = {
  name:  'tarif',
  title: 'Tarif',
  type:  'document',

  fields: [
    {
      name: 'nom', title: 'Nom de la formule', type: 'string',
      description: 'Ex: 3 mois illimités',
      validation: R => R.required(),
    },
    {
      name: 'sousTitre', title: 'Accroche', type: 'string',
      description: 'Ex: Le temps où le corps se transforme',
    },
    {
      name: 'type', title: 'Type', type: 'string',
      options: {
        list: [
          { title: 'Abonnement illimité', value: 'illimite' },
          { title: 'Pack de cours',       value: 'pack' },
          { title: 'Pack Découverte',     value: 'decouverte' },
          { title: 'Cours privé',         value: 'prive' },
        ],
      },
      validation: R => R.required(),
    },
    {
      name: 'prix', title: 'Prix (CHF)', type: 'number',
      validation: R => R.required().min(0),
    },
    {
      name: 'prixParCours', title: 'Prix par cours (CHF)', type: 'number',
      description: 'Calculé automatiquement ou saisi manuellement',
    },
    {
      name: 'description', title: 'Description courte', type: 'text', rows: 2,
    },
    {
      name: 'recommande', title: 'Badge "Recommandé"', type: 'boolean',
      initialValue: false,
    },
    {
      name: 'aucunRenouvellement', title: 'Afficher "Aucun renouvellement automatique"',
      type: 'boolean', initialValue: true,
    },
    {
      name: 'glofoxUrl', title: 'URL Glofox (lien d\'achat)', type: 'url',
      description: 'Laisser vide pour utiliser l\'URL par défaut',
    },
    {
      name: 'ordre', title: 'Ordre d'affichage', type: 'number',
      initialValue: 99,
    },
    {
      name: 'actif', title: 'Actif', type: 'boolean',
      initialValue: true,
    },
  ],

  preview: {
    select: { title: 'nom', prix: 'prix', type: 'type' },
    prepare({ title, prix, type }) {
      const types = { illimite: '∞', pack: '📦', decouverte: '✨', prive: '👤' }
      return { title, subtitle: `${types[type] || ''} CHF ${prix}` }
    },
  },
}
