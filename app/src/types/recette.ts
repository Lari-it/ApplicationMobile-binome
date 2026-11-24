export interface Ingredient {
  nom: string;
  quantite: string;
}

export interface Recette {
  id: string;
  nom: string;
  nomMg: string;
  region: 'Merina' | 'Betsileo' | 'Sakalava' | 'Antandroy' | 'Betsimisaraka';
  description: string;
  ingredients: Ingredient[];
  etapes: string[];
  tempsMin: number;
  coutAr: number;
  imageUrl: string;
  auteurId: string;
  createdAt: number;
}

export interface NouvelleRecette {
  nom: string;
  nomMg: string;
  region: 'Merina' | 'Betsileo' | 'Sakalava' | 'Antandroy' | 'Betsimisaraka';
  description: string;
  ingredients: Ingredient[];
  etapes: string[];
  tempsMin: number;
  coutAr: number;
}

export interface User {
  uid: string;
  nom: string;
  email: string;
  token: string;
}
