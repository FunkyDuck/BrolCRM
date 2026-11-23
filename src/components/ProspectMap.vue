<script setup lang="ts">
import { onMounted, watch } from 'vue'
import type { Prospect } from '../types/brol'

const props = defineProps<{ prospects: Prospect[] }>()
let map: import('leaflet').Map | null = null
let markers: import('leaflet').LayerGroup | null = null

async function renderMarkers() {
  if (!map) return
  const L = await import('leaflet')
  markers?.clearLayers()
  if (!markers) {
    markers = L.layerGroup().addTo(map)
  }

  const addresses = props.prospects
    .filter((prospect) => prospect.address || prospect.addressStreet || prospect.city)
    .map((prospect) => ({
      ...prospect,
      fullAddress: [
        prospect.addressStreet || prospect.address,
        prospect.postalCode,
        prospect.city,
        prospect.country,
      ].filter(Boolean).join(', '),
    }))

  for (const prospect of addresses) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(prospect.fullAddress)}`,
        { headers: { 'Accept-Language': 'fr' } },
      )
      const results = await response.json() as { lat: string; lon: string }[]
      if (!results[0]) continue
      L.marker([Number(results[0].lat), Number(results[0].lon)])
        .bindPopup(`<strong>${prospect.companyName}</strong><br>${prospect.fullAddress}`)
        .addTo(markers)
    } catch {
      // Ignore addresses that cannot be geocoded.
    }
  }
}

onMounted(async () => {
  const L = await import('leaflet')
  map = L.map('prospect-map', { scrollWheelZoom: true }).setView([46.603354, 1.888334], 5)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
  }).addTo(map)
  await renderMarkers()
})

watch(() => props.prospects, () => void renderMarkers())
</script>

<template>
  <div id="prospect-map" class="h-72 overflow-hidden rounded-lg border border-zinc-800"></div>
</template>
