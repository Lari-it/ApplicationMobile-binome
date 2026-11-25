import { ref, computed } from 'vue';
import { useAuth } from './useAuth';
import type { Ingredient } from '@/types/recette';

export interface ItemCourse extends Ingredient {
  coche: boolean;
  recetteNom?: string;
}

const items = ref<ItemCourse[]>([]);
const STORAGE_KEY_PREFIX = 'courses_';

function chargerCourses(uid: string) {
  const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${uid}`);
  if (stored) {
    try {
      items.value = JSON.parse(stored);
    } catch {
      items.value = [];
    }
  } else {
    items.value = [];
  }
}

function sauvegarderCourses(uid: string) {
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${uid}`, JSON.stringify(items.value));
}

export function useCourses() {
  const { user } = useAuth();

  function charger() {
    if (user.value) chargerCourses(user.value.uid);
  }

  function ajouterIngredients(ingredients: Ingredient[], recetteNom: string) {
    if (!user.value) return;

    ingredients.forEach(newIng => {
      // On cherche si l'ingrédient existe déjà avec le même nom et la même unité
      const existing = items.value.find(i => 
        i.nom.toLowerCase() === newIng.nom.toLowerCase() && 
        i.unite === newIng.unite
      );

      if (existing && existing.quantiteNum && newIng.quantiteNum) {
        existing.quantiteNum += newIng.quantiteNum;
        existing.quantite = `${existing.quantiteNum} ${existing.unite || ''}`;
      } else {
        items.value.push({
          ...newIng,
          coche: false,
          recetteNom
        });
      }
    });

    sauvegarderCourses(user.value.uid);
  }

  function toggleItem(index: number) {
    if (!user.value) return;
    items.value[index].coche = !items.value[index].coche;
    sauvegarderCourses(user.value.uid);
  }

  function supprimerItem(index: number) {
    if (!user.value) return;
    items.value.splice(index, 1);
    sauvegarderCourses(user.value.uid);
  }

  function toutEffacer() {
    if (!user.value) return;
    items.value = [];
    sauvegarderCourses(user.value.uid);
  }

  const listeCourses = computed(() => items.value);

  // Initialisation
  charger();

  return {
    listeCourses,
    ajouterIngredients,
    toggleItem,
    supprimerItem,
    toutEffacer,
    charger
  };
}
