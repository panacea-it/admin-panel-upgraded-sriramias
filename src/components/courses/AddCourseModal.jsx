import { useEffect, useState } from 'react'
import { toast } from '@/utils/toast'
import FormModalSubmitBar from '../common/FormModalSubmitBar'
import Modal from '../ui/Modal'
import ModalPanelHeader from './ModalPanelHeader'
import SectionBar from './SectionBar'
import BatchDetailsSection from './BatchDetailsSection'
import BatchFormSection from './BatchFormSection'
import { batchRowToForm, createEmptyBatchForm } from '../../utils/batchFormMappers'
import { useModalForm } from '../../hooks/useModalForm'

/** Batch create/edit only — course marketing content lives in Categories → Courses */
export default function AddCourseModal({
  open,
  onClose,
  item,
  onSubmit,
  existingCourseIds = [],
}) {
  const { form, setForm, isEditMode, reset } = useModalForm(
    open,
    item,
    batchRowToForm,
    createEmptyBatchForm,
  )
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) setErrors({})
  }, [open])

  const handleClose = () => onClose()

  const validateBatch = () => {
    const next = {}
    if (!form.batchName?.trim()) next.batchName = 'Batch name is required'
    if (!form.academicCourseId?.trim() && !form.courseId?.trim()) {
      next.courseId = 'Please select a course'
    }
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
    if (!validateBatch()) {
      toast.error('Please fix the highlighted fields')
      return
    }
    try {
      await onSubmit?.(form, { isEdit: isEditMode, id: item?.id })
      toast.success(isEditMode ? 'Batch updated successfully' : 'Batch created successfully')
      handleClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save batch')
    }
  }

  const modalTitle = isEditMode ? 'Edit Batch' : 'Add Batch'

  return (
    <Modal open={open} onClose={handleClose} size="full" title={modalTitle}>
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[min(92vh,720px)] flex-col overflow-hidden rounded-2xl bg-[#f0f4f8] shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
      >
        <ModalPanelHeader title={modalTitle} onBack={handleClose} />

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-8 sm:py-7">
          <div className="space-y-6">
            <SectionBar title="Batch Details" />
            <BatchFormSection>
              <BatchDetailsSection
                form={form}
                setForm={setForm}
                errors={errors}
                setErrors={setErrors}
                excludeCourseIds={isEditMode ? [] : existingCourseIds}
              />
            </BatchFormSection>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 shrink-0 border-t border-[#e5eaf2] bg-[#f0f4f8]/95 px-4 py-5 backdrop-blur-md sm:px-8">
          <FormModalSubmitBar
            isEditMode={isEditMode}
            onReset={() => {
              reset()
              setErrors({})
              toast.message('Form reset')
            }}
            createLabel="Create"
            updateLabel="Update"
            className="border-t-0 pt-4"
          />
        </div>
      </form>
    </Modal>
  )
}
