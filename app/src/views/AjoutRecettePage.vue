<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Ajouter une recette</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="erreur" class="ion-margin-bottom">
        <ion-alert
          :is-open="!!erreur"
          header="Erreur"
          :message="erreur"
          :buttons="['OK']"
          @did-dismiss="erreur = null"
        />
      </div>

      <ion-item class="ion-margin-bottom">
        <ion-label position="floating">Nom (français)</ion-label>
        <ion-input v-model="form.nom" required />
      </ion-item>

      <ion-item class="ion-margin-bottom">
        <ion-label position="floating">Nom (malagasy)</ion-label>
        <ion-input v-model="form.nomMg" required />
      </ion-item>

      <ion-item class="ion-margin-bottom">
        <ion-label position="floating">Région</ion-label>
        <ion-select v-model="form.region" placeholder="Sélectionner une région">
          <ion-select-option value="Merina">Merina</ion-select-option>
          <ion-select-option value="Betsileo">Betsileo</ion-select-option>
          <ion-select-option value="Sakalava">Sakalava</ion-select-option>
          <ion-select-option value="Antandroy">Antandroy</ion-select-option>
          <ion-select-option value="Betsimisaraka">Betsimisaraka</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item class="ion-margin-bottom">
        <ion-label position="floating">Description</ion-label>
        <ion-textarea v-model="form.description" :rows="3" required />
      </ion-item>

      <h3>Ingrédients</h3>
      <div v-for="(ing, index) in form.ingredients" :key="index" class="ingredient-row">
        <ion-item class="ion-margin-bottom">
          <ion-label position="floating">Nom</ion-label>
          <ion-input v-model="ing.nom" />
        </ion-item>
        <ion-item class="ion-margin-bottom">
          <ion-label position="floating">Quantité</ion-label>
          <ion-input v-model="ing.quantite" />
        </ion-item>
        <ion-button color="danger" fill="clear" @click="retirerIngredient(index)">
          <ion-icon slot="icon-only" :icon="trashOutline" />
        </ion-button>
      </div>
      <ion-button expand="block" fill="outline" @click="ajouterIngredient">
        <ion-icon slot="start" :icon="addOutline" />
        Ajouter un ingrédient
      </ion-button>

      <h3>Étapes</h3>
      <div v-for="(etape, index) in form.etapes" :key="index" class="etape-row">
        <ion-item class="ion-margin-bottom">
          <ion-label position="floating">Étape {{ index + 1 }}</ion-label>
          <ion-textarea v-model="form.etapes[index]" :rows="2" />
        </ion-item>
        <ion-button color="danger" fill="clear" @click="retirerEtape(index)">
          <ion-icon slot="icon-only" :icon="trashOutline" />
        </ion-button>
      </div>
      <ion-button expand="block" fill="outline" @click="ajouterEtape">
        <ion-icon slot="start" :icon="addOutline" />
        Ajouter une étape
      </ion-button>

      <ion-item class="ion-margin-bottom">
        <ion-label position="floating">Temps de préparation (minutes)</ion-label>
        <ion-input v-model.number="form.tempsMin" type="number" required />
      </ion-item>

      <ion-item class="ion-margin-bottom">
        <ion-label position="floating">Coût estimé (Ar)</ion-label>
        <ion-input v-model.number="form.coutAr" type="number" required />
      </ion-item>

      <h3>Image (optionnelle)</h3>
      <ion-item class="ion-margin-bottom" button @click="choisirImage">
        <ion-label>
          <h3>{{ imageNom || 'Choisir une image' }}</h3>
          <p>Max 3 Mo (JPEG, PNG, GIF, WebP)</p>
        </ion-label>
      </ion-item>
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        style="display: none"
        @change="onFileChange"
      />
      <div v-if="imagePreview" class="image-preview">
        <img :src="imagePreview" alt="Aperçu" />
        <ion-button color="danger" fill="clear" @click="retirerImage">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </div>

      <ion-button
        expand="block"
        :disabled="chargement || !formulaireValide"
        class="ion-margin-top"
        @click="sauvegarder"
      >
        <ion-spinner v-if="chargement" slot="start" />
        Enregistrer la recette
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption,
  IonButton, IonSpinner, IonAlert, IonIcon, IonText
} from '@ionic/vue';
import { addOutline, trashOutline, closeOutline } from 'ionicons/icons';
import api from '@/services/api';
import { notifierNouvelleRecette } from '@/utils/notif';
import type { NouvelleRecette, Ingredient } from '@/types/recette';

const router = useRouter();

const form = ref<NouvelleRecette>({
  nom: '',
  nomMg: '',
  region: 'Merina',
  description: '',
  ingredients: [{ nom: '', quantite: '' }],
  etapes: [''],
  tempsMin: 0,
  coutAr: 0,
});

const imageFile = ref<File | null>(null);
const imageNom = ref('');
const imagePreview = ref('');
const fileInput = ref<HTMLInputElement | null>(null);
const chargement = ref(false);
const erreur = ref<string | null>(null);

const formulaireValide = computed(() => {
  const f = form.value;
  const ingredientsValides = f.ingredients.every(ing => ing.nom.trim() && ing.quantite.trim());
  const etapesValides = f.etapes.every(etape => etape.trim());
  return f.nom.trim().length >= 3 &&
         f.nomMg.trim().length >= 2 &&
         f.description.trim().length >= 10 &&
         ingredientsValides &&
         etapesValides &&
         f.tempsMin > 0 &&
         f.coutAr > 0;
});

function ajouterIngredient() {
  form.value.ingredients.push({ nom: '', quantite: '' });
}

function retirerIngredient(index: number) {
  if (form.value.ingredients.length > 1) {
    form.value.ingredients.splice(index, 1);
  }
}

function ajouterEtape() {
  form.value.etapes.push('');
}

function retirerEtape(index: number) {
  if (form.value.etapes.length > 1) {
    form.value.etapes.splice(index, 1);
  }
}

function choisirImage() {
  fileInput.value?.click();
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    if (file.size > 3 * 1024 * 1024) {
      erreur.value = 'L\'image ne doit pas dépasser 3 Mo.';
      return;
    }
    imageFile.value = file;
    imageNom.value = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

function retirerImage() {
  imageFile.value = null;
  imageNom.value = '';
  imagePreview.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

async function sauvegarder() {
  if (!formulaireValide.value) return;

  chargement.value = true;
  erreur.value = null;

  try {
    const recetteData: NouvelleRecette = {
      nom: form.value.nom.trim(),
      nomMg: form.value.nomMg.trim(),
      region: form.value.region,
      description: form.value.description.trim(),
      ingredients: form.value.ingredients.map(ing => ({
        nom: ing.nom.trim(),
        quantite: ing.quantite.trim(),
      })),
      etapes: form.value.etapes.map(etape => etape.trim()),
      tempsMin: form.value.tempsMin,
      coutAr: form.value.coutAr,
    };

    await api.ajouterRecette(recetteData, imageFile.value || undefined);
    
    // Notification locale
    await notifierNouvelleRecette(recetteData.nom);
    
    router.push('/tabs/recettes');
  } catch (e: unknown) {
    const err = e as { message?: string; details?: Record<string, string> };
    if (err.details && Object.keys(err.details).length > 0) {
      erreur.value = Object.values(err.details).join('\n');
    } else {
      erreur.value = err.message || 'Erreur lors de l\'ajout de la recette.';
    }
  } finally {
    chargement.value = false;
  }
}
</script>

<style scoped>
h3 {
  margin: 24px 0 12px 0;
  color: var(--ion-color-primary);
}

.ingredient-row,
.etape-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.ingredient-row ion-item,
.etape-row ion-item {
  flex: 1;
}

.image-preview {
  position: relative;
  margin: 16px 0;
  max-width: 300px;
}

.image-preview img {
  width: 100%;
  border-radius: 8px;
}

.image-preview ion-button {
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>
