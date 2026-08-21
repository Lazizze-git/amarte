// ============================================================
//  AMARTE — Générateur du contenu initial pour Sanity
//  Reprend le contenu statique actuel du site et le transforme
//  en fichier d'import NDJSON.
//
//  Usage :
//    node seed.mjs                 → génère seed.ndjson
//    npx sanity dataset import seed.ndjson production --replace
// ============================================================
import { writeFileSync } from 'node:fs'

const docs = []
const push = (d) => docs.push(d)
const cat = { '--accent': 'yoga', '--text': 'pilates', '--text-muted': 'bienetre' }

// ── PARAMÈTRES DU SITE (singleton) ───────────────────────────
push({
  _id: 'siteSettings',
  _type: 'settings',
  adresse: 'Route du Village 1A, 2ème étage, 1066 Épalinges',
  telephone: '+41 78 810 64 64',
  email: 'hello@amarte.ch',
  instagram: 'https://www.instagram.com/amarte_epalinges/',
  facebook: 'https://www.facebook.com/AmarteEpalinges',
  glofoxBranchId: '66cca39faa7ce5d29003a6e3',
  horairesOuverture: [
    { _key: 'h1', jours: 'Lundi – Vendredi', heures: '08:30 – 20:30' },
    { _key: 'h2', jours: 'Samedi',           heures: '09:00 – 13:00' },
    { _key: 'h3', jours: 'Dimanche',         heures: '09:00 – 19:00' },
  ],
})

// ── TÉMOIGNAGES ──────────────────────────────────────────────
const temoignages = [
  { texte: "Une expérience fantastique. L'accueil est chaleureux, l'espace est spacieux et les installations sont entièrement neuves. Je me sens vraiment chez moi.", auteur: 'Sophie M.', detail: 'Membre depuis 6 mois · Yoga Flow' },
  { texte: "J'avais peur de ne pas être au niveau. Mais les enseignants proposent toujours des adaptations. Pour la première fois, j'ai trouvé un cours vraiment accessible.", auteur: 'Laurent D.', detail: 'Membre depuis 3 mois · Pilates' },
  { texte: "Ce que j'apprécie chez Amarte, c'est l'absence de compétition. On vient pour soi, pas pour performer. Cette ambiance est rare.", auteur: 'Nathalie R.', detail: 'Membre depuis 1 an · Tous cours' },
  { texte: "J'ai commencé avec le pack Découverte. Deux semaines plus tard, j'ai pris l'abonnement mensuel. Amarte m'a redonné le goût du mouvement.", auteur: 'Isabelle C.', detail: 'Membre depuis 8 mois · Yoga & Bien-être' },
]
temoignages.forEach((t, i) => push({
  _id: `temoignage-${i + 1}`, _type: 'temoignage', ...t, ordre: i + 1, actif: true,
}))

// ── HORAIRES (planning hebdomadaire) ─────────────────────────
const J = (jour, jourOrdre, slots) => slots.forEach((s, i) => push({
  _id: `horaire-${jour.toLowerCase()}-${i + 1}`,
  _type: 'horaire',
  jour, jourOrdre,
  heure: s.h, nom: s.n, duree: '60 min', categorie: s.c, actif: true,
}))
J('Lundi', 1, [
  { h: '09:30', n: 'Hatha Flow', c: 'yoga' },
  { h: '18:30', n: 'Yoga Flow', c: 'yoga' },
])
J('Mardi', 2, [
  { h: '09:00', n: 'Yogilates', c: 'yoga' },
  { h: '18:30', n: 'Pilates — Tonus', c: 'pilates' },
  { h: '20:00', n: 'Étirement & Méditation', c: 'bienetre' },
])
J('Mercredi', 3, [
  { h: '09:30', n: 'Pilates — F&A', c: 'pilates' },
  { h: '18:30', n: 'Yin Yoga', c: 'yoga' },
])
J('Jeudi', 4, [
  { h: '09:30', n: 'Nia Doux', c: 'bienetre' },
  { h: '18:30', n: 'Pilates — F&F', c: 'pilates' },
])
J('Vendredi', 5, [
  { h: '09:00', n: 'Kundalini Yoga', c: 'yoga' },
])
J('Dimanche', 7, [
  { h: '18:30', n: 'Pilates — Tonus', c: 'pilates' },
])

// ── COURS (page cours.html) ──────────────────────────────────
const cours = [
  { titre: 'Hatha Flow', sousTitre: 'Yoga profond & présence', categorie: 'yoga', description: 'Respiration consciente et postures tenues pour ancrer la pratique et renforcer la concentration.', niveau: 'Tous niveaux', joursHoraires: 'Lundi · 9h30', tags: ['60 min', 'Tous niveaux'] },
  { titre: 'Yoga Flow', sousTitre: 'Harmonie & centrage', categorie: 'yoga', description: "Postures enchaînées au rythme du souffle. Libère les tensions, restaure l'énergie.", niveau: 'Tous niveaux', joursHoraires: 'Lundi · 18h30', tags: ['60 min', 'Tous niveaux'] },
  { titre: 'Yogilates', sousTitre: 'Core & Flow', categorie: 'yoga', description: 'Fusion yoga + Pilates : renforcement du centre, fluidité, étirement.', niveau: 'Tous niveaux', joursHoraires: 'Mardi · 9h00', tags: ['60 min', 'Tous niveaux'] },
  { titre: 'Yin Yoga', sousTitre: 'Détente & lâcher-prise', categorie: 'yoga', description: 'Postures longues pour libérer les fascias et apaiser le système nerveux.', niveau: 'Tous niveaux', joursHoraires: 'Mercredi · 18h30', tags: ['60 min', 'Doux'] },
  { titre: 'Kundalini Yoga', sousTitre: 'Énergie & expansion', categorie: 'yoga', description: "Postures dynamiques, respiration, mantras et méditation. Réveille l'énergie vitale.", niveau: 'Tous niveaux', joursHoraires: 'Vendredi · 9h00', tags: ['60 min', 'Tous niveaux'] },
  { titre: 'Pilates — Tonus profonds', sousTitre: 'Méthode Pilates consciente', categorie: 'pilates', description: 'Précision et conscience corporelle. Muscles profonds, stabilité, alignement postural.', niveau: 'Tous niveaux', joursHoraires: 'Mardi · 18h30', tags: ['60 min', 'Tous niveaux'] },
  { titre: 'Pilates — Force & Alignement', sousTitre: 'Renforcement du centre', categorie: 'pilates', description: 'Gainage, équilibre et alignement de la colonne. Force fonctionnelle pour le quotidien.', niveau: 'Tous niveaux', joursHoraires: 'Mercredi · 9h30', tags: ['60 min', 'Tous niveaux'] },
  { titre: 'Pilates — Force & Fluidité', sousTitre: 'Renforcement global', categorie: 'pilates', description: 'Pilates classique + enchaînements fluides. Force globale, mobilité, légèreté.', niveau: 'Intermédiaire', joursHoraires: 'Jeudi · 18h30', tags: ['60 min', 'Intermédiaire'] },
  { titre: 'Pilates — Tonus profonds (dim.)', sousTitre: 'Méthode Pilates', categorie: 'pilates', description: 'Travail en profondeur : muscles posturaux, transverse, plancher pelvien.', niveau: 'Tous niveaux', joursHoraires: 'Dimanche · 18h30', tags: ['60 min', 'Tous niveaux'] },
  { titre: 'Nia Doux', sousTitre: 'Mouvement & joie', categorie: 'bienetre', description: 'Danse libre, arts martiaux et techniques corporelles. Libère les tensions, réveille la vitalité.', niveau: 'Tous niveaux', joursHoraires: 'Jeudi · 9h30', tags: ['60 min', 'Tous niveaux'] },
  { titre: 'Étirement doux & Méditation', sousTitre: 'Souplesse & apaisement', categorie: 'bienetre', description: 'Étirements actifs puis méditation guidée. Idéal avant une nuit réparatrice.', niveau: 'Tous niveaux', joursHoraires: 'Mardi · 20h00', tags: ['60 min', 'Doux'] },
]
cours.forEach((c, i) => push({ _id: `cours-${i + 1}`, _type: 'cours', ...c, ordre: i + 1, actif: true }))

// ── TARIFS ───────────────────────────────────────────────────
const tarifs = [
  // Abonnements illimités
  { nom: '1 mois illimité', sousTitre: 'Pour installer la routine.', type: 'illimite', prix: 180, prixParCours: 180, recommande: false, aucunRenouvellement: true },
  { nom: '3 mois illimités', sousTitre: 'Le temps où le corps se transforme.', type: 'illimite', prix: 460, prixParCours: 153, recommande: true, aucunRenouvellement: true },
  { nom: '6 mois illimités', sousTitre: 'Un bien-être durable.', type: 'illimite', prix: 840, prixParCours: 140, recommande: false, aucunRenouvellement: true },
  { nom: '1 an illimité', sousTitre: "Une nouvelle façon d'habiter son corps.", type: 'illimite', prix: 1490, prixParCours: 124, recommande: false, aucunRenouvellement: true },
  // Pack Découverte
  { nom: 'Pack Découverte', sousTitre: '3 cours · valable 2 mois', type: 'decouverte', prix: 60, recommande: false, aucunRenouvellement: false },
  // Packs de cours
  { nom: 'Cours unique', sousTitre: '1 crédit · valable 1 mois', type: 'pack', prix: 30, recommande: false, aucunRenouvellement: false },
  { nom: 'Pack 5 cours', sousTitre: '5 crédits · valable 3 mois', type: 'pack', prix: 140, recommande: false, aucunRenouvellement: false },
  { nom: 'Pack 10 cours', sousTitre: '10 crédits · valable 6 mois', type: 'pack', prix: 260, recommande: false, aucunRenouvellement: false },
  { nom: 'Pack 20 cours', sousTitre: '20 crédits · valable 12 mois', type: 'pack', prix: 500, recommande: false, aucunRenouvellement: false },
]
tarifs.forEach((t, i) => push({ _id: `tarif-${i + 1}`, _type: 'tarif', ...t, ordre: i + 1, actif: true }))

// ── ÉCRITURE ─────────────────────────────────────────────────
const ndjson = docs.map((d) => JSON.stringify(d)).join('\n') + '\n'
writeFileSync(new URL('./seed.ndjson', import.meta.url), ndjson)
console.log(`✓ seed.ndjson généré — ${docs.length} documents`)
