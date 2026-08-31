<?php
/* ============================================================
   AMARTE STUDIO — Filtre antispam du formulaire de contact

   Inclus par contact.php. Ne s'exécute jamais seul : une requête
   web directe sur ce fichier tombe sur un 404.

   Pourquoi ce fichier existe : les robots qui polluent les
   formulaires ne chargent pas la page. Ils envoient un POST
   directement sur le script d'envoi, à partir d'une liste
   d'adresses. Un simple champ piège ne les arrête donc pas — le
   piège est dans le HTML, qu'ils ne lisent jamais.

   Le principe directeur est le contraire d'un pare-feu :
   ON NE PERD JAMAIS UN VRAI MESSAGE. Chaque signal ajoute des
   points, aucun signal ne suffit à lui seul (sauf deux cas
   franchement impossibles pour un humain), et en cas de doute
   on laisse passer. Un faux positif coûte un client ; un faux
   négatif coûte une seconde de suppression.

   Réglages : voir la section CONFIGURATION ci-dessous.
   ============================================================ */

// Ce fichier n'a rien à répondre à un navigateur : seul
// contact.php a le droit de l'inclure.
if (!defined('AMARTE_ANTISPAM')) {
    http_response_code(404);
    exit;
}


/* ── CONFIGURATION ────────────────────────────────────────── */

// Domaine du site. Sert à deux choses : reconnaître un lien vers
// le site lui-même (qui ne doit rien coûter) et refuser un
// formulaire posté depuis un autre domaine. Écrit ici une seule
// fois, jamais en dur dans les fonctions.
const AS_DOMAINE = 'amarte.ch';

// Sel du jeton de page. Doit être identique à celui de js/main.js.
// Le changer invalide les pages déjà ouvertes chez les visiteurs :
// elles perdent 3 points, elles ne sont pas bloquées.
const AS_SEL = 'antispam-v1';

// Au-delà de ce score, le message est écarté. Le plafond de 6 sur
// les mots-clés (AS_PLAFOND_MOTS) est calculé pour rester en
// dessous : des formules seules ne bloquent jamais, il faut
// toujours un second signal.
const AS_SEUIL = 7;

// Temps de remplissage minimum, en secondes. En dessous, c'est
// une machine : personne ne lit et remplit un formulaire en
// moins de trois secondes.
const AS_DELAI_MIN = 3;

// Un jeton plus vieux que ça vient d'un onglet laissé ouvert la
// veille : on le traite comme absent (3 points), pas comme faux.
const AS_JETON_MAX = 86400;

// Limites de fréquence par adresse IP.
const AS_MAX_HEURE = 3;
const AS_MAX_JOUR  = 10;

// Fenêtre de l'anti-doublon, en secondes.
const AS_DOUBLON_FENETRE = 86400;

// Plafond des points attribués aux formules de spam.
const AS_PLAFOND_MOTS = 6;

// Cloudflare Turnstile — désactivé. Renseigner la clé secrète
// ici (ou dans la variable d'environnement AMARTE_TURNSTILE_SECRET)
// suffit à activer la vérification ; tant qu'elle est vide, aucun
// appel réseau n'est fait et le formulaire ne change pas.
const AS_TURNSTILE_SECRET = '';


/* ── STOCKAGE ─────────────────────────────────────────────── */

/**
 * Dossier de travail : compteurs, empreintes et journal.
 *
 * On le cherche d'abord au-dessus de la racine web, hors de
 * portée d'un navigateur et hors du dossier que le déploiement
 * FTP synchronise en supprimant (`mirror --delete` effacerait le
 * contenu à chaque mise en ligne). S'il n'est pas inscriptible,
 * on retombe dans la racine web — protégée par un .htaccess écrit
 * ici même — puis sur le dossier temporaire du système.
 *
 * Renvoie null si rien n'est inscriptible : dans ce cas la limite
 * de fréquence et l'anti-doublon se désactivent d'eux-mêmes.
 * Perdre un compteur est sans gravité ; bloquer les envois
 * légitimes ne l'est pas.
 */
function as_dossier(): ?string {
    static $cache = false;
    if ($cache !== false) return $cache;

    $candidats = [
        dirname(__DIR__) . '/amarte-antispam',
        __DIR__ . '/antispam-donnees',
        sys_get_temp_dir() . '/amarte-antispam',
    ];

    foreach ($candidats as $chemin) {
        if (!is_dir($chemin) && !@mkdir($chemin, 0700, true) && !is_dir($chemin)) {
            continue;
        }
        if (!is_writable($chemin)) continue;

        // Ceinture et bretelles : si le dossier a atterri dans la
        // racine web, Apache doit quand même refuser de le servir.
        $htaccess = $chemin . '/.htaccess';
        if (!file_exists($htaccess)) {
            @file_put_contents($htaccess, "Require all denied\nDeny from all\n");
        }
        return $cache = $chemin;
    }
    return $cache = null;
}

/**
 * Lit un fichier JSON du dossier de travail. Un fichier absent,
 * illisible ou corrompu renvoie un tableau vide : on repart de
 * zéro plutôt que de tomber en erreur.
 */
function as_lire_json(string $nom): array {
    $dossier = as_dossier();
    if ($dossier === null) return [];
    $chemin = $dossier . '/' . $nom;
    if (!is_readable($chemin)) return [];
    $donnees = json_decode((string)@file_get_contents($chemin), true);
    return is_array($donnees) ? $donnees : [];
}

function as_ecrire_json(string $nom, array $donnees): void {
    $dossier = as_dossier();
    if ($dossier === null) return;
    @file_put_contents(
        $dossier . '/' . $nom,
        json_encode($donnees, JSON_UNESCAPED_UNICODE),
        LOCK_EX
    );
}


/* ── ADRESSE IP ───────────────────────────────────────────── */

/**
 * Le site passe par Cloudflare : REMOTE_ADDR est alors l'adresse
 * du relais, la même pour tout le monde. S'en servir pour la
 * limite de fréquence bloquerait le troisième visiteur de l'heure.
 * On prend donc l'adresse réelle transmise par Cloudflare quand
 * elle est là et qu'elle ressemble à une adresse IP.
 */
function as_ip(): string {
    $entetes = ['HTTP_CF_CONNECTING_IP', 'REMOTE_ADDR'];
    foreach ($entetes as $entete) {
        $valeur = trim((string)($_SERVER[$entete] ?? ''));
        if ($valeur !== '' && filter_var($valeur, FILTER_VALIDATE_IP)) {
            return $valeur;
        }
    }
    return 'inconnue';
}


/* ── COUCHE 2 · JETON DE PAGE ─────────────────────────────── */

/**
 * Somme de contrôle d'un horodatage. Hachage 31 sur 32 bits rendu
 * en base 36 — volontairement simple, parce que l'équivalent doit
 * tenir en dix lignes de JavaScript dans js/main.js et donner
 * exactement la même chaîne.
 *
 * Ce n'est pas de la cryptographie et ça n'a pas à l'être : le
 * but n'est pas de résister à quelqu'un qui lit le code du site,
 * c'est de coûter plus cher qu'un POST à l'aveugle. Un robot
 * générique ne l'exécutera jamais.
 */
function as_signature(int $secondes): string {
    $source = AS_SEL . ':' . $secondes;
    $hash = 0;
    $longueur = strlen($source);
    for ($i = 0; $i < $longueur; $i++) {
        $hash = ($hash * 31 + ord($source[$i])) & 0xFFFFFFFF;
    }
    return base_convert((string)$hash, 10, 36);
}

/**
 * Examine le jeton reçu et renvoie l'âge du formulaire en
 * secondes, ou null si le jeton est absent, mal formé, faux,
 * daté du futur ou périmé. Dans tous ces cas c'est traité comme
 * « absent » : un envoi sans JavaScript reste possible.
 */
function as_age_formulaire(string $jeton): ?int {
    if (strpos($jeton, '.') === false) return null;

    [$secondes, $signature] = explode('.', $jeton, 2);
    if (!ctype_digit($secondes)) return null;

    if (!hash_equals(as_signature((int)$secondes), $signature)) return null;

    $age = time() - (int)$secondes;
    // Un jeton daté du futur (horloge du visiteur en avance) ou
    // vieux d'un jour : on ne s'en sert pas, on ne punit pas.
    if ($age < 0 || $age > AS_JETON_MAX) return null;

    return $age;
}


/* ── COUCHE 3 · ANALYSE DU CONTENU ────────────────────────── */

/** Raccourcisseurs d'URL : jamais utilisés par un vrai prospect. */
function as_raccourcisseurs(): array {
    return [
        'cut.gl', 'bit.ly', 'tinyurl.com', 't.co', 'cutt.ly', 'is.gd',
        'rb.gy', 'goo.gl', 'ow.ly', 'buff.ly', 'shorturl.at', 'rebrand.ly',
        't.ly', 'tiny.cc', 'lnkd.in', 'bit.do', 'clck.ru', 'v.gd',
        'soo.gd', 's.id', 'u.to', 'shrtco.de', 'gg.gg', 'urlz.fr',
    ];
}

/** Extensions bradées, très majoritaires dans le spam. */
function as_extensions_risque(): array {
    return [
        'xyz', 'top', 'icu', 'club', 'loan', 'tk', 'ml', 'ga', 'cf', 'gq',
        'work', 'click', 'link', 'buzz', 'bid', 'win', 'date', 'stream',
        'download', 'racing', 'review', 'party', 'science', 'trade',
        'accountant', 'faith', 'cricket', 'men', 'rest', 'monster', 'sbs',
    ];
}

/**
 * Extensions acceptées pour un nom de domaine écrit sans `http://`
 * ni `www.`.
 *
 * La liste est fermée exprès. Une expression rationnelle qui
 * accepterait n'importe quelle extension verrait un domaine dans
 * « Bonjour.Merci » ou « je passe demain.il faut que » — et ce
 * sont des messages de vrais clients. Les extensions qui sont
 * aussi des mots courants (`.be`, `.is`, `.at`, `.no`, `.se`,
 * `.it`, `.me`, `.ca`, `.us`) sont volontairement absentes : un
 * lien réel vers l'une d'elles est presque toujours écrit avec
 * son `https://`, qui lui est reconnu sans condition.
 */
function as_extensions_nues(): array {
    return [
        'com', 'net', 'org', 'info', 'biz', 'pro', 'online', 'site',
        'shop', 'store', 'live', 'life', 'today', 'agency', 'digital',
        'email', 'fun', 'space', 'website', 'tech', 'host', 'press',
        'wiki', 'art', 'blog', 'app', 'dev', 'ai', 'io', 'co', 'vip',
        'world', 'ch', 'fr', 'de', 'uk', 'eu', 'nl', 'es', 'pt', 'pl',
        'cz', 'ro', 'hu', 'gr', 'dk', 'fi', 'ru', 'cn', 'tv', 'cc',
    ];
}

/** Formules de spam. Chacune vaut 3 points, plafonnées à 6. */
function as_formules(): array {
    return [
        'promo code', 'promocode', 'promo-code', 'casino', 'crypto',
        'bitcoin', 'backlink', 'seo service', 'search engine ranking',
        'you have won', 'you won', 'free money', 'make money',
        'earn money', 'earn extra', 'viagra', 'cialis', 'porn',
        'loan offer', 'investment opportunity', 'work from home',
        'guaranteed income', 'traffic to your website',
        'rank your website', 'increase your ranking', 'boost your website',
        'web design service', 'no prescription', 'nigerian', 'lottery',
        'click the link below', 'limited time offer', 'act now',
        'argent facile', 'referencement garanti', 'pret rapide',
        'credit rapide', 'vous avez gagne', 'travail a domicile',
    ];
}

/**
 * Relève les domaines distincts cités dans un texte.
 *
 * On compte les domaines, pas les URL : sinon `https://cut.gl/x`
 * et `cut.gl/x` dans le même message compteraient deux fois et un
 * spammeur bavard serait puni deux fois pour un seul lien — mais
 * un prospect qui cite son site deux fois aussi.
 *
 * Les adresses e-mail sont retirées d'abord (personne ne doit
 * être pénalisé pour avoir écrit « écrivez à marie@exemple.ch »)
 * et les liens vers amarte.ch sont ignorés.
 */
function as_domaines(string $texte): array {
    // Les e-mails d'abord, sinon leur domaine serait compté.
    $texte = preg_replace('~[^\s<>()\[\]]+@[^\s<>()\[\]]+~u', ' ', $texte);

    $domaines = [];

    // 1. Liens explicites : un schéma ou un `www.` annonce
    //    l'intention, aucune extension n'est exigée.
    if (preg_match_all(
        '~(?:https?://|ftp://|www\.)([a-z0-9][a-z0-9.-]*[a-z0-9])~i',
        (string)$texte,
        $trouves
    )) {
        foreach ($trouves[1] as $hote) $domaines[] = strtolower($hote);
    }

    // 2. Domaines écrits nus (`cut.gl/NoSNR`). Ils ne comptent que
    //    si l'extension est dans la liste fermée ET si le domaine
    //    est écrit tout en minuscules : « Bonjour.Merci » et
    //    « demain.At 10h » sont ainsi écartés, alors qu'un vrai
    //    nom de domaine est presque toujours en minuscules.
    $extensions = implode('|', as_extensions_nues());
    if (preg_match_all(
        '~(?<![a-z0-9@./-])([a-z0-9][a-z0-9-]*(?:\.[a-z0-9][a-z0-9-]*)*\.(?:' . $extensions . '))(?![a-z0-9-])~',
        (string)$texte,
        $trouves
    )) {
        foreach ($trouves[1] as $hote) $domaines[] = $hote;
    }

    // 3. Raccourcisseurs écrits nus (`bit.ly/2xKq9Zp`). Leurs
    //    extensions (`.ly`, `.gd`, `.gy`, `.co`…) sont absentes de
    //    la liste ci-dessus parce qu'elles feraient trop de faux
    //    positifs sur du texte courant — mais la liste des
    //    raccourcisseurs, elle, est fermée : on peut la chercher
    //    telle quelle sans risque.
    $motifs = array_map(fn($d) => preg_quote($d, '~'), as_raccourcisseurs());
    if (preg_match_all(
        '~(?<![a-z0-9@./-])(' . implode('|', $motifs) . ')(?![a-z0-9-])~i',
        (string)$texte,
        $trouves
    )) {
        foreach ($trouves[1] as $hote) $domaines[] = strtolower($hote);
    }

    $propres = [];
    foreach ($domaines as $hote) {
        $hote = rtrim($hote, '.');
        if ($hote === '') continue;
        // On se moque de `www.` : c'est le même site.
        if (strpos($hote, 'www.') === 0) $hote = substr($hote, 4);
        // Un lien vers le site lui-même ne coûte rien.
        if ($hote === AS_DOMAINE || substr($hote, -strlen('.' . AS_DOMAINE)) === '.' . AS_DOMAINE) {
            continue;
        }
        $propres[$hote] = true;
    }
    return array_keys($propres);
}

/**
 * Retire les accents et met en minuscules, pour que « Référencement
 * garanti » et « referencement garanti » se valent.
 */
function as_normaliser(string $texte): string {
    $texte = mb_strtolower($texte, 'UTF-8');
    $accents = [
        'à'=>'a','â'=>'a','ä'=>'a','á'=>'a','ã'=>'a','å'=>'a',
        'ç'=>'c','è'=>'e','é'=>'e','ê'=>'e','ë'=>'e',
        'î'=>'i','ï'=>'i','í'=>'i','ì'=>'i',
        'ô'=>'o','ö'=>'o','ó'=>'o','ò'=>'o','õ'=>'o',
        'ù'=>'u','û'=>'u','ü'=>'u','ú'=>'u','ÿ'=>'y','ñ'=>'n','œ'=>'oe','æ'=>'ae',
    ];
    return strtr($texte, $accents);
}

/**
 * Le cœur du filtre. Renvoie
 *   ['score' => int, 'raisons' => string[], 'bloquant' => bool]
 *
 * `bloquant` est réservé aux deux cas qu'un visiteur réel ne peut
 * pas produire : un formulaire posté depuis un autre domaine, et
 * trois domaines différents ou plus dans un même message.
 */
function as_analyser(array $ctx): array {
    $score   = 0;
    $raisons = [];
    $bloquant = false;

    $message = (string)($ctx['message'] ?? '');
    $courts  = (array)($ctx['champs_courts'] ?? []);

    /* — Provenance —————————————————————————————— */
    $origine = as_hote_provenance();
    if ($origine === null) {
        // Ni Origin ni Referer. Un navigateur en envoie
        // normalement au moins un ; certains proxys d'entreprise
        // les suppriment, d'où un simple soupçon.
        $score += 2;
        $raisons[] = 'provenance absente (+2)';
    } elseif (!as_provenance_interne($origine)) {
        $bloquant = true;
        $raisons[] = 'posté depuis ' . $origine . ' (bloquant)';
    }

    /* — Liens dans le message ——————————————————— */
    $domaines = as_domaines($message);
    $nb = count($domaines);
    if ($nb >= 3) {
        $bloquant = true;
        $raisons[] = $nb . ' domaines distincts (bloquant)';
    } elseif ($nb === 2) {
        $score += 5;
        $raisons[] = '2 domaines distincts (+5)';
    } elseif ($nb === 1) {
        // Un prospect qui donne l'adresse de son site actuel est
        // ici. Trois points : il en reste quatre avant le seuil.
        $score += 3;
        $raisons[] = '1 domaine (' . $domaines[0] . ') (+3)';
    }

    /* — Raccourcisseurs et extensions bradées ————— */
    $suspects = as_domaines_suspects($domaines);
    if ($suspects !== []) {
        $score += 5;
        $raisons[] = 'domaine suspect : ' . implode(', ', $suspects) . ' (+5)';
    }

    /* — Balises de lien ————————————————————————— */
    if (preg_match('~\[url[\s=\]]|\[link[\s=\]]|<a\s+href~i', $message)) {
        $score += 5;
        $raisons[] = 'balise de lien BBCode/HTML (+5)';
    }

    /* — Lien dans un champ court ————————————————— */
    // Le nom, le téléphone ou le sujet ne contiennent jamais
    // d'adresse chez un vrai visiteur.
    foreach ($courts as $nom => $valeur) {
        $valeur = (string)$valeur;
        if ($valeur === '') continue;
        if (preg_match('~https?://|www\.~i', $valeur) || as_domaines($valeur) !== []) {
            $score += 5;
            $raisons[] = 'lien dans le champ « ' . $nom . ' » (+5)';
            break;
        }
    }

    /* — Formules de spam ———————————————————————— */
    $normalise = as_normaliser($message . ' ' . implode(' ', array_map('strval', $courts)));
    $trouvees = [];
    foreach (as_formules() as $formule) {
        if (strpos($normalise, $formule) !== false) $trouvees[] = $formule;
    }
    if ($trouvees !== []) {
        // Plafond volontaire : des mots seuls ne bloquent jamais,
        // il faut toujours un second signal.
        $points = min(count($trouvees) * 3, AS_PLAFOND_MOTS);
        $score += $points;
        $raisons[] = 'formules : ' . implode(', ', $trouvees) . ' (+' . $points . ')';
    }

    /* — Alphabets ————————————————————————————— */
    // La clientèle du studio écrit en français ou en anglais.
    if (preg_match('~[\p{Cyrillic}\p{Han}\p{Hiragana}\p{Katakana}\p{Hangul}]~u', $message)) {
        $score += 3;
        $raisons[] = 'alphabet cyrillique ou asiatique (+3)';
    }

    /* — Jeton de page ——————————————————————————— */
    $age = $ctx['age_formulaire'] ?? null;
    if ($age === null) {
        // Envoi sans JavaScript, ou robot qui poste à l'aveugle.
        // Trois points seulement : à lui seul, ce n'est pas un
        // motif de blocage.
        $score += 3;
        $raisons[] = 'jeton de page absent (+3)';
    } elseif ($age < AS_DELAI_MIN) {
        $score += 4;
        $raisons[] = 'formulaire rempli en ' . $age . ' s (+4)';
    }

    /* — Longueur ————————————————————————————— */
    if (mb_strlen(trim($message)) < 20) {
        $score += 2;
        $raisons[] = 'message de moins de 20 caractères (+2)';
    }

    return ['score' => $score, 'raisons' => $raisons, 'bloquant' => $bloquant];
}

/** Domaines qui utilisent un raccourcisseur ou une extension bradée. */
function as_domaines_suspects(array $domaines): array {
    $suspects = [];
    $raccourcisseurs = as_raccourcisseurs();
    $risque = as_extensions_risque();
    foreach ($domaines as $hote) {
        $extension = strtolower((string)substr(strrchr($hote, '.') ?: '', 1));
        if (in_array($hote, $raccourcisseurs, true) || in_array($extension, $risque, true)) {
            $suspects[] = $hote;
        }
    }
    return $suspects;
}

/** Hôte annoncé par Origin, sinon par Referer. Null si les deux manquent. */
function as_hote_provenance(): ?string {
    foreach (['HTTP_ORIGIN', 'HTTP_REFERER'] as $entete) {
        $valeur = trim((string)($_SERVER[$entete] ?? ''));
        if ($valeur === '') continue;
        $hote = parse_url($valeur, PHP_URL_HOST);
        if (is_string($hote) && $hote !== '') return strtolower($hote);
    }
    return null;
}

/**
 * L'hôte appartient-il au site ?
 *
 * On accepte le domaine de production, ses sous-domaines (la
 * préproduction stag.amarte.ch passe par là) et l'hôte réellement
 * servi — ce qui couvre `php -S localhost:8000` pendant les tests
 * sans avoir à lister d'exception.
 */
function as_provenance_interne(string $hote): bool {
    $servi = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
    // HTTP_HOST peut porter un port, pas l'hôte d'une URL parsée.
    $servi = (string)preg_replace('~:\d+$~', '', $servi);

    if ($servi !== '' && $hote === $servi) return true;
    if ($hote === AS_DOMAINE) return true;
    if (substr($hote, -strlen('.' . AS_DOMAINE)) === '.' . AS_DOMAINE) return true;

    return false;
}


/* ── COUCHE 4 · LIMITE DE FRÉQUENCE ───────────────────────── */

/**
 * Vrai si l'adresse a dépassé son quota. Enregistre l'envoi au
 * passage. Sans stockage inscriptible, renvoie toujours faux :
 * mieux vaut une limite inactive qu'un formulaire mort.
 */
function as_frequence_depassee(string $ip): bool {
    if (as_dossier() === null) return false;

    $maintenant = time();
    $registre = as_lire_json('frequence.json');

    // Ménage : les adresses inactives depuis 24 h sortent du
    // fichier, sinon il grossit indéfiniment.
    foreach ($registre as $cle => $horodatages) {
        $recents = array_values(array_filter(
            (array)$horodatages,
            fn($t) => is_int($t) && ($maintenant - $t) < 86400
        ));
        if ($recents === []) unset($registre[$cle]);
        else $registre[$cle] = $recents;
    }

    // L'IP n'est pas stockée en clair : le fichier n'a pas à être
    // un registre d'adresses de visiteurs.
    $cle = substr(hash('sha256', $ip . '|' . AS_SEL), 0, 32);
    $envois = $registre[$cle] ?? [];

    $heure = count(array_filter($envois, fn($t) => ($maintenant - $t) < 3600));
    $jour  = count($envois);

    if ($heure >= AS_MAX_HEURE || $jour >= AS_MAX_JOUR) {
        as_ecrire_json('frequence.json', $registre);
        return true;
    }

    $envois[] = $maintenant;
    $registre[$cle] = $envois;
    as_ecrire_json('frequence.json', $registre);
    return false;
}


/* ── COUCHE 5 · ANTI-DOUBLON ──────────────────────────────── */

/**
 * Vrai si le même message a déjà été reçu dans les dernières 24 h.
 * L'empreinte porte sur l'e-mail et sur le message normalisé :
 * un robot qui change une virgule est quand même reconnu.
 */
function as_doublon(string $email, string $message): bool {
    if (as_dossier() === null) return false;

    $maintenant = time();
    $registre = as_lire_json('doublons.json');
    foreach ($registre as $cle => $vu) {
        if (!is_int($vu) || ($maintenant - $vu) >= AS_DOUBLON_FENETRE) unset($registre[$cle]);
    }

    // Espaces et ponctuation réduits : « Bonjour !! » et
    // « bonjour ! » donnent la même empreinte.
    $noyau = preg_replace('~[^a-z0-9]+~', ' ', as_normaliser($message));
    $empreinte = hash('sha256', mb_strtolower($email, 'UTF-8') . '|' . trim((string)$noyau));

    $deja = isset($registre[$empreinte]);
    $registre[$empreinte] = $maintenant;
    as_ecrire_json('doublons.json', $registre);

    return $deja;
}


/* ── CLOUDFLARE TURNSTILE (prêt, non activé) ──────────────── */

/**
 * Vérifie le jeton Turnstile — uniquement si une clé secrète est
 * définie. Tant qu'elle est vide (le cas aujourd'hui), la
 * fonction renvoie « valide » sans rien faire : aucun appel
 * réseau, aucun widget à l'écran, rien à changer côté design.
 *
 * En cas d'échec réseau, on renvoie « valide » aussi : si
 * Cloudflare est injoignable, le formulaire du client doit
 * continuer de fonctionner. Un antispam qui tombe en panne ne
 * doit pas emmener le formulaire avec lui.
 */
function as_turnstile_valide(string $reponse, string $ip): bool {
    $secret = (string)(getenv('AMARTE_TURNSTILE_SECRET') ?: AS_TURNSTILE_SECRET);
    if ($secret === '') return true;

    if (!function_exists('curl_init')) return true;

    $curl = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    curl_setopt_array($curl, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query([
            'secret'   => $secret,
            'response' => $reponse,
            'remoteip' => $ip,
        ]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 5,
    ]);
    $brut = curl_exec($curl);
    curl_close($curl);

    if (!is_string($brut)) return true;             // réseau muet → on laisse passer
    $donnees = json_decode($brut, true);
    if (!is_array($donnees) || !isset($donnees['success'])) return true;

    return (bool)$donnees['success'];
}


/* ── JOURNAL ──────────────────────────────────────────────── */

/**
 * Une ligne par décision, dans un fichier mensuel hors du web.
 * C'est le seul moyen de repérer un faux positif : un message
 * écarté ne laisse aucune trace ailleurs, puisque l'expéditeur
 * reçoit la même réponse qu'en cas de succès.
 */
function as_journaliser(array $entree): void {
    $dossier = as_dossier();
    if ($dossier === null) return;

    $ligne = json_encode([
        'date'    => date('c'),
        'verdict' => $entree['verdict'] ?? '?',
        'score'   => $entree['score'] ?? 0,
        'raisons' => $entree['raisons'] ?? [],
        'ip'      => $entree['ip'] ?? '',
        'email'   => mb_substr((string)($entree['email'] ?? ''), 0, 80),
        'extrait' => mb_substr((string)($entree['message'] ?? ''), 0, 200),
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    @file_put_contents(
        $dossier . '/journal-' . date('Y-m') . '.log',
        $ligne . "\n",
        FILE_APPEND | LOCK_EX
    );
}


/* ── POINT D'ENTRÉE ───────────────────────────────────────── */

/**
 * Rend le verdict pour un envoi.
 *
 * $ctx attend :
 *   message        string  le corps du message
 *   email          string  l'adresse du visiteur
 *   champs_courts  array   libellé => valeur (nom, sujet, téléphone…)
 *   pieges         array   les valeurs des champs pièges
 *   jeton          string  la valeur du champ caché
 *
 * Renvoie ['accepte' => bool, 'score' => int, 'raisons' => string[], 'ip' => string].
 * L'appelant doit répondre exactement la même chose dans les deux
 * cas : un robot qui apprend ce qui l'a fait échouer réécrit son
 * message et revient.
 */
function as_verdict(array $ctx): array {
    $ip = as_ip();
    $message = (string)($ctx['message'] ?? '');
    $email   = (string)($ctx['email'] ?? '');

    $refuser = function (array $raisons) use ($ip, $email, $message): array {
        as_journaliser([
            'verdict' => 'ecarte', 'score' => 99, 'raisons' => $raisons,
            'ip' => $ip, 'email' => $email, 'message' => $message,
        ]);
        return ['accepte' => false, 'score' => 99, 'raisons' => $raisons, 'ip' => $ip];
    };

    /* Couche 1 — champs pièges. */
    foreach ((array)($ctx['pieges'] ?? []) as $nom => $valeur) {
        if (trim((string)$valeur) !== '') {
            return $refuser(['champ piège « ' . $nom .' » rempli']);
        }
    }

    /* Couche 2 + 3 — jeton et score de contenu. */
    $ctx['age_formulaire'] = as_age_formulaire(trim((string)($ctx['jeton'] ?? '')));
    $analyse = as_analyser($ctx);

    if ($analyse['bloquant']) {
        return $refuser($analyse['raisons']);
    }
    if ($analyse['score'] >= AS_SEUIL) {
        as_journaliser([
            'verdict' => 'ecarte', 'score' => $analyse['score'],
            'raisons' => $analyse['raisons'], 'ip' => $ip,
            'email' => $email, 'message' => $message,
        ]);
        return ['accepte' => false] + $analyse + ['ip' => $ip];
    }

    /* Turnstile — sans effet tant qu'aucune clé n'est définie. */
    if (!as_turnstile_valide((string)($ctx['turnstile'] ?? ''), $ip)) {
        return $refuser(array_merge($analyse['raisons'], ['Turnstile refusé']));
    }

    /* Couche 5 — doublon.

       AVANT la limite de fréquence, et l'ordre compte : un envoi
       qui semble lent fait recliquer, et chaque renvoi identique
       serait sinon décompté du quota horaire. Le visiteur épuise
       son quota sur un seul et même message, puis son message
       suivant — bien réel, et différent — est écarté en silence.
       Un doublon ne coûte donc rien : on le laisse tomber ici,
       avant tout comptage. */
    if (as_doublon($email, $message)) {
        return $refuser(array_merge($analyse['raisons'], ['message déjà reçu dans les 24 h']));
    }

    /* Couche 4 — fréquence. Ne voit que des messages distincts. */
    if (as_frequence_depassee($ip)) {
        return $refuser(array_merge($analyse['raisons'], ['limite de fréquence dépassée']));
    }

    as_journaliser([
        'verdict' => 'accepte', 'score' => $analyse['score'],
        'raisons' => $analyse['raisons'], 'ip' => $ip,
        'email' => $email, 'message' => $message,
    ]);
    return ['accepte' => true] + $analyse + ['ip' => $ip];
}
