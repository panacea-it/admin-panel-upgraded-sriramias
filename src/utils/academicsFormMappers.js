import { normalizeLinkedSubjects } from './batchHelpers'
import { emptyWhyChooseFeature, normalizeWhyChooseFeatures } from './whyChooseFeatures'

const makeSlots = (count, factory) => Array.from({ length: count }, (_, i) => factory(i))

export function createEmptyCourseForm() {
  return {
    batchId: '',
    batchName: '',
    courseId: '',
    academicCourseId: '',
    courseName: '',
    category: '',
    subCategory: '',
    center: 'Delhi',
    status: 'Active',
    commencement: '',
    durationLabel: '',
    durationFrom: '',
    durationTo: '',
    batchStartFrom: '',
    batchEndTo: '',
    bannerFileName: '',
    bannerPreview: '',
    bannerUrl: '',
    linkedSubjects: [{ subjectId: '', subjectName: '' }],
    subjects: ['', ''],
    onlineFees: '',
    onlineDiscount: '',
    offlineFees: '',
    offlineDiscount: '',
    overview: '',
    keyFeatures: makeSlots(6, (i) => ({ id: `kf-${i}`, fileName: '', text: '' })),
    whyChoose: makeSlots(6, (i) => ({ id: `wc-${i}`, fileName: '', hasIcon: i > 0 })),
    whyChooseFeatures: [emptyWhyChooseFeature(1)],
    howWill: makeSlots(6, (i) => ({
      id: `hw-${i}`,
      kind: i === 0 || i === 3 ? 'video' : 'image',
      fileName: '',
      placeholder: i === 0 || i === 3 ? 'Video to be played for motion effect' : 'Image to be displayed',
    })),
  }
}

export function courseRowToForm(row) {
  if (row?.formData) {
    const merged = { ...createEmptyCourseForm(), ...row.formData }
    merged.linkedSubjects = normalizeLinkedSubjects(merged)
    merged.whyChooseFeatures = normalizeWhyChooseFeatures(merged)
    if (!merged.linkedSubjects.length) {
      merged.linkedSubjects = [{ subjectId: '', subjectName: '' }]
    }
    return merged
  }
  const price = String(row?.price || '')
  return {
    ...createEmptyCourseForm(),
    batchId: row?.batchId || '',
    batchName: row?.batchName || row?.name || '',
    courseId: row?.courseId || '',
    academicCourseId: row?.academicCourseId || row?.formData?.academicCourseId || '',
    courseName: row?.courseName || row?.name || '',
    category: row?.category || '',
    center: row?.center || 'Delhi',
    status: row?.status || 'Active',
    offlineFees: price.includes(' - ') ? price.split(' - ')[0]?.trim() : price,
    onlineFees: price.includes(' - ') ? price.split(' - ')[1]?.trim() : '',
  }
}

export function courseFormToRow(form, existing) {
  const price =
    form.offlineFees && form.onlineFees
      ? `${form.offlineFees} - ${form.onlineFees}`
      : form.offlineFees || form.onlineFees || existing?.price || '—'
  const displayName = form.batchName?.trim() || form.courseName?.trim() || existing?.name
  const linkedSubjects = normalizeLinkedSubjects(form)
  return {
    id: existing?.id ?? Date.now(),
    batchId: form.batchId || existing?.batchId,
    batchName: form.batchName?.trim() || displayName,
    name: displayName,
    courseId: form.courseId || existing?.courseId,
    academicCourseId: form.academicCourseId || existing?.academicCourseId,
    courseName: form.courseName || existing?.courseName,
    commencement: form.commencement || existing?.commencement,
    durationLabel: form.durationLabel || existing?.durationLabel,
    batchStartFrom: form.batchStartFrom || existing?.batchStartFrom,
    batchEndTo: form.batchEndTo || existing?.batchEndTo,
    bannerPreview: form.bannerPreview || existing?.bannerPreview,
    bannerFileName: form.bannerFileName || existing?.bannerFileName,
    linkedSubjects,
    category: form.category || existing?.category,
    center: form.center || existing?.center || 'Delhi',
    price,
    status: form.status || existing?.status || 'Active',
    formData: form,
  }
}

export function createEmptyFreeResourceForm() {
  return {
    category: '',
    subject: '',
    className: '',
    bookName: '',
    fileName: '',
    status: 'Active',
  }
}

export function freeResourceRowToForm(row) {
  if (row?.formData) return { ...createEmptyFreeResourceForm(), ...row.formData }
  const parts = String(row?.name || '').split(' - ')
  return {
    ...createEmptyFreeResourceForm(),
    category: row?.category || '',
    bookName: row?.name || '',
    subject: parts[0] || '',
    className: parts[1] || '',
    status: row?.status || 'Active',
  }
}

export function freeResourceFormToRow(form, existing) {
  const displayName =
    form.bookName?.trim() || `${form.subject} - ${form.className}`.trim() || existing?.name
  return {
    id: existing?.id ?? Date.now(),
    name: displayName,
    category: form.category || existing?.category,
    status: form.status || existing?.status || 'Active',
    formData: form,
  }
}

export function createEmptyCurrentAffairsForm() {
  return {
    category: '',
    name: '',
    year: '',
    month: '',
    fileName: '',
    status: 'Active',
  }
}

export function currentAffairsRowToForm(row) {
  if (row?.formData) return { ...createEmptyCurrentAffairsForm(), ...row.formData }
  return {
    ...createEmptyCurrentAffairsForm(),
    category: row?.category || '',
    name: row?.name || '',
    status: row?.status || 'Active',
  }
}

export function currentAffairsFormToRow(form, existing) {
  const displayName =
    form.name?.trim() || `${form.month} ${form.year} - ${form.category}`.trim() || existing?.name
  return {
    id: existing?.id ?? Date.now(),
    name: displayName,
    category: form.category || existing?.category,
    status: form.status || existing?.status || 'Active',
    formData: form,
  }
}

export function createEmptyBookForm() {
  return {
    bookName: '',
    thumbnail: '',
    author: '',
    description: '',
    detailImages: Array.from({ length: 3 }, () => ({ fileName: '' })),
    galleryImages: Array.from({ length: 3 }, () => ({ fileName: '' })),
    keywords: Array.from({ length: 3 }, () => ({ value: '', fileName: '' })),
    samplePdf: '',
    bookPrice: '',
    discountPct: '',
    status: 'Active',
    coupons: [{ code: '', discount: '', description: '' }],
  }
}

export function bookRowToForm(row) {
  if (row?.formData) return { ...createEmptyBookForm(), ...row.formData }
  const price = String(row?.price || '').replace(/^₹/, '').trim()
  return {
    ...createEmptyBookForm(),
    bookName: row?.name || '',
    bookPrice: price,
    status: row?.status || 'Active',
  }
}

export function bookFormToRow(form, existing) {
  const price = form.bookPrice?.trim()
    ? `₹${form.bookPrice.trim()}`
    : existing?.price || '—'
  return {
    id: existing?.id ?? Date.now(),
    name: form.bookName?.trim() || existing?.name,
    price,
    status: form.status || existing?.status || 'Active',
    formData: form,
  }
}

export function createEmptyLiveClassForm() {
  return {
    title: '',
    faculty: '',
    center: 'Delhi Center',
    scheduledAt: '',
    duration: '',
    status: 'Active',
    description: '',
    meetingLink: '',
  }
}

export function liveClassRowToForm(row) {
  if (row?.formData) return { ...createEmptyLiveClassForm(), ...row.formData }
  return {
    ...createEmptyLiveClassForm(),
    title: row?.name || '',
    faculty: row?.faculty || '',
    center: row?.center || 'Delhi Center',
    scheduledAt: row?.scheduledAt || '',
    duration: row?.duration || '',
    status: row?.status || 'Active',
    description: row?.description || '',
  }
}

export function liveClassFormToRow(form, existing) {
  return {
    id: existing?.id ?? Date.now(),
    name: form.title?.trim() || existing?.name,
    faculty: form.faculty || existing?.faculty,
    center: form.center || existing?.center,
    scheduledAt: form.scheduledAt || existing?.scheduledAt,
    duration: form.duration || existing?.duration,
    status: form.status || existing?.status || 'Active',
    description: form.description,
    formData: form,
  }
}

export function createEmptyTestForm() {
  return {
    title: '',
    type: 'Prelims',
    center: 'Delhi Center',
    totalQuestions: '',
    duration: '',
    status: 'Active',
    scheduledAt: '',
    description: '',
  }
}

export function testRowToForm(row) {
  if (row?.formData) return { ...createEmptyTestForm(), ...row.formData }
  return {
    ...createEmptyTestForm(),
    title: row?.name || '',
    type: row?.type || 'Prelims',
    center: row?.center || 'Delhi Center',
    totalQuestions: row?.totalQuestions || '',
    duration: row?.duration || '',
    status: row?.status || 'Active',
    scheduledAt: row?.scheduledAt || '',
  }
}

export function testFormToRow(form, existing) {
  return {
    id: existing?.id ?? Date.now(),
    name: form.title?.trim() || existing?.name,
    type: form.type || existing?.type,
    center: form.center || existing?.center,
    totalQuestions: form.totalQuestions || existing?.totalQuestions,
    duration: form.duration || existing?.duration,
    status: form.status || existing?.status || 'Active',
    scheduledAt: form.scheduledAt || existing?.scheduledAt,
    formData: form,
  }
}
