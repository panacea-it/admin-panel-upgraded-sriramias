import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getModalEditKey, useInitOnModalOpen } from '../../hooks/modalFormSync'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Mail, Phone, User, Hash, X } from 'lucide-react'
import { toast } from '@/utils/toast'
import { cn } from '../../utils/cn'
import { SESSION_TIMEOUTS } from '../../data/adminManagementConfig'
import { useCenters } from '../../contexts/CentersContext'
import { useAdminRoles } from '../../contexts/AdminRolesContext'
import FloatingInput from './ui/FloatingInput'
import PasswordField from './ui/PasswordField'
import Switch from './ui/Switch'
import RoleOverviewCard from './RoleOverviewCard'
import { saveEmployeeAccount } from '../../utils/employeeAuthStorage'

const INITIAL = {
  fullName: '',
  email: '',
  mobile: '',
  employeeId: '',
  adminType: '',
  center: '',
  password: '',
  confirmPassword: '',
  active: true,
  twoFactor: false,
  sessionTimeout: '60',
  loginAlert: true,
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const mobileRe = /^[6-9]\d{9}$/

const selectClassName = cn(
  'w-full min-h-[3.25rem] rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3 text-[15px] font-medium text-slate-900 shadow-sm outline-none transition',
  'focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15',
  'dark:border-slate-700 dark:bg-slate-900/70 dark:text-white',
)

const fieldLabelClass = cn(
  'mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400',
)

export default function CreateAdminModal({ open, onClose, onSuccess, editingRecord = null }) {
  const { activeCenters } = useCenters()
  const { assignableForNewAdmin } = useAdminRoles()
  const assignableCenterNames = useMemo(
    () => activeCenters.map((c) => c.centerName).filter(Boolean),
    [activeCenters],
  )

  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const editingRef = useRef(editingRecord)
  editingRef.current = editingRecord
  const editKey = getModalEditKey(editingRecord)

  useInitOnModalOpen(open, editKey, () => {
    const editing = editingRef.current
    if (editing) {
      setForm({
        fullName: editing.name || '',
        email: editing.email || '',
        mobile: editing.phone || '',
        employeeId: editing.employeeId || editing.id || '',
        adminType: editing.role || '',
        center: editing.center || '',
        password: '',
        confirmPassword: '',
        active: editing.status !== 'inactive',
        twoFactor: false,
        sessionTimeout: '60',
        loginAlert: true,
      })
      setErrors({})
      return
    }
    setForm({
      ...INITIAL,
      adminType: assignableForNewAdmin[0]?.id || '',
      center: assignableCenterNames[0] || '',
    })
    setErrors({})
  })

  const selectedRole = useMemo(
    () => assignableForNewAdmin.find((r) => r.id === form.adminType),
    [assignableForNewAdmin, form.adminType],
  )

  const resetAll = useCallback(() => {
    setForm(INITIAL)
    setErrors({})
  }, [])

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

  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((err) => ({ ...err, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.fullName.trim()) next.fullName = 'Full name is required'
    if (!emailRe.test(form.email)) next.email = 'Enter a valid official email'
    if (!mobileRe.test(form.mobile.replace(/\D/g, '')))
      next.mobile = 'Enter a valid 10-digit mobile number'
    if (!form.employeeId.trim()) next.employeeId = 'Employee / Admin ID is required'
    const isEdit = Boolean(editingRecord)
    if (!isEdit || form.password) {
      if (form.password.length < 8) next.password = 'Minimum 8 characters required'
      if (form.password !== form.confirmPassword)
        next.confirmPassword = 'Passwords do not match'
    }
    const roleMeta = assignableForNewAdmin.find((r) => r.id === form.adminType)
    if (roleMeta?.requiresCenter) {
      if (assignableCenterNames.length === 0)
        next.center = 'Create an active center before assigning admins'
      else if (!form.center.trim()) next.center = 'Select an assigned center'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    const saved = saveEmployeeAccount({
      id: form.employeeId.trim(),
      name: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password || editingRecord?.password,
      phone: form.mobile.trim(),
      role: form.adminType,
      center: form.center || undefined,
      employeeId: form.employeeId.trim(),
      status: form.active ? 'active' : 'inactive',
      createdAt: editingRecord?.createdAt,
    })
    setLoading(false)
    onSuccess?.(saved)
    toast.success(
      editingRecord ? 'User access updated successfully' : 'Admin access created successfully',
      {
        description: `${form.fullName} can now sign in as ${selectedRole?.label}.`,
      },
    )
    resetAll()
    onClose()
  }

  const handleCancel = () => {
    resetAll()
    onClose()
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4 md:p-6">
          <motion.button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-slate-900/55 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleCancel}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-admin-modal-title"
            className={cn(
              'relative z-[101] flex w-full flex-col overflow-hidden border border-slate-200/80 bg-white shadow-2xl transition-shadow dark:border-slate-700 dark:bg-slate-900',
              'h-[100dvh] max-h-[100dvh] rounded-none sm:h-auto sm:max-h-[min(92vh,960px)] sm:w-[90vw] sm:max-w-[1024px] sm:rounded-2xl xl:max-w-[1100px]',
            )}
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:px-8 sm:py-6">
              <div className="min-w-0 pr-2">
                <h2
                  id="create-admin-modal-title"
                  className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl"
                >
                  Create Admin Access
                </h2>
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Manage and assign secure administrative access across departments.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
              noValidate
            >
              <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
                <div className="space-y-10 sm:space-y-12">
                  <section aria-labelledby="section-profile">
                    <h3
                      id="section-profile"
                      className="mb-5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 sm:mb-6"
                    >
                      Profile & credentials
                    </h3>
                    <div className="grid gap-5 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6 lg:gap-x-10">
                      <FloatingInput
                        id="modal-fullName"
                        label="Full Name"
                        size="comfortable"
                        value={form.fullName}
                        onChange={set('fullName')}
                        error={errors.fullName}
                        icon={User}
                      />
                      <FloatingInput
                        id="modal-email"
                        label="Official Email"
                        type="email"
                        size="comfortable"
                        value={form.email}
                        onChange={set('email')}
                        error={errors.email}
                        icon={Mail}
                        helper="Use your organization domain"
                      />
                      <FloatingInput
                        id="modal-mobile"
                        label="Mobile Number"
                        size="comfortable"
                        value={form.mobile}
                        onChange={set('mobile')}
                        error={errors.mobile}
                        icon={Phone}
                        helper="10-digit Indian mobile"
                      />
                      <FloatingInput
                        id="modal-employeeId"
                        label="Employee ID / Admin ID"
                        size="comfortable"
                        value={form.employeeId}
                        onChange={set('employeeId')}
                        error={errors.employeeId}
                        icon={Hash}
                      />
                    </div>
                  </section>

                  <section
                    className="border-t border-slate-100 pt-10 dark:border-slate-800 sm:pt-12"
                    aria-labelledby="section-role"
                  >
                    <h3
                      id="section-role"
                      className="mb-5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 sm:mb-6"
                    >
                      Access scope
                    </h3>
                    <div className="grid gap-5 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6 lg:gap-x-10">
                      <div>
                        <label htmlFor="modal-adminType" className={fieldLabelClass}>
                          Admin Access
                        </label>
                        <select
                          id="modal-adminType"
                          value={form.adminType}
                          onChange={set('adminType')}
                          disabled={assignableForNewAdmin.length === 0}
                          className={selectClassName}
                        >
                          {assignableForNewAdmin.length === 0 ? (
                            <option value="">Enable an Admin Access role first</option>
                          ) : (
                            assignableForNewAdmin.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.label}
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      {selectedRole?.requiresCenter && (
                        <div>
                          <label htmlFor="modal-center" className={fieldLabelClass}>
                            Assigned Center
                          </label>
                          <select
                            id="modal-center"
                            value={form.center}
                            onChange={set('center')}
                            className={selectClassName}
                            disabled={assignableCenterNames.length === 0}
                          >
                            {assignableCenterNames.length === 0 ? (
                              <option value="">No active centers</option>
                            ) : (
                              assignableCenterNames.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))
                            )}
                          </select>
                          {selectedRole?.requiresCenter && errors.center && (
                            <p className="mt-2 text-[12px] font-semibold text-rose-600">
                              {errors.center}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-8 sm:mt-10">
                      {selectedRole ? (
                        <RoleOverviewCard role={selectedRole} />
                      ) : (
                        <p className="rounded-xl border border-dashed border-slate-200 px-6 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                          No eligible access type selected. Configure and enable titles under{' '}
                          <strong>Role Access</strong>.
                        </p>
                      )}
                    </div>
                  </section>

                  <section
                    className="border-t border-slate-100 pt-10 dark:border-slate-800 sm:pt-12"
                    aria-labelledby="section-security"
                  >
                    <h3
                      id="section-security"
                      className="mb-5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 sm:mb-6"
                    >
                      Security
                    </h3>
                    <div className="grid gap-5 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6 lg:gap-x-10">
                      <PasswordField
                        id="modal-password"
                        label="Password"
                        value={form.password}
                        onChange={set('password')}
                        error={errors.password}
                        inputSize="comfortable"
                      />
                      <PasswordField
                        id="modal-confirmPassword"
                        label="Confirm Password"
                        value={form.confirmPassword}
                        onChange={set('confirmPassword')}
                        error={errors.confirmPassword}
                        inputSize="comfortable"
                      />
                    </div>
                  </section>

                  <section
                    className="border-t border-slate-100 pt-10 dark:border-slate-800 sm:pt-12"
                    aria-labelledby="section-preferences"
                  >
                    <h3
                      id="section-preferences"
                      className="mb-5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 sm:mb-6"
                    >
                      Session & alerts
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-4 lg:gap-x-8">
                      <Switch
                        id="modal-active"
                        relaxed
                        label="Account status"
                        description={form.active ? 'Active — can sign in' : 'Inactive — access blocked'}
                        checked={form.active}
                        onChange={(v) => setForm((f) => ({ ...f, active: v }))}
                      />
                      <Switch
                        id="modal-twoFactor"
                        relaxed
                        label="Two-factor authentication"
                        description="Require OTP on each login"
                        checked={form.twoFactor}
                        onChange={(v) => setForm((f) => ({ ...f, twoFactor: v }))}
                      />
                      <Switch
                        id="modal-loginAlert"
                        relaxed
                        label="Login alert"
                        description="Email when this admin signs in"
                        checked={form.loginAlert}
                        onChange={(v) => setForm((f) => ({ ...f, loginAlert: v }))}
                      />
                      <div className="flex flex-col justify-center rounded-xl border border-slate-200/80 bg-white/60 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/40">
                        <label htmlFor="modal-sessionTimeout" className={fieldLabelClass}>
                          Session timeout
                        </label>
                        <select
                          id="modal-sessionTimeout"
                          value={form.sessionTimeout}
                          onChange={set('sessionTimeout')}
                          className={cn(selectClassName, 'mt-1')}
                        >
                          {SESSION_TIMEOUTS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-10 flex justify-end border-t border-slate-100 pt-6 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={resetAll}
                        className="text-[15px] font-semibold text-slate-500 transition hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400"
                      >
                        Reset form
                      </button>
                    </div>
                  </section>
                </div>
              </div>

              <div
                className={cn(
                  'flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200/90 bg-white/95 px-6 py-5 dark:border-slate-800 dark:bg-slate-950/95 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5',
                  'pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-5',
                )}
              >
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full rounded-xl border border-slate-200/80 bg-white px-6 py-3.5 text-[15px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 sm:w-auto sm:min-w-[8.5rem]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedRole || assignableForNewAdmin.length === 0}
                  className={cn(
                    'w-full rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 px-8 py-3.5 text-[15px] font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0 disabled:opacity-70 sm:w-auto sm:min-w-[12rem]',
                  )}
                >
                  {loading ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating…
                    </span>
                  ) : (
                    'Create Admin'
                  )}
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
