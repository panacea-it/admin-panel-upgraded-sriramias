import { CLASSROOMS_SEED } from '../data/classroomsSeed'

const STORAGE_KEY = 'sriram_classrooms_v1'

function nowIso() {
  return new Date().toISOString()
}

function normalize(row) {
  return {
    id: row.id,
    name: String(row.name || '').trim(),
    code: String(row.code || '').trim().toUpperCase(),
    capacity: row.capacity != null && row.capacity !== '' ? Number(row.capacity) : null,
    description: String(row.description || '').trim(),
    status: row.status === 'In Active' ? 'In Active' : 'Active',
    color: row.color || '#246392',
    createdAt: row.createdAt || nowIso(),
    modifiedAt: row.modifiedAt || row.createdAt || nowIso(),
  }
}

export function loadClassrooms() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length) return parsed.map(normalize)
    }
  } catch {
    /* ignore */
  }
  saveClassrooms(CLASSROOMS_SEED.map(normalize))
  return CLASSROOMS_SEED.map(normalize)
}

export function saveClassrooms(list) {
  const normalized = list.map(normalize)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  window.dispatchEvent(new CustomEvent('classrooms-updated', { detail: normalized }))
  return normalized
}

export function nextClassroomId(list) {
  const max = list.reduce((m, row) => {
    const num = parseInt(String(row.id || '').replace(/\D/g, ''), 10) || 0
    return Math.max(m, num)
  }, 0)
  return `cr-${String(max + 1).padStart(3, '0')}`
}

export function findClassroomById(id) {
  return loadClassrooms().find((c) => c.id === id) || null
}

export function validateClassroomUnique(list, { name, code, excludeId }) {
  const n = name?.trim().toLowerCase()
  const c = code?.trim().toLowerCase()
  const errors = {}
  if (!n) errors.name = 'Classroom name is required'
  if (!c) errors.code = 'Classroom code is required'
  list.forEach((row) => {
    if (excludeId && row.id === excludeId) return
    if (n && row.name.toLowerCase() === n) errors.name = 'Classroom name already exists'
    if (c && row.code.toLowerCase() === c) errors.code = 'Classroom code already exists'
  })
  return errors
}
