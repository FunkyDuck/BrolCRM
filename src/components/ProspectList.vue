<script setup lang="ts">
import type { Prospect, ProspectStatus } from '../types/brol'
import { t } from '../i18n'

defineProps<{
  prospects: Prospect[]
  sortKey: 'companyName' | 'nextFollowup' | 'status'
  sortDirection: 'asc' | 'desc'
}>()
defineEmits<{
  select: [prospect: Prospect]
  sort: [key: 'companyName' | 'nextFollowup' | 'status']
}>()

const statusMeta: Record<ProspectStatus, { label: string; className: string }> = {
  to_contact: { label: 'À contacter', className: 'bg-zinc-800 text-zinc-300' },
  contacted: { label: 'Contacté', className: 'bg-sky-950 text-sky-300' },
  in_discussion: { label: 'En discussion', className: 'bg-violet-950 text-violet-300' },
  signed: { label: 'Signé', className: 'bg-emerald-950 text-emerald-300' },
  archived: { label: 'Archivé', className: 'bg-zinc-900 text-zinc-500' },
}

function isDue(prospect: Prospect): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return !!prospect.nextFollowup &&
    prospect.nextFollowup <= today &&
    prospect.status !== 'signed' &&
    prospect.status !== 'archived'
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(`${value}T12:00:00`))
}

function websiteUrl(value: string): string {
  if (!value) return ''
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}
</script>

<template>
  <div class="scrollbar-thin flex-1 overflow-auto">
    <table v-if="prospects.length" class="w-full border-collapse text-left">
      <thead class="sticky top-0 z-10 bg-zinc-950 text-[11px] uppercase tracking-wider text-zinc-500">
        <tr class="border-b border-zinc-800">
          <th class="cursor-pointer px-5 py-3 font-medium" @click="$emit('sort', 'companyName')">
            {{ t('company') }} {{ sortKey === 'companyName' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
          </th>
          <th class="w-44 px-3 py-3 font-medium">{{ t('contact') }}</th>
          <th class="px-3 py-3 font-medium">{{ t('painPoint') }}</th>
          <th class="w-36 cursor-pointer px-3 py-3 font-medium" @click="$emit('sort', 'status')">
            {{ t('status') }} {{ sortKey === 'status' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
          </th>
          <th class="w-36 cursor-pointer px-5 py-3 font-medium" @click="$emit('sort', 'nextFollowup')">
            {{ t('followup') }} {{ sortKey === 'nextFollowup' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="prospect in prospects"
          :key="prospect.id"
          class="border-b border-zinc-900 transition-colors hover:bg-zinc-900/70"
          @click="$emit('select', prospect)"
        >
          <td class="px-5 py-3">
            <div class="font-medium text-zinc-100">{{ prospect.companyName }}</div>
            <a
              v-if="prospect.website"
              :href="websiteUrl(prospect.website)"
              target="_blank"
              class="mt-0.5 block max-w-52 truncate text-xs text-zinc-500 hover:text-amber-400"
              @click.stop
            >
              {{ prospect.website }}
            </a>
          </td>
          <td class="px-3 py-3">
            <div class="text-sm text-zinc-300">{{ prospect.contactName || '—' }}</div>
            <div v-if="prospect.email" class="mt-0.5 max-w-40 truncate text-xs text-zinc-600">{{ prospect.email }}</div>
          </td>
          <td class="max-w-md px-3 py-3">
            <div class="truncate text-sm text-zinc-400">{{ prospect.techPainPoint || '—' }}</div>
          </td>
          <td class="px-3 py-3">
            <span class="rounded-full px-2.5 py-1 text-xs" :class="statusMeta[prospect.status].className">
              {{ statusMeta[prospect.status].label }}
            </span>
          </td>
          <td class="px-5 py-3">
            <span v-if="isDue(prospect)" class="rounded-full bg-amber-400/10 px-2 py-1 text-xs font-medium text-amber-400">
              ! {{ formatDate(prospect.nextFollowup) }}
            </span>
            <span v-else class="text-sm text-zinc-500">{{ formatDate(prospect.nextFollowup) }}</span>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else class="grid h-full min-h-64 place-items-center text-center">
      <div>
        <div class="mx-auto mb-3 grid size-10 place-items-center rounded-full border border-zinc-800 text-zinc-600">—</div>
        <p class="text-sm text-zinc-500">{{ t('noneFound') }}</p>
      </div>
    </div>
  </div>
</template>
