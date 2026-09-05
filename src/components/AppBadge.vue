<script setup lang="ts">
// Badge de statut de job — couleurs sémantiques par état.
const props = defineProps<{
  status: 'pending' | 'processing' | 'completed' | 'failed' | string
  label?: string
}>()

const map: Record<string, { label: string; cls: string; dot: string }> = {
  pending: { label: 'En attente', cls: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-400' },
  processing: { label: 'En cours', cls: 'bg-amber-50 text-amber-700 border-amber-300', dot: 'bg-amber-500' },
  completed: { label: 'Terminé', cls: 'bg-emerald-50 text-emerald-700 border-emerald-300', dot: 'bg-emerald-500' },
  failed: { label: 'Échec', cls: 'bg-red-50 text-red-700 border-red-300', dot: 'bg-red-500' },
}

const meta = () => map[props.status] ?? { label: props.status, cls: 'bg-slate-100 text-slate-600 border-slate-300', dot: 'bg-slate-400' }
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
    :class="meta().cls"
  >
    <span v-if="status === 'processing'" class="size-1.5 animate-pulse rounded-full" :class="meta().dot" aria-hidden="true" />
    <span v-else class="size-1.5 rounded-full" :class="meta().dot" aria-hidden="true" />
    {{ label ?? meta().label }}
  </span>
</template>