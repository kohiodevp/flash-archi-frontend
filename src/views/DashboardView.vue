<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { jobsApi } from '@/api/client'
import type { JobSummary } from '@/api/types'
import { useAuthStore } from '@/stores/auth'
import AppButton from '@/components/AppButton.vue'
import AppCard from '@/components/AppCard.vue'
import AppBadge from '@/components/AppBadge.vue'
import { formatDate, shortId } from '@/utils/format'

const auth = useAuthStore()
const router = useRouter()

const jobs = ref<JobSummary[]>([])
const loading = ref(true)
const loadingError = ref('')

const totalJobs = computed(() => jobs.value.length)
const inProgress = computed(() => jobs.value.filter((j) => j.status === 'pending' || j.status === 'processing').length)
const completedJobs = computed(() => jobs.value.filter((j) => j.status === 'completed').length)
const failedJobs = computed(() => jobs.value.filter((j) => j.status === 'failed').length)

async function load() {
  loading.value = true
  loadingError.value = ''
  try {
    const data = await jobsApi.list(50, 0)
    jobs.value = data.items
  } catch (e) {
    loadingError.value = e instanceof Error ? e.message : 'Impossible de charger les jobs.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="mx-auto max-w-6xl px-6 py-10">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="font-display text-2xl font-bold text-brand-900">Tableau de bord</h1>
        <p class="mt-1 text-sm text-slate-500">Vue d'ensemble de vos générations Flash-Archi.</p>
      </div>
      <div class="flex gap-3">
        <AppButton variant="secondary" @click="auth.logout">Déconnexion</AppButton>
        <AppButton variant="primary" @click="router.push('/jobs/new')">＋ Nouveau job</AppButton>
      </div>
    </div>

    <!-- Métriques réelles -->
    <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <AppCard title="Total jobs">
        <p class="font-display text-3xl font-bold text-brand-900">{{ totalJobs }}</p>
      </AppCard>
      <AppCard title="En cours">
        <p class="font-display text-3xl font-bold text-amber-600">{{ inProgress }}</p>
      </AppCard>
      <AppCard title="Complétés">
        <p class="font-display text-3xl font-bold text-emerald-600">{{ completedJobs }}</p>
      </AppCard>
      <AppCard title="Échecs">
        <p class="font-display text-3xl font-bold text-red-600">{{ failedJobs }}</p>
      </AppCard>
    </div>

    <!-- Derniers jobs -->
    <div class="mt-8">
      <AppCard :loading="loading" title="Derniers jobs">
        <p v-if="loadingError" class="text-sm text-red-600" role="alert">Erreur de chargement : {{ loadingError }}</p>
        <div v-else-if="jobs.length === 0" class="text-sm text-slate-500">
          Aucun job pour le moment. <router-link to="/jobs/new" class="text-brand-600 hover:underline">Lancez votre première génération</router-link>.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th class="py-2 pr-4 font-medium">ID</th>
                <th class="py-2 pr-4 font-medium">Statut</th>
                <th class="py-2 pr-4 font-medium">Créé le</th>
                <th class="py-2 font-medium text-right">Détails</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="j in jobs.slice(0, 5)" :key="j.id" class="border-b border-slate-100 last:border-0">
                <td class="py-2.5 pr-4 font-mono text-xs text-slate-600">{{ shortId(j.id) }}</td>
                <td class="py-2.5 pr-4"><AppBadge :status="j.status" /></td>
                <td class="py-2.5 pr-4 text-slate-600">{{ formatDate(j.createdAt) }}</td>
                <td class="py-2.5 text-right">
                  <router-link :to="`/jobs/${encodeURIComponent(j.id)}`" class="text-brand-600 hover:underline">
                    Voir
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AppCard>
    </div>

    <!-- Section « À venir » (V2 — nécessite API backend) -->
    <div class="mt-8">
      <h2 class="mb-3 font-display text-base font-semibold text-slate-400">À venir (V2)</h2>
      <div class="grid gap-5 sm:grid-cols-2">
        <AppCard title="Quota restant" muted>
          <p class="text-sm text-slate-500">
            Le suivi du quota (jobs/mois, plan free/pro) requiert une API backend multi-tenant (V2).
          </p>
          <template #footer><AppBadge status="pending" label="API V2 requise" /></template>
        </AppCard>
        <AppCard title="Profil utilisateur" muted>
          <p class="text-sm text-slate-500">
            Le profil multi-utilisateur requiert la voie API publique multi-tenant (Postgres/RLS, V2).
          </p>
          <template #footer><AppBadge status="pending" label="API V2 requise" /></template>
        </AppCard>
      </div>
    </div>
  </section>
</template>