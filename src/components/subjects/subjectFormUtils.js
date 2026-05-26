import {
  formatDurationFromForm,
  nextLiveClassId,
  nextRecordingId,
  nextSubjectRowId,
} from '../../utils/academicsSubjectsStorage'
import { findClassroomById } from '../../utils/classroomsStorage'
import { durationFromHms, minutesToTimeString, timePartsToMinutes } from '../../utils/classroomTime'
import { findClassroomConflict } from '../../utils/classroomBookings'
import {
  createRecurrenceFromSubjectForm,
  validateSubjectRecurrence,
} from '../../utils/academicsSubjectsRecurrence'
import { createDefaultRecurrenceRule } from '../../utils/recurrenceEngine'
import {
  createEmptyTestSeriesBlock,
  normalizeTestSeriesBlock,
  serializeTestSeriesForStorage,
  validateTestSeriesForm,
} from '../../utils/batchTestSeriesForm'
import { validateTestSeriesQuestions } from '../../utils/testSeriesQuestionSlots'
import {
  isLiveClassCategory,
  isRecordedClassCategory,
  isTestSeriesCategory,
  normalizeCategories,
  normalizeTopics,
  shouldShowTestSeriesSection,
} from '../../utils/subjectCategoryHelpers'

export { shouldShowTestSeriesSection }

export const EMPTY_SUBJECT_FORM = {
  subjectName: '',
  subject: '',
  topics: [],
  categories: ['Live Class'],
  teacher: '',
  batch: '',
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
  recordingLessonName: '',
  recordingCenter: '',
  recordingTopic: '',
  recordingTeacher: '',
  recordingVideoFileName: '',
  recordingVideoDuration: '',
  recordingDescription: '',
  recordingVisibility: 'Published',
  recordingDownloadable: false,
  testSeries: createEmptyTestSeriesBlock(),
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

function categoriesFromSubject(subject, liveClass) {
  const fromSubject = normalizeCategories(subject?.categories ?? subject?.category)
  if (fromSubject.length) return fromSubject
  if (liveClass) return ['Live Class']
  return []
}

export function subjectToForm(subject, liveClass = null) {
  if (!subject && !liveClass) return { ...EMPTY_SUBJECT_FORM }
  const time = parseTimeToFormParts(liveClass?.startTime || liveClass?.scheduledTime)
  const recording = subject?.recordings?.[0]
  const topics = normalizeTopics(subject?.topics ?? subject?.topic)
  const categories = categoriesFromSubject(subject, liveClass)

  return {
    subjectName: subject?.subjectName || '',
    subject: subject?.subjectName || subject?.subject || '',
    topics,
    categories: categories.length ? categories : ['Live Class'],
    teacher: subject?.teacher || '',
    batch: subject?.batch || '',
    classTitle: liveClass?.classTitle || '',
    center: liveClass?.center || '',
    classroomId: liveClass?.classroomId || '',
    classRoom: liveClass?.classroom || liveClass?.classRoom || '',
    date: liveClass?.date || '',
    timeHrs: liveClass?.timeHrs || time.hrs,
    timeMin: liveClass?.timeMin || time.min,
    timeSec: liveClass?.timeSec || time.sec,
    durationHrs: liveClass?.durationHrs || '00',
    durationMin: liveClass?.durationMin || '00',
    durationSec: liveClass?.durationSec || '00',
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
    recordingLessonName: recording?.lessonName || '',
    recordingCenter: recording?.center || '',
    recordingTopic: recording?.topic || topics[0] || '',
    recordingTeacher: recording?.teacher || subject?.teacher || '',
    recordingVideoFileName: recording?.videoFileName || '',
    recordingVideoDuration: recording?.videoDuration || '',
    recordingDescription: recording?.description || '',
    recordingVisibility: recording?.visibility || 'Published',
    recordingDownloadable: Boolean(recording?.downloadable),
    testSeries: subject?.testSeries
      ? normalizeTestSeriesBlock(subject.testSeries)
      : createEmptyTestSeriesBlock(),
  }
}

export function buildSubjectFromForm(form, existing, subjectsList) {
  const id = existing?.id || nextSubjectRowId(subjectsList)
  const now = new Date().toISOString()
  const topics = normalizeTopics(form.topics)
  const categories = normalizeCategories(form.categories)
  const hasTestSeries = isTestSeriesCategory(categories)

  return {
    id,
    subjectName: form.subjectName?.trim() || form.subject?.trim() || 'Untitled',
    topic: topics[0] || '',
    topics,
    categories,
    category: categories[0] || '',
    teacher: form.teacher?.trim() || '',
    batch: form.batch?.trim() || '',
    status: form.status || 'Active',
    createdAt: existing?.createdAt || now,
    modifiedAt: now,
    liveClasses: existing?.liveClasses || [],
    recordings: existing?.recordings || [],
    enableTestSeries: hasTestSeries,
    testSeries: hasTestSeries
      ? serializeTestSeriesForStorage(form.testSeries || createEmptyTestSeriesBlock())
      : null,
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
    linkedLessonId: existingLiveClass?.linkedLessonId ?? null,
    calendarPayload: null,
  }
}

export function buildRecordingFromForm(form, existingRecording, subject) {
  const list = subject?.recordings || []
  const id = existingRecording?.id || nextRecordingId(list)
  const topics = normalizeTopics(form.topics)
  return {
    id,
    lessonName: form.recordingLessonName?.trim() || form.subjectName?.trim() || 'Untitled Recording',
    center: form.recordingCenter?.trim() || '',
    topic: form.recordingTopic?.trim() || topics[0] || '',
    teacher: form.recordingTeacher?.trim() || form.teacher?.trim() || '',
    videoFileName: form.recordingVideoFileName || '',
    videoDuration: form.recordingVideoDuration || '',
    description: form.recordingDescription?.trim() || '',
    visibility: form.recordingVisibility || 'Published',
    downloadable: Boolean(form.recordingDownloadable),
    status: form.recordingVisibility === 'Draft' ? 'Draft' : 'Active',
    linkedLessonId: existingRecording?.linkedLessonId ?? null,
    createdAt: existingRecording?.createdAt || new Date().toISOString(),
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
  return isLiveClassCategory(values.categories ?? values.category)
}

export function shouldShowRecordingSection(values, { liveClassOnly = false } = {}) {
  if (liveClassOnly) return false
  return isRecordedClassCategory(values.categories ?? values.category)
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
  const categories = normalizeCategories(values.categories ?? values.category)

  if (!liveClassOnly) {
    if (!values.subjectName?.trim()) errors.subjectName = 'Subject name is required'
    if (!values.subject?.trim()) errors.subject = 'Subject is required'
    if (!values.teacher?.trim()) errors.teacher = 'Teacher is required'
    if (!categories.length) errors.categories = 'Select at least one category'
  }

  const needsLiveClass =
    requireLiveClass ||
    liveClassOnly ||
    isLiveClassCategory(categories) ||
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
      validateSubjectRecurrence({ ...values, categories }, {
        allSubjects,
        subjectId,
        excludeIds: excludeLessonIds,
      }),
    )
  }

  const needsRecording =
    isRecordedClassCategory(categories) ||
    Boolean(
      values.recordingLessonName?.trim() ||
        values.recordingCenter?.trim() ||
        values.recordingVideoFileName,
    )

  if (needsRecording && !liveClassOnly) {
    if (!values.recordingLessonName?.trim()) {
      errors.recordingLessonName = 'Lesson name is required'
    }
    if (!values.recordingCenter?.trim()) {
      errors.recordingCenter = 'Center is required'
    }
    if (!values.recordingTopic?.trim()) {
      errors.recordingTopic = 'Topic is required'
    }
    if (!values.recordingTeacher?.trim()) {
      errors.recordingTeacher = 'Teacher is required'
    }
    if (!values.recordingVideoFileName?.trim()) {
      errors.recordingVideoFileName = 'Upload a recording video'
    }
  }

  if (isTestSeriesCategory(categories) && !liveClassOnly) {
    const ts = normalizeTestSeriesBlock(values.testSeries || {})
    Object.assign(errors, validateTestSeriesForm(ts))
    Object.assign(errors, validateTestSeriesQuestions(ts))
  }

  return errors
}
