<script setup lang="ts">
// Bouton réutilisable — variantes + état loading/disabled.
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger'
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit'
  }>(),
  { variant: 'primary', loading: false, disabled: false, type: 'button' }
)

defineEmits<{ (e: 'click', event: MouseEvent): void }>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    class="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
    :class="{
      'bg-accent-600 text-white shadow-sm hover:bg-accent-500': variant === 'primary',
      'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100': variant === 'secondary',
      'bg-red-600 text-white hover:bg-red-500': variant === 'danger',
    }"
    @click="(e) => $emit('click', e)"
  >
    <svg
      v-if="loading"
      class="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
    </svg>
    <slot />
  </button>
</template>