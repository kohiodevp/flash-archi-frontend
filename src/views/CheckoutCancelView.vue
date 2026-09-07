<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppButton from '@/components/AppButton.vue'

const router = useRouter()
</script>

<template>
  <section class="mx-auto max-w-xl px-6 py-16 text-center">
    <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-100">
      <svg class="size-8 text-amber-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 9l4-4 4 4M12 5v12" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="4" y="17" width="16" height="3" rx="1" stroke="currentColor" stroke-width="2"/>
      </svg>
    </div>
    <h1 class="mt-4 font-display text-2xl font-bold text-slate-800">
      Vous avez annulé le paiement
    </h1>
    <p class="mt-3 text-slate-600">
      Aucun débit n'a été effectué. Vous pouvez revenir à la page des tarifs quand vous
      serez prêt, ou nous contacter si vous rencontrez un souci.
    </p>
    <div class="mt-6 flex justify-center gap-3">
      <AppButton @click="router.push('/pricing')">Retour au pricing</AppButton>
    </div>
  </section>
</template>