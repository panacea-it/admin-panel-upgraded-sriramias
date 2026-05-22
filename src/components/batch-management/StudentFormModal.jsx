import { useRef, useState } from 'react'
import { getModalEditKey, useInitOnModalOpen } from '../../hooks/modalFormSync'
import { UserPlus, UserPen } from 'lucide-react'
import Modal from '../ui/Modal'
import { PAYMENT_STATUSES } from '../../data/batchManagementData'
import { cn } from '../../utils/cn'

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  course: '',
  batch: '',
  paymentStatus: 'Pending',
  attendance: '',
  progress: '',
}

function Field({ label, children, className }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#686868]">
        {label}
      </span>
      {children}
    </label>
  )
}

const inputClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#222] outline-none transition focus:border-[#55ace7] focus:ring-2 focus:ring-[#55ace7]/25'

export default function StudentFormModal({
  open,
  onClose,
  mode = 'add',
  initialValues,
  seedKey,
  onSubmit,
  saving = false,
}) {
  const [form, setForm] = useState(EMPTY)
  const initialRef = useRef(initialValues)
  initialRef.current = initialValues
  const editKey = seedKey ?? `${mode}:${getModalEditKey(initialValues)}`

  useInitOnModalOpen(open, editKey, () => {
    setForm({ ...EMPTY, ...initialRef.current })
  })

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  const isEdit = mode === 'edit'
  const title = isEdit ? 'Edit Student' : 'Add Student'

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl"
      >
        <div className="border-b border-slate-100 bg-gradient-to-r from-[#eef6fc] to-white px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#55ace7]/15 text-[#246392]">
              {isEdit ? (
                <UserPen className="h-5 w-5" strokeWidth={2.2} />
              ) : (
                <UserPlus className="h-5 w-5" strokeWidth={2.2} />
              )}
            </span>
            <div>
              <h2 className="text-lg font-bold text-[#111]">{title}</h2>
              <p className="text-sm text-[#686868]">
                {isEdit ? 'Update student enrollment details' : 'Enroll a new student in this batch'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          <Field label="Full Name" className="sm:col-span-2">
            <input
              required
              value={form.name}
              onChange={handleChange('name')}
              className={inputClass}
              placeholder="Student full name"
            />
          </Field>
          <Field label="Email">
            <input
              required
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              className={inputClass}
              placeholder="email@example.com"
            />
          </Field>
          <Field label="Phone Number">
            <input
              required
              value={form.phone}
              onChange={handleChange('phone')}
              className={inputClass}
              placeholder="+91 98765 43210"
            />
          </Field>
          <Field label="Course">
            <input
              readOnly
              value={form.course}
              className={cn(inputClass, 'bg-slate-50 text-[#686868]')}
            />
          </Field>
          <Field label="Batch">
            <input
              readOnly
              value={form.batch}
              className={cn(inputClass, 'bg-slate-50 text-[#686868]')}
            />
          </Field>
          <Field label="Payment Status">
            <select
              value={form.paymentStatus}
              onChange={handleChange('paymentStatus')}
              className={inputClass}
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Attendance (%)">
            <input
              type="number"
              min={0}
              max={100}
              value={form.attendance}
              onChange={handleChange('attendance')}
              className={inputClass}
              placeholder="0–100"
            />
          </Field>
          <Field label="Course Progress (%)" className="sm:col-span-2">
            <input
              type="number"
              min={0}
              max={100}
              value={form.progress}
              onChange={handleChange('progress')}
              className={inputClass}
              placeholder="0–100"
            />
          </Field>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-11 rounded-xl border border-slate-200 px-6 text-sm font-semibold text-[#444] transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-11 rounded-xl bg-gradient-to-r from-[#1a3a5c] to-[#03045e] px-8 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(3,4,94,0.35)] transition hover:scale-[1.01] disabled:opacity-60"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Student'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
