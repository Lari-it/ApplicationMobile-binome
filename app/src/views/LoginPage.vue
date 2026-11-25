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

      <ion-item class="ion-margin-bottom">
        <ion-label position="floating">{{ t('common.email') }}</ion-label>
        <ion-input
          v-model="email"
          type="email"
          autocomplete="email"
          required
        />
      </ion-item>

      <ion-item class="ion-margin-bottom">
        <ion-label position="floating">{{ t('common.password') }}</ion-label>
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
        {{ t('common.login') }}
      </ion-button>

      <p class="ion-text-center ion-margin-top">
        {{ t('common.no_account') }}
        <ion-button router-link="/register" fill="clear">{{ t('common.register') }}</ion-button>
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
import { useI18n } from '@/composables/useI18n';

const router = useRouter();
const { connexion } = useAuth();
const { t } = useI18n();

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
      message: t('common.success'),
      duration: 1500,
      position: 'top',
      color: 'success',
    });
    await toast.present();
    router.push('/tabs/recettes');
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
