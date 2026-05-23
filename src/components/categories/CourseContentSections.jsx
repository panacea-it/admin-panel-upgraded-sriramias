import { Plus, Trash2 } from 'lucide-react'
import SectionBar from '../courses/SectionBar'
import { CourseInput, CourseTextarea } from '../courses/CourseFormField'
import { buildHowHelpsTitle, buildWhyChooseTitle } from '../../utils/academicCourseForm'
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

  const keyFeatures = form.keyFeatures?.length ? form.keyFeatures : ['']

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
