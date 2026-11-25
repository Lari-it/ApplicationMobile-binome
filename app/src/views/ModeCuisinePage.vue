<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/recettes" :text="t('common.back')" />
        </ion-buttons>
        <ion-title v-if="recette">
          {{ t('cooking_mode.step') }} {{ etapeActuelle + 1 }} / {{ totalEtapes }}
        </ion-title>
        <ion-title v-else>{{ t('common.loading') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding ion-text-center">
      <div v-if="recette" class="cooking-container">
        <div class="progress-bar">
          <ion-progress-bar :value="(etapeActuelle + 1) / totalEtapes" color="success" />
        </div>

        <div class="step-content">
          <h1 class="step-text">
            {{ etapeContenu }}
          </h1>

          <div v-if="dureeRestante !== null" class="timer-section ion-margin-top">
            <div class="timer-display" :class="{ 'timer-running': timerActif }">
              {{ formatTime(dureeRestante) }}
            </div>
            <ion-button v-if="!timerActif" color="success" @click="demarrerTimer">
              {{ t('cooking_mode.timer') }}
            </ion-button>
            <ion-button v-else color="warning" @click="pauseTimer">
              Pause
            </ion-button>
          </div>
        </div>

        <div class="navigation-buttons">
          <ion-button fill="clear" :disabled="etapeActuelle === 0" @click="etapePrecedente">
            <ion-icon :icon="chevronBackOutline" slot="start" />
            {{ t('cooking_mode.prev') }}
          </ion-button>
          
          <ion-button v-if="etapeActuelle < totalEtapes - 1" color="primary" @click="etapeSuivante">
            {{ t('cooking_mode.next') }}
            <ion-icon :icon="chevronForwardOutline" slot="end" />
          </ion-button>
          
          <ion-button v-else color="success" @click="terminer">
            {{ t('cooking_mode.finish') }}
            <ion-icon :icon="checkmarkDoneOutline" slot="end" />
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonProgressBar, IonButtons, IonBackButton
} from '@ionic/vue';
import { 
  chevronBackOutline, chevronForwardOutline, checkmarkDoneOutline 
} from 'ionicons/icons';
import api from '@/services/api';
import type { Recette } from '@/types/recette';
import { useI18n } from '@/composables/useI18n';
// Note: keep-awake serait importé ici si on était sur mobile natif

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const recette = ref<Recette | null>(null);
const etapeActuelle = ref(0);
const dureeRestante = ref<number | null>(null);
const timerActif = ref(false);
let timerInterval: any = null;

const totalEtapes = computed(() => recette.value?.etapes.length || 0);

const etapeContenu = computed(() => {
  if (!recette.value) return '';
  const etape = recette.value.etapes[etapeActuelle.value];
  return typeof etape === 'string' ? etape : etape.description;
});

async function charger() {
  const id = route.params.id as string;
  recette.value = await api.recetteParId(id);
  initialiserTimer();
}

function initialiserTimer() {
  const etape = recette.value?.etapes[etapeActuelle.value];
  if (etape && typeof etape !== 'string' && etape.dureeMin) {
    dureeRestante.value = etape.dureeMin * 60;
  } else {
    dureeRestante.value = null;
  }
  timerActif.value = false;
  clearInterval(timerInterval);
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function demarrerTimer() {
  if (dureeRestante.value === null) return;
  timerActif.value = true;
  timerInterval = setInterval(() => {
    if (dureeRestante.value! > 0) {
      dureeRestante.value!--;
    } else {
      clearInterval(timerInterval);
      timerActif.value = false;
      // Optionnel: émettre un son ou une vibration
    }
  }, 1000);
}

function pauseTimer() {
  timerActif.value = false;
  clearInterval(timerInterval);
}

function etapeSuivante() {
  if (recette.value && etapeActuelle.value < recette.value.etapes.length - 1) {
    etapeActuelle.value++;
    initialiserTimer();
  }
}

function etapePrecedente() {
  if (etapeActuelle.value > 0) {
    etapeActuelle.value--;
    initialiserTimer();
  }
}

function terminer() {
  router.back();
}

onMounted(charger);
onUnmounted(() => {
  clearInterval(timerInterval);
});
</script>

<style scoped>
.cooking-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
}

.step-text {
  font-size: 2rem;
  font-weight: bold;
  line-height: 1.4;
  color: var(--ion-color-dark);
}

.timer-display {
  font-size: 4rem;
  font-family: monospace;
  margin-bottom: 20px;
}

.timer-running {
  color: var(--ion-color-success);
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  background: white;
  border-top: 1px solid #eee;
}

.progress-bar {
  padding: 10px 0;
}
</style>
