import { ref, computed } from 'vue';
import type { User } from '@/types/recette';
import api from '@/services/api';

const STORAGE_KEY = 'auth_user';

const user = ref<User | null>(null);

function chargerSession() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      user.value = JSON.parse(stored);
      api.setToken(user.value?.token || null);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

function sauvegarderSession(u: User | null) {
  if (u) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function useAuth() {
  const estConnecte = computed(() => user.value !== null);

  async function connexion(email: string, mdp: string): Promise<User> {
    const u = await api.connexion(email, mdp);
    user.value = u;
    api.setToken(u.token);
    sauvegarderSession(u);
    return u;
  }

  async function inscription(nom: string, email: string, mdp: string): Promise<User> {
    const u = await api.inscription(nom, email, mdp);
    user.value = u;
    api.setToken(u.token);
    sauvegarderSession(u);
    return u;
  }

  function deconnexion(): void {
    user.value = null;
    api.setToken(null);
    sauvegarderSession(null);
  }

  // Charger la session au démarrage
  chargerSession();

  return {
    user,
    estConnecte,
    connexion,
    inscription,
    deconnexion,
  };
}
