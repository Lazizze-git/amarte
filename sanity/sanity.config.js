import { defineConfig } from 'sanity'
import { deskTool }     from 'sanity/desk'
import { visionTool }   from '@sanity/vision'
import { schemaTypes }  from './schemas/index'

// ─────────────────────────────────────────────────────────────
//  AMARTE STUDIO — Configuration du CMS
//
//  Le menu ne présente que ce que le site lit réellement. Les
//  rubriques Horaires, Tarifs, Heros de page et Cards infos ont
//  été retirées : elles n'étaient plus lues, et les modifier
//  n'avait aucun effet visible — ce qui est plus déroutant
//  qu'une rubrique absente.
//
//  Le Studio est publié automatiquement à chaque modification
//  de ce dossier (workflow .github/workflows/sanity.yml).
// ─────────────────────────────────────────────────────────────

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
              .title('💰  Tarifs')
              .child(
                S.documentTypeList('tarif')
                  .title('Tarifs')
                  .defaultOrdering([{ field: 'ordre', direction: 'asc' }])
              ),
            S.documentTypeListItem('pageHero').title('🖥️   En-têtes de page'),
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

  schema: { types: schemaTypes },
})
