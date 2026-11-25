<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/recettes" :text="t('common.back')" />
        </ion-buttons>
        <ion-title>{{ t('shopping_list.title') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="listeCourses.length > 0" @click="confirmerToutEffacer">
            <ion-icon slot="icon-only" :icon="trashOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="listeCourses.length === 0" class="empty-state">
        <ion-icon :icon="cartOutline" class="large-icon" />
        <p>{{ t('shopping_list.empty') }}</p>
        <ion-button router-link="/tabs/recettes" fill="outline">
          {{ t('recettes.title') }}
        </ion-button>
      </div>

      <ion-list v-else>
        <div v-for="(item, index) in listeCourses" :key="item.nom + item.unite">
          <ion-item-sliding>
            <ion-item>
              <ion-checkbox slot="start" :checked="item.coche" @ion-change="toggleItem(index)" />
              <ion-label :class="{ 'item-done': item.coche }">
                <h3>{{ item.nom }}</h3>
                <p>{{ item.quantite }}</p>
                <ion-note v-if="item.recetteNom" slot="end" color="medium">{{ item.recetteNom }}</ion-note>
              </ion-label>
            </ion-item>

            <ion-item-options side="end">
              <ion-item-option color="danger" @click="supprimerItem(index)">
                <ion-icon slot="icon-only" :icon="trashOutline" />
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </div>
      </ion-list>

      <ion-alert
        :is-open="showAlert"
        :header="t('shopping_list.clear_all')"
        :message="'Voulez-vous vraiment vider votre liste ?'"
        :buttons="[
          { text: t('common.cancel'), role: 'cancel', handler: () => showAlert = false },
          { text: t('common.delete'), handler: handleToutEffacer }
        ]"
        @did-dismiss="showAlert = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonCheckbox, IonButtons, IonBackButton,
  IonButton, IonIcon, IonItemSliding, IonItemOptions, IonItemOption,
  IonNote, IonAlert
} from '@ionic/vue';
import { cartOutline, trashOutline } from 'ionicons/icons';
import { useCourses } from '@/composables/useCourses';
import { useI18n } from '@/composables/useI18n';

const { listeCourses, toggleItem, supprimerItem, toutEffacer } = useCourses();
const { t } = useI18n();

const showAlert = ref(false);

function confirmerToutEffacer() {
  showAlert.value = true;
}

function handleToutEffacer() {
  toutEffacer();
  showAlert.value = false;
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80%;
  text-align: center;
  color: var(--ion-color-medium);
}

.large-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.item-done h3, .item-done p {
  text-decoration: line-through;
  opacity: 0.6;
}
</style>
