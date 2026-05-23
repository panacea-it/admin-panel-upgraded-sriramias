/** Categories → Courses form state (course-level marketing content from legacy batch dialog) */

import {
  emptyWhyChooseFeature,
  mapWhyChooseFeaturesForWebsite,
  normalizeWhyChooseFeatures,
} from './whyChooseFeatures'

const makeSlots = (count, factory) => Array.from({ length: count }, (_, i) => factory(i))

export function emptySubjectRow() {
  return { subjectName: '', facultyName: '' }
}

export function createDefaultKeyFeatureSlots() {
  return makeSlots(6, (i) => ({ id: `kf-${i}`, fileName: '', text: '' }))
}

export function createDefaultHowWillSlots() {
  return makeSlots(6, (i) => ({
    id: `hw-${i}`,
    kind: i === 0 || i === 3 ? 'video' : 'image',
    fileName: '',
    placeholder:
      i === 0 || i === 3 ? 'Video to be played for motion effect' : 'Image to be displayed',
  }))
}

export const DEFAULT_SECTION_TITLE_OVERVIEW = 'Course Overview'
export const DEFAULT_SECTION_TITLE_KEY_FEATURES = 'Key Features Of Course'

export function buildDefaultSectionTitles({ examCategory = '', courseName = '' } = {}) {
  return {
    sectionTitleOverview: DEFAULT_SECTION_TITLE_OVERVIEW,
    sectionTitleKeyFeatures: DEFAULT_SECTION_TITLE_KEY_FEATURES,
    sectionTitleWhyChoose: buildWhyChooseTitle({ examCategory, courseName }),
    sectionTitleHowHelps: buildHowHelpsTitle(courseName),
  }
}

export function createEmptyAcademicCourseContent(meta = {}) {
  return {
    subjects: [],
    overview: '',
    keyFeatures: createDefaultKeyFeatureSlots(),
    whyChooseFeatures: [emptyWhyChooseFeature(1)],
    howWill: createDefaultHowWillSlots(),
    ...buildDefaultSectionTitles(meta),
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
  if (!list?.length) return createDefaultKeyFeatureSlots()
  if (typeof list[0] === 'object' && (list[0].id != null || list[0].text != null || list[0].fileName != null)) {
    return list.map((slot, i) => ({
      id: slot.id || `kf-${i}`,
      fileName: slot.fileName || '',
      text: slot.text || '',
      preview: slot.preview || '',
    }))
  }
  const slots = createDefaultKeyFeatureSlots()
  list.forEach((entry, i) => {
    const text = String(entry || '').trim()
    if (!text) return
    const targetIndex = i + 1
    if (targetIndex < slots.length) {
      slots[targetIndex] = { ...slots[targetIndex], text }
    } else {
      slots.push({
        id: `kf-mig-${targetIndex}`,
        fileName: '',
        text,
      })
    }
  })
  return slots
}

export function academicCourseItemToContent(item) {
  if (!item) return createEmptyAcademicCourseContent()

  const overview = item.overview ?? item.courseOverview ?? ''
  const keyFeatures = normalizeKeyFeatureSlots(item.keyFeatures)
  const whyChooseFeatures = normalizeWhyChooseFeatures({
    whyChooseFeatures: item.whyChooseFeatures,
    whyChoose: item.whyChoose,
  })

  if (item.whyChooseCourse && !whyChooseFeatures.some((f) => f.description?.trim())) {
    whyChooseFeatures[0] = {
      ...whyChooseFeatures[0],
      description: item.whyChooseCourse,
    }
  }

  let howWill = item.howWill
  if (!howWill?.length && item.howCourseHelps) {
    howWill = createDefaultHowWillSlots()
    howWill[0] = {
      ...howWill[0],
      fileName: item.howCourseHelps,
      placeholder: 'Image to be displayed',
    }
  } else if (!howWill?.length) {
    howWill = createDefaultHowWillSlots()
  } else {
    howWill = howWill.map((slot, i) => ({
      id: slot.id || `hw-${i}`,
      kind: slot.kind || (i === 0 || i === 3 ? 'video' : 'image'),
      fileName: slot.fileName || '',
      placeholder:
        slot.placeholder ||
        (slot.kind === 'video' ? 'Video to be played for motion effect' : 'Image to be displayed'),
      preview: slot.preview || '',
    }))
  }

  const defaults = buildDefaultSectionTitles({
    examCategory: item.examCategory,
    courseName: item.name,
  })

  return {
    subjects: normalizeSubjects(item.subjects),
    overview,
    keyFeatures,
    whyChooseFeatures,
    howWill,
    sectionTitleOverview:
      item.sectionTitleOverview?.trim() || defaults.sectionTitleOverview,
    sectionTitleKeyFeatures:
      item.sectionTitleKeyFeatures?.trim() || defaults.sectionTitleKeyFeatures,
    sectionTitleWhyChoose:
      item.sectionTitleWhyChoose?.trim() || defaults.sectionTitleWhyChoose,
    sectionTitleHowHelps:
      item.sectionTitleHowHelps?.trim() || defaults.sectionTitleHowHelps,
  }
}

/** Resolved headings for admin view modal and student website */
/** Payload for student website course detail sections */
export function mapCourseMarketingForWebsite(course = {}) {
  const content = academicCourseItemToContent(course)
  const sectionTitles = getCourseMarketingSectionTitles(course)

  return {
    sectionTitles,
    overview: content.overview,
    keyFeatures: content.keyFeatures,
    whyChooseFeatures: mapWhyChooseFeaturesForWebsite({
      whyChooseFeatures: content.whyChooseFeatures,
    }),
    howWill: content.howWill,
  }
}

export function getCourseMarketingSectionTitles(course = {}, meta = {}) {
  const examCategory =
    meta.examCategory ?? course.examCategory?.split(' - ').pop() ?? course.examCategory ?? ''
  const courseName = meta.courseName ?? course.name ?? course.courseName ?? ''
  const defaults = buildDefaultSectionTitles({ examCategory, courseName })

  return {
    overview:
      course.sectionTitleOverview?.trim() ||
      defaults.sectionTitleOverview,
    keyFeatures:
      course.sectionTitleKeyFeatures?.trim() ||
      defaults.sectionTitleKeyFeatures,
    whyChoose:
      course.sectionTitleWhyChoose?.trim() ||
      defaults.sectionTitleWhyChoose,
    howHelps:
      course.sectionTitleHowHelps?.trim() ||
      defaults.sectionTitleHowHelps,
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

export function validateAcademicCourseContent() {
  return {}
}

function legacyKeyFeatureStrings(slots) {
  return (slots || [])
    .slice(1)
    .map((s) => String(s?.text || '').trim())
    .filter(Boolean)
}

function legacyWhyChooseSummary(features) {
  return normalizeWhyChooseFeatures({ whyChooseFeatures: features })
    .map((f) => [f.title, f.description].filter(Boolean).join(': '))
    .filter(Boolean)
    .join('\n\n')
}

function legacyHowCourseHelpsSummary(slots) {
  return (slots || [])
    .map((s) => s.fileName || s.preview)
    .filter(Boolean)
    .join(', ')
}

export function serializeAcademicCourseContent(form, meta = {}) {
  const overview = String(form.overview ?? form.courseOverview ?? '').trim()
  const keyFeatures = normalizeKeyFeatureSlots(form.keyFeatures)
  const whyChooseFeatures = normalizeWhyChooseFeatures(form)
  const howWill = (form.howWill || createDefaultHowWillSlots()).map((slot, i) => ({
    id: slot.id || `hw-${i}`,
    kind: slot.kind || 'image',
    fileName: slot.fileName || '',
    placeholder: slot.placeholder || 'Image to be displayed',
    preview: slot.preview || '',
  }))

  const titles = getCourseMarketingSectionTitles(form, {
    examCategory: meta.examCategory ?? form.examCategory,
    courseName: meta.courseName ?? form.name ?? form.courseName,
  })

  return {
    subjects: normalizeSubjects(form.subjects).filter((s) => s.subjectName),
    overview,
    keyFeatures,
    whyChooseFeatures,
    howWill,
    sectionTitleOverview: String(
      form.sectionTitleOverview ?? titles.overview,
    ).trim(),
    sectionTitleKeyFeatures: String(
      form.sectionTitleKeyFeatures ?? titles.keyFeatures,
    ).trim(),
    sectionTitleWhyChoose: String(
      form.sectionTitleWhyChoose ?? titles.whyChoose,
    ).trim(),
    sectionTitleHowHelps: String(
      form.sectionTitleHowHelps ?? titles.howHelps,
    ).trim(),
    courseOverview: overview,
    keyFeaturesText: legacyKeyFeatureStrings(keyFeatures),
    whyChooseCourse: legacyWhyChooseSummary(whyChooseFeatures),
    howCourseHelps: legacyHowCourseHelpsSummary(howWill),
    sectionTitles: titles,
  }
}
