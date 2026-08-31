<?php
/* ============================================================
   AMARTE STUDIO — Banc d'essai du filtre antispam

   Usage :  php outils/tester-antispam.php

   Fait passer le filtre sur des messages réels — du spam reçu
   sur nos sites d'un côté, des demandes de vrais prospects de
   l'autre — et affiche le score de chacun.

   La règle de lecture : un seul cas légitime bloqué est un
   échec, même si tout le spam est arrêté. Un faux positif coûte
   un client ; un faux négatif coûte une seconde de suppression.

   Ce fichier n'est pas déployé (le dossier outils/ est exclu de
   l'envoi FTP), il ne sert qu'au moment de toucher au filtre.
   ============================================================ */

define('AMARTE_ANTISPAM', true);
require dirname(__DIR__) . '/spam-filter.php';

/* Le filtre lit la provenance dans $_SERVER : on simule ici un
   navigateur normal, page du site à l'appui. */
$_SERVER['HTTP_HOST'] = 'amarte.ch';

/** Jeton valide, daté d'il y a $age secondes. */
function jeton(int $age): string {
    $secondes = time() - $age;
    return $secondes . '.' . as_signature($secondes);
}

/**
 * Un cas de test. `attendu` vaut 'bloque' ou 'passe'.
 * `jeton` : un âge en secondes, ou null pour un envoi sans
 * JavaScript (le jeton est alors absent).
 */
function cas(string $nom, string $attendu, array $donnees): array {
    return $donnees + ['nom' => $nom, 'attendu' => $attendu];
}

$cas = [

    /* ── Doivent être bloqués ──────────────────────────────── */

    cas('Spam « Larrynes » (avec jeton)', 'bloque', [
        'message' => 'Get ready to win with a $25,000 promo code https://cut.gl/NoSNR',
        'courts'  => ['Prénom' => 'Larrynes', 'Nom' => 'Larrynes'],
        'jeton'   => 30,
    ]),

    cas('Spam « Larrynes » (POST direct, sans jeton)', 'bloque', [
        'message'  => 'Get ready to win with a $25,000 promo code https://cut.gl/NoSNR',
        'courts'   => ['Prénom' => 'Larrynes', 'Nom' => 'Larrynes'],
        'jeton'    => null,
        'sans_ref' => true,
    ]),

    cas('Spam SEO / backlinks', 'bloque', [
        'message'  => 'Hello, we can boost your website ranking with 5000 quality '
                    . 'backlinks. Our seo services start at $99. See https://seo-boost.xyz/offer',
        'courts'   => ['Prénom' => 'Mike', 'Nom' => 'Johnson'],
        'jeton'    => null,
        'sans_ref' => true,
    ]),

    cas('Spam avec raccourcisseur d’URL', 'bloque', [
        'message' => 'Hi, check this amazing offer for you: bit.ly/2xKq9Zp — limited time offer!',
        'courts'  => ['Prénom' => 'Anna', 'Nom' => 'Smith'],
        'jeton'   => 45,
    ]),

    cas('Formulaire posté depuis un autre domaine', 'bloque', [
        'message' => 'Bonjour, je souhaiterais des informations sur vos cours de yoga.',
        'courts'  => ['Prénom' => 'Marie', 'Nom' => 'Dupont'],
        'jeton'   => 60,
        'origine' => 'https://spam-farm.example',
    ]),

    cas('Lien planqué dans le champ Nom', 'bloque', [
        'message' => 'Best rates guaranteed, contact us today for your website.',
        'courts'  => ['Prénom' => 'Alex', 'Nom' => 'www.cheap-pills.top'],
        'jeton'   => null,
    ]),

    cas('Trois domaines dans un même message', 'bloque', [
        'message' => 'Visit https://one.example.com and https://two.example.net and three.example.org',
        'courts'  => ['Prénom' => 'Bot', 'Nom' => 'Net'],
        'jeton'   => 20,
    ]),

    cas('Formulaire rempli en 1 seconde', 'bloque', [
        'message' => 'Crypto investment opportunity, earn money fast with bitcoin.',
        'courts'  => ['Prénom' => 'Ivan', 'Nom' => 'Petrov'],
        'jeton'   => 1,
    ]),

    /* ── Doivent passer ────────────────────────────────────── */

    cas('Demande de devis classique', 'passe', [
        'message' => 'Bonjour, je souhaiterais organiser un atelier de yoga pour '
                   . '12 personnes un samedi de mars. Pourriez-vous me communiquer '
                   . 'vos disponibilités et un devis ? Merci d’avance.',
        'courts'  => ['Prénom' => 'Marie', 'Nom' => 'Dupont', 'Sujet' => 'Location de la salle'],
        'jeton'   => 95,
    ]),

    cas('Prospect qui donne l’adresse de son site', 'passe', [
        'message' => 'Bonjour, notre site est https://boulangerie-durand.ch et nous '
                   . 'aimerions une refonte. Peut-on en discuter cette semaine ?',
        'courts'  => ['Prénom' => 'Julien', 'Nom' => 'Durand'],
        'jeton'   => 120,
    ]),

    cas('Message court mais réel', 'passe', [
        'message' => 'Bonjour, on peut se voir cette semaine ?',
        'courts'  => ['Prénom' => 'Sophie', 'Nom' => 'Martin'],
        'jeton'   => 40,
    ]),

    cas('Message très court (moins de 20 caractères)', 'passe', [
        'message' => 'Vous êtes ouverts ?',
        'courts'  => ['Prénom' => 'Luc', 'Nom' => 'Blanc'],
        'jeton'   => 25,
    ]),

    cas('Client étranger, message en anglais', 'passe', [
        'message' => 'Hello, I am visiting Lausanne next month and would like to join '
                   . 'a pilates class. Do you have sessions in English?',
        'courts'  => ['Prénom' => 'Sarah', 'Nom' => 'Miller'],
        'jeton'   => 70,
    ]),

    cas('Envoi sans JavaScript, avec un lien', 'passe', [
        'message' => 'Bonjour, je gère le studio https://mon-studio-partenaire.ch et '
                   . 'j’aimerais vous proposer une collaboration. Bien à vous.',
        'courts'  => ['Prénom' => 'Claire', 'Nom' => 'Favre'],
        'jeton'   => null,
    ]),

    cas('Ponctuation française sans espace après le point', 'passe', [
        'message' => 'Bonjour.Je voudrais réserver la salle mardi.Merci beaucoup.'
                   . 'Vous êtes libres.Ou pas ?',
        'courts'  => ['Prénom' => 'Anne', 'Nom' => 'Rochat'],
        'jeton'   => 55,
    ]),

    cas('Prospect qui cite notre propre site', 'passe', [
        'message' => 'J’ai vu sur https://amarte.ch/tarifs que vous proposez des '
                   . 'abonnements. Est-ce que la formule 10 séances est encore valable ?',
        'courts'  => ['Prénom' => 'Nadia', 'Nom' => 'Berset'],
        'jeton'   => 80,
    ]),

    cas('Message avec une adresse e-mail', 'passe', [
        'message' => 'Bonjour, merci d’écrire plutôt à mon assistante '
                   . 'assistante@grande-entreprise.com pour la suite du dossier.',
        'courts'  => ['Prénom' => 'Pierre', 'Nom' => 'Nicolet'],
        'jeton'   => 65,
    ]),
];

/* ── Exécution ─────────────────────────────────────────────── */

printf("%-46s %6s %8s %8s  %s\n", 'CAS', 'SCORE', 'ATTENDU', 'OBTENU', 'RAISONS');
echo str_repeat('─', 130), "\n";

$echecs = 0;

foreach ($cas as $c) {
    // Provenance : par défaut, la page de contact du site.
    unset($_SERVER['HTTP_ORIGIN'], $_SERVER['HTTP_REFERER']);
    if (!empty($c['origine'])) {
        $_SERVER['HTTP_ORIGIN'] = $c['origine'];
    } elseif (empty($c['sans_ref'])) {
        $_SERVER['HTTP_REFERER'] = 'https://amarte.ch/contact';
    }

    $analyse = as_analyser([
        'message'        => $c['message'],
        'champs_courts'  => $c['courts'],
        'age_formulaire' => $c['jeton'] === null ? null : (int)$c['jeton'],
    ]);

    $bloque = $analyse['bloquant'] || $analyse['score'] >= AS_SEUIL;
    $obtenu = $bloque ? 'bloque' : 'passe';
    $ok = $obtenu === $c['attendu'];
    if (!$ok) $echecs++;

    printf(
        "%-46s %6s %8s %8s  %s\n",
        mb_strimwidth($c['nom'], 0, 45, '…'),
        $analyse['bloquant'] ? 'BLOQ' : $analyse['score'],
        $c['attendu'],
        ($ok ? '✔ ' : '✘ ') . $obtenu,
        implode(' ; ', $analyse['raisons']) ?: '—'
    );
}

echo str_repeat('─', 130), "\n";
echo "Seuil de blocage : ", AS_SEUIL, " points.\n";

if ($echecs === 0) {
    echo "✅ Les ", count($cas), " cas se comportent comme prévu.\n";
    exit(0);
}

echo "❌ $echecs cas sur ", count($cas), " ne se comportent pas comme prévu.\n";
exit(1);
