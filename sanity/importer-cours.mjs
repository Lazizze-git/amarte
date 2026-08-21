// ============================================================
//  Import des cours dans Sanity — opération ponctuelle
//
//  Remplace le contenu du type « cours » par les dix cours
//  actuels du site, repris à l'identique depuis cours.ndjson.
//
//  ⚠ Cet import ÉCRASE tous les cours existants. Il est conçu
//    pour la reprise initiale, pas pour tourner régulièrement :
//    relancé après coup, il effacerait les modifications faites
//    dans le Studio. C'est pourquoi le workflow qui l'appelle ne
//    se déclenche qu'à la main.
//
//  Usage :  SANITY_WRITE_TOKEN=... node importer-cours.mjs
//           SANITY_WRITE_TOKEN=... node importer-cours.mjs --dry-run
// ============================================================
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const PROJET  = 'pvvt7no0'
const DATASET = 'production'
const API     = '2024-01-01'

const jeton = process.env.SANITY_WRITE_TOKEN
const simulation = process.argv.includes('--dry-run')

if (!jeton && !simulation) {
  console.error('SANITY_WRITE_TOKEN manquant. Créez un jeton de rôle Editor '
              + 'sur sanity.io/manage, puis relancez.')
  process.exit(1)
}

const ici = dirname(fileURLToPath(import.meta.url))
const docs = readFileSync(join(ici, 'cours.ndjson'), 'utf8')
  .split('\n')
  .filter((l) => l.trim())
  .map((l) => JSON.parse(l))

if (docs.length === 0) {
  console.error('cours.ndjson est vide, rien à importer.')
  process.exit(1)
}

console.log(`${docs.length} cours à importer :`)
docs.forEach((d) => console.log(`  ${String(d.ordre).padStart(2)}. ${d.titre} — ${d.horaire}`))

// Les documents existants sont supprimés par requête plutôt que par
// identifiant : les anciens cours ont des identifiants générés qu'on
// ne connaît pas. Tout part dans la même mutation, donc soit
// l'ensemble s'applique, soit rien.
const mutations = [
  { delete: { query: '*[_type == "cours"]' } },
  ...docs.map((doc) => ({ createOrReplace: doc })),
]

if (simulation) {
  console.log(`\nSimulation : ${mutations.length} mutations seraient envoyées.`)
  console.log('Aucune donnée modifiée.')
  process.exit(0)
}

const url = `https://${PROJET}.api.sanity.io/v${API}/data/mutate/${DATASET}?returnIds=true`
const reponse = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jeton}`,
  },
  body: JSON.stringify({ mutations }),
})

const corps = await reponse.text()

if (!reponse.ok) {
  console.error(`\nÉchec (HTTP ${reponse.status}) :`)
  console.error(corps)
  // Un 401 ou 403 signifie presque toujours un jeton en lecture seule.
  if (reponse.status === 401 || reponse.status === 403) {
    console.error('\nLe jeton doit avoir le rôle Editor : un jeton '
                + '« Deploy Studio » ou « Viewer » ne peut pas écrire.')
  }
  process.exit(1)
}

const resultat = JSON.parse(corps)
console.log(`\nImport réussi — ${resultat.results?.length ?? 0} documents écrits.`)
console.log('Les cours sont désormais modifiables dans le Studio, rubrique « Cours ».')
