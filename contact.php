<?php
/* ============================================================
   AMARTE STUDIO — Réception des formulaires de contact

   Reçoit les envois de contact.html et location.html, puis
   expédie le message sur la boîte du studio via le serveur mail
   de l'hébergement. Aucun service tiers, aucun abonnement.

   Le formulaire est envoyé en fetch() par js/main.js, qui attend
   une réponse JSON et un statut HTTP 2xx.

   Réglages : voir la section CONFIGURATION ci-dessous.
   ============================================================ */

/* ── CONFIGURATION ────────────────────────────────────────── */

// Destinataire des messages.
const DEST = 'info@amarte.ch';

// Expéditeur technique. DOIT être une adresse du domaine hébergé
// ici, sinon le message part en spam (SPF/DKIM ne valident plus).
// Ne jamais mettre l'adresse du visiteur ici : elle va en Reply-To.
const FROM_MAIL = 'info@amarte.ch';
const FROM_NOM  = 'Site Amarte';

// Nombre maximum d'envois par adresse IP et par heure.
const MAX_PAR_HEURE = 5;


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


/* ── ANTI-SPAM ────────────────────────────────────────────── */

// Champ piège, invisible pour un humain : seul un robot le remplit.
// On renvoie un succès pour ne pas lui signaler qu'il est détecté.
if (trim((string)($_POST['site_web'] ?? '')) !== '') {
    repondre(200, 'Message reçu.');
}

// Limitation par IP : évite qu'un robot inonde la boîte mail.
$ip      = (string)($_SERVER['REMOTE_ADDR'] ?? 'inconnue');
$fichier = sys_get_temp_dir() . '/amarte-contact-' . md5($ip) . '.txt';
$envois  = [];
if (is_readable($fichier)) {
    $envois = array_filter(
        explode("\n", (string)file_get_contents($fichier)),
        fn($t) => is_numeric($t) && (time() - (int)$t) < 3600
    );
}
if (count($envois) >= MAX_PAR_HEURE) {
    repondre(429, 'Trop de messages envoyés. Réessayez dans une heure.');
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

$entetes = implode("\r\n", [
    'From: ' . sprintf('=?UTF-8?B?%s?= <%s>', base64_encode(FROM_NOM), FROM_MAIL),
    // Répondre au message écrit directement à la personne.
    'Reply-To: ' . sprintf('=?UTF-8?B?%s?= <%s>', base64_encode($expediteur), $email),
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

$envois[] = (string)time();
@file_put_contents($fichier, implode("\n", $envois), LOCK_EX);

repondre(200, 'Message reçu.');
