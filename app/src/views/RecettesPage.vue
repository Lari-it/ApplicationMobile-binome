<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Recettes Malagasy</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" @ion-refresh="rafraichir">
        <ion-refresher-content />
      </ion-refresher>

      <ion-searchbar
        v-model="recherche"
        placeholder="Rechercher une recette..."
        :debounce="250"
      />

      <div class="ion-padding-horizontal ion-padding-bottom">
        <ion-chip
          :outline="regionChoisie !== null"
          :color="regionChoisie === null ? 'primary' : undefined"
          @click="regionChoisie = null"
        >
          <ion-label>Toutes</ion-label>
        </ion-chip>
        <ion-chip
          v-for="region in regions"
          :key="region"
          :outline="regionChoisie !== region"
          :color="regionChoisie === region ? 'primary' : undefined"
          @click="regionChoisie = region"
        >
          <ion-label>{{ region }}</ion-label>
        </ion-chip>
        <ion-chip
          :outline="!favorisSeulement"
          :color="favorisSeulement ? 'danger' : undefined"
          @click="favorisSeulement = !favorisSeulement"
        >
          <ion-icon :icon="favorisSeulement ? heart : heartOutline" />
          <ion-label>Mes favoris</ion-label>
        </ion-chip>
      </div>

      <div v-if="chargement" class="ion-text-center ion-padding">
        <ion-spinner />
      </div>

      <div v-else-if="erreur" class="ion-padding">
        <ion-text color="danger">
          <p>{{ erreur }}</p>
        </ion-text>
        <ion-button expand="block" @click="charger">Réessayer</ion-button>
      </div>

      <ion-list v-else-if="recettes.length > 0">
        <ion-item
          v-for="recette in recettes"
          :key="recette.id"
          :router-link="`/recette/${recette.id}`"
          button
        >
          <ion-thumbnail slot="start">
            <img
              v-if="recette.imageUrl && !imagesEnErreur.has(recette.id)"
              :src="`${BASE_URL}${recette.imageUrl}`"
              :alt="recette.nom"
              @error="imagesEnErreur.add(recette.id)"
            />
            <div v-else class="placeholder-thumbnail">
              <ion-icon :icon="restaurantOutline" />
            </div>
          </ion-thumbnail>
          <ion-label>
            <h2>{{ recette.nom }}</h2>
            <p v-if="recette.nomMg !== recette.nom" class="nom-mg">{{ recette.nomMg }}</p>
            <p>{{ recette.region }} - {{ recette.tempsMin }} min</p>
          </ion-label>
          <ion-text slot="end" color="primary">
            <strong>{{ formatAr(recette.coutAr) }}</strong>
          </ion-text>
          <ion-button
            slot="end"
            fill="clear"
            :color="estFavori(recette.id) ? 'danger' : 'medium'"
            @click.stop.prevent="toggleFavori(recette.id)"
          >
            <ion-icon slot="icon-only" :icon="estFavori(recette.id) ? heart : heartOutline" />
          </ion-button>
        </ion-item>
      </ion-list>

      <div v-else class="ion-padding ion-text-center">
        <ion-text color="medium">
          <p>{{ messageVide }}</p>
        </ion-text>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonText, IonButton, IonSpinner,
  IonRefresher, IonRefresherContent, IonChip, IonThumbnail, IonIcon,
  IonSearchbar, onIonViewWillEnter
} from '@ionic/vue';
import type { RefresherCustomEvent } from '@ionic/vue';
import { restaurantOutline, heart, heartOutline } from 'ionicons/icons';
import api from '@/services/api';
import { formatAr } from '@/utils/format';
import type { Recette } from '@/types/recette';
import { useFavoris } from '@/composables/useFavoris';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const regions = ['Merina', 'Betsileo', 'Sakalava', 'Antandroy', 'Betsimisaraka'] as const;
const regionChoisie = ref<string | null>(null);
const recherche = ref('');
const favorisSeulement = ref(false);
const { estFavori, toggleFavori, listeFavoris, charger: chargerFavoris } = useFavoris();
const toutesRecettes = ref<Recette[]>([]);
const chargement = ref(true);
const erreur = ref<string | null>(null);
const imagesEnErreur = reactive(new Set<string>());

function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

const recettes = computed(() => {
  let liste = [...toutesRecettes.value];

  if (regionChoisie.value) {
    liste = liste.filter(r => r.region === regionChoisie.value);
  }

  if (favorisSeulement.value) {
    liste = liste.filter(r => listeFavoris.value.includes(r.id));
  }

  if (recherche.value.trim()) {
    const terme = normaliser(recherche.value.trim());
    liste = liste.filter(r =>
      normaliser(r.nom).includes(terme) ||
      normaliser(r.nomMg).includes(terme)
    );
  }

  return liste;
});

const messageVide = computed(() => {
  if (favorisSeulement.value) return 'Aucune recette en favori.';
  return regionChoisie.value
    ? 'Aucune recette pour cette région.'
    : 'Aucune recette trouvée.';
});

async function charger() {
  chargement.value = true;
  erreur.value = null;
  try {
    toutesRecettes.value = await api.listeRecettes();
  } catch (e: unknown) {
    erreur.value = 'Impossible de charger les recettes.';
    console.error(e);
  } finally {
    chargement.value = false;
  }
}

async function rafraichir(event: RefresherCustomEvent) {
  await charger();
  event.target.complete();
}

onIonViewWillEnter(() => {
  chargerFavoris();
  charger();
});
</script>

<style scoped>
.placeholder-thumbnail {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.08);
  border-radius: 8px;
}

.placeholder-thumbnail ion-icon {
  font-size: 28px;
  color: var(--ion-color-medium);
}

.nom-mg {
  font-style: italic;
}
</style>
