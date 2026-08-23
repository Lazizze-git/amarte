// ── CRÉNEAU — une case du calendrier de la semaine ────────────
// Le calendrier de la page Première fois est indépendant des fiches
// de cours : une ligne ici, une case là-bas. C'est volontaire — on
// peut y ajouter, déplacer ou retirer un créneau sans toucher aux
// cours, et inversement.
//
// La contrepartie : renommer un cours ne renomme pas le créneau.
// Le nom saisi ici est celui qui s'affiche dans le calendrier.
//
// Sans aucun créneau, la page garde le calendrier écrit dedans :
// le CMS ne peut pas vider la grille.
export const creneau = {
  name:  'creneau',
  title: 'Créneau du calendrier',
  type:  'document',

  fields: [
    {
      name: 'jour', title: 'Jour', type: 'string',
      description: 'Le jour de la semaine où ce créneau apparaît.',
      options: {
        list: [
          { title: 'Lundi',    value: 'Lundi' },
          { title: 'Mardi',    value: 'Mardi' },
          { title: 'Mercredi', value: 'Mercredi' },
          { title: 'Jeudi',    value: 'Jeudi' },
          { title: 'Vendredi', value: 'Vendredi' },
          { title: 'Samedi',   value: 'Samedi' },
          { title: 'Dimanche', value: 'Dimanche' },
        ],
      },
      validation: R => R.required(),
    },
    {
      name: 'heure', title: 'Heure', type: 'string',
      description: 'Format : 9h30, 18h00. Avant midi le créneau se range '
                 + 'dans la rangée Matin, après midi dans la rangée Soir.',
      validation: R => R.required().max(10),
    },
    {
      name: 'nom', title: 'Nom du cours', type: 'string',
      description: 'Le texte affiché dans la case. À écrire ici même si le cours '
                 + 'existe dans la rubrique Cours : les deux sont indépendants.',
      validation: R => R.required().max(60),
    },
    {
      name: 'instructeur', title: 'Intervenant·e', type: 'string',
      description: 'Le prénom seul. Laissez vide pour n\'afficher que le cours.',
      validation: R => R.max(40),
    },
    {
      name: 'niveau', title: 'Intensité', type: 'string',
      description: 'Les trois points affichés sous le nom.',
      options: {
        list: [
          { title: 'Doux',      value: '1' },
          { title: 'Moyen',     value: '2' },
          { title: 'Dynamique', value: '3' },
        ],
        layout: 'radio',
      },
      initialValue: '2',
      validation: R => R.required(),
    },
    {
      name: 'actif', title: 'Visible sur le site', type: 'boolean',
      description: 'Décochez pour retirer le créneau sans le supprimer — '
                 + 'utile pour une pause d\'été.',
      initialValue: true,
    },
  ],

  orderings: [
    {
      title: 'Jour et heure',
      name: 'semaine',
      by: [{ field: 'jour', direction: 'asc' }, { field: 'heure', direction: 'asc' }],
    },
  ],

  preview: {
    select: { jour: 'jour', heure: 'heure', nom: 'nom', prof: 'instructeur', actif: 'actif' },
    prepare({ jour, heure, nom, prof, actif }) {
      return {
        title: `${actif === false ? '⏸ ' : ''}${jour || '—'} · ${heure || '—'}`,
        subtitle: `${nom || ''}${prof ? '  ·  ' + prof : ''}`,
      }
    },
  },
}
