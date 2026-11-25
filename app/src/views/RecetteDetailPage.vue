<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/recettes" />
        </ion-buttons>
        <ion-title>Détail de la recette</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div v-if="chargement" class="ion-text-center ion-padding">
        <ion-spinner />
      </div>

      <div v-else-if="erreur" class="ion-padding">
        <ion-text color="danger">
          <p>{{ erreur }}</p>
        </ion-text>
        <ion-button expand="block" @click="charger">Réessayer</ion-button>
      </div>

      <div v-else-if="recette">
        <div v-if="recette.imageUrl && !imageEnErreur" class="recipe-image">
          <img
            :src="`${BASE_URL}${recette.imageUrl}`"
            :alt="recette.nom"
            @error="imageEnErreur = true"
          />
        </div>
        <div v-else class="recipe-image recipe-image-vide">
          <ion-icon :icon="restaurantOutline" />
        </div>

        <div class="ion-padding">
          <div class="titre-ligne">
            <div class="titre">
              <h1>{{ recette.nom }}</h1>
              <h2 v-if="recette.nomMg !== recette.nom" class="nom-mg">{{ recette.nomMg }}</h2>
            </div>
            <ion-button
              fill="clear"
              :color="estFavori(recette.id) ? 'danger' : 'medium'"
              @click="toggleFavori(recette.id)"
            >
              <ion-icon slot="icon-only" :icon="estFavori(recette.id) ? heart : heartOutline" />
            </ion-button>
          </div>
          <p class="region-badge">{{ recette.region }}</p>

          <div class="meta-info">
            <p><strong>Temps :</strong> {{ recette.tempsMin }} min</p>
            <p><strong>Coût :</strong> {{ formatAr(recette.coutAr) }}</p>
          </div>

          <h3>Description</h3>
          <p>{{ recette.description }}</p>

          <h3>Ingrédients</h3>
          <ion-item lines="none" class="portions">
            <ion-select
              v-model="portions"
              label="Portions"
              interface="popover"
            >
              <ion-select-option v-for="n in choixPortions" :key="n" :value="n">
                {{ n }} pers.
              </ion-select-option>
            </ion-select>
          </ion-item>
          <ion-list>
            <ion-item v-for="(ing, index) in recette.ingredients" :key="index">
              <ion-label>
                <h3 class="ingredient-nom">{{ ing.nom }}</h3>
                <p>{{ ajusterQuantite(ing.quantite, portions / PORTIONS_BASE) }}</p>
              </ion-label>
            </ion-item>
          </ion-list>

          <h3>Étapes</h3>
          <ol class="steps-list">
            <li v-for="(etape, index) in recette.etapes" :key="index">
              {{ etape }}
            </li>
          </ol>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonText, IonButton, IonSpinner,
  IonList, IonItem, IonLabel, IonIcon, IonSelect, IonSelectOption
} from '@ionic/vue';
import { restaurantOutline, heart, heartOutline } from 'ionicons/icons';
import api from '@/services/api';
import { formatAr, ajusterQuantite } from '@/utils/format';
import type { Recette } from '@/types/recette';
import { useFavoris } from '@/composables/useFavoris';

const route = useRoute();
const { estFavori, toggleFavori } = useFavoris();
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const recette = ref<Recette | null>(null);
const chargement = ref(true);
const erreur = ref<string | null>(null);
const imageEnErreur = ref(false);

// les quantites de base sont prevues pour 4 personnes
const PORTIONS_BASE = 4;
const choixPortions = [1, 2, 3, 4, 5, 6, 8, 10];
const portions = ref(PORTIONS_BASE);

async function charger() {
  chargement.value = true;
  portions.value = PORTIONS_BASE;
  imageEnErreur.value = false;
  erreur.value = null;
  try {
    const id = route.params.id as string;
    recette.value = await api.recetteParId(id);
  } catch (e: unknown) {
    const err = e as { statut?: number };
    if (err.statut === 404) {
      erreur.value = 'Recette introuvable.';
    } else {
      erreur.value = 'Impossible de charger la recette.';
    }
    console.error(e);
  } finally {
    chargement.value = false;
  }
}

onMounted(charger);
</script>

<style scoped>
.recipe-image {
  width: 100%;
  height: 250px;
  overflow: hidden;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-image-vide {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.08);
}

.recipe-image-vide ion-icon {
  font-size: 64px;
  color: var(--ion-color-medium);
}

.titre-ligne {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.titre {
  flex: 1;
}

.region-badge {
  display: inline-block;
  background-color: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.9em;
  margin: 8px 0;
}

.meta-info {
  display: flex;
  gap: 16px;
  margin: 16px 0;
  padding: 12px;
  background-color: rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.08);
  border-radius: 8px;
}

.meta-info p {
  margin: 0;
}

h1 {
  font-size: 1.8em;
  margin: 0 0 8px 0;
}

h2 {
  font-size: 1.3em;
  margin: 0 0 12px 0;
}

.nom-mg {
  font-style: italic;
  font-weight: normal;
  color: var(--ion-color-primary);
}

h3 {
  font-size: 1.2em;
  margin: 24px 0 12px 0;
  color: var(--ion-color-primary);
}

.ingredient-nom {
  margin: 0;
  font-size: 1em;
}

.portions {
  --padding-start: 0;
  max-width: 220px;
}

.steps-list {
  padding-left: 20px;
  line-height: 1.6;
}

.steps-list li {
  margin-bottom: 8px;
}
</style>
