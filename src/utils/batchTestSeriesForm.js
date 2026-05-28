/** Test Series data for Faculty Subjects (and legacy batch payloads) */

export const BATCH_TEST_TYPES = [
  'Prelims',
  'Mains',
  'CSAT',
  'Mock Test',
  'Sectional Test',
  'Practice Test',
  'Custom Test',
]

export const BATCH_DURATION_PRESETS = [
  { value: '30', label: '30 mins' },
  { value: '60', label: '60 mins' },
  { value: '90', label: '90 mins' },
  { value: '120', label: '120 mins' },
  { value: '180', label: '180 mins' },
  { value: 'custom', label: 'Custom' },
]

export const MAX_BULK_FILE_BYTES = 25 * 1024 * 1024
export const MAX_BULK_FILES = 20
export const QUESTION_LIST_RENDER_CHUNK = 25

export const BULK_UPLOAD_ACCEPT =
  '.pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/plain,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation'

export function createEmptyQuestionDraft() {
  return {
    questionNo: '',
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    answer: '',
  }
}

export function createEmptyTestSeriesBlock() {
  return {
    details: createEmptyTestSeriesDetails(),
    schedule: { date: '', time: '' },
    resultSettings: { resultDate: '', rankingEnabled: true },
    questions: [],
    uploadedFiles: [],
    questionCount: 0,
  }
}

export function createEmptyTestSeriesDetails() {
  return {
    testName: '',
    testType: '',
    mode: 'prelims',
    durationMinutes: '60',
    durationCustom: '',
    totalMarks: '',
    marksPerCorrectAnswer: '',
    negativeMarkingEnabled: false,
    negativeMarkPerQuestion: '',
    instructions: '',
    manualQuestions: '',
    pdfFileName: '',
  }
}

export function normalizeTestSeriesQuestion(raw = {}, index = 0) {
  const options = Array.isArray(raw.options)
    ? raw.options.map((o) => String(o || '').trim()).slice(0, 4)
    : [raw.option1, raw.option2, raw.option3, raw.option4].map((o) =>
        String(o || '').trim(),
      )

  while (options.length < 4) options.push('')

  const questionNo = parseInt(String(raw.questionNo ?? index + 1), 10) || index + 1

  return {
    id: raw.id || `q-${questionNo}-${Date.now()}-${index}`,
    questionNo,
    question: String(raw.question || '').trim(),
    options,
    answer: String(raw.answer || '').trim(),
  }
}

/** Flatten nested API shape + legacy flat fields into one UI model. */
export function flattenTestSeriesBlock(raw = {}) {
  const details = raw.details || {}
  const schedule = raw.schedule || {}
  const resultSettings = raw.resultSettings || {}

  return {
    testName: details.testName ?? raw.testName ?? '',
    testType: details.testType ?? raw.testType ?? '',
    mode: details.mode ?? raw.mode ?? 'prelims',
    durationMinutes: details.durationMinutes ?? raw.durationMinutes ?? '60',
    durationCustom: details.durationCustom ?? raw.durationCustom ?? '',
    totalMarks: details.totalMarks ?? raw.totalMarks ?? '',
    marksPerCorrectAnswer:
      details.marksPerCorrectAnswer ?? raw.marksPerCorrectAnswer ?? '',
    negativeMarkingEnabled:
      details.negativeMarkingEnabled ?? raw.negativeMarkingEnabled ?? false,
    negativeMarkPerQuestion:
      details.negativeMarkPerQuestion ?? raw.negativeMarkPerQuestion ?? '',
    instructions: details.instructions ?? raw.instructions ?? '',
    manualQuestions: details.manualQuestions ?? raw.manualQuestions ?? '',
    pdfFileName: details.pdfFileName ?? raw.pdfFileName ?? '',
    scheduleDate: schedule.date ?? raw.scheduleDate ?? '',
    scheduleTime: schedule.time ?? raw.scheduleTime ?? '',
    resultDate: resultSettings.resultDate ?? raw.resultDate ?? '',
    rankingEnabled:
      resultSettings.rankingEnabled !== undefined
        ? Boolean(resultSettings.rankingEnabled)
        : raw.rankingEnabled !== undefined
          ? Boolean(raw.rankingEnabled)
          : true,
    questionCount: raw.questionCount ?? 0,
    questions: raw.questions ?? [],
    uploadFiles: raw.uploadedFiles ?? raw.uploadFiles ?? [],
  }
}

export function normalizeTestSeriesBlock(raw = {}) {
  const flat = flattenTestSeriesBlock(raw)

  const questions = Array.isArray(flat.questions)
    ? flat.questions.map((q, i) => normalizeTestSeriesQuestion(q, i))
    : []

  const seen = new Set()
  const deduped = questions.filter((q) => {
    const key = String(q.questionNo)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return {
    details: {
      testName: String(flat.testName || '').trim(),
      testType: String(flat.testType || '').trim(),
      mode:
        String(flat.mode || '').trim() === 'mainsAnswerWriting'
          ? 'mainsAnswerWriting'
          : 'prelims',
      durationMinutes: String(flat.durationMinutes || '60'),
      durationCustom: String(flat.durationCustom || '').trim(),
      totalMarks:
        flat.totalMarks === '' || flat.totalMarks == null ? '' : String(flat.totalMarks),
      marksPerCorrectAnswer:
        flat.marksPerCorrectAnswer === '' || flat.marksPerCorrectAnswer == null
          ? ''
          : String(flat.marksPerCorrectAnswer),
      negativeMarkingEnabled: Boolean(flat.negativeMarkingEnabled),
      negativeMarkPerQuestion:
        flat.negativeMarkPerQuestion === '' || flat.negativeMarkPerQuestion == null
          ? ''
          : String(flat.negativeMarkPerQuestion),
      instructions: String(flat.instructions || '').trim(),
      manualQuestions: String(flat.manualQuestions || ''),
      pdfFileName: String(flat.pdfFileName || '').trim(),
    },
    schedule: {
      date: String(flat.scheduleDate || '').trim(),
      time: String(flat.scheduleTime || '').trim(),
    },
    resultSettings: {
      resultDate: String(flat.resultDate || '').trim(),
      rankingEnabled:
        flat.rankingEnabled === undefined || flat.rankingEnabled === null
          ? true
          : Boolean(flat.rankingEnabled),
    },
    questions: deduped,
    uploadedFiles: Array.isArray(flat.uploadFiles) ? flat.uploadFiles : [],
    questionCount: Math.max(
      0,
      parseInt(String(flat.questionCount ?? ''), 10) || 0,
      deduped.length
        ? Math.max(...deduped.map((q) => q.questionNo || 0), deduped.length)
        : 0,
    ),
  }
}

/** UI helpers — read/write flat fields on nested block */
export function getTestSeriesFlat(block = {}) {
  const n = normalizeTestSeriesBlock(block)
  return {
    ...n.details,
    scheduleDate: n.schedule.date,
    scheduleTime: n.schedule.time,
    resultDate: n.resultSettings.resultDate,
    rankingEnabled: n.resultSettings.rankingEnabled,
    questionCount: n.questionCount,
    questions: n.questions,
    uploadFiles: n.uploadedFiles,
  }
}

export function patchTestSeriesBlock(prev = {}, patch = {}) {
  const current = normalizeTestSeriesBlock(prev)
  const flat = { ...getTestSeriesFlat(current), ...patch }

  return normalizeTestSeriesBlock({
    details: {
      testName: flat.testName,
      testType: flat.testType,
      mode: flat.mode,
      durationMinutes: flat.durationMinutes,
      durationCustom: flat.durationCustom,
      totalMarks: flat.totalMarks,
      marksPerCorrectAnswer: flat.marksPerCorrectAnswer,
      negativeMarkingEnabled: flat.negativeMarkingEnabled,
      negativeMarkPerQuestion: flat.negativeMarkPerQuestion,
      instructions: flat.instructions,
      manualQuestions: flat.manualQuestions,
      pdfFileName: flat.pdfFileName,
    },
    schedule: { date: flat.scheduleDate, time: flat.scheduleTime },
    resultSettings: {
      resultDate: flat.resultDate,
      rankingEnabled: flat.rankingEnabled,
    },
    questions: flat.questions ?? current.questions,
    uploadedFiles: flat.uploadFiles ?? current.uploadedFiles,
    questionCount: flat.questionCount ?? current.questionCount,
  })
}

export function resolveTestSeriesDurationMinutes(block = {}) {
  const flat = getTestSeriesFlat(block)
  if (flat.durationMinutes === 'custom') {
    const n = parseInt(String(flat.durationCustom || '').replace(/\D/g, ''), 10)
    return Number.isFinite(n) && n > 0 ? n : null
  }
  const n = parseInt(String(flat.durationMinutes || ''), 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Validate test series block (subject or batch). */
export function validateTestSeriesForm(testSeriesRaw = {}, { errorPrefix = 'testSeries_' } = {}) {
  // NOTE: This validator is used by multiple modules. Keep defaults as legacy-safe,
  // and allow callers to relax requirements when UI intentionally hides fields.
  const options =
    arguments.length >= 2 && typeof arguments[1] === 'object'
      ? arguments[1]
      : { errorPrefix }
  const {
    requireTestType = true,
    requireScheduleTime = true,
    requireMarksPerCorrectAnswer = false,
  } = options
  const errors = {}
  const ts = normalizeTestSeriesBlock(testSeriesRaw)
  const d = ts.details
  const s = ts.schedule
  const r = ts.resultSettings

  const p = errorPrefix
  if (!d.testName) errors[`${p}testName`] = 'Test name is required'
  if (requireTestType && !d.testType) errors[`${p}testType`] = 'Test type is required'

  const duration = resolveTestSeriesDurationMinutes(ts)
  if (!duration) errors[`${p}duration`] = 'Duration is required'

  const marks = parseFloat(String(d.totalMarks))
  if (!Number.isFinite(marks) || marks <= 0) {
    errors[`${p}totalMarks`] = 'Enter valid total marks'
  }

  if (requireMarksPerCorrectAnswer) {
    const per = parseFloat(String(d.marksPerCorrectAnswer))
    if (!Number.isFinite(per) || per <= 0) {
      errors[`${p}marksPerCorrectAnswer`] = 'Enter valid marks per correct answer'
    }
  }

  if (d.negativeMarkingEnabled) {
    const neg = parseFloat(String(d.negativeMarkPerQuestion))
    if (!Number.isFinite(neg) || neg < 0) {
      errors[`${p}negativeMark`] = 'Enter valid negative marking value'
    }
  }

  if (!s.date) errors[`${p}scheduleDate`] = 'Schedule date is required'
  if (requireScheduleTime && !s.time) errors[`${p}scheduleTime`] = 'Schedule time is required'
  else if (requireScheduleTime && s.date) {
    const scheduled = new Date(`${s.date}T${s.time}`)
    if (!Number.isNaN(scheduled.getTime()) && scheduled < new Date()) {
      errors[`${p}scheduleDate`] = 'Schedule must be in the future'
    }
  }

  if (!r.resultDate) errors[`${p}resultDate`] = 'Result date is required'
  else if (s.date && r.resultDate < s.date) {
    errors[`${p}resultDate`] = 'Result date cannot be before schedule date'
  }

  return errors
}

/** @deprecated Use validateTestSeriesForm */
export const validateBatchTestSeries = validateTestSeriesForm

export function serializeTestSeriesForStorage(testSeriesRaw = {}) {
  if (!testSeriesRaw || (typeof testSeriesRaw === 'object' && !Object.keys(testSeriesRaw).length)) {
    return null
  }
  const ts = normalizeTestSeriesBlock(testSeriesRaw)
  return {
    ...ts,
    durationResolvedMinutes: resolveTestSeriesDurationMinutes(ts),
    // legacy flat fields for older consumers
    testName: ts.details.testName,
    testType: ts.details.testType,
    mode: ts.details.mode,
    durationMinutes: ts.details.durationMinutes,
    durationCustom: ts.details.durationCustom,
    totalMarks: ts.details.totalMarks,
    marksPerCorrectAnswer: ts.details.marksPerCorrectAnswer,
    negativeMarkingEnabled: ts.details.negativeMarkingEnabled,
    negativeMarkPerQuestion: ts.details.negativeMarkPerQuestion,
    instructions: ts.details.instructions,
    manualQuestions: ts.details.manualQuestions,
    pdfFileName: ts.details.pdfFileName,
    scheduleDate: ts.schedule.date,
    scheduleTime: ts.schedule.time,
    resultDate: ts.resultSettings.resultDate,
    rankingEnabled: ts.resultSettings.rankingEnabled,
    uploadFiles: ts.uploadedFiles,
  }
}
