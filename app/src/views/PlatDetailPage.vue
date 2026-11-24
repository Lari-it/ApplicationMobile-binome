<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/menu"></ion-back-button>
        </ion-buttons>
        <ion-title>Détails du plat</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Indicateur de chargement -->
      <div v-if="chargement" class="ion-text-center ion-margin-top">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <!-- Message d'erreur -->
      <ion-text color="danger" v-else-if="erreur">
        <p>{{ erreur }}</p>
      </ion-text>

      <!-- Affichage du plat -->
      <ion-card v-else-if="plat">
        <ion-card-header>
          <ion-card-subtitle>{{ plat.categorie?.nom }}</ion-card-subtitle>
          <ion-card-title>{{ plat.nom }}</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <p>{{ plat.description }}</p>
          <p class="ion-margin-top">
            <strong>Prix : </strong>
            <ion-text color="primary"><strong>{{ formatAriary(Number(plat.prix)) }}</strong></ion-text>
          </p>
          <p v-if="riz">
            Avec du riz : <strong>{{ formatAriary(prixAvecRiz) }}</strong>
          </p>
          <ion-badge v-if="!plat.disponible" color="medium" class="ion-margin-top">Épuisé</ion-badge>

          <ion-button expand="block" color="primary" class="ion-margin-top" :disabled="!plat.disponible" @click="ajouterEtRetourner">
            Ajouter au panier
          </ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useIonRouter, toastController } from '@ionic/vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonSpinner, IonText,
  IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonBadge, IonButton
} from '@ionic/vue';
import api, { ErreurApi } from '@/services/api';
import { usePanier } from '@/composables/usePanier';
import { formatAriary } from '@/utils/format';
import type { Plat } from '@/types/gargote';

const route = useRoute();
const ionRouter = useIonRouter();
const { ajouter } = usePanier();

const plat = ref<Plat | null>(null);
const riz = ref<Plat | null>(null);
const chargement = ref(true);
const erreur = ref<string | null>(null);

const prixAvecRiz = computed(() => {
  if (!plat.value || !riz.value) return 0;
  return Number(plat.value.prix) + Number(riz.value.prix);
});

onMounted(async () => {
  const rawId = route.params.id;
  const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
  try {
    plat.value = await api.getPlat(id);
    riz.value = await api.getPlat(7);
  } catch (e: unknown) {
    if (e instanceof ErreurApi && e.statut === 404) {
      erreur.value = "Ce plat n'existe pas.";
    } else {
      erreur.value = "Impossible de charger les détails du plat.";
    }
    console.error(e);
  } finally {
    chargement.value = false;
  }
});

async function ajouterEtRetourner() {
  if (!plat.value) return;
  ajouter(plat.value);
  const toast = await toastController.create({
    message: `${plat.value.nom} ajouté au panier`,
    duration: 1500,
    position: 'top',
    color: 'secondary',
  });
  await toast.present();
  ionRouter.back();
}
</script>