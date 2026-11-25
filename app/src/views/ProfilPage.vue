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

      <h3>Mes favoris ({{ mesFavoris.length }})</h3>
      <ion-list v-if="mesFavoris.length > 0">
        <ion-item
          v-for="recette in mesFavoris"
          :key="recette.id"
          :router-link="`/recette/${recette.id}`"
          button
        >
          <ion-icon slot="start" :icon="heart" color="danger" />
          <ion-label>{{ recette.nom }}</ion-label>
        </ion-item>
      </ion-list>
      <ion-text v-else color="medium">
        <p>Aucun favori pour le moment.</p>
      </ion-text>

      <h3 class="ion-margin-top">Mes recettes ({{ mesRecettes.length }})</h3>
      <div v-if="chargement" class="ion-text-center ion-padding">
        <ion-spinner />
      </div>
      <ion-list v-else-if="mesRecettes.length > 0">
        <ion-item
          v-for="recette in mesRecettes"
          :key="recette.id"
          :router-link="`/recette/${recette.id}`"
          button
        >
          <ion-label>
            <h2>{{ recette.nom }}</h2>
            <p>{{ recette.region }} - {{ recette.tempsMin }} min</p>
          </ion-label>
        </ion-item>
      </ion-list>
      <ion-text v-else color="medium">
        <p>Vous n'avez pas encore publié de recette.</p>
      </ion-text>

      <ion-button
        expand="block"
        color="danger"
        class="ion-margin-top"
        @click="seDeconnecter"
      >
        <ion-icon slot="start" :icon="logOutOutline" />
        Se déconnecter
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonList, IonItem, IonLabel, IonText, IonSpinner,
  useIonRouter, onIonViewWillEnter
} from '@ionic/vue';
import { personCircleOutline, logOutOutline, heart } from 'ionicons/icons';
import { useAuth } from '@/composables/useAuth';
import api from '@/services/api';
import type { Recette } from '@/types/recette';
import { useFavoris } from '@/composables/useFavoris';

const ionRouter = useIonRouter();
const { user, deconnexion } = useAuth();

const { listeFavoris, charger: chargerFavoris } = useFavoris();

const toutesRecettes = ref<Recette[]>([]);
const mesRecettes = computed(() =>
  toutesRecettes.value.filter(r => r.auteurId === user.value?.uid)
);
const mesFavoris = computed(() =>
  toutesRecettes.value.filter(r => listeFavoris.value.includes(r.id))
);
const chargement = ref(false);

async function chargerMesRecettes() {
  if (!user.value) return;
  chargerFavoris();
  chargement.value = true;
  try {
    toutesRecettes.value = await api.listeRecettes();
  } catch (e: unknown) {
    toutesRecettes.value = [];
    console.error(e);
  } finally {
    chargement.value = false;
  }
}

onIonViewWillEnter(chargerMesRecettes);

function seDeconnecter() {
  deconnexion();
  ionRouter.navigate('/login', 'root', 'replace');
}
</script>

<style scoped>
.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  background-color: rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.08);
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
  color: var(--ion-color-primary-contrast);
}

h2 {
  margin: 0 0 8px 0;
  font-size: 1.5em;
}

h3 {
  margin: 0 0 8px 0;
  color: var(--ion-color-primary);
}

.email {
  margin: 0;
  color: var(--ion-color-medium);
}
</style>
