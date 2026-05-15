import { useRef, useState } from 'react'
import { FileText, Layers } from 'lucide-react'
import { toast } from 'sonner'
import Modal from '../ui/Modal'
import ModalPanelHeader from '../courses/ModalPanelHeader'
import SectionBar from '../courses/SectionBar'
import { CourseFormField, CourseInput, CourseSelect } from '../courses/CourseFormField'
import { MONTH_OPTIONS, YEAR_OPTIONS } from '../../data/currentAffairsData'

const emptyForm = {
  category: '',
  name: '',
  year: '',
  month: '',
  fileName: '',
}

export default function AddCurrentAffairsModal({ open, onClose, categories, onSubmit }) {
  const fileRef = useRef(null)
  const [form, setForm] = useState(emptyForm)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleClose = () => {
    setForm(emptyForm)
    if (fileRef.current) fileRef.current.value = ''
    onClose()
  }

  const handleReset = () => {
    setForm(emptyForm)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    setForm((f) => ({ ...f, fileName: file?.name || '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.category || !form.name.trim() || !form.year || !form.month) {
      toast.error('Please fill all required fields')
      return
    }
    onSubmit?.(form)
    toast.success('Current affairs saved')
    handleClose()
  }

  return (
    <Modal open={open} onClose={handleClose} size="full">
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-xl bg-[#f7f7f7] shadow-[0_24px_60px_rgba(15,23,42,0.2)]"
      >
        <ModalPanelHeader title="Current Affairs" onBack={handleClose} icon={Layers} />

        <div className="space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6">
          <SectionBar title="Current Affairs Details" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CourseFormField label="Current Affairs Category" required>
              <CourseSelect value={form.category} onChange={update('category')}>
                <option value="">Choose category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </CourseSelect>
            </CourseFormField>
            <CourseFormField label="Name" required>
              <CourseInput value={form.name} onChange={update('name')} placeholder="Enter name" />
            </CourseFormField>
            <CourseFormField label="Year" required>
              <CourseSelect value={form.year} onChange={update('year')}>
                <option value="">Select year</option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </CourseSelect>
            </CourseFormField>
            <CourseFormField label="Month" required>
              <CourseSelect value={form.month} onChange={update('month')}>
                <option value="">Select month</option>
                {MONTH_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </CourseSelect>
            </CourseFormField>
            <CourseFormField label="Upload PDF" required className="sm:col-span-2 lg:col-span-2">
              <div className="relative">
                <CourseInput
                  readOnly
                  value={form.fileName}
                  placeholder="Choose PDF to upload"
                  className="pr-12"
                />
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={handleFile}
                />
                <FileText className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#55ace7]" />
              </div>
            </CourseFormField>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-2 sm:gap-6">
            <button
              type="button"
              onClick={handleReset}
              className="h-11 min-w-[140px] rounded-lg bg-gradient-to-r from-[#55ace7] to-[#246392] px-8 text-sm font-bold text-white shadow-[0_4px_12px_rgba(36,99,146,0.35)] transition hover:opacity-95"
            >
              Reset
            </button>
            <button
              type="submit"
              className="h-11 min-w-[140px] rounded-lg bg-gradient-to-r from-[#1a3a5c] to-[#0f172a] px-8 text-sm font-bold text-white shadow-[0_4px_12px_rgba(15,23,42,0.35)] transition hover:opacity-95"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
