<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
      <router-link to="/" class="flex items-center gap-2 font-display text-lg font-bold text-brand-900">
        <span class="flex size-7 items-center justify-center rounded-md bg-brand-600 text-white">F</span>
        Flash-Archi
      </router-link>

      <nav aria-label="Navigation principale" class="flex items-center gap-4 text-sm font-medium text-slate-600">
        <router-link to="/pricing" class="transition hover:text-brand-600">Tarifs</router-link>
        <template v-if="auth.isAuthenticated">
          <router-link to="/dashboard" class="transition hover:text-brand-600">Tableau de bord</router-link>
          <router-link to="/jobs" class="transition hover:text-brand-600">Historique</router-link>
          <router-link to="/jobs/new" class="transition hover:text-brand-600">Nouveau job</router-link>
          <router-link to="/account" class="transition hover:text-brand-600">Mon compte</router-link>
          <button
            type="button"
            @click="auth.logout; $router.push('/login')"
            class="rounded-lg border border-slate-200 px-3 py-1.5 transition hover:bg-slate-100"
          >
            Déconnexion
          </button>
        </template>
        <router-link
          v-else
          to="/login"
          class="rounded-lg bg-brand-600 px-4 py-1.5 text-white transition hover:bg-brand-500"
        >
          Connexion
        </router-link>
      </nav>
    </div>
  </header>
</template>