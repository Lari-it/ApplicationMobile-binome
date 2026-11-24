<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Connexion</ion-title>
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
          autocomplete="current-password"
          required
        />
      </ion-item>

      <ion-button
        expand="block"
        :disabled="chargement || !formulaireValide"
        @click="seConnecter"
      >
        <ion-spinner v-if="chargement" slot="start" />
        Se connecter
      </ion-button>

      <p class="ion-text-center ion-margin-top">
        Pas encore de compte ?
        <ion-button router-link="/register" fill="clear">S'inscrire</ion-button>
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
const { connexion } = useAuth();

const email = ref('');
const mdp = ref('');
const chargement = ref(false);
const erreur = ref<string | null>(null);

const formulaireValide = computed(() => {
  return email.value.includes('@') && mdp.value.length >= 4;
});

async function seConnecter() {
  if (!formulaireValide.value) return;

  chargement.value = true;
  erreur.value = null;

  try {
    await connexion(email.value, mdp.value);
    const toast = await toastController.create({
      message: 'Connexion réussie',
      duration: 1500,
      position: 'top',
      color: 'success',
    });
    await toast.present();
    router.push('/tabs/recettes');
  } catch (e: unknown) {
    const err = e as { message?: string; statut?: number };
    if (err.statut === 401) {
      erreur.value = 'Email ou mot de passe incorrect.';
    } else {
      erreur.value = err.message || 'Erreur de connexion.';
    }
  } finally {
    chargement.value = false;
  }
}
</script>
