<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ t('recettes.add_title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="erreur" class="ion-margin-bottom">
        <ion-alert
          :is-open="!!erreur"
          :header="t('common.error')"
          :message="erreur"
          :buttons="['OK']"
          @did-dismiss="erreur = null"
        />
      </div>
      <ion-input
        v-model="form.nom"
        :label="t('common.name') + ' (français)'"
        label-placement="floating"
        fill="outline"
        class="kaly-champ ion-margin-bottom"
      />

      <ion-input
        v-model="form.nomMg"
        :label="t('common.name') + ' (malagasy)'"
        label-placement="floating"
        fill="outline"
        class="kaly-champ ion-margin-bottom"
      />

      <ion-select
        v-model="form.region"
        :label="t('recettes.region')"
        label-placement="floating"
        fill="outline"
        class="kaly-champ ion-margin-bottom"
      >
        <ion-select-option v-for="region in regions" :key="region" :value="region">
          {{ region }}
        </ion-select-option>
      </ion-select>

      <ion-textarea
        v-model="form.description"
        :label="t('recettes.description')"
        label-placement="floating"
        fill="outline"
        :rows="3"
        class="kaly-champ ion-margin-bottom"
      />

      <ion-input
        v-model.number="form.portions"
        type="number"
        :label="t('details.portions') + ' par défaut'"
        label-placement="floating"
        fill="outline"
        class="kaly-champ ion-margin-bottom"
      />

      <ion-input
        v-model.number="form.tempsMin"
        type="number"
        :label="t('recettes.preparation_time')"
        label-placement="floating"
        fill="outline"
        class="kaly-champ ion-margin-bottom"
      />

      <ion-input
        v-model.number="form.coutAr"
        type="number"
        :label="t('details.cost') + ' (Ar)'"
        label-placement="floating"
        fill="outline"
        class="kaly-champ ion-margin-bottom"
      />

      <h3>{{ t('details.ingredients') }}</h3>
      <div v-for="(ing, index) in form.ingredients" :key="index" class="ingredient-card">
        <div class="ligne">
          <ion-input
            v-model="ing.nom"
            :label="t('common.name')"
            label-placement="floating"
            fill="outline"
            class="kaly-champ"
          />
          <ion-button color="danger" fill="clear" @click="retirerIngredient(index)">
            <ion-icon slot="icon-only" :icon="trashOutline" />
          </ion-button>
        </div>
        <div class="ligne">
          <ion-input
            v-model.number="ing.quantiteNum"
            type="number"
            :label="t('recettes.quantity_num')"
            label-placement="floating"
            fill="outline"
            class="kaly-champ"
          />
          <ion-select
            v-model="ing.unite"
            :label="t('recettes.unit')"
            label-placement="floating"
            fill="outline"
            class="kaly-champ"
          >
            <ion-select-option v-for="u in unitesSupportees" :key="u" :value="u">{{ u }}</ion-select-option>
          </ion-select>
        </div>
        <ion-input
          v-model="ing.substituts"
          :label="t('recettes.substitute_optional')"
          label-placement="floating"
          fill="outline"
          class="kaly-champ ion-margin-bottom"
        />
      </div>
      <ion-button expand="block" class="kaly-btn-contour" @click="ajouterIngredient">
        <ion-icon slot="start" :icon="addOutline" />
        {{ t('recettes.add_ingredient') }}
      </ion-button>

      <h3>{{ t('details.steps') }}</h3>
      <div v-for="(etape, index) in form.etapes" :key="index" class="ligne">
        <ion-textarea
          v-model="form.etapes[index]"
          :label="t('recettes.step_number') + ' ' + (index + 1)"
          label-placement="floating"
          fill="outline"
          :rows="2"
          class="kaly-champ"
        />
        <ion-button color="danger" fill="clear" @click="retirerEtape(index)">
          <ion-icon slot="icon-only" :icon="trashOutline" />
        </ion-button>
      </div>
      <ion-button expand="block" class="kaly-btn-contour" @click="ajouterEtape">
        <ion-icon slot="start" :icon="addOutline" />
        {{ t('recettes.add_step') }}
      </ion-button>

      <h3>{{ t('recettes.image_optional') }}</h3>
      <ion-button expand="block" class="kaly-btn-contour" @click="choisirImage">
        <ion-icon slot="start" :icon="imageOutline" />
        {{ imageNom || t('recettes.choose_image') }}
      </ion-button>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="champ-fichier"
        @change="onFileChange"
      />
      <div v-if="imagePreview" class="image-preview">
        <img :src="imagePreview" alt="Aperçu" />
        <ion-button color="danger" fill="clear" @click="retirerImage">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </div>

      <div v-if="erreurs.length > 0" class="kaly-erreurs ion-margin-top">
        <ion-text color="danger">
          <p v-for="message in erreurs" :key="message">{{ message }}</p>
        </ion-text>
      </div>

      <ion-button
        expand="block"
        :disabled="chargement"
        class="kaly-btn ion-margin-top"
        @click="sauvegarder"
      >
        <ion-spinner v-if="chargement" slot="start" />
        {{ chargement ? t('common.sending') : t('common.save') }}
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonInput, IonTextarea, IonSelect, IonSelectOption,
  IonButton, IonSpinner, IonIcon, IonText, IonAlert, useIonRouter, toastController
} from '@ionic/vue';
import { addOutline, trashOutline, closeOutline, imageOutline } from 'ionicons/icons';
import api from '@/services/api';
import { notifierNouvelleRecette } from '@/utils/notif';
import type { NouvelleRecette, Ingredient, Etape } from '@/types/recette';
import { useI18n } from '@/composables/useI18n';
import { useOffline } from '@/composables/useOffline';

const TAILLE_MAX = 3 * 1024 * 1024;
const LARGEUR_MAX = 1080;

const ionRouter = useIonRouter();
const { t } = useI18n();

const unitesSupportees = ['g', 'kg', 'kapoaka', 'cuillère à soupe', 'cuillère à café', 'verre', 'pièce', 'L', 'ml'];

const regions = ['Merina', 'Betsileo', 'Sakalava', 'Antandroy', 'Betsimisaraka'] as const;

function formulaireVide() {
  return {
    nom: '',
    nomMg: '',
    region: 'Merina',
    description: '',
    portions: 4,
    ingredients: [{ nom: '', quantite: '', quantiteNum: undefined, unite: '', substituts: '' }],
    etapes: [''],
    tempsMin: 0,
    coutAr: 0,
  };
}

const form = ref(formulaireVide());
const imageFile = ref<File | null>(null);
const imageNom = ref('');
const imagePreview = ref('');
const fileInput = ref<HTMLInputElement | null>(null);
const chargement = ref(false);
const erreurs = ref<string[]>([]);
const erreur = ref<string | null>(null);

function ajouterIngredient() {
  form.value.ingredients.push({ nom: '', quantite: '', quantiteNum: undefined, unite: '', substituts: '' });
}

function retirerIngredient(index: number) {
  form.value.ingredients.splice(index, 1);
  if (form.value.ingredients.length === 0) {
    ajouterIngredient();
  }
}

function ajouterEtape() {
  form.value.etapes.push('');
}

function retirerEtape(index: number) {
  form.value.etapes.splice(index, 1);
  if (form.value.etapes.length === 0) {
    ajouterEtape();
  }
}

function choisirImage() {
  fileInput.value?.click();
}

function onFileChange(event: Event) {
  const cible = event.target as HTMLInputElement;
  const fichier = cible.files?.[0];
  if (!fichier) return;

  if (fichier.size > TAILLE_MAX) {
    erreurs.value = ["L'image ne doit pas dépasser 3 Mo."];
    cible.value = '';
    return;
  }

  erreurs.value = [];
  imageFile.value = fichier;
  imageNom.value = fichier.name;
  const lecteur = new FileReader();
  lecteur.onload = () => {
    imagePreview.value = lecteur.result as string;
  };
  lecteur.readAsDataURL(fichier);
}

// redimensionne la photo (largeur max 1080 px) et la convertit en jpeg
function reduireImage(fichier: File): Promise<File> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(fichier);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width <= LARGEUR_MAX) {
        resolve(fichier);
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = LARGEUR_MAX;
      canvas.height = Math.round(img.height * LARGEUR_MAX / img.width);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(fichier);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(fichier);
          return;
        }
        const nom = fichier.name.replace(/\.[^.]+$/, '') + '.jpg';
        resolve(new File([blob], nom, { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.85);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(fichier);
    };
    img.src = url;
  });
}

function retirerImage() {
  imageFile.value = null;
  imageNom.value = '';
  imagePreview.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function reinitialiser() {
  form.value = formulaireVide();
  erreurs.value = [];
  retirerImage();
}

function valider(): string[] {
  const f = form.value;
  const messages: string[] = [];

  if (f.nom.trim().length < 3) {
    messages.push('Le nom doit contenir au moins 3 caractères.');
  }
  if (f.nomMg.trim().length < 2) {
    messages.push('Le nom malagasy est obligatoire.');
  }
  if (f.description.trim().length < 10) {
    messages.push('La description doit contenir au moins 10 caractères.');
  }

  const ingredientsRemplis = f.ingredients.filter(i => i.nom.trim() || i.quantite.trim() || i.quantiteNum);
  if (ingredientsRemplis.length === 0) {
    messages.push('Ajoutez au moins un ingrédient.');
  } else if (ingredientsRemplis.some(i => !i.nom.trim() || (!i.quantite.trim() && !i.quantiteNum))) {
    messages.push('Chaque ingrédient doit avoir un nom et une quantité.');
  }

  if (f.etapes.filter(e => e.trim()).length === 0) {
    messages.push('Ajoutez au moins une étape.');
  }
  if (!(f.tempsMin > 0)) {
    messages.push('Le temps doit être un nombre positif.');
  }
  if (!(f.coutAr > 0)) {
    messages.push('Le coût doit être un nombre positif.');
  }

  return messages;
}

async function sauvegarder() {
  erreurs.value = valider();
  if (erreurs.value.length > 0) return;

  chargement.value = true;

  const recetteData: any = {
    nom: form.value.nom.trim(),
    nomMg: form.value.nomMg.trim(),
    region: form.value.region,
    description: form.value.description.trim(),
    portions: form.value.portions,
    ingredients: form.value.ingredients.map(ing => ({
      nom: ing.nom.trim(),
      quantite: ing.quantiteNum ? `${ing.quantiteNum} ${ing.unite}` : ing.quantite.trim(),
      quantiteNum: ing.quantiteNum,
      unite: ing.unite,
      substituts: ing.substituts?.trim() || undefined
    })),
    etapes: form.value.etapes.map(e => e.trim()).filter(e => e),
    tempsMin: form.value.tempsMin,
    coutAr: form.value.coutAr,
  };

  const { estHorsLigne, ajouterAFileSynchro } = useOffline();

  if (estHorsLigne.value) {
    ajouterAFileSynchro(recetteData, imageFile.value || undefined);
    const toast = await toastController.create({
      message: 'Mode hors ligne : la recette sera envoyée au retour de la connexion.',
      duration: 3000,
      color: 'warning',
      position: 'top'
    });
    await toast.present();
    chargement.value = false;
    ionRouter.navigate('/tabs/recettes', 'root', 'replace');
    return;
  }

  try {
    const image = imageFile.value ? await reduireImage(imageFile.value) : undefined;
    await api.ajouterRecette(recetteData, image);
    await notifierNouvelleRecette(recetteData.nom);
    reinitialiser();
    ionRouter.navigate('/tabs/recettes', 'root', 'replace');
  } catch (e: unknown) {
    const err = e as { message?: string; details?: Record<string, string> };
    if (err.details && Object.keys(err.details).length > 0) {
      erreurs.value = Object.values(err.details);
    } else {
      erreurs.value = [err.message || "Erreur lors de l'ajout de la recette."];
    }
  } finally {
    chargement.value = false;
  }
}
</script>

<style scoped>
h3 {
  font: 400 19px var(--kaly-font-titre);
  letter-spacing: -0.05em;
  margin: 24px 0 12px 0;
}

.ingredient-card,
.etape-card {
  border-bottom: 1px solid #eee;
  margin-bottom: 16px;
  padding-bottom: 16px;
}

.ligne {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}

.ligne ion-input,
.ligne ion-textarea {
  flex: 1;
}

.champ-fichier {
  display: none;
}

.image-preview {
  position: relative;
  margin: 16px 0;
  max-width: 300px;
}

.image-preview img {
  width: 100%;
  border: 1.3px solid var(--kaly-ink);
  border-radius: 15px 15px 5px 15px;
}

.image-preview ion-button {
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>
