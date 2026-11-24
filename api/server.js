/*
 * API « Recettes Malagasy » pour le TP Ionic.
 * Dépendances : express, cors, multer
 * Écoute sur http://0.0.0.0:3000
 *
 * ATTENTION : Les mots de passe sont stockés en clair dans users.json.
 * Ceci est réservé à un exercice local et ne doit JAMAIS être utilisé en production.
 */
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir les images uploadées statiquement
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 Mo
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (JPEG, PNG, GIF, WebP).'));
    }
  },
});

// Chargement des données depuis les fichiers JSON
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const RECETTES_FILE = path.join(DATA_DIR, 'recettes.json');

let users = [];
let recettes = [];

function chargerDonnees() {
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  }
  if (fs.existsSync(RECETTES_FILE)) {
    recettes = JSON.parse(fs.readFileSync(RECETTES_FILE, 'utf8'));
  }
}

function sauvegarderUsers() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function sauvegarderRecettes() {
  fs.writeFileSync(RECETTES_FILE, JSON.stringify(recettes, null, 2));
}

chargerDonnees();

// Génération de token simple (pour l'exercice)
function genererToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Middleware d'authentification
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou invalide.' });
  }
  const token = authHeader.substring(7);
  const user = users.find(u => u.token === token);
  if (!user) {
    return res.status(401).json({ message: 'Token invalide.' });
  }
  req.user = user;
  next();
}

// Routes d'authentification
app.post('/auth/register', (req, res) => {
  const { nom, email, mdp } = req.body;
  const erreurs = {};

  if (!nom || typeof nom !== 'string' || nom.trim().length < 2) {
    erreurs.nom = 'Le nom doit contenir au moins 2 caractères.';
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    erreurs.email = 'Email invalide.';
  } else if (users.some(u => u.email === email)) {
    erreurs.email = 'Cet email est déjà utilisé.';
  }
  if (!mdp || typeof mdp !== 'string' || mdp.length < 4) {
    erreurs.mdp = 'Le mot de passe doit contenir au moins 4 caractères.';
  }

  if (Object.keys(erreurs).length > 0) {
    return res.status(422).json({ message: 'Données invalides.', erreurs });
  }

  const uid = Date.now().toString();
  const token = genererToken();
  // Stocker le mot de passe en clair (réservé à l'exercice local, JAMAIS en production)
  const user = { uid, nom: nom.trim(), email: email.trim(), mdp, token };
  users.push(user);
  sauvegarderUsers();

  res.json({ uid, nom: user.nom, email: user.email, token });
});

app.post('/auth/login', (req, res) => {
  const { email, mdp } = req.body;
  const user = users.find(u => u.email === email && u.mdp === mdp);

  if (!user) {
    return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
  }

  res.json({ uid: user.uid, nom: user.nom, email: user.email, token: user.token });
});

// Routes des recettes
app.get('/recettes', (req, res) => {
  const { region } = req.query;
  let liste = [...recettes];
  if (region) {
    liste = liste.filter(r => r.region === region);
  }
  // Tri par createdAt décroissant
  liste.sort((a, b) => b.createdAt - a.createdAt);
  res.json(liste);
});

app.get('/recettes/:id', (req, res) => {
  const recette = recettes.find(r => r.id === req.params.id);
  if (!recette) {
    return res.status(404).json({ message: 'Recette introuvable.' });
  }
  res.json(recette);
});

app.post('/recettes', authMiddleware, upload.single('image'), (req, res) => {
  try {
    const { nom, nomMg, region, description, ingredients, etapes, tempsMin, coutAr } = req.body;

    const erreurs = {};
    if (!nom || typeof nom !== 'string' || nom.trim().length < 3) {
      erreurs.nom = 'Le nom est obligatoire (3 caractères minimum).';
    }
    if (!nomMg || typeof nomMg !== 'string' || nomMg.trim().length < 2) {
      erreurs.nomMg = 'Le nom malagasy est obligatoire.';
    }
    if (!region || !['Merina', 'Betsileo', 'Sakalava', 'Antandroy', 'Betsimisaraka'].includes(region)) {
      erreurs.region = 'Région invalide.';
    }
    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      erreurs.description = 'La description doit contenir au moins 10 caractères.';
    }
    if (!ingredients) {
      erreurs.ingredients = 'Les ingrédients sont obligatoires.';
    } else {
      try {
        const parsedIngredients = JSON.parse(ingredients);
        if (!Array.isArray(parsedIngredients) || parsedIngredients.length === 0) {
          erreurs.ingredients = 'Les ingrédients doivent être un tableau non vide.';
        }
      } catch {
        erreurs.ingredients = 'Format des ingrédients invalide (JSON attendu).';
      }
    }
    if (!etapes) {
      erreurs.etapes = 'Les étapes sont obligatoires.';
    } else {
      try {
        const parsedEtapes = JSON.parse(etapes);
        if (!Array.isArray(parsedEtapes) || parsedEtapes.length === 0) {
          erreurs.etapes = 'Les étapes doivent être un tableau non vide.';
        }
      } catch {
        erreurs.etapes = 'Format des étapes invalide (JSON attendu).';
      }
    }
    if (!tempsMin || isNaN(Number(tempsMin)) || Number(tempsMin) <= 0) {
      erreurs.tempsMin = 'Le temps de préparation doit être un nombre positif.';
    }
    if (!coutAr || isNaN(Number(coutAr)) || Number(coutAr) <= 0) {
      erreurs.coutAr = 'Le coût doit être un nombre positif.';
    }

    if (Object.keys(erreurs).length > 0) {
      return res.status(422).json({ message: 'Données invalides.', erreurs });
    }

    const id = Date.now().toString();
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const recette = {
      id,
      nom: nom.trim(),
      nomMg: nomMg.trim(),
      region,
      description: description.trim(),
      ingredients: JSON.parse(ingredients),
      etapes: JSON.parse(etapes),
      tempsMin: Number(tempsMin),
      coutAr: Number(coutAr),
      imageUrl,
      auteurId: req.user.uid,
      createdAt: Date.now(),
    };

    recettes.push(recette);
    sauvegarderRecettes();

    res.status(201).json(recette);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

// Gestion des erreurs multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'L\'image ne doit pas dépasser 3 Mo.' });
    }
    return res.status(400).json({ message: error.message });
  }
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
});

// Route 404
app.use((req, res) => {
  res.status(404).json({ message: `Route inconnue : ${req.method} ${req.path}` });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Recettes Malagasy prête sur http://0.0.0.0:${PORT}`);
  console.log('Routes : POST /auth/register, POST /auth/login,');
  console.log('         GET /recettes, GET /recettes/:id, POST /recettes (auth)');
});
