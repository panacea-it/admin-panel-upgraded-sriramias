import { Mail, Phone, Hash, CreditCard, BarChart3, CalendarCheck } from 'lucide-react'
import Modal from '../ui/Modal'
import PaymentStatusBadge from './PaymentStatusBadge'
import ProgressBar from './ProgressBar'
import CategoryStatusBadge from '../categories/CategoryStatusBadge'

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50/80 px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#246392] shadow-sm">
        <Icon className="h-4 w-4" strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#9ca0a8]">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-[#111]">{value}</p>
      </div>
    </div>
  )
}

export default function StudentViewModal({ open, onClose, student, batch }) {
  if (!student) return null

  return (
    <Modal open={open} onClose={onClose} title="Student details" size="md">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl">
        <div className="border-b border-slate-100 bg-gradient-to-r from-[#55ace7]/10 to-white px-6 py-5">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#cbeeff] text-lg font-bold text-[#246392]">
              {student.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <div>
              <h2 className="text-xl font-bold text-[#111]">{student.name}</h2>
              <p className="text-sm text-[#686868]">
                {batch?.displayName ?? '—'}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <PaymentStatusBadge status={student.paymentStatus} />
                <CategoryStatusBadge status={student.status ?? 'Active'} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 px-6 py-5 sm:grid-cols-2">
          <DetailRow icon={Mail} label="Email" value={student.email} />
          <DetailRow icon={Phone} label="Phone" value={student.phone} />
          <DetailRow icon={Hash} label="Enrollment ID" value={student.enrollmentId} />
          <DetailRow icon={CreditCard} label="Payment" value={student.paymentStatus} />
          <div className="sm:col-span-2">
            <DetailRow icon={CalendarCheck} label="Attendance" value={`${student.attendance}%`} />
            <div className="mt-2 px-1">
              <ProgressBar value={student.attendance} />
            </div>
          </div>
          <div className="sm:col-span-2">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#9ca0a8]">
              <BarChart3 className="h-3.5 w-3.5" />
              Course Progress
            </p>
            <ProgressBar value={student.progress} />
          </div>
        </div>

        <div className="border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-full rounded-xl border border-slate-200 text-sm font-semibold text-[#444] transition hover:bg-slate-50 sm:w-auto sm:px-8"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}
