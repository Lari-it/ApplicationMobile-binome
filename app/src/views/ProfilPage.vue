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
        <p class="uid">ID: {{ user.uid }}</p>
      </div>

      <div v-if="user" class="favorites-section ion-margin-top">
        <h3>Mes favoris ({{ listeFavoris.length }})</h3>
        <ion-list v-if="listeFavoris.length > 0">
          <ion-item
            v-for="recetteId in listeFavoris"
            :key="recetteId"
            :router-link="`/recette/${recetteId}`"
            button
          >
            <ion-icon :icon="heart" color="danger" slot="start" />
            <ion-label>Recette #{{ recetteId }}</ion-label>
          </ion-item>
        </ion-list>
        <ion-text v-else color="medium">
          <p>Aucun favori pour le moment.</p>
        </ion-text>
      </div>

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
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonList, IonItem, IonLabel, IonText
} from '@ionic/vue';
import { personCircleOutline, logOutOutline, heart } from 'ionicons/icons';
import { useAuth } from '@/composables/useAuth';
import { toastController } from '@ionic/vue';

const router = useRouter();
const { user, deconnexion } = useAuth();

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
