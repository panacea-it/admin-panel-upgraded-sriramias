import { useState } from 'react'
import { Calendar, ImageIcon, TicketPercent } from 'lucide-react'
import { toast } from 'sonner'
import Modal from '../ui/Modal'
import ModalPanelHeader from '../courses/ModalPanelHeader'
import SectionBar from '../courses/SectionBar'
import { CourseFormField, CourseInput, CourseSelect } from '../courses/CourseFormField'
import FileInputWithIcon from '../books/FileInputWithIcon'

const emptyForm = {
  couponName: '',
  couponCode: '',
  type: 'Percentage',
  value: '',
  validFrom: '',
  validTill: '',
  category: 'Course',
  backgroundImage: '',
  usageLimit: '',
  perUserLimit: '',
}

export default function AddCouponModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleClose = () => {
    setForm(emptyForm)
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.couponName.trim() || !form.couponCode.trim() || !form.validFrom || !form.validTill) {
      toast.error('Please fill required coupon details')
      return
    }
    onSubmit?.(form)
    toast.success('Coupon created')
    handleClose()
  }

  return (
    <Modal open={open} onClose={handleClose} size="full">
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-xl bg-[#f7f7f7] shadow-[0_24px_60px_rgba(15,23,42,0.2)]"
      >
        <ModalPanelHeader title="Coupon" onBack={handleClose} icon={TicketPercent} />

        <div className="space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6">
          <SectionBar title="Coupon Details" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CourseFormField label="Coupon Name" required>
              <CourseInput value={form.couponName} onChange={update('couponName')} />
            </CourseFormField>
            <CourseFormField label="Coupon Code" required>
              <CourseInput value={form.couponCode} onChange={update('couponCode')} />
            </CourseFormField>
            <CourseFormField label="Type" required>
              <CourseSelect value={form.type} onChange={update('type')}>
                <option value="Percentage">Percentage</option>
                <option value="Flat Discount">Flat Discount</option>
                <option value="BOGO">BOGO</option>
              </CourseSelect>
            </CourseFormField>
            <CourseFormField label="Percentage Value" required>
              <CourseInput
                value={form.value}
                onChange={update('value')}
                placeholder="e.g. 20"
                className="pr-12"
              />
            </CourseFormField>
            <CourseFormField label="Valid From" required>
              <div className="relative">
                <CourseInput type="date" value={form.validFrom} onChange={update('validFrom')} />
                <Calendar className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#55ace7]" />
              </div>
            </CourseFormField>
            <CourseFormField label="Valid Till" required>
              <div className="relative">
                <CourseInput type="date" value={form.validTill} onChange={update('validTill')} />
                <Calendar className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#55ace7]" />
              </div>
            </CourseFormField>
            <CourseFormField label="Category">
              <CourseSelect value={form.category} onChange={update('category')}>
                <option value="Course">Course</option>
                <option value="Books">Books</option>
                <option value="All">All</option>
              </CourseSelect>
            </CourseFormField>
            <CourseFormField label="Background Image" required className="sm:col-span-2">
              <FileInputWithIcon
                icon={ImageIcon}
                value={form.backgroundImage}
                onChange={(e) =>
                  setForm((f) => ({ ...f, backgroundImage: e.target.files?.[0]?.name || '' }))
                }
                accept="image/*"
                placeholder="Upload image"
              />
            </CourseFormField>
          </div>

          <SectionBar title="Usage Limit" />

          <div className="grid gap-4 sm:grid-cols-2">
            <CourseFormField label="Total Usage Limit">
              <CourseInput
                value={form.usageLimit}
                onChange={update('usageLimit')}
                placeholder="e.g. 1000"
              />
            </CourseFormField>
            <CourseFormField label="Per User Limit">
              <CourseInput
                value={form.perUserLimit}
                onChange={update('perUserLimit')}
                placeholder="e.g. 1"
              />
            </CourseFormField>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="h-11 min-w-[140px] rounded-lg bg-gradient-to-r from-[#55ace7] to-[#246392] px-8 text-sm font-bold text-white"
            >
              Reset
            </button>
            <button
              type="submit"
              className="h-11 min-w-[140px] rounded-lg bg-gradient-to-r from-[#1a3a5c] to-[#0f172a] px-8 text-sm font-bold text-white"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
