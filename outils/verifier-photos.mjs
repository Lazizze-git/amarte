// ============================================================
//  Contrôle que photos-en-dur.mjs produit exactement ce que
//  produirait le navigateur.
//
//  Le principe : on charge deux fois la même page avec les mêmes
//  données Sanity — une fois telle qu'elle est écrite (le navigateur
//  fait le remplacement), une fois après passage du script (les
//  photos sont déjà dedans). L'état final des images doit être
//  identique. S'il ne l'est pas, le navigateur remplacerait encore
//  les photos écrites d'avance et le clignotement reviendrait.
//
//  Usage :  node outils/verifier-photos.mjs <dossier-avant> <dossier-apres> <port-avant> <port-apres>
// ============================================================
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'

const [avant, apres, portAvant, portApres, fixture] = process.argv.slice(2)
const PHOTOS = JSON.parse(readFileSync(fixture, 'utf8'))

const PAGES = ['index', 'cours', 'tarifs', 'contact', 'apropos',
               'calendrier', 'location', 'corpo', 'premiere-fois']

const navigateur = await chromium.launch()

// Relève l'état de chaque image pilotée par le CMS : c'est ce que
// voit le visiteur, indépendamment de la façon dont on y est arrivé.
async function etat(port, page, avecSanity) {
  const pg = await navigateur.newPage()
  await pg.route('**/*', (r) => {
    const u = r.request().url()
    if (u.includes('127.0.0.1')) return r.continue()
    if (u.includes('api.sanity.io')) {
      if (!avecSanity) return r.abort()
      const q = decodeURIComponent(new URL(u).searchParams.get('query') || '')
      const res = q.includes('mediaBloc') ? PHOTOS : []
      return r.fulfill({ status: 200, contentType: 'application/json',
                         body: JSON.stringify({ result: res }) })
    }
    return r.abort()
  })
  await pg.goto(`http://127.0.0.1:${port}/${page}.html`, { waitUntil: 'domcontentloaded' })
  await pg.waitForTimeout(1100)
  const r = await pg.evaluate(() =>
    [...document.querySelectorAll('[data-cms-img]')].map((p) => {
      const i = p.querySelector('img')
      return {
        cle: p.dataset.cmsImg,
        src: i.getAttribute('src'),
        srcset: i.getAttribute('srcset'),
        sizes: i.getAttribute('sizes'),
        alt: i.getAttribute('alt'),
        w: i.getAttribute('width'),
        h: i.getAttribute('height'),
        sources: [...p.querySelectorAll('source')]
          .map((s) => `${s.getAttribute('media') || ''}|${s.getAttribute('type') || ''}|${s.getAttribute('srcset')}`),
      }
    }))
  await pg.close()
  return r
}

let ok = true
for (const page of PAGES) {
  // Référence : la page d'origine, remplacée par le navigateur.
  const reference = await etat(portAvant, page, true)
  // Résultat : la page réécrite, servie sans Sanity du tout.
  const resultat  = await etat(portApres, page, false)

  const a = JSON.stringify(reference), b = JSON.stringify(resultat)
  const memeNombre = reference.length === resultat.length
  const identique = a === b
  if (!identique) ok = false
  console.log(`  ${identique ? 'OK   ' : 'ÉCHEC'} ${page.padEnd(15)} ${reference.length} image(s)`)
  if (!identique) {
    if (!memeNombre) console.log(`        nombre différent : ${reference.length} vs ${resultat.length}`)
    reference.forEach((r, i) => {
      const s = resultat[i]
      if (JSON.stringify(r) !== JSON.stringify(s)) {
        console.log(`        « ${r.cle} »`)
        for (const k of Object.keys(r)) {
          if (JSON.stringify(r[k]) !== JSON.stringify(s?.[k]))
            console.log(`          ${k}\n            navigateur : ${JSON.stringify(r[k])}\n            script     : ${JSON.stringify(s?.[k])}`)
        }
      }
    })
  }
}
console.log('\nRÉSULTAT :', ok
  ? 'les pages réécrites sont identiques à ce que produit le navigateur'
  : 'ÉCART — le navigateur remplacerait encore les photos')
await navigateur.close()
process.exit(ok ? 0 : 1)
