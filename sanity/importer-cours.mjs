// ============================================================
//  Import des cours dans Sanity — opération ponctuelle
//
//  Remplace les cours et les en-têtes de page par le contenu
//  actuel du site, repris à l'identique.
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

// Chaque fichier reprend un type de contenu du site. Ajouter une
// entrée ici suffit à étendre la reprise.
const SOURCES = [
  { fichier: 'cours.ndjson', type: 'cours',    libelle: 'cours' },
  { fichier: 'heros.ndjson', type: 'pageHero', libelle: 'en-têtes de page' },
  { fichier: 'tarifs.ndjson', type: 'tarif',   libelle: 'tarifs' },
]

const docs = []
for (const src of SOURCES) {
  const lus = readFileSync(join(ici, src.fichier), 'utf8')
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l))

  if (lus.length === 0) {
    console.error(`${src.fichier} est vide : import interrompu pour ne pas ` +
                  `supprimer les ${src.libelle} sans rien remettre.`)
    process.exit(1)
  }

  console.log(`${lus.length} ${src.libelle} :`)
  lus.forEach((d) => console.log(`  · ${d.titre || d.nom || d.page}`))
  docs.push(...lus)
}

// Les documents existants sont supprimés par requête plutôt que par
// identifiant : les anciens cours ont des identifiants générés qu'on
// ne connaît pas. Tout part dans la même mutation, donc soit
// l'ensemble s'applique, soit rien.
const types = SOURCES.map((s) => `"${s.type}"`).join(', ')
const mutations = [
  { delete: { query: `*[_type in [${types}]]` } },
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
console.log('Le contenu est désormais modifiable dans le Studio.')
