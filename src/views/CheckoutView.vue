<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { paymentApi } from '@/api/client'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'

const route = useRoute()
const auth = useAuthStore()

// Plan sélectionné depuis l'URL (?plan=pro ou ?plan=enterprise)
const planParam = typeof route.query.plan === 'string' ? route.query.plan : 'pro'
const plan = ref(planParam === 'enterprise' ? 'enterprise' : 'pro')

// Détails du plan (prix, quota, description)
const planDetails = computed(() => {
  if (plan.value === 'pro') {
    return {
      name: 'Pro',
      price: '17,400 XOF',
      period: '/mois',
      quota: 50,
      features: [
        '50 générations / mois',
        'Plans SVG + Façades PNG + IFC',
        'Historique illimité',
        'Support email',
        'Paiement via Orange Money (BF)'
      ]
    }
  }
  if (plan.value === 'enterprise') {
    return {
      name: 'Enterprise',
      price: 'Sur devis',
      period: '',
      quota: 'Illimité',
      features: [
        'Générations illimitées',
        'Accès API complet',
        'Support prioritaire',
        'Intégration sur mesure',
        'Gestion de compte dédiée'
      ]
    }
  }
  // Gratuit (fallback)
  return {
    name: 'Gratuit',
    price: '0 XOF',
    period: '/mois',
    quota: 3,
    features: [
      '3 générations / mois',
      'Plans SVG uniquement',
      'Dashboard de base',
      'Aucun paiement requis'
    ]
  }
})

// Formulaire de paiement
const fullName = ref('')
const email = ref('')
const phone = ref('') // Téléphone Orange Money BF : +226 XX XX XX XX
const loading = ref(false)
const error = ref('')

// Validation du téléphone BF (simple)
const phoneValid = computed(() => {
  const value = phone.value.trim()
  if (!value) return false
  // Format BF : +226 suivi de 8 chiffres
  return /^\+226\d{8}$/.test(value)
})

async function handlePayWithOrangeMoney() {
  error.value = ''
  if (!fullName.value.trim()) {
    error.value = 'Veuillez saisir votre nom complet.'
    return
  }
  const emailTrim = email.value.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
    error.value = 'Veuillez saisir une adresse email valide.'
    return
  }
  if (!phoneValid.value) {
    error.value = 'Veuillez saisir un numéro Orange Money BF valide (ex: +22670123456).'
    return
  }

  loading.value = true
  try {
    // Appel API backend pour créer le paiement Orange Money.
    // userId = clé API (l'identifiant d'utilisateur côté backend), stockée en session.
    const { paymentUrl, orderId } = await paymentApi.create({
      amount: plan.value === 'pro' ? 17400 : 0,
      description: `Abonnement ${plan.value === 'pro' ? 'Pro' : 'Enterprise'} - ${fullName.value.trim()}`,
      userId: auth.apiKey || 'frontend-demo',
      plan: plan.value,
      phone: phone.value.trim(),
      email: emailTrim,
    })
    // Redirection vers la page de paiement Orange Money fournie par le backend.
    // En mode simulation (sandbox), l'URL pointe vers une page de démo ; le
    // backend a déjà passé le paiement en "accepted".
    if (paymentUrl) {
      window.location.href = paymentUrl
    } else {
      window.location.href = '/checkout/success?orderId=' + encodeURIComponent(orderId)
    }
  } catch (err: any) {
    console.error('Paiement Orange Money échoué:', err)
    error.value =
      err.response?.data?.error ||
      err.message ||
      'Impossible de créer le paiement. Réessayez plus tard.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="mx-auto max-w-xl px-6 py-16">
    <!-- Header -->
    <h1 class="font-display text-3xl font-bold text-brand-900 mb-6">
      {{ plan === 'pro' ? "Passer en Pro avec Orange Money" : "Paiement Enterprise" }}
    </h1>

    <!-- Carte résumé du plan -->
    <div class="rounded-xl border border-brand-200 bg-brand-50 p-6 mb-8">
      <h2 class="font-display text-xl font-semibold text-brand-900 mb-4">
        Plan {{ planDetails.name }}
      </h2>
      <p class="mb-4 text-slate-600">
        {{ planDetails.price }}{{ planDetails.period }}
      </p>
      <ul class="space-y-2 text-sm">
        <li v-for="(feature, index) in planDetails.features" :key="index"
            class="flex items-start gap-2">
          <svg class="mt-0.5 size-4 shrink-0 text-emerald-500"
               viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 13l4 4L19 7" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round"/>
          </svg>
          <span>{{ feature }}</span>
        </li>
      </ul>
      <p class="mt-4 text-xs text-slate-500">
        Vous allez être redirigé vers la page de paiement sécurisée Orange Money Burkina Faso.
        Après validation du paiement sur votre téléphone, votre compte sera automatiquement mis à niveau.
      </p>
    </div>

    <!-- Formulaire de paiement -->
    <form class="space-y-6" novalidate @submit.prevent="handlePayWithOrangeMoney">
      <div class="space-y-3">
        <label class="block text-sm font-medium text-slate-700 mb-1">
          Nom complet
        </label>
        <AppInput
          v-model="fullName"
          type="text"
          placeholder="Jean Kabore"
          required
        />
      </div>

      <div class="space-y-3">
        <label class="block text-sm font-medium text-slate-700 mb-1">
          Adresse email
        </label>
        <AppInput
          v-model="email"
          type="email"
          placeholder="jean.kabore@cabinet.bf"
          required
          :error="!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? 'Email invalide' : ''"
        />
      </div>

      <div class="space-y-3">
        <label class="block text-sm font-medium text-slate-700 mb-1">
          Numéro Orange Money BF
        </label>
        <AppInput
          v-model="phone"
          type="tel"
          placeholder="+226 XX XX XX XX"
          inputmode="tel"
          required
          :error="!phone.trim() || !/^\+226\d{8}$/.test(phone.trim()) ? 'Format : +226XXXXXXXX' : ''"
        />
        <p class="mt-1 text-xs text-slate-500">
          Le numéro doit commencer par +226 suivi de 8 chiffres (ex: +22670123456)
        </p>
      </div>

      <div class="pt-4">
        <AppButton
          type="submit"
          :loading="loading"
          class="w-full bg-accent-600 hover:bg-accent-700"
        >
          {{ loading ? 'Traitement en cours...' : 'Payer avec Orange Money' }}
        </AppButton>
      </div>

      <!-- Message d'erreur -->
      <p v-if="error" class="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded" role="alert">
        {{ error }}
      </p>
    </form>

    <!-- Note de bas de page -->
    <div class="mt-8 text-xs text-slate-500 border-t pt-4">
      <p class="mb-2">
        <strong>Sécurité :</strong> Vos données de paiement ne sont jamais stockées sur nos serveurs.
        Le traitement est effectué directement par Orange Money Burkina Faso via leur API sécurisée.
      </p>
      <p class="mb-0">
        <router-link to="/pricing" class="text-sm text-brand-600 hover:underline">
          ← Retour aux tarifs
        </router-link>
      </p>
    </div>
  </section>
</template>