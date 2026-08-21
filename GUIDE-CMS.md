# Guide d'utilisation — CMS Amarte Studio

## Ce que vous pouvez modifier sans développeur

| Contenu | Où modifier |
|---|---|
| Témoignages (page d'accueil) | **Témoignages** → ajouter, réordonner, désactiver |
| Téléphone, email, réseaux sociaux | **Paramètres du site** |

> ⚠️ **Les cours, le planning et les tarifs ne passent plus par le CMS.**
> Ils sont écrits directement dans les pages, qui font désormais foi.
> Les rubriques *Cours*, *Horaires* et *Tarifs* du studio Sanity ne sont
> plus lues par le site : les modifier n'aura aucun effet.
>
> ⚠️ Le champ **téléphone** des *Paramètres du site* remplace le numéro
> affiché partout sur le site au chargement. Il doit contenir le numéro
> officiel : **+41 78 810 64 64**.

---

## Mise en place (une seule fois — 15 minutes)

### Étape 1 — Créer le projet Sanity

1. Allez sur [sanity.io/manage](https://sanity.io/manage)
2. Créez un compte gratuit (ou connectez-vous)
3. Cliquez **"New project"** → nommez-le `amarte`
4. Copiez votre **Project ID** (ex: `ab12cd34`)

### Étape 2 — Configurer le code

> Déjà fait. Le projet est configuré sur l'ID `pvvt7no0`, présent en
> trois endroits : `sanity/sanity.config.js`, `sanity/sanity.cli.js`
> et `js/cms.js`. Cette étape n'est à refaire que si le site change
> de projet Sanity.

Avant la mise en ligne, une seule action est nécessaire côté Sanity :
déclarer l'origine du site dans **sanity.io/manage → API → CORS
origins** (`https://amarte.ch`, sans « Allow credentials »). Sans
elle, le navigateur bloque les appels et les témoignages du CMS ne
s'affichent jamais — silencieusement, le site retombant sur les
témoignages écrits dans la page.

### Étape 3 — Lancer le Studio CMS

Dans votre terminal :
```bash
cd sanity
npm install
npm run dev
```
→ Ouvre http://localhost:3333 (votre interface d'administration)

### Étape 4 — Déployer le Studio en ligne

```bash
npm run deploy
```
→ Vous obtenez une URL publique type `https://amarte.sanity.studio`

---

## Utilisation quotidienne

> Rappel : seuls les **témoignages** et les **coordonnées** sont lus
> par le site. Les rubriques Horaires, Cours, Tarifs, Heros et Cards
> infos du Studio existent encore mais ne sont plus affichées : les
> modifier n'a aucun effet.

### Ajouter un témoignage

1. Allez dans **Témoignages**
2. Cliquez **+ New Témoignage**
3. Remplissez le texte, le prénom + initiale, et le détail membre
4. Définissez l'**Ordre** (1 = en premier)
5. **Publish**

### Modifier les coordonnées

1. Allez dans **Paramètres du site**
2. Modifiez l'e-mail, l'Instagram ou le Facebook
3. **Publish**

Le **téléphone** fait exception : il est écrit en dur dans les pages
et n'est plus piloté par le CMS (le champ Sanity contient encore un
ancien numéro). Le numéro officiel est **+41 78 810 64 64**.

---

## Glofox — Système de réservation

Le widget Glofox est intégré directement sur les pages **Calendrier** et **Tarifs**.

- **Calendrier** : vue des cours disponibles avec bouton de réservation
- **Tarifs** : vue des abonnements avec paiement sécurisé

Pour modifier l'ID de branche Glofox :
→ **Paramètres du site** → champ **Glofox Branch ID**

---

## Support

Pour toute question technique : contact@wearebrothers.ch
