// ── MEDIA BLOC — photos du site pilotées depuis le CMS ────────
// Un document par emplacement photo. Tant qu'aucun document
// n'existe pour une clé, le site garde la photo d'origine : le
// CMS ne peut donc pas « vider » une image par accident.
//
// Une même clé peut apparaître sur plusieurs pages : la remplacer
// ici la remplace partout d'un coup.
export const mediaBloc = {
  name:  'mediaBloc',
  title: 'Photo du site',
  type:  'document',

  fields: [
    {
      name: 'cle', title: 'Emplacement', type: 'string',
      description: 'Choisissez la photo à remplacer. Un seul document par emplacement.',
      options: {
        list: [
          { title: '🏞  Grande photo d\'accueil — Accueil, Tarifs', value: 'hero' },
          { title: '🧘  Photo d\'ambiance — Tarifs',        value: 'cours-collectif-1' },
          { title: '🤸  Photo d\'ambiance — Première fois',      value: 'cours-collectif-2' },
          { title: '🏛  Salle, vue d\'ensemble — Corpo, Location',              value: 'salle-ensemble' },
          { title: '🧘‍♀️  Salle, tapis — Première fois',            value: 'salle-tapis' },
          { title: '💬  Bandeau d\'appel à l\'action — Accueil, Première fois',            value: 'cta-banner' },
          { title: '👤  Photo « À propos » — À propos, Calendrier',  value: 'about' },
        ],
      },
      validation: R => R.required(),
    },
    {
      name: 'image', title: 'Photo', type: 'image',
      description: 'Format paysage de préférence, au moins 1600 px de large.',
      options: { hotspot: true },
      validation: R => R.required(),
    },
    {
      name: 'imageMobile', title: 'Variante pour téléphone', type: 'image',
      description: 'Facultative. Une photo large se recadre mal sur un écran étroit : '
                 + 'déposez ici une version verticale si le cadrage vous déplaît. '
                 + 'Sans elle, la photo ci-dessus est utilisée partout.',
      options: { hotspot: true },
    },
    {
      name: 'alt', title: 'Description de la photo', type: 'string',
      description: 'Lue par les lecteurs d\'écran et affichée si l\'image ne charge pas. ' +
                   'Décrivez ce qu\'on voit. Laissez vide pour garder la description actuelle.',
      validation: R => R.max(160),
    },
    {
      name: 'actif', title: 'Activer', type: 'boolean',
      description: 'Décochez pour revenir temporairement à la photo d\'origine du site.',
      initialValue: true,
    },
  ],

  preview: {
    select: { cle: 'cle', media: 'image', alt: 'alt', actif: 'actif' },
    prepare({ cle, media, alt, actif }) {
      const noms = {
        'hero': 'Grande photo d\'accueil',
        'cours-collectif-1': 'Cours collectif — photo 1',
        'cours-collectif-2': 'Cours collectif — photo 2',
        'salle-ensemble': 'Salle — vue d\'ensemble',
        'salle-tapis': 'Salle — tapis',
        'cta-banner': 'Bandeau d\'appel à l\'action',
        'about': 'Photo « À propos »',
      }
      return {
        title: (actif === false ? '⏸ ' : '') + (noms[cle] || cle),
        subtitle: alt || 'Sans description',
        media,
      }
    },
  },
}
