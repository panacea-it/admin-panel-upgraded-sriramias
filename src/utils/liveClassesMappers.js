export function createEmptyLessonForm() {
  return {
    lessonName: '',
    topic: '',
    teacher: '',
    location: 'Delhi',
    lessonType: 'Live',
    subjectId: '',
    subjectName: '',
    mainCategoryName: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    timezone: 'Asia/Kolkata',
    recurring: false,
    status: 'Scheduled',
    meetingProvider: 'zoom',
    zoomMeetingId: '',
    zoomAccountEmail: '',
    zoomLink: '',
    passcode: '',
    hostName: '',
    description: '',
    downloadable: false,
    visibility: 'Published',
    videoFileName: '',
    videoDuration: '',
    thumbnailUrl: '',
    notesFileName: '',
    videoObjectUrl: '',
  }
}

export function lessonRowToForm(row) {
  if (!row) return createEmptyLessonForm()
  return {
    ...createEmptyLessonForm(),
    ...row,
    lessonName: row.lessonName ?? row.name ?? '',
  }
}

export function lessonFormToRow(form, existing) {
  const now = new Date().toISOString()
  return {
    ...existing,
    lessonName: form.lessonName?.trim() || existing?.lessonName,
    topic: form.topic?.trim() ?? '',
    teacher: form.teacher?.trim() ?? '',
    location: form.location || 'Delhi',
    lessonType: form.lessonType || 'Live',
    subjectId: form.subjectId,
    subjectName: form.subjectName,
    mainCategoryName: form.mainCategoryName,
    scheduledDate: form.scheduledDate,
    scheduledTime: form.scheduledTime,
    duration: Number(form.duration) || 60,
    timezone: form.timezone || 'Asia/Kolkata',
    recurring: Boolean(form.recurring),
    status: form.status || 'Scheduled',
    meetingProvider: form.meetingProvider || 'zoom',
    zoomMeetingId: form.zoomMeetingId ?? '',
    zoomAccountEmail: form.zoomAccountEmail ?? '',
    zoomLink: form.zoomLink ?? '',
    passcode: form.passcode ?? '',
    hostName: form.hostName ?? '',
    description: form.description ?? '',
    downloadable: Boolean(form.downloadable),
    visibility: form.visibility || 'Published',
    videoFileName: form.videoFileName ?? '',
    videoDuration: form.videoDuration ?? '',
    thumbnailUrl: form.thumbnailUrl ?? '',
    notesFileName: form.notesFileName ?? '',
    modifiedAt: now,
    createdAt: existing?.createdAt ?? now,
    id: existing?.id,
  }
}

export function duplicateLessonRow(row) {
  const copy = lessonRowToForm(row)
  copy.lessonName = `${copy.lessonName} (Copy)`
  delete copy.id
  return copy
}
