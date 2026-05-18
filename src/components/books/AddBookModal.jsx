import { useState } from 'react'
import { BookMarked } from 'lucide-react'
import { toast } from '@/utils/toast'
import Modal from '../ui/Modal'
import ModalPanelHeader from '../courses/ModalPanelHeader'
import SectionBar from '../courses/SectionBar'
import {
  CourseAddMoreLink,
  CourseFileInput,
  CourseFormField,
  CourseInput,
  CoursePdfInput,
  CourseTextarea,
} from '../courses/CourseFormField'

const makeSlots = (count) => Array.from({ length: count }, () => ({ fileName: '' }))

const emptyForm = () => ({
  bookName: '',
  thumbnail: '',
  author: '',
  description: '',
  detailImages: makeSlots(3),
  galleryImages: makeSlots(3),
  keywords: Array.from({ length: 3 }, () => ({ value: '', fileName: '' })),
  samplePdf: '',
  bookPrice: '',
  discountPct: '',
  coupons: [{ code: '', discount: '', description: '' }],
})

export default function AddBookModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleClose = () => {
    setForm(emptyForm())
    onClose()
  }

  const handleReset = () => {
    setForm(emptyForm())
    toast.message('Form reset')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.bookName.trim() || !form.author.trim() || !form.description.trim()) {
      toast.error('Please fill all required book details')
      return
    }
    if (!form.bookPrice.trim()) {
      toast.error('Book price is required')
      return
    }
    onSubmit?.(form)
    toast.success('Book saved successfully')
    handleClose()
  }

  const setFileField = (key, file) => {
    setForm((f) => ({ ...f, [key]: file?.name || '' }))
  }

  const updateDetailImage = (index, file) => {
    setForm((f) => {
      const detailImages = [...f.detailImages]
      detailImages[index] = { fileName: file?.name || '' }
      return { ...f, detailImages }
    })
  }

  const updateGalleryImage = (index, file) => {
    setForm((f) => {
      const galleryImages = [...f.galleryImages]
      galleryImages[index] = { fileName: file?.name || '' }
      return { ...f, galleryImages }
    })
  }

  const updateKeyword = (index, patch) => {
    setForm((f) => {
      const keywords = [...f.keywords]
      keywords[index] = { ...keywords[index], ...patch }
      return { ...f, keywords }
    })
  }

  const updateCoupon = (index, key, value) => {
    setForm((f) => {
      const coupons = [...f.coupons]
      coupons[index] = { ...coupons[index], [key]: value }
      return { ...f, coupons }
    })
  }

  return (
    <Modal open={open} onClose={handleClose} size="full" title="Add Book">
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-xl bg-[#f0f4f8] shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
      >
        <ModalPanelHeader title="Book" onBack={handleClose} icon={BookMarked} />

        <div className="space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6">
          <SectionBar title="Book Details" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CourseFormField label="Book Name" required>
              <CourseInput value={form.bookName} onChange={update('bookName')} />
            </CourseFormField>
            <CourseFormField label="Book Thumbnail">
              <CourseFileInput
                placeholder="Upload thumbnail"
                onChange={(e) => setFileField('thumbnail', e.target.files?.[0])}
              />
              {form.thumbnail ? (
                <p className="mt-1 truncate text-[11px] text-[#246392]">{form.thumbnail}</p>
              ) : null}
            </CourseFormField>
            <CourseFormField label="Author Name" required>
              <CourseInput value={form.author} onChange={update('author')} />
            </CourseFormField>
          </div>

          <CourseFormField label="Book Description" required>
            <CourseTextarea value={form.description} onChange={update('description')} rows={5} />
          </CourseFormField>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {form.detailImages.map((slot, idx) => (
              <CourseFormField key={`detail-${idx}`} label="Book Image" required={idx === 0}>
                <CourseFileInput
                  placeholder=""
                  onChange={(e) => updateDetailImage(idx, e.target.files?.[0])}
                />
                {slot.fileName ? (
                  <p className="mt-1 truncate text-[11px] text-[#246392]">{slot.fileName}</p>
                ) : null}
              </CourseFormField>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {form.galleryImages.map((slot, idx) => (
              <CourseFormField key={`gallery-${idx}`} label="Book Image">
                <CourseFileInput
                  placeholder=""
                  onChange={(e) => updateGalleryImage(idx, e.target.files?.[0])}
                />
                {slot.fileName ? (
                  <p className="mt-1 truncate text-[11px] text-[#246392]">{slot.fileName}</p>
                ) : null}
              </CourseFormField>
            ))}
          </div>
          <div className="flex justify-end">
            <CourseAddMoreLink
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  galleryImages: [...f.galleryImages, ...makeSlots(3)],
                }))
              }
            >
              ADD MORE IMAGES
            </CourseAddMoreLink>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {form.keywords.map((slot, idx) => (
              <CourseFormField key={`kw-${idx}`} label="Key Word">
                {idx === 1 ? (
                  <CourseFileInput
                    placeholder={slot.fileName || ''}
                    onChange={(e) =>
                      updateKeyword(idx, { fileName: e.target.files?.[0]?.name || '' })
                    }
                  />
                ) : (
                  <CourseInput
                    value={slot.value}
                    onChange={(e) => updateKeyword(idx, { value: e.target.value })}
                  />
                )}
              </CourseFormField>
            ))}
          </div>
          <div className="flex justify-end">
            <CourseAddMoreLink
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  keywords: [...f.keywords, ...makeSlots(3).map(() => ({ value: '', fileName: '' }))],
                }))
              }
            >
              ADD MORE KEY WORDS
            </CourseAddMoreLink>
          </div>

          <CourseFormField label="Upload Sample Image" required>
            <CoursePdfInput
              fileName={form.samplePdf}
              onChange={(e) => setFileField('samplePdf', e.target.files?.[0])}
            />
          </CourseFormField>

          <SectionBar title="Price Details" />
          <div className="grid gap-4 sm:grid-cols-2">
            <CourseFormField label="Book Price" required>
              <CourseInput
                value={form.bookPrice}
                onChange={update('bookPrice')}
                inputMode="decimal"
                placeholder=""
              />
            </CourseFormField>
            <CourseFormField label="Discount (in %)">
              <CourseInput
                value={form.discountPct}
                onChange={update('discountPct')}
                inputMode="decimal"
                placeholder=""
              />
            </CourseFormField>
          </div>

          {form.coupons.map((coupon, idx) => (
            <div key={`coupon-${idx}`} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <CourseFormField label="Coupon Code" required={idx === 0}>
                <CourseInput
                  value={coupon.code}
                  onChange={(e) => updateCoupon(idx, 'code', e.target.value)}
                />
              </CourseFormField>
              <CourseFormField label="Coupon Discount">
                <CourseInput
                  value={coupon.discount}
                  onChange={(e) => updateCoupon(idx, 'discount', e.target.value)}
                />
              </CourseFormField>
              <CourseFormField label="Add Description" className="sm:col-span-2 lg:col-span-1">
                <CourseInput
                  value={coupon.description}
                  onChange={(e) => updateCoupon(idx, 'description', e.target.value)}
                />
              </CourseFormField>
            </div>
          ))}

          <div className="flex justify-end">
            <CourseAddMoreLink
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  coupons: [...f.coupons, { code: '', discount: '', description: '' }],
                }))
              }
            >
              ADD ANOTHER COUPON
            </CourseAddMoreLink>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 border-t border-slate-200/80 pt-8">
            <button
              type="button"
              onClick={handleReset}
              className="min-w-[140px] rounded-full bg-gradient-to-r from-[#5eb8f5] to-[#2b78a5] px-10 py-3 text-base font-bold text-white shadow-[0_6px_18px_rgba(43,120,165,0.35)] transition hover:brightness-105"
            >
              Reset
            </button>
            <button
              type="submit"
              className="min-w-[140px] rounded-full bg-gradient-to-r from-[#0d3b66] to-[#05192d] px-10 py-3 text-base font-bold text-white shadow-[0_6px_18px_rgba(5,25,45,0.4)] transition hover:brightness-110"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
