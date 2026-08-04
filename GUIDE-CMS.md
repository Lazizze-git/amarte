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

Ouvrez le fichier `sanity/sanity.config.js` et remplacez :
```
projectId: 'VOTRE_PROJECT_ID',
```
par votre vrai ID, ex :
```
projectId: 'ab12cd34',
```

Faites la même chose dans `js/cms.js` :
```
const SANITY_PROJECT_ID = 'ab12cd34';
```

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

### Modifier le planning hebdomadaire

1. Allez dans **Horaires**
2. Cliquez sur un créneau existant ou **+ New Horaire**
3. Remplissez : Jour, Heure, Nom du cours, Durée, Catégorie
4. **Publish** → le site se met à jour en quelques secondes

### Ajouter un témoignage

1. Allez dans **Témoignages**
2. Cliquez **+ New Témoignage**
3. Remplissez le texte, le prénom + initiale, et le détail membre
4. Définissez l'**Ordre** (1 = en premier)
5. **Publish**

### Modifier un prix

1. Allez dans **Tarifs**
2. Cliquez sur la formule à modifier
3. Changez le **Prix** (CHF)
4. **Publish**

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
