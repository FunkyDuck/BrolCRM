<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { t } from '../i18n'

const props = defineProps<{
  open: boolean
  companySuggestions: string[]
  tagSuggestions: string[]
}>()
const emit = defineEmits<{
  close: []
  submit: [value: {
    companyName: string
    website: string
    techPainPoint: string
    email: string
    phone: string
    addressStreet: string
    postalCode: string
    city: string
    country: string
    tags: string[]
    source: string
  }]
}>()

const companyName = ref('')
const website = ref('')
const techPainPoint = ref('')
const email = ref('')
const phone = ref('')
const addressStreet = ref('')
const postalCode = ref('')
const city = ref('')
const country = ref('')
const tagInput = ref('')
const source = ref('')
const tags = ref<string[]>([])
const phoneError = ref('')
const companyInput = ref<HTMLInputElement | null>(null)

watch(() => props.open, async (open) => {
  if (open) {
    companyName.value = ''
    website.value = ''
    techPainPoint.value = ''
    email.value = ''
    phone.value = ''
    addressStreet.value = ''
    postalCode.value = ''
    city.value = ''
    country.value = ''
    tagInput.value = ''
    tags.value = []
    source.value = ''
    phoneError.value = ''
    await nextTick()
    companyInput.value?.focus()
  }
})

function submit() {
  if (!companyName.value.trim()) return
  if (phone.value.trim() && !/^\+?[1-9]\d{7,14}$/.test(phone.value.trim())) {
    phoneError.value = 'Format international attendu, par exemple +33612345678'
    return
  }
  emit('submit', {
    companyName: companyName.value,
    website: website.value,
    techPainPoint: techPainPoint.value,
    email: email.value,
    phone: phone.value,
    addressStreet: addressStreet.value,
    postalCode: postalCode.value,
    city: city.value,
    country: country.value,
    tags: tags.value,
    source: source.value,
  })
  emit('close')
}

function addTag() {
  const tag = tagInput.value.trim()
  if (!tag || tags.value.includes(tag)) return
  tags.value.push(tag)
  tagInput.value = ''
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4" @mousedown.self="$emit('close')">
      <form class="scrollbar-thin max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl" @submit.prevent="submit">
        <div class="mb-5 flex items-center justify-between">
          <h2 class="font-semibold text-zinc-100">{{ t('addProspectTitle') }}</h2>
          <button type="button" class="grid size-8 place-items-center rounded-md text-zinc-500 hover:bg-zinc-900" @click="$emit('close')">×</button>
        </div>
        <label class="mb-4 block">
          <span class="mb-1.5 block text-xs font-medium text-zinc-400">{{ t('company') }} <span class="text-amber-400">*</span></span>
          <input ref="companyInput" v-model="companyName" list="company-suggestions" required class="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-400" placeholder="Nom de l'entreprise" />
          <datalist id="company-suggestions">
            <option v-for="company in companySuggestions" :key="company" :value="company"></option>
          </datalist>
        </label>
        <label class="mb-4 block">
          <span class="mb-1.5 block text-xs font-medium text-zinc-400">Site web</span>
          <input v-model="website" type="text" class="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-400" placeholder="entreprise.com" />
        </label>
        <label class="mb-4 block">
          <span class="mb-1.5 block text-xs font-medium text-zinc-400">Source</span>
          <input v-model="source" class="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-400" placeholder="Recommandation, réseau, site web..." />
        </label>
        <div class="mb-4 grid grid-cols-2 gap-3">
          <label>
            <span class="mb-1.5 block text-xs font-medium text-zinc-400">Téléphone</span>
            <input v-model="phone" type="tel" class="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-400" placeholder="+33..." />
            <span v-if="phoneError" class="mt-1 block text-[11px] text-red-400">{{ phoneError }}</span>
          </label>
          <label>
            <span class="mb-1.5 block text-xs font-medium text-zinc-400">E-mail</span>
            <input v-model="email" type="email" class="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-400" placeholder="contact@entreprise.fr" />
          </label>
        </div>
        <div class="mb-4 grid grid-cols-2 gap-3">
          <label class="col-span-2">
            <span class="mb-1.5 block text-xs font-medium text-zinc-400">Rue</span>
            <input v-model="addressStreet" class="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-400" placeholder="12 rue..." />
          </label>
          <label>
            <span class="mb-1.5 block text-xs font-medium text-zinc-400">Code postal</span>
            <input v-model="postalCode" class="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-400" />
          </label>
          <label>
            <span class="mb-1.5 block text-xs font-medium text-zinc-400">Ville</span>
            <input v-model="city" class="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-400" />
          </label>
          <label class="col-span-2">
            <span class="mb-1.5 block text-xs font-medium text-zinc-400">Pays</span>
            <input v-model="country" class="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-400" />
          </label>
        </div>
        <div class="mb-5">
          <span class="mb-1.5 block text-xs font-medium text-zinc-400">Tags</span>
          <div v-if="tags.length" class="mb-2 flex flex-wrap gap-1.5">
            <span v-for="tag in tags" :key="tag" class="rounded-full bg-amber-400/10 px-2 py-1 text-xs text-amber-300">
              {{ tag }} <button type="button" class="ml-1 text-amber-600" @click="tags = tags.filter((item) => item !== tag)">×</button>
            </span>
          </div>
          <div class="flex gap-2">
            <input v-model="tagInput" list="tag-suggestions" class="min-w-0 flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400" placeholder="Secteur ou projet" @keydown.enter.prevent="addTag" />
            <datalist id="tag-suggestions">
              <option v-for="tag in tagSuggestions" :key="tag" :value="tag"></option>
            </datalist>
            <button type="button" class="rounded-md bg-zinc-800 px-3 text-xs text-zinc-300" @click="addTag">Ajouter</button>
          </div>
        </div>
        <label class="mb-5 block">
          <span class="mb-1.5 block text-xs font-medium text-zinc-400">Problème technique identifié</span>
          <textarea v-model="techPainPoint" rows="3" class="w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-400" placeholder="Quel est le problème technique ou l'opportunité ?"></textarea>
        </label>
        <div class="flex justify-end gap-2">
          <button type="button" class="rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900" @click="$emit('close')">{{ t('cancel') }}</button>
          <button type="submit" class="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-300">{{ t('add') }}</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>
