import { useState } from 'react'
import { BookMarked, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import Modal from '../ui/Modal'
import ModalPanelHeader from '../courses/ModalPanelHeader'
import SectionBar from '../courses/SectionBar'
import { CourseFormField, CourseInput } from '../courses/CourseFormField'
import FileInputWithIcon from './FileInputWithIcon'

const emptyForm = {
  bookName: '',
  thumbnail: '',
  author: '',
  description: '',
  image1: '',
  image2: '',
  image3: '',
}

export default function AddBookModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleFile = (key) => (e) => {
    const file = e.target.files?.[0]
    setForm((f) => ({ ...f, [key]: file?.name || '' }))
  }

  const handleClose = () => {
    setForm(emptyForm)
    onClose()
  }

  const handleReset = () => setForm(emptyForm)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.bookName.trim() || !form.author.trim() || !form.description.trim()) {
      toast.error('Please fill all required fields')
      return
    }
    onSubmit?.(form)
    toast.success('Book saved successfully')
    handleClose()
  }

  return (
    <Modal open={open} onClose={handleClose} size="full">
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-xl bg-[#f7f7f7] shadow-[0_24px_60px_rgba(15,23,42,0.2)]"
      >
        <ModalPanelHeader title="Book" onBack={handleClose} icon={BookMarked} />

        <div className="space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6">
          <SectionBar title="Book Details" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CourseFormField label="Book Name" required>
              <CourseInput
                value={form.bookName}
                onChange={update('bookName')}
                placeholder="Enter book name"
              />
            </CourseFormField>
            <CourseFormField label="Book Thumbnail">
              <FileInputWithIcon
                icon={ImageIcon}
                value={form.thumbnail}
                onChange={handleFile('thumbnail')}
                accept="image/*"
                placeholder="Upload thumbnail"
              />
            </CourseFormField>
            <CourseFormField label="Author Name" required>
              <CourseInput
                value={form.author}
                onChange={update('author')}
                placeholder="Author name"
              />
            </CourseFormField>
          </div>

          <CourseFormField label="Book Description" required>
            <textarea
              value={form.description}
              onChange={update('description')}
              rows={4}
              placeholder="Enter book description"
              className="w-full resize-y rounded-lg bg-[#eef2fc] px-3 py-2.5 text-sm text-[#222] outline-none placeholder:text-[#9ca0a8] focus:ring-2 focus:ring-[#55ace7] sm:text-base"
            />
          </CourseFormField>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CourseFormField label="Book Image" required>
              <FileInputWithIcon
                icon={ImageIcon}
                value={form.image1}
                onChange={handleFile('image1')}
                accept="image/*"
                placeholder="Upload image"
              />
            </CourseFormField>
            <CourseFormField label="Book Image">
              <FileInputWithIcon
                icon={ImageIcon}
                value={form.image2}
                onChange={handleFile('image2')}
                accept="image/*"
                placeholder="Upload image"
              />
            </CourseFormField>
            <CourseFormField label="Book Image">
              <FileInputWithIcon
                icon={ImageIcon}
                value={form.image3}
                onChange={handleFile('image3')}
                accept="image/*"
                placeholder="Upload image"
              />
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
