<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Mon profil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="user" class="profile-card">
        <div class="avatar">
          <ion-icon :icon="personCircleOutline" />
        </div>
        <h2>{{ user.nom }}</h2>
        <p class="email">{{ user.email }}</p>
      </div>

      <!-- Bonus 9: Sélecteur de langue -->
      <div class="settings-section ion-margin-top">
        <h3>{{ t('profile.language') }}</h3>
        <ion-list lines="none">
          <ion-item button @click="setLanguage('fr')">
            <ion-label :color="lang === 'fr' ? 'primary' : ''">Français</ion-label>
            <ion-icon v-if="lang === 'fr'" :icon="restaurantOutline" slot="end" color="primary" />
          </ion-item>
          <ion-item button @click="setLanguage('mg')">
            <ion-label :color="lang === 'mg' ? 'primary' : ''">Malagasy</ion-label>
            <ion-icon v-if="lang === 'mg'" :icon="restaurantOutline" slot="end" color="primary" />
          </ion-item>
        </ion-list>
      </div>

      <!-- Bonus 10: Lien Calendrier des fêtes -->
      <div class="settings-section ion-margin-top">
        <ion-list lines="none">
          <ion-item button router-link="/tabs/fetes">
            <ion-icon :icon="calendarOutline" slot="start" color="primary" />
            <ion-label>{{ t('holiday.title') }}</ion-label>
          </ion-item>
        </ion-list>
      </div>

      <!-- Bonus 2: Section Favoris -->
      <div v-if="user" class="favorites-section ion-margin-top">
        <h3>{{ t('profile.favorites') }} ({{ recettesFavoris.length }})</h3>
        <ion-list v-if="recettesFavoris.length > 0">
          <ion-item
            v-for="recette in recettesFavoris"
            :key="recette.id"
            :router-link="`/recette/${recette.id}`"
            button
          >
            <ion-thumbnail slot="start">
              <img v-if="recette.imageUrl" :src="`${BASE_URL}${recette.imageUrl}`" />
              <div v-else class="placeholder-thumb"><ion-icon :icon="restaurantOutline" /></div>
            </ion-thumbnail>
            <ion-label>
              <h2>{{ lang === 'mg' ? recette.nomMg : recette.nom }}</h2>
              <p>{{ recette.region }}</p>
            </ion-label>
            <ion-icon :icon="heart" color="danger" slot="end" />
          </ion-item>
        </ion-list>
        <ion-text v-else color="medium">
          <p>{{ t('recettes.no_results') }}</p>
        </ion-text>
      </div>

      <ion-button
        expand="block"
        color="danger"
        class="ion-margin-top"
        @click="seDeconnecter"
      >
        <ion-icon slot="start" :icon="logOutOutline" />
        {{ t('profile.logout') }}
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonList, IonItem, IonLabel, IonText, IonThumbnail
} from '@ionic/vue';
import { personCircleOutline, logOutOutline, heart, restaurantOutline, calendarOutline } from 'ionicons/icons';
import { useAuth } from '@/composables/useAuth';
import { useFavoris } from '@/composables/useFavoris';
import { useI18n } from '@/composables/useI18n';
import api from '@/services/api';
import type { Recette } from '@/types/recette';
import { toastController } from '@ionic/vue';

const router = useRouter();
const { user, deconnexion } = useAuth();
const { listeFavoris } = useFavoris();
const { t, lang, setLanguage } = useI18n();
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const recettesFavoris = ref<Recette[]>([]);
const chargement = ref(false);

async function chargerRecettesFavoris() {
  if (listeFavoris.value.length === 0) {
    recettesFavoris.value = [];
    return;
  }
  
  chargement.value = true;
  try {
    // On charge toutes les recettes et on filtre localement pour simplifier
    const toutes = await api.listeRecettes();
    recettesFavoris.value = toutes.filter(r => listeFavoris.value.includes(r.id));
  } catch (e) {
    console.error("Erreur chargement favoris:", e);
  } finally {
    chargement.value = false;
  }
}

onMounted(chargerRecettesFavoris);

async function seDeconnecter() {
  deconnexion();
  const toast = await toastController.create({
    message: 'Déconnexion réussie',
    duration: 1500,
    position: 'top',
    color: 'medium',
  });
  await toast.present();
  router.push('/login');
}
</script>

<style scoped>
.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  background-color: #f5f5f5;
  border-radius: 16px;
  margin-bottom: 24px;
}

.avatar {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ion-color-primary);
  border-radius: 50%;
  margin-bottom: 16px;
}

.avatar ion-icon {
  font-size: 64px;
  color: white;
}

h2 {
  margin: 0 0 8px 0;
  font-size: 1.5em;
}

.email {
  margin: 0 0 4px 0;
  color: var(--ion-color-medium);
}

.uid {
  margin: 0;
  font-size: 0.8em;
  color: var(--ion-color-medium-shade);
}
</style>
