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

const makeSlots = (count, factory) => Array.from({ length: count }, (_, i) => factory(i))

const batchGrid = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
const addMoreVariant = 'pill'

/**
 * Course marketing sections — exact batch dialog implementation (AddCourseModal, isBatch).
 */
export default function CourseMarketingSections({
  form,
  setForm,
  courseName = '',
  examCategoryLabel = '',
}) {
  const update = (key) => (e) => {
    const value = e?.target ? e.target.value : e
    setForm((f) => ({ ...f, [key]: value }))
  }

  const appendGridRow = (key, factory) => {
    setForm((f) => ({
      ...f,
      [key]: [...f[key], ...makeSlots(3, (i) => factory(f[key].length + i))],
    }))
  }

  const whyTitle = buildWhyChooseTitle({
    examCategory: examCategoryLabel,
    courseName: courseName || form.name,
  })

  const howTitle = buildHowHelpsTitle(courseName || form.name)

  const keyFeatures = form.keyFeatures || []

  return (
    <>
      <div className="space-y-6">
        <SectionBar title="Course Overview" />
        <BatchFormSection>
          <CourseTextarea
            value={form.overview || ''}
            onChange={update('overview')}
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
                  key={slot.id}
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
                  key={slot.id}
                  value={slot.text}
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
              variant={addMoreVariant}
              onClick={() =>
                appendGridRow('keyFeatures', (i) => ({
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
            variant={addMoreVariant}
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
        <BatchFormSection>
          <div className={batchGrid}>
            {(form.howWill || []).map((slot, idx) => (
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
        </BatchFormSection>
      </div>
    </>
  )
}
