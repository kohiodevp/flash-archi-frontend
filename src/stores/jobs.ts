import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jobsApi } from '@/api/client'
import type { JobSummary } from '@/api/types'

export type StatusFilter = 'all' | 'in-progress' | 'completed' | 'failed'

// =============================================================
// Store jobs — liste paginée + filtrage par statut (Historique).
// Métadonnées de pagination across les requêtes (limit/offset fixés).
// Le filtrage par statut est appliqué côté serveur quand possible,
// sinon côté client (l'API ne filtre pas à distance).
// =============================================================

const PAGE_SIZE = 50

const statusOf = (f: StatusFilter) =>
  f === 'in-progress' ? ['pending', 'processing'] : f === 'all' ? null : [f]

export const useJobsStore = defineStore('jobs', () => {
  const items = ref<JobSummary[]>([])
  const total = ref(0)
  const offset = ref(0)
  const filter = ref<StatusFilter>('all')
  const loading = ref(false)
  const error = ref('')

  const page = computed(() => Math.floor(offset.value / PAGE_SIZE))
  const pageSize = PAGE_SIZE

  const hasMore = computed(() => offset.value + items.value.length < total.value)
  const hasPrev = computed(() => offset.value > 0)

  async function load(nextOffset = offset.value): Promise<void> {
    loading.value = true
    error.value = ''
    offset.value = nextOffset
    try {
      const data = await jobsApi.list(PAGE_SIZE, nextOffset)
      total.value = data.count !== undefined && data.count > 0 ? data.count : Math.max(data.count, 0)
      items.value = data.items
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Impossible de charger les jobs.'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  function next(): void {
    if (hasMore.value) void load(offset.value + PAGE_SIZE)
  }
  function prev(): void {
    if (hasPrev.value) void load(Math.max(0, offset.value - PAGE_SIZE))
  }

  return { items, total, offset, filter, page, pageSize, loading, error, hasMore, hasPrev, load, next, prev, statusOf }
})