// ============================================================
//  Écrit les photos de Sanity directement dans les pages
//
//  Sans ce script, une page arrive chez le visiteur avec la photo
//  d'origine, et c'est son navigateur qui interroge Sanity puis la
//  remplace : on voit l'ancienne photo, puis la nouvelle. Deux
//  téléchargements, et un clignotement à chaque visite.
//
//  Le travail est donc déplacé au moment de la publication : on
//  interroge Sanity une fois, et les pages partent avec la bonne
//  photo déjà dedans. Le navigateur n'a plus rien à remplacer.
//
//  Le résultat doit reproduire à l'identique ce que fait
//  renderMedias() dans js/cms.js — mêmes adresses, mêmes attributs.
//  Sinon le script du navigateur les remplacerait quand même, et le
//  clignotement reviendrait. Les deux sont donc à faire évoluer
//  ensemble ; le test outils/verifier-photos.mjs le contrôle.
//
//  Si Sanity ne répond pas, les pages sont laissées telles quelles :
//  une publication ne doit pas échouer parce que le CMS est lent.
//
//  Usage :  node outils/photos-en-dur.mjs
//           node outils/photos-en-dur.mjs --dossier <chemin>       (tests)
//           node outils/photos-en-dur.mjs --donnees <fichier.json> (tests)
// ============================================================
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const PROJET  = 'pvvt7no0'
const DATASET = 'production'
const API     = '2024-01-01'

// Par défaut, les pages du dépôt ; --dossier permet de travailler sur
// une copie, ce dont les tests ont besoin pour comparer avant / après.
function option(nom) {
  const i = process.argv.indexOf(nom)
  return i === -1 ? null : process.argv[i + 1]
}
const RACINE = option('--dossier')
             || join(dirname(fileURLToPath(import.meta.url)), '..')

// Reprise mot pour mot de la requête de js/cms.js.
const REQUETE = `*[_type in ["mediaBloc", "cours"] && actif != false && defined(image)]{
      cle, "alt": select(_type == "cours" => imageAlt, alt),
      "ref": image.asset._ref,
      "refMobile": imageMobile.asset._ref
    }`

// ── Adresses du CDN — identiques à celles de js/cms.js ────────
function urlImage(ref, largeur) {
  const p = String(ref || '').split('-')
  if (p.length < 4 || p[0] !== 'image') return null
  const ext = p[p.length - 1]
  const dim = p[p.length - 2]
  const id  = p.slice(1, -2).join('-')
  return `https://cdn.sanity.io/images/${PROJET}/${DATASET}/`
       + `${id}-${dim}.${ext}?w=${largeur}&q=75&auto=format&fit=max`
}

function dimensions(ref) {
  const m = /-(\d+)x(\d+)-[a-z]+$/.exec(String(ref || ''))
  return m ? { l: parseInt(m[1], 10), h: parseInt(m[2], 10) } : null
}

// ── Lecture de Sanity ─────────────────────────────────────────
async function lireSanity() {
  const fichier = option('--donnees')
  if (fichier) {
    // Jeu d'essai local : permet de vérifier le script sans réseau.
    return JSON.parse(readFileSync(fichier, 'utf8'))
  }
  const url = `https://${PROJET}.api.sanity.io/v${API}/data/query/${DATASET}`
            + `?query=${encodeURIComponent(REQUETE)}`
  const r = await fetch(url)
  if (!r.ok) throw new Error(`Sanity a répondu ${r.status}`)
  return (await r.json()).result
}

// ── Réécriture d'un bloc <picture> ────────────────────────────
// Le balisage est simple et régulier : une balise ouvrante, des
// <source>, une <img>. On ne touche qu'à ces trois éléments.
const BLOC = /<picture([^>]*\sdata-cms-img="([^"]+)"[^>]*)>([\s\S]*?)<\/picture>/g

function attribut(balise, nom, valeur) {
  const motif = new RegExp(`\\s${nom}="[^"]*"`)
  return motif.test(balise)
    ? balise.replace(motif, ` ${nom}="${valeur}"`)
    : balise.replace(/\s*\/?>$/, ` ${nom}="${valeur}"$&`).replace(/"\s+(\/?>)$/, '" $1')
}

function retirerAttribut(balise, nom) {
  return balise.replace(new RegExp(`\\s${nom}="[^"]*"`), '')
}

function echapper(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
                  .replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function reecrire(html, parCle, compteur) {
  return html.replace(BLOC, (tout, attrs, cle, dedans) => {
    const media = parCle[cle]
    if (!media || !media.ref) return tout

    const url = urlImage(media.ref, 1600)
    if (!url) return tout

    const balise = dedans.match(/<img\b[^>]*>/)
    if (!balise) return tout

    let img = balise[0]
    // Les <source> d'origine pointent vers les fichiers du site : les
    // garder ferait gagner l'ancienne photo, que le navigateur préfère.
    img = retirerAttribut(img, 'sizes')
    img = attribut(img, 'src', echapper(url))
    img = attribut(img, 'srcset',
                   echapper(url + ' 1x, ' + urlImage(media.ref, 2400) + ' 2x'))
    if (media.alt) img = attribut(img, 'alt', echapper(media.alt))

    // Sans les dimensions réelles, le navigateur ne réserve plus la
    // bonne hauteur et la page sursaute au chargement.
    const dim = dimensions(media.ref)
    if (dim) {
      img = attribut(img, 'width', dim.l)
      img = attribut(img, 'height', dim.h)
    }

    // Variante téléphone : une photo large se recadre mal sur un
    // écran étroit. Le navigateur choisit seul, sans script.
    const mobile = media.refMobile
      ? `<source media="(max-width: 640px)" srcset="`
        + echapper(urlImage(media.refMobile, 800) + ' 1x, '
                 + urlImage(media.refMobile, 1400) + ' 2x') + `" />`
      : ''

    compteur.n += 1
    return `<picture${attrs}>${mobile}${img}</picture>`
  })
}

// ── Exécution ─────────────────────────────────────────────────
let medias
try {
  medias = await lireSanity()
} catch (e) {
  console.warn(`Photos non reprises (${e.message}). Les pages gardent `
             + `leurs photos d'origine et le navigateur fera le remplacement.`)
  process.exit(0)
}

if (!medias || medias.length === 0) {
  console.warn('Sanity n\'a renvoyé aucune photo : pages inchangées.')
  process.exit(0)
}

const parCle = {}
medias.forEach((m) => { if (m.cle && m.ref) parCle[m.cle] = m })
console.log(`${Object.keys(parCle).length} photo(s) trouvée(s) dans Sanity.`)

let pages = 0
const compteur = { n: 0 }
for (const f of readdirSync(RACINE).filter((f) => f.endsWith('.html'))) {
  const avant = readFileSync(join(RACINE, f), 'utf8')
  const debut = compteur.n
  const apres = reecrire(avant, parCle, compteur)
  if (apres !== avant) {
    writeFileSync(join(RACINE, f), apres)
    pages += 1
    console.log(`  ${f} — ${compteur.n - debut} photo(s)`)
  }
}

console.log(`\n${compteur.n} emplacement(s) réécrit(s) dans ${pages} page(s).`)
