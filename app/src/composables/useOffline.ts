import { ref } from 'vue';

const estHorsLigne = ref(!navigator.onLine);
const attenteSynchro = ref<any[]>([]);

window.addEventListener('online', () => {
  estHorsLigne.value = false;
  synchroniserAttente();
});

window.addEventListener('offline', () => {
  estHorsLigne.value = true;
});

const CACHE_KEY = 'recettes_cache';
const SYNC_KEY = 'recettes_sync_queue';

function getCache(): any[] {
  const stored = localStorage.getItem(CACHE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function setCache(recettes: any[]) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(recettes));
}

function getSyncQueue(): any[] {
  const stored = localStorage.getItem(SYNC_KEY);
  return stored ? JSON.parse(stored) : [];
}

function setSyncQueue(queue: any[]) {
  localStorage.setItem(SYNC_KEY, JSON.stringify(queue));
}

async function synchroniserAttente() {
  const queue = getSyncQueue();
  if (queue.length === 0) return;

  console.log(`Synchronisation de ${queue.length} recettes en attente...`);
  
  // Importer api dynamiquement pour éviter les cycles 
  const api = (await import('../services/api')).default; 

  for (const item of [...queue]) {
    try {
      await api.ajouterRecette(item.recette, item.image);
      // Supprimer de la file si réussi
      const currentQueue = getSyncQueue();
      const index = currentQueue.findIndex(i => i.id === item.id);
      if (index > -1) {
        currentQueue.splice(index, 1);
        setSyncQueue(currentQueue);
      }
    } catch (e) {
      console.error("Échec synchro recette:", e);
    }
  }
}

export function useOffline() {
  return {
    estHorsLigne,
    getCache,
    setCache,
    ajouterAFileSynchro: (recette: any, image?: any) => {
      const queue = getSyncQueue();
      queue.push({
        id: Date.now(),
        recette,
        image // Attention: les Files ne se sérialisent pas bien en JSON
      });
      setSyncQueue(queue);
    },
    synchroniserAttente
  };
}
