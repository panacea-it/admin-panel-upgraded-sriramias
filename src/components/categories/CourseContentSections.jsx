import SectionBar from '../courses/SectionBar'
import BatchFormSection from '../courses/BatchFormSection'
import WhyChooseFeaturesSection from '../courses/WhyChooseFeaturesSection'
import {
  CourseAddMoreLink,
  CourseInput,
  CourseMediaSlot,
  CourseTextarea,
} from '../courses/CourseFormField'
import { buildHowHelpsTitle, buildWhyChooseTitle } from '../../utils/academicCourseForm'

const batchGrid = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'

const makeSlots = (count, factory) => Array.from({ length: count }, (_, i) => factory(i))

function appendGridRow(setForm, key, factory) {
  setForm((f) => ({
    ...f,
    [key]: [...(f[key] || []), ...makeSlots(3, (i) => factory((f[key] || []).length + i))],
  }))
}

/**
 * Course marketing sections — same UI/UX as the legacy Add Batch dialog (isBatch sections).
 */
export default function CourseContentSections({
  form,
  setForm,
  courseName = '',
  examCategoryLabel = '',
}) {
  const whyTitle = buildWhyChooseTitle({
    examCategory: examCategoryLabel,
    courseName: courseName || form.name,
  })
  const howTitle = buildHowHelpsTitle(courseName || form.name)

  const updateOverview = (e) => {
    setForm((f) => ({ ...f, overview: e.target.value }))
  }

  const keyFeatures = form.keyFeatures?.length ? form.keyFeatures : []

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <SectionBar title="Course Overview" />
        <BatchFormSection>
          <CourseTextarea
            value={form.overview ?? ''}
            onChange={updateOverview}
            rows={10}
            placeholder=""
          />
        </BatchFormSection>
      </div>

      <div className="space-y-6">
        <SectionBar title="Key Features Of Course" />
        <BatchFormSection className="space-y-6">
          <div className={batchGrid}>
            {keyFeatures.map((slot, idx) =>
              idx === 0 ? (
                <CourseMediaSlot
                  key={slot.id || `kf-${idx}`}
                  placeholder="Image to be displayed"
                  fileName={slot.fileName}
                  onFileChange={(e) => {
                    const file = e.target.files?.[0]
                    setForm((f) => {
                      const next = [...f.keyFeatures]
                      next[0] = { ...next[0], fileName: file?.name || '' }
                      return { ...f, keyFeatures: next }
                    })
                  }}
                />
              ) : (
                <CourseInput
                  key={slot.id || `kf-${idx}`}
                  value={slot.text || ''}
                  onChange={(e) => {
                    const text = e.target.value
                    setForm((f) => {
                      const next = [...f.keyFeatures]
                      next[idx] = { ...next[idx], text }
                      return { ...f, keyFeatures: next }
                    })
                  }}
                  placeholder=""
                />
              ),
            )}
          </div>
          <div className="flex justify-end border-t border-gray-100 pt-5">
            <CourseAddMoreLink
              variant="pill"
              onClick={() =>
                appendGridRow(setForm, 'keyFeatures', (i) => ({
                  id: `kf-${Date.now()}-${i}`,
                  fileName: '',
                  text: '',
                }))
              }
            />
          </div>
        </BatchFormSection>
      </div>

      <div className="space-y-6">
        <SectionBar title={whyTitle} />
        <BatchFormSection>
          <WhyChooseFeaturesSection
            features={form.whyChooseFeatures}
            onChange={(whyChooseFeatures) => setForm((f) => ({ ...f, whyChooseFeatures }))}
          />
        </BatchFormSection>
      </div>

      <div className="space-y-6">
        <div className="flex justify-end">
          <CourseAddMoreLink
            variant="pill"
            onClick={() =>
              appendGridRow(setForm, 'howWill', (i) => ({
                id: `hw-${Date.now()}-${i}`,
                kind: 'image',
                fileName: '',
                placeholder: 'Image to be displayed',
              }))
            }
          />
        </div>
        <SectionBar title={howTitle} />
        <BatchFormSection>
          <div className={batchGrid}>
            {(form.howWill || []).map((slot, idx) => (
              <CourseMediaSlot
                key={slot.id || `hw-${idx}`}
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
        </BatchFormSection>
      </div>
    </div>
  )
}
