<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Mes Commandes</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="rafraichir($event)">
        <ion-refresher-content pulling-text="Tirer pour rafraîchir" refreshing-spinner="crescent" />
      </ion-refresher>

      <div v-if="chargement" class="ion-text-center ion-padding-top">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <ion-text color="danger" v-else-if="erreur">
        <p class="ion-text-center">{{ erreur }}</p>
      </ion-text>

      <div v-else-if="commandes.length === 0" class="ion-text-center ion-padding-top">
        <p>Aucune commande passée pour le moment.</p>
      </div>

      <ion-list v-else>
        <ion-card v-for="cmd in commandes" :key="cmd.id" class="ion-margin-bottom">
          <ion-card-header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <ion-card-title>Commande n°{{ cmd.id }}</ion-card-title>
              <ion-badge :color="getCouleurStatut(cmd.statut)">
                {{ cmd.statut }}
              </ion-badge>
            </div>
            <ion-card-subtitle>
              Table {{ cmd.table }} — {{ formatDate(cmd.created_at || cmd.date) }}
            </ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <p><strong>Plats :</strong> {{ formaterLignes(cmd.lignes) }}</p>

            <p class="ion-margin-top">
              <strong>Total : </strong>
              <ion-text color="primary"><strong>{{ formatAriary(Number(cmd.total)) }}</strong></ion-text>
            </p>
          </ion-card-content>
        </ion-card>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onIonViewWillEnter } from '@ionic/vue';
import type { RefresherCustomEvent } from '@ionic/vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonBadge, IonText, IonSpinner, IonRefresher, IonRefresherContent
} from '@ionic/vue';
import api from '@/services/api';
import { formatAriary } from '@/utils/format';
import type { Commande, LigneCommande } from '@/types/gargote';

const commandes = ref<Commande[]>([]);
const chargement = ref(true);
const erreur = ref<string | null>(null);

async function chargerCommandes() {
  try {
    erreur.value = null;
    commandes.value = await api.getCommandes();
  } catch (e: unknown) {
    console.error(e);
    erreur.value = "Impossible de charger l'historique des commandes.";
  } finally {
    chargement.value = false;
  }
}

onIonViewWillEnter(() => {
  chargerCommandes();
});

async function rafraichir(event: RefresherCustomEvent) {
  await chargerCommandes();
  event.target.complete();
}

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formaterLignes(lignes: LigneCommande[]): string {
  if (!lignes || !lignes.length) return '';
  return lignes.map(l => {
    // Vérifie le nom du plat selon le format retourné par l'API (l.plat?.nom, l.plat_nom ou l.nom)
    const nomPlat = l.plat?.nom || l.plat_nom || l.nom || 'Plat';
    return `${l.quantite} × ${nomPlat}`;
  }).join(', ');
}

function getCouleurStatut(statut?: string): string {
  switch (statut?.toLowerCase()) {
    case 'en_attente':
    case 'en attente':
      return 'warning';
    case 'en_cours':
    case 'en cours':
      return 'secondary';
    case 'termine':
    case 'terminée':
    case 'livre':
      return 'success';
    case 'annule':
    case 'annulée':
      return 'danger';
    default:
      return 'medium';
  }
}
</script>