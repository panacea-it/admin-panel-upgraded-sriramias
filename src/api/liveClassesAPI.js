import { INITIAL_LIVE_CLASSES } from '../data/liveClassesData'

const SIMULATED_DELAY_MS = 200

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** In-memory store — replace with REST when backend exists */
let store = [...INITIAL_LIVE_CLASSES]

export async function fetchLiveClasses({ signal } = {}) {
  await delay(SIMULATED_DELAY_MS)
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  return [...store]
}

export async function fetchLiveClassById(id, { signal } = {}) {
  const list = await fetchLiveClasses({ signal })
  return list.find((r) => r.id === id) ?? null
}

export async function saveLiveClass(lesson, { isEdit, id } = {}) {
  await delay(SIMULATED_DELAY_MS)
  const now = new Date().toISOString()
  if (isEdit && id) {
    store = store.map((row) =>
      row.id === id ? { ...row, ...lesson, modifiedAt: now } : row,
    )
    return store.find((r) => r.id === id)
  }
  const newRow = {
    ...lesson,
    id: lesson.id ?? `lc-${Date.now()}`,
    createdAt: now,
    modifiedAt: now,
  }
  store = [newRow, ...store]
  return newRow
}

export async function deleteLiveClass(id) {
  await delay(SIMULATED_DELAY_MS)
  store = store.filter((r) => r.id !== id)
}

export function resetLiveClassesStore(seed = INITIAL_LIVE_CLASSES) {
  store = [...seed]
}
