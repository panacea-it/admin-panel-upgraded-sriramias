/** Categories → Courses form state (course-level content, not batch) */

export function emptySubjectRow() {
  return { subjectName: '', facultyName: '' }
}

export function createEmptyAcademicCourseContent() {
  return {
    subjects: [],
    courseOverview: '',
    keyFeatures: [''],
    whyChooseCourse: '',
    howCourseHelps: '',
  }
}

export function normalizeSubjects(list) {
  const rows = (list || []).map((s) => ({
    subjectName: String(s?.subjectName || '').trim(),
    facultyName: String(s?.facultyName || '').trim(),
  }))
  return rows.length ? rows : [emptySubjectRow()]
}

export function normalizeKeyFeatures(list) {
  const rows = (list || []).map((t) => String(t || '').trim()).filter(Boolean)
  return rows.length ? rows : ['']
}

export function academicCourseItemToContent(item) {
  if (!item) return createEmptyAcademicCourseContent()
  return {
    subjects: normalizeSubjects(item.subjects),
    courseOverview: item.courseOverview || '',
    keyFeatures: normalizeKeyFeatures(item.keyFeatures),
    whyChooseCourse: item.whyChooseCourse || '',
    howCourseHelps: item.howCourseHelps || '',
  }
}

export function buildWhyChooseTitle({ examCategory, courseName }) {
  const cat = examCategory?.trim() || 'Category'
  const name = courseName?.trim() || 'Course Name'
  return `Why Choose ${cat} ${name} Course Help You?`
}

export function buildHowHelpsTitle(courseName) {
  const name = courseName?.trim() || 'Course Name'
  return `How Will the ${name} Helps You?`
}

export function validateAcademicCourseContent(form, { courseName } = {}) {
  const errors = {}

  const overview = String(form.courseOverview || '').trim()
  if (overview.length < 100) {
    errors.courseOverview = `Overview must be at least 100 characters (${overview.length}/100)`
  }

  const features = normalizeKeyFeatures(form.keyFeatures)
  if (!features.length) {
    errors.keyFeatures = 'Add at least one key feature'
  }

  if (!String(form.whyChooseCourse || '').trim()) {
    errors.whyChooseCourse = 'This section is required'
  }
  if (!String(form.howCourseHelps || '').trim()) {
    errors.howCourseHelps = 'This section is required'
  }

  void courseName
  return errors
}

export function serializeAcademicCourseContent(form) {
  return {
    subjects: normalizeSubjects(form.subjects).filter((s) => s.subjectName),
    courseOverview: String(form.courseOverview || '').trim(),
    keyFeatures: normalizeKeyFeatures(form.keyFeatures),
    whyChooseCourse: String(form.whyChooseCourse || '').trim(),
    howCourseHelps: String(form.howCourseHelps || '').trim(),
  }
}
