#!/usr/bin/env bash
# ============================================================
#  AMARTE STUDIO — Parcours complet du formulaire de contact
#
#  Usage :  bash outils/tester-antispam-bout-en-bout.sh
#
#  Lance un serveur PHP local et envoie de vraies requêtes sur
#  contact.php. Le banc d'essai voisin (tester-antispam.php) note
#  les messages ; celui-ci vérifie ce qui n'est visible qu'en
#  situation : que la réponse d'un message écarté est mot pour mot
#  celle d'un message accepté, et que les couches 4 et 5 (fréquence,
#  doublon) font bien leur travail.
#
#  sendmail_path=/bin/true : la machine de test n'a pas de serveur
#  mail, et l'échec de mail() masquerait tout le reste.
# ============================================================
set -u

RACINE="$(cd "$(dirname "$0")/.." && pwd)"
DONNEES="$(dirname "$RACINE")/amarte-antispam"
PORT=8765
BASE="http://localhost:$PORT"
ECHECS=0

cd "$RACINE" || exit 1
php -S "localhost:$PORT" -d sendmail_path=/bin/true >/dev/null 2>&1 &
SERVEUR=$!
trap 'kill $SERVEUR 2>/dev/null' EXIT
until curl -s -o /dev/null "$BASE/contact.php" 2>/dev/null; do sleep 0.2; done

# Jeton de page identique à celui qu'écrirait js/main.js.
jeton() {
  node -e '
    const SALT = "antispam-v1";
    const s = Math.floor(Date.now() / 1000) - Number(process.argv[1] || 30);
    const src = SALT + ":" + s;
    let h = 0;
    for (let i = 0; i < src.length; i++) h = (h * 31 + src.charCodeAt(i)) >>> 0;
    console.log(s + "." + h.toString(36));
  ' "$1"
}

envoyer() { # envoyer <libellé> <attendu> <champs curl…>
  local libelle="$1" attendu="$2"; shift 2
  local reponse
  reponse=$(curl -s -w '|%{http_code}' -X POST "$BASE/contact.php" \
    -H "Origin: $BASE" -H "Referer: $BASE/contact" "$@")
  if [ "$reponse" = "$attendu" ]; then
    printf '  ✔ %-52s %s\n' "$libelle" "$reponse"
  else
    printf '  ✘ %-52s %s (attendu %s)\n' "$libelle" "$reponse" "$attendu"
    ECHECS=$((ECHECS + 1))
  fi
}

# Réponse attendue partout : celle d'un envoi réussi, et rien d'autre.
SUCCES='{"ok":true,"message":"Message reçu."}|200'

echo
echo "── 1 · Un message écarté répond-il exactement comme un message accepté ?"
rm -rf "$DONNEES"
envoyer "message légitime" "$SUCCES" \
  -F 'prenom=Marie' -F 'nom=Dupont' -F 'email=marie@exemple.ch' \
  -F 'message=Bonjour, je souhaite des informations sur vos cours du soir. Merci.' \
  -F "jeton=$(jeton 40)"

rm -rf "$DONNEES"
envoyer "champ piège « website » rempli" "$SUCCES" \
  -F 'prenom=Larrynes' -F 'nom=Larrynes' -F 'email=stefff.b@web.de' \
  -F 'message=Bonjour, une question sur vos cours.' \
  -F 'website=http://spam.example' -F "jeton=$(jeton 40)"

rm -rf "$DONNEES"
envoyer "champ piège « site_web » rempli" "$SUCCES" \
  -F 'prenom=Larrynes' -F 'nom=Larrynes' -F 'email=stefff.b@web.de' \
  -F 'message=Bonjour, une question sur vos cours.' \
  -F 'site_web=http://spam.example' -F "jeton=$(jeton 40)"

rm -rf "$DONNEES"
envoyer "spam « Larrynes » (score 11)" "$SUCCES" \
  -F 'prenom=Larrynes' -F 'nom=Larrynes' -F 'email=stefff.b@web.de' \
  -F 'message=Get ready to win with a $25,000 promo code https://cut.gl/NoSNR' \
  -F "jeton=$(jeton 40)"

echo
echo "── 2 · Le même message renvoyé dans les 24 h est ignoré"
rm -rf "$DONNEES"
envoyer "1er envoi" "$SUCCES" \
  -F 'prenom=Marie' -F 'nom=Dupont' -F 'email=marie@exemple.ch' \
  -F 'message=Bonjour, je souhaite des informations sur vos cours du soir.' \
  -F "jeton=$(jeton 40)"
envoyer "2e envoi, identique" "$SUCCES" \
  -F 'prenom=Marie' -F 'nom=Dupont' -F 'email=marie@exemple.ch' \
  -F 'message=Bonjour, je souhaite des informations sur vos cours du soir.' \
  -F "jeton=$(jeton 40)"
if grep -q 'déjà reçu' "$DONNEES"/journal-*.log 2>/dev/null; then
  echo "  ✔ le journal note bien un doublon"
else
  echo "  ✘ le doublon n'apparaît pas dans le journal"; ECHECS=$((ECHECS + 1))
fi

echo
echo "── 3 · Limite de fréquence : 3 envois par heure et par IP"
rm -rf "$DONNEES"
for i in 1 2 3 4; do
  envoyer "envoi n°$i" "$SUCCES" \
    -F 'prenom=Marie' -F 'nom=Dupont' -F 'email=marie@exemple.ch' \
    -F "message=Bonjour, question numéro $i sur vos cours du soir. Merci." \
    -F "jeton=$(jeton 40)"
done
if grep -q 'limite de fréquence' "$DONNEES"/journal-*.log 2>/dev/null; then
  echo "  ✔ le 4e envoi est écarté (réponse inchangée, journal explicite)"
else
  echo "  ✘ la limite de fréquence ne s'est pas déclenchée"; ECHECS=$((ECHECS + 1))
fi

echo
echo "── 4 · Le filtre n'est pas joignable depuis le web"
CODE=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/spam-filter.php")
if [ "$CODE" = "404" ]; then
  echo "  ✔ GET /spam-filter.php → 404"
else
  echo "  ✘ GET /spam-filter.php → $CODE (attendu 404)"; ECHECS=$((ECHECS + 1))
fi

echo
echo "── 5 · Verdicts enregistrés au cours de ces essais"
sed -e 's/^/  /' "$DONNEES"/journal-*.log 2>/dev/null | tail -6

echo
if [ "$ECHECS" -eq 0 ]; then
  echo "✅ Parcours complet conforme."
else
  echo "❌ $ECHECS vérification(s) en échec."
fi
rm -rf "$DONNEES"
exit "$ECHECS"
