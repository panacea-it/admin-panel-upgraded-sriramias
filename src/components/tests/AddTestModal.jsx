import { ClipboardList } from 'lucide-react'
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
import { TEST_CENTERS, TEST_TYPES } from '../../data/testsData'
import { createEmptyTestForm, testRowToForm } from '../../utils/academicsFormMappers'
import { useModalForm } from '../../hooks/useModalForm'

export default function AddTestModal({ open, onClose, item, onSubmit }) {
  const { form, setForm, isEditMode, reset } = useModalForm(
    open,
    item,
    testRowToForm,
    createEmptyTestForm,
  )

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleClose = () => {
    onClose()
  }

  const handleReset = () => {
    reset()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.totalQuestions.trim() || !form.duration.trim()) {
      toast.error('Please fill required test details')
      return
    }
    onSubmit?.(form, { isEdit: isEditMode, id: item?.id })
    toast.success(isEditMode ? 'Test updated successfully' : 'Test created successfully')
    handleClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="full"
      title={isEditMode ? 'Edit Test' : 'Create Test'}
    >
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl bg-[#f7f7f7] shadow-[0_24px_60px_rgba(15,23,42,0.2)]"
      >
        <ModalPanelHeader
          title={isEditMode ? 'Edit Test' : 'Create Test'}
          onBack={handleClose}
          icon={ClipboardList}
        />

        <div className="space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6">
          <SectionBar title="Test Details" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CourseFormField label="Test Title" required>
              <CourseInput value={form.title} onChange={update('title')} />
            </CourseFormField>
            <CourseFormField label="Type" required>
              <CourseSelect value={form.type} onChange={update('type')}>
                {TEST_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </CourseSelect>
            </CourseFormField>
            <CourseFormField label="Center" required>
              <CourseSelect value={form.center} onChange={update('center')}>
                {TEST_CENTERS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </CourseSelect>
            </CourseFormField>
            <CourseFormField label="Total Questions" required>
              <CourseInput value={form.totalQuestions} onChange={update('totalQuestions')} inputMode="numeric" />
            </CourseFormField>
            <CourseFormField label="Duration" required>
              <CourseInput value={form.duration} onChange={update('duration')} placeholder="e.g. 120 min" />
            </CourseFormField>
            <CourseFormField label="Scheduled Date">
              <CourseInput type="date" value={form.scheduledAt} onChange={update('scheduledAt')} />
            </CourseFormField>
            <CourseFormField label="Status" required>
              <CourseSelect value={form.status} onChange={update('status')}>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="In Active">In Active</option>
              </CourseSelect>
            </CourseFormField>
            <CourseFormField label="Description" className="sm:col-span-2 lg:col-span-3">
              <CourseTextarea value={form.description} onChange={update('description')} rows={4} />
            </CourseFormField>
          </div>

          <FormModalSubmitBar
            isEditMode={isEditMode}
            onReset={handleReset}
            className="pt-2"
            createLabel="Create"
            updateLabel="Update"
          />
        </div>
      </form>
    </Modal>
  )
}
