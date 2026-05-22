/** Categories → Courses form state (course-level content, not batch) */

export const COURSE_CURRENCIES = [
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
]

export function emptySubjectRow() {
  return { subjectName: '', facultyName: '' }
}

export function createEmptyAcademicCourseContent() {
  return {
    subjects: [emptySubjectRow()],
    feeDetails: {
      courseFee: '',
      discountFee: '',
      installmentAvailable: false,
      currency: 'INR',
    },
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
    feeDetails: {
      courseFee: item.feeDetails?.courseFee ?? '',
      discountFee: item.feeDetails?.discountFee ?? '',
      installmentAvailable: Boolean(item.feeDetails?.installmentAvailable),
      currency: item.feeDetails?.currency || 'INR',
    },
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
  const subjects = normalizeSubjects(form.subjects).filter((s) => s.subjectName)
  if (!subjects.length) {
    errors.subjects = 'Add at least one subject with a name'
  }

  const fee = form.feeDetails || {}
  if (fee.courseFee === '' || fee.courseFee == null) {
    errors.courseFee = 'Course fee is required'
  } else if (Number(fee.courseFee) < 0) {
    errors.courseFee = 'Enter a valid fee amount'
  }

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
    feeDetails: {
      courseFee: Number(form.feeDetails?.courseFee) || 0,
      discountFee: Number(form.feeDetails?.discountFee) || 0,
      installmentAvailable: Boolean(form.feeDetails?.installmentAvailable),
      currency: form.feeDetails?.currency || 'INR',
    },
    courseOverview: String(form.courseOverview || '').trim(),
    keyFeatures: normalizeKeyFeatures(form.keyFeatures),
    whyChooseCourse: String(form.whyChooseCourse || '').trim(),
    howCourseHelps: String(form.howCourseHelps || '').trim(),
  }
}
