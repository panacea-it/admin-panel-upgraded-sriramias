const LIVE_CATEGORY = 'Live Class'
const RECORDED_CATEGORY = 'Recorded Class'
const TEST_SERIES_CATEGORY = 'Test Series'

export function normalizeTopics(value) {
  if (Array.isArray(value)) {
    return value.map((t) => String(t).trim()).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  return []
}

export function normalizeCategories(value) {
  if (Array.isArray(value)) {
    return value.map((c) => String(c).trim()).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  return []
}

export function isLiveClassCategory(category) {
  return normalizeCategories(category).includes(LIVE_CATEGORY)
}

export function isRecordedClassCategory(category) {
  return normalizeCategories(category).includes(RECORDED_CATEGORY)
}

export function isTestSeriesCategory(category) {
  return normalizeCategories(category).includes(TEST_SERIES_CATEGORY)
}

export function shouldShowTestSeriesSection(values, { liveClassOnly = false } = {}) {
  if (liveClassOnly) return false
  return isTestSeriesCategory(values.categories ?? values.category)
}

export function deriveClassTypeLabel(categories) {
  const cats = normalizeCategories(categories)
  const parts = []
  if (cats.includes(LIVE_CATEGORY)) parts.push('Live')
  if (cats.includes(RECORDED_CATEGORY)) parts.push('Recording')
  if (cats.includes(TEST_SERIES_CATEGORY)) parts.push('Test Series')
  if (parts.length) return parts.join(' + ')
  return cats.length ? cats.join(', ') : '—'
}

export function deriveTestSeriesStatus(subject) {
  if (!isTestSeriesCategory(subject?.categories ?? subject?.category)) return '—'
  const ts = subject?.testSeries
  if (!ts) return 'Not configured'
  const questions = ts.questions?.length ?? 0
  if (!questions) return 'Draft'
  const schedule = ts.schedule?.date || ts.scheduleDate
  if (schedule) return 'Scheduled'
  return 'Ready'
}

export function deriveLiveStatus(subject) {
  const live = subject?.liveClasses || []
  if (!live.length) return 'None'
  const active = live.some((lc) => lc.status !== 'In Active' && lc.status !== 'Disabled')
  return active ? 'Scheduled' : 'Inactive'
}

export function deriveRecordingStatus(subject) {
  const rec = subject?.recordings || []
  if (!rec.length) return 'None'
  const published = rec.some((r) => r.status === 'Published' || r.status === 'Active')
  return published ? 'Published' : 'Draft'
}
