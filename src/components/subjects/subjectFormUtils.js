import {
  formatDurationFromForm,
  nextLiveClassId,
  nextSubjectRowId,
} from '../../utils/academicsSubjectsStorage'

export const EMPTY_SUBJECT_FORM = {
  subjectName: '',
  subject: '',
  topic: '',
  teacher: '',
  category: 'Live Class',
  classTitle: '',
  center: '',
  classRoom: '',
  date: '',
  timeHrs: '00',
  timeMin: '00',
  timeSec: '00',
  durationHrs: '00',
  durationMin: '00',
  durationSec: '00',
  status: 'Active',
}

export function subjectToForm(subject, liveClass = null) {
  if (!subject && !liveClass) return { ...EMPTY_SUBJECT_FORM }
  return {
    subjectName: subject?.subjectName || '',
    subject: subject?.subjectName || subject?.subject || '',
    topic: subject?.topic || '',
    teacher: subject?.teacher || '',
    category: 'Live Class',
    classTitle: liveClass?.classTitle || '',
    center: liveClass?.center || '',
    classRoom: liveClass?.classroom || liveClass?.classRoom || '',
    date: liveClass?.date || '',
    timeHrs: '00',
    timeMin: '00',
    timeSec: '00',
    durationHrs: '00',
    durationMin: '00',
    durationSec: '00',
    status: liveClass?.status || subject?.status || 'Active',
  }
}

export function buildSubjectFromForm(form, existing, subjectsList) {
  const id = existing?.id || nextSubjectRowId(subjectsList)
  return {
    id,
    subjectName: form.subjectName?.trim() || form.subject?.trim() || 'Untitled',
    topic: form.topic?.trim() || '',
    teacher: form.teacher?.trim() || '',
    status: form.status || 'Active',
    liveClasses: existing?.liveClasses || [],
  }
}

export function buildLiveClassFromForm(form, existingLiveClass, subject) {
  const list = subject?.liveClasses || []
  const id = existingLiveClass?.id || nextLiveClassId(list)
  return {
    id,
    classTitle: form.classTitle?.trim() || 'Untitled Class',
    center: form.center?.trim() || '',
    classroom: form.classRoom?.trim() || '',
    date: form.date || '',
    duration: formatDurationFromForm(
      form.durationHrs,
      form.durationMin,
      form.durationSec,
    ),
    status: form.status || 'Active',
  }
}

export function clampTimeField(value, max = 59) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 2)
  if (digits === '') return ''
  const n = Math.min(max, parseInt(digits, 10))
  return String(n).padStart(2, '0')
}

export function validateSubjectForm(
  values,
  { liveClassOnly = false, requireLiveClass = false } = {},
) {
  const errors = {}
  if (!liveClassOnly) {
    if (!values.subjectName?.trim()) errors.subjectName = 'Subject name is required'
    if (!values.subject?.trim()) errors.subject = 'Subject is required'
    if (!values.teacher?.trim()) errors.teacher = 'Teacher is required'
  }
  const needsLiveClass =
    requireLiveClass ||
    liveClassOnly ||
    Boolean(values.classTitle?.trim() || values.center?.trim() || values.date?.trim())
  if (needsLiveClass) {
    if (!values.classTitle?.trim()) errors.classTitle = 'Class title is required'
    if (!values.center?.trim()) errors.center = 'Center is required'
    if (!values.classRoom?.trim()) errors.classRoom = 'Class room is required'
    if (!values.date?.trim()) errors.date = 'Date is required'
  }
  return errors
}
