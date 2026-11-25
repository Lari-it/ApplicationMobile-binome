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

      <!-- Sélecteur de langue -->
      <div class="settings-section ion-margin-top">
        <h3 class="kaly-section">{{ t('profile.language') }}</h3>
        <ion-list lines="none" class="kaly-carte liste">
          <ion-item button @click="setLanguage('fr')">
            <ion-label :color="lang === 'fr' ? 'primary' : ''">Français</ion-label>
            <ion-icon v-if="lang === 'fr'" :icon="restaurantOutline" slot="end" color="primary" />
          </ion-item>
          <ion-item button @click="setLanguage('mg')">
            <ion-label :color="lang === 'mg' ? 'primary' : ''">Malagasy</ion-label>
            <ion-icon v-if="lang === 'mg'" :icon="restaurantOutline" slot="end" color="primary" />
          </ion-item>
        </ion-list>
      </div>

      <!-- Lien Calendrier des fêtes -->
      <div class="settings-section ion-margin-top">
        <ion-list lines="none" class="kaly-carte liste">
          <ion-item button router-link="/tabs/fetes">
            <ion-icon :icon="calendarOutline" slot="start" color="primary" />
            <ion-label>{{ t('holiday.title') }}</ion-label>
          </ion-item>
        </ion-list>
      </div>

      <h3 class="kaly-section">{{ t('profile.favorites') }} ({{ mesFavoris.length }})</h3>
      <ion-list v-if="mesFavoris.length > 0" class="kaly-carte liste">
        <ion-item
          v-for="recette in mesFavoris"
          :key="recette.id"
          :router-link="`/recette/${recette.id}`"
          button
        >
          <ion-thumbnail slot="start">
            <img v-if="recette.imageUrl" :src="`${BASE_URL}${recette.imageUrl}`" />
            <div v-else class="placeholder-thumb"><ion-icon :icon="restaurantOutline" /></div>
          </ion-thumbnail>
          <ion-label>
            <h2>{{ lang === 'mg' ? recette.nomMg : recette.nom }}</h2>
            <p>{{ recette.region }}</p>
          </ion-label>
          <ion-icon :icon="heart" color="danger" slot="end" />
        </ion-item>
      </ion-list>
      <ion-text v-else color="medium">
        <p>{{ t('recettes.no_results') }}</p>
      </ion-text>

      <h3 class="kaly-section">{{ t('profile.my_recipes') }} ({{ mesRecettes.length }})</h3>
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
            <h2>{{ lang === 'mg' ? recette.nomMg : recette.nom }}</h2>
            <p>{{ recette.region }} - {{ recette.tempsMin }} min</p>
          </ion-label>
        </ion-item>
      </ion-list>
      <ion-text v-else color="medium">
        <p>{{ t('profile.no_recipes') }}</p>
      </ion-text>

      <ion-button
        expand="block"
        class="kaly-btn-rouge deconnexion"
        @click="seDeconnecter"
      >
        <ion-icon slot="start" :icon="logOutOutline" />
        {{ t('profile.logout') }}
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonPage, IonContent,
  IonButton, IonIcon, IonList, IonItem, IonLabel, IonText, IonSpinner, IonThumbnail,
  useIonRouter
} from '@ionic/vue';
import { personCircleOutline, logOutOutline, heart, restaurantOutline, calendarOutline } from 'ionicons/icons';
import { useAuth } from '@/composables/useAuth';
import { useFavoris } from '@/composables/useFavoris';
import { useI18n } from '@/composables/useI18n';
import api from '@/services/api';
import type { Recette } from '@/types/recette';

const ionRouter = useIonRouter();
const { user, deconnexion } = useAuth();
const { listeFavoris, charger: chargerFavoris } = useFavoris();
const { t, lang, setLanguage } = useI18n();
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

onMounted(chargerMesRecettes);

function seDeconnecter() {
  deconnexion();
  ionRouter.navigate('/login', 'root', 'replace');
}
</script>

<style scoped>
.settings-section {
  margin-bottom: 8px;
}

.placeholder-thumb {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
}

.placeholder-thumb ion-icon {
  font-size: 24px;
  color: #999;
}

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
