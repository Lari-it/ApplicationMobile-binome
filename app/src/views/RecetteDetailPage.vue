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

      <!-- Détail de la recette -->
      <div v-else-if="recette">
        <!-- Image -->
        <div v-if="recette.imageUrl" class="recipe-image">
          <img :src="`${BASE_URL}${recette.imageUrl}`" :alt="recette.nom" />
        </div>

        <div class="ion-padding">
          <h1>{{ recette.nom }}</h1>
          <h2 class="ion-text-primary">{{ recette.nomMg }}</h2>
          <p class="region-badge">{{ recette.region }}</p>

          <div class="meta-info">
            <p><strong>Temps :</strong> {{ recette.tempsMin }} min</p>
            <p><strong>Coût :</strong> {{ formatAr(recette.coutAr) }}</p>
          </div>

          <h3>Description</h3>
          <p>{{ recette.description }}</p>

          <h3>Ingrédients</h3>
          <ion-list>
            <ion-item v-for="(ing, index) in recette.ingredients" :key="index">
              <ion-label>
                <h3>{{ ing.nom }}</h3>
                <p>{{ ing.quantite }}</p>
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
  IonButtons, IonBackButton, IonText, IonButton, IonSpinner, IonList, IonItem, IonLabel
} from '@ionic/vue';
import api from '@/services/api';
import { formatAr } from '@/utils/format';
import type { Recette } from '@/types/recette';

const route = useRoute();
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const recette = ref<Recette | null>(null);
const chargement = ref(true);
const erreur = ref<string | null>(null);

async function charger() {
  chargement.value = true;
  erreur.value = null;
  try {
    const id = route.params.id as string;
    recette.value = await api.recetteParId(id);
  } catch (e: unknown) {
    erreur.value = "Impossible de charger la recette.";
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

.region-badge {
  display: inline-block;
  background-color: var(--ion-color-primary);
  color: white;
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
  background-color: #f5f5f5;
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

h3 {
  font-size: 1.2em;
  margin: 24px 0 12px 0;
  color: var(--ion-color-primary);
}

.steps-list {
  padding-left: 20px;
  line-height: 1.6;
}

.steps-list li {
  margin-bottom: 8px;
}
</style>
