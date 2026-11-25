<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Inscription</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-input
        v-model="nom"
        type="text"
        label="Nom"
        label-placement="floating"
        fill="outline"
        autocomplete="name"
        class="ion-margin-bottom"
      />

      <ion-input
        v-model="email"
        type="email"
        label="Email"
        label-placement="floating"
        fill="outline"
        autocomplete="email"
        class="ion-margin-bottom"
      />

      <ion-input
        v-model="mdp"
        type="password"
        label="Mot de passe (6 caractères minimum)"
        label-placement="floating"
        fill="outline"
        autocomplete="new-password"
        class="ion-margin-bottom"
      />

      <ion-input
        v-model="mdpConfirm"
        type="password"
        label="Confirmer le mot de passe"
        label-placement="floating"
        fill="outline"
        autocomplete="new-password"
        class="ion-margin-bottom"
      />

      <ion-text v-if="erreur" color="danger">
        <p>{{ erreur }}</p>
      </ion-text>

      <ion-button
        expand="block"
        :disabled="chargement || !formulaireValide"
        @click="sInscrire"
      >
        <ion-spinner v-if="chargement" slot="start" />
        S'inscrire
      </ion-button>

      <p class="ion-text-center ion-margin-top">
        Deja un compte ?
        <ion-button router-link="/login" fill="clear">Se connecter</ion-button>
      </p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonInput, IonButton, IonSpinner, IonText, useIonRouter
} from '@ionic/vue';
import { useAuth } from '@/composables/useAuth';

const ionRouter = useIonRouter();
const { inscription } = useAuth();

const nom = ref('');
const email = ref('');
const mdp = ref('');
const mdpConfirm = ref('');
const chargement = ref(false);
const erreur = ref<string | null>(null);

const formulaireValide = computed(() => {
  return nom.value.trim() !== '' &&
         email.value.trim() !== '' &&
         mdp.value.length >= 6 &&
         mdp.value === mdpConfirm.value;
});

async function sInscrire() {
  if (!formulaireValide.value) return;

  chargement.value = true;
  erreur.value = null;

  try {
    await inscription(nom.value.trim(), email.value.trim(), mdp.value);
    ionRouter.navigate('/tabs/recettes', 'root', 'replace');
  } catch (e: unknown) {
    const err = e as { message?: string; details?: Record<string, string> };
    if (err.details && Object.keys(err.details).length > 0) {
      erreur.value = Object.values(err.details).join(' ');
    } else {
      erreur.value = err.message || "Erreur d'inscription.";
    }
  } finally {
    chargement.value = false;
  }
}
</script>
