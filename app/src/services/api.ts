/*
- Tous les appels à l'API passent par ce fichier.
- Les pages n'utilisent jamais fetch() directement.
 */
import type { Categorie, Commande, NouvelleCommande, Plat } from '@/types/gargote';
import type { Recette, NouvelleRecette, User } from '@/types/recette';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let authToken: string | null = null;

// [MODIFIÉ] Classe dédiée remplaçant l'Error générique enrichie dynamiquement
export class ErreurApi extends Error {
  constructor(
    message: string,
    public statut: number,
    public details: Record<string, string> = {},
  ) {
    super(message);
  }
}

/**
- Envoie une requête et renvoie le JSON de la réponse.
- En cas de code HTTP d'erreur (4xx, 5xx), lève une ErreurApi qui contient
- le statut et le corps de la réponse (message, erreurs...).
 */
// [MODIFIÉ] Fonction générique <T>, options typées en RequestInit et retour typé Promise<T>
async function requete<T>(chemin: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {};
  
  // Ajouter Content-Type sauf pour FormData (le navigateur le fait automatiquement avec boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Ajouter le token d'authentification si disponible
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const reponse = await fetch(BASE_URL + chemin, {
    headers,
    ...options,
  });

  const donnees = reponse.status === 204 ? null : await reponse.json();

  if (!reponse.ok) {
    // [MODIFIÉ] Levée d'une instance ErreurApi avec statut et détails
    throw new ErreurApi(
      donnees?.message ?? `Erreur HTTP ${reponse.status}`,
      reponse.status,
      donnees?.erreurs ?? {},
    );
  }
  // [MODIFIÉ] Typage explicite du résultat vers le paramètre générique T
  return donnees as T;
}

export default {
  // [MODIFIÉ] Retour typé Promise<Categorie[]>
  getCategories(): Promise<Categorie[]> {
    return requete<Categorie[]>('/categories');
  },

  // [MODIFIÉ] Paramètre categorieId typé et retour typé Promise<Plat[]>
  getPlats(categorieId?: number | string | null): Promise<Plat[]> {
    // Si categorieId est fourni et différent de "toutes", on ajoute le paramètre à l'URL
    const query = (categorieId && categorieId !== 'toutes') ? `?categorie=${categorieId}` : '';
    return requete<Plat[]>(`/plats${query}`);
  },

  // [MODIFIÉ] Paramètre id typé et retour typé Promise<Plat>
  getPlat(id: number | string): Promise<Plat> {
    return requete<Plat>(`/plats/${id}`);
  },

  // --- NOUVEAUTés FICHE 04 ---
  // [MODIFIÉ] Paramètre commande typé NouvelleCommande et retour typé Promise<Commande>
  creerCommande(commande: NouvelleCommande): Promise<Commande> {
    return requete<Commande>('/commandes', {
      method: 'POST',
      body: JSON.stringify(commande),
    });
  },

  // [MODIFIÉ] Retour typé Promise<Commande[]>
  getCommandes(): Promise<Commande[]> {
    return requete<Commande[]>('/commandes');
  },

  // --- Fonctions Authentification ---
  setToken(token: string | null): void {
    authToken = token;
  },

  inscription(nom: string, email: string, mdp: string): Promise<User> {
    return requete<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nom, email, mdp }),
    });
  },

  connexion(email: string, mdp: string): Promise<User> {
    return requete<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, mdp }),
    });
  },

  // --- Fonctions Recettes ---
  listeRecettes(region?: string): Promise<Recette[]> {
    const query = region ? `?region=${encodeURIComponent(region)}` : '';
    return requete<Recette[]>(`/recettes${query}`);
  },

  recetteParId(id: string): Promise<Recette> {
    return requete<Recette>(`/recettes/${id}`);
  },

  ajouterRecette(recette: NouvelleRecette, image?: File): Promise<Recette> {
    const formData = new FormData();
    formData.append('nom', recette.nom);
    formData.append('nomMg', recette.nomMg);
    formData.append('region', recette.region);
    formData.append('description', recette.description);
    formData.append('ingredients', JSON.stringify(recette.ingredients));
    formData.append('etapes', JSON.stringify(recette.etapes));
    formData.append('tempsMin', String(recette.tempsMin));
    formData.append('coutAr', String(recette.coutAr));
    
    if (image) {
      formData.append('image', image);
    }

    return requete<Recette>('/recettes', {
      method: 'POST',
      body: formData,
    });
  },
};