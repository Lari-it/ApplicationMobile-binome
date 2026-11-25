<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="kaly-entete">
        <div class="kaly-brand"><span class="kaly-brand-mark">✳</span>KALY!</div>
        <div class="kaly-kicker">Inscription</div>
        <h2 class="kaly-titre">Bienvenue dans<br /><span class="souligne">la cuisine.</span></h2>
        <p class="kaly-sous-titre">Crée ton compte pour partager tes recettes.</p>
      </div>
      <ion-input
        v-model="nom"
        type="text"
        label="Nom"
        label-placement="floating"
        fill="outline"
        autocomplete="name"
        class="kaly-champ ion-margin-bottom"
      />

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
        label="Mot de passe (6 caractères minimum)"
        label-placement="floating"
        fill="outline"
        autocomplete="new-password"
        class="kaly-champ ion-margin-bottom"
      />

      <ion-input
        v-model="mdpConfirm"
        type="password"
        label="Confirmer le mot de passe"
        label-placement="floating"
        fill="outline"
        autocomplete="new-password"
        class="kaly-champ ion-margin-bottom"
      />

      <ion-text v-if="erreur" color="danger">
        <p>{{ erreur }}</p>
      </ion-text>

      <ion-button
        expand="block"
        class="kaly-btn"
        :disabled="chargement || !formulaireValide"
        @click="sInscrire"
      >
        <ion-spinner v-if="chargement" slot="start" />
        S'inscrire
      </ion-button>

      <p class="ion-text-center ion-margin-top">
        Déjà un compte ?
        <ion-button router-link="/login" fill="clear" class="kaly-lien">Se connecter</ion-button>
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
