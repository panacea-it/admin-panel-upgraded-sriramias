import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import FloatingInput from '../ui/FloatingInput'
import Switch from '../ui/Switch'
import { cn } from '../../../utils/cn'
import { useAdminRoles } from '../../../contexts/AdminRolesContext'
import { ADMIN_ROLE_ICON_OPTIONS } from '../../../utils/adminRoleIcons'
import { PERMISSION_MODULES, SECURITY_BADGES } from '../../../data/adminManagementConfig'
import { createEmptyLegacyModuleMatrix } from '../../../data/adminRolesSeed'

const fieldLabelClass = cn(
  'mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400',
)

const LEVELS = [
  { id: 'critical', label: 'Critical' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Standard' },
  { id: 'low', label: 'Low' },
]

export default function AdminRoleFormModal({ open, onClose, initialRole }) {
  const { createRole, updateRole, setRoleModuleBaseline } = useAdminRoles()
  const isEdit = !!(initialRole && !initialRole.fullAccess)

  const [loading, setLoading] = useState(false)
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [customId, setCustomId] = useState('')
  const [iconKey, setIconKey] = useState('badgeCheck')
  const [securityLevel, setSecurityLevel] = useState('medium')
  const [modulesRaw, setModulesRaw] = useState('')
  const [requiresCenter, setRequiresCenter] = useState(true)
  const [permissionCount, setPermissionCount] = useState(0)

  const [roleActions, setRoleActions] = useState({
    view: true,
    edit: true,
    delete: false,
    disable: true,
  })

  const [legacyDraft, setLegacyDraft] = useState(() => createEmptyLegacyModuleMatrix())

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    if (initialRole) {
      setLabel(initialRole.label || '')
      setDescription(initialRole.description || '')
      setCustomId(initialRole.id || '')
      setIconKey(initialRole.iconKey || 'badgeCheck')
      setSecurityLevel(initialRole.securityLevel || 'medium')
      setModulesRaw((initialRole.modules || []).join(', '))
      setRequiresCenter(!!initialRole.requiresCenter)
      setPermissionCount(typeof initialRole.permissionCount === 'number' ? initialRole.permissionCount : 0)
      setRoleActions({ ...initialRole.roleActions })
      setLegacyDraft({ ...createEmptyLegacyModuleMatrix(), ...(initialRole.legacyModuleMatrix || {}) })
    } else {
      setLabel('')
      setDescription('')
      setCustomId('')
      setIconKey('badgeCheck')
      setSecurityLevel('medium')
      setModulesRaw('')
      setRequiresCenter(true)
      setPermissionCount(0)
      setRoleActions({ view: true, edit: true, delete: false, disable: true })
      setLegacyDraft(createEmptyLegacyModuleMatrix())
    }
  }, [open, initialRole])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (!open) return
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const modulesList = useMemo(
    () =>
      modulesRaw
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    [modulesRaw],
  )

  const handleModuleToggle = (moduleId, next) => {
    if (initialRole?.fullAccess) return
    if (isEdit && initialRole?.id) {
      setLegacyDraft((d) => ({ ...d, [moduleId]: next }))
      setRoleModuleBaseline(initialRole.id, moduleId, next)
      return
    }
    setLegacyDraft((d) => ({ ...d, [moduleId]: next }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (initialRole?.fullAccess) return
    if (!label.trim()) {
      toast.error('Label is required')
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 400))

    try {
      if (isEdit && initialRole) {
        updateRole(initialRole.id, {
          label: label.trim(),
          description: description.trim(),
          iconKey,
          securityLevel,
          modules: modulesList,
          requiresCenter,
          permissionCount: permissionCount || Object.values(legacyDraft).filter(Boolean).length * 8,
          roleActions,
          legacyModuleMatrix: { ...legacyDraft },
        })
        toast.success('Access type updated', { description: 'Role template saved.' })
      } else {
        createRole({
          label,
          description,
          customId: customId.trim() || undefined,
          iconKey,
          securityLevel,
          modules: modulesList.length ? modulesList : [`${label.trim()} scope`],
          requiresCenter,
          permissionCount: permissionCount || Object.values(legacyDraft).filter(Boolean).length * 8,
          roleActions,
          legacyModuleMatrix: { ...legacyDraft },
        })
        toast.success('Access type created', { description: 'Assign matrix permissions next.' })
      }
      onClose()
    } catch (err) {
      toast.error('Could not save', { description: String(err?.message || err) })
    } finally {
      setLoading(false)
    }
  }

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
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative z-[141] flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400">
                  {initialRole?.fullAccess ? 'System catalog' : isEdit ? 'Edit role' : 'New access type'}
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {initialRole?.fullAccess
                    ? initialRole.label
                    : isEdit
                      ? 'Update admin access type'
                      : 'Create admin access type'}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="custom-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
              <div className="space-y-8 px-6 py-6">
                {initialRole?.fullAccess ? (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    This catalog entry anchors full-platform access for break-glass Super Admins. Module, feature,
                    and role-action cells are implicitly granted; manage elevated principals only according to policy.
                  </p>
                ) : (
                  <>
                    <FloatingInput label="Role title (display)" value={label} onChange={(e) => setLabel(e.target.value)} />

                    {!isEdit ? (
                      <FloatingInput
                        label="Role code (optional, API id)"
                        value={customId}
                        onChange={(e) => setCustomId(e.target.value)}
                      />
                    ) : (
                      <div>
                        <label className={fieldLabelClass}>Role code</label>
                        <p className="rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm font-mono font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                          {initialRole.id}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className={fieldLabelClass}>Description</label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm outline-none ring-violet-500/20 focus:border-violet-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={fieldLabelClass}>Icon</label>
                        <select
                          value={iconKey}
                          onChange={(e) => setIconKey(e.target.value)}
                          className="w-full rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                          {ADMIN_ROLE_ICON_OPTIONS.map((opt) => (
                            <option key={opt.key} value={opt.key}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={fieldLabelClass}>Security tier</label>
                        <select
                          value={securityLevel}
                          onChange={(e) => setSecurityLevel(e.target.value)}
                          className="w-full rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                          {LEVELS.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.label}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Badge tiers: {Object.keys(SECURITY_BADGES).join(', ')}.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className={fieldLabelClass}>Portfolio tags</label>
                      <textarea
                        rows={2}
                        value={modulesRaw}
                        onChange={(e) => setModulesRaw(e.target.value)}
                        placeholder="e.g. Finance, Payroll, Franchise — comma or newline separated"
                        className="w-full rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    <FloatingInput
                      label="Estimated permission footprint (approximate)"
                      type="number"
                      min={0}
                      value={permissionCount === 0 ? '' : String(permissionCount)}
                      onChange={(e) => setPermissionCount(Number(e.target.value) || 0)}
                    />

                    <Switch
                      id="requires-center-modal"
                      relaxed
                      label="Requires assigned center"
                      description="Enrollment requires an operating center constraint"
                      checked={requiresCenter}
                      onChange={(v) => setRequiresCenter(v)}
                    />

                    <div className="rounded-2xl border border-violet-200/70 bg-gradient-to-br from-white via-white to-violet-50/50 p-5 dark:border-violet-900/40 dark:from-slate-950 dark:to-violet-950/35">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400">
                        Role action permissions (sub-category)
                      </p>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                        Grants lifecycle actions on governed resources — separate from matrix feature scopes.
                      </p>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <Switch id="ra-view" label="View" checked={roleActions.view} onChange={(v) => setRoleActions((a) => ({ ...a, view: v }))} />
                        <Switch id="ra-edit" label="Edit" checked={roleActions.edit} onChange={(v) => setRoleActions((a) => ({ ...a, edit: v }))} />
                        <Switch id="ra-delete" label="Delete" checked={roleActions.delete} onChange={(v) => setRoleActions((a) => ({ ...a, delete: v }))} />
                        <Switch id="ra-disable" label="Disable / suspend" checked={roleActions.disable} onChange={(v) => setRoleActions((a) => ({ ...a, disable: v }))} />
                      </div>
                    </div>

                    <div>
                      <p className={fieldLabelClass}>Module baseline template</p>
                      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
                        Rolls features on or off per pillar. Adjust cells afterward in Role Access Matrix.
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {PERMISSION_MODULES.map((m) => (
                          <Switch
                            key={m.id}
                            id={`mod-${m.id}`}
                            label={m.label}
                            checked={!!legacyDraft[m.id]}
                            onChange={(v) => handleModuleToggle(m.id, v)}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {!initialRole?.fullAccess ? (
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
                    disabled={loading}
                    className="inline-flex min-w-[8rem] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {isEdit ? 'Save changes' : 'Create role'}
                  </button>
                </div>
              ) : (
                <div className="border-t border-slate-200/90 px-6 py-4 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                  >
                    Close
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
