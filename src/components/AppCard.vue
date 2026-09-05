<script setup lang="ts">
// Carte de contenu réutilisable (titre, loading, footer).
defineProps<{
  title?: string
  loading?: boolean
  muted?: boolean // variante « à venir » (grisée)
}>()

defineSlots<{ default: () => unknown; footer?: () => unknown }>()
</script>

<template>
  <section
    class="flex flex-col rounded-lg border bg-white shadow-sm"
    :class="muted ? 'border-slate-200 bg-slate-50 opacity-80' : 'border-slate-200'"
  >
    <div v-if="title" class="border-b border-slate-200 px-5 py-3">
      <h2 class="font-display text-base font-semibold text-brand-900">{{ title }}</h2>
    </div>
    <div class="flex-1 px-5 py-4">
      <div v-if="loading" class="flex items-center justify-center gap-2 py-6 text-slate-400" role="status">
        <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
        </svg>
        <span class="text-sm">Chargement…</span>
      </div>
      <slot v-else />
    </div>
    <div v-if="$slots.footer" class="border-t border-slate-200 px-5 py-3">
      <slot name="footer" />
    </div>
  </section>
</template>