<script setup lang="ts">
// Coquille applicative. Le routeur monte les vues dans <router-view />.
import { RouterView } from 'vue-router'
import AppNavBar from '@/components/AppNavBar.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppNavBar />
    <main class="flex-1">
      <RouterView />
    </main>
    <footer class="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
      Flash-Archi SaaS — Moteur de génération architecturale par IA
    </footer>
  </div>
</template>