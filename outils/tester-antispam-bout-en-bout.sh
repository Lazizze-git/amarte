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
echo "── 3 · Un renvoi ne doit pas manger le quota horaire"
# Le scénario qui coûte un vrai message : l'envoi paraît lent, le
# visiteur reclique deux fois, puis écrit un message différent.
# Les renvois identiques sont des doublons — ils ne doivent rien
# décompter. Avec l'anti-doublon APRÈS la limite de fréquence, les
# trois clics épuisaient le quota de 3/h et le message suivant,
# bien réel, partait à la poubelle en silence.
rm -rf "$DONNEES"
for i in 1 2 3; do
  envoyer "clic n°$i, message identique" "$SUCCES" \
    -F 'prenom=Marie' -F 'nom=Dupont' -F 'email=marie@exemple.ch' \
    -F 'message=Bonjour, je souhaite des informations sur vos cours du soir.' \
    -F "jeton=$(jeton 40)"
done
envoyer "message suivant, différent" "$SUCCES" \
  -F 'prenom=Marie' -F 'nom=Dupont' -F 'email=marie@exemple.ch' \
  -F 'message=J’oubliais : est-ce que la salle est accessible en fauteuil ?' \
  -F "jeton=$(jeton 40)"
envoyer "encore un autre message" "$SUCCES" \
  -F 'prenom=Marie' -F 'nom=Dupont' -F 'email=marie@exemple.ch' \
  -F 'message=Et avez-vous un parking pour les participants ? Merci beaucoup.' \
  -F "jeton=$(jeton 40)"

# La réponse HTTP est la même partout : seul le journal dit qui est
# passé. Les deux derniers messages doivent y être acceptés.
TOTAL=$(grep -hc '"verdict":"accepte"' "$DONNEES"/journal-*.log 2>/dev/null)
FIN=$(tail -2 "$DONNEES"/journal-*.log 2>/dev/null | grep -c '"verdict":"accepte"')
if [ "${FIN:-0}" = "2" ] && [ "${TOTAL:-0}" = "3" ]; then
  echo "  ✔ 2 doublons ignorés sans rien décompter, les 2 messages suivants passent"
else
  echo "  ✘ ${FIN:-0}/2 des 2 derniers messages acceptés (${TOTAL:-0} au total, attendu 3)"
  ECHECS=$((ECHECS + 1))
fi

echo
echo "── 3 bis · Limite de fréquence : 3 messages DISTINCTS par heure et par IP"
rm -rf "$DONNEES"
for i in 1 2 3 4; do
  envoyer "message distinct n°$i" "$SUCCES" \
    -F 'prenom=Marie' -F 'nom=Dupont' -F 'email=marie@exemple.ch' \
    -F "message=Bonjour, question numéro $i sur vos cours du soir. Merci." \
    -F "jeton=$(jeton 40)"
done
if grep -q 'limite de fréquence' "$DONNEES"/journal-*.log 2>/dev/null; then
  echo "  ✔ le 4e message distinct est écarté (réponse inchangée, journal explicite)"
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
