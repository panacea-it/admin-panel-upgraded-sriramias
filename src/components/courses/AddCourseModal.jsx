import { useMemo, useState } from 'react'
import { toast } from '@/utils/toast'
import Modal from '../ui/Modal'
import ModalPanelHeader from './ModalPanelHeader'
import SectionBar from './SectionBar'
import { SUB_CATEGORIES_BY_CATEGORY } from '../../data/coursesData'
import {
  CourseAddMoreLink,
  CourseDateInput,
  CourseFeeInput,
  CourseFileInput,
  CourseFormField,
  CourseIconSlot,
  CourseInput,
  CourseMediaSlot,
  CourseSelect,
  CourseTextarea,
} from './CourseFormField'

const makeSlots = (count, factory) => Array.from({ length: count }, (_, i) => factory(i))

const emptyForm = () => ({
  courseName: '',
  category: '',
  subCategory: '',
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
  keyFeatures: makeSlots(6, (i) => ({
    id: `kf-${i}`,
    fileName: '',
    text: '',
  })),
  whyChoose: makeSlots(6, (i) => ({
    id: `wc-${i}`,
    fileName: '',
    hasIcon: i > 0,
  })),
  howWill: makeSlots(6, (i) => ({
    id: `hw-${i}`,
    kind: i === 0 || i === 3 ? 'video' : 'image',
    fileName: i === 1 ? '' : '',
    placeholder:
      i === 0 || i === 3
        ? 'Video to be played for motion effect'
        : 'Image to be displayed',
  })),
})

export default function AddCourseModal({ open, onClose, categories, onSubmit }) {
  const [form, setForm] = useState(emptyForm)

  const subCategoryOptions = useMemo(() => {
    if (!form.category) return []
    return SUB_CATEGORIES_BY_CATEGORY[form.category] || []
  }, [form.category])

  const update = (key) => (e) => {
    const value = e?.target ? e.target.value : e
    setForm((f) => ({ ...f, [key]: value }))
  }

  const handleClose = () => {
    setForm(emptyForm())
    onClose()
  }

  const handleReset = () => {
    setForm(emptyForm())
    toast.message('Form reset')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.courseName.trim() || !form.category) {
      toast.error('Please fill required course details')
      return
    }
    onSubmit?.(form)
    toast.success('Course saved successfully')
    handleClose()
  }

  const addSubjectRow = () => {
    setForm((f) => ({ ...f, subjects: [...f.subjects, ''] }))
  }

  const updateSubject = (index, value) => {
    setForm((f) => {
      const subjects = [...f.subjects]
      subjects[index] = value
      return { ...f, subjects }
    })
  }

  const appendGridRow = (key, factory) => {
    setForm((f) => ({
      ...f,
      [key]: [
        ...f[key],
        ...makeSlots(3, (i) => factory(f[key].length + i)),
      ],
    }))
  }

  const whyTitle =
    form.category && form.courseName
      ? `Why Choose ${form.category} ${form.courseName} Course Help You?`
      : 'Why Choose { Category } {Course Name} Course Help You?'

  const howTitle = form.courseName
    ? `How Will the ${form.courseName} Helps You ?`
    : 'How Will the {Course Name} Helps You ?'

  return (
    <Modal open={open} onClose={handleClose} size="full" title="Add Course">
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-xl bg-[#f0f4f8] shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
      >
        <ModalPanelHeader title="Course" onBack={handleClose} />

        <div className="space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6">
          {/* Course Details */}
          <SectionBar title="Course Details" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CourseFormField label="Course Name" required>
              <CourseInput
                value={form.courseName}
                onChange={update('courseName')}
                placeholder=""
              />
            </CourseFormField>
            <CourseFormField label="Course Category" required>
              <CourseSelect
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value,
                    subCategory: '',
                  }))
                }
              >
                <option value="">Choose Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </CourseSelect>
            </CourseFormField>
            <CourseFormField label="Choose Sub-Category" required>
              <CourseSelect
                value={form.subCategory}
                onChange={update('subCategory')}
                disabled={!form.category}
              >
                <option value="">Choose Sub-Category</option>
                {subCategoryOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </CourseSelect>
            </CourseFormField>
            <CourseFormField label="Date of commencement" required>
              <CourseDateInput value={form.commencement} onChange={update('commencement')} />
            </CourseFormField>
            <CourseFormField label="Duration" required>
              <CourseDateInput
                value={form.durationFrom}
                onChange={update('durationFrom')}
                placeholder="From"
              />
            </CourseFormField>
            <CourseFormField label="Duration" required>
              <CourseDateInput value={form.durationTo} onChange={update('durationTo')} />
            </CourseFormField>
            <CourseFormField label="Batch Start Date" required>
              <CourseDateInput value={form.batchStartFrom} onChange={update('batchStartFrom')} />
            </CourseFormField>
            <CourseFormField label="Batch End Date" required>
              <CourseDateInput value={form.batchEndTo} onChange={update('batchEndTo')} />
            </CourseFormField>
            <CourseFormField label="Banner image" required>
              <CourseFileInput
                placeholder="360 to 480 kb"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  setForm((f) => ({
                    ...f,
                    bannerFileName: file?.name || '',
                  }))
                }}
              />
            </CourseFormField>
          </div>

          {/* Subject Details */}
          <SectionBar title="Subject Details" />
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {form.subjects.map((subj, idx) => (
                <CourseFormField key={idx} label="Link Subject">
                  <CourseSelect
                    value={subj}
                    onChange={(e) => updateSubject(idx, e.target.value)}
                  >
                    <option value="">Choose Subject ID</option>
                    <option value="sub-101">Subject 101 — Polity</option>
                    <option value="sub-102">Subject 102 — Economy</option>
                    <option value="sub-103">Subject 103 — History</option>
                  </CourseSelect>
                </CourseFormField>
              ))}
            </div>
            <div className="flex justify-end">
              <CourseAddMoreLink onClick={addSubjectRow} />
            </div>
          </div>

          {/* Fee Details */}
          <SectionBar title="Fee Details" />
          <div className="grid gap-4 sm:grid-cols-2">
            <CourseFormField label="Fees for Online classes" required>
              <CourseFeeInput
                variant="online"
                value={form.onlineFees}
                onChange={update('onlineFees')}
                placeholder=""
              />
            </CourseFormField>
            <CourseFormField label="Discount (in %)">
              <CourseInput value={form.onlineDiscount} onChange={update('onlineDiscount')} />
            </CourseFormField>
            <CourseFormField label="Fees for Offline classes" required>
              <CourseFeeInput
                variant="offline"
                value={form.offlineFees}
                onChange={update('offlineFees')}
                placeholder=""
              />
            </CourseFormField>
            <CourseFormField label="Discount (in %)">
              <CourseInput value={form.offlineDiscount} onChange={update('offlineDiscount')} />
            </CourseFormField>
          </div>

          {/* Course Overview */}
          <SectionBar title="Course Overview" />
          <CourseTextarea
            value={form.overview}
            onChange={update('overview')}
            rows={8}
            placeholder=""
          />

          {/* Key Features */}
          <SectionBar title="Key Features Of Course" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {form.keyFeatures.map((slot, idx) =>
              idx === 0 ? (
                <CourseMediaSlot
                  key={slot.id}
                  placeholder="Image to be displayed"
                  fileName={slot.fileName}
                  onFileChange={(e) => {
                    const file = e.target.files?.[0]
                    setForm((f) => {
                      const keyFeatures = [...f.keyFeatures]
                      keyFeatures[0] = { ...keyFeatures[0], fileName: file?.name || '' }
                      return { ...f, keyFeatures }
                    })
                  }}
                />
              ) : (
                <CourseInput
                  key={slot.id}
                  value={slot.text}
                  onChange={(e) => {
                    const text = e.target.value
                    setForm((f) => {
                      const keyFeatures = [...f.keyFeatures]
                      keyFeatures[idx] = { ...keyFeatures[idx], text }
                      return { ...f, keyFeatures }
                    })
                  }}
                  placeholder=""
                />
              ),
            )}
          </div>
          <div className="flex justify-end">
            <CourseAddMoreLink
              onClick={() =>
                appendGridRow('keyFeatures', (i) => ({
                  id: `kf-${Date.now()}-${i}`,
                  fileName: '',
                  text: '',
                }))
              }
            />
          </div>

          {/* Why Choose */}
          <div className="flex justify-end">
            <CourseAddMoreLink
              onClick={() =>
                appendGridRow('whyChoose', (i) => ({
                  id: `wc-${Date.now()}-${i}`,
                  fileName: '',
                  hasIcon: true,
                }))
              }
            />
          </div>
          <SectionBar title={whyTitle} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {form.whyChoose.map((slot, idx) =>
              idx === 0 ? (
                <CourseMediaSlot
                  key={slot.id}
                  placeholder="Image to be displayed"
                  fileName={slot.fileName}
                  onFileChange={(e) => {
                    const file = e.target.files?.[0]
                    setForm((f) => {
                      const whyChoose = [...f.whyChoose]
                      whyChoose[idx] = { ...whyChoose[idx], fileName: file?.name || '' }
                      return { ...f, whyChoose }
                    })
                  }}
                />
              ) : (
                <CourseIconSlot
                  key={slot.id}
                  onClick={() => toast.message('Icon picker — connect media library when ready')}
                />
              ),
            )}
          </div>

          {/* How Will */}
          <div className="flex justify-end">
            <CourseAddMoreLink
              onClick={() =>
                appendGridRow('howWill', (i) => ({
                  id: `hw-${Date.now()}-${i}`,
                  kind: 'image',
                  fileName: '',
                  placeholder: 'Image to be displayed',
                }))
              }
            />
          </div>
          <SectionBar title={howTitle} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {form.howWill.map((slot, idx) => (
              <CourseMediaSlot
                key={slot.id}
                placeholder={slot.placeholder}
                icon={slot.kind === 'video' ? 'video' : 'image'}
                fileName={slot.fileName}
                onFileChange={(e) => {
                  const file = e.target.files?.[0]
                  setForm((f) => {
                    const howWill = [...f.howWill]
                    howWill[idx] = { ...howWill[idx], fileName: file?.name || '' }
                    return { ...f, howWill }
                  })
                }}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-center gap-4 border-t border-slate-200/80 pt-8">
            <button
              type="button"
              onClick={handleReset}
              className="min-w-[140px] rounded-full bg-gradient-to-r from-[#5eb8f5] to-[#2b78a5] px-10 py-3 text-base font-bold text-white shadow-[0_6px_18px_rgba(43,120,165,0.35)] transition hover:brightness-105"
            >
              Reset
            </button>
            <button
              type="submit"
              className="min-w-[140px] rounded-full bg-gradient-to-r from-[#0d3b66] to-[#05192d] px-10 py-3 text-base font-bold text-white shadow-[0_6px_18px_rgba(5,25,45,0.4)] transition hover:brightness-110"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
