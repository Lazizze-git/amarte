# Antispam du formulaire de contact

Le formulaire du site (`/contact` et `/location`) reçoit du spam
automatisé. Ce document explique comment il est filtré, comment
vérifier qu'aucun vrai message n'est perdu, et quoi régler si le
filtre se trompe.

## Ce qu'il faut savoir en premier

Le robot qui nous écrit **n'affiche jamais la page**. Il envoie une
requête POST directement sur `contact.php`, depuis une liste
d'adresses. C'est pour ça qu'un simple champ piège ne suffit pas :
le piège est dans le HTML, que le robot ne charge pas.

Le filtre suit donc une règle unique : **on ne perd jamais un vrai
message**. Chaque signal ajoute des points, aucun signal ne suffit
à lui seul, et en cas de doute on laisse passer. Un faux positif
coûte un client ; un faux négatif coûte une seconde de suppression.

## Les fichiers

| Fichier | Rôle |
| --- | --- |
| `spam-filter.php` | Le filtre. Toute la logique et tous les réglages sont en haut du fichier. |
| `contact.php` | Reçoit le formulaire, demande un verdict au filtre, envoie l'e-mail. |
| `js/main.js` | Écrit le jeton de page au chargement (§ 5, `jetonDePage`). |
| `outils/tester-antispam.php` | Banc d'essai : note des messages réels et affiche le tableau. |
| `outils/tester-antispam-bout-en-bout.sh` | Parcours complet, vraies requêtes sur un serveur local. |

## Les cinq couches

1. **Deux champs pièges** (`site_web`, `website`), invisibles à
   l'écran et hors du parcours clavier. Les robots remplissent
   systématiquement un champ nommé `website`.
2. **Un jeton de page.** Le JavaScript écrit au chargement un
   horodatage suivi d'une somme de contrôle ; le PHP la recalcule à
   l'identique. Un robot qui poste sans exécuter le JavaScript ne
   peut pas le produire, et le serveur en déduit le temps de
   remplissage — moins de 3 secondes, c'est une machine.
   Son absence coûte 3 points, elle ne bloque pas : un envoi sans
   JavaScript reste possible.
3. **Un score de contenu.** Liens (domaines distincts, pas URL
   brutes), raccourcisseurs, extensions bradées, balises de lien,
   lien dans un champ court, formules de spam (plafonnées à 6
   points), alphabets non latins, longueur du message, provenance.
   **Seuil de blocage : 7 points.**
4. **Une limite de fréquence** par adresse IP : 3 envois par heure,
   10 par 24 h.
5. **Un anti-doublon** : le même message renvoyé dans les 24 h est
   ignoré (empreinte sur e-mail + message normalisé).

Deux cas bloquent d'office, parce qu'un visiteur réel ne peut pas
les produire : un formulaire posté depuis un autre domaine, et trois
domaines différents ou plus dans un même message.

Le plafond de 6 points sur les formules de spam est volontaire :
des mots-clés seuls ne doivent jamais suffire à bloquer, il faut
toujours un second signal. Un prospect qui donne l'adresse de son
site actuel obtient 3 points et passe largement.

## Vérifier qu'aucun vrai message n'est perdu

**Un message écarté reçoit exactement la même réponse qu'un message
accepté** — sinon le robot apprend ce qui l'a fait échouer et
réécrit son message. La seule trace d'un refus est donc le journal.

Il est sur le serveur, hors de la racine web, dans
`amarte-antispam/journal-AAAA-MM.log` (un dossier au-dessus de
`public_html`). Une ligne JSON par décision : date, verdict, score,
raisons, IP et début du message. À relire de temps en temps, surtout
les premières semaines.

Les e-mails qui passent portent aussi leur score en pied de
message (`Antispam : 3/7 — …`) : plus il est proche de 7, plus le
message a déclenché de signaux.

## Régler le filtre

Tout est en haut de `spam-filter.php` : le seuil (`AS_SEUIL`), le
délai minimum, les limites de fréquence, les listes de
raccourcisseurs, d'extensions et de formules.

Après **toute** modification, refaire tourner les deux essais :

```sh
php outils/tester-antispam.php
bash outils/tester-antispam-bout-en-bout.sh
```

Le premier doit afficher `✅` sur les 17 cas. Si un seul cas
légitime bascule en « bloqué », c'est le réglage qui est faux, pas
le cas de test.

## Cloudflare Turnstile

Le branchement existe dans `spam-filter.php` (`as_turnstile_valide`)
mais **n'est pas actif** : tant qu'aucune clé secrète n'est définie,
aucun appel réseau n'est fait et rien n'apparaît à l'écran. Pour
l'activer, renseigner `AS_TURNSTILE_SECRET` ou la variable
d'environnement `AMARTE_TURNSTILE_SECRET`, et ajouter le widget aux
deux formulaires. Si Cloudflare est injoignable, le filtre laisse
passer : un antispam en panne ne doit pas emmener le formulaire
avec lui.

## Côté hébergeur

- Le dossier de travail est créé automatiquement au-dessus de la
  racine web. S'il n'est pas inscriptible, la limite de fréquence et
  l'anti-doublon **se désactivent d'eux-mêmes** plutôt que de bloquer
  les envois légitimes — mais le journal disparaît aussi. À vérifier
  une fois après la première mise en ligne.
- Le déploiement FTP (`mirror --delete`) supprime tout ce qui n'est
  pas dans le dépôt : `antispam-donnees/` est explicitement exclu
  dans `.github/workflows/deploy.yml`.
- Le site passe par Cloudflare : le filtre lit `CF-Connecting-IP`
  quand cet en-tête est là, sinon la limite de fréquence
  compterait tous les visiteurs comme une seule adresse.
