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
  adresse:    'Route du Village 1A, 2ème étage, 1066 Épalinges',
  telephone:  '+41 79 462 17 47',
  telephone2: '+41 78 810 64 64',
  email:      'info@amarte.ch',
  tagline:    "Bouger. Respirer. *S'épanouir.*",
  instagram:  'https://www.instagram.com/amarte_epalinges/',
  facebook:   'https://www.facebook.com/AmarteEpalinges',
  glofoxBranchId:      '66cca39faa7ce5d29003a6e3',
  glofoxUrlReservation:'https://app.glofox.com/portal/#/branch/66cca39faa7ce5d29003a6e3/classes-week-view?header=classes&gt=GTM-K4MSN7T3',
  glofoxUrlMembership: 'https://app.glofox.com/portal/#/branch/66cca39faa7ce5d29003a6e3/memberships?header=memberships&gt=GTM-K4MSN7T3',
  glofoxUrlLogin:      'https://app.glofox.com/portal/#/branch/66cca39faa7ce5d29003a6e3/memberships?login',
  horairesOuverture: [
    { _key: 'h1', jours: 'Lundi – Vendredi', heures: '8h00 – 20h00' },
    { _key: 'h2', jours: 'Samedi',           heures: '8h00 – 17h00' },
    { _key: 'h3', jours: 'Dimanche',         heures: 'Fermé' },
  ],
})

// ── HÉROS DES PAGES (1 doc par page, hors index) ─────────────
const heros = [
  { page: 'apropos',       label: 'Le studio',                titre: 'Un lieu pour\nrevenir au mouvement.', sousTitre: "Amarte est né d'une idée simple : offrir un espace où chacun peut bouger, respirer et *s'épanouir* — à son rythme, sans jugement." },
  { page: 'cours',         label: 'Cours & disciplines',      titre: 'Nos *cours*',                          sousTitre: '11 cours hebdomadaires — Yoga, Pilates, Bien-être.\nUne pratique pour chaque intention, un accueil pour chaque niveau.' },
  { page: 'tarifs',        label: 'Tarifs & formules',        titre: 'À votre\n*rythme.*',                   sousTitre: "Pas de renouvellement automatique, jamais. Vous continuez parce que vous le voulez, pas parce qu'on vous y oblige." },
  { page: 'calendrier',    label: 'Planning',                  titre: 'Calendrier',                           sousTitre: 'Consultez le planning de la semaine et réservez votre place en ligne. *Les disponibilités se mettent à jour en temps réel.*' },
  { page: 'contact',       label: 'Contact',                   titre: 'Venez nous\nrendre visite.',           sousTitre: "Une question, une demande d'information ou envie de commencer ? *Nous sommes là.*" },
  { page: 'location',      label: "Location d'espace",        titre: 'Notre salle,\nvotre projet.',          sousTitre: 'Un espace lumineux de 120 m² avec baie vitrée en arc de cercle, *disponible à la location pour vos cours, ateliers et événements bien-être.*' },
  { page: 'corpo',         label: 'Entreprises & Partenariats', titre: 'Bien-être\nen entreprise',           sousTitre: "Parce qu'une équipe qui se sent bien *performe mieux.* Nous concevons des programmes sur mesure pour les entreprises de la région." },
  { page: 'premiere-fois', label: 'Studio bien-être · Épalinges', titre: 'Force. Souplesse.\nMobilité.',     sousTitre: 'Un mois pour retrouver un corps plus fort, plus souple, plus libre — celui qui vous portera longtemps. Découvrez le Défi, et nos deux garanties, dans la vidéo.' },
]
heros.forEach((h) => push({ _id: `pageHero-${h.page}`, _type: 'pageHero', ...h }))

// ── INFO CARDS — Calendrier (3), Cours (3), Contact accès (4) ─
const infoCards = [
  // cal-info — 3 cards numérotées 01/02/03 sur calendrier.html
  { groupe: 'cal-info', titre: 'Réservation en ligne', texte: 'Choisissez votre cours et confirmez en quelques secondes. Confirmation immédiate par email.', ordre: 1 },
  { groupe: 'cal-info', titre: 'Annulation flexible',  texte: "Annulation gratuite jusqu'à 2 h avant le cours. Au-delà, le crédit est consommé.",          ordre: 2 },
  { groupe: 'cal-info', titre: 'Places limitées',      texte: "Nombre de places restreint pour garantir l'attention individuelle. Réservez à l'avance.",  ordre: 3 },
  // cours-know — 3 cards « Bon à savoir » sur cours.html (les icônes SVG restent en HTML statique)
  { groupe: 'cours-know', titre: 'En petit comité',      texte: '15 personnes max par cours — de la place pour être vu, guidé, corrigé.', ordre: 1 },
  { groupe: 'cours-know', titre: 'Matériel fourni',      texte: 'Tapis et accessoires sur place. Venez simplement en tenue confortable.', ordre: 2 },
  { groupe: 'cours-know', titre: 'Guidé à votre niveau', texte: "Débutant ou confirmé, les profs s'adaptent à vos limites du jour.",    ordre: 3 },
  // contact-access — 4 items « Accès & Transport » sur contact.html
  { groupe: 'contact-access', titre: 'Parking souterrain gratuit', ordre: 1 },
  { groupe: 'contact-access', titre: 'Places extérieures',         ordre: 2 },
  { groupe: 'contact-access', titre: 'Bus Girarde à 20 m',         ordre: 3 },
  { groupe: 'contact-access', titre: 'Abri vélo sécurisé',         ordre: 4 },
]
infoCards.forEach((c, i) => push({
  _id: `infoCard-${c.groupe}-${c.ordre}`,
  _type: 'infoCard', actif: true, ...c,
}))

// ── TÉMOIGNAGES — grille de 12 cartes sur la homepage ────────
const temoignages = [
  { texte: "Après quelques mois de Pilates, je me sens très en forme, avec beaucoup plus de flexibilité et d'énergie. Je recommande à tout le monde. Merci Amarte.", auteur: 'Maria Martha', detail: 'Pilates · membre' },
  { texte: "Débutante, j'ai tout de suite accroché au Yoga Flow avec Edith et Yuta : ma rigidité diminue. Et le Pilates renforce mon dos. Très motivée pour continuer.", auteur: 'Beatriz', detail: 'Yoga & Pilates · +3 mois' },
  { texte: "Une activité hebdomadaire dynamique, relaxante et saine. Une façon agréable de développer la force, la flexibilité et l'équilibre.", auteur: 'Marianne', detail: 'Yoga Flow · membre' },
  { texte: "Une super salle, avec une variété de profs qui permet d'adapter à sa forme. Moins de douleurs, et une forme physique en nette amélioration.", auteur: 'Jonathan', detail: 'Pilates · 1 mois' },
  { texte: "Le Pilates a été une très belle découverte. J'ai gagné en force et en conscience corporelle grâce aux explications de Yuta. Un lieu que je recommande sans hésitation.", auteur: 'Lise', detail: 'Pilates & Yoga · 1 mois' },
  { texte: "Des cours dans une ambiance solaire et bienveillante, dans le respect du corps et des capacités de chacun. Une équipe très à l'écoute.", auteur: 'Marine', detail: 'Yoga & Pilates · membre' },
  { texte: "Un choix de cours variés et accessibles aux débutants, avec des horaires pratiques — et un parking ! Un endroit unique à Lausanne, à essayer absolument.", auteur: 'Alice', detail: 'Plusieurs disciplines · membre' },
  { texte: "Un espace confortable, bien équipé, facile d'accès. Un joli choix de professeurs qualifiés en yoga et pilates, à prix raisonnable.", auteur: 'Julio', detail: 'Yoga & Pilates · membre' },
  { texte: "Je pensais que le yoga n'était pas fait pour moi, trop calme. Grâce à Amarte : moins de douleurs chroniques au dos et un bien meilleur sommeil.", auteur: 'Khanh', detail: 'Yoga Flow · membre' },
  { texte: "Un studio bien situé où l'on se sent chez soi, avec une palette de cours fabuleux. Mon cours préféré : le Kundalini avec Kallia.", auteur: 'Marielle', detail: 'Kundalini · membre' },
  { texte: "Super expérience ! Tout est simple et fluide, de l'inscription aux cours. Le centre est vraiment facile d'accès.", auteur: 'Lorène', detail: 'Nouvelle membre' },
  { texte: "On se sent tout de suite dans un vrai cocon, chaleureux et apaisant. Les professeurs sont à l'écoute et de qualité.", auteur: 'Robin', detail: 'Membre' },
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
