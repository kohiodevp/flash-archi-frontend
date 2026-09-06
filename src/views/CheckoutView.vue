<script setup lang="ts">
// Page /checkout — pré-inscription au lancement du paiement (V1).
// Envoie { email, plan, message } à POST /api/newsletter (public,
// sans clé API). Aucune donnée de paiement n'est manipulée ici.
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'

const route = useRoute()
const prefillPlan = typeof route.query.plan === 'string' ? route.query.plan : 'pro'

const email = ref('')
const plan = ref(prefillPlan === 'enterprise' ? 'enterprise' : 'pro')
const message = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const baseURL = import.meta.env.VITE_API_BASE || '/api'

const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))

async function submit() {
  error.value = ''
  if (!emailValid.value) {
    error.value = 'Veuillez saisir une adresse email valide.'
    return
  }
  loading.value = true
  try {
    await axios.post(`${baseURL}/newsletter`, {
      email: email.value.trim(),
      plan: plan.value,
      message: message.value.trim(),
    })
    success.value = true
  } catch (e) {
    error.value =
      e instanceof Error ? 'Impossible de vous inscrire pour le moment. Réessayez plus tard.' : 'Erreur réseau.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="mx-auto max-w-xl px-6 py-16">
    <div v-if="success" class="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
      <h1 class="font-display text-2xl font-bold text-emerald-800">Vous êtes inscrit·e !</h1>
      <p class="mt-3 text-emerald-700">
        Nous vous préviendrons dès le lancement du paiement en ligne sur Flash-Archi.
      </p>
      <router-link to="/" class="mt-6 inline-block font-medium text-brand-600 hover:underline">
        Retour à l'accueil
      </router-link>
    </div>

    <div v-else>
      <h1 class="font-display text-3xl font-bold text-brand-900">Paiement en ligne</h1>
      <p class="mt-3 text-slate-500">
        Le paiement en ligne arrive bientôt ! Laissez-nous votre email pour être averti·e du lancement
        et recevoir des informations sur le plan <strong class="text-slate-700">{{ plan === 'enterprise' ? 'Enterprise' : 'Pro' }}</strong>.
      </p>

      <form class="mt-8 space-y-5" novalidate @submit.prevent="submit">
        <AppInput
          v-model="email"
          type="email"
          label="Adresse email"
          placeholder="vous@cabinet.fr"
          required
          :error="!emailValid && email ? 'Adresse email invalide' : ''"
        />

        <fieldset class="space-y-2">
          <legend class="text-sm font-medium text-slate-700">Plan choisi</legend>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              class="rounded-lg border px-4 py-3 text-sm font-medium transition"
              :class="plan === 'pro' ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
              @click="plan = 'pro'"
            >
              Pro — 29€/mois
            </button>
            <button
              type="button"
              class="rounded-lg border px-4 py-3 text-sm font-medium transition"
              :class="plan === 'enterprise' ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
              @click="plan = 'enterprise'"
            >
              Enterprise — sur devis
            </button>
          </div>
        </fieldset>

        <AppInput
          v-model="message"
          type="text"
          label="Message (optionnel)"
          placeholder="Une question sur le déploiement ?"
          hint="Nous pourrons ainsi personnaliser votre accompagnement."
        />

        <p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>

        <AppButton type="submit" :loading="loading" class="w-full">
          M'avertir du lancement
        </AppButton>
        <p class="text-center text-xs text-slate-400">
          Aucune carte bancaire n'est demandée. Pré-inscription sans engagement.
        </p>
      </form>
    </div>
  </section>
</template>