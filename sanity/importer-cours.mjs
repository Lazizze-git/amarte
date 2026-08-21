// ============================================================
//  Import des cours dans Sanity — opération ponctuelle
//
//  Remplace les cours et les en-têtes de page par le contenu
//  actuel du site, repris à l'identique.
//
//  Par défaut l'import est ADDITIF : il ne crée que les documents
//  absents. Relancé cent fois, il ne touche jamais à ce qui a été
//  modifié dans le Studio. C'est ce qui permet de le lancer à chaque
//  déploiement sans risque.
//
//  --remplacer force la reprise complète : tout est supprimé puis
//  réécrit depuis les fichiers. À n'utiliser que pour repartir de
//  l'état d'origine, en connaissance de cause.
//
//  Usage :  SANITY_WRITE_TOKEN=... node importer-cours.mjs
//           SANITY_WRITE_TOKEN=... node importer-cours.mjs --remplacer
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
const remplacer = process.argv.includes('--remplacer')

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
  { fichier: 'repere.ndjson', type: 'infoCard', libelle: 'repères' },
  { fichier: 'blocs.ndjson', type: 'bloc',     libelle: 'titres de section' },
  { fichier: 'faq.ndjson',   type: 'faq',      libelle: 'questions fréquentes' },
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
  lus.forEach((d) => console.log(`  · ${d.titre || d.nom || d.question || d.zone || d.page}`))
  docs.push(...lus)
}

// createIfNotExists ne touche pas à un document déjà présent : c'est
// ce qui rend l'import rejouable sans effacer le travail du client.
// En mode remplacement, tout est supprimé d'abord — les anciens
// documents ayant des identifiants générés, la suppression passe par
// une requête plutôt que par une liste d'identifiants.
const types = SOURCES.map((s) => `"${s.type}"`).join(', ')
const mutations = remplacer
  ? [
      { delete: { query: `*[_type in [${types}]]` } },
      ...docs.map((doc) => ({ createOrReplace: doc })),
    ]
  : docs.map((doc) => ({ createIfNotExists: doc }))

console.log(remplacer
  ? '\nMode REMPLACEMENT : le contenu existant sera écrasé.'
  : '\nMode additif : les documents déjà présents ne seront pas modifiés.')

if (simulation) {
  console.log(`\nSimulation : ${mutations.length} mutations seraient envoyées.`)
  console.log('Aucune donnée modifiée.')
  process.exit(0)
}

// Le document des coordonnées traîne des champs abandonnés par
// d'anciennes versions du schéma. Sanity les signale à chaque
// ouverture ; on les retire une bonne fois, sans toucher aux champs
// encore utilisés.
const CHAMPS_COORDONNEES = [
  'adresse', 'telephone', 'email', 'instagram', 'facebook',
  'glofoxBranchId', 'horairesOuverture',
]

async function nettoyerCoordonnees() {
  const lecture = `https://${PROJET}.api.sanity.io/v${API}/data/query/${DATASET}`
                + `?query=${encodeURIComponent('*[_id == "siteSettings"][0]')}`
  const r = await fetch(lecture, { headers: { Authorization: `Bearer ${jeton}` } })
  if (!r.ok) return null

  const doc = (await r.json()).result
  if (!doc) return null

  const orphelins = Object.keys(doc).filter(
    (k) => !k.startsWith('_') && !CHAMPS_COORDONNEES.includes(k)
  )
  if (orphelins.length === 0) return null

  console.log(`\nChamps abandonnés à retirer des coordonnées : ${orphelins.join(', ')}`)
  return { patch: { id: 'siteSettings', unset: orphelins } }
}

const url = `https://${PROJET}.api.sanity.io/v${API}/data/mutate/${DATASET}?returnIds=true`
const menage = await nettoyerCoordonnees()
if (menage) mutations.push(menage)

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
const ecrits = resultat.results?.length ?? 0
console.log(`\nImport terminé — ${ecrits} document(s) créé(s), ` +
            `${docs.length - ecrits} déjà présent(s) et laissé(s) intact(s).`)
console.log('Le contenu est désormais modifiable dans le Studio.')
