<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { paymentApi } from '@/api/client'
import AppButton from '@/components/AppButton.vue'

const route = useRoute()
const router = useRouter()

const orderId = typeof route.query.orderId === 'string' ? route.query.orderId : ''
const status = ref<'pending' | 'accepted' | 'refused' | 'cancelled' | 'failed' | 'idle'>('idle')
const polling = ref(false)
const error = ref('')
let timer: ReturnType<typeof setInterval> | null = null

// Durée de polling : 2 minutes (120s), toutes les 3 secondes.
const POLL_INTERVAL_MS = 3_000
const POLL_MAX_MS = 120_000

const isAccepted = computed(() => status.value === 'accepted')
const isRefused = computed(() => status.value === 'refused' || status.value === 'cancelled' || status.value === 'failed')

const statusText = computed(() => {
  switch (status.value) {
    case 'accepted': return 'Paiement réussi !'
    case 'refused': return 'Le paiement a été refusé.'
    case 'cancelled': return 'Le paiement a été annulé.'
    case 'failed': return "Échec du paiement."
    case 'pending': return 'Le paiement est en cours de traitement.'
    default: return "En attente de confirmation du paiement..."
  }
})

// Récupère le statut auprès du backend (polling).
async function pollStatus() {
  if (!orderId) {
    error.value = 'Aucun identifiant de commande fourni.'
    return
  }
  polling.value = true
  try {
    const { status: s } = await paymentApi.status(orderId)
    status.value = s as typeof status.value
    // Stop polling dès qu'on atteint un état final.
    if (s === 'accepted' || s === 'refused') {
      stopPolling()
    }
  } catch (err: any) {
    error.value = err?.message || 'Impossible de vérifier le statut du paiement.'
  } finally {
    polling.value = false
  }
}

function startPolling() {
  // Prime à la première vérification immédiate.
  void pollStatus()
  const startedAt = Date.now()
  timer = setInterval(async () => {
    if (Date.now() - startedAt > POLL_MAX_MS) {
      stopPolling()
      return
    }
    await pollStatus()
  }, POLL_INTERVAL_MS)
}

function stopPolling() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  if (orderId) {
    startPolling()
  }
})

onBeforeUnmount(() => {
  stopPolling()
})
</script>

<template>
  <section class="mx-auto max-w-xl px-6 py-16 text-center">
    <!-- Cas réussi -->
    <template v-if="isAccepted">
      <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100">
        <svg class="size-8 text-emerald-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1 class="mt-4 font-display text-2xl font-bold text-emerald-800">{{ statusText }}</h1>
      <p class="mt-3 text-slate-600">
        Votre compte a bien été mis à niveau. Vous pouvez dès maintenant profiter de
        votre abonnement et générer vos plans.
      </p>
      <div class="mt-6 flex justify-center gap-3">
        <AppButton @click="router.push('/dashboard')">Aller au tableau de bord</AppButton>
      </div>
    </template>

    <!-- Cas échec / refus -->
    <template v-else-if="isRefused">
      <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-red-100">
        <svg class="size-8 text-red-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1 class="mt-4 font-display text-2xl font-bold text-slate-800">{{ statusText }}</h1>
      <p class="mt-3 text-slate-600">
        Votre paiement n'a pas abouti. Vous pouvez réessayer ou contacter notre support
        au besoin.
      </p>
      <div class="mt-6 flex justify-center gap-3">
        <AppButton :variant="'secondary'" @click="router.push('/checkout?plan=pro')">
          Réessayer
        </AppButton>
      </div>
    </template>

    <!-- Cas timeout / traitement en cours -->
    <template v-else>
      <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-accent-100">
        <svg class="size-8 animate-spin text-accent-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" />
        </svg>
      </div>
      <h1 class="mt-4 font-display text-2xl font-bold text-slate-800">{{ statusText }}</h1>
      <p class="mt-3 text-slate-600">
        Le paiement est en cours de traitement. Vous recevrez une notification sur votre
        téléphone pour valider l'opération.
      </p>
      <p v-if="!orderId" class="mt-3 text-sm text-red-600">{{ error }}</p>
      <p v-else class="mt-3 text-xs text-slate-400">
        Commande {{ orderId }} — Reconnaissance automatique en cours...
      </p>
    </template>
  </section>
</template>