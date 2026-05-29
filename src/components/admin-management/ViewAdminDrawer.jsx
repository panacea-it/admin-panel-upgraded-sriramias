import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Mail, Phone, Shield, User, Hash, X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { StatusBadge } from '../academics/AcademicsUi'
import { useAdminRoles } from '../../contexts/AdminRolesContext'
import { formatCategoryDateTime } from '../../utils/formatDateTime'

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" strokeWidth={2.4} />
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
        <p className="mt-1 whitespace-pre-wrap text-[14px] font-semibold text-slate-900">
          {value || '—'}
        </p>
      </div>
    </div>
  )
}

export default function ViewAdminDrawer({ open, employee, onClose }) {
  const { roles } = useAdminRoles()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (typeof document === 'undefined') return null

  const roleLabel = roles.find((r) => r.id === employee?.role)?.label || employee?.role || '—'
  const status = employee?.status === 'inactive' ? 'In Active' : 'Active'

  return createPortal(
    <AnimatePresence>
      {open && employee && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.button
            type="button"
            aria-label="Close panel"
            className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-view-title"
            initial={{ x: '100%', opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.6 }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className={cn(
              'relative z-[101] flex h-full w-full max-w-[min(100%,420px)] flex-col border-l border-slate-200/80 bg-white shadow-[0_0_48px_rgba(15,23,42,0.18)]',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 text-white shadow-md">
                  <Shield className="h-5 w-5" strokeWidth={2.3} />
                </div>
                <div className="min-w-0">
                  <h2 id="admin-view-title" className="truncate text-lg font-bold text-slate-900">
                    {employee.name || employee.fullName || 'User access'}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">User access details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto px-6 py-6">
              <Row icon={User} label="Full name" value={employee.name || employee.fullName} />
              <Row icon={Mail} label="Official email" value={employee.email} />
              <Row icon={Phone} label="Mobile number" value={employee.phone} />
              <Row icon={Hash} label="Employee ID" value={employee.employeeId || employee.id} />
              <Row icon={Shield} label="Role" value={roleLabel} />
              {employee.center ? (
                <Row icon={Shield} label="Assigned center" value={employee.center} />
              ) : null}
              <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" strokeWidth={2.4} />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Status
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={status} />
                  </div>
                </div>
              </div>
              <Row
                icon={Shield}
                label="Created"
                value={formatCategoryDateTime(employee.createdAt)}
              />
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
