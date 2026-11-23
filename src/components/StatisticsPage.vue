<script setup lang="ts">
import { computed } from 'vue'
import { Bar, Doughnut, Line } from 'vue-chartjs'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import type { Prospect } from '../types/brol'
import ProspectMap from './ProspectMap.vue'

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip)

const props = defineProps<{ prospects: Prospect[] }>()

const statusLabels: Record<string, string> = {
  to_contact: 'À contacter',
  contacted: 'Contactés',
  in_discussion: 'En discussion',
  signed: 'Signés',
  archived: 'Archivés',
}
const statusColors = ['#71717a', '#38bdf8', '#a78bfa', '#34d399', '#52525b']

const statusCounts = computed(() => {
  const counts = { to_contact: 0, contacted: 0, in_discussion: 0, signed: 0, archived: 0 }
  props.prospects.forEach((prospect) => counts[prospect.status]++)
  return counts
})

const statusData = computed(() => ({
  labels: Object.keys(statusCounts.value).map((key) => statusLabels[key]),
  datasets: [{
    data: Object.values(statusCounts.value),
    backgroundColor: statusColors,
    borderColor: '#18181b',
    borderWidth: 2,
  }],
}))

const interactionByMonth = computed(() => {
  const counts = new Map<string, number>()
  props.prospects.forEach((prospect) => prospect.interactions.forEach((interaction) => {
    const month = interaction.date.slice(0, 7)
    counts.set(month, (counts.get(month) ?? 0) + 1)
  }))
  const months = [...counts.keys()].sort().slice(-12)
  return {
    labels: months.map((month) => new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit' }).format(new Date(`${month}-01T12:00:00`))),
    datasets: [{
      label: 'Interactions',
      data: months.map((month) => counts.get(month) ?? 0),
      borderColor: '#fbbf24',
      backgroundColor: 'rgba(251, 191, 36, 0.12)',
      fill: true,
      tension: 0.35,
    }],
  }
})

const tagCounts = computed(() => {
  const counts = new Map<string, number>()
  props.prospects.forEach((prospect) => prospect.tags.forEach((tag) => {
    counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }))
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
})

const tagData = computed(() => ({
  labels: tagCounts.value.map(([tag]) => tag),
  datasets: [{
    label: 'Prospects',
    data: tagCounts.value.map(([, count]) => count),
    backgroundColor: '#fbbf24',
    borderRadius: 4,
  }],
}))

const totalInteractions = computed(() =>
  props.prospects.reduce((total, prospect) => total + prospect.interactions.length, 0),
)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#a1a1aa' } } },
  scales: {
    x: { ticks: { color: '#71717a' }, grid: { color: '#27272a' } },
    y: { ticks: { color: '#71717a', precision: 0 }, grid: { color: '#27272a' } },
  },
}
</script>

<template>
  <div class="scrollbar-thin flex-1 overflow-y-auto p-5">
    <div class="mx-auto max-w-6xl">
      <div class="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div class="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
          <p class="text-xs text-zinc-500">Prospects</p>
          <p class="mt-1 text-2xl font-semibold">{{ prospects.length }}</p>
        </div>
        <div class="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
          <p class="text-xs text-zinc-500">Interactions</p>
          <p class="mt-1 text-2xl font-semibold">{{ totalInteractions }}</p>
        </div>
        <div class="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
          <p class="text-xs text-zinc-500">En discussion</p>
          <p class="mt-1 text-2xl font-semibold">{{ statusCounts.in_discussion }}</p>
        </div>
        <div class="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
          <p class="text-xs text-zinc-500">Signés</p>
          <p class="mt-1 text-2xl font-semibold">{{ statusCounts.signed }}</p>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <section class="rounded-lg border border-zinc-800 p-4">
          <h2 class="mb-3 text-sm font-medium text-zinc-300">Interactions par mois</h2>
          <div class="h-64"><Line :data="interactionByMonth" :options="chartOptions" /></div>
        </section>
        <section class="rounded-lg border border-zinc-800 p-4">
          <h2 class="mb-3 text-sm font-medium text-zinc-300">Prospects par statut</h2>
          <div class="h-64"><Doughnut :data="statusData" :options="{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#a1a1aa' } } } }" /></div>
        </section>
        <section class="rounded-lg border border-zinc-800 p-4">
          <h2 class="mb-3 text-sm font-medium text-zinc-300">Prospects par secteur</h2>
          <div class="h-64"><Bar :data="tagData" :options="chartOptions" /></div>
        </section>
        <section class="rounded-lg border border-zinc-800 p-4">
          <h2 class="mb-3 text-sm font-medium text-zinc-300">Répartition géographique</h2>
          <ProspectMap :prospects="prospects" />
        </section>
      </div>
    </div>
  </div>
</template>
