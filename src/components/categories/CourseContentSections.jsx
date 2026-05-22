import { Plus, Trash2 } from 'lucide-react'
import SectionBar from '../courses/SectionBar'
import {
  CourseAddMoreLink,
  CourseFormField,
  CourseInput,
  CourseSelect,
  CourseTextarea,
} from '../courses/CourseFormField'
import {
  buildHowHelpsTitle,
  buildWhyChooseTitle,
  COURSE_CURRENCIES,
  emptySubjectRow,
} from '../../utils/academicCourseForm'
import { cn } from '../../utils/cn'

function FieldError({ message }) {
  if (!message) return null
  return <p className="text-xs font-medium text-[#dc2626]">{message}</p>
}

export default function CourseContentSections({
  form,
  setForm,
  errors = {},
  courseName = '',
  examCategoryLabel = '',
}) {
  const whyTitle = buildWhyChooseTitle({
    examCategory: examCategoryLabel,
    courseName: courseName || form.name,
  })
  const howTitle = buildHowHelpsTitle(courseName || form.name)

  const updateFee = (key, value) => {
    setForm((f) => ({
      ...f,
      feeDetails: { ...f.feeDetails, [key]: value },
    }))
  }

  const subjects = form.subjects?.length ? form.subjects : [emptySubjectRow()]
  const keyFeatures = form.keyFeatures?.length ? form.keyFeatures : ['']

  const updateSubject = (index, patch) => {
    setForm((f) => {
      const next = [...(f.subjects || [emptySubjectRow()])]
      next[index] = { ...next[index], ...patch }
      return { ...f, subjects: next }
    })
  }

  const addSubject = () => {
    setForm((f) => ({
      ...f,
      subjects: [...(f.subjects || []).filter((s) => s.subjectName), emptySubjectRow()],
    }))
  }

  const removeSubject = (index) => {
    setForm((f) => {
      const next = [...(f.subjects || [])]
      next.splice(index, 1)
      return { ...f, subjects: next.length ? next : [emptySubjectRow()] }
    })
  }

  const updateFeature = (index, value) => {
    setForm((f) => {
      const next = [...(f.keyFeatures || [''])]
      next[index] = value
      return { ...f, keyFeatures: next }
    })
  }

  const addFeature = () => {
    setForm((f) => ({ ...f, keyFeatures: [...(f.keyFeatures || ['']), ''] }))
  }

  const removeFeature = (index) => {
    setForm((f) => {
      const next = [...(f.keyFeatures || [''])]
      next.splice(index, 1)
      return { ...f, keyFeatures: next.length ? next : [''] }
    })
  }

  const overviewLen = String(form.courseOverview || '').trim().length

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <SectionBar title="Subject Details" />
        <div className="space-y-4 rounded-xl bg-white px-4 py-5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] sm:px-6">
          {subjects.map((row, idx) => (
            <div
              key={`subj-${idx}`}
              className="grid gap-4 border-b border-[#eef2fc] pb-4 last:border-0 last:pb-0 sm:grid-cols-2"
            >
              <CourseFormField label="Subject Name" required>
                <CourseInput
                  value={row.subjectName}
                  onChange={(e) => updateSubject(idx, { subjectName: e.target.value })}
                  placeholder="e.g. Indian Polity"
                />
              </CourseFormField>
              <CourseFormField label="Faculty Name">
                <CourseInput
                  value={row.facultyName}
                  onChange={(e) => updateSubject(idx, { facultyName: e.target.value })}
                  placeholder="Optional"
                />
              </CourseFormField>
              {subjects.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSubject(idx)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#c96565] hover:underline sm:col-span-2"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove subject
                </button>
              )}
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <CourseAddMoreLink onClick={addSubject} variant="pill" />
          </div>
          <FieldError message={errors.subjects} />
        </div>
      </div>

      <div className="space-y-4">
        <SectionBar title="Fee Details" />
        <div className="grid gap-4 rounded-xl bg-white px-4 py-5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] sm:grid-cols-2 sm:px-6">
          <CourseFormField label="Currency">
            <CourseSelect
              value={form.feeDetails?.currency || 'INR'}
              onChange={(e) => updateFee('currency', e.target.value)}
            >
              {COURSE_CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </CourseSelect>
          </CourseFormField>
          <CourseFormField label="Course Fee" required>
            <CourseInput
              type="number"
              min={0}
              value={form.feeDetails?.courseFee ?? ''}
              onChange={(e) => updateFee('courseFee', e.target.value)}
              placeholder="e.g. 75000"
            />
            <FieldError message={errors.courseFee} />
          </CourseFormField>
          <CourseFormField label="Discount Fee">
            <CourseInput
              type="number"
              min={0}
              value={form.feeDetails?.discountFee ?? ''}
              onChange={(e) => updateFee('discountFee', e.target.value)}
              placeholder="Optional discounted amount"
            />
          </CourseFormField>
          <CourseFormField label="Installment Option" className="sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e8f4fc] bg-[#fafcff] px-4 py-3">
              <input
                type="checkbox"
                checked={Boolean(form.feeDetails?.installmentAvailable)}
                onChange={(e) => updateFee('installmentAvailable', e.target.checked)}
                className="h-4 w-4 rounded accent-[#246392]"
              />
              <span className="text-sm font-medium text-[#333]">
                Installment payment available for this course
              </span>
            </label>
          </CourseFormField>
        </div>
      </div>

      <div className="space-y-4">
        <SectionBar title="Course Overview" />
        <div className="rounded-xl bg-white px-4 py-5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] sm:px-6">
          <CourseTextarea
            value={form.courseOverview}
            onChange={(e) => setForm((f) => ({ ...f, courseOverview: e.target.value }))}
            rows={8}
            placeholder="Describe the course objectives, syllabus highlights, and outcomes (min. 100 characters)…"
            className={cn(errors.courseOverview && 'ring-2 ring-red-400')}
          />
          <p className="mt-1 text-xs text-[#686868]">
            {overviewLen}/100 characters minimum
          </p>
          <FieldError message={errors.courseOverview} />
        </div>
      </div>

      <div className="space-y-4">
        <SectionBar title="Key Features Of Course" />
        <div className="space-y-3 rounded-xl bg-white px-4 py-5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] sm:px-6">
          {keyFeatures.map((text, idx) => (
            <div key={`kf-${idx}`} className="flex gap-2">
              <span className="mt-3 text-[#55ace7]">•</span>
              <CourseInput
                value={text}
                onChange={(e) => updateFeature(idx, e.target.value)}
                placeholder="Feature bullet point"
                className="flex-1"
              />
              {keyFeatures.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFeature(idx)}
                  className="mt-2 rounded-lg p-2 text-[#c96565] hover:bg-red-50"
                  aria-label="Remove feature"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addFeature}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#246392] hover:underline"
          >
            <Plus className="h-4 w-4" />
            Add feature
          </button>
          <FieldError message={errors.keyFeatures} />
        </div>
      </div>

      <div className="space-y-4">
        <SectionBar title={whyTitle} />
        <div className="rounded-xl bg-white px-4 py-5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] sm:px-6">
          <CourseTextarea
            value={form.whyChooseCourse}
            onChange={(e) => setForm((f) => ({ ...f, whyChooseCourse: e.target.value }))}
            rows={6}
            placeholder="Explain why students should choose this course…"
          />
          <FieldError message={errors.whyChooseCourse} />
        </div>
      </div>

      <div className="space-y-4">
        <SectionBar title={howTitle} />
        <div className="rounded-xl bg-white px-4 py-5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] sm:px-6">
          <CourseTextarea
            value={form.howCourseHelps}
            onChange={(e) => setForm((f) => ({ ...f, howCourseHelps: e.target.value }))}
            rows={6}
            placeholder="Describe outcomes, support, and student benefits…"
          />
          <FieldError message={errors.howCourseHelps} />
        </div>
      </div>
    </div>
  )
}
