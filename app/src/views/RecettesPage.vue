<template>
  <ion-page>
    <ion-content>
      <ion-refresher slot="fixed" @ion-refresh="rafraichir">
        <ion-refresher-content />
      </ion-refresher>

      <div class="app">
        <header class="topbar">
          <div class="brand"><span class="brand-mark">✳</span>KALY!</div>
          <div class="top-actions">
            <button class="round-btn" aria-label="Rechercher" @click="rechercheOuverte = !rechercheOuverte">
              <ion-icon :icon="searchOutline" />
            </button>
            <button class="round-btn" aria-label="Profil" @click="ionRouter.navigate('/tabs/profil', 'forward')">
              <ion-icon :icon="happyOutline" />
            </button>
          </div>
        </header>

        <div v-if="rechercheOuverte" class="searchbar">
          <input v-model="recherche" type="search" placeholder="Chercher une recette…" />
        </div>

        <section class="greeting">
          <div class="kaly-kicker">Mihinana tsara, e!</div>
          <h2 class="kaly-titre">T’as faim ?<br /><span class="souligne">On cuisine quoi ?</span></h2>
          <p class="kaly-sous-titre">Des idées bien de chez nous, à préparer à ta façon.</p>
          <div class="sticker">MASAKA<br />TSARA<br />✳</div>
        </section>

        <nav class="filters" aria-label="Régions">
          <button
            class="filter"
            :class="{ active: regionChoisie === null && !favorisSeulement }"
            @click="toutVoir"
          >Tout voir</button>
          <button
            v-for="region in regions"
            :key="region"
            class="filter"
            :class="{ active: regionChoisie === region }"
            @click="regionChoisie = region"
          >{{ region }}</button>
          <button
            class="filter"
            :class="{ active: favorisSeulement }"
            @click="favorisSeulement = !favorisSeulement"
          >♡ Favoris</button>
        </nav>

        <div v-if="chargement" class="ion-text-center ion-padding">
          <ion-spinner />
        </div>

        <div v-else-if="erreur" class="kaly-vide">
          <p>{{ erreur }}</p>
          <ion-button class="kaly-btn" @click="charger">Réessayer</ion-button>
        </div>

        <template v-else-if="recettes.length > 0">
          <section class="feature" @click="ouvrir(vedette.id)">
            <img
              v-if="aUneImage(vedette)"
              :src="`${BASE_URL}${vedette.imageUrl}`"
              :alt="vedette.nom"
              @error="imagesEnErreur.add(vedette.id)"
            />
            <ion-icon v-else :icon="restaurantOutline" class="feature-icone" />
            <div class="feature-top">
              <span class="tag">Recette à découvrir</span>
              <button class="heart" aria-label="Favori" @click.stop="basculerFavori(vedette.id)">
                <ion-icon :icon="estFavori(vedette.id) ? heart : heartOutline" />
              </button>
            </div>
            <div class="feature-copy">
              <div class="tiny">{{ vedette.region }} · {{ vedette.nomMg }}</div>
              <h3>{{ vedette.nom }}</h3>
              <div class="meta">
                <span>◷ {{ vedette.tempsMin }} min</span>
                <span>✳ {{ formatAr(vedette.coutAr) }}</span>
              </div>
            </div>
          </section>

          <div class="section-head">
            <h3 class="kaly-section">Les envies du moment</h3>
            <button @click="toutVoir">Tout voir ↗</button>
          </div>

          <div v-if="autres.length > 0" class="recipe-grid">
            <article
              v-for="recette in autres"
              :key="recette.id"
              class="recipe-card"
              @click="ouvrir(recette.id)"
            >
              <div class="photo">
                <img
                  v-if="aUneImage(recette)"
                  :src="`${BASE_URL}${recette.imageUrl}`"
                  :alt="recette.nom"
                  @error="imagesEnErreur.add(recette.id)"
                />
                <ion-icon v-else :icon="restaurantOutline" class="photo-icone" />
                <span class="mini-time">{{ recette.tempsMin }} min</span>
                <button class="mini-heart" aria-label="Favori" @click.stop="basculerFavori(recette.id)">
                  <ion-icon :icon="estFavori(recette.id) ? heart : heartOutline" />
                </button>
              </div>
              <div class="recipe-info">
                <h4>{{ recette.nom }}</h4>
                <p>{{ recette.region }} · {{ formatAr(recette.coutAr) }}</p>
              </div>
              <span class="card-arrow">↗</span>
            </article>
          </div>
          <p v-else class="kaly-vide">C’est la seule recette pour ce choix.</p>
        </template>

        <p v-else class="kaly-vide">{{ messageVide }}</p>

        <section class="banner">
          <div>
            <strong>La cuisine, ça se partage.</strong>
            <small>Garde tes trouvailles dans ton carnet.</small>
          </div>
          <button aria-label="Voir mes favoris" @click="voirFavoris">↗</button>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import {
  IonPage, IonContent, IonButton, IonSpinner, IonIcon,
  IonRefresher, IonRefresherContent, onIonViewWillEnter,
  useIonRouter, toastController
} from '@ionic/vue';
import type { RefresherCustomEvent } from '@ionic/vue';
import { restaurantOutline, heart, heartOutline, searchOutline, happyOutline } from 'ionicons/icons';
import api from '@/services/api';
import { formatAr } from '@/utils/format';
import type { Recette } from '@/types/recette';
import { useFavoris } from '@/composables/useFavoris';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const ionRouter = useIonRouter();

const regions = ['Merina', 'Betsileo', 'Sakalava', 'Antandroy', 'Betsimisaraka'] as const;
const regionChoisie = ref<string | null>(null);
const recherche = ref('');
const rechercheOuverte = ref(false);
const favorisSeulement = ref(false);
const { estFavori, toggleFavori, listeFavoris, charger: chargerFavoris } = useFavoris();
const toutesRecettes = ref<Recette[]>([]);
const chargement = ref(true);
const erreur = ref<string | null>(null);
const imagesEnErreur = reactive(new Set<string>());

function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

const recettes = computed(() => {
  let liste = [...toutesRecettes.value];

  if (regionChoisie.value) {
    liste = liste.filter(r => r.region === regionChoisie.value);
  }

  if (favorisSeulement.value) {
    liste = liste.filter(r => listeFavoris.value.includes(r.id));
  }

  if (recherche.value.trim()) {
    const terme = normaliser(recherche.value.trim());
    liste = liste.filter(r =>
      normaliser(r.nom).includes(terme) ||
      normaliser(r.nomMg).includes(terme)
    );
  }

  return liste;
});

const vedette = computed(() => recettes.value[0]);
const autres = computed(() => recettes.value.slice(1));

const messageVide = computed(() => {
  if (favorisSeulement.value) return 'Aucune recette en favori. Touche le ♡ d’une recette.';
  if (recherche.value.trim()) return 'Aucune recette ne correspond. Essaie un autre mot.';
  return regionChoisie.value
    ? 'Aucune recette pour cette région.'
    : 'Aucune recette trouvée.';
});

function aUneImage(recette: Recette): boolean {
  return !!recette.imageUrl && !imagesEnErreur.has(recette.id);
}

function toutVoir() {
  regionChoisie.value = null;
  favorisSeulement.value = false;
  recherche.value = '';
}

function voirFavoris() {
  regionChoisie.value = null;
  favorisSeulement.value = true;
}

function ouvrir(id: string) {
  ionRouter.navigate(`/recette/${id}`, 'forward');
}

async function basculerFavori(id: string) {
  toggleFavori(id);
  const toast = await toastController.create({
    message: estFavori.value(id) ? 'Ajouté au carnet !' : 'Retiré des favoris',
    duration: 1500,
    position: 'bottom',
    cssClass: 'kaly-toast',
  });
  await toast.present();
}

async function charger() {
  chargement.value = true;
  erreur.value = null;
  try {
    toutesRecettes.value = await api.listeRecettes();
  } catch (e: unknown) {
    erreur.value = 'Impossible de charger les recettes.';
    console.error(e);
  } finally {
    chargement.value = false;
  }
}

async function rafraichir(event: RefresherCustomEvent) {
  await charger();
  event.target.complete();
}

onIonViewWillEnter(() => {
  chargerFavoris();
  charger();
});
</script>

<style scoped>
.app {
  padding: calc(env(safe-area-inset-top) + 4px) 18px 24px;
}

.topbar {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 7px;
  font: 25px/0.8 var(--kaly-font-titre);
  letter-spacing: -0.08em;
}

.brand-mark {
  width: 26px;
  height: 26px;
  background: var(--kaly-red);
  border-radius: 8px 8px 8px 2px;
  display: grid;
  place-items: center;
  transform: rotate(-7deg);
  color: #fff;
  font-size: 16px;
  letter-spacing: 0;
}

.top-actions {
  display: flex;
  gap: 8px;
}

.round-btn {
  width: 36px;
  height: 36px;
  border: 1.5px solid var(--kaly-ink);
  background: transparent;
  color: var(--kaly-ink);
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 17px;
  cursor: pointer;
}

.searchbar {
  margin: 2px 0 11px;
}

.searchbar input {
  width: 100%;
  border: 1.3px solid var(--kaly-ink);
  background: var(--kaly-card);
  color: var(--kaly-ink);
  border-radius: 30px;
  padding: 11px 14px;
  font: inherit;
  font-size: 13px;
  outline: none;
}

.greeting {
  position: relative;
  padding: 10px 0 13px;
}

.greeting .kaly-titre {
  max-width: 230px;
}

.sticker {
  position: absolute;
  right: 3px;
  top: 21px;
  width: 76px;
  height: 76px;
  background: var(--kaly-green);
  color: var(--kaly-on-accent);
  border: 1.7px solid var(--kaly-ink);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  transform: rotate(11deg);
  font: 700 10px/1.1 var(--kaly-font-mono);
  padding: 9px;
}

.sticker::after {
  content: '✳';
  position: absolute;
  font-size: 21px;
  right: -6px;
  top: -9px;
  color: var(--kaly-red);
}

.filters {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  padding: 7px 0 15px;
  scrollbar-width: none;
}

.filters::-webkit-scrollbar {
  display: none;
}

.filter {
  white-space: nowrap;
  border: 1.3px solid var(--kaly-ink);
  border-radius: 30px;
  background: transparent;
  padding: 8px 13px;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  color: var(--kaly-ink);
  cursor: pointer;
}

.filter.active {
  background: var(--kaly-ink);
  color: var(--kaly-paper);
}

.feature {
  position: relative;
  border: 1.6px solid var(--kaly-ink);
  border-radius: 22px 22px 7px 22px;
  overflow: hidden;
  background: var(--kaly-red);
  height: 276px;
  color: #fff;
  isolation: isolate;
  cursor: pointer;
}

.feature img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -2;
}

.feature-icone {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -70%);
  font-size: 90px;
  color: rgba(255, 255, 255, 0.35);
  z-index: -2;
}

.feature::after {
  content: '';
  position: absolute;
  inset: 35% 0 0;
  background: linear-gradient(transparent, rgba(16, 15, 18, 0.84));
  z-index: -1;
}

.feature-top {
  position: absolute;
  left: 13px;
  right: 13px;
  top: 13px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tag {
  background: var(--kaly-yellow);
  color: var(--kaly-on-accent);
  border: 1.3px solid #201d24;
  border-radius: 30px;
  padding: 7px 10px;
  font: 700 9px var(--kaly-font-mono);
  text-transform: uppercase;
}

.heart {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1.3px solid #201d24;
  background: #fff6df;
  color: #c92e26;
  display: grid;
  place-items: center;
  font-size: 18px;
  cursor: pointer;
}

.feature-copy {
  position: absolute;
  left: 16px;
  right: 14px;
  bottom: 15px;
}

.feature-copy .tiny {
  font: 700 9px var(--kaly-font-mono);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.feature-copy h3 {
  font: 400 30px/0.92 var(--kaly-font-titre);
  letter-spacing: -0.06em;
  margin: 6px 0 8px;
  max-width: 260px;
}

.meta {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: end;
  margin: 23px 0 12px;
}

.section-head .kaly-section {
  margin: 0;
}

.section-head button {
  border: 0;
  background: none;
  text-decoration: underline;
  text-underline-offset: 3px;
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  padding: 0;
  color: var(--kaly-red-dark);
  cursor: pointer;
}

.recipe-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.recipe-card {
  border: 1.3px solid var(--kaly-ink);
  border-radius: 15px 15px 5px 15px;
  overflow: hidden;
  background: var(--kaly-card);
  position: relative;
  cursor: pointer;
  min-width: 0;
}

.recipe-card .photo {
  height: 112px;
  position: relative;
  background: var(--kaly-blue);
  display: grid;
  place-items: center;
}

.recipe-card img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-icone {
  font-size: 40px;
  color: rgba(32, 29, 36, 0.4);
}

.mini-time {
  position: absolute;
  bottom: 7px;
  left: 7px;
  background: #fff6df;
  color: #201d24;
  border: 1px solid #201d24;
  border-radius: 30px;
  padding: 5px 7px;
  font: 700 9px var(--kaly-font-mono);
}

.mini-heart {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #201d24;
  background: #fff6df;
  color: #c92e26;
  display: grid;
  place-items: center;
  font-size: 15px;
  cursor: pointer;
}

.recipe-info {
  padding: 9px 30px 11px 10px;
}

.recipe-info h4 {
  font: 400 16px/1 var(--kaly-font-titre);
  letter-spacing: -0.045em;
  margin: 0 0 5px;
  overflow-wrap: anywhere;
}

.recipe-info p {
  font-size: 11px;
  color: var(--kaly-muted);
  margin: 0;
  line-height: 1.4;
}

.card-arrow {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 22px;
  height: 22px;
  background: var(--kaly-yellow);
  color: var(--kaly-on-accent);
  border: 1px solid var(--kaly-ink);
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 13px;
}

.banner {
  margin-top: 17px;
  background: var(--kaly-purple);
  color: #fff;
  border: 1.4px solid var(--kaly-ink);
  border-radius: 7px 20px 20px 20px;
  padding: 14px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 91px;
  overflow: hidden;
  position: relative;
}

.banner::after {
  content: '✳';
  position: absolute;
  right: 48px;
  top: -24px;
  font-size: 100px;
  color: rgba(255, 255, 255, 0.08);
}

.banner strong {
  display: block;
  font: 400 18px/0.95 var(--kaly-font-titre);
  letter-spacing: -0.04em;
  max-width: 190px;
}

.banner small {
  display: block;
  margin-top: 7px;
  font-size: 11px;
  color: #e8ddeb;
}

.banner button {
  z-index: 1;
  border: 1.3px solid #201d24;
  background: var(--kaly-yellow);
  color: var(--kaly-on-accent);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 18px;
  cursor: pointer;
}
</style>
