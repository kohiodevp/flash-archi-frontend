<script setup lang="ts">
// Champ de saisie réutilisable (label, erreur, icon). v-model via modelValue.
const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    type?: string
    placeholder?: string
    error?: string
    required?: boolean
    hint?: string
  }>(),
  { label: '', type: 'text', placeholder: '', error: '', required: false, hint: '' }
)

defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const hasError = () => props.error.length > 0
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-sm font-medium text-slate-700">
      {{ label }}<span v-if="required" class="text-red-500" aria-hidden="true"> *</span>
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :aria-invalid="hasError() ? 'true' : undefined"
      :aria-describedby="hasError() ? `${label}-error` : undefined"
      v-bind="$attrs"
      class="w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition focus:outline-none focus:ring-2"
      :class="hasError() ? 'border-red-400 ring-red-200 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-brand-500 focus:ring-brand-200'"
      @input="(e) => $emit('update:modelValue', (e.target as HTMLInputElement).value)"
    />
    <p v-if="hasError()" :id="`${label}-error`" class="text-sm text-red-600" role="alert">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-slate-500">{{ hint }}</p>
  </div>
</template>