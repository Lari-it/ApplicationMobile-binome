<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ t('common.register') }}</ion-title>
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
        v-model="nom"
        type="text"
        :label="t('common.name')"
        label-placement="floating"
        fill="outline"
        autocomplete="name"
        class="kaly-champ ion-margin-bottom"
      />

      <ion-input
        v-model="email"
        type="email"
        :label="t('common.email')"
        label-placement="floating"
        fill="outline"
        autocomplete="email"
        class="kaly-champ ion-margin-bottom"
      />

      <ion-input
        v-model="mdp"
        type="password"
        :label="t('common.password')"
        label-placement="floating"
        fill="outline"
        autocomplete="new-password"
        class="kaly-champ ion-margin-bottom"
      />

      <ion-input
        v-model="mdpConfirm"
        type="password"
        :label="t('common.password') + ' (confirm)'"
        label-placement="floating"
        fill="outline"
        autocomplete="new-password"
        class="kaly-champ ion-margin-bottom"
      />

      <ion-button
        expand="block"
        class="kaly-btn"
        :disabled="chargement || !formulaireValide"
        @click="sInscrire"
      >
        <ion-spinner v-if="chargement" slot="start" />
        {{ t('common.register') }}
      </ion-button>

      <p class="ion-text-center ion-margin-top">
        {{ t('common.have_account') }}
        <ion-button router-link="/login" fill="clear" class="kaly-lien">{{ t('common.login') }}</ion-button>
      </p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IonPage, IonContent,
  IonInput, IonButton, IonSpinner, IonText, IonAlert, useIonRouter, toastController
} from '@ionic/vue';
import { useAuth } from '@/composables/useAuth';
import { useI18n } from '@/composables/useI18n';

const ionRouter = useIonRouter();
const { inscription } = useAuth();
const { t } = useI18n();

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
    const toast = await toastController.create({
      message: t('common.success'),
      duration: 1500,
      position: 'top',
      color: 'success',
    });
    await toast.present();
    ionRouter.navigate('/tabs/recettes', 'root', 'replace');
  } catch (e: unknown) {
    const err = e as { message?: string; details?: Record<string, string> };
    if (err.details && Object.keys(err.details).length > 0) {
      erreur.value = Object.values(err.details).join(' ');
    } else {
      erreur.value = err.message || t('common.error');
    }
  } finally {
    chargement.value = false;
  }
}
</script>
