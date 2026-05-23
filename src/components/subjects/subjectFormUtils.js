import {
  formatDurationFromForm,
  nextLiveClassId,
  nextSubjectRowId,
} from '../../utils/academicsSubjectsStorage'
import { findClassroomById } from '../../utils/classroomsStorage'
import { durationFromHms, minutesToTimeString, timePartsToMinutes } from '../../utils/classroomTime'
import { findClassroomConflict } from '../../utils/classroomBookings'
import {
  createRecurrenceFromSubjectForm,
  isLiveClassCategory,
  validateSubjectRecurrence,
} from '../../utils/academicsSubjectsRecurrence'
import { createDefaultRecurrenceRule } from '../../utils/recurrenceEngine'

export const EMPTY_SUBJECT_FORM = {
  subjectName: '',
  subject: '',
  topic: '',
  teacher: '',
  category: 'Live Class',
  classTitle: '',
  center: '',
  classroomId: '',
  classRoom: '',
  date: '',
  timeHrs: '00',
  timeMin: '00',
  timeSec: '00',
  durationHrs: '00',
  durationMin: '00',
  durationSec: '00',
  status: 'Active',
  recurring: false,
  recurrence: null,
  recurrenceEditScope: 'series',
  timezone: 'Asia/Kolkata',
}

function parseTimeToFormParts(timeStr) {
  if (!timeStr) return { hrs: '00', min: '00', sec: '00' }
  const parts = String(timeStr).split(':').map((x) => parseInt(x, 10) || 0)
  return {
    hrs: String(parts[0] ?? 0).padStart(2, '0'),
    min: String(parts[1] ?? 0).padStart(2, '0'),
    sec: String(parts[2] ?? 0).padStart(2, '0'),
  }
}

export function subjectToForm(subject, liveClass = null) {
  if (!subject && !liveClass) return { ...EMPTY_SUBJECT_FORM }
  const time = parseTimeToFormParts(liveClass?.startTime || liveClass?.scheduledTime)
  return {
    subjectName: subject?.subjectName || '',
    subject: subject?.subjectName || subject?.subject || '',
    topic: subject?.topic || '',
    teacher: subject?.teacher || '',
    category: 'Live Class',
    classTitle: liveClass?.classTitle || '',
    center: liveClass?.center || '',
    classroomId: liveClass?.classroomId || '',
    classRoom: liveClass?.classroom || liveClass?.classRoom || '',
    date: liveClass?.date || '',
    timeHrs: liveClass?.timeHrs || time.hrs,
    timeMin: liveClass?.timeMin || time.min,
    timeSec: liveClass?.timeSec || time.sec,
    durationHrs: '00',
    durationMin: '00',
    durationSec: '00',
    status: liveClass?.status || subject?.status || 'Active',
    recurring: Boolean(liveClass?.recurring),
    recurrence: liveClass?.recurrence
      ? { ...liveClass.recurrence }
      : liveClass?.recurring
        ? createDefaultRecurrenceRule({
            scheduledDate: liveClass?.date || '',
            timezone: liveClass?.recurrence?.timezone || 'Asia/Kolkata',
          })
        : null,
    recurrenceEditScope: 'series',
    timezone: liveClass?.recurrence?.timezone || 'Asia/Kolkata',
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
  const classroom = findClassroomById(form.classroomId)
  const startTime = minutesToTimeString(
    timePartsToMinutes(form.timeHrs, form.timeMin, form.timeSec),
  )
  const durationMinutes = durationFromHms(
    form.durationHrs,
    form.durationMin,
    form.durationSec,
  )
  return {
    id,
    classTitle: form.classTitle?.trim() || 'Untitled Class',
    center: form.center?.trim() || '',
    classroomId: form.classroomId || '',
    classroom: classroom?.name || form.classRoom?.trim() || '',
    classRoom: classroom?.name || form.classRoom?.trim() || '',
    date: form.date || '',
    startTime,
    scheduledTime: startTime,
    durationMinutes,
    timeHrs: form.timeHrs,
    timeMin: form.timeMin,
    timeSec: form.timeSec,
    durationHrs: form.durationHrs,
    durationMin: form.durationMin,
    durationSec: form.durationSec,
    duration: formatDurationFromForm(
      form.durationHrs,
      form.durationMin,
      form.durationSec,
    ),
    status: form.status || 'Active',
    recurring: Boolean(form.recurring),
    recurrence: form.recurring && form.recurrence?.enabled ? form.recurrence : null,
    recurrenceSeriesId: existingLiveClass?.recurrenceSeriesId ?? null,
    recurrenceParentId: existingLiveClass?.recurrenceParentId ?? null,
    isRecurrenceParent: false,
    isRecurrenceOccurrence: Boolean(form.recurring),
    occurrenceIndex: existingLiveClass?.occurrenceIndex ?? null,
    occurrenceCount: existingLiveClass?.occurrenceCount ?? null,
    calendarPayload: null,
  }
}

export function clampTimeField(value, max = 59) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 2)
  if (digits === '') return ''
  const n = Math.min(max, parseInt(digits, 10))
  return String(n).padStart(2, '0')
}

export function shouldShowLiveClassSection(values, { liveClassOnly = false } = {}) {
  if (liveClassOnly) return true
  return isLiveClassCategory(values.category)
}

export function validateSubjectForm(
  values,
  {
    liveClassOnly = false,
    requireLiveClass = false,
    allSubjects = [],
    subjectId = '',
    excludeLessonIds = [],
  } = {},
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
    isLiveClassCategory(values.category) ||
    Boolean(values.classTitle?.trim() || values.center?.trim() || values.date?.trim())
  if (needsLiveClass) {
    if (!values.classTitle?.trim()) errors.classTitle = 'Class title is required'
    if (!values.center?.trim()) errors.center = 'Center is required'
    if (!values.classroomId?.trim()) errors.classRoom = 'Classroom is required'
    if (!values.date?.trim()) errors.date = 'Date is required'
    const startTime = minutesToTimeString(
      timePartsToMinutes(values.timeHrs, values.timeMin, values.timeSec),
    )
    const durationMinutes = durationFromHms(
      values.durationHrs,
      values.durationMin,
      values.durationSec,
    )
    if (values.classroomId && values.date && startTime) {
      const conflict = findClassroomConflict({
        classroomId: values.classroomId,
        date: values.date,
        startTime,
        durationMinutes,
        excludeSourceIds: values._excludeSourceIds || [],
      })
      if (conflict) {
        errors.classRoom =
          'This classroom is already occupied during the selected time.'
      }
    }
    Object.assign(
      errors,
      validateSubjectRecurrence(values, {
        allSubjects,
        subjectId,
        excludeIds: excludeLessonIds,
      }),
    )
  }
  return errors
}
