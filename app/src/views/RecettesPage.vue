<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Recettes Malagasy</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" @ion-refresh="rafraichir">
        <ion-refresher-content />
      </ion-refresher>

      <!-- Filtre par région -->
      <div class="ion-padding">
        <ion-chip
          v-for="region in regions"
          :key="region"
          :outline="regionChoisie !== region"
          :color="regionChoisie === region ? 'primary' : undefined"
          @click="regionChoisie = region"
        >
          <ion-label>{{ region }}</ion-label>
        </ion-chip>
        <ion-chip
          :outline="regionChoisie !== null"
          :color="regionChoisie === null ? 'primary' : undefined"
          @click="regionChoisie = null"
        >
          <ion-label>Toutes</ion-label>
        </ion-chip>
      </div>

      <!-- Chargement -->
      <div v-if="chargement" class="ion-text-center ion-padding">
        <ion-spinner />
      </div>

      <!-- Erreur -->
      <div v-else-if="erreur" class="ion-padding">
        <ion-text color="danger">
          <p>{{ erreur }}</p>
        </ion-text>
        <ion-button expand="block" @click="charger">Réessayer</ion-button>
      </div>

      <!-- Liste des recettes -->
      <ion-list v-else-if="recettes.length > 0">
        <ion-item
          v-for="recette in recettes"
          :key="recette.id"
          :router-link="`/recette/${recette.id}`"
          button
        >
          <ion-thumbnail slot="start">
            <img
              v-if="recette.imageUrl"
              :src="`${BASE_URL}${recette.imageUrl}`"
              :alt="recette.nom"
            />
            <div v-else class="placeholder-thumbnail">
              <ion-icon :icon="restaurantOutline" />
            </div>
          </ion-thumbnail>
          <ion-label>
            <h2>{{ recette.nom }}</h2>
            <p>{{ recette.nomMg }}</p>
            <p>{{ recette.region }} • {{ recette.tempsMin }} min</p>
          </ion-label>
          <ion-text color="primary" slot="end">
            <strong>{{ formatAr(recette.coutAr) }}</strong>
          </ion-text>
        </ion-item>
      </ion-list>

      <!-- État vide -->
      <div v-else class="ion-padding ion-text-center">
        <ion-text color="medium">
          <p>Aucune recette trouvée.</p>
        </ion-text>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonText, IonButton, IonSpinner,
  IonRefresher, IonRefresherContent, IonChip, IonThumbnail, IonIcon,
  onIonViewWillEnter
} from '@ionic/vue';
import type { RefresherCustomEvent } from '@ionic/vue';
import { restaurantOutline } from 'ionicons/icons';
import api from '@/services/api';
import { formatAr } from '@/utils/format';
import type { Recette } from '@/types/recette';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const regions = ['Merina', 'Betsileo', 'Sakalava', 'Antandroy', 'Betsimisaraka'] as const;
const regionChoisie = ref<string | null>(null);
const recettes = ref<Recette[]>([]);
const chargement = ref(true);
const erreur = ref<string | null>(null);

async function charger() {
  chargement.value = true;
  erreur.value = null;
  try {
    recettes.value = await api.listeRecettes(regionChoisie.value || undefined);
  } catch (e: unknown) {
    erreur.value = "Impossible de charger les recettes.";
    console.error(e);
  } finally {
    chargement.value = false;
  }
}

async function rafraichir(event: RefresherCustomEvent) {
  await charger();
  event.target.complete();
}

// Recharger quand la région change
function watchRegion() {
  charger();
}

// Charger au montage et à chaque entrée
onMounted(charger);
onIonViewWillEnter(charger);
</script>

<style scoped>
.placeholder-thumbnail {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.placeholder-thumbnail ion-icon {
  font-size: 32px;
  color: #999;
}
</style>
