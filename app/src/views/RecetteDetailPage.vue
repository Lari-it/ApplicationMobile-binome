<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button :default-href="'/tabs/recettes'" :text="t('common.back')" />
        </ion-buttons>
        <ion-title>{{ t('recettes.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Chargement -->
      <div v-if="chargement" class="ion-text-center ion-padding">
        <ion-spinner />
      </div>

      <!-- Erreur -->
      <div v-else-if="erreur" class="ion-padding">
        <ion-text color="danger">
          <p>{{ erreur }}</p>
        </ion-text>
        <ion-button expand="block" @click="charger">{{ t('common.error') }}</ion-button>
      </div>

      <!-- Détail de la recette -->
      <div v-else-if="recette">
        <!-- Image -->
        <div v-if="recette.imageUrl" class="recipe-image">
          <img :src="`${BASE_URL}${recette.imageUrl}`" :alt="recette.nom" />
        </div>

        <div class="ion-padding">
          <div class="header-row">
            <div class="title-section">
              <h1>{{ lang === 'mg' ? recette.nomMg : recette.nom }}</h1>
              <h2 v-if="lang === 'fr' && recette.nomMg !== recette.nom" class="ion-text-primary nom-mg">{{ recette.nomMg }}</h2>
            </div>
            <ion-button
              :color="estFavori(recette.id) ? 'danger' : 'medium'"
              fill="clear"
              @click="toggleFavori(recette.id)"
            >
              <ion-icon :icon="estFavori(recette.id) ? heart : heartOutline" />
            </ion-button>
          </div>
          <p class="region-badge">{{ recette.region }}</p>

          <div class="meta-info">
            <p><strong>{{ t('details.time') }} :</strong> {{ recette.tempsMin }} min</p>
            <p><strong>{{ t('details.cost') }} :</strong> {{ formatAr(recette.coutAr) }}</p>
          </div>

          <!-- Bonus 4: Portions -->
          <div class="portions-selector ion-margin-bottom">
            <ion-label><strong>{{ t('details.portions') }} :</strong></ion-label>
            <ion-segment v-model="nbPortions" @ion-change="recalculerPortions">
              <ion-segment-button v-for="p in [2, 4, 6, 10, 20]" :key="p" :value="p">
                <ion-label>{{ p }}</ion-label>
              </ion-segment-button>
            </ion-segment>
          </div>

          <h3>{{ t('details.ingredients') }}</h3>
          <ion-list>
            <ion-item v-for="(ing, index) in ingredientsCalcules" :key="index">
              <ion-label>
                <h3>{{ lang === 'mg' && ing.nomMg ? ing.nomMg : ing.nom }}</h3>
                <p>{{ ing.quantiteAffichee }}</p>
                <p v-if="étranger && (lang === 'mg' ? (ing.substitutsMg || ing.substituts) : ing.substituts)" class="substitute">
                  <ion-icon :icon="helpCircleOutline" /> {{ t('details.substitutes') }}: {{ lang === 'mg' ? (ing.substitutsMg || ing.substituts) : ing.substituts }}
                </p>
              </ion-label>
            </ion-item>
          </ion-list>

          <ion-button v-if="recette.ingredients.some(i => i.substituts)" 
            expand="block" 
            fill="outline" 
            size="small"
            @click="étranger = !étranger"
          >
            {{ t('details.abroad_mode') }}
          </ion-button>

          <h3>{{ t('details.steps') }}</h3>
          <ol class="steps-list">
            <li v-for="(etape, index) in recette.etapes" :key="index">
              <template v-if="typeof etape === 'string'">
                {{ etape }}
              </template>
              <template v-else>
                {{ lang === 'mg' && etape.descriptionMg ? etape.descriptionMg : etape.description }}
                <ion-badge v-if="etape.dureeMin" color="medium" mode="ios" class="ion-margin-start">
                  {{ etape.dureeMin }} min
                </ion-badge>
              </template>
            </li>
          </ol>

          <!-- Bonus 6: Bouton Cuisiner -->
          <ion-button expand="block" class="ion-margin-top" color="success" :router-link="`/cuisine/${recette.id}`">
            <ion-icon :icon="restaurantOutline" slot="start" />
            {{ t('details.cook_mode') }}
          </ion-button>

          <!-- Bonus 7: Bouton Liste de courses -->
          <ion-button expand="block" fill="outline" class="ion-margin-top" @click="ajouterALaListe">
            <ion-icon :icon="cartOutline" slot="start" />
            {{ t('details.add_to_list') }}
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonText, IonButton, IonSpinner, IonList, IonItem, IonLabel, IonIcon,
  IonSegment, IonSegmentButton, IonBadge
} from '@ionic/vue';
import { heart, heartOutline, restaurantOutline, helpCircleOutline, cartOutline } from 'ionicons/icons';
import api from '@/services/api';
import { formatAr } from '@/utils/format';
import type { Recette } from '@/types/recette';
import { useFavoris } from '@/composables/useFavoris';
import { useCourses } from '@/composables/useCourses';
import { useI18n } from '@/composables/useI18n';
import { toastController } from '@ionic/vue';

const route = useRoute();
const { estFavori, toggleFavori } = useFavoris();
const { ajouterIngredients } = useCourses();
const { t, lang } = useI18n();
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const recette = ref<Recette | null>(null);
const chargement = ref(true);
const erreur = ref<string | null>(null);

// Bonus 4 & 12
const nbPortions = ref(4);
const étranger = ref(false);

const ingredientsCalcules = computed(() => {
  if (!recette.value) return [];
  const ratio = nbPortions.value / (recette.value.portions || 4);
  
  return recette.value.ingredients.map(ing => {
    let quantiteAffichee = ing.quantite;
    let qteCalculee = ing.quantiteNum;
    
    if (ing.quantiteNum) {
      qteCalculee = Math.round(ing.quantiteNum * ratio * 100) / 100;
      quantiteAffichee = `${qteCalculee} ${ing.unite || ''}`;
      
      // Bonus 5: Pluriels simples pour les unités courantes
      if (qteCalculee > 1 && ing.unite) {
        if (['cuillère à soupe', 'cuillère à café', 'verre', 'pièce'].includes(ing.unite)) {
          quantiteAffichee = `${qteCalculee} ${ing.unite}s`;
        }
      }
    }
    
    return {
      ...ing,
      quantiteNum: qteCalculee,
      quantiteAffichee
    };
  });
});

async function ajouterALaListe() {
  if (!recette.value) return;
  
  ajouterIngredients(ingredientsCalcules.value.map(i => ({
    nom: i.nom,
    quantite: i.quantiteAffichee,
    quantiteNum: i.quantiteNum,
    unite: i.unite,
    substituts: i.substituts
  })), recette.value.nom);

  const toast = await toastController.create({
    message: 'Ingrédients ajoutés à la liste de courses',
    duration: 2000,
    color: 'success',
    position: 'bottom'
  });
  await toast.present();
}

async function charger() {
  chargement.value = true;
  erreur.value = null;
  try {
    const id = route.params.id as string;
    recette.value = await api.recetteParId(id);
    if (recette.value?.portions) {
      nbPortions.value = recette.value.portions;
    }
  } catch (e: unknown) {
    const err = e as { statut?: number; message?: string };
    if (err.statut === 404) {
      erreur.value = "Recette introuvable.";
    } else {
      erreur.value = "Impossible de charger la recette.";
    }
    console.error(e);
  } finally {
    chargement.value = false;
  }
}

function recalculerPortions(ev: any) {
  nbPortions.value = parseInt(ev.detail.value);
}

onMounted(charger);
</script>

<style scoped>
.recipe-image {
  width: 100%;
  height: 250px;
  overflow: hidden;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.region-badge {
  display: inline-block;
  background-color: var(--ion-color-primary);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.9em;
  margin: 8px 0;
}

.meta-info {
  display: flex;
  gap: 16px;
  margin: 16px 0;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.meta-info p {
  margin: 0;
}

h1 {
  font-size: 1.8em;
  margin: 0 0 8px 0;
}

h2 {
  font-size: 1.3em;
  margin: 0 0 12px 0;
}

.nom-mg {
  font-style: italic;
  font-weight: normal;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.title-section {
  flex: 1;
}

h3 {
  font-size: 1.2em;
  margin: 24px 0 12px 0;
  color: var(--ion-color-primary);
}

.steps-list {
  padding-left: 20px;
  line-height: 1.6;
}

.steps-list li {
  margin-bottom: 8px;
}

.substitute {
  color: var(--ion-color-success);
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 4px;
}

.substitute ion-icon {
  font-size: 1.1em;
}

.portions-selector {
  background-color: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
}
</style>
