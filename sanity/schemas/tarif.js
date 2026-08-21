// ── TARIF — abonnements, cartes et cours privés ───────────────
// Une fiche par formule affichée sur la page Tarifs.
//
// Les prix des abonnements alimentent aussi le simulateur de la
// page : le modifier ici le met à jour aux deux endroits, sans
// quoi la page annoncerait deux prix différents.
//
// Sans fiche dans le CMS, la page garde les tarifs écrits dans le
// HTML : une erreur de saisie ne peut pas vider la grille.
export const tarif = {
  name:  'tarif',
  title: 'Tarif',
  type:  'document',

  fields: [
    {
      name: 'groupe', title: 'Type de formule', type: 'string',
      description: 'Détermine dans quelle section de la page la formule apparaît.',
      options: {
        list: [
          { title: '📅  Abonnement illimité', value: 'abonnement' },
          { title: '🎟  Carte de cours',       value: 'pack' },
          { title: '🤝  Cours privé',          value: 'prive' },
        ],
        layout: 'radio',
      },
      validation: R => R.required(),
    },
    {
      name: 'nom', title: 'Nom de la formule', type: 'string',
      description: 'Ex : 3 mois illimités, Pack 10 cours.',
      validation: R => R.required().max(60),
    },
    {
      name: 'sousTitre', title: 'Ligne sous le nom', type: 'string',
      description: 'Abonnements : la promesse (ex : Le temps où le corps se transforme). '
                 + 'Cartes : le nombre de crédits.',
      validation: R => R.max(80),
    },
    {
      name: 'prix', title: 'Prix affiché', type: 'string',
      description: 'Le montant seul, sans « CHF » : 460. '
                 + 'Écrivez « Sur devis » si le prix n\'est pas public.',
      validation: R => R.required().max(30),
    },
    {
      name: 'parCours', title: 'Prix ramené au cours', type: 'string',
      description: 'Petite ligne sous le prix. Ex : soit CHF 153 / mois. Facultatif.',
      validation: R => R.max(60),
    },
    {
      name: 'mois', title: 'Durée en mois', type: 'number',
      description: 'Abonnements uniquement. Sert au simulateur d\'économies de la page.',
      hidden: ({ parent }) => parent?.groupe !== 'abonnement',
    },
    {
      name: 'recommande', title: 'Mettre en avant', type: 'boolean',
      description: 'Une seule formule à la fois. Elle est encadrée sur la page.',
      hidden: ({ parent }) => parent?.groupe === 'prive',
      initialValue: false,
    },
    {
      name: 'lien', title: 'Lien d\'achat', type: 'url',
      description: 'L\'adresse Glofox de la formule. Laissez vide pour un simple texte sans bouton.',
      validation: R => R.uri({ scheme: ['http', 'https'] }),
    },
    {
      name: 'texteBouton', title: 'Texte du bouton', type: 'string',
      description: 'Ex : Choisir 3 mois, Acheter.',
      validation: R => R.max(40),
    },
    {
      name: 'ordre', title: 'Ordre d\'affichage', type: 'number',
      description: '1 en premier, dans sa section.',
      initialValue: 99,
      validation: R => R.required(),
    },
    {
      name: 'actif', title: 'Visible sur le site', type: 'boolean',
      initialValue: true,
    },
    {
      name: 'cta', title: 'Identifiant de suivi', type: 'string',
      hidden: true,
    },
  ],

  orderings: [
    { title: 'Ordre', name: 'ordreAsc', by: [{ field: 'ordre', direction: 'asc' }] },
  ],

  preview: {
    select: { nom: 'nom', groupe: 'groupe', prix: 'prix', reco: 'recommande', actif: 'actif' },
    prepare({ nom, groupe, prix, reco, actif }) {
      const g = { abonnement: '📅', pack: '🎟', prive: '🤝' }
      const montant = /^\d/.test(String(prix || '')) ? `CHF ${prix}` : prix
      return {
        title: `${actif === false ? '⏸ ' : ''}${nom}${reco ? '  ⭐' : ''}`,
        subtitle: `${g[groupe] || ''}  ${montant || ''}`,
      }
    },
  },
}
