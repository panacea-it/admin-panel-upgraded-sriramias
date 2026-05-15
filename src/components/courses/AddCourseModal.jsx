import { useState } from 'react'
import { toast } from 'sonner'
import Modal from '../ui/Modal'
import ModalPanelHeader from './ModalPanelHeader'
import SectionBar from './SectionBar'
import { CourseFormField, CourseInput, CourseSelect } from './CourseFormField'

const emptyForm = {
  courseName: '',
  category: '',
  commencement: '',
  duration: '',
  onlineFees: '',
  onlineDiscount: '',
  offlineFees: '',
  offlineDiscount: '',
}

export default function AddCourseModal({ open, onClose, categories, onSubmit }) {
  const [form, setForm] = useState(emptyForm)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleClose = () => {
    setForm(emptyForm)
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.courseName.trim() || !form.category) {
      toast.error('Please fill required course details')
      return
    }
    onSubmit?.(form)
    toast.success('Course added successfully')
    handleClose()
  }

  return (
    <Modal open={open} onClose={handleClose} size="full">
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-xl bg-[#f7f7f7] shadow-[0_24px_60px_rgba(15,23,42,0.2)]"
      >
        <ModalPanelHeader title="Add Course" onBack={handleClose} />

        <div className="space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6">
          <SectionBar title="Course Details" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CourseFormField label="Course Name" required className="sm:col-span-2 lg:col-span-1">
              <CourseInput
                value={form.courseName}
                onChange={update('courseName')}
                placeholder="Enter course name"
              />
            </CourseFormField>
            <CourseFormField label="Course Category" required>
              <CourseSelect value={form.category} onChange={update('category')}>
                <option value="">Choose Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </CourseSelect>
            </CourseFormField>
            <CourseFormField label="Date of commencement" required>
              <CourseInput type="date" value={form.commencement} onChange={update('commencement')} />
            </CourseFormField>
            <CourseFormField label="Duration" required className="sm:col-span-2 lg:col-span-1">
              <CourseInput
                value={form.duration}
                onChange={update('duration')}
                placeholder="e.g. 24 months"
              />
            </CourseFormField>
          </div>

          <SectionBar title="Fee Details" />
          <div className="grid gap-4 sm:grid-cols-2">
            <CourseFormField label="Fees for Online classes" required>
              <CourseInput
                value={form.onlineFees}
                onChange={update('onlineFees')}
                placeholder="Amount"
              />
            </CourseFormField>
            <CourseFormField label="Discount (in %)">
              <CourseInput
                value={form.onlineDiscount}
                onChange={update('onlineDiscount')}
                placeholder="0"
              />
            </CourseFormField>
            <CourseFormField label="Fees for Offline classes" required>
              <CourseInput
                value={form.offlineFees}
                onChange={update('offlineFees')}
                placeholder="Amount"
              />
            </CourseFormField>
            <CourseFormField label="Discount (in %)">
              <CourseInput
                value={form.offlineDiscount}
                onChange={update('offlineDiscount')}
                placeholder="0"
              />
            </CourseFormField>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200/80 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="h-11 rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-[#555] transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-11 rounded-lg bg-[#1a3a5c] px-8 text-sm font-bold text-white shadow-[0_4px_12px_rgba(26,58,92,0.35)] transition hover:bg-[#152f4a]"
            >
              Save Course
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
