import {
  loadCities,
  saveCities,
  nextCityId,
  validateCityRecord,
  findCityById,
  getCitiesForCenter,
  suggestCityCode,
} from '../utils/citiesStorage'

const DELAY = 180

function delay(ms = DELAY) {
  return new Promise((r) => setTimeout(r, ms))
}

function resolveBranchCode(payload, list, { isEdit, id } = {}) {
  if (payload.code?.trim()) return payload.code.trim().toUpperCase()
  const existing = list
    .filter((row) => !(isEdit && id && row.id === id))
    .map((c) => c.code)
  return suggestCityCode({
    centerCode: payload.centerCode,
    placeName: payload.placeName,
    existingCodes: existing,
  })
}

export async function fetchCities({ centerId, status, signal } = {}) {
  await delay()
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  let list = loadCities()
  if (centerId && centerId !== 'all') {
    list = list.filter((c) => String(c.centerId) === String(centerId))
  }
  if (status && status !== 'all') {
    list = list.filter((c) => c.status === status)
  }
  return list
}

export async function saveCity(payload, { isEdit, id } = {}) {
  const list = loadCities()
  const code = resolveBranchCode(payload, list, { isEdit, id })
  const draft = { ...payload, code }

  const errors = validateCityRecord(list, draft, { excludeId: isEdit ? id : null })
  if (Object.keys(errors).length) {
    const err = new Error(Object.values(errors)[0])
    err.validation = errors
    throw err
  }

  await delay()
  const now = new Date().toISOString()
  const normalized = {
    centerId: draft.centerId,
    centerName: draft.centerName?.trim() || '',
    placeName: draft.placeName?.trim(),
    code,
    status: draft.status === 'Inactive' ? 'Inactive' : 'Active',
    modifiedAt: now,
  }

  if (isEdit && id) {
    const updated = list.map((c) => (c.id === id ? { ...c, ...normalized } : c))
    saveCities(updated)
    return updated.find((c) => c.id === id)
  }

  const row = {
    id: nextCityId(list),
    ...normalized,
    createdAt: now,
  }
  saveCities([...list, row])
  return row
}

export async function deleteCity(id) {
  await delay()
  saveCities(loadCities().filter((c) => c.id !== id))
}

export async function toggleCityStatus(id) {
  const list = loadCities()
  const row = list.find((c) => c.id === id)
  if (!row) throw new Error('City not found')
  const next = row.status === 'Active' ? 'Inactive' : 'Active'
  return saveCity({ ...row, status: next, centerCode: '' }, { isEdit: true, id })
}

export { findCityById, getCitiesForCenter }
