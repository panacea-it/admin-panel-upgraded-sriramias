import { useEffect, useRef, useState } from 'react'
import { getModalEditKey, useInitOnModalOpen } from '../../../hooks/modalFormSync'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, X } from 'lucide-react'
import { toast } from '@/utils/toast'
import FloatingInput from '../ui/FloatingInput'
import { cn } from '../../../utils/cn'
import { useAdminRoles } from '../../../contexts/AdminRolesContext'

const fieldLabelClass = cn(
  'mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400',
)

function normalizeRoleCode(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase()
}

export default function AdminRoleFormModal({ open, onClose, initialRole }) {
  const { createRole, updateRole } = useAdminRoles()
  const isEdit = !!initialRole
  const isSystemRole = !!(initialRole?.fullAccess || initialRole?.systemProtected)

  const [loading, setLoading] = useState(false)
  const [label, setLabel] = useState('')
  const [roleCode, setRoleCode] = useState('')
  const initialRoleRef = useRef(initialRole)
  initialRoleRef.current = initialRole
  const editKey = getModalEditKey(initialRole)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useInitOnModalOpen(open, editKey, () => {
    const role = initialRoleRef.current
    if (role) {
      setLabel(role.label || '')
      setRoleCode(
        String(role.id || '')
          .replace(/-/g, '_')
          .toUpperCase(),
      )
    } else {
      setLabel('')
      setRoleCode('')
    }
  })

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (!open) return
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!label.trim()) {
      toast.error('Role title is required')
      return
    }
    if (!isEdit && !roleCode.trim()) {
      toast.error('Role code is required')
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 300))

    try {
      if (isEdit && initialRole) {
        if (!isSystemRole) {
          updateRole(initialRole.id, { label: label.trim() })
        }
        toast.success('Role access updated')
      } else {
        createRole({
          label: label.trim(),
          customId: normalizeRoleCode(roleCode),
        })
        toast.success('Role access created')
      }
      onClose()
    } catch (err) {
      toast.error('Could not save', { description: String(err?.message || err) })
    } finally {
      setLoading(false)
    }
  }

  const modalTitle = isEdit ? 'Edit Role Access' : 'Create Role Access'

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[140] flex items-end justify-center p-4 sm:items-center">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-access-modal-title"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative z-[141] flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
              <h2
                id="role-access-modal-title"
                className="text-xl font-bold text-slate-900 dark:text-white"
              >
                {modalTitle}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="space-y-6 px-6 py-6">
                <FloatingInput
                  label="Role Title (Display)"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  disabled={isSystemRole}
                />

                {isEdit ? (
                  <div>
                    <label className={fieldLabelClass}>Role Code</label>
                    <p className="rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 font-mono text-sm font-semibold tracking-wide text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                      {roleCode}
                    </p>
                  </div>
                ) : (
                  <FloatingInput
                    label="Role Code"
                    value={roleCode}
                    onChange={(e) => setRoleCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SUPER_ADMIN"
                  />
                )}
              </div>

              <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200/90 bg-white/98 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/98">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || (isSystemRole && isEdit)}
                  className="inline-flex min-w-[8rem] items-center justify-center gap-2 rounded-xl bg-[#1a3a5c] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#152f4a] disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isEdit ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
