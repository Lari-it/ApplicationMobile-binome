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

      <!-- Barre de recherche -->
      <ion-searchbar
        v-model="recherche"
        placeholder="Rechercher une recette..."
        class="ion-padding-horizontal"
      />

      <!-- Filtre par région -->
      <div class="ion-padding-horizontal ion-padding-bottom">
        <ion-chip
          :outline="regionChoisie !== null"
          :color="regionChoisie === null ? 'primary' : undefined"
          @click="regionChoisie = null"
        >
          <ion-label>Toutes</ion-label>
        </ion-chip>
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
          :outline="!afficherFavorisSeulement"
          :color="afficherFavorisSeulement ? 'danger' : undefined"
          @click="afficherFavorisSeulement = !afficherFavorisSeulement"
        >
          <ion-icon :icon="afficherFavorisSeulement ? heart : heartOutlineIcon" slot="start" />
          <ion-label>Mes favoris</ion-label>
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
          <ion-thumbnail slot="start" class="recipe-thumbnail">
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
            <p v-if="recette.nomMg !== recette.nom" class="nom-mg">{{ recette.nomMg }}</p>
            <p>{{ recette.region }} • {{ recette.tempsMin }} min</p>
          </ion-label>
          <div slot="end" class="end-content">
            <ion-button
              :color="estFavori(recette.id) ? 'danger' : 'medium'"
              fill="clear"
              @click.stop="toggleFavori(recette.id)"
            >
              <ion-icon :icon="estFavori(recette.id) ? heart : heartOutlineIcon" />
            </ion-button>
            <ion-text color="primary">
              <strong>{{ formatAr(recette.coutAr) }}</strong>
            </ion-text>
          </div>
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
import { ref, onMounted, computed, watch } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonText, IonButton, IonSpinner,
  IonRefresher, IonRefresherContent, IonChip, IonThumbnail, IonIcon,
  IonSearchbar, onIonViewWillEnter
} from '@ionic/vue';
import type { RefresherCustomEvent } from '@ionic/vue';
import { restaurantOutline, heart, heartOutline as heartOutlineIcon } from 'ionicons/icons';
import api from '@/services/api';
import { formatAr } from '@/utils/format';
import type { Recette } from '@/types/recette';
import { useFavoris } from '@/composables/useFavoris';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const { estFavori, toggleFavori, listeFavoris } = useFavoris();

const regions = ['Merina', 'Betsileo', 'Sakalava', 'Antandroy', 'Betsimisaraka'] as const;
const regionChoisie = ref<string | null>(null);
const recherche = ref('');
const afficherFavorisSeulement = ref(false);
const toutesRecettes = ref<Recette[]>([]);
const chargement = ref(true);
const erreur = ref<string | null>(null);

// Normaliser une chaîne pour ignorer les accents et la casse
function normaliser(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

// Recettes filtrées par région, recherche et favoris
const recettes = computed(() => {
  let liste = [...toutesRecettes.value];
  
  // Filtre par région
  if (regionChoisie.value) {
    liste = liste.filter(r => r.region === regionChoisie.value);
  }
  
  // Filtre par favoris
  if (afficherFavorisSeulement.value) {
    liste = liste.filter(r => listeFavoris.value.includes(r.id));
  }
  
  // Filtre par recherche
  if (recherche.value.trim()) {
    const terme = normaliser(recherche.value.trim());
    liste = liste.filter(r => 
      normaliser(r.nom).includes(terme) ||
      normaliser(r.nomMg).includes(terme)
    );
  }
  
  return liste;
});

async function charger() {
  chargement.value = true;
  erreur.value = null;
  try {
    toutesRecettes.value = await api.listeRecettes();
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

// Charger au montage et à chaque entrée
onMounted(charger);
onIonViewWillEnter(charger);
</script>

<style scoped>
.recipe-thumbnail {
  margin-right: 12px;
}

.placeholder-thumbnail {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.placeholder-thumbnail ion-icon {
  font-size: 32px;
  color: var(--ion-color-medium);
}

.nom-mg {
  font-style: italic;
  color: var(--ion-color-medium-shade);
}

.end-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
</style>
