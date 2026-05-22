/** Batch-only form — scheduling & linkage; no course marketing content */

export function createEmptyBatchForm() {
  return {
    batchId: '',
    batchName: '',
    academicCourseId: '',
    courseId: '',
    courseName: '',
    commencement: '',
    durationLabel: '',
    batchStartFrom: '',
    batchEndTo: '',
    bannerFileName: '',
    bannerPreview: '',
    bannerUrl: '',
    status: 'Active',
  }
}

export function batchRowToForm(row) {
  if (!row) return createEmptyBatchForm()
  const fd = row.formData || {}
  return {
    ...createEmptyBatchForm(),
    batchId: row.batchId || fd.batchId || '',
    batchName: row.batchName || row.name || fd.batchName || '',
    academicCourseId: row.academicCourseId || fd.academicCourseId || '',
    courseId: row.courseId || fd.courseId || '',
    courseName: row.courseName || fd.courseName || '',
    commencement: row.commencement || fd.commencement || '',
    durationLabel: row.durationLabel || fd.durationLabel || '',
    batchStartFrom: row.batchStartFrom || fd.batchStartFrom || '',
    batchEndTo: row.batchEndTo || fd.batchEndTo || '',
    bannerPreview: row.bannerPreview || fd.bannerPreview || fd.bannerUrl || '',
    bannerFileName: row.bannerFileName || fd.bannerFileName || '',
    bannerUrl: row.bannerUrl || fd.bannerUrl || '',
    status: row.status || fd.status || 'Active',
  }
}

export function batchFormToStorageRow(form, existing) {
  const displayName = form.batchName?.trim() || 'Untitled Batch'
  return {
    id: existing?.id ?? `batch-${Date.now()}`,
    batchId: form.batchId || existing?.batchId,
    batchName: displayName,
    name: displayName,
    courseId: form.courseId || existing?.courseId,
    academicCourseId: form.academicCourseId || existing?.academicCourseId,
    courseName: form.courseName || existing?.courseName,
    commencement: form.commencement,
    durationLabel: form.durationLabel,
    batchStartFrom: form.batchStartFrom,
    batchEndTo: form.batchEndTo,
    bannerPreview: form.bannerPreview,
    bannerFileName: form.bannerFileName,
    status: form.status || 'Active',
    formData: { ...form },
    createdAt: existing?.createdAt,
    modifiedAt: new Date().toISOString(),
  }
}
