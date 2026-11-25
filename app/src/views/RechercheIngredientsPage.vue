<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/recettes" :text="t('common.back')" />
        </ion-buttons>
        <ion-title>{{ t('recettes.cooking_question') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="instruction ion-margin-bottom">
        <p>{{ t('recettes.select_ingredients') }}</p>
      </div>

      <!-- Liste des ingrédients disponibles à cocher -->
      <div class="ingredients-grid">
        <ion-chip
          v-for="ing in ingredientsUniques"
          :key="ing"
          :outline="!selection.includes(ing)"
          :color="selection.includes(ing) ? 'primary' : undefined"
          @click="toggleSelection(ing)"
        >
          <ion-label>{{ ing }}</ion-label>
        </ion-chip>
      </div>

      <div class="results-section ion-margin-top">
        <h3>{{ t('recettes.results') }} ({{ recettesClassees.length }})</h3>
        
        <ion-list v-if="recettesClassees.length > 0">
          <ion-item v-for="res in recettesClassees" :key="res.recette.id" :router-link="`/recette/${res.recette.id}`" button>
            <ion-thumbnail slot="start">
              <img v-if="res.recette.imageUrl" :src="`${BASE_URL}${res.recette.imageUrl}`" />
              <div v-else class="placeholder-thumb"><ion-icon :icon="restaurantOutline" /></div>
            </ion-thumbnail>
            <ion-label>
              <h2>{{ lang === 'mg' ? res.recette.nomMg : res.recette.nom }}</h2>
              <p>{{ res.correspondances }} / {{ res.recette.ingredients.length }} {{ t('recettes.owned_ingredients') }}</p>
              <p v-if="res.manquants.length > 0" color="danger" class="manquants">
                {{ t('recettes.missing') }} : {{ res.manquants.join(', ') }}
              </p>
              <p v-else color="success" class="complet">{{ t('recettes.all_owned') }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
        
        <div v-else-if="selection.length > 0" class="ion-text-center ion-padding">
          <p>{{ t('recettes.no_results') }}</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonButtons, IonBackButton,
  IonThumbnail, IonIcon, IonChip
} from '@ionic/vue';
import { restaurantOutline } from 'ionicons/icons';
import api from '@/services/api';
import type { Recette } from '@/types/recette';
import { useI18n } from '@/composables/useI18n';

const { t, lang } = useI18n();
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const toutesRecettes = ref<Recette[]>([]);
const selection = ref<string[]>([]);

const ingredientsUniques = computed(() => {
  const set = new Set<string>();
  toutesRecettes.value.forEach(r => {
    r.ingredients.forEach(i => set.add(i.nom.toLowerCase()));
  });
  return Array.from(set).sort();
});

const recettesClassees = computed(() => {
  if (selection.value.length === 0) return [];
  
  return toutesRecettes.value
    .map(r => {
      const match = r.ingredients.filter(i => selection.value.includes(i.nom.toLowerCase()));
      const manquants = r.ingredients
        .filter(i => !selection.value.includes(i.nom.toLowerCase()))
        .map(i => i.nom);
        
      return {
        recette: r,
        correspondances: match.length,
        manquants
      };
    })
    .filter(res => res.correspondances > 0)
    .sort((a, b) => b.correspondances - a.correspondances);
});

function toggleSelection(ing: string) {
  const index = selection.value.indexOf(ing);
  if (index > -1) {
    selection.value.splice(index, 1);
  } else {
    selection.value.push(ing);
  }
}

async function charger() {
  try {
    toutesRecettes.value = await api.listeRecettes();
  } catch (e) {
    console.error(e);
  }
}

onMounted(charger);
</script>

<style scoped>
.ingredients-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.manquants {
  font-size: 0.8em;
  color: var(--ion-color-danger);
  font-style: italic;
}

.complet {
  font-size: 0.8em;
  color: var(--ion-color-success);
  font-weight: bold;
}

.placeholder-thumb {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eee;
  border-radius: 4px;
}
</style>
