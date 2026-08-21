import { defineConfig } from 'sanity'
import { deskTool }     from 'sanity/desk'
import { visionTool }   from '@sanity/vision'
import { schemaTypes }  from './schemas/index'

// ─────────────────────────────────────────────────────────────
//  AMARTE STUDIO — Configuration Sanity CMS
//  1. Créez un projet sur https://www.sanity.io/manage
//  2. Remplacez VOTRE_PROJECT_ID ci-dessous par votre vrai ID
//  3. Lancez `npm install` puis `npm run dev` dans ce dossier
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
              .title('⚙️  Paramètres du site')
              .child(S.document().schemaType('settings').documentId('siteSettings')),
            S.divider(),
            S.documentTypeListItem('horaire').title('📅  Horaires'),
            S.documentTypeListItem('cours').title('🧘  Cours'),
            S.documentTypeListItem('mediaBloc').title('🖼   Photos du site'),
            S.documentTypeListItem('temoignage').title('💬  Témoignages'),
            S.documentTypeListItem('tarif').title('💰  Tarifs'),
            S.documentTypeListItem('pageHero').title('🪧  Heros des pages'),
            S.documentTypeListItem('infoCard').title('📌  Cards infos'),
          ]),
    }),
    visionTool(),
  ],

  schema: { types: schemaTypes },
})
