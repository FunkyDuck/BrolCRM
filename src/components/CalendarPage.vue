<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Prospect } from '../types/brol'
import { locale, t } from '../i18n'

const props = defineProps<{ prospects: Prospect[] }>()
defineEmits<{ select: [prospect: Prospect] }>()

const currentMonth = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

const monthLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' }).format(currentMonth.value),
)

const days = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7
  const count = new Date(year, month + 1, 0).getDate()
  const cells: { date: Date | null; followups: Prospect[] }[] = []
  for (let index = 0; index < startOffset; index++) cells.push({ date: null, followups: [] })
  for (let day = 1; day <= count; day++) {
    const date = new Date(year, month, day)
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    cells.push({
      date,
      followups: props.prospects.filter((prospect) =>
        prospect.nextFollowup === key &&
        prospect.status !== 'signed' &&
        prospect.status !== 'archived',
      ),
    })
  }
  return cells
})

function changeMonth(offset: number) {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() + offset,
    1,
  )
}
</script>

<template>
  <main class="scrollbar-thin flex-1 overflow-y-auto p-5">
    <div class="mx-auto max-w-6xl">
      <div class="mb-5 flex items-center justify-between">
        <h2 class="text-lg font-semibold capitalize text-zinc-100">{{ monthLabel }}</h2>
        <div class="flex gap-2">
          <button class="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-900" @click="changeMonth(-1)">←</button>
          <button class="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-900" @click="currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)">{{ t('today') }}</button>
          <button class="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-900" @click="changeMonth(1)">→</button>
        </div>
      </div>

      <div class="grid grid-cols-7 overflow-hidden rounded-lg border border-zinc-800">
        <div v-for="dayName in (locale === 'fr' ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])" :key="dayName" class="border-b border-zinc-800 bg-zinc-900 px-2 py-2 text-center text-xs text-zinc-500">
          {{ dayName }}
        </div>
        <div
          v-for="(cell, index) in days"
          :key="index"
          class="min-h-24 border-b border-r border-zinc-800 p-2"
          :class="cell.date ? 'bg-zinc-950' : 'bg-zinc-950/40'"
        >
          <template v-if="cell.date">
            <p class="mb-1 text-xs text-zinc-600">{{ cell.date.getDate() }}</p>
            <button
              v-for="prospect in cell.followups"
              :key="prospect.id"
              class="mb-1 w-full truncate rounded bg-amber-400/10 px-2 py-1 text-left text-xs text-amber-300 hover:bg-amber-400/20"
              @click="$emit('select', prospect)"
            >
              {{ prospect.companyName }}
            </button>
          </template>
        </div>
      </div>
    </div>
  </main>
</template>
