import {
  loadClassrooms,
  saveClassrooms,
  nextClassroomId,
  validateClassroomUnique,
  findClassroomById,
} from '../utils/classroomsStorage'
import {
  findClassroomConflict,
  getOccupiedClassroomIds,
  getAllClassroomBookings,
  getClassroomUsageStats,
} from '../utils/classroomBookings'
import { minutesToTimeString } from '../utils/classroomTime'

const DELAY = 180

function delay(ms = DELAY) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function fetchClassrooms({ status, signal } = {}) {
  await delay()
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  let list = loadClassrooms()
  if (status && status !== 'all') list = list.filter((c) => c.status === status)
  return list
}

export async function saveClassroom(payload, { isEdit, id } = {}) {
  const list = loadClassrooms()
  const errors = validateClassroomUnique(list, {
    name: payload.name,
    code: payload.code,
    excludeId: isEdit ? id : null,
  })
  if (Object.keys(errors).length) {
    const err = new Error(Object.values(errors)[0])
    err.validation = errors
    throw err
  }

  await delay()
  const now = new Date().toISOString()
  const normalized = {
    name: payload.name?.trim(),
    code: payload.code?.trim().toUpperCase(),
    capacity: payload.capacity != null && payload.capacity !== '' ? Number(payload.capacity) : null,
    description: payload.description?.trim() || '',
    status: payload.status === 'In Active' ? 'In Active' : 'Active',
    color: payload.color || '#246392',
    modifiedAt: now,
  }

  if (isEdit && id) {
    const updated = list.map((c) => (c.id === id ? { ...c, ...normalized } : c))
    saveClassrooms(updated)
    return updated.find((c) => c.id === id)
  }

  const row = { id: nextClassroomId(list), ...normalized, createdAt: now }
  saveClassrooms([...list, row])
  return row
}

export async function deleteClassroom(id) {
  await delay()
  const list = loadClassrooms().filter((c) => c.id !== id)
  saveClassrooms(list)
}

export async function toggleClassroomStatus(id) {
  const list = loadClassrooms()
  const row = list.find((c) => c.id === id)
  if (!row) throw new Error('Classroom not found')
  const next = row.status === 'Active' ? 'In Active' : 'Active'
  return saveClassroom({ ...row, status: next }, { isEdit: true, id })
}

export async function fetchAvailableClassrooms({
  date,
  startTime,
  durationMinutes = 60,
  excludeSourceIds = [],
  signal,
} = {}) {
  await delay(80)
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

  const occupied = getOccupiedClassroomIds({
    date,
    startTime,
    durationMinutes,
    excludeSourceIds,
  })

  return loadClassrooms()
    .filter((c) => c.status === 'Active')
    .map((c) => ({
      ...c,
      available: !occupied.has(c.id),
      occupied: occupied.has(c.id),
    }))
}

export async function checkClassroomAvailability({
  classroomId,
  date,
  startTime,
  durationMinutes = 60,
  excludeSourceIds = [],
}) {
  if (!classroomId || !date || !startTime) {
    return { available: false, conflict: null }
  }

  const conflict = findClassroomConflict({
    classroomId,
    date,
    startTime,
    durationMinutes,
    excludeSourceIds,
  })
  return { available: !conflict, conflict }
}

export function getClassroomBookings() {
  return getAllClassroomBookings()
}

export function getUsageStats(classroomId) {
  return getClassroomUsageStats(classroomId)
}

export { findClassroomById, minutesToTimeString }
