<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
  message: string
  confirmLabel?: string
}>()
defineEmits<{
  confirm: []
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[60] grid place-items-center bg-black/70 px-4" @mousedown.self="$emit('close')">
      <div class="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl" role="dialog" aria-modal="true">
        <h2 class="text-base font-semibold text-zinc-100">{{ title }}</h2>
        <p class="mt-2 text-sm leading-relaxed text-zinc-400">{{ message }}</p>
        <div class="mt-5 flex justify-end gap-2">
          <button type="button" class="rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900" @click="$emit('close')">Annuler</button>
          <button type="button" class="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500" @click="$emit('confirm')">
            {{ confirmLabel ?? 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
