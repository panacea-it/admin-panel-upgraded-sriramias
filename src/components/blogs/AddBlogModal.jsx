import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { toast } from '@/utils/toast'
import Modal from '../ui/Modal'
import ModalPanelHeader from '../courses/ModalPanelHeader'
import SectionBar from '../courses/SectionBar'
import {
  CourseAddMoreLink,
  CourseFormField,
  CourseInput,
  CourseMediaSlot,
  CourseTextarea,
} from '../courses/CourseFormField'
import { cn } from '../../utils/cn'
import { createEmptyBlog, createEmptySection } from '../../data/blogsData'

function cloneBlog(blog) {
  return {
    ...blog,
    sections: (blog.sections || []).map((s) => ({ ...s })),
  }
}

function emptySection(blogId) {
  return createEmptySection(blogId)
}

export default function AddBlogModal({ open, onClose, blog, onSave }) {
  const isEdit = Boolean(blog?.id)
  const [form, setForm] = useState(createEmptyBlog)
  const [initialSnapshot, setInitialSnapshot] = useState(null)

  useEffect(() => {
    if (!open) return
    const next = blog ? cloneBlog(blog) : createEmptyBlog()
    if (!next.sections?.length) {
      next.sections = [emptySection(next.id)]
    }
    setForm(next)
    setInitialSnapshot(cloneBlog(next))
  }, [open, blog])

  const setField = (key) => (e) => {
    const value = e?.target ? e.target.value : e
    setForm((f) => ({ ...f, [key]: value }))
  }

  const setSection = (sectionId, key, value) => {
    setForm((f) => ({
      ...f,
      sections: f.sections.map((s) =>
        s.id === sectionId ? { ...s, [key]: value } : s,
      ),
    }))
  }

  const handleSectionFile = (sectionId, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setForm((f) => ({
      ...f,
      sections: f.sections.map((s) =>
        s.id === sectionId
          ? { ...s, image: file.name, imageName: file.name }
          : s,
      ),
    }))
  }

  const handleBackgroundFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setForm((f) => ({
      ...f,
      backgroundImage: file.name,
      backgroundImageName: file.name,
    }))
  }

  const addSection = () => {
    setForm((f) => ({
      ...f,
      sections: [...f.sections, emptySection(f.id)],
    }))
  }

  const handleClose = () => {
    onClose()
  }

  const handleReset = () => {
    if (initialSnapshot) {
      setForm(cloneBlog(initialSnapshot))
    } else {
      setForm(createEmptyBlog())
    }
    toast.message('Form reset')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Blog title is required')
      return
    }
    if (!form.backgroundImageName && !form.backgroundImage) {
      toast.error('Background image is required')
      return
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      publishedAt: form.publishedAt || new Date().toISOString(),
    }
    onSave?.(payload, { isEdit })
    toast.success(isEdit ? 'Blog updated successfully' : 'Blog created successfully')
    handleClose()
  }

  return (
    <Modal open={open} onClose={handleClose} size="full" title={isEdit ? 'Edit Blog' : 'Add Blog'}>
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[min(92vh,880px)] flex-col overflow-hidden rounded-xl bg-[#f0f4f8] shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
      >
        <ModalPanelHeader
          title="Blog"
          icon={FileText}
          iconClassName="text-[#246392]"
          onBack={handleClose}
        />

        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6">
            <SectionBar title="Blog Details" />

            <div className="space-y-5">
              <CourseFormField label="Title" required>
                <CourseInput
                  value={form.title}
                  onChange={setField('title')}
                  placeholder="Enter blog title"
                />
              </CourseFormField>

              <CourseFormField label="Background Image" required>
                <CourseMediaSlot
                  placeholder="312*214 Kb"
                  fileName={form.backgroundImageName || form.backgroundImage}
                  onFileChange={handleBackgroundFile}
                  accept="image/*"
                />
              </CourseFormField>
            </div>

            <SectionBar title="Table Of Content" />

            <div className="space-y-8">
              {form.sections.map((section, index) => (
                <div key={section.id} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                    <CourseFormField label={`Topic ${index + 1}`}>
                      <CourseInput
                        value={section.topic}
                        onChange={(e) =>
                          setSection(section.id, 'topic', e.target.value)
                        }
                        placeholder={`Topic ${index + 1}`}
                      />
                    </CourseFormField>
                    <CourseFormField label="Image">
                      <CourseMediaSlot
                        placeholder="Upload image"
                        fileName={section.imageName || section.image}
                        onFileChange={(e) => handleSectionFile(section.id, e)}
                        accept="image/*"
                      />
                    </CourseFormField>
                  </div>
                  <CourseFormField label="Content">
                    <CourseTextarea
                      rows={5}
                      value={section.content}
                      onChange={(e) =>
                        setSection(section.id, 'content', e.target.value)
                      }
                      placeholder="Write section content…"
                    />
                  </CourseFormField>
                </div>
              ))}

              <div className="flex justify-end pt-1">
                <CourseAddMoreLink onClick={addSection} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse items-center justify-center gap-3 border-t border-slate-200/80 bg-[#f0f4f8] px-4 py-5 sm:flex-row sm:gap-6 sm:px-6">
          <button
            type="button"
            onClick={handleReset}
            className={cn(
              'min-w-[140px] rounded-full bg-[#e8f4fc] px-8 py-3 text-base font-bold text-[#246392] shadow-sm transition hover:bg-[#d9ebf9]',
            )}
          >
            Reset
          </button>
          <button
            type="submit"
            className="min-w-[140px] rounded-full bg-[#1a3a5c] px-8 py-3 text-base font-bold text-white shadow-[0_6px_16px_rgba(26,58,92,0.35)] transition hover:bg-[#152f4a]"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  )
}
