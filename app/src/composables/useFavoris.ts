import { ref, computed } from 'vue';
import { useAuth } from './useAuth';

const STORAGE_KEY_PREFIX = 'favoris_';

const favoris = ref<Set<string>>(new Set());

function chargerFavoris(uid: string) {
  const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${uid}`);
  if (stored) {
    try {
      favoris.value = new Set(JSON.parse(stored));
    } catch {
      favoris.value = new Set();
    }
  } else {
    favoris.value = new Set();
  }
}

function sauvegarderFavoris(uid: string) {
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${uid}`, JSON.stringify([...favoris.value]));
}

export function useFavoris() {
  const { user } = useAuth();

  // Charger les favoris quand l'utilisateur change
  function charger() {
    if (user.value) {
      chargerFavoris(user.value.uid);
    }
  }

  // Vérifier si une recette est en favori
  const estFavori = computed(() => (recetteId: string) => favoris.value.has(recetteId));

  // Ajouter/retirer des favoris
  function toggleFavori(recetteId: string) {
    if (!user.value) return;
    
    if (favoris.value.has(recetteId)) {
      favoris.value.delete(recetteId);
    } else {
      favoris.value.add(recetteId);
    }
    sauvegarderFavoris(user.value.uid);
  }

  // Liste des IDs de favoris
  const listeFavoris = computed(() => [...favoris.value]);

  // Charger au démarrage
  charger();

  return {
    estFavori,
    toggleFavori,
    listeFavoris,
    charger,
  };
}
