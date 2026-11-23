<script setup lang="ts">
import { locale } from '../i18n'
const releases = [
  {
    version: '1.5.2',
    title: 'Nouveaux thèmes',
    items: ['Thème Peach Sorbet', 'Thème Pastel Watercolor', 'Thème Sunny Beach'],
  },
  {
    version: '1.5',
    title: 'Calendrier, personnalisation et sources',
    items: ['Source du prospect', 'Planning des relances', 'Thèmes, langue et mode malvoyant', 'Page Paramètres'],
  },
  {
    version: '1.4',
    title: 'Suggestions et confirmations',
    items: ['Suggestions des entreprises', 'Suggestions des tags', 'Confirmation avant suppression'],
  },
  {
    version: '1.3',
    title: 'Notifications et historique',
    items: ['Notifications de relance', 'Trim automatique', 'Modification des dates d’interactions', 'Page À propos'],
  },
  {
    version: '1.2',
    title: 'Création enrichie',
    items: ['Téléphone et e-mail', 'Adresse en quatre champs', 'Tags', 'Boutons de statut colorés'],
  },
  {
    version: '1.1',
    title: 'Analyse et géographie',
    items: ['Tags et téléphone', 'Tri des prospects', 'Statistiques', 'Carte OpenStreetMap'],
  },
]
</script>

<template>
  <main class="scrollbar-thin flex-1 overflow-y-auto p-8">
    <div class="mx-auto max-w-3xl">
      <h2 class="mb-6 text-lg font-semibold text-zinc-100">{{ locale === 'fr' ? 'Nouveautés' : "What's new" }}</h2>
      <div class="space-y-3">
        <article v-for="release in releases" :key="release.version" class="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <div class="mb-3 flex items-center gap-3">
            <span class="rounded-full bg-amber-400 px-2 py-1 text-xs font-bold text-zinc-950">v{{ release.version }}</span>
            <h3 class="font-medium text-zinc-200">{{ release.title }}</h3>
          </div>
          <ul class="space-y-1 text-sm text-zinc-400">
            <li v-for="item in release.items" :key="item">• {{ item }}</li>
          </ul>
        </article>
      </div>
    </div>
  </main>
</template>
