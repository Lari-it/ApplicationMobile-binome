<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ t('common.login') }}</ion-title>
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
        autocomplete="current-password"
        class="kaly-champ ion-margin-bottom"
      />

      <ion-button
        expand="block"
        class="kaly-btn"
        :disabled="chargement || !formulaireValide"
        @click="seConnecter"
      >
        <ion-spinner v-if="chargement" slot="start" />
        {{ t('common.login') }}
      </ion-button>

      <p class="ion-text-center ion-margin-top">
        {{ t('common.no_account') }}
        <ion-button router-link="/register" fill="clear" class="kaly-lien">{{ t('common.register') }}</ion-button>
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
const { connexion } = useAuth();
const { t } = useI18n();

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
    const toast = await toastController.create({
      message: t('common.success'),
      duration: 1500,
      position: 'top',
      color: 'success',
    });
    await toast.present();
    ionRouter.navigate('/tabs/recettes', 'root', 'replace');
  } catch (e: unknown) {
    const err = e as { message?: string; statut?: number };
    if (err.statut === 401) {
      erreur.value = t('common.error');
    } else {
      erreur.value = err.message || t('common.error');
    }
  } finally {
    chargement.value = false;
  }
}
</script>
