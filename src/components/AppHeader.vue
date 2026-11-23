<script setup lang="ts">
import { t } from '../i18n'
defineProps<{
  prospectCount: number
  activeView: 'list' | 'stats' | 'calendar' | 'whatsnew' | 'settings' | 'about'
  notificationCount: number
}>()
defineEmits<{
  add: []
  view: [view: 'list' | 'stats' | 'calendar' | 'whatsnew' | 'settings' | 'about']
  notifications: []
}>()
</script>

<template>
  <header class="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-5">
    <div class="flex items-center gap-3">
      <div class="grid size-10 place-items-center rounded-lg bg-amber-400 text-xl font-black text-zinc-950 sarina-logo">B</div>
      <div>
        <h1 class="sarina-logo text-sm leading-none text-zinc-100">Brol CRM</h1>
        <p class="text-xs text-zinc-500">{{ prospectCount }} prospect{{ prospectCount > 1 ? 's' : '' }}</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button
        class="rounded-md px-3 py-2 text-sm"
        :class="activeView === 'list' ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'"
        @click="$emit('view', 'list')"
      >
        {{ t('prospects') }}
      </button>
      <button
        class="rounded-md px-3 py-2 text-sm"
        :class="activeView === 'stats' ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'"
        @click="$emit('view', 'stats')"
      >
        {{ t('statistics') }}
      </button>
      <button class="rounded-md px-3 py-2 text-sm" :class="activeView === 'calendar' ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'" @click="$emit('view', 'calendar')">{{ t('calendar') }}</button>
      <button class="rounded-md px-3 py-2 text-sm" :class="activeView === 'settings' ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'" @click="$emit('view', 'settings')">{{ t('settings') }}</button>
      <button
        class="relative rounded-md px-3 py-2 text-sm"
        :class="activeView === 'about' ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'"
        @click="$emit('view', 'about')"
      >
        {{ t('about') }}
      </button>
      <button class="relative rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100" @click="$emit('notifications')" :title="t('notifications')">
        !
        <span v-if="notificationCount" class="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-amber-400 text-[9px] font-bold text-zinc-950">{{ notificationCount }}</span>
      </button>
      <button class="ml-1 rounded-md bg-amber-400 px-3.5 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-300" @click="$emit('add')">
        {{ t('addProspect') }}
      </button>
    </div>
  </header>
</template>
