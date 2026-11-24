<template>
  <!-- ion-page : l'enveloppe obligatoire de chaque page -->
  <ion-page>
    <!-- En-tête fixe en haut de l'écran -->
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Menu du jour</ion-title>
      </ion-toolbar>

      <!-- Barre de recherche -->
      <ion-toolbar>
        <ion-searchbar v-model="recherche" placeholder="Rechercher un plat" :debounce="250" />
      </ion-toolbar>

      <!-- Troisième barre : Filtre par catégorie -->
      <ion-toolbar>
        <ion-segment v-model="categorieChoisie" scrollable @ion-change="charger">
          <ion-segment-button value="toutes">
            <ion-label>Tout</ion-label>
          </ion-segment-button>
          <ion-segment-button v-for="c in categories" :key="c.id" :value="String(c.id)">
            <ion-label>{{ c.nom }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <!-- Zone qui défile -->
    <ion-content>
      <!-- Tirer pour rafraîchir -->
      <ion-refresher slot="fixed" @ion-refresh="rafraichir">
        <ion-refresher-content />
      </ion-refresher>

      <!-- 1. Chargement en cours -->
      <div v-if="chargement" class="ion-text-center ion-padding">
        <ion-spinner />
      </div>

      <!-- 2. Erreur -->
      <div v-else-if="erreur" class="ion-padding">
        <ion-text color="danger">
          <p>{{ erreur }}</p>
        </ion-text>
        <ion-button expand="block" @click="charger">Réessayer</ion-button>
      </div>

      <!-- 3. La liste des plats filtrés -->
      <template v-else>
        <ion-list v-if="platsFiltres.length > 0">
          <ion-item v-for="plat in platsFiltres" :key="plat.id" :router-link="`/tabs/menu/${plat.id}`">
            <ion-label>
              <h2>{{ plat.nom }}</h2>
              <p>{{ plat.description }}</p>
              <p>{{ plat.categorie?.nom }}</p>
            </ion-label>
            <ion-text color="primary"><strong>{{ formatAriary(Number(plat.prix)) }}</strong></ion-text>
            <ion-badge v-if="!plat.disponible" color="medium">Épuisé</ion-badge>
            <ion-button
              slot="end"
              fill="clear"
              :disabled="!plat.disponible"
              @click.stop.prevent="ajouterAuPanier(plat)"
            >
              <ion-icon slot="icon-only" :icon="addCircleOutline" />
            </ion-button>
          </ion-item>
        </ion-list>

        <!-- Message si aucun plat ne correspond -->
        <p v-else class="ion-padding ion-text-center">Aucun plat ne correspond.</p>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonSpinner, IonText, IonButton, IonBadge, IonSearchbar,
  IonRefresher, IonRefresherContent, IonSegment, IonSegmentButton,
  IonIcon, toastController
} from '@ionic/vue';
import type { RefresherCustomEvent } from '@ionic/vue';
import api from '@/services/api';
import { formatAriary } from '@/utils/format';
import { addCircleOutline } from 'ionicons/icons';
import { usePanier } from '@/composables/usePanier';
import type { Categorie, Plat } from '@/types/gargote';

const plats = ref<Plat[]>([]);
const categories = ref<Categorie[]>([]);
const categorieChoisie = ref('toutes');
const chargement = ref(true);
const erreur = ref<string | null>(null);
const { ajouter } = usePanier();
const recherche = ref('');

const platsFiltres = computed(() => {
  const terme = recherche.value.toLowerCase().trim();
  if (!terme) return plats.value;
  return plats.value.filter(plat =>
    plat.nom.toLowerCase().includes(terme)
  );
});

async function charger() {
  chargement.value = true;
  erreur.value = null;
  try {
    plats.value = await api.getPlats(categorieChoisie.value);
  } catch (e: unknown) {
    erreur.value = "Impossible de joindre l'API. Est-elle lancée ?";
    console.error(e);
  } finally {
    chargement.value = false;
  }
}

async function rafraichir(event: RefresherCustomEvent) {
  await charger();
  event.target.complete();
}

async function ajouterAuPanier(plat: Plat) {
  ajouter(plat);
  const toast = await toastController.create({
    message: `${plat.nom} ajouté au panier`,
    duration: 1500,
    position: 'top',
    color: 'secondary',
  });
  await toast.present();
}

// Chargement initial des données
onMounted(async () => {
  try {
    categories.value = await api.getCategories();
  } catch (e: unknown) {
    console.error("Erreur chargement catégories", e);
  }
  await charger();
});
</script>