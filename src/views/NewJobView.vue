<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { jobsApi } from '@/api/client'
import AppButton from '@/components/AppButton.vue'

const router = useRouter()
const prompt = ref('')
const error = ref('')

async function submit() {
  error.value = ''
  if (prompt.value.trim().length < 10) {
    error.value = 'Décrivez votre projet en au moins 10 caractères.'
    return
  }
  try {
    const { jobId } = await jobsApi.create(prompt.value.trim())
    void router.push(`/jobs/${encodeURIComponent(jobId)}`)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Impossible de lancer la génération.'
  }
}
</script>

<template>
  <section class="mx-auto max-w-3xl px-6 py-12">
    <h1 class="font-display text-2xl font-bold text-brand-900">Générer un nouveau plan</h1>
    <p class="mt-2 text-slate-600">
      Décrivez votre projet en langage naturel. Flash-Archi produira un plan 2D, des façades et des métriques BIM.
    </p>

    <form class="mt-8 flex flex-col gap-4" @submit.prevent="submit">
      <div class="flex flex-col gap-1.5">
        <label for="prompt" class="text-sm font-medium text-slate-700">
          Décrivez votre projet <span class="text-red-500" aria-hidden="true">*</span>
        </label>
        <textarea
          id="prompt"
          v-model="prompt"
          rows="6"
          placeholder="Ex : Maison moderne 3 chambres, toit plat, orientation sud, surface 120 m², garage simple…"
          maxlength="4000"
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          :aria-invalid="error ? 'true' : undefined"
        ></textarea>
        <p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>
        <p v-else class="text-right text-xs text-slate-400">{{ prompt.length }}/4000</p>
      </div>

      <div>
        <AppButton type="submit" :loading="false">Générer le plan</AppButton>
      </div>
    </form>
  </section>
</template>