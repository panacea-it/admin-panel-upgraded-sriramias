import { useEffect, useRef } from 'react'
import BatchFormSection from '../courses/BatchFormSection'
import EditableSectionBar from '../courses/EditableSectionBar'
import WhyChooseFeaturesSection from '../courses/WhyChooseFeaturesSection'
import {
  CourseAddMoreLink,
  CourseInput,
  CourseMediaSlot,
  CourseTextarea,
} from '../courses/CourseFormField'
import {
  buildDefaultSectionTitles,
  buildHowHelpsTitle,
  buildWhyChooseTitle,
  DEFAULT_SECTION_TITLE_KEY_FEATURES,
  DEFAULT_SECTION_TITLE_OVERVIEW,
} from '../../utils/academicCourseForm'

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
  const defaultWhyTitle = buildWhyChooseTitle({
    examCategory: examCategoryLabel,
    courseName: courseName || form.name,
  })
  const defaultHowTitle = buildHowHelpsTitle(courseName || form.name)
  const prevDynamicDefaults = useRef({ why: defaultWhyTitle, how: defaultHowTitle })

  useEffect(() => {
    const prev = prevDynamicDefaults.current
    setForm((f) => {
      let sectionTitleWhyChoose = f.sectionTitleWhyChoose
      let sectionTitleHowHelps = f.sectionTitleHowHelps

      if (
        !sectionTitleWhyChoose?.trim() ||
        sectionTitleWhyChoose === prev.why
      ) {
        sectionTitleWhyChoose = defaultWhyTitle
      }
      if (
        !sectionTitleHowHelps?.trim() ||
        sectionTitleHowHelps === prev.how
      ) {
        sectionTitleHowHelps = defaultHowTitle
      }

      if (
        sectionTitleWhyChoose === f.sectionTitleWhyChoose &&
        sectionTitleHowHelps === f.sectionTitleHowHelps
      ) {
        return f
      }

      return { ...f, sectionTitleWhyChoose, sectionTitleHowHelps }
    })
    prevDynamicDefaults.current = { why: defaultWhyTitle, how: defaultHowTitle }
  }, [defaultWhyTitle, defaultHowTitle, setForm])

  const setSectionTitle = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const updateOverview = (e) => {
    setForm((f) => ({ ...f, overview: e.target.value }))
  }

  const keyFeatures = form.keyFeatures?.length ? form.keyFeatures : []
  const sectionDefaults = buildDefaultSectionTitles({
    examCategory: examCategoryLabel,
    courseName: courseName || form.name,
  })

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <EditableSectionBar
          value={form.sectionTitleOverview ?? ''}
          defaultValue={DEFAULT_SECTION_TITLE_OVERVIEW}
          onChange={setSectionTitle('sectionTitleOverview')}
          placeholder={DEFAULT_SECTION_TITLE_OVERVIEW}
          aria-label="Course Overview section title"
        />
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
        <EditableSectionBar
          value={form.sectionTitleKeyFeatures ?? ''}
          defaultValue={DEFAULT_SECTION_TITLE_KEY_FEATURES}
          onChange={setSectionTitle('sectionTitleKeyFeatures')}
          placeholder={DEFAULT_SECTION_TITLE_KEY_FEATURES}
          aria-label="Key Features section title"
        />
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
        <EditableSectionBar
          value={form.sectionTitleWhyChoose ?? ''}
          defaultValue={defaultWhyTitle}
          onChange={setSectionTitle('sectionTitleWhyChoose')}
          placeholder={sectionDefaults.sectionTitleWhyChoose}
          aria-label="Why Choose section title"
        />
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
        <EditableSectionBar
          value={form.sectionTitleHowHelps ?? ''}
          defaultValue={defaultHowTitle}
          onChange={setSectionTitle('sectionTitleHowHelps')}
          placeholder={sectionDefaults.sectionTitleHowHelps}
          aria-label="How Will section title"
        />
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
