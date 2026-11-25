<template>
  <ion-page>
    <ion-content>
      <div v-if="chargement" class="ion-text-center ion-padding haut">
        <ion-spinner />
      </div>

      <div v-else-if="erreur" class="kaly-vide haut">
        <p>{{ erreur }}</p>
        <ion-button class="kaly-btn" @click="charger">Réessayer</ion-button>
        <ion-button class="kaly-btn-contour" @click="retour">Retour</ion-button>
      </div>

      <div v-else-if="recette" class="sheet">
        <div class="sheet-photo">
          <img
            v-if="recette.imageUrl && !imageEnErreur"
            :src="`${BASE_URL}${recette.imageUrl}`"
            :alt="recette.nom"
            @error="imageEnErreur = true"
          />
          <ion-icon v-else :icon="restaurantOutline" class="photo-icone" />
          <button class="close" aria-label="Retour" @click="retour">
            <ion-icon :icon="arrowBack" />
          </button>
          <button class="close coeur" aria-label="Favori" @click="toggleFavori(recette.id)">
            <ion-icon :icon="estFavori(recette.id) ? heart : heartOutline" />
          </button>
        </div>

        <div class="kaly-kicker">Carnet de recettes · {{ recette.region }}</div>
        <h2>{{ recette.nom }}</h2>
        <p v-if="recette.nomMg !== recette.nom" class="nom-mg">{{ recette.nomMg }}</p>
        <p class="desc">{{ recette.description }}</p>

        <div class="sheet-stats">
          <span class="kaly-pastille">◷ {{ recette.tempsMin }} min</span>
          <span class="kaly-pastille">✳ {{ formatAr(recette.coutAr) }}</span>
          <span class="kaly-pastille">{{ recette.region }}</span>
        </div>

        <div class="titre-portions">
          <h3>Dans le panier</h3>
          <ion-select
            v-model="portions"
            interface="popover"
            class="portions"
            aria-label="Portions"
          >
            <ion-select-option v-for="n in choixPortions" :key="n" :value="n">
              {{ n }} pers.
            </ion-select-option>
          </ion-select>
        </div>
        <div v-for="(ing, index) in recette.ingredients" :key="index" class="ingredient">
          <label><input type="checkbox" />{{ ing.nom }}</label>
          <em>{{ ajusterQuantite(ing.quantite, portions / PORTIONS_BASE) }}</em>
        </div>

        <h3>On s’y met</h3>
        <div v-for="(etape, index) in recette.etapes" :key="index" class="step">
          <b>{{ index + 1 }}</b>
          <div>{{ etape }}</div>
        </div>

        <ion-button expand="block" class="kaly-btn favori" @click="toggleFavori(recette.id)">
          {{ estFavori(recette.id) ? '♥ Enregistrée dans mes favoris' : '♡ Ajouter à mes favoris' }}
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage, IonContent, IonButton, IonSpinner,
  IonIcon, IonSelect, IonSelectOption, useIonRouter
} from '@ionic/vue';
import { restaurantOutline, heart, heartOutline, arrowBack } from 'ionicons/icons';
import api from '@/services/api';
import { formatAr, ajusterQuantite } from '@/utils/format';
import type { Recette } from '@/types/recette';
import { useFavoris } from '@/composables/useFavoris';

const route = useRoute();
const ionRouter = useIonRouter();
const { estFavori, toggleFavori } = useFavoris();
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const recette = ref<Recette | null>(null);
const chargement = ref(true);
const erreur = ref<string | null>(null);
const imageEnErreur = ref(false);

// les quantites de base sont prevues pour 4 personnes
const PORTIONS_BASE = 4;
const choixPortions = [1, 2, 3, 4, 5, 6, 8, 10];
const portions = ref(PORTIONS_BASE);

function retour() {
  if (ionRouter.canGoBack()) {
    ionRouter.back();
  } else {
    ionRouter.navigate('/tabs/recettes', 'back', 'replace');
  }
}

async function charger() {
  chargement.value = true;
  portions.value = PORTIONS_BASE;
  imageEnErreur.value = false;
  erreur.value = null;
  try {
    const id = route.params.id as string;
    recette.value = await api.recetteParId(id);
  } catch (e: unknown) {
    const err = e as { statut?: number };
    if (err.statut === 404) {
      erreur.value = 'Recette introuvable.';
    } else {
      erreur.value = 'Impossible de charger la recette.';
    }
    console.error(e);
  } finally {
    chargement.value = false;
  }
}

onMounted(charger);
</script>

<style scoped>
.haut {
  padding-top: calc(env(safe-area-inset-top) + 40px);
}

.sheet {
  padding: 0 18px 40px;
}

.sheet-photo {
  height: 260px;
  margin: 0 -18px 15px;
  position: relative;
  background: var(--kaly-red);
  border-bottom: 1.6px solid var(--kaly-ink);
  border-radius: 0 0 27px 27px;
  overflow: hidden;
  display: grid;
  place-items: center;
}

.sheet-photo img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-icone {
  font-size: 90px;
  color: rgba(255, 255, 255, 0.4);
}

.close {
  position: absolute;
  top: calc(env(safe-area-inset-top) + 13px);
  left: 15px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1.3px solid #201d24;
  background: #fff6df;
  color: #201d24;
  display: grid;
  place-items: center;
  font-size: 19px;
  cursor: pointer;
}

.close.coeur {
  left: auto;
  right: 15px;
  color: #c92e26;
}

h2 {
  font: 400 31px/0.94 var(--kaly-font-titre);
  letter-spacing: -0.06em;
  margin: 6px 0 6px;
}

.nom-mg {
  margin: 0 0 8px;
  font-style: italic;
  color: var(--kaly-red-dark);
  font-weight: 700;
}

.desc {
  font-size: 13px;
  line-height: 1.55;
  color: var(--kaly-muted);
  margin: 0 0 14px;
}

.sheet-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

h3 {
  font: 400 19px var(--kaly-font-titre);
  letter-spacing: -0.05em;
  margin: 19px 0 10px;
}

.titre-portions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.portions {
  flex: 0 0 auto;
  max-width: 130px;
  border: 1.3px solid var(--kaly-ink);
  border-radius: 30px;
  padding: 0 12px;
  min-height: 34px;
  background: var(--kaly-yellow);
  color: var(--kaly-on-accent);
  font: 700 11px var(--kaly-font-mono);
}

.ingredient {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px dashed var(--kaly-line);
  font-size: 13px;
}

.ingredient label {
  display: flex;
  align-items: center;
  gap: 9px;
}

.ingredient input {
  accent-color: var(--kaly-red);
  width: 16px;
  height: 16px;
}

.ingredient em {
  font: normal 11px var(--kaly-font-mono);
  color: var(--kaly-muted);
  white-space: nowrap;
}

.step {
  display: grid;
  grid-template-columns: 27px 1fr;
  gap: 10px;
  margin: 13px 0;
  font-size: 13px;
  line-height: 1.5;
}

.step b {
  height: 26px;
  width: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--kaly-green);
  border: 1px solid var(--kaly-ink);
  font: 700 11px var(--kaly-font-mono);
  color: var(--kaly-on-accent);
}

.favori {
  margin-top: 20px;
}
</style>
