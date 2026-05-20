import { useEffect, useMemo, useState } from 'react'
import { toast } from '@/utils/toast'
import FormModalSubmitBar from '../common/FormModalSubmitBar'
import Modal from '../ui/Modal'
import ModalPanelHeader from './ModalPanelHeader'
import SectionBar from './SectionBar'
import BatchDetailsSection from './BatchDetailsSection'
import BatchSubjectsSection from './BatchSubjectsSection'
import BatchFormSection from './BatchFormSection'
import WhyChooseFeaturesSection from './WhyChooseFeaturesSection'
import { nextCourseId } from '../../utils/batchHelpers'
import { SUB_CATEGORIES_BY_CATEGORY } from '../../data/coursesData'
import {
  courseRowToForm,
  createEmptyCourseForm,
} from '../../utils/academicsFormMappers'
import { useModalForm } from '../../hooks/useModalForm'
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

export default function AddCourseModal({
  open,
  onClose,
  item,
  categories = [],
  onSubmit,
  variant = 'batch',
  existingCourseIds = [],
}) {
  const isBatch = variant === 'batch'
  const { form, setForm, isEditMode, reset } = useModalForm(
    open,
    item,
    courseRowToForm,
    createEmptyCourseForm,
  )
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) setErrors({})
  }, [open, item])

  useEffect(() => {
    if (open && isBatch && !isEditMode) {
      setForm((f) => {
        if (f.courseId) return f
        return { ...f, courseId: nextCourseId(existingCourseIds.map((id) => ({ courseId: id }))) }
      })
    }
  }, [open, isBatch, isEditMode, existingCourseIds, setForm])

  const subCategoryOptions = useMemo(() => {
    if (!form.category) return []
    return SUB_CATEGORIES_BY_CATEGORY[form.category] || []
  }, [form.category])

  const update = (key) => (e) => {
    const value = e?.target ? e.target.value : e
    setForm((f) => ({ ...f, [key]: value }))
  }

  const handleClose = () => {
    onClose()
  }

  const handleReset = () => {
    reset()
    toast.message('Form reset')
  }

  const validateBatch = () => {
    const next = {}
    if (!form.batchName?.trim()) next.batchName = 'Batch name is required'
    if (!form.courseId?.trim()) next.courseId = 'Course ID is required'
    if (!form.commencement) next.commencement = 'Date of commencement is required'
    if (!form.durationLabel?.trim()) next.durationLabel = 'Duration is required'
    if (!form.batchStartFrom) next.batchStartFrom = 'Batch start date is required'
    if (!form.batchEndTo) next.batchEndTo = 'Batch end date is required'
    else if (form.batchStartFrom && form.batchEndTo < form.batchStartFrom) {
      next.batchEndTo = 'End date cannot be before start date'
    }
    if (!form.bannerPreview && !form.bannerFileName) {
      next.bannerPreview = 'Banner image is required'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isBatch) {
      if (!validateBatch()) {
        toast.error('Please fix the highlighted fields')
        return
      }
    } else if (!form.courseName.trim() || !form.category) {
      toast.error('Please fill required course details')
      return
    }
    try {
      await onSubmit?.(form, { isEdit: isEditMode, id: item?.id })
      toast.success(
        isEditMode
          ? isBatch
            ? 'Batch updated successfully'
            : 'Course updated successfully'
          : isBatch
            ? 'Batch created successfully'
            : 'Course created successfully',
      )
      handleClose()
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || `Failed to save ${isBatch ? 'batch' : 'course'}`
      toast.error(message)
    }
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

  const whyTitle = isBatch
    ? form.batchName
      ? `Why Choose ${[form.category, form.batchName].filter(Boolean).join(' ')} Course Help You?`
      : 'Why Choose { Category } {Course Name} Course Help You?'
    : form.category && form.courseName
      ? `Why Choose ${form.category} ${form.courseName} Course Help You?`
      : 'Why Choose { Category } {Course Name} Course Help You?'

  const howTitle = form.courseName
    ? `How Will the ${form.courseName} Helps You ?`
    : 'How Will the {Course Name} Helps You ?'

  const modalTitle = isBatch
    ? isEditMode
      ? 'Edit Batch'
      : 'Add Batch'
    : isEditMode
      ? 'Edit Course'
      : 'Add Course'

  const batchGrid = isBatch ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
  const sectionStack = isBatch ? 'space-y-8' : 'space-y-5 sm:space-y-6'
  const addMoreVariant = isBatch ? 'pill' : 'link'

  return (
    <Modal open={open} onClose={handleClose} size="full" title={modalTitle}>
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[min(92vh,960px)] flex-col overflow-hidden rounded-2xl bg-[#f0f4f8] shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
      >
        <ModalPanelHeader title={modalTitle} onBack={handleClose} />

        <div
          className={`flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-8 sm:py-7 ${sectionStack}`}
        >
          <div className={isBatch ? 'space-y-6' : ''}>
            <SectionBar title={isBatch ? 'Batch Details' : 'Course Details'} />
            {isBatch ? (
              <BatchFormSection>
                <BatchDetailsSection
                  form={form}
                  setForm={setForm}
                  errors={errors}
                  setErrors={setErrors}
                />
              </BatchFormSection>
            ) : null}
          </div>

          {!isBatch && (
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
                {form.bannerFileName ? (
                  <p className="mt-1 truncate text-[11px] text-[#246392]">{form.bannerFileName}</p>
                ) : null}
              </CourseFormField>
              <CourseFormField label="Center" required>
                <CourseInput value={form.center} onChange={update('center')} />
              </CourseFormField>
              <CourseFormField label="Status" required>
                <CourseSelect value={form.status} onChange={update('status')}>
                  <option value="Active">Active</option>
                  <option value="In Active">In Active</option>
                  <option value="Draft">Draft</option>
                </CourseSelect>
              </CourseFormField>
            </div>
          )}

          <div className={isBatch ? 'space-y-6' : ''}>
            <SectionBar title="Subject Details" />
            {isBatch ? (
              <BatchFormSection>
                <BatchSubjectsSection form={form} setForm={setForm} />
              </BatchFormSection>
            ) : (
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
              <div className="flex justify-end pt-2">
                <CourseAddMoreLink onClick={addSubjectRow} variant={addMoreVariant} />
              </div>
            </div>
            )}
          </div>

          <div className={isBatch ? 'space-y-6' : ''}>
            <SectionBar title="Fee Details" />
            {isBatch ? (
              <BatchFormSection>
                <div className="grid gap-6 sm:grid-cols-2">
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
              </BatchFormSection>
            ) : (
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
            )}
          </div>

          <div className={isBatch ? 'space-y-6' : ''}>
            <SectionBar title="Course Overview" />
            {isBatch ? (
              <BatchFormSection>
                <CourseTextarea
                  value={form.overview}
                  onChange={update('overview')}
                  rows={10}
                  placeholder=""
                />
              </BatchFormSection>
            ) : (
              <CourseTextarea
                value={form.overview}
                onChange={update('overview')}
                rows={8}
                placeholder=""
              />
            )}
          </div>

          <div className={isBatch ? 'space-y-6' : ''}>
            <SectionBar title="Key Features Of Course" />
            {isBatch ? (
              <BatchFormSection className="space-y-6">
                <div className={batchGrid}>
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
            ) : (
              <>
                <div className={batchGrid}>
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
              </>
            )}
          </div>

          <div className={isBatch ? 'space-y-6' : ''}>
            {!isBatch && (
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
            )}
            <SectionBar title={whyTitle} />
            {isBatch ? (
              <BatchFormSection>
                <WhyChooseFeaturesSection
                  features={form.whyChooseFeatures}
                  onChange={(whyChooseFeatures) =>
                    setForm((f) => ({ ...f, whyChooseFeatures }))
                  }
                />
              </BatchFormSection>
            ) : (
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
            )}
          </div>

          <div className={isBatch ? 'space-y-6' : ''}>
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
            {isBatch ? (
              <BatchFormSection>
                <div className={batchGrid}>
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
              </BatchFormSection>
            ) : (
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
            )}
          </div>
        </div>

        <div className="sticky bottom-0 z-10 shrink-0 border-t border-[#e5eaf2] bg-[#f0f4f8]/95 px-4 py-5 backdrop-blur-md sm:px-8">
          <FormModalSubmitBar
            isEditMode={isEditMode}
            onReset={handleReset}
            createLabel="Create"
            updateLabel="Update"
            className="border-t-0 pt-4"
          />
        </div>
      </form>
    </Modal>
  )
}
