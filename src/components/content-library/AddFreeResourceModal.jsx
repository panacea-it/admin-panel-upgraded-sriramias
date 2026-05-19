import { useRef } from 'react'
import { BookMarked, Layers } from 'lucide-react'
import { toast } from '@/utils/toast'
import FormModalSubmitBar from '../common/FormModalSubmitBar'
import Modal from '../ui/Modal'
import ModalPanelHeader from '../courses/ModalPanelHeader'
import SectionBar from '../courses/SectionBar'
import { CourseFormField, CourseInput, CourseSelect } from '../courses/CourseFormField'
import {
  createEmptyFreeResourceForm,
  freeResourceRowToForm,
} from '../../utils/academicsFormMappers'
import { useModalForm } from '../../hooks/useModalForm'

export default function AddFreeResourceModal({ open, onClose, item, categories, onSubmit }) {
  const fileRef = useRef(null)
  const { form, setForm, isEditMode, reset } = useModalForm(
    open,
    item,
    freeResourceRowToForm,
    createEmptyFreeResourceForm,
  )

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleClose = () => {
    if (fileRef.current) fileRef.current.value = ''
    onClose()
  }

  const handleReset = () => {
    reset()
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    setForm((f) => ({ ...f, fileName: file?.name || f.fileName }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.category || !form.subject.trim() || !form.className.trim() || !form.bookName.trim()) {
      toast.error('Please fill all required fields')
      return
    }
    onSubmit?.(form, { isEdit: isEditMode, id: item?.id })
    toast.success(
      isEditMode ? 'Free resource updated successfully' : 'Free resource created successfully',
    )
    handleClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="full"
      title={isEditMode ? 'Edit Free Resource' : 'Add Free Resource'}
    >
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl bg-[#f7f7f7] shadow-[0_24px_60px_rgba(15,23,42,0.2)]"
      >
        <ModalPanelHeader
          title={isEditMode ? 'Edit Free Resource' : 'Add Free Resource'}
          onBack={handleClose}
          icon={Layers}
        />

        <div className="space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6">
          <SectionBar title="Free Resource Details" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CourseFormField label="Free Resource Category" required>
              <CourseSelect value={form.category} onChange={update('category')}>
                <option value="">Choose category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </CourseSelect>
            </CourseFormField>
            <CourseFormField label="Subject" required>
              <CourseInput value={form.subject} onChange={update('subject')} placeholder="Subject" />
            </CourseFormField>
            <CourseFormField label="Class" required>
              <CourseInput value={form.className} onChange={update('className')} placeholder="Class" />
            </CourseFormField>
            <CourseFormField label="Book Name" required className="sm:col-span-2 lg:col-span-1">
              <CourseInput value={form.bookName} onChange={update('bookName')} placeholder="Book name" />
            </CourseFormField>
            <CourseFormField label="Status" required>
              <CourseSelect value={form.status} onChange={update('status')}>
                <option value="Active">Active</option>
                <option value="In Active">In Active</option>
                <option value="Draft">Draft</option>
              </CourseSelect>
            </CourseFormField>
            <CourseFormField label="Upload Book" required className="sm:col-span-2 lg:col-span-2">
              <div className="relative">
                <CourseInput
                  readOnly
                  value={form.fileName}
                  placeholder="Choose file to upload"
                  className="pr-12"
                />
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.epub,.doc,.docx"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={handleFile}
                />
                <BookMarked className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#55ace7]" />
              </div>
              {form.fileName ? (
                <p className="mt-1 truncate text-[11px] text-[#246392]">Current: {form.fileName}</p>
              ) : null}
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
