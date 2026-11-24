<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />

      <!-- La barre d'onglets, en bas de l'écran -->
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="recettes" href="/tabs/recettes">
          <ion-icon :icon="restaurantOutline" />
          <ion-label>Recettes</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="ajouter" href="/tabs/ajouter">
          <ion-icon :icon="addCircleOutline" />
          <ion-label>Ajouter</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="profil" href="/tabs/profil">
          <ion-icon :icon="personOutline" />
          <ion-label>Profil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonTabs, IonRouterOutlet, IonTabBar, 
  IonTabButton, IonIcon, IonLabel 
} from '@ionic/vue';
import { restaurantOutline, addCircleOutline, personOutline } from 'ionicons/icons';
</script>