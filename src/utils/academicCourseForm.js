import {
  emptyWhyChooseFeature,
  mapWhyChooseFeaturesForWebsite,
  normalizeWhyChooseFeatures,
} from './whyChooseFeatures'

/** Categories → Courses form state (course-level content, not batch) */

const makeSlots = (count, factory) => Array.from({ length: count }, (_, i) => factory(i))

export function emptySubjectRow() {
  return { subjectName: '', facultyName: '' }
}

export function createEmptyKeyFeatureSlots() {
  return makeSlots(6, (i) => ({ id: `kf-${i}`, fileName: '', text: '' }))
}

export function createEmptyHowWillSlots() {
  return makeSlots(6, (i) => ({
    id: `hw-${i}`,
    kind: i === 0 || i === 3 ? 'video' : 'image',
    fileName: '',
    placeholder:
      i === 0 || i === 3
        ? 'Video to be played for motion effect'
        : 'Image to be displayed',
  }))
}

export function createEmptyAcademicCourseContent() {
  return {
    subjects: [],
    overview: '',
    keyFeatures: createEmptyKeyFeatureSlots(),
    whyChooseFeatures: [emptyWhyChooseFeature(1)],
    howWill: createEmptyHowWillSlots(),
  }
}

export function normalizeSubjects(list) {
  const rows = (list || []).map((s) => ({
    subjectName: String(s?.subjectName || '').trim(),
    facultyName: String(s?.facultyName || '').trim(),
  }))
  return rows.length ? rows : [emptySubjectRow()]
}

function normalizeKeyFeatureSlots(list) {
  if (!list?.length) return createEmptyKeyFeatureSlots()
  if (typeof list[0] === 'string') {
    const texts = list.map((t) => String(t || '').trim()).filter(Boolean)
    const slots = createEmptyKeyFeatureSlots()
    texts.forEach((text, i) => {
      if (i < slots.length) slots[i] = { ...slots[i], text }
    })
    return slots
  }
  return list.map((slot, i) => ({
    id: slot.id || `kf-${i}`,
    fileName: slot.fileName || '',
    text: slot.text || '',
  }))
}

function tryParseWhyChooseFeatures(raw) {
  if (!raw || typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) return null
  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) return parsed
  } catch {
    /* legacy plain text */
  }
  return null
}

function deriveWhyChooseCourseText(features) {
  const normalized = normalizeWhyChooseFeatures({ whyChooseFeatures: features })
  const parts = normalized
    .map((f) => [f.title, f.description].filter(Boolean).join(': '))
    .filter(Boolean)
  return parts.join('\n\n')
}

function serializeWhyChooseForApi(features) {
  const normalized = normalizeWhyChooseFeatures({ whyChooseFeatures: features })
  const hasRich = normalized.some(
    (f) =>
      f.title ||
      f.description ||
      f.icon ||
      f.iconPreview ||
      f.isHighlighted,
  )
  if (hasRich) return JSON.stringify(normalized)
  return deriveWhyChooseCourseText(normalized)
}

function deriveHowCourseHelpsText(howWill) {
  const slots = howWill || []
  const labels = slots
    .map((s) => s.fileName || s.placeholder || '')
    .map((t) => String(t).trim())
    .filter(Boolean)
  return labels.join('\n')
}

export function academicCourseItemToContent(item) {
  if (!item) return createEmptyAcademicCourseContent()

  const stored = item.courseFormData || {}
  const overview =
    stored.overview != null ? stored.overview : item.courseOverview || ''
  const keyFeatures = normalizeKeyFeatureSlots(
    stored.keyFeatures ?? item.keyFeatures,
  )
  let whyChooseFeatures = stored.whyChooseFeatures
  if (!whyChooseFeatures?.length) {
    const parsed = tryParseWhyChooseFeatures(item.whyChooseCourse)
    if (parsed?.length) {
      whyChooseFeatures = parsed
    } else if (item.whyChooseCourse) {
      whyChooseFeatures = [
        {
          ...emptyWhyChooseFeature(1),
          description: item.whyChooseCourse,
        },
      ]
    }
  }
  const howWill =
    stored.howWill?.length > 0 ? stored.howWill : createEmptyHowWillSlots()

  return {
    subjects: normalizeSubjects(item.subjects),
    overview,
    keyFeatures,
    whyChooseFeatures: normalizeWhyChooseFeatures({
      whyChooseFeatures: whyChooseFeatures || [emptyWhyChooseFeature(1)],
    }),
    howWill: howWill.map((slot, i) => ({
      id: slot.id || `hw-${i}`,
      kind: slot.kind || 'image',
      fileName: slot.fileName || '',
      placeholder: slot.placeholder || 'Image to be displayed',
    })),
  }
}

export function buildWhyChooseTitle({ examCategory, courseName }) {
  const cat = examCategory?.trim() || 'Category'
  const name = courseName?.trim() || 'Course Name'
  return `Why Choose ${cat} ${name} Course Help You?`
}

export function buildHowHelpsTitle(courseName) {
  const name = courseName?.trim() || 'Course Name'
  return `How Will the ${name} Helps You ?`
}

/** Batch dialog had no required-field validation on marketing sections at submit. */
export function validateAcademicCourseContent() {
  return {}
}

export function serializeAcademicCourseContent(
  form,
  { examCategory = '', courseName = '' } = {},
) {
  const overview = String(form.overview || '').trim()
  const keyFeatureTexts = (form.keyFeatures || [])
    .map((s) => String(s?.text || '').trim())
    .filter(Boolean)
  const whyChooseFeatures = normalizeWhyChooseFeatures({
    whyChooseFeatures: form.whyChooseFeatures,
  })
  const howWill = form.howWill || []
  const sectionTitleWhyChoose = buildWhyChooseTitle({ examCategory, courseName })
  const sectionTitleHowHelps = buildHowHelpsTitle(courseName)

  return {
    subjects: normalizeSubjects(form.subjects).filter((s) => s.subjectName),
    overview,
    courseOverview: overview,
    keyFeatures: form.keyFeatures || [],
    whyChooseFeatures,
    howWill,
    whyChooseCourse: serializeWhyChooseForApi(whyChooseFeatures),
    howCourseHelps: deriveHowCourseHelpsText(howWill),
    sectionTitleOverview: 'Course Overview',
    sectionTitleKeyFeatures: 'Key Features Of Course',
    sectionTitleWhyChoose,
    sectionTitleHowHelps,
    sectionTitles: {
      overview: 'Course Overview',
      keyFeatures: 'Key Features Of Course',
      whyChoose: sectionTitleWhyChoose,
      howHelps: sectionTitleHowHelps,
    },
    courseFormData: {
      overview,
      keyFeatures: form.keyFeatures || [],
      whyChooseFeatures,
      howWill,
    },
  }
}

/** Student website payload from a stored academic course row */
export function mapAcademicCourseForWebsite(courseRow) {
  const content = academicCourseItemToContent(courseRow || {})
  const keyFeatureTexts = (content.keyFeatures || [])
    .map((s) => String(s?.text || '').trim())
    .filter(Boolean)
  const heroImageFileName = content.keyFeatures?.[0]?.fileName || ''

  return {
    courseOverview: content.overview || courseRow?.courseOverview || '',
    keyFeatures: keyFeatureTexts.length ? keyFeatureTexts : courseRow?.keyFeatures || [],
    keyFeatureHeroImageFileName: heroImageFileName,
    whyChooseFeatures: mapWhyChooseFeaturesForWebsite({
      whyChooseFeatures: content.whyChooseFeatures,
    }),
    howWillMedia: (content.howWill || []).filter(
      (s) => s.fileName || s.placeholder,
    ),
    howCourseHelps: courseRow?.howCourseHelps || deriveHowCourseHelpsText(content.howWill),
    sectionTitles: {
      whyChoose: buildWhyChooseTitle({
        examCategory: courseRow?.examCategory,
        courseName: courseRow?.name,
      }),
      howHelps: buildHowHelpsTitle(courseRow?.name),
    },
  }
}
