import { computed, ref, watch } from 'vue'
import type { BrolDatabase, Interaction, Prospect, ProspectStatus } from '../types/brol'
import { loadDatabase, saveDatabase } from '../services/storage'

type FilterStatus = ProspectStatus | 'all'

const database = ref<BrolDatabase>({
  version: 1,
  lastModified: new Date().toISOString(),
  prospects: [],
})
const selectedProspectId = ref<string | null>(null)
const activeFilter = ref<FilterStatus>('all')
const searchQuery = ref('')
const isLoaded = ref(false)
const sortKey = ref<'companyName' | 'nextFollowup' | 'status'>('nextFollowup')
const sortDirection = ref<'asc' | 'desc'>('asc')

let saveTimer: number | undefined

export function useBrol() {
  const prospects = computed(() => database.value.prospects)

  const selectedProspect = computed(() =>
    prospects.value.find((prospect) => prospect.id === selectedProspectId.value) ?? null,
  )

  const counts = computed<Record<FilterStatus, number>>(() => {
    const result: Record<FilterStatus, number> = {
      all: prospects.value.length,
      to_contact: 0,
      contacted: 0,
      in_discussion: 0,
      signed: 0,
      archived: 0,
    }
    prospects.value.forEach((prospect) => result[prospect.status]++)
    return result
  })

  const filteredProspects = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    return prospects.value
      .filter((prospect) => activeFilter.value === 'all' || prospect.status === activeFilter.value)
      .filter((prospect) =>
        !query ||
        prospect.companyName.toLowerCase().includes(query) ||
        prospect.contactName.toLowerCase().includes(query) ||
        prospect.techPainPoint.toLowerCase().includes(query),
      )
      .sort((a, b) => {
        if (sortKey.value === 'companyName') {
          const comparison = a.companyName.localeCompare(b.companyName, 'fr', { sensitivity: 'base' })
          return sortDirection.value === 'asc' ? comparison : -comparison
        }
        if (sortKey.value === 'status') {
          const comparison = a.status.localeCompare(b.status)
          return sortDirection.value === 'asc' ? comparison : -comparison
        }
        const comparison = (a.nextFollowup ?? '').localeCompare(b.nextFollowup ?? '')
        return sortDirection.value === 'asc' ? comparison : -comparison
      })
  })

  function setSort(key: 'companyName' | 'nextFollowup' | 'status') {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDirection.value = 'asc'
    }
  }

  async function initialize() {
    const loaded = await loadDatabase()
    loaded.prospects = loaded.prospects.map((prospect) => ({
      ...prospect,
      tags: Array.isArray(prospect.tags)
        ? [...new Set(prospect.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))]
        : [],
      source: prospect.source ?? '',
      followupHistory: Array.isArray(prospect.followupHistory) ? prospect.followupHistory : [],
      phone: prospect.phone ?? '',
      address: prospect.address ?? '',
      addressStreet: prospect.addressStreet ?? '',
      postalCode: prospect.postalCode ?? '',
      city: prospect.city ?? '',
      country: prospect.country ?? '',
    }))
    database.value = loaded
    await saveDatabase(database.value)
    isLoaded.value = true
  }

  function scheduleSave() {
    database.value.lastModified = new Date().toISOString()
    window.clearTimeout(saveTimer)
    saveTimer = window.setTimeout(() => {
      void saveDatabase(database.value)
    }, 300)
  }

  watch(database, scheduleSave, { deep: true })

  function addProspect(input: Pick<Prospect, 'companyName' | 'website' | 'techPainPoint' | 'email' | 'phone' | 'addressStreet' | 'postalCode' | 'city' | 'country' | 'tags' | 'source'>) {
    const now = new Date().toISOString()
    const prospect: Prospect = {
      id: crypto.randomUUID(),
      companyName: input.companyName.trim(),
      source: input.source.trim(),
      contactName: '',
      email: input.email.trim(),
      phone: input.phone.trim(),
      address: [input.addressStreet, input.postalCode, input.city, input.country].filter(Boolean).join(', '),
      addressStreet: input.addressStreet.trim(),
      postalCode: input.postalCode.trim(),
      city: input.city.trim(),
      country: input.country.trim(),
      tags: [...new Set(input.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))],
      website: input.website.trim(),
      status: 'to_contact',
      nextFollowup: null,
      techPainPoint: input.techPainPoint.trim(),
      notes: '',
      interactions: [],
      followupHistory: [],
      createdAt: now,
      updatedAt: now,
    }
    database.value.prospects.unshift(prospect)
    selectedProspectId.value = prospect.id
  }

  function updateProspect(id: string, patch: Partial<Prospect>) {
    const index = database.value.prospects.findIndex((prospect) => prospect.id === id)
    if (index === -1) return
    const trimmedPatch = { ...patch }
    if (Array.isArray(trimmedPatch.tags)) {
      trimmedPatch.tags = [...new Set(trimmedPatch.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))]
    }
    for (const key of ['companyName', 'contactName', 'email', 'phone', 'website', 'techPainPoint', 'notes', 'address', 'addressStreet', 'postalCode', 'city', 'country', 'source'] as const) {
      if (typeof trimmedPatch[key] === 'string') {
        trimmedPatch[key] = trimmedPatch[key]!.trim()
      }
    }
    database.value.prospects[index] = {
      ...database.value.prospects[index],
      ...trimmedPatch,
      updatedAt: new Date().toISOString(),
    }
  }

  function deleteProspect(id: string) {
    database.value.prospects = database.value.prospects.filter((prospect) => prospect.id !== id)
    if (selectedProspectId.value === id) selectedProspectId.value = null
  }

  function clearDatabase() {
    database.value = {
      version: 1,
      lastModified: new Date().toISOString(),
      prospects: [],
    }
    selectedProspectId.value = null
  }

  function addInteraction(prospectId: string, type: Interaction['type'], summary: string) {
    const interaction: Interaction = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type,
      summary: summary.trim(),
    }
    const prospect = database.value.prospects.find((item) => item.id === prospectId)
    if (!prospect || !interaction.summary) return
    prospect.interactions.unshift(interaction)
    prospect.updatedAt = new Date().toISOString()
  }

  function updateInteraction(prospectId: string, interactionId: string, patch: Partial<Interaction>) {
    const prospect = database.value.prospects.find((item) => item.id === prospectId)
    if (!prospect) return
    const interaction = prospect.interactions.find((item) => item.id === interactionId)
    if (!interaction) return
    if (typeof patch.summary === 'string') patch.summary = patch.summary.trim()
    Object.assign(interaction, patch)
    prospect.updatedAt = new Date().toISOString()
  }

  function deleteInteraction(prospectId: string, interactionId: string) {
    const prospect = database.value.prospects.find((item) => item.id === prospectId)
    if (!prospect) return
    prospect.interactions = prospect.interactions.filter((interaction) => interaction.id !== interactionId)
    prospect.updatedAt = new Date().toISOString()
  }

  const companySuggestions = computed(() =>
    [...new Set(prospects.value.map((prospect) => prospect.companyName.trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' })),
  )

  const tagSuggestions = computed(() =>
    [...new Set(prospects.value.flatMap((prospect) => prospect.tags))]
      .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' })),
  )

  const notifications = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const inSevenDays = new Date(today)
    inSevenDays.setDate(inSevenDays.getDate() + 7)
    const items: { id: string; title: string; detail: string; tone: 'amber' | 'sky' }[] = []

    prospects.value.forEach((prospect) => {
      if (prospect.nextFollowup && !['signed', 'archived'].includes(prospect.status)) {
        const date = new Date(`${prospect.nextFollowup}T12:00:00`)
        if (date <= inSevenDays) {
          items.push({
            id: `followup-${prospect.id}`,
            title: `Relance : ${prospect.companyName}`,
            detail: date < today ? 'Relance en retard' : date.getTime() === today.getTime() ? 'Relance prévue aujourd’hui' : `Prévue le ${prospect.nextFollowup}`,
            tone: 'amber',
          })
        }
      }
    })

    const recentLimit = new Date(today)
    recentLimit.setDate(recentLimit.getDate() - 7)
    prospects.value.forEach((prospect) => {
      prospect.interactions
        .filter((interaction) => ['call', 'meeting'].includes(interaction.type))
        .filter((interaction) => new Date(interaction.date) >= recentLimit)
        .forEach((interaction) => {
          items.push({
            id: `interaction-${interaction.id}`,
            title: `${interaction.type === 'call' ? 'Appel' : 'Réunion'} : ${prospect.companyName}`,
            detail: interaction.summary,
            tone: 'sky',
          })
        })
    })
    return items
  })

  async function exportDatabase() {
    const json = JSON.stringify(database.value, null, 2)
    if ('__TAURI_INTERNALS__' in window) {
      const { save } = await import('@tauri-apps/plugin-dialog')
      const { writeTextFile } = await import('@tauri-apps/plugin-fs')
      const path = await save({
        defaultPath: `brol-${new Date().toISOString().slice(0, 10)}.json`,
        filters: [{ name: 'JSON', extensions: ['json'] }],
      })
      if (path) await writeTextFile(path, json)
    } else {
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `brol-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  async function importDatabase(mode: 'merge' | 'replace' = 'replace') {
    let json: string | null = null
    if ('__TAURI_INTERNALS__' in window) {
      const { open } = await import('@tauri-apps/plugin-dialog')
      const { readTextFile } = await import('@tauri-apps/plugin-fs')
      const path = await open({
        multiple: false,
        filters: [{ name: 'JSON', extensions: ['json'] }],
      })
      if (typeof path === 'string') json = await readTextFile(path)
    } else {
      json = await new Promise<string | null>((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'application/json'
        input.onchange = () => {
          const file = input.files?.[0]
          if (!file) return resolve(null)
          file.text().then(resolve)
        }
        input.click()
      })
    }
    if (!json) return
    const parsed = JSON.parse(json) as BrolDatabase
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.prospects)) {
      throw new Error('Fichier JSON Brol invalide.')
    }
    const normalizedProspects = parsed.prospects.map((prospect) => ({
          ...prospect,
          source: prospect.source ?? '',
          phone: prospect.phone ?? '',
          address: prospect.address ?? '',
          addressStreet: prospect.addressStreet ?? '',
          postalCode: prospect.postalCode ?? '',
          city: prospect.city ?? '',
          country: prospect.country ?? '',
          tags: Array.isArray(prospect.tags)
            ? [...new Set(prospect.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))]
            : [],
        }))
    if (mode === 'merge') {
      const merged = [...database.value.prospects]
      normalizedProspects.forEach((prospect) => {
        const index = merged.findIndex((existing) => existing.id === prospect.id)
        if (index === -1) merged.push(prospect)
        else merged[index] = prospect
      })
      database.value = {
        ...database.value,
        lastModified: new Date().toISOString(),
        prospects: merged,
      }
    } else {
      database.value = {
        ...parsed,
        lastModified: new Date().toISOString(),
        prospects: normalizedProspects,
      }
    }
    selectedProspectId.value = null
  }

  return {
    prospects,
    selectedProspect,
    selectedProspectId,
    activeFilter,
    searchQuery,
    isLoaded,
    notifications,
    companySuggestions,
    tagSuggestions,
    sortKey,
    sortDirection,
    counts,
    filteredProspects,
    initialize,
    setSort,
    addProspect,
    updateProspect,
    deleteProspect,
    clearDatabase,
    addInteraction,
    updateInteraction,
    deleteInteraction,
    exportDatabase,
    importDatabase,
  }
}
