<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Inscription</ion-title>
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
        <ion-label position="floating">Nom</ion-label>
        <ion-input
          v-model="nom"
          type="text"
          autocomplete="name"
          required
        />
      </ion-item>

      <ion-item class="ion-margin-bottom">
        <ion-label position="floating">Email</ion-label>
        <ion-input
          v-model="email"
          type="email"
          autocomplete="email"
          required
        />
      </ion-item>

      <ion-item class="ion-margin-bottom">
        <ion-label position="floating">Mot de passe</ion-label>
        <ion-input
          v-model="mdp"
          type="password"
          autocomplete="new-password"
          required
        />
      </ion-item>

      <ion-item class="ion-margin-bottom">
        <ion-label position="floating">Confirmer le mot de passe</ion-label>
        <ion-input
          v-model="mdpConfirm"
          type="password"
          autocomplete="new-password"
          required
        />
      </ion-item>

      <ion-button
        expand="block"
        :disabled="chargement || !formulaireValide"
        @click="sInscrire"
      >
        <ion-spinner v-if="chargement" slot="start" />
        S'inscrire
      </ion-button>

      <p class="ion-text-center ion-margin-top">
        Déjà un compte ?
        <ion-button router-link="/login" fill="clear">Se connecter</ion-button>
      </p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonButton, IonSpinner, IonAlert,
  toastController
} from '@ionic/vue';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { inscription } = useAuth();

const nom = ref('');
const email = ref('');
const mdp = ref('');
const mdpConfirm = ref('');
const chargement = ref(false);
const erreur = ref<string | null>(null);

const formulaireValide = computed(() => {
  return nom.value.trim().length >= 2 &&
         email.value.includes('@') &&
         mdp.value.length >= 4 &&
         mdp.value === mdpConfirm.value;
});

async function sInscrire() {
  if (!formulaireValide.value) return;

  chargement.value = true;
  erreur.value = null;

  try {
    await inscription(nom.value.trim(), email.value, mdp.value);
    const toast = await toastController.create({
      message: 'Inscription réussie',
      duration: 1500,
      position: 'top',
      color: 'success',
    });
    await toast.present();
    router.push('/tabs/recettes');
  } catch (e: unknown) {
    const err = e as { message?: string; details?: Record<string, string> };
    if (err.details && Object.keys(err.details).length > 0) {
      erreur.value = Object.values(err.details).join('\n');
    } else {
      erreur.value = err.message || 'Erreur d\'inscription.';
    }
  } finally {
    chargement.value = false;
  }
}
</script>
