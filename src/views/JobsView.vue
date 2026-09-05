<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useJobsStore, type StatusFilter } from '@/stores/jobs'
import AppBadge from '@/components/AppBadge.vue'
import AppButton from '@/components/AppButton.vue'
import AppCard from '@/components/AppCard.vue'
import { formatDate, shortId } from '@/utils/format'

const store = useJobsStore()
const active = ref<StatusFilter>('all')

// La liste brute est déjà en mémoire (page courante) : on filtre côté client.
const shown = computed(() => {
  if (active.value === 'all') return store.items
  const st = store.statusOf(active.value)
  return store.items.filter((j) => st!.includes(j.status))
})

const filters: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'in-progress', label: 'En cours' },
  { key: 'completed', label: 'Complétés' },
  { key: 'failed', label: 'Échoués' },
]

onMounted(() => void store.load(0))
</script>

<template>
  <section class="mx-auto max-w-6xl px-6 py-10">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="font-display text-2xl font-bold text-brand-900">Historique des jobs</h1>
        <p class="mt-1 text-sm text-slate-500">Toutes vos générations Flash-Archi, paginées et filtrables.</p>
      </div>
      <AppButton variant="primary" @click="$router.push('/jobs/new')">＋ Nouveau job</AppButton>
    </div>

    <!-- Filtres par statut -->
    <div class="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filtrer par statut">
      <button
        v-for="f in filters"
        :key="f.key"
        type="button"
        class="rounded-full px-4 py-1.5 text-sm font-medium transition"
        :class="active === f.key ? 'bg-brand-600 text-white' : 'border border-slate-300 text-slate-600 hover:bg-slate-100'"
        :aria-pressed="active === f.key"
        @click="active = f.key"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Liste -->
    <div class="mt-6">
      <AppCard :loading="store.loading">
        <p v-if="store.error" class="text-sm text-red-600" role="alert">{{ store.error }}</p>
        <div v-else-if="shown.length === 0" class="py-8 text-center text-sm text-slate-500">
          Aucun job pour ce filtre.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th class="py-2 pr-4 font-medium">ID</th>
                <th class="py-2 pr-4 font-medium">Statut</th>
                <th class="py-2 pr-4 font-medium">Créé le</th>
                <th class="py-2 pr-4 font-medium">Mis à jour</th>
                <th class="py-2 font-medium text-right">Détails</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="j in shown" :key="j.id" class="border-b border-slate-100 last:border-0">
                <td class="py-2.5 pr-4 font-mono text-xs text-slate-600">{{ shortId(j.id) }}</td>
                <td class="py-2.5 pr-4"><AppBadge :status="j.status" /></td>
                <td class="py-2.5 pr-4 text-slate-600">{{ formatDate(j.createdAt) }}</td>
                <td class="py-2.5 pr-4 text-slate-600">{{ formatDate(j.updatedAt) }}</td>
                <td class="py-2.5 text-right">
                  <router-link :to="`/jobs/${encodeURIComponent(j.id)}`" class="text-brand-600 hover:underline">
                    Voir
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
          <span class="text-slate-500">
            Page {{ store.page + 1 }}<template v-if="store.total > 0"> / {{ Math.max(1, Math.ceil(store.total / store.pageSize)) }}</template>
            <span v-if="active !== 'all'" class="ml-1 text-slate-400">(filtre {{ shown.length }}/{{ store.items.length }})</span>
          </span>
          <div class="flex gap-2">
            <AppButton variant="secondary" :disabled="!store.hasPrev || store.loading" @click="store.prev()">← Précédent</AppButton>
            <AppButton variant="secondary" :disabled="!store.hasMore || store.loading" @click="store.next()">Suivant →</AppButton>
          </div>
        </div>
      </AppCard>
    </div>
  </section>
</template>