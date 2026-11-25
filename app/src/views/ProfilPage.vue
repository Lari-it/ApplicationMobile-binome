<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="kaly-entete">
        <div class="kaly-brand"><span class="kaly-brand-mark">✳</span>KALY!</div>
        <div class="kaly-kicker">Mon carnet</div>
        <h2 class="kaly-titre">Salut,<br /><span class="souligne">{{ user?.nom || 'toi' }} !</span></h2>
      </div>
      <div v-if="user" class="profile-card">
        <div class="avatar">
          <ion-icon :icon="personCircleOutline" />
        </div>
        <h2>{{ user.nom }}</h2>
        <p class="email">{{ user.email }}</p>
      </div>

      <h3 class="kaly-section">Mes favoris ({{ mesFavoris.length }})</h3>
      <ion-list v-if="mesFavoris.length > 0" class="kaly-carte liste">
        <ion-item
          v-for="recette in mesFavoris"
          :key="recette.id"
          :router-link="`/recette/${recette.id}`"
          button
        >
          <ion-icon slot="start" :icon="heart" color="danger" />
          <ion-label>{{ recette.nom }}</ion-label>
        </ion-item>
      </ion-list>
      <ion-text v-else color="medium">
        <p>Aucun favori pour le moment.</p>
      </ion-text>

      <h3 class="kaly-section">Mes recettes ({{ mesRecettes.length }})</h3>
      <div v-if="chargement" class="ion-text-center ion-padding">
        <ion-spinner />
      </div>
      <ion-list v-else-if="mesRecettes.length > 0" class="kaly-carte liste">
        <ion-item
          v-for="recette in mesRecettes"
          :key="recette.id"
          :router-link="`/recette/${recette.id}`"
          button
        >
          <ion-label>
            <h2>{{ recette.nom }}</h2>
            <p>{{ recette.region }} - {{ recette.tempsMin }} min</p>
          </ion-label>
        </ion-item>
      </ion-list>
      <ion-text v-else color="medium">
        <p>Vous n'avez pas encore publié de recette.</p>
      </ion-text>

      <ion-button
        expand="block"
        class="kaly-btn-rouge deconnexion"
        @click="seDeconnecter"
      >
        <ion-icon slot="start" :icon="logOutOutline" />
        Se déconnecter
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IonPage, IonContent,
  IonButton, IonIcon, IonList, IonItem, IonLabel, IonText, IonSpinner,
  useIonRouter, onIonViewWillEnter
} from '@ionic/vue';
import { personCircleOutline, logOutOutline, heart } from 'ionicons/icons';
import { useAuth } from '@/composables/useAuth';
import api from '@/services/api';
import type { Recette } from '@/types/recette';
import { useFavoris } from '@/composables/useFavoris';

const ionRouter = useIonRouter();
const { user, deconnexion } = useAuth();

const { listeFavoris, charger: chargerFavoris } = useFavoris();

const toutesRecettes = ref<Recette[]>([]);
const mesRecettes = computed(() =>
  toutesRecettes.value.filter(r => r.auteurId === user.value?.uid)
);
const mesFavoris = computed(() =>
  toutesRecettes.value.filter(r => listeFavoris.value.includes(r.id))
);
const chargement = ref(false);

async function chargerMesRecettes() {
  if (!user.value) return;
  chargerFavoris();
  chargement.value = true;
  try {
    toutesRecettes.value = await api.listeRecettes();
  } catch (e: unknown) {
    toutesRecettes.value = [];
    console.error(e);
  } finally {
    chargement.value = false;
  }
}

onIonViewWillEnter(chargerMesRecettes);

function seDeconnecter() {
  deconnexion();
  ionRouter.navigate('/login', 'root', 'replace');
}
</script>

<style scoped>
.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background-color: var(--kaly-purple);
  color: #fff;
  border: 1.4px solid var(--kaly-ink);
  border-radius: 7px 20px 20px 20px;
  margin-bottom: 8px;
}

.liste {
  overflow: hidden;
  padding: 0;
}

.deconnexion {
  margin-top: 28px;
}

.avatar {
  width: 90px;
  height: 90px;
  border: 1.7px solid var(--kaly-ink);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--kaly-green);
  border-radius: 50%;
  margin-bottom: 16px;
}

.avatar ion-icon {
  font-size: 60px;
  color: var(--kaly-on-accent);
}

.profile-card h2 {
  margin: 0 0 6px 0;
  font: 400 22px var(--kaly-font-titre);
  letter-spacing: -0.05em;
}

.email {
  margin: 0;
  color: #e8ddeb;
  font: 11px var(--kaly-font-mono);
}
</style>
