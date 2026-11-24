export interface Categorie {
  id: number;
  nom: string;
}

export interface Plat {
  id: number;
  nom: string;
  description: string;
  prix: number | string;
  disponible: boolean;
  categorie?: Categorie | null;
}

export interface LignePanier {
  plat: Plat;
  quantite: number;
}

export interface LigneCommande {
  plat_id: number;
  quantite: number;
  plat?: { nom?: string };
  plat_nom?: string;
  nom?: string;
}

export type StatutCommande = 'en_attente' | 'en_preparation' | 'prete' | 'livree' | string;

export interface Commande {
  id: number;
  table: string | number;
  statut: StatutCommande;
  total: number;
  lignes: LigneCommande[];
  created_at?: string;
  date?: string;
}

export interface NouvelleCommande {
  table: string | number;
  lignes: { plat_id: number; quantite: number }[];
}