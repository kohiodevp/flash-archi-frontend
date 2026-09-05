<script setup lang="ts">
// Spinner — taille configurable, couleur brand.
withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })

const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
</script>

<template>
  <svg
    class="animate-spin text-brand-600"
    :class="sizeMap[size]"
    viewBox="0 0 24 24"
    fill="none"
    role="status"
    aria-label="Chargement en cours"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.2" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
  </svg>
</template>