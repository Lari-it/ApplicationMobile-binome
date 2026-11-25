<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />

      <!-- La barre d'onglets, en bas de l'écran -->
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="recettes" href="/tabs/recettes">
          <ion-icon :icon="homeOutline" />
          <ion-label>Accueil</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="ajouter" href="/tabs/ajouter" class="onglet-ajout">
          <span class="bouton-ajout">
            <ion-icon :icon="add" />
          </span>
          <ion-label>Ajouter</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profil" href="/tabs/profil">
          <ion-icon :icon="happyOutline" />
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
import { homeOutline, add, happyOutline } from 'ionicons/icons';
</script>

<style scoped>
.onglet-ajout {
  overflow: visible;
}

.bouton-ajout {
  width: 46px;
  height: 46px;
  margin-top: -24px;
  border: 1.5px solid var(--kaly-ink);
  background: var(--kaly-yellow);
  border-radius: 50%;
  display: grid;
  place-items: center;
  box-shadow: 0 3px 0 var(--kaly-ink);
}

.bouton-ajout ion-icon {
  font-size: 24px;
  color: var(--kaly-on-accent);
  margin: 0;
}
</style>
