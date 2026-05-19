import { Calendar } from 'lucide-react'
import { toast } from '@/utils/toast'
import FormModalSubmitBar from '../common/FormModalSubmitBar'
import Modal from '../ui/Modal'
import ModalPanelHeader from '../courses/ModalPanelHeader'
import SectionBar from '../courses/SectionBar'
import {
  CourseFormField,
  CourseInput,
  CourseSelect,
  CourseTextarea,
} from '../courses/CourseFormField'
import {
  LIVE_CLASS_LOCATIONS,
  MEETING_PROVIDERS,
} from '../../data/liveClassesData'
import {
  createEmptyLessonForm,
  lessonRowToForm,
} from '../../utils/liveClassesMappers'
import { useModalForm } from '../../hooks/useModalForm'
import SubjectSearchSelect from './SubjectSearchSelect'
import VideoUploadSection from './VideoUploadSection'

function Toggle({ checked, onChange, label }) {
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

export default function ScheduleClassModal({ open, onClose, item, onSubmit, lessons = [] }) {
  const { form, setForm, isEditMode, reset } = useModalForm(
    open,
    item,
    lessonRowToForm,
    createEmptyLessonForm,
  )

  const update = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: val }))
  }

  const isRecording = form.lessonType === 'Recording'
  const isLive = form.lessonType === 'Live'

  const handleSubject = ({ subjectId, subjectName, mainCategoryName }) => {
    setForm((f) => ({ ...f, subjectId, subjectName, mainCategoryName }))
  }

  const validate = () => {
    if (!form.lessonName?.trim()) {
      toast.error('Lesson name is required')
      return false
    }
    if (!form.subjectId) {
      toast.error('Select a subject — classes attach to subjects only')
      return false
    }
    if (!form.teacher?.trim()) {
      toast.error('Teacher is required')
      return false
    }
    if (isLive) {
      if (!form.scheduledDate || !form.scheduledTime) {
        toast.error('Schedule date and time are required for live classes')
        return false
      }
      const conflict = lessons.some(
        (l) =>
          l.id !== item?.id &&
          l.lessonType === 'Live' &&
          l.teacher === form.teacher &&
          l.scheduledDate === form.scheduledDate &&
          l.scheduledTime === form.scheduledTime &&
          l.status !== 'Disabled',
      )
      if (conflict) {
        toast.error('Schedule conflict: this teacher already has a class at that time')
        return false
      }
    }
    if (isRecording && !form.videoFileName && !isEditMode) {
      toast.error('Upload a video for recording lessons')
      return false
    }
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit?.(form, { isEdit: isEditMode, id: item?.id })
    toast.success(isEditMode ? 'Lesson updated' : 'Class scheduled')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} size="full" title="Schedule class">
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl bg-[#f7f7f7] shadow-[0_24px_60px_rgba(15,23,42,0.2)]"
      >
        <ModalPanelHeader
          title={isEditMode ? 'Edit lesson' : 'Schedule class'}
          onBack={onClose}
          icon={Calendar}
        />

        <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
          <SectionBar title="Lesson details" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CourseFormField label="Lesson name" required className="sm:col-span-2">
              <CourseInput value={form.lessonName} onChange={update('lessonName')} />
            </CourseFormField>
            <CourseFormField label="Topic">
              <CourseInput value={form.topic} onChange={update('topic')} />
            </CourseFormField>
            <CourseFormField label="Teacher" required>
              <CourseInput value={form.teacher} onChange={update('teacher')} />
            </CourseFormField>
            <CourseFormField label="Subject" required className="sm:col-span-2">
              <SubjectSearchSelect
                value={form.subjectId}
                onChange={handleSubject}
                required
              />
            </CourseFormField>
            <CourseFormField label="Location" required>
              <CourseSelect value={form.location} onChange={update('location')}>
                {LIVE_CLASS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </CourseSelect>
            </CourseFormField>
            <CourseFormField label="Lesson type" required>
              <CourseSelect value={form.lessonType} onChange={update('lessonType')}>
                <option value="Live">Live</option>
                <option value="Recording">Recording</option>
              </CourseSelect>
            </CourseFormField>
            <CourseFormField label="Status">
              <CourseSelect value={form.status} onChange={update('status')}>
                <option value="Scheduled">Scheduled</option>
                <option value="Live">Live</option>
                <option value="Completed">Completed</option>
                <option value="Draft">Draft</option>
                <option value="Disabled">Disabled</option>
              </CourseSelect>
            </CourseFormField>
          </div>

          {isRecording && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4 rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.08)] ring-1 ring-[#e8f4fc]">
                <h3 className="text-sm font-bold uppercase tracking-wide text-[#246392]">
                  Recording details
                </h3>
                <CourseFormField label="Description">
                  <CourseTextarea value={form.description} onChange={update('description')} rows={3} />
                </CourseFormField>
                <Toggle
                  checked={form.downloadable}
                  onChange={(v) => setForm((f) => ({ ...f, downloadable: v }))}
                  label="Downloadable"
                />
                <CourseFormField label="Notes / PDF">
                  <CourseInput
                    type="file"
                    accept=".pdf"
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        notesFileName: e.target.files?.[0]?.name || '',
                      }))
                    }
                  />
                  {form.notesFileName && (
                    <p className="mt-1 text-xs text-[#686868]">{form.notesFileName}</p>
                  )}
                </CourseFormField>
                <CourseFormField label="Visibility">
                  <CourseSelect value={form.visibility} onChange={update('visibility')}>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Private">Private</option>
                  </CourseSelect>
                </CourseFormField>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[#eef2fc] to-white p-5 shadow-[0_8px_30px_rgba(36,99,146,0.1)] ring-1 ring-[#e8f4fc]">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#246392]">
                  Video preview
                </h3>
                <VideoUploadSection form={form} setForm={setForm} />
              </div>
            </div>
          )}

          {isLive && (
            <div className="space-y-5 rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(36,99,146,0.08)] ring-1 ring-[#e8f4fc]">
              <h3 className="text-sm font-bold uppercase tracking-wide text-[#246392]">
                Live scheduling
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <CourseFormField label="Schedule date" required>
                  <CourseInput type="date" value={form.scheduledDate} onChange={update('scheduledDate')} />
                </CourseFormField>
                <CourseFormField label="Time" required>
                  <CourseInput type="time" value={form.scheduledTime} onChange={update('scheduledTime')} />
                </CourseFormField>
                <CourseFormField label="Duration (min)">
                  <CourseInput
                    type="number"
                    min={15}
                    value={form.duration}
                    onChange={update('duration')}
                  />
                </CourseFormField>
                <CourseFormField label="Timezone">
                  <CourseSelect value={form.timezone} onChange={update('timezone')}>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                  </CourseSelect>
                </CourseFormField>
              </div>
              <Toggle
                checked={form.recurring}
                onChange={(v) => setForm((f) => ({ ...f, recurring: v }))}
                label="Recurring session"
              />

              <SectionBar title="Meeting details (integration-ready)" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <CourseFormField label="Provider">
                  <CourseSelect value={form.meetingProvider} onChange={update('meetingProvider')}>
                    {MEETING_PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </CourseSelect>
                </CourseFormField>
                <CourseFormField label="Meeting ID">
                  <CourseInput value={form.zoomMeetingId} onChange={update('zoomMeetingId')} />
                </CourseFormField>
                <CourseFormField label="Account email">
                  <CourseInput
                    type="email"
                    value={form.zoomAccountEmail}
                    onChange={update('zoomAccountEmail')}
                  />
                </CourseFormField>
                <CourseFormField label="Meeting link" className="sm:col-span-2">
                  <CourseInput value={form.zoomLink} onChange={update('zoomLink')} placeholder="https://" />
                </CourseFormField>
                <CourseFormField label="Passcode">
                  <CourseInput value={form.passcode} onChange={update('passcode')} />
                </CourseFormField>
                <CourseFormField label="Host name">
                  <CourseInput value={form.hostName} onChange={update('hostName')} />
                </CourseFormField>
              </div>
              <CourseFormField label="Description" className="sm:col-span-2">
                <CourseTextarea value={form.description} onChange={update('description')} rows={3} />
              </CourseFormField>
            </div>
          )}

          <FormModalSubmitBar
            isEditMode={isEditMode}
            onReset={reset}
            createLabel="Schedule class"
            updateLabel="Save changes"
          />
        </div>
      </form>
    </Modal>
  )
}
