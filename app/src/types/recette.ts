export interface Ingredient {
  nom: string;
  nomMg?: string;
  quantite: string;
  quantiteNum?: number; // Bonus 4
  unite?: string;      // Bonus 4
  substituts?: string; // Bonus 12
  substitutsMg?: string;
}

export interface Etape {
  description: string;
  descriptionMg?: string;
  dureeMin?: number; // Bonus 6
}

export interface Recette {
  id: string;
  nom: string;
  nomMg: string;
  region: 'Merina' | 'Betsileo' | 'Sakalava' | 'Antandroy' | 'Betsimisaraka';
  description: string;
  ingredients: Ingredient[];
  etapes: (string | Etape)[]; // Can be string or Etape for Bonus 6
  tempsMin: number;
  coutAr: number;
  imageUrl: string;
  auteurId: string;
  createdAt: number;
  portions?: number; // Bonus 4
  fetes?: string[];  // Bonus 10
}

export interface NouvelleRecette {
  nom: string;
  nomMg: string;
  region: 'Merina' | 'Betsileo' | 'Sakalava' | 'Antandroy' | 'Betsimisaraka';
  description: string;
  ingredients: Ingredient[];
  etapes: (string | Etape)[];
  tempsMin: number;
  coutAr: number;
  portions?: number;
  fetes?: string[];
}

export interface User {
  uid: string;
  nom: string;
  email: string;
  token: string;
}
