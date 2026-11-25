# TODO : Application Recettes Malagasy

**Stack :** Ionic Vue + Capacitor + TypeScript (`app/`) et Express (`api/`), puis migration vers Firebase.
**Équipe :** Personne A (backend et logique) et Personne B (interface).

Légende : `[ ]` à faire, `[x]` fait. Chaque tâche a un **résultat attendu** pour savoir quand elle est terminée.

---

## 0. Préparation (A + B ensemble, jour 1)

- [ ] Créer le dépôt Git partagé (GitHub) et inviter l'autre personne
- [ ] Créer les branches : `main`, `feature/backend` (A), `feature/ui` (B)
- [ ] Ajouter un `.gitignore` : `node_modules`, `.env`, `api/uploads/`, `api/data/users.json`
- [ ] Vérifier que `app/` démarre chez les deux (`npm install` puis `npm run dev`)
- [ ] **Valider le contrat** ci-dessous (types et fonctions de `services`). Ne plus le modifier sans prévenir l'autre.

### Contrat entre A et B

```ts
// types/recette.ts
Ingredient = { nom: string; quantite: string }
Recette = { id, nom, nomMg, region, description, ingredients: Ingredient[],
            etapes: string[], tempsMin: number, coutAr: number,
            imageUrl: string, auteurId: string, createdAt: number }
User = { uid, nom, email, token }

// services/index.ts : fonctions que B peut appeler
inscription(nom, email, mdp): Promise<User>
connexion(email, mdp): Promise<User>
listeRecettes(region?): Promise<Recette[]>
recetteParId(id): Promise<Recette>
ajouterRecette(recette, image?: File): Promise<Recette>
setToken(token): void
```

**Résultat attendu :** les deux ont le même fichier `types/recette.ts` et la même liste de fonctions.

---

## Personne A : Backend et logique

Dossiers : `api/`, `app/src/services/`, `app/src/composables/`, `app/src/router/`, `app/src/utils/notif.ts`

### Phase 1 : serveur de base

- [ ] `cd api && npm init -y && npm install express cors multer`
- [ ] Créer `api/server.js` avec `express`, `cors`, `express.json()`
- [ ] Créer les dossiers `api/data/` et `api/uploads/`
- [ ] Écrire les fonctions `lire(fichier)` et `ecrire(fichier, data)` pour lire/écrire les JSON
- [ ] Créer `api/data/users.json` contenant `[]`
- [ ] Créer `api/data/recettes.json` avec **6 recettes** au format `Recette` : romazava, ravitoto, akoho sy voanio, kitoza, lasary, mofo gasy (régions variées)
- [ ] Servir les images avec `app.use("/uploads", express.static(...))`
- [ ] Lancer sur `0.0.0.0:3000` (pour que le téléphone puisse y accéder)

**Résultat attendu :** `http://localhost:3000/uploads` répond, le serveur démarre sans erreur.

### Phase 2 : authentification

- [ ] Route `POST /auth/register` : vérifie que l'email n'existe pas, crée l'utilisateur, renvoie `{ uid, nom, email, token }`
- [ ] Route `POST /auth/login` : vérifie email et mot de passe, renvoie le même objet, sinon erreur 401 avec `message`
- [ ] Middleware `auth` : lit `Authorization: Bearer <token>`, retrouve l'utilisateur, sinon 401
- [ ] Tester les routes avec Postman, Thunder Client ou `curl`
- [ ] Noter dans le README : « mot de passe en clair, exercice local uniquement »

**Résultat attendu :** on peut s'inscrire, se connecter, et une route protégée refuse l'accès sans token.

### Phase 3 : routes recettes

- [ ] `GET /recettes` (protégée) : tri par `createdAt` décroissant, filtre `?region=`
- [ ] `GET /recettes/:id` (protégée) : 404 si introuvable
- [ ] `POST /recettes` (protégée) avec `multer` : champ fichier `image`, limite 3 Mo
- [ ] Dans `POST`, parser `ingredients` et `etapes` avec `JSON.parse` (ils arrivent en texte via FormData)
- [ ] Construire `imageUrl` avec `req.protocol` et `req.get("host")`
- [ ] Refuser les fichiers qui ne sont pas des images (vérifier `file.mimetype`)

**Résultat attendu :** ajout d'une recette avec image visible à l'adresse `imageUrl` dans le navigateur.

### Phase 4 : services côté application

- [ ] Créer `app/src/services/api.ts` avec la fonction générique `req<T>()` (gère le JSON, le FormData, le token et les erreurs)
- [ ] Implémenter `inscription`, `connexion`, `listeRecettes`, `recetteParId`, `ajouterRecette`, `setToken`
- [ ] Créer `app/src/services/index.ts` : `export * from "./api"`
- [ ] Configurer `app/.env` : `VITE_API_URL=http://localhost:3000`
- [ ] Ajouter `env.d.ts` pour typer `import.meta.env.VITE_API_URL`

**Résultat attendu :** appeler `listeRecettes()` depuis la console du navigateur renvoie les 6 recettes.

### Phase 5 : session et protection des pages

- [ ] Créer `composables/useAuth.ts` : `user`, `estConnecte`, `connexion`, `inscription`, `deconnexion`
- [ ] Sauvegarder l'utilisateur dans `localStorage` et le recharger au démarrage (session persistante)
- [ ] Appeler `setToken()` au chargement et à chaque connexion/déconnexion
- [ ] Dans `router/index.ts`, ajouter `beforeEach` : redirige vers `/login` si non connecté, vers `/tabs/recettes` si déjà connecté et sur login/register
- [ ] Déclarer toutes les routes (login, register, tabs, recettes, ajouter, profil, recette/:id)

**Résultat attendu :** après un rechargement de page, l'utilisateur reste connecté. Sans connexion, impossible d'ouvrir une page protégée.

### Phase 6 : notifications locales

- [ ] `cd app && npm install @capacitor/local-notifications && npx cap sync`
- [ ] Créer `utils/notif.ts` avec `notifierNouvelleRecette(nom)` (permission + notification après 1 s)
- [ ] Protéger l'appel pour ne pas planter dans le navigateur (try/catch, `Capacitor.isNativePlatform()`)
- [ ] Bonus : notification quotidienne à 17h « Que cuisine-t-on ce soir ? »

**Résultat attendu :** sur Android, une notification apparaît après l'ajout d'une recette.

### Phase 7 : Android

- [ ] Vérifier `capacitor.config.json` (`appId`, `appName`, `webDir: "dist"`)
- [ ] `npm run build && npx cap add android && npx cap sync`
- [ ] Mettre `VITE_API_URL=http://10.0.2.2:3000` pour l'émulateur, ou l'IP du PC pour un vrai téléphone
- [ ] Autoriser le HTTP en clair (`android:usesCleartextTraffic="true"`) pour le développement
- [ ] Tester dans Android Studio (émulateur) puis sur un vrai téléphone

**Résultat attendu :** l'application tourne sur Android avec le serveur local.

---

## Personne B : Interface

Dossiers : `app/src/views/`, `app/src/types/`, `app/src/utils/format.ts`, `app/src/components/`, `app/src/theme/`

### Phase 1 : base

- [x] Créer `types/recette.ts` (copie exacte du contrat)
- [x] Créer `utils/format.ts` avec `formatAr(n)` : `15000` donne `15 000 Ar`
- [x] Choisir les couleurs de l'application dans `theme/variables.css` (idée : vert, orange, rouge terre)
- [x] Créer `TabsPage.vue` avec 3 onglets : Recettes, Ajouter, Profil (icônes Ionicons)
- [x] Créer les 7 fichiers de vues avec un contenu minimal (`<ion-page>` et un titre) pour que le router fonctionne dès le début

**Résultat attendu :** la navigation entre les 3 onglets marche, même avec des pages vides.

### Phase 2 : écrans d'accès

- [x] `LoginPage.vue` : champs email et mot de passe, bouton, lien vers Register
- [x] Afficher les erreurs (`message` renvoyé par l'API) en rouge
- [x] Désactiver le bouton pendant le chargement
- [x] `RegisterPage.vue` : mêmes champs plus `nom` et confirmation du mot de passe
- [x] Validation côté écran : email non vide, mot de passe d'au moins 6 caractères, confirmation identique
- [x] Redirection vers `/tabs/recettes` après succès avec `router.replace`

**Résultat attendu :** inscription et connexion fonctionnent de bout en bout (dès que A a fini la phase 5).

### Phase 3 : liste

- [x] `RecettesPage.vue` : `ion-list` avec une ligne par recette (miniature, nom, région, temps, coût en Ar)
- [x] Rangée de filtres par région avec `ion-chip` (Toutes, Merina, Betsileo, Sakalava, Antandroy, Betsimisaraka)
- [x] Recharger la liste avec `onIonViewWillEnter` (pour voir la recette ajoutée au retour)
- [x] Ajouter `ion-refresher` (tirer pour rafraîchir)
- [x] Gérer l'état vide : message « Aucune recette pour cette région »
- [x] Gérer le chargement avec `ion-spinner` ou `ion-skeleton-text`
- [x] Barre de recherche par nom (`ion-searchbar`, filtre côté client)

**Résultat attendu :** la liste affiche les 6 recettes, le filtre par région fonctionne.

### Phase 4 : fiche

- [x] `RecetteDetailPage.vue` : bouton retour, grande image, nom français et malagasy
- [x] Afficher la région, le temps et le coût avec `formatAr`
- [x] Liste des ingrédients (quantité et nom)
- [x] Étapes numérotées
- [x] Gérer le cas « recette introuvable » et le chargement
- [x] Image par défaut si `imageUrl` est vide
- [x] Bonus : sélecteur de portions qui recalcule les quantités

**Résultat attendu :** un clic sur une recette ouvre la fiche complète, le retour ramène à la liste.

### Phase 5 : formulaire

- [x] `AjoutRecettePage.vue` : champs nom, nom malagasy, région (select), description, temps, coût
- [x] Liste dynamique d'ingrédients : boutons « + Ingrédient » et suppression d'une ligne
- [x] Liste dynamique d'étapes : boutons « + Étape » et suppression d'une étape
- [x] Choix de la photo (`<input type="file" accept="image/*">`) avec aperçu
- [x] Validation : nom, au moins 1 ingrédient, au moins 1 étape, temps et coût positifs
- [x] Message d'erreur clair sous le formulaire
- [x] Bouton « Publier » désactivé pendant l'envoi (texte « Envoi... »)
- [x] Après succès : vider le formulaire et revenir à la liste
- [x] Bonus : réduire la taille de l'image avant l'envoi (canvas, largeur max 1080 px)

**Résultat attendu :** une recette créée avec photo apparaît en haut de la liste.

### Phase 6 : profil et finitions

- [x] `ProfilPage.vue` : nom, email, bouton « Se déconnecter » (appelle `deconnexion()` puis `router.replace("/login")`)
- [x] Bonus : afficher « Mes recettes » (recettes dont `auteurId` = `user.uid`)
- [x] Vérifier l'affichage sur petit écran (360 px de large) et en mode sombre
- [x] Choisir une icône et un écran de démarrage (splash) pour l'application
- [x] Relire tous les textes (orthographe, français et malagasy)

**Résultat attendu :** l'application est agréable et cohérente de l'ouverture à la déconnexion.

---

## Ensemble : intégration et livraison

### Intégration

- [ ] **Point de synchro après la phase 4 de A et la phase 2 de B** : fusionner les branches dans `main`
- [ ] Résoudre les conflits Git ensemble (surtout `router/index.ts` et `types/`)
- [ ] Tester le scénario complet : inscription, connexion, liste, filtre, fiche, ajout avec photo, notification, déconnexion
- [ ] Tester les erreurs : mauvais mot de passe, email déjà utilisé, serveur éteint, image trop lourde
- [ ] Corriger les bugs trouvés (créer une liste « Bugs » ci-dessous)

### Migration Firebase

**Personne A :**
- [ ] Créer le projet Firebase et ajouter l'app web/Android
- [ ] Activer Authentication (Email/Mot de passe), Firestore et Storage
- [ ] `npm install firebase` dans `app/`
- [ ] Créer `services/firebase.ts` avec **les mêmes noms de fonctions** que `api.ts`
  - [ ] `inscription` / `connexion` avec Firebase Auth
  - [ ] `listeRecettes` / `recetteParId` avec Firestore (`getDocs`, `getDoc`)
  - [ ] `ajouterRecette` : `uploadBytes` dans Storage, puis `addDoc` dans Firestore
- [ ] Adapter `useAuth.ts` pour utiliser `onAuthStateChanged`
- [ ] Importer les 6 recettes de départ dans Firestore
- [ ] Changer `services/index.ts` : `export * from "./firebase"`
- [ ] Écrire les règles de sécurité Firestore et Storage

**Personne B :**
- [ ] Vérifier que chaque écran fonctionne sans modification après le changement
- [ ] Corriger les écarts d'affichage (dates, images, erreurs Firebase traduites en français)

**Ensemble :**
- [ ] Notifications push : `@capacitor/push-notifications`, enregistrement du token FCM, Cloud Function qui envoie une notification à chaque nouvelle recette (nécessite le plan Blaze, sinon envoi manuel depuis la console Firebase)
- [ ] Supprimer le dossier `api/` une fois tout validé

### Livraison

- [ ] Rédiger un `README.md` : installation, lancement, captures d'écran
- [ ] Générer l'APK de test (Android Studio, Build > Build APK)
- [ ] Faire tester l'APK par 2 ou 3 personnes et noter leurs retours
- [ ] Préparer la démonstration (scénario de 5 minutes)

---

## Règles de travail

- Un commit par tâche terminée, message clair (`feat: liste des recettes avec filtres`)
- Pull de `main` chaque matin avant de commencer
- Ne jamais modifier le contrat (types et services) sans prévenir l'autre
- B utilise des données factices tant que l'API de A n'est pas prête
- Point de 10 minutes chaque jour : « ce que j'ai fait, ce que je fais, ce qui me bloque »

## Bugs et idées

| # | Description | Responsable | Statut |
|---|---|---|---|
| 1 | | | |
