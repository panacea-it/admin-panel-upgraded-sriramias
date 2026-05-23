/** Categories → Courses form state (course-level marketing content from legacy batch dialog) */

import { emptyWhyChooseFeature, normalizeWhyChooseFeatures } from './whyChooseFeatures'

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

export function createEmptyAcademicCourseContent() {
  return {
    subjects: [],
    overview: '',
    keyFeatures: createDefaultKeyFeatureSlots(),
    whyChooseFeatures: [emptyWhyChooseFeature(1)],
    howWill: createDefaultHowWillSlots(),
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

  return {
    subjects: normalizeSubjects(item.subjects),
    overview,
    keyFeatures,
    whyChooseFeatures,
    howWill,
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

export function serializeAcademicCourseContent(form) {
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

  return {
    subjects: normalizeSubjects(form.subjects).filter((s) => s.subjectName),
    overview,
    keyFeatures,
    whyChooseFeatures,
    howWill,
    courseOverview: overview,
    keyFeaturesText: legacyKeyFeatureStrings(keyFeatures),
    whyChooseCourse: legacyWhyChooseSummary(whyChooseFeatures),
    howCourseHelps: legacyHowCourseHelpsSummary(howWill),
  }
}
