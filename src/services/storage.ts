import type { BrolDatabase } from '../types/brol'

const STORAGE_KEY = 'brol:data'

export const createEmptyDatabase = (): BrolDatabase => ({
  version: 1,
  lastModified: new Date().toISOString(),
  prospects: [],
})

const isTauri = (): boolean =>
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

export async function loadDatabase(): Promise<BrolDatabase> {
  if (isTauri()) {
    const { appDataDir, join } = await import('@tauri-apps/api/path')
    const { exists, mkdir, readTextFile, writeTextFile } = await import('@tauri-apps/plugin-fs')
    const dir = await appDataDir()
    const brolDir = await join(dir, 'brol')
    const file = await join(brolDir, 'data.json')

    if (!(await exists(brolDir))) await mkdir(brolDir, { recursive: true })
    if (!(await exists(file))) {
      const empty = createEmptyDatabase()
      await writeTextFile(file, JSON.stringify(empty, null, 2))
      return empty
    }

    try {
      return JSON.parse(await readTextFile(file)) as BrolDatabase
    } catch {
      return createEmptyDatabase()
    }
  }

  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) {
    const empty = createEmptyDatabase()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(empty))
    return empty
  }
  try {
    return JSON.parse(saved) as BrolDatabase
  } catch {
    return createEmptyDatabase()
  }
}

export async function saveDatabase(database: BrolDatabase): Promise<void> {
  if (isTauri()) {
    const { appDataDir, join } = await import('@tauri-apps/api/path')
    const { mkdir, writeTextFile } = await import('@tauri-apps/plugin-fs')
    const dir = await appDataDir()
    const brolDir = await join(dir, 'brol')
    const file = await join(brolDir, 'data.json')
    await mkdir(brolDir, { recursive: true })
    await writeTextFile(file, JSON.stringify(database, null, 2))
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(database))
  }
}
