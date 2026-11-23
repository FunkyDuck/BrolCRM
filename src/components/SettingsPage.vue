<script setup lang="ts">
import { ref } from 'vue'
import ConfirmDialog from './ConfirmDialog.vue'
import { t } from '../i18n'

export type ThemeName = 'dark' | 'light' | 'green' | 'blue' | 'red' | 'purple' | 'orange'
export type LanguageCode = 'fr' | 'en'

const props = defineProps<{
  theme: ThemeName
  language: LanguageCode
  largeText: boolean
}>()
const emit = defineEmits<{
  theme: [theme: ThemeName]
  language: [language: LanguageCode]
  largeText: [enabled: boolean]
  clear: []
}>()

const confirmClear = ref(false)

const themes: { value: ThemeName; label: string; color: string }[] = [
  { value: 'dark', label: props.language === 'fr' ? 'Sombre' : 'Dark', color: '#18181b' },
  { value: 'light', label: props.language === 'fr' ? 'Clair' : 'Light', color: '#f4f4f5' },
  { value: 'green', label: props.language === 'fr' ? 'Vert' : 'Green', color: '#14532d' },
  { value: 'blue', label: props.language === 'fr' ? 'Bleu' : 'Blue', color: '#1e3a8a' },
  { value: 'red', label: props.language === 'fr' ? 'Rouge' : 'Red', color: '#7f1d1d' },
  { value: 'purple', label: props.language === 'fr' ? 'Mauve' : 'Purple', color: '#581c87' },
  { value: 'orange', label: props.language === 'fr' ? 'Orange' : 'Orange', color: '#9a3412' },
]
</script>

<template>
  <main class="scrollbar-thin flex-1 overflow-y-auto p-8">
    <div class="mx-auto max-w-2xl space-y-6">
      <section class="rounded-xl border border-zinc-800 p-5">
        <h2 class="mb-4 text-sm font-semibold text-zinc-200">{{ t('theme') }}</h2>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            v-for="themeOption in themes"
            :key="themeOption.value"
            class="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
            :class="props.theme === themeOption.value ? 'border-amber-400 text-zinc-100' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'"
            @click="emit('theme', themeOption.value)"
          >
            <span class="size-4 rounded-full border border-white/20" :style="{ backgroundColor: themeOption.color }"></span>
            {{ themeOption.label }}
          </button>
        </div>
      </section>

      <section class="rounded-xl border border-zinc-800 p-5">
        <h2 class="mb-4 text-sm font-semibold text-zinc-200">{{ t('language') }}</h2>
        <div class="flex gap-2">
          <button class="rounded-md border px-3 py-2 text-sm" :class="props.language === 'fr' ? 'border-amber-400 text-amber-300' : 'border-zinc-800 text-zinc-400'" @click="emit('language', 'fr')">Français</button>
          <button class="rounded-md border px-3 py-2 text-sm" :class="props.language === 'en' ? 'border-amber-400 text-amber-300' : 'border-zinc-800 text-zinc-400'" @click="emit('language', 'en')">English</button>
        </div>
      </section>

      <section class="flex items-center justify-between rounded-xl border border-zinc-800 p-5">
        <div>
          <h2 class="text-sm font-semibold text-zinc-200">{{ t('largeText') }}</h2>
          <p class="mt-1 text-xs text-zinc-500">{{ t('largeTextDetail') }}</p>
        </div>
        <button
          type="button"
          class="relative h-6 w-11 rounded-full transition-colors"
          :class="props.largeText ? 'bg-amber-400' : 'bg-zinc-700'"
          @click="emit('largeText', !props.largeText)"
        >
          <span class="absolute top-1 size-4 rounded-full bg-white transition-transform" :class="props.largeText ? 'left-6' : 'left-1'"></span>
        </button>
      </section>

      <section class="rounded-xl border border-red-950 p-5">
        <h2 class="text-sm font-semibold text-red-400">{{ t('dangerousZone') }}</h2>
        <p class="mt-1 text-xs text-zinc-500">{{ t('deleteAllDetail') }}</p>
        <button class="mt-4 rounded-md border border-red-900 px-3 py-2 text-sm text-red-400 hover:bg-red-950/30" @click="confirmClear = true">{{ t('deleteAll') }}</button>
      </section>
    </div>

    <ConfirmDialog
      :open="confirmClear"
      title="Supprimer toutes les données"
      message="Cette action supprimera définitivement tous les prospects, tags et interactions. Cette opération est irréversible."
      confirm-label="Tout supprimer"
      @close="confirmClear = false"
      @confirm="emit('clear'); confirmClear = false"
    />
  </main>
</template>
