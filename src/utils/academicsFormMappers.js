const makeSlots = (count, factory) => Array.from({ length: count }, (_, i) => factory(i))

export function createEmptyCourseForm() {
  return {
    courseName: '',
    category: '',
    subCategory: '',
    center: 'Delhi',
    status: 'Active',
    commencement: '',
    durationFrom: '',
    durationTo: '',
    batchStartFrom: '',
    batchEndTo: '',
    bannerFileName: '',
    subjects: ['', ''],
    onlineFees: '',
    onlineDiscount: '',
    offlineFees: '',
    offlineDiscount: '',
    overview: '',
    keyFeatures: makeSlots(6, (i) => ({ id: `kf-${i}`, fileName: '', text: '' })),
    whyChoose: makeSlots(6, (i) => ({ id: `wc-${i}`, fileName: '', hasIcon: i > 0 })),
    howWill: makeSlots(6, (i) => ({
      id: `hw-${i}`,
      kind: i === 0 || i === 3 ? 'video' : 'image',
      fileName: '',
      placeholder: i === 0 || i === 3 ? 'Video to be played for motion effect' : 'Image to be displayed',
    })),
  }
}

export function courseRowToForm(row) {
  if (row?.formData) return { ...createEmptyCourseForm(), ...row.formData }
  const price = String(row?.price || '')
  return {
    ...createEmptyCourseForm(),
    courseName: row?.name || '',
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
  return {
    id: existing?.id ?? Date.now(),
    name: form.courseName?.trim() || existing?.name,
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
