<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="kaly-entete">
        <div class="kaly-brand"><span class="kaly-brand-mark">✳</span>KALY!</div>
        <div class="kaly-kicker">Tonga soa!</div>
        <h2 class="kaly-titre">Content de te<br /><span class="souligne">revoir.</span></h2>
        <p class="kaly-sous-titre">Connecte-toi pour retrouver tes recettes.</p>
      </div>
      <ion-input
        v-model="email"
        type="email"
        label="Email"
        label-placement="floating"
        fill="outline"
        autocomplete="email"
        class="kaly-champ ion-margin-bottom"
      />

      <ion-input
        v-model="mdp"
        type="password"
        label="Mot de passe"
        label-placement="floating"
        fill="outline"
        autocomplete="current-password"
        class="kaly-champ ion-margin-bottom"
      />

      <ion-text v-if="erreur" color="danger">
        <p>{{ erreur }}</p>
      </ion-text>

      <ion-button
        expand="block"
        class="kaly-btn"
        :disabled="chargement || !formulaireValide"
        @click="seConnecter"
      >
        <ion-spinner v-if="chargement" slot="start" />
        Se connecter
      </ion-button>

      <p class="ion-text-center ion-margin-top">
        Pas encore de compte ?
        <ion-button router-link="/register" fill="clear" class="kaly-lien">S'inscrire</ion-button>
      </p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IonPage, IonContent,
  IonInput, IonButton, IonSpinner, IonText, useIonRouter
} from '@ionic/vue';
import { useAuth } from '@/composables/useAuth';

const ionRouter = useIonRouter();
const { connexion } = useAuth();

const email = ref('');
const mdp = ref('');
const chargement = ref(false);
const erreur = ref<string | null>(null);

const formulaireValide = computed(() => {
  return email.value.trim() !== '' && mdp.value !== '';
});

async function seConnecter() {
  if (!formulaireValide.value) return;

  chargement.value = true;
  erreur.value = null;

  try {
    await connexion(email.value.trim(), mdp.value);
    ionRouter.navigate('/tabs/recettes', 'root', 'replace');
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
