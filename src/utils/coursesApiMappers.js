import { courseFormToRow } from './academicsFormMappers'

/** MongoDB document → table row shape used by CoursesPage */
export function mapCourseFromApi(doc) {
  if (!doc) return null
  const id = doc._id ?? doc.id
  return {
    id,
    name: doc.courseName,
    category: doc.category,
    center: doc.center,
    price: doc.price,
    status: doc.status,
    formData: doc.formData ?? null,
    createdAt: doc.createdAt,
  }
}

/** Modal form → API request body */
export function mapCourseToApiPayload(form, existing) {
  const row = courseFormToRow(form, existing)
  return {
    courseName: row.name,
    category: row.category,
    center: row.center,
    price: row.price,
    status: row.status,
    formData: form,
  }
}
