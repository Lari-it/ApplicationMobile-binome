# Recettes Malagasy - Application Ionic Vue

Application mobile de recettes de cuisine malagasy avec Ionic Vue + TypeScript + Capacitor, et un serveur Express local.

## Fonctionnalités

- Authentification (inscription / connexion)
- Liste des recettes avec filtre par région
- Fiche détaillée d'une recette (ingrédients, étapes, temps, coût)
- Ajout de recette avec upload d'image
- Notification locale après l'ajout d'une recette (sur mobile)
- Profil utilisateur

## Architecture

- **Backend** : Express avec stockage dans des fichiers JSON (`api/data/`)
- **Frontend** : Ionic Vue + TypeScript + Vite
- **Upload** : Multer pour les images (max 3 Mo)

## Lancement de l'application

### 1. Lancer l'API (backend)

```bash
cd api
npm install
node server.js
```

L'API écoute sur `http://0.0.0.0:3000`

### 2. Lancer l'application (frontend)

```bash
cd app
npm install
npm run dev
```

## Configuration de l'URL de l'API

Le fichier `app/.env` contient l'URL de l'API. Adaptez-la selon votre environnement :

- **Navigateur** : `http://localhost:3000`
- **Émulateur Android** : `http://10.0.2.2:3000`
- **Vrai téléphone** : `http://IP_DU_PC:3000` (remplacez IP_DU_PC par l'adresse IP de votre PC sur le réseau local)

Après modification du `.env`, relancez `npm run dev`.

## Routes de l'API

- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `GET /recettes` - Liste des recettes (filtre `?region=Merina`)
- `GET /recettes/:id` - Détail d'une recette
- `POST /recettes` - Ajouter une recette (authentifié, multipart/form-data)

## Données

Les données sont stockées dans `api/data/` :
- `users.json` - Utilisateurs (mots de passe en clair, réservé à l'exercice local)
- `recettes.json` - Recettes (6 recettes malagasy pré-chargées)

## Recettes pré-chargées

- Romazava (Merina)
- Ravitoto (Betsileo)
- Akoho sy voanio (Sakalava)
- Kitoza (Merina)
- Lasary (Betsimisaraka)
- Mofo gasy (Merina)

## Technologies

- **Frontend** : Ionic Vue 9, Vue 3, TypeScript, Vite, Capacitor
- **Backend** : Express, CORS, Multer
- **Notifications** : @capacitor/local-notifications
