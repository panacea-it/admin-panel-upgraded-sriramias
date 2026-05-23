import { serializeBatchContent } from './batchFormMappers'

/** MongoDB document → table row shape used by BatchesPage */
export function mapCourseFromApi(doc) {
  if (!doc) return null
  const id = doc._id ?? doc.id
  const fd = doc.formData || {}
  const catalogName = doc.linkedCourseName || fd.courseName || doc.catalogCourseName
  const batchName = doc.batchName || fd.batchName || doc.courseName
  return {
    id,
    name: batchName,
    batchId: doc.batchId || fd.batchId,
    batchName,
    courseId: doc.courseId || fd.courseId,
    academicCourseId: doc.academicCourseId || fd.academicCourseId,
    courseName: catalogName,
    linkedCourseName: catalogName,
    commencement: doc.commencement || fd.commencement,
    durationLabel: doc.durationLabel || fd.durationLabel,
    batchStartFrom: doc.batchStartFrom || fd.batchStartFrom,
    batchEndTo: doc.batchEndTo || fd.batchEndTo,
    bannerPreview: doc.bannerUrl || doc.bannerPreview || fd.bannerPreview || fd.bannerUrl,
    bannerFileName: doc.bannerFileName || fd.bannerFileName,
    status: doc.status || fd.status || 'Active',
    feeDetails: doc.feeDetails || fd.feeDetails,
    seo: doc.seo || fd.seo,
    linkedSubjects: doc.linkedSubjects || fd.linkedSubjects || [],
    formData: fd,
    createdAt: doc.createdAt,
    modifiedAt: doc.modifiedAt,
  }
}

/** Batch modal form → API request body (no faculty-subject fields) */
export function mapCourseToApiPayload(form, existing) {
  const batchName = form.batchName?.trim() || existing?.batchName || existing?.name
  const content = serializeBatchContent(form)
  const { subjects: _legacy, ...formWithoutSubjects } = form
  void _legacy
  return {
    courseName: batchName,
    batchId: form.batchId || existing?.batchId,
    batchName,
    courseId: form.courseId || existing?.courseId,
    academicCourseId: form.academicCourseId || existing?.academicCourseId,
    linkedCourseName: form.courseName || existing?.courseName || existing?.linkedCourseName,
    commencement: form.commencement,
    durationLabel: form.durationLabel,
    batchStartFrom: form.batchStartFrom,
    batchEndTo: form.batchEndTo,
    bannerUrl: form.bannerPreview || form.bannerUrl,
    bannerFileName: form.bannerFileName,
    status: form.status || 'Active',
    feeDetails: content.feeDetails,
    seo: content.seo,
    linkedSubjects: form.linkedSubjects || [],
    formData: {
      ...formWithoutSubjects,
      feeDetails: content.feeDetails,
      seo: content.seo,
    },
  }
}
