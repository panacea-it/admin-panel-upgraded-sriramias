import { useRef, useState } from 'react'
import { useInitOnModalOpen } from '../../hooks/modalFormSync'
import { useForm, Controller } from 'react-hook-form'
import { BookOpen, Calendar, ChevronDown } from 'lucide-react'
import { toast } from '@/utils/toast'
import SubjectModalShell from './SubjectModalShell'
import TimeDurationFields from './TimeDurationFields'
import RecurringScheduleSection from '../live-classes/RecurringScheduleSection'
import {
  CATEGORY_OPTIONS,
  CENTER_DROPDOWN_OPTIONS,
  SUBJECT_DROPDOWN_OPTIONS,
  TEACHER_DROPDOWN_OPTIONS,
  TOPIC_DROPDOWN_OPTIONS,
} from '../../data/academicsSubjectsSeed'
import ClassroomSelectField from '../classrooms/ClassroomSelectField'
import {
  CourseFormField,
  CourseSelect,
} from '../courses/CourseFormField'
import { RECURRENCE_EDIT_SCOPES } from '../../constants/recurrence'
import { useAuth } from '../../contexts/AuthContext'
import {
  createRecurrenceFromSubjectForm,
  flattenSubjectsLiveClassesForConflicts,
  formAnchorTime,
  getExcludeLessonIds,
} from '../../utils/academicsSubjectsRecurrence'
import {
  EMPTY_SUBJECT_FORM,
  clampTimeField,
  shouldShowLiveClassSection,
  subjectToForm,
  validateSubjectForm,
} from './subjectFormUtils'
import { cn } from '../../utils/cn'

function SectionTitle({ children }) {
  return (
    <div className="rounded-xl bg-white px-4 py-3 text-center shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
      <h3 className="text-base font-bold text-[#246392] sm:text-lg">{children}</h3>
    </div>
  )
}

function FieldLabel({ children, required }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-[#333]">
      {children}
      {required && <span className="text-red-500"> *</span>}
    </label>
  )
}

function FormInput({ register, name, error, ...props }) {
  return (
    <input
      {...register(name)}
      className={cn(
        'h-11 w-full rounded-xl bg-[#d1e9f6] px-4 text-sm text-[#222] outline-none placeholder:text-[#7a8a9a] focus:ring-2 focus:ring-[#55ace7]/40',
        error && 'ring-2 ring-red-400',
      )}
      {...props}
    />
  )
}

function FormSelect({ register, name, error, options, placeholder }) {
  return (
    <div className="relative">
      <select
        {...register(name)}
        className={cn(
          'h-11 w-full appearance-none rounded-xl bg-[#d1e9f6] px-4 pr-10 text-sm text-[#222] outline-none focus:ring-2 focus:ring-[#55ace7]/40',
          error && 'ring-2 ring-red-400',
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687180]" />
    </div>
  )
}

function RecurringToggle({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-[#55ace7]' : 'bg-[#d1d5db]'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'translate-x-5' : ''}`}
        />
      </button>
      <span className="text-sm font-medium text-[#222]">{label}</span>
    </label>
  )
}

export default function SubjectModal({
  open,
  onClose,
  mode = 'add',
  context = 'subject',
  subject,
  liveClass,
  subjects = [],
  onSubmit,
}) {
  const { user } = useAuth()
  const actorName = user?.name || user?.email || 'Admin'
  const [saving, setSaving] = useState(false)
  const isEdit = mode === 'edit'
  const liveClassOnly = context === 'liveClass'

  const [recurring, setRecurring] = useState(false)
  const [recurrence, setRecurrence] = useState(null)
  const [recurrenceEditScope, setRecurrenceEditScope] = useState('series')
  const [timezone, setTimezone] = useState('Asia/Kolkata')

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_SUBJECT_FORM })

  const subjectRef = useRef(subject)
  subjectRef.current = subject
  const liveClassRef = useRef(liveClass)
  liveClassRef.current = liveClass
  const seedKey = `${mode}:${context}:${subject?.id ?? liveClass?.id ?? 'new'}`

  const syncRecurrenceState = (formValues) => {
    setRecurring(Boolean(formValues.recurring))
    setRecurrence(formValues.recurrence)
    setRecurrenceEditScope(formValues.recurrenceEditScope || 'series')
    setTimezone(formValues.timezone || 'Asia/Kolkata')
  }

  useInitOnModalOpen(open, seedKey, () => {
    const seeded = subjectToForm(subjectRef.current, liveClassRef.current)
    reset(seeded)
    syncRecurrenceState(seeded)
    clearErrors()
  })

  const watchedCategory = watch('category')
  const watchedDate = watch('date')
  const watchedTeacher = watch('teacher')
  const watchedTimeHrs = watch('timeHrs')
  const watchedTimeMin = watch('timeMin')
  const watchedTimeSec = watch('timeSec')
  const watchedDurHrs = watch('durationHrs')
  const watchedDurMin = watch('durationMin')
  const watchedDurSec = watch('durationSec')

  const showLiveClass = shouldShowLiveClassSection(
    { category: liveClassOnly ? 'Live Class' : watchedCategory },
    { liveClassOnly },
  )

  const isRecurringEdit = isEdit && Boolean(liveClass?.recurrenceSeriesId)
  const anchorTime = formAnchorTime({
    timeHrs: watchedTimeHrs,
    timeMin: watchedTimeMin,
    timeSec: watchedTimeSec,
  })

  const handleRecurringToggle = (enabled) => {
    setRecurring(enabled)
    if (enabled) {
      setRecurrence((prev) =>
        prev?.enabled
          ? prev
          : createRecurrenceFromSubjectForm({
              date: watchedDate,
              timezone,
            }),
      )
    } else {
      setRecurrence(null)
    }
  }

  const handleRecurrenceChange = (nextRule) => {
    setRecurrence(nextRule)
    if (nextRule?.startDate && !watchedDate) {
      setValue('date', nextRule.startDate)
    }
  }

  const onFormSubmit = async (values) => {
    const payload = {
      ...values,
      recurring,
      recurrence: recurring && recurrence?.enabled ? recurrence : null,
      recurrenceEditScope,
      timezone,
      _excludeSourceIds: liveClass?.id ? [liveClass.id] : [],
    }

    const validationErrors = validateSubjectForm(payload, {
      liveClassOnly,
      requireLiveClass: liveClassOnly,
      allSubjects: subjects,
      subjectId: subject?.id || '',
      excludeLessonIds: getExcludeLessonIds(subject, liveClass, subjects),
    })

    if (Object.keys(validationErrors).length) {
      Object.entries(validationErrors).forEach(([key, message]) => {
        if (key === 'recurrence') {
          toast.error(message)
        } else {
          setError(key, { type: 'manual', message })
        }
      })
      return
    }

    setSaving(true)
    try {
      await onSubmit(payload)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const lessonsForConflicts = flattenSubjectsLiveClassesForConflicts(subjects)
  const excludeLessonIds = getExcludeLessonIds(subject, liveClass, subjects)

  return (
    <SubjectModalShell open={open} onClose={onClose}>
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="max-h-[min(90vh,880px)] overflow-y-auto rounded-2xl bg-[#f4f6f8] shadow-[0_24px_60px_rgba(15,23,42,0.2)]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-[#55ace7] via-[#3d7eb5] to-[#246392] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
              <BookOpen className="h-5 w-5 text-[#246392]" strokeWidth={2.2} />
            </div>
            <h2 className="text-lg font-bold text-white sm:text-xl">
              {liveClassOnly
                ? isEdit
                  ? 'Edit Live Class'
                  : 'Add Live Class'
                : isEdit
                  ? 'Edit Subject'
                  : 'Subject Creation'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-white underline-offset-2 transition hover:underline"
          >
            Go Back
          </button>
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          {!liveClassOnly && (
            <section className="space-y-4">
              <SectionTitle>Course Details</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <FieldLabel required>Subject Name</FieldLabel>
                  <FormInput
                    register={register}
                    name="subjectName"
                    error={errors.subjectName}
                    placeholder="Enter subject name"
                  />
                  {errors.subjectName && (
                    <p className="mt-1 text-xs text-red-500">{errors.subjectName.message}</p>
                  )}
                </div>
                <div>
                  <FieldLabel required>Subject</FieldLabel>
                  <FormSelect
                    register={register}
                    name="subject"
                    error={errors.subject}
                    options={SUBJECT_DROPDOWN_OPTIONS}
                    placeholder="Choose Subject"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>
                  )}
                </div>
                <div>
                  <FieldLabel>Topic</FieldLabel>
                  <FormSelect
                    register={register}
                    name="topic"
                    options={TOPIC_DROPDOWN_OPTIONS}
                    placeholder="Choose Topic"
                  />
                </div>
                <div>
                  <FieldLabel required>Teacher</FieldLabel>
                  <FormSelect
                    register={register}
                    name="teacher"
                    error={errors.teacher}
                    options={TEACHER_DROPDOWN_OPTIONS}
                    placeholder="Choose Teacher"
                  />
                  {errors.teacher && (
                    <p className="mt-1 text-xs text-red-500">{errors.teacher.message}</p>
                  )}
                </div>
                <div>
                  <FieldLabel>Category</FieldLabel>
                  <div className="relative">
                    <select
                      {...register('category')}
                      className="h-11 w-full appearance-none rounded-xl bg-[#d1e9f6] px-4 pr-10 text-sm text-[#222] outline-none focus:ring-2 focus:ring-[#55ace7]/40"
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687180]" />
                  </div>
                </div>
              </div>
            </section>
          )}

          {showLiveClass && (
            <section className="space-y-4">
              <SectionTitle>Live Class Details</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <FieldLabel required>Class Title</FieldLabel>
                  <FormInput
                    register={register}
                    name="classTitle"
                    error={errors.classTitle}
                    placeholder="Class title"
                  />
                  {errors.classTitle && (
                    <p className="mt-1 text-xs text-red-500">{errors.classTitle.message}</p>
                  )}
                </div>
                <div>
                  <FieldLabel required>Center</FieldLabel>
                  <FormSelect
                    register={register}
                    name="center"
                    error={errors.center}
                    options={CENTER_DROPDOWN_OPTIONS}
                    placeholder="Choose Center"
                  />
                  {errors.center && (
                    <p className="mt-1 text-xs text-red-500">{errors.center.message}</p>
                  )}
                </div>
                <Controller
                  control={control}
                  name="classroomId"
                  render={({ field }) => (
                    <ClassroomSelectField
                      value={field.value}
                      onChange={field.onChange}
                      date={watchedDate}
                      timeHrs={watchedTimeHrs}
                      timeMin={watchedTimeMin}
                      timeSec={watchedTimeSec}
                      durationHrs={watchedDurHrs}
                      durationMin={watchedDurMin}
                      durationSec={watchedDurSec}
                      excludeSourceIds={liveClass?.id ? [liveClass.id] : []}
                      error={errors.classRoom?.message}
                      required
                      label="Select Classroom"
                    />
                  )}
                />
                <div>
                  <FieldLabel required>Date</FieldLabel>
                  <div className="relative">
                    <input
                      type="date"
                      {...register('date')}
                      className={cn(
                        'h-11 w-full rounded-xl bg-[#d1e9f6] px-4 pr-11 text-sm text-[#222] outline-none focus:ring-2 focus:ring-[#55ace7]/40',
                        errors.date && 'ring-2 ring-red-400',
                      )}
                    />
                    <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#df8284]" />
                  </div>
                  {errors.date && (
                    <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>
                  )}
                </div>
                <Controller
                  control={control}
                  name="timeHrs"
                  render={({ field }) => (
                    <TimeDurationFields
                      label="Time"
                      required
                      hrs={field.value}
                      min={watch('timeMin')}
                      sec={watch('timeSec')}
                      onHrsChange={(e) => field.onChange(clampTimeField(e.target.value, 23))}
                      onMinChange={(e) =>
                        setValue('timeMin', clampTimeField(e.target.value))
                      }
                      onSecChange={(e) =>
                        setValue('timeSec', clampTimeField(e.target.value))
                      }
                      error={errors.time?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="durationHrs"
                  render={({ field }) => (
                    <TimeDurationFields
                      label="Duration"
                      hrs={field.value}
                      min={watch('durationMin')}
                      sec={watch('durationSec')}
                      onHrsChange={(e) => field.onChange(clampTimeField(e.target.value, 23))}
                      onMinChange={(e) =>
                        setValue('durationMin', clampTimeField(e.target.value))
                      }
                      onSecChange={(e) =>
                        setValue('durationSec', clampTimeField(e.target.value))
                      }
                    />
                  )}
                />
                <CourseFormField label="Timezone">
                  <CourseSelect
                    value={timezone}
                    onChange={(e) => {
                      const tz = e.target.value
                      setTimezone(tz)
                      if (recurrence) {
                        setRecurrence({ ...recurrence, timezone: tz })
                      }
                    }}
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST/EDT)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                  </CourseSelect>
                </CourseFormField>
              </div>

              <RecurringToggle
                checked={recurring}
                onChange={handleRecurringToggle}
                label="Recurring session"
              />

              {isRecurringEdit && (
                <div className="rounded-xl border border-[#cfe8f8] bg-[#f8fbff] px-4 py-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#246392]">
                    Apply changes to
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {RECURRENCE_EDIT_SCOPES.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium"
                      >
                        <input
                          type="radio"
                          name="recurrenceEditScope"
                          value={opt.value}
                          checked={recurrenceEditScope === opt.value}
                          onChange={() => setRecurrenceEditScope(opt.value)}
                          className="accent-[#246392]"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <RecurringScheduleSection
                enabled={recurring}
                recurrence={recurrence}
                onRecurrenceChange={handleRecurrenceChange}
                anchorDate={watchedDate}
                anchorTime={anchorTime}
                lessons={lessonsForConflicts}
                excludeLessonIds={excludeLessonIds}
                teacher={watchedTeacher || subject?.teacher || ''}
                subjectId={subject?.id || ''}
                actorName={actorName}
              />
              {errors.recurrence && (
                <p className="text-xs font-medium text-red-600">{errors.recurrence.message}</p>
              )}
            </section>
          )}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                const seeded = subjectToForm(subject, liveClass)
                reset(seeded)
                syncRecurrenceState(seeded)
              }}
              disabled={saving}
              className="h-11 min-w-[140px] rounded-xl bg-gradient-to-r from-[#7eb8e8] to-[#55ace7] px-8 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(85,172,231,0.35)] transition hover:opacity-90 disabled:opacity-60"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-11 min-w-[140px] rounded-xl bg-gradient-to-r from-[#1a3a5c] to-[#03045e] px-8 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(3,4,94,0.35)] transition hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </SubjectModalShell>
  )
}
