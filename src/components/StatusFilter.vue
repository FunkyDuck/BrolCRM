<script setup lang="ts">
import type { ProspectStatus } from '../types/brol'
import { t } from '../i18n'

type FilterStatus = ProspectStatus | 'all'

defineProps<{
  active: FilterStatus
  counts: Record<FilterStatus, number>
}>()
defineEmits<{ change: [status: FilterStatus] }>()

const filters: { value: FilterStatus; labelKey: string }[] = [
  { value: 'all', labelKey: 'all' },
  { value: 'to_contact', labelKey: 'toContact' },
  { value: 'contacted', labelKey: 'contacted' },
  { value: 'in_discussion', labelKey: 'inDiscussion' },
  { value: 'signed', labelKey: 'signed' },
  { value: 'archived', labelKey: 'archived' },
]
</script>

<template>
  <nav class="flex items-center gap-1 border-b border-zinc-800 px-5" aria-label="Filtrer les prospects">
    <button
      v-for="filter in filters"
      :key="filter.value"
      class="relative px-3 py-3 text-xs font-medium transition-colors"
      :class="active === filter.value ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'"
      @click="$emit('change', filter.value)"
    >
      {{ t(filter.labelKey) }}
      <span class="ml-1.5 rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px]">{{ counts[filter.value] }}</span>
      <span v-if="active === filter.value" class="absolute inset-x-2 bottom-0 h-0.5 rounded bg-amber-400"></span>
    </button>
  </nav>
</template>
