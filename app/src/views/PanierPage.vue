<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Panier</ion-title>
        <!-- Bouton Vider dans la barre de titre si le panier n'est pas vide -->
        <ion-buttons slot="end" v-if="lignes.length > 0">
          <ion-button color="light" @click="vider">Vider</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Cas 1 : Panier vide -->
      <div v-if="lignes.length === 0" class="ion-text-center ion-padding-top">
        <p>Votre panier est vide.</p>
        <ion-button router-link="/tabs/menu" color="primary" class="ion-margin-top">
          Voir le menu
        </ion-button>
      </div>

      <!-- Cas 2 : Panier avec des articles -->
      <div v-else>
        <ion-list>
          <ion-item v-for="ligne in lignes" :key="ligne.plat.id">
            <ion-label>
              <h2>{{ ligne.plat.nom }}</h2>
              <p>{{ formatAriary(Number(ligne.plat.prix)) }} × {{ ligne.quantite }}</p>
            </ion-label>

            <!-- Boutons pour modifier la quantité -->
            <ion-buttons slot="end">
              <ion-button fill="clear" @click="changerQuantite(ligne.plat.id, -1)">
                <ion-icon slot="icon-only" :icon="removeCircleOutline" />
              </ion-button>
              <ion-text class="ion-margin-horizontal"><strong>{{ ligne.quantite }}</strong></ion-text>
              <ion-button fill="clear" @click="changerQuantite(ligne.plat.id, 1)">
                <ion-icon slot="icon-only" :icon="addCircleOutline" />
              </ion-button>
            </ion-buttons>
          </ion-item>
        </ion-list>

        <!-- Ligne Total -->
        <ion-item lines="none" class="ion-margin-top">
          <ion-label><h2><strong>Total</strong></h2></ion-label>
          <ion-text slot="end" color="primary">
            <h2><strong>{{ formatAriary(total) }}</strong></h2>
          </ion-text>
        </ion-item>

        <!-- Formulaire de validation de commande (Fiche 04) -->
        <div class="ion-margin-top">
          <ion-input
            v-model="table"
            type="number"
            label="Numéro de table"
            label-placement="floating"
            fill="outline"
            :class="{ 'ion-invalid ion-touched': erreurTable }"
            :error-text="erreurTable"
          />

          <ion-button
            expand="block"
            class="ion-margin-top"
            :disabled="envoi"
            @click="confirmer"
          >
            Envoyer la commande
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonButton, IonButtons, IonIcon, IonText, IonInput,
  toastController, alertController, loadingController, useIonRouter
} from '@ionic/vue';
import { addCircleOutline, removeCircleOutline } from 'ionicons/icons';
import { usePanier } from '@/composables/usePanier';
import { formatAriary } from '@/utils/format';
import api, { ErreurApi } from '@/services/api';

const { lignes, changerQuantite, vider, total } = usePanier();
const ionRouter = useIonRouter();

const table = ref('');
const envoi = ref(false);
const erreurTable = ref('');

// Étape 3 : Confirmation par Alerte
async function confirmer() {
  erreurTable.value = '';

  if (!table.value) {
    erreurTable.value = 'Le numéro de table est requis.';
    return;
  }

  const alerte = await alertController.create({
    header: 'Confirmer la commande',
    message: `Table ${table.value} : ${formatAriary(total.value)}`,
    buttons: [
      { text: 'Annuler', role: 'cancel' },
      { text: 'Envoyer', role: 'confirm' },
    ],
  });

  await alerte.present();
  const { role } = await alerte.onDidDismiss();

  if (role === 'confirm') {
    await envoyer();
  }
}

// Étape 4 : Envoi et gestion complète (Chargement, API, Succès, Erreurs)
async function envoyer() {
  envoi.value = true;
  erreurTable.value = '';

  // 1. Afficher l'indicateur de chargement
  const loading = await loadingController.create({
    message: 'Envoi de la commande...',
  });
  await loading.present();

  try {
    // 2. Construire le corps attendu par l'API
    const commandeData = {
      table: parseInt(table.value, 10),
      lignes: lignes.value.map(l => ({
        plat_id: l.plat.id,
        quantite: l.quantite
      }))
    };

    // 3. Appeler l'API (récupération de la réponse contenant potentiellement l'id de la commande créée)
    const resultat = await api.creerCommande(commandeData);
    const idCommande = resultat?.id ?? '';

    // 4. En cas de succès
    vider();
    table.value = '';

    const toast = await toastController.create({
      message: `Commande n°${idCommande} envoyée avec succès`,
      duration: 2500,
      color: 'success',
      position: 'top'
    });
    await toast.present();

    // Redirection vers l'onglet Commandes
    ionRouter.navigate('/tabs/commandes', 'forward', 'replace');

  } catch (e: unknown) {
    console.error(e);
    // 5. En cas d'erreur 422 sur la table
    if (e instanceof ErreurApi && e.statut === 422 && e.details?.table) {
      erreurTable.value = e.details.table;
    } else {
      // 6. Pour toute autre erreur (ex: 409 plat épuisé, etc.)
      const messageErreur = e instanceof Error ? e.message : "Erreur lors de l'envoi de la commande.";
      const toast = await toastController.create({
        message: messageErreur || "Erreur lors de l'envoi de la commande.",
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  } finally {
    // 7. Dans tous les cas : fermer l'indicateur de chargement
    await loading.dismiss();
    envoi.value = false;
  }
}
</script>