<?php
/* ============================================================
   AMARTE STUDIO — Réception des formulaires de contact

   Reçoit les envois de contact.html et location.html, puis
   expédie le message sur la boîte du studio via le serveur mail
   de l'hébergement. Aucun service tiers, aucun abonnement.

   Le formulaire est envoyé en fetch() par js/main.js, qui attend
   une réponse JSON et un statut HTTP 2xx.

   Le tri du spam est délégué à spam-filter.php, qui rend un
   verdict et ne dit rien d'autre : un message écarté reçoit
   exactement la même réponse qu'un message accepté.

   Réglages : voir la section CONFIGURATION ci-dessous, et le haut
   de spam-filter.php pour ceux du filtre.
   ============================================================ */

/* ── CONFIGURATION ────────────────────────────────────────── */

// Destinataire des messages.
const DEST = 'hello@amarte.ch';

// Expéditeur technique. DOIT être une adresse du domaine hébergé
// ici, sinon le message part en spam (SPF/DKIM ne valident plus).
// Ne jamais mettre l'adresse du visiteur ici : elle va en Reply-To.
const FROM_MAIL = 'hello@amarte.ch';
const FROM_NOM  = 'Site Amarte';

// Le filtre antispam : cinq couches, décrites dans son en-tête.
// La constante ci-dessous lui sert de garde — il refuse de
// s'exécuter si on l'appelle directement depuis un navigateur.
define('AMARTE_ANTISPAM', true);
require __DIR__ . '/spam-filter.php';


/* ── RÉPONSE JSON ─────────────────────────────────────────── */
header('Content-Type: application/json; charset=utf-8');

function repondre(int $code, string $message): void {
    http_response_code($code);
    echo json_encode(['ok' => $code < 400, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    repondre(405, 'Méthode non autorisée.');
}


/* ── CHAMPS ATTENDUS ──────────────────────────────────────── */
// Les deux formulaires n'ont pas les mêmes champs : on liste
// l'union des deux et on n'affiche que ceux qui sont remplis.
$champs = [
    'prenom'              => 'Prénom',
    'nom'                 => 'Nom',
    'email'               => 'E-mail',
    'telephone'           => 'Téléphone',
    // contact.html
    'sujet'               => 'Sujet',
    // location.html — la date et les horaires sont obligatoires
    // côté formulaire : une demande sans eux est inexploitable.
    'type'                => 'Type d’utilisation',
    'date'                => 'Date souhaitée',
    'heure_entree'        => 'Heure d’entrée',
    'heure_sortie'        => 'Heure de sortie',
    'participants'        => 'Participants',
    'adresse_facturation' => 'Adresse de facturation',
    // commun
    'message'             => 'Message',
];

$valeurs = [];
foreach ($champs as $cle => $_) {
    $brut = $_POST[$cle] ?? '';
    if (!is_string($brut)) continue;
    // 5000 caractères : large pour un message, borné contre l'abus.
    $valeurs[$cle] = trim(mb_substr($brut, 0, 5000));
}

// Champs obligatoires communs aux deux formulaires.
foreach (['prenom', 'nom', 'email'] as $requis) {
    if ($valeurs[$requis] === '') {
        repondre(422, 'Merci de remplir les champs obligatoires.');
    }
}

$email = $valeurs['email'];
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    repondre(422, 'Adresse e-mail invalide.');
}


/* ── VERDICT ANTISPAM ─────────────────────────────────────── */
// Les champs courts sont examinés à part : une adresse web dans
// un nom ou dans un numéro de téléphone n'arrive jamais chez un
// vrai visiteur.
$courts = [];
foreach (['prenom', 'nom', 'telephone', 'sujet', 'type', 'participants'] as $cle) {
    if ($valeurs[$cle] !== '') $courts[$champs[$cle]] = $valeurs[$cle];
}

$verdict = as_verdict([
    'message'       => $valeurs['message'],
    'email'         => $email,
    'champs_courts' => $courts,
    // Deux champs pièges : l'historique `site_web` et `website`,
    // que les robots remplissent presque par réflexe.
    'pieges'        => [
        'site_web' => $_POST['site_web'] ?? '',
        'website'  => $_POST['website']  ?? '',
    ],
    'jeton'         => $_POST['jeton'] ?? '',
    'turnstile'     => $_POST['cf-turnstile-response'] ?? '',
]);

$ip = $verdict['ip'];

// Réponse strictement identique à celle d'un envoi réussi. Un
// robot qui apprend ce qui l'a fait échouer réécrit son message
// et revient ; la raison du refus est dans le journal, pas ici.
if (!$verdict['accepte']) {
    repondre(200, 'Message reçu.');
}


/* ── CONSTRUCTION DU MESSAGE ──────────────────────────────── */

$origine = (string)($_POST['origine'] ?? 'Site');
// Une valeur d'en-tête ne doit jamais contenir de retour à la
// ligne : ce serait une injection d'en-tête SMTP.
$nettoyer = fn(string $v): string => trim(str_replace(["\r", "\n", "\0"], ' ', $v));

$origine = mb_substr($nettoyer($origine), 0, 60);
$expediteur = $nettoyer($valeurs['prenom'] . ' ' . $valeurs['nom']);

$sujet = sprintf('[%s] %s', $origine, $expediteur);

$corps = "Nouveau message depuis le site amarte.ch\n";
$corps .= str_repeat('─', 46) . "\n\n";
foreach ($champs as $cle => $libelle) {
    if ($valeurs[$cle] === '') continue;
    $corps .= $libelle . " :\n" . $valeurs[$cle] . "\n\n";
}
$corps .= str_repeat('─', 46) . "\n";
$corps .= 'Page      : ' . $nettoyer((string)($_SERVER['HTTP_REFERER'] ?? '—')) . "\n";
$corps .= 'Reçu le   : ' . date('d.m.Y à H:i') . "\n";
$corps .= 'IP        : ' . $ip . "\n";
// Le score du filtre antispam, pour juger sur pièces si un
// message douteux passe : plus il est proche de 7, plus il a
// déclenché de signaux.
$corps .= 'Antispam  : ' . $verdict['score'] . '/' . AS_SEUIL;
$corps .= $verdict['raisons'] ? ' — ' . implode(' ; ', $verdict['raisons']) : ' — aucun signal';
$corps .= "\n";

$entetes = implode("\r\n", [
    'From: ' . sprintf('=?UTF-8?B?%s?= <%s>', base64_encode(FROM_NOM), FROM_MAIL),
    // Répondre au message écrit directement à la personne.
    // FILTER_VALIDATE_EMAIL refuse déjà les retours à la ligne ;
    // on repasse quand même l'adresse au nettoyeur, pour que la
    // règle « rien d'insaisi dans un en-tête » n'ait pas
    // d'exception à retenir.
    'Reply-To: ' . sprintf('=?UTF-8?B?%s?= <%s>', base64_encode($expediteur), $nettoyer($email)),
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'MIME-Version: 1.0',
    'X-Mailer: amarte-site',
]);

$sujetEncode = '=?UTF-8?B?' . base64_encode($sujet) . '?=';

// Le 5e paramètre fixe l'enveloppe d'expédition (Return-Path) :
// sans lui, Exim utilise l'utilisateur système et la délivrabilité
// s'en ressent.
$envoye = mail(DEST, $sujetEncode, $corps, $entetes, '-f' . FROM_MAIL);

if (!$envoye) {
    error_log('[amarte-contact] échec de mail() pour ' . $email);
    repondre(500, "L'envoi a échoué. Écrivez-nous à " . DEST . '.');
}

repondre(200, 'Message reçu.');
