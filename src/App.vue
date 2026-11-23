<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import StatusFilter from './components/StatusFilter.vue'
import ProspectList from './components/ProspectList.vue'
import QuickAddModal from './components/QuickAddModal.vue'
import ProspectDrawer from './components/ProspectDrawer.vue'
import StatisticsPage from './components/StatisticsPage.vue'
import AboutPage from './components/AboutPage.vue'
import NotificationPanel from './components/NotificationPanel.vue'
import CalendarPage from './components/CalendarPage.vue'
import WhatsNewPage from './components/WhatsNewPage.vue'
import SettingsPage from './components/SettingsPage.vue'
import { useBrol } from './composables/useBrol'
import { setLocale } from './i18n'
import { t } from './i18n'

const {
  prospects,
  selectedProspect,
  selectedProspectId,
  activeFilter,
  searchQuery,
  counts,
  filteredProspects,
  sortKey,
  sortDirection,
  notifications,
  setSort,
  initialize,
  addProspect,
  updateProspect,
  deleteProspect,
  addInteraction,
  updateInteraction,
  deleteInteraction,
  companySuggestions,
  tagSuggestions,
  exportDatabase,
  importDatabase,
  clearDatabase,
} = useBrol()

const quickAddOpen = ref(false)
const activeView = ref<'list' | 'stats' | 'calendar' | 'whatsnew' | 'settings' | 'about'>('list')
const notificationsOpen = ref(false)
type ThemeName =
  | 'dark'
  | 'light'
  | 'green'
  | 'blue'
  | 'red'
  | 'purple'
  | 'orange'
  | 'peach-sorbet'
  | 'pastel-watercolor'
  | 'sunny-beach'
  | 'rose-petal'
type LanguageCode = 'fr' | 'en'
const theme = ref<ThemeName>('dark')
const language = ref<LanguageCode>('fr')
const largeText = ref(false)

function applySettings() {
  document.documentElement.dataset.theme = theme.value
  document.documentElement.dataset.language = language.value
  document.documentElement.lang = language.value
  setLocale(language.value)
  document.documentElement.classList.toggle('large-text', largeText.value)
  localStorage.setItem('brol:settings', JSON.stringify({
    theme: theme.value,
    language: language.value,
    largeText: largeText.value,
  }))
}

function setTheme(value: ThemeName) {
  theme.value = value
  applySettings()
}

function setLanguage(value: LanguageCode) {
  language.value = value
  applySettings()
}

function setLargeText(value: boolean) {
  largeText.value = value
  applySettings()
}

function keyboardHandler(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
    event.preventDefault()
    quickAddOpen.value = true
  }
  if (event.key === 'Escape') {
    quickAddOpen.value = false
    notificationsOpen.value = false
    selectedProspectId.value = null
  }
}

onMounted(() => {
  void initialize()
  const currentVersion = '1.5.3'
  const previousVersion = localStorage.getItem('brol:lastVersion')
  const compareVersions = (current: string, previous: string) => {
    const currentParts = current.split('.').map((part) => Number(part) || 0)
    const previousParts = previous.split('.').map((part) => Number(part) || 0)
    for (let index = 0; index < 3; index++) {
      const difference = (currentParts[index] ?? 0) - (previousParts[index] ?? 0)
      if (difference !== 0) return difference > 0
    }
    return false
  }
  const isNewer = previousVersion ? compareVersions(currentVersion, previousVersion) : false
  if (isNewer) activeView.value = 'whatsnew'
  localStorage.setItem('brol:lastVersion', currentVersion)
  try {
    const saved = JSON.parse(localStorage.getItem('brol:settings') ?? '{}') as Partial<{
      theme: ThemeName
      language: LanguageCode
      largeText: boolean
    }>
    if (saved.theme) theme.value = saved.theme
    if (saved.language) language.value = saved.language
    if (typeof saved.largeText === 'boolean') largeText.value = saved.largeText
  } catch {
    // Keep default settings if saved preferences are invalid.
  }
  applySettings()
  window.addEventListener('keydown', keyboardHandler)
})

onUnmounted(() => window.removeEventListener('keydown', keyboardHandler))

async function handleImport(mode: 'merge' | 'replace' = 'replace') {
  try {
    await importDatabase(mode)
  } catch (error) {
    window.alert(error instanceof Error ? error.message : 'Importation impossible.')
  }
}
</script>

<template>
  <div class="flex h-screen flex-col bg-zinc-950 text-zinc-100">
    <AppHeader
      :prospect-count="prospects.length"
      :active-view="activeView"
      :notification-count="notifications.length"
      @add="quickAddOpen = true"
      @notifications="notificationsOpen = true"
      @view="activeView = $event"
    />

    <template v-if="activeView === 'list'">
      <StatusFilter :active="activeFilter" :counts="counts" @change="activeFilter = $event" />

      <div class="flex h-14 items-center px-5">
        <div class="relative w-full max-w-md">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">⌕</span>
          <input
            v-model="searchQuery"
            type="search"
            class="w-full rounded-md border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-700"
            :placeholder="t('search')"
          />
        </div>
      </div>

      <ProspectList
        :prospects="filteredProspects"
        :sort-key="sortKey"
        :sort-direction="sortDirection"
        @select="selectedProspectId = $event.id"
        @sort="setSort"
      />
    </template>
    <StatisticsPage v-else-if="activeView === 'stats'" :prospects="prospects" />
    <CalendarPage v-else-if="activeView === 'calendar'" :prospects="prospects" @select="selectedProspectId = $event.id; activeView = 'list'" />
    <WhatsNewPage v-else-if="activeView === 'whatsnew'" />
    <SettingsPage
      v-else-if="activeView === 'settings'"
      :theme="theme"
      :language="language"
      :large-text="largeText"
      @theme="setTheme"
      @language="setLanguage"
      @large-text="setLargeText"
      @clear="clearDatabase"
      @import="handleImport"
      @export="exportDatabase"
      @whats-new="activeView = 'whatsnew'"
    />
    <AboutPage v-else-if="activeView === 'about'" />

    <QuickAddModal
      :open="quickAddOpen"
      :company-suggestions="companySuggestions"
      :tag-suggestions="tagSuggestions"
      @close="quickAddOpen = false"
      @submit="addProspect"
    />

    <ProspectDrawer
      :prospect="selectedProspect"
      :company-suggestions="companySuggestions"
      :tag-suggestions="tagSuggestions"
      @close="selectedProspectId = null"
      @update="updateProspect"
      @delete="deleteProspect"
      @interaction="addInteraction"
      @update-interaction="updateInteraction"
      @delete-interaction="deleteInteraction"
    />
    <NotificationPanel
      :open="notificationsOpen"
      :notifications="notifications"
      @close="notificationsOpen = false"
    />
  </div>
</template>
