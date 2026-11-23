<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Interaction, InteractionType, Prospect, ProspectStatus } from '../types/brol'
import ConfirmDialog from './ConfirmDialog.vue'
import { cities, countries } from '../data/locations'

const props = defineProps<{
  prospect: Prospect | null
  companySuggestions: string[]
  tagSuggestions: string[]
}>()
const emit = defineEmits<{
  close: []
  update: [id: string, patch: Partial<Prospect>]
  delete: [id: string]
  interaction: [id: string, type: InteractionType, summary: string]
  updateInteraction: [prospectId: string, interactionId: string, patch: Partial<Interaction>]
  deleteInteraction: [prospectId: string, interactionId: string]
}>()

const local = ref<Prospect | null>(null)
const interactionType = ref<InteractionType>('note')
const interactionSummary = ref('')
const tagInput = ref('')
const phoneError = ref('')
const confirmProspectOpen = ref(false)
const confirmInteractionId = ref<string | null>(null)

watch(() => props.prospect, (prospect) => {
  local.value = prospect ? { ...prospect, interactions: [...prospect.interactions] } : null
  interactionSummary.value = ''
}, { immediate: true })

const statusOptions: { value: ProspectStatus; label: string }[] = [
  { value: 'to_contact', label: 'À contacter' },
  { value: 'contacted', label: 'Contacté' },
  { value: 'in_discussion', label: 'Discussion' },
  { value: 'signed', label: 'Signé' },
  { value: 'archived', label: 'Archivé' },
]

const statusClasses: Record<ProspectStatus, { active: string; idle: string }> = {
  to_contact: { active: 'bg-zinc-600 text-zinc-50', idle: 'text-zinc-500 hover:bg-zinc-800' },
  contacted: { active: 'bg-sky-700 text-white', idle: 'text-sky-500 hover:bg-sky-950' },
  in_discussion: { active: 'bg-violet-700 text-white', idle: 'text-violet-500 hover:bg-violet-950' },
  signed: { active: 'bg-emerald-700 text-white', idle: 'text-emerald-500 hover:bg-emerald-950' },
  archived: { active: 'bg-zinc-700 text-zinc-200', idle: 'text-zinc-500 hover:bg-zinc-800' },
}

function update(patch: Partial<Prospect>) {
  if (!local.value) return
  if ('phone' in patch) {
    const phone = String(patch.phone ?? '').trim()
    phoneError.value = phone && !/^\+?[1-9]\d{7,14}$/.test(phone)
      ? 'Format international attendu, par exemple +33612345678'
      : ''
  }
  Object.assign(local.value, patch)
  if (phoneError.value) return
  emit('update', local.value.id, patch)
}

function addTag() {
  if (!local.value) return
  const tag = tagInput.value.trim().toLowerCase()
  if (!tag || local.value.tags.includes(tag)) return
  update({ tags: [...local.value.tags, tag] })
  tagInput.value = ''
}

function removeTag(tag: string) {
  if (!local.value) return
  update({ tags: local.value.tags.filter((item) => item !== tag) })
}

function openMap() {
  if (!local.value) return
  const address = fullAddress(local.value)
  if (!address) return
  window.open(`https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`, '_blank')
}

function fullAddress(prospect: Prospect): string {
  return [
    prospect.addressStreet || prospect.address,
    prospect.postalCode,
    prospect.city,
    prospect.country,
  ].filter(Boolean).join(', ')
}

function setFollowup(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  update({ nextFollowup: value })
}

function addInteraction() {
  if (!local.value || !interactionSummary.value.trim()) return
  emit('interaction', local.value.id, interactionType.value, interactionSummary.value)
  local.value.interactions.unshift({
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    type: interactionType.value,
    summary: interactionSummary.value.trim(),
  })
  interactionSummary.value = ''
}

function removeProspect() {
  confirmProspectOpen.value = true
}

const interactionLabels: Record<InteractionType, string> = {
  email: 'Email',
  call: 'Appel',
  meeting: 'Réunion',
  note: 'Note',
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function dateTimeInputValue(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16)
}

function updateInteractionDate(interactionId: string, event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (!value || !local.value) return
  const date = new Date(value).toISOString()
  const interaction = local.value.interactions.find((item) => item.id === interactionId)
  if (interaction) interaction.date = date
  emit('updateInteraction', local.value.id, interactionId, { date })
}

function confirmDeleteProspect() {
  if (!local.value) return
  emit('delete', local.value.id)
  confirmProspectOpen.value = false
}

function confirmDeleteInteraction() {
  if (!local.value || !confirmInteractionId.value) return
  emit('deleteInteraction', local.value.id, confirmInteractionId.value)
  local.value.interactions = local.value.interactions.filter((interaction) => interaction.id !== confirmInteractionId.value)
  confirmInteractionId.value = null
}
</script>

<template>
  <Teleport to="body">
    <div v-if="prospect" class="fixed inset-0 z-40" @mousedown.self="$emit('close')">
      <div class="absolute inset-0 bg-black/20" @click="$emit('close')"></div>
      <aside class="scrollbar-thin absolute inset-y-0 right-0 w-full max-w-lg overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div v-if="local" class="mx-auto max-w-md">
          <div class="mb-6 flex items-start justify-between">
            <div>
              <p class="mb-1 text-xs uppercase tracking-wider text-zinc-600">Prospect</p>
              <input
                :value="local.companyName"
                list="drawer-company-suggestions"
                class="w-full bg-transparent text-xl font-semibold text-zinc-100 outline-none"
                @input="update({ companyName: ($event.target as HTMLInputElement).value })"
              />
              <datalist id="drawer-company-suggestions">
                <option v-for="company in companySuggestions" :key="company" :value="company"></option>
              </datalist>
            </div>
            <button class="grid size-8 place-items-center rounded-md text-zinc-500 hover:bg-zinc-900" @click="$emit('close')">×</button>
          </div>

          <section class="mb-6">
            <p class="mb-2 text-xs font-medium text-zinc-500">Statut</p>
            <div class="grid grid-cols-5 gap-1 rounded-lg bg-zinc-900 p-1">
              <button
                v-for="option in statusOptions"
                :key="option.value"
                class="rounded-md px-1 py-2 text-[11px]"
                :class="local.status === option.value ? statusClasses[option.value].active : statusClasses[option.value].idle"
                @click="update({ status: option.value })"
              >
                {{ option.label }}
              </button>
              <ConfirmDialog
                :open="confirmProspectOpen"
                title="Supprimer le prospect"
                :message="`Voulez-vous supprimer définitivement « ${local.companyName} » ? Cette action est irréversible.`"
                confirm-label="Supprimer"
                @close="confirmProspectOpen = false"
                @confirm="confirmDeleteProspect"
              />
              <ConfirmDialog
                :open="confirmInteractionId !== null"
                title="Supprimer l'interaction"
                message="Voulez-vous supprimer définitivement cette interaction de l'historique ?"
                confirm-label="Supprimer"
                @close="confirmInteractionId = null"
                @confirm="confirmDeleteInteraction"
              />
            </div>
          </section>

          <section class="mb-6 grid grid-cols-2 gap-3">
            <label>
              <span class="mb-1.5 block text-xs text-zinc-500">Nom du contact</span>
              <input :value="local.contactName" class="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400" @input="update({ contactName: ($event.target as HTMLInputElement).value })" />
            </label>
            <label>
              <span class="mb-1.5 block text-xs text-zinc-500">Source</span>
              <input :value="local.source" class="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400" placeholder="Recommandation, réseau..." @input="update({ source: ($event.target as HTMLInputElement).value })" />
            </label>
            <label>
              <span class="mb-1.5 block text-xs text-zinc-500">Email</span>
              <input :value="local.email" type="email" class="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400" @input="update({ email: ($event.target as HTMLInputElement).value })" />
            </label>
            <label>
              <span class="mb-1.5 block text-xs text-zinc-500">Téléphone</span>
              <input :value="local.phone" type="tel" class="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400" placeholder="+33..." @input="update({ phone: ($event.target as HTMLInputElement).value })" />
              <span v-if="phoneError" class="mt-1 block text-[11px] text-red-400">{{ phoneError }}</span>
            </label>
            <label>
              <span class="mb-1.5 block text-xs text-zinc-500">Adresse</span>
              <div class="space-y-2">
                <input :value="local.addressStreet" class="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400" placeholder="Rue" @input="update({ addressStreet: ($event.target as HTMLInputElement).value, address: fullAddress({ ...local, addressStreet: ($event.target as HTMLInputElement).value }) })" />
                <div class="grid grid-cols-2 gap-2">
                  <input :value="local.postalCode" class="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400" placeholder="Code postal" @input="update({ postalCode: ($event.target as HTMLInputElement).value, address: fullAddress({ ...local, postalCode: ($event.target as HTMLInputElement).value }) })" />
                  <input :value="local.city" list="drawer-city-suggestions" class="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400" placeholder="Ville" @input="update({ city: ($event.target as HTMLInputElement).value, address: fullAddress({ ...local, city: ($event.target as HTMLInputElement).value }) })" />
                  <datalist id="drawer-city-suggestions">
                    <option v-for="cityName in cities" :key="cityName" :value="cityName"></option>
                  </datalist>
                </div>
                <div class="flex gap-2">
                  <input :value="local.country" list="drawer-country-suggestions" class="min-w-0 flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400" placeholder="Pays" @input="update({ country: ($event.target as HTMLInputElement).value, address: fullAddress({ ...local, country: ($event.target as HTMLInputElement).value }) })" />
                  <datalist id="drawer-country-suggestions">
                    <option v-for="countryName in countries" :key="countryName" :value="countryName"></option>
                  </datalist>
                  <button v-if="fullAddress(local)" type="button" class="rounded-md border border-zinc-800 px-2 text-xs text-zinc-400 hover:text-amber-400" @click="openMap">Carte</button>
                </div>
              </div>
            </label>
            <label class="col-span-2">
              <span class="mb-1.5 block text-xs text-zinc-500">Site web</span>
              <input :value="local.website" class="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400" @input="update({ website: ($event.target as HTMLInputElement).value })" />
            </label>
            <label class="col-span-2">
              <span class="mb-1.5 block text-xs text-zinc-500">Problème technique / besoin</span>
              <textarea :value="local.techPainPoint" rows="2" class="w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400" @input="update({ techPainPoint: ($event.target as HTMLTextAreaElement).value })"></textarea>
            </label>
          </section>

          <section class="mb-6">
            <p class="mb-2 text-xs font-medium text-zinc-500">Tags</p>
            <div class="mb-2 flex flex-wrap gap-1.5">
              <span v-for="tag in local.tags" :key="tag" class="flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-1 text-xs text-amber-300">
                {{ tag }}
                <button type="button" class="text-amber-600 hover:text-amber-200" @click="removeTag(tag)">×</button>
              </span>
            </div>
            <div class="flex gap-2">
              <input v-model="tagInput" list="drawer-tag-suggestions" class="flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400" placeholder="Secteur ou type de projet" @keydown.enter.prevent="addTag" />
              <datalist id="drawer-tag-suggestions">
                <option v-for="tag in tagSuggestions" :key="tag" :value="tag"></option>
              </datalist>
              <button type="button" class="rounded-md bg-zinc-800 px-3 text-xs text-zinc-300 hover:bg-zinc-700" @click="addTag">Ajouter</button>
            </div>
          </section>

          <section class="mb-6">
            <p class="mb-2 text-xs font-medium text-zinc-500">Prochaine relance</p>
            <div class="mb-2 flex gap-2">
              <input
                :value="local.nextFollowup ?? ''"
                type="date"
                class="flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400"
                @input="update({ nextFollowup: ($event.target as HTMLInputElement).value || null })"
              />
              <button v-if="local.nextFollowup" class="rounded-md px-2 text-xs text-zinc-500 hover:bg-zinc-900" @click="update({ nextFollowup: null })">Effacer</button>
            </div>
            <div class="flex gap-2">
              <button class="rounded-md bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-100" @click="setFollowup(3)">+3 jours</button>
              <button class="rounded-md bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-100" @click="setFollowup(7)">+1 semaine</button>
              <button class="rounded-md bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-100" @click="setFollowup(30)">+1 mois</button>
            </div>
          </section>

          <section class="mb-6">
            <p class="mb-2 text-xs font-medium text-zinc-500">Notes</p>
            <textarea :value="local.notes" rows="4" class="w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400" placeholder="Notes libres..." @input="update({ notes: ($event.target as HTMLTextAreaElement).value })"></textarea>
          </section>

          <section class="border-t border-zinc-800 pt-5">
            <p class="mb-3 text-xs font-medium text-zinc-500">Historique</p>
            <div class="mb-4 flex gap-2">
              <select v-model="interactionType" class="rounded-md border border-zinc-800 bg-zinc-900 px-2 text-xs text-zinc-300 outline-none">
                <option v-for="(label, type) in interactionLabels" :key="type" :value="type">{{ label }}</option>
              </select>
              <input v-model="interactionSummary" class="min-w-0 flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400" placeholder="Ajouter une interaction..." @keydown.enter="addInteraction" />
              <button class="rounded-md bg-zinc-800 px-3 text-xs text-zinc-300 hover:bg-zinc-700" @click="addInteraction">Ajouter</button>
            </div>
            <div v-if="local.interactions.length" class="space-y-3">
              <article v-for="interaction in local.interactions" :key="interaction.id" class="rounded-lg border border-zinc-800 p-3">
                <div class="mb-1 flex items-center justify-between">
                  <span class="text-xs font-medium text-amber-400">{{ interactionLabels[interaction.type] }}</span>
                  <div class="flex items-center gap-1">
                    <input
                      :value="dateTimeInputValue(interaction.date)"
                      type="datetime-local"
                      class="rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-400 outline-none"
                      @change="updateInteractionDate(interaction.id, $event)"
                    />
                    <button type="button" class="grid size-7 place-items-center rounded text-zinc-600 hover:bg-zinc-800 hover:text-red-400" title="Supprimer l'interaction" @click="confirmInteractionId = interaction.id">×</button>
                  </div>
                </div>
                <textarea
                  :value="interaction.summary"
                  rows="2"
                  class="w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-300 outline-none"
                  @blur="emit('updateInteraction', local.id, interaction.id, { summary: ($event.target as HTMLTextAreaElement).value })"
                ></textarea>
              </article>
            </div>
            <p v-else class="py-4 text-center text-xs text-zinc-600">Aucune interaction</p>
          </section>

          <button class="mt-8 w-full rounded-md border border-red-950 py-2 text-xs text-red-400 hover:bg-red-950/30" @click="removeProspect">
            Supprimer définitivement
          </button>
        </div>
      </aside>
    </div>
  </Teleport>
</template>
