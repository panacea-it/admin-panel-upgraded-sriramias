import { INITIAL_BATCHES } from '../data/batchManagementData'
import { formatSubjectLabel } from './subjectsStorage'

export function nextBatchId(rows = []) {
  const max = rows.reduce((m, row) => {
    const raw = row.batchId || ''
    const num = parseInt(String(raw).replace(/\D/g, ''), 10) || 0
    return Math.max(m, num)
  }, 0)
  return `BAT${String(max + 1).padStart(3, '0')}`
}

export function nextCourseId(rows = []) {
  const max = rows.reduce((m, row) => {
    const raw = row.courseId || row.formData?.courseId || ''
    const num = parseInt(String(raw).replace(/\D/g, ''), 10) || 0
    return Math.max(m, num)
  }, 0)
  return `CRS${String(max + 1).padStart(3, '0')}`
}

export function normalizeLinkedSubjects(form = {}) {
  if (Array.isArray(form.linkedSubjects) && form.linkedSubjects.length) {
    return form.linkedSubjects.filter((s) => s?.subjectId)
  }
  const legacy = (form.subjects || []).filter(Boolean)
  return legacy.map((s) => {
    if (typeof s === 'object' && s.subjectId) return s
    return { subjectId: String(s), subjectName: String(s) }
  })
}

export function enrichBatchRow(row, index = 0) {
  const fd = row.formData || {}
  const linked = normalizeLinkedSubjects(fd)
  return {
    ...row,
    batchId: row.batchId || fd.batchId || `BAT${String(index + 1).padStart(3, '0')}`,
    batchName: row.batchName || fd.batchName || row.name || '',
    courseId: row.courseId || fd.courseId || '—',
    commencement: row.commencement || fd.commencement || '',
    durationLabel: row.durationLabel || fd.durationLabel || fd.duration || '',
    batchStartFrom: row.batchStartFrom || fd.batchStartFrom || '',
    batchEndTo: row.batchEndTo || fd.batchEndTo || '',
    bannerPreview: row.bannerPreview || fd.bannerPreview || fd.bannerUrl || '',
    bannerFileName: row.bannerFileName || fd.bannerFileName || '',
    linkedSubjects: linked,
    createdAt: row.createdAt || fd.createdAt,
    modifiedAt: row.modifiedAt || fd.modifiedAt,
  }
}

/** Demo batches → enriched rows when API returns nothing (local dev / offline). */
export function mapInitialBatchesToRows() {
  return INITIAL_BATCHES.map((b, i) =>
    enrichBatchRow(
      {
        id: b.id,
        batchId: b.batchId,
        batchName: b.batchLabel,
        linkedCourseName: b.courseName,
        name: b.displayName,
        status: b.status,
        batchStartFrom: b.startDate,
        batchEndTo: b.endDate,
        formData: { trainerName: b.trainerName },
      },
      i,
    ),
  )
}

/** Maps API/enriched batch row + local students into the batch management table shape. */
export function mapBatchRowToTableFormat(row, students = []) {
  const fd = row.formData || {}
  const courseName = row.linkedCourseName || row.program || 'Course'
  const batchLabel = row.batchName || row.name || 'Batch'
  return {
    id: row.id,
    batchId: row.batchId || fd.batchId || '—',
    courseName,
    batchLabel,
    displayName: `${courseName} - ${batchLabel}`,
    trainerName: fd.trainerName || row.trainerName || '—',
    startDate: row.batchStartFrom || row.commencement || fd.batchStartFrom || '',
    endDate: row.batchEndTo || fd.batchEndTo || '',
    status: row.status || 'Active',
    students,
    totalStudents: students.length,
    apiRow: row,
  }
}

export function formatLinkedSubjectDisplay(link) {
  if (!link) return ''
  if (link.subjectName && link.subjectId) {
    return formatSubjectLabel({ subjectId: link.subjectId, name: link.subjectName })
  }
  return link.subjectId || link.subjectName || ''
}
