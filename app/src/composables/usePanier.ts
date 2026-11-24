import { ref, computed } from 'vue';
import type { LignePanier, Plat } from '@/types/gargote';

const lignes = ref<LignePanier[]>([]);

export function usePanier() {
  function ajouter(plat: Plat) {
    const index = lignes.value.findIndex(ligne => ligne.plat.id === plat.id);
    if (index !== -1) {
      lignes.value[index].quantite++;
    } else {
      lignes.value.push({ plat, quantite: 1 });
    }
  }

  function changerQuantite(platId: number, delta: number) {
    const index = lignes.value.findIndex(ligne => ligne.plat.id === platId);
    if (index !== -1) {
      const nouvelleQuantite = lignes.value[index].quantite + delta;
      if (nouvelleQuantite <= 0) {
        lignes.value.splice(index, 1);
      } else {
        lignes.value[index].quantite = nouvelleQuantite;
      }
    }
  }

  function retirer(platId: number) {
    lignes.value = lignes.value.filter(ligne => ligne.plat.id !== platId);
  }

  function vider() {
    lignes.value = [];
  }

  const nombreArticles = computed(() =>
    lignes.value.reduce((total, ligne) => total + ligne.quantite, 0)
  );

  const total = computed(() =>
    lignes.value.reduce((acc, ligne) => acc + (Number(ligne.plat.prix) * ligne.quantite), 0)
  );

  return {
    lignes,
    ajouter,
    changerQuantite,
    retirer,
    vider,
    nombreArticles,
    total,
  };
}