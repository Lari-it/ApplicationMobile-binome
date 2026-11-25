<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />

      <!-- La barre d'onglets, en bas de l'écran -->
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="recettes" href="/tabs/recettes">
          <ion-icon :icon="restaurantOutline" />
          <ion-label>{{ t('recettes.tab') }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="ajouter" href="/tabs/ajouter">
          <ion-icon :icon="addCircleOutline" />
          <ion-label>{{ t('recettes.add_tab') }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="courses" href="/tabs/courses">
          <ion-icon :icon="cartOutline" />
          <ion-label>{{ t('shopping_list.tab') }}</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="profil" href="/tabs/profil">
          <ion-icon :icon="personOutline" />
          <ion-label>{{ t('profile.tab') }}</ion-label>
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
import { restaurantOutline, addCircleOutline, personOutline, cartOutline } from 'ionicons/icons';
import { useI18n } from '@/composables/useI18n';

const { t } = useI18n();
</script>