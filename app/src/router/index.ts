import { createRouter, createWebHistory } from '@ionic/vue-router';
import TabsPage from '@/views/TabsPage.vue';
import { useAuth } from '@/composables/useAuth';

const routes = [
  { path: '/', redirect: '/tabs/recettes' },
  { path: '/login', component: () => import('@/views/LoginPage.vue') },
  { path: '/register', component: () => import('@/views/RegisterPage.vue') },
  { path: '/recette/:id', component: () => import('@/views/RecetteDetailPage.vue') },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      { path: '', redirect: '/tabs/recettes' },
      { path: 'recettes', component: () => import('@/views/RecettesPage.vue') },
      { path: 'ajouter', component: () => import('@/views/AjoutRecettePage.vue') },
      { path: 'profil', component: () => import('@/views/ProfilPage.vue') },
      // Routes existantes conservées
      { path: 'menu', component: () => import('@/views/MenuPage.vue') },
      { path: 'menu/:id', component: () => import('@/views/PlatDetailPage.vue') },
      { path: 'panier', component: () => import('@/views/PanierPage.vue') },
      { path: 'commandes', component: () => import('@/views/CommandesPage.vue') },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Guard d'authentification
router.beforeEach((to, from, next) => {
  const { estConnecte } = useAuth();
  const publicRoutes = ['/login', '/register'];
  
  if (!estConnecte.value && !publicRoutes.includes(to.path)) {
    return next('/login');
  } else if (estConnecte.value && publicRoutes.includes(to.path)) {
    return next('/tabs/recettes');
  } else {
    return next();
  }
});

export default router;
