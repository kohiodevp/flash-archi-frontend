<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DOMPurify from 'dompurify'
import { jobsApi, subscribeJob } from '@/api/client'
import type { Job, JobStatus } from '@/api/types'
import AppBadge from '@/components/AppBadge.vue'
import AppButton from '@/components/AppButton.vue'
import AppCard from '@/components/AppCard.vue'
import { shortId } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const jobId = route.params.id as string

const job = ref<Job | null>(null)
const status = ref<JobStatus>('pending')
const loading = ref(true)
const error = ref('')
const sseConnected = ref(false)

// --- Sécurité XSS : le SVG vient d'une source non fiable (LLM).
//     DOMPurify strip <script>, foreignObject, attributs on*, etc.
//     Utilisé via v-html UNIQUEMENT sur ce SVG nettoyé.
const cleanSvg = computed(() => {
  const svg = job.value?.result?.plan2d?.svg
  if (!svg) return ''
  return DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ['script', 'foreignObject', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick'],
  })
})

// --- Façades (PNG base64 → data URI) ---
const facadeNames: { key: 'north' | 'south' | 'east' | 'west'; label: string }[] = [
  { key: 'north', label: 'Nord' },
  { key: 'south', label: 'Sud' },
  { key: 'east', label: 'Est' },
  { key: 'west', label: 'Ouest' },
]
const facadeDataUri = (b64?: string) => (b64 && b64.length > 0 ? `data:image/png;base64,${b64}` : '')

// --- Métriques BIM (traduction clé → libellé) ---
const metricLabels: Record<string, string> = {
  footprintArea: 'Empreinte au sol (m²)',
  grossVolume: 'Volume brut (m³)',
  openingCount: 'Ouvertures',
  roofArea: 'Toiture (m²)',
  totalVolume: 'Volume total (m³)',
}
const metrics = computed(() => {
  const m = job.value?.result?.bimMetrics
  if (!m) return []
  return Object.entries(metricLabels)
    .filter(([k]) => m[k] != null)
    .map(([k, label]) => ({ label, value: m[k] as number }))
})

// --- Téléchargements (pas de dépendance : Blob + URL.createObjectURL) ---
const mime = { svg: 'image/svg+xml', png: 'image/png', ifc: 'application/step', json: 'application/json' }
function downloadText(filename: string, data: string, type: string) {
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
const slug = () => shortId(jobId).replace(/…/g, '')

function dlSvg() {
  if (job.value?.result?.plan2d?.svg) downloadText(`plan-${slug()}.svg`, job.value.result.plan2d.svg, mime.svg)
}
function dlFacade(key: 'north' | 'south' | 'east' | 'west') {
  const b64 = job.value?.result?.facades?.[key]
  if (b64) downloadText(`facade-${key}-${slug()}.png`, atob(b64), mime.png)
}
function dlIfc() {
  const raw = job.value?.result?.ifcModel
  if (!raw) return
  const base64 = raw.includes('base64,') ? raw.split('base64,')[1] : raw
  downloadText(`ifc-${slug()}.ifc`, atob(base64), mime.ifc)
}

// --- SSR/SSE ---
let unsub: (() => void) | null = null

function applyEvent(ev: { status?: JobStatus; result?: unknown; error?: string }) {
  if (ev.status) status.value = ev.status
  if (ev.error) error.value = ev.error
  if (ev.result && typeof ev.result === 'object') {
    job.value = { ...(job.value ?? { id: jobId, status: status.value, createdAt: 0, updatedAt: 0 }), result: ev.result as Job['result'] }
  }
}

async function load() {
  loading.value = !job.value
  try {
    const j = await jobsApi.get(jobId)
    job.value = j
    status.value = j.status
    if (j.error) error.value = j.error
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Impossible de charger le job.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // État initial + souscription SSE.
  void load()

  // Abonnement au flux temps réel.
  unsub = subscribeJob(
    jobId,
    (ev) => {
      sseConnected.value = true
      applyEvent(ev)
      if (ev.status === 'completed' || ev.status === 'failed') {
        // Récupérer le résultat complet (le flux ne porte pas toujours le payload final).
        void load()
      }
    },
    (err) => {
      // Si le SSE échoue (ex. AUTH_ENABLED=true et clé expirée), on retombe sur le polling au detail.
      console.warn('[flash-archi] SSE error:', err)
    }
  )
})

onBeforeUnmount(() => {
  unsub?.()
})
</script>

<template>
  <section class="mx-auto max-w-5xl px-6 py-10">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="font-display text-xl font-bold text-brand-900">Job <span class="font-mono">{{ shortId(jobId) }}</span></h1>
        <div class="mt-1 flex items-center gap-3">
          <AppBadge :status="status" />
          <span v-if="sseConnected" class="inline-flex items-center gap-1 text-xs text-emerald-600">
            <span class="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" /> temps réel
          </span>
        </div>
      </div>
      <div class="flex gap-2">
        <AppButton variant="primary" @click="router.push('/jobs/new')">＋ Nouveau job</AppButton>
        <AppButton variant="secondary" @click="router.push('/dashboard')">← Tableau de bord</AppButton>
      </div>
    </div>

    <!-- Erreur globale -->
    <div v-if="error && !job?.result" class="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      {{ error }}
      <template v-if="status === 'failed'"> — la génération a échoué. Lancez un nouveau job.</template>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="mt-10 flex justify-center py-16 text-slate-400" role="status">
      <svg class="animate-spin text-brand-600" width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
      </svg>
    </div>

    <!-- Résultat -->
    <div v-else-if="job?.result" class="mt-8 flex flex-col gap-6">
      <!-- Plan 2D -->
      <AppCard title="Plan 2D">
        <div class="overflow-x-auto rounded border border-slate-200 bg-white p-2">
          <!-- v-html UNIQUEMENT sur le SVG DOMPurify-nettoyé (sécurité XSS) -->
          <div class="mx-auto w-fit" v-html="cleanSvg"></div>
        </div>
        <template #footer>
          <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span v-if="job.result.plan2d?.scale">Échelle 1/{{ job.result.plan2d.scale }}</span>
            <span v-if="job.result.plan2d?.legend">{{ job.result.plan2d.legend }}</span>
            <span class="flex-1" />
            <AppButton variant="secondary" @click="dlSvg">Télécharger SVG</AppButton>
          </div>
        </template>
      </AppCard>

      <!-- Façades -->
      <AppCard title="Façades">
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div v-for="f in facadeNames" :key="f.key" class="flex flex-col gap-2">
            <div class="flex aspect-[4/3] items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-50">
              <img v-if="facadeDataUri(job.result!.facades?.[f.key])" :src="facadeDataUri(job.result!.facades?.[f.key])" :alt="`Façade ${f.label}`" class="h-full w-full object-contain" />
              <span v-else class="text-xs text-slate-400">—</span>
            </div>
            <div class="flex items-center justify-between text-xs font-medium text-slate-600">
              <span>{{ f.label }}</span>
              <button v-if="job.result!.facades?.[f.key]" type="button" class="text-brand-600 hover:underline" @click="dlFacade(f.key)">
                PNG
              </button>
            </div>
          </div>
        </div>
      </AppCard>

      <!-- Métriques BIM -->
      <AppCard title="Métriques BIM" v-if="metrics.length > 0">
        <dl class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div v-for="m in metrics" :key="m.label" class="rounded-md bg-slate-50 p-3">
            <dt class="text-xs text-slate-500">{{ m.label }}</dt>
            <dd class="mt-0.5 font-display text-lg font-bold text-brand-900">{{ m.value }}</dd>
          </div>
        </dl>
        <template #footer v-if="job?.result?.ifcModel">
          <div class="flex items-center justify-end gap-2">
            <AppButton variant="secondary" @click="dlIfc">Télécharger IFC</AppButton>
          </div>
        </template>
      </AppCard>
    </div>

    <!-- Job en cours / pas encore de résultat -->
    <div v-else class="mt-10 text-center text-slate-500">
      <svg class="mx-auto mb-3 animate-spin text-brand-600" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
      </svg>
      <p>Génération en cours… le résultat apparaîtra automatiquement.</p>
    </div>
  </section>
</template>