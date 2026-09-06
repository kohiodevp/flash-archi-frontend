<script setup lang="ts">
// Page d'accueil / vitrine (Phase 1 — template). Contenu commercial en Phase 2.
</script>

<template>
  <section class="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 text-white">
    <div class="mx-auto max-w-6xl px-6 py-24 text-center">
      <h1 class="font-display text-4xl font-bold sm:text-5xl">
        Flash-Archi
      </h1>
      <p class="mx-auto mt-4 max-w-2xl text-lg text-brand-100">
        Génération architecturale par IA : plans 2D et façades en quelques
        secondes, prêts pour vos projets.
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-4">
        <router-link
          to="/dashboard"
          class="rounded-lg bg-accent-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-accent-500"
        >
          Commencer
        </router-link>
        <router-link
          to="/login"
          class="rounded-lg border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
        >
          Se connecter
        </router-link>
      </div>
      <div class="mt-10 flex flex-wrap justify-center gap-4">
        <router-link
          to="/pricing"
          class="rounded-lg border border-white/20 px-5 py-2.5 font-semibold text-brand-100 transition hover:bg-white/10"
        >
          Voir les tarifs
        </router-link>
      </div>
    </div>
  </section>
</template>