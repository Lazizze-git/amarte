import { defineConfig } from 'sanity'
import { deskTool }     from 'sanity/desk'
import { visionTool }   from '@sanity/vision'
import { schemaTypes }  from './schemas/index'

// ─────────────────────────────────────────────────────────────
//  AMARTE STUDIO — Configuration du CMS
//
//  Le menu ne présente que ce que le site lit réellement : une
//  rubrique qu'on modifie sans rien voir changer est plus
//  déroutante qu'une rubrique absente.
//
//  Cours et Planning sont deux rubriques distinctes, et c'est
//  voulu. Les cours décrivent l'offre — nom, photo, description ;
//  le planning décrit la semaine. On modifie l'un sans déplacer
//  l'autre. En contrepartie, renommer un cours ne renomme pas son
//  créneau : les deux sont à tenir à jour.
//
//  Le Studio est publié automatiquement à chaque modification
//  de ce dossier (workflow .github/workflows/sanity.yml).
// ─────────────────────────────────────────────────────────────

const JOURS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche']

export default defineConfig({
  name:      'amarte',
  title:     'Amarte Studio — CMS',

  projectId: 'pvvt7no0',
  dataset:   'production',

  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title('Contenu')
          .items([
            S.listItem()
              .title('🧘  Cours')
              .child(
                S.documentTypeList('cours')
                  .title('Cours')
                  // Les cours s'affichent dans l'ordre du site, pas
                  // par date de modification : on retrouve la page.
                  .defaultOrdering([{ field: 'ordre', direction: 'asc' }])
              ),
            S.listItem()
              .title('📅  Planning de la semaine')
              .child(
                S.list()
                  .title('Planning de la semaine')
                  .items(JOURS.map((jour) =>
                    S.listItem()
                      .id(jour.toLowerCase())
                      .title(jour)
                      .child(
                        S.documentList()
                          .title(jour)
                          .schemaType('creneau')
                          .filter('_type == "creneau" && jour == $jour')
                          .params({ jour })
                          // « Créer » depuis un jour pré-remplit ce jour :
                          // on ne peut pas déposer un créneau au mauvais endroit.
                          .initialValueTemplates([
                            S.initialValueTemplateItem('creneau-du-jour', { jour }),
                          ])
                      )
                  ))
              ),
            S.listItem()
              .title('💰  Tarifs')
              .child(
                S.documentTypeList('tarif')
                  .title('Tarifs')
                  .defaultOrdering([{ field: 'ordre', direction: 'asc' }])
              ),
            S.documentTypeListItem('pageHero').title('🖥️   En-têtes de page'),
            S.documentTypeListItem('bloc').title('📝  Titres de section'),
            S.listItem()
              .title('❓  Questions fréquentes')
              .child(
                S.documentTypeList('faq')
                  .title('Questions fréquentes')
                  .defaultOrdering([{ field: 'ordre', direction: 'asc' }])
              ),
            S.listItem()
              .title('📌  Repères des pages')
              .child(
                S.documentTypeList('infoCard')
                  .title('Repères')
                  .defaultOrdering([{ field: 'ordre', direction: 'asc' }])
              ),
            S.divider(),
            S.documentTypeListItem('temoignage').title('💬  Témoignages'),
            S.documentTypeListItem('mediaBloc').title('🖼   Photos du site'),
            S.divider(),
            S.listItem()
              .title('⚙️  Coordonnées du studio')
              .child(S.document().schemaType('settings').documentId('siteSettings')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,

    // Gabarit utilisé par les sept listes du planning : créer un
    // créneau depuis « Mardi » le pré-remplit sur mardi.
    templates: (precedents) => [
      ...precedents,
      {
        id: 'creneau-du-jour',
        title: 'Créneau',
        schemaType: 'creneau',
        parameters: [{ name: 'jour', type: 'string' }],
        value: ({ jour }) => ({ jour }),
      },
    ],
  },
})
