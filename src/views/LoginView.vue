<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'

const auth = useAuthStore()
const router = useRouter()

const apiKey = ref('')
const showKey = ref(false)
const error = ref('')
const showHelp = ref(false)

async function onSubmit() {
  error.value = ''
  try {
    await auth.login(apiKey.value)
    void router.push('/dashboard')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erreur inattendue.'
  }
}

// Si une session existe déjà, rediriger directement.
if (auth.isAuthenticated) void router.replace('/dashboard')
</script>

<template>
  <section class="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
    <div class="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <!-- Marque -->
      <div class="mb-6 text-center">
        <div class="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-brand-600 text-white">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 20V10l4-3 3 3 5-4v14H4z" fill="currentColor" opacity="0.9" />
            <rect x="4" y="19" width="16" height="2" rx="1" fill="currentColor" opacity="0.7" />
          </svg>
        </div>
        <h1 class="font-display text-2xl font-bold text-brand-900">Flash-Archi</h1>
        <p class="mt-1 text-sm text-slate-500">Connectez-vous avec votre clé API</p>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <AppInput
          v-model="apiKey"
          label="Clé API"
          :type="showKey ? 'text' : 'password'"
          placeholder="••••••••••••••••"
          :error="error"
          required
        />
        <div class="-mt-2 flex items-center justify-between text-sm">
          <label class="inline-flex items-center gap-1.5 text-slate-600">
            <input v-model="showKey" type="checkbox" class="size-4 accent-brand-600" />
            Afficher la clé
          </label>
          <button type="button" class="text-brand-600 hover:underline" @click="showHelp = !showHelp">
            Où trouver ma clé ?
          </button>
        </div>

        <p v-if="showHelp" class="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
          Votre clé est la valeur de la variable <code class="font-mono">API_KEY</code> du fichier
          <code class="font-mono">.env</code> du service flash-archi-saas. En mode démo
          (<code class="font-mono">AUTH_ENABLED=false</code>), n'importe quelle valeur fonctionne.
        </p>

        <AppButton type="submit" :loading="auth.isLoading" class="w-full"> Se connecter </AppButton>
      </form>
    </div>
  </section>
</template>