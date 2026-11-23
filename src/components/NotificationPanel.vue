<script setup lang="ts">
import { t } from '../i18n'
defineProps<{
  open: boolean
  notifications: { id: string; title: string; detail: string; tone: 'amber' | 'sky' }[]
}>()
defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50" @mousedown.self="$emit('close')">
      <div class="absolute inset-0 bg-black/20" @click="$emit('close')"></div>
      <aside class="absolute right-0 top-16 w-full max-w-sm border-l border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-semibold text-zinc-100">{{ t('notifications') }}</h2>
          <button class="grid size-8 place-items-center rounded-md text-zinc-500 hover:bg-zinc-900" @click="$emit('close')">×</button>
        </div>
        <div v-if="notifications.length" class="space-y-2">
          <article v-for="notification in notifications" :key="notification.id" class="rounded-lg border border-zinc-800 p-3">
            <p class="text-sm font-medium" :class="notification.tone === 'amber' ? 'text-amber-400' : 'text-sky-400'">{{ notification.title }}</p>
            <p class="mt-1 text-xs text-zinc-500">{{ notification.detail }}</p>
          </article>
        </div>
        <p v-else class="py-8 text-center text-sm text-zinc-600">{{ t('noNotification') }}</p>
      </aside>
    </div>
  </Teleport>
</template>
