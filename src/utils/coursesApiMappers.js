import { courseFormToRow } from './academicsFormMappers'

/** MongoDB document → table row shape used by BatchesPage */
export function mapCourseFromApi(doc) {
  if (!doc) return null
  const id = doc._id ?? doc.id
  const fd = doc.formData || {}
  return {
    id,
    name: doc.batchName || doc.courseName || fd.batchName,
    batchId: doc.batchId || fd.batchId,
    batchName: doc.batchName || fd.batchName || doc.courseName,
    courseId: doc.courseId || fd.courseId,
    commencement: doc.commencement || fd.commencement,
    durationLabel: doc.durationLabel || fd.durationLabel,
    batchStartFrom: doc.batchStartFrom || fd.batchStartFrom,
    batchEndTo: doc.batchEndTo || fd.batchEndTo,
    bannerPreview: doc.bannerPreview || fd.bannerUrl || fd.bannerPreview,
    bannerFileName: doc.bannerFileName || fd.bannerFileName,
    linkedSubjects: doc.linkedSubjects || fd.linkedSubjects,
    category: doc.category,
    center: doc.center,
    price: doc.price,
    status: doc.status,
    formData: doc.formData ?? null,
    createdAt: doc.createdAt,
    modifiedAt: doc.modifiedAt,
  }
}

/** Modal form → API request body */
export function mapCourseToApiPayload(form, existing) {
  const row = courseFormToRow(form, existing)
  return {
    courseName: row.batchName || row.name,
    batchId: row.batchId,
    batchName: row.batchName,
    courseId: row.courseId,
    commencement: row.commencement,
    durationLabel: row.durationLabel,
    batchStartFrom: row.batchStartFrom,
    batchEndTo: row.batchEndTo,
    bannerUrl: row.bannerPreview,
    bannerFileName: row.bannerFileName,
    linkedSubjects: row.linkedSubjects,
    category: row.category,
    center: row.center,
    price: row.price,
    status: row.status,
    formData: form,
  }
}
