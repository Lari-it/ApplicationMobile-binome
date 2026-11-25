<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/recettes" :text="t('common.back')" />
        </ion-buttons>
        <ion-title>{{ t('holiday.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="chargement" class="ion-text-center">
        <ion-spinner />
      </div>

      <div v-else>
        <div v-for="(recettes, fete) in fetesGrouped" :key="fete" class="fete-section ion-margin-bottom">
          <ion-item-divider sticky color="light">
            <ion-label>
              <h2 class="fete-title">{{ fete }}</h2>
            </ion-label>
          </ion-item-divider>
          
          <ion-list>
            <ion-item v-for="recette in recettes" :key="recette.id" :router-link="`/recette/${recette.id}`" button>
              <ion-thumbnail slot="start">
                <img v-if="recette.imageUrl" :src="`${BASE_URL}${recette.imageUrl}`" />
                <div v-else class="placeholder-thumb"><ion-icon :icon="restaurantOutline" /></div>
              </ion-thumbnail>
              <ion-label>
                <h3>{{ lang === 'mg' ? recette.nomMg : recette.nom }}</h3>
                <p>{{ recette.region }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </div>

        <div v-if="Object.keys(fetesGrouped).length === 0" class="ion-text-center ion-padding">
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
  IonList, IonItem, IonLabel, IonItemDivider, IonButtons, IonBackButton,
  IonThumbnail, IonIcon, IonSpinner
} from '@ionic/vue';
import { restaurantOutline } from 'ionicons/icons';
import api from '@/services/api';
import type { Recette } from '@/types/recette';
import { useI18n } from '@/composables/useI18n';

const { t, lang } = useI18n();
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const toutesRecettes = ref<Recette[]>([]);
const chargement = ref(true);

const fetesGrouped = computed(() => {
  const groups: Record<string, Recette[]> = {};
  
  toutesRecettes.value.forEach(recette => {
    if (recette.fetes) {
      recette.fetes.forEach(fete => {
        if (!groups[fete]) {
          groups[fete] = [];
        }
        groups[fete].push(recette);
      });
    }
  });
  
  return groups;
});

async function charger() {
  chargement.value = true;
  try {
    toutesRecettes.value = await api.listeRecettes();
  } catch (e) {
    console.error(e);
  } finally {
    chargement.value = false;
  }
}

onMounted(charger);
</script>

<style scoped>
.fete-title {
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
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
