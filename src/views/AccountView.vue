<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { paymentApi } from '@/api/client'
import type { AccountInfo } from '@/api/types'
import AppButton from '@/components/AppButton.vue'

const router = useRouter()
const auth = useAuthStore()

const account = ref<AccountInfo | null>(null)
const loading = ref(false)
const error = ref('')

const userId = computed(() => auth.apiKey || '')

const planLabel = computed(() => {
  if (!account.value) return ''
  const plan = account.value.quota.plan
  if (plan === 'pro') return 'Pro'
  if (plan === 'enterprise') return 'Enterprise'
  return 'Gratuit'
})

const planBadgeColor = computed(() => {
  if (!account.value) return 'bg-slate-100 text-slate-600'
  const plan = account.value.quota.plan
  if (plan === 'pro') return 'bg-accent-100 text-accent-700'
  if (plan === 'enterprise') return 'bg-brand-100 text-brand-800'
  return 'bg-slate-100 text-slate-600'
})

// Progression du quota (en %)
const quotaPercent = computed(() => {
  if (!account.value) return 0
  const { quotaTotal, quotaRemaining } = account.value.quota
  if (!quotaTotal) return 0
  const used = Math.max(0, quotaTotal - quotaRemaining)
  return Math.min(100, Math.round((used / quotaTotal) * 100))
})

// Date de renouvellement formatée en français
const renewalDate = computed(() => {
  if (!account.value?.quota.quotaResetAt) return null
  const d = new Date(account.value.quota.quotaResetAt)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
})

const paymentStatusLabel = (status: string) => paymentApi.staticLabel(status)

async function loadAccount() {
  if (!userId.value) return
  loading.value = true
  error.value = ''
  try {
    account.value = await paymentApi.account(userId.value)
  } catch (err: any) {
    error.value = err?.message || 'Impossible de charger votre compte.'
  } finally {
    loading.value = false
  }
}

onMounted(loadAccount)
</script>

<template>
  <section class="mx-auto max-w-3xl px-6 py-14">
    <h1 class="font-display text-3xl font-bold text-brand-900 mb-2">Mon compte</h1>
    <p class="text-slate-500 mb-8">Gérez votre abonnement, votre quota et suivez vos paiements.</p>

    <!-- État de chargement / erreur -->
    <div v-if="loading" class="text-slate-400">Chargement de votre compte...</div>
    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
      {{ error }}
    </div>

    <template v-else-if="account">
      <!-- Carte Abonnement -->
      <div class="rounded-xl border border-brand-200 bg-white p-6 shadow-sm mb-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="font-display text-lg font-semibold text-brand-900">Abonnement actuel</h2>
            <p class="text-sm text-slate-500">Compte : {{ account.user.id }}</p>
          </div>
          <span class="rounded-full px-3 py-1 text-sm font-semibold" :class="planBadgeColor">
            {{ planLabel }}
          </span>
        </div>

        <!-- Quota -->
        <div class="mt-6">
          <div class="flex items-center justify-between text-sm">
            <span class="font-medium text-slate-700">Quota mensuel</span>
            <span class="text-slate-500">
              <strong class="text-brand-900">{{ account.quota.quotaRemaining }}</strong> /
              {{ account.quota.quotaTotal }} générations restantes
            </span>
          </div>
          <div class="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="quotaPercent >= 90 ? 'bg-red-500' : quotaPercent >= 60 ? 'bg-amber-500' : 'bg-emerald-500'"
              :style="{ width: quotaPercent + '%' }"
            />
          </div>
          <p class="mt-2 text-xs text-slate-400">
            Réinitialisation au {{ renewalDate ?? '1er du mois' }}
          </p>
        </div>

        <!-- Statut abonnement -->
        <div class="mt-5 rounded-lg bg-slate-50 p-4 text-sm">
          <span class="font-medium text-slate-700">Statut de l'abonnement : </span>
          <span :class="account.quota.subscriptionStatus === 'active' ? 'text-emerald-600' : 'text-slate-500'">
            {{ account.quota.subscriptionStatus === 'active' ? 'Actif' : 'Inactif' }}
          </span>
        </div>

        <div class="mt-5">
          <AppButton v-if="account.quota.plan === 'free'" @click="router.push('/pricing')">
            Passer en Pro
          </AppButton>
          <AppButton v-else :variant="'secondary'" @click="router.push('/pricing')">
            Changer de plan
          </AppButton>
        </div>
      </div>

      <!-- Carte Historique des paiements -->
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="font-display text-lg font-semibold text-brand-900 mb-4">
          Historique des paiements
        </h2>
        <div v-if="account.payments.length === 0" class="text-sm text-slate-400">
          Aucun paiement enregistré pour le moment.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-slate-200 text-xs uppercase text-slate-400">
              <tr>
                <th class="px-3 py-2">Date</th>
                <th class="px-3 py-2">Plan</th>
                <th class="px-3 py-2">Montant</th>
                <th class="px-3 py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in account.payments"
                :key="p.id"
                class="border-b border-slate-100 last:border-0"
              >
                <td class="px-3 py-3">
                  {{ new Date(p.created_at.replace(' ', 'T')).toLocaleDateString('fr-FR') }}
                </td>
                <td class="px-3 py-3 capitalize">{{ p.plan }}</td>
                <td class="px-3 py-3 font-medium">{{ p.amount.toLocaleString('fr-FR') }} {{ p.currency }}</td>
                <td class="px-3 py-3">
                  <span
                    class="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="{
                      'bg-emerald-100 text-emerald-700': p.status === 'accepted',
                      'bg-amber-100 text-amber-700': p.status === 'pending',
                      'bg-red-100 text-red-700': ['refused','cancelled','failed'].includes(p.status),
                    }"
                  >
                    {{ paymentStatusLabel(p.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </section>
</template>