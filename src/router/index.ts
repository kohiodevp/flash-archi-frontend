import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import JobsView from '@/views/JobsView.vue'
import NewJobView from '@/views/NewJobView.vue'
import JobDetailView from '@/views/JobDetailView.vue'
import PricingView from '@/views/PricingView.vue'
import CheckoutView from '@/views/CheckoutView.vue'
import CheckoutSuccessView from '@/views/CheckoutSuccessView.vue'
import CheckoutCancelView from '@/views/CheckoutCancelView.vue'
import AccountView from '@/views/AccountView.vue'

// =============================================================
// Routeur SPA Flash-Archi (Phase 2)
// - Garde d'authentification : routes meta.requiresAuth → /login
//   si aucune clé API valide en session.
// - La session est réhydratée depuis sessionStorage avant l'auth
//   (sinon un F5 sur /dashboard déconnecterait).
// =============================================================

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/pricing', name: 'pricing', component: PricingView },
    { path: '/checkout', name: 'checkout', component: CheckoutView, meta: { requiresAuth: true } },
    { path: '/checkout/success', name: 'checkout-success', component: CheckoutSuccessView },
    { path: '/checkout/cancel', name: 'checkout-cancel', component: CheckoutCancelView },
    { path: '/account', name: 'account', component: AccountView, meta: { requiresAuth: true } },
    { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/jobs', name: 'jobs', component: JobsView, meta: { requiresAuth: true } },
    { path: '/jobs/new', name: 'new-job', component: NewJobView, meta: { requiresAuth: true } },
    { path: '/jobs/:id', name: 'job-detail', component: JobDetailView, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  void auth.restoreFromStorage()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: to.fullPath ? { redirect: to.fullPath } : {} }
  }
  return true
})

export default router