<script setup lang="ts">
const version = '1.5.3'
</script>

<template>
  <main class="scrollbar-thin flex-1 overflow-y-auto p-8">
    <section class="mx-auto max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900/30 p-8">
      <div class="mb-6 flex items-center gap-4">
        <div class="grid size-12 place-items-center rounded-xl bg-amber-400 text-xl font-black text-zinc-950">B</div>
        <div>
          <h2 class="text-xl font-semibold text-zinc-100">Brol</h2>
          <p class="text-sm text-zinc-500">Micro-CRM local-first pour développeur freelance</p>
        </div>
      </div>

      <dl class="divide-y divide-zinc-800 text-sm">
        <div class="flex justify-between py-3">
          <dt class="text-zinc-500">Version</dt>
          <dd class="font-medium text-zinc-200">{{ version }}</dd>
        </div>
        <div class="flex justify-between py-3">
          <dt class="text-zinc-500">Auteur</dt>
          <dd class="font-medium text-zinc-200">Loïc JACQUES</dd>
        </div>
        <div class="flex justify-between py-3">
          <dt class="text-zinc-500">Site web</dt>
          <dd>
            <a href="https://funkyduck.be" target="_blank" rel="noopener" class="font-medium text-amber-400 hover:text-amber-300">funkyduck.be</a>
          </dd>
        </div>
        <div class="flex justify-between py-3">
          <dt class="text-zinc-500">Licence</dt>
          <dd>
            <a href="https://opensource.org/license/mit" target="_blank" rel="noopener" class="font-medium text-amber-400 hover:text-amber-300">MIT</a>
          </dd>
        </div>
      </dl>
    </section>
  </main>
</template>
