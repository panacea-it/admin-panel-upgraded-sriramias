import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Shield, X, Save, Sparkles, Ban, RotateCcw } from 'lucide-react'
import { toast } from '@/utils/toast'
import { cn } from '../../utils/cn'
import { RBAC_MODULE_FEATURES } from '../../data/rbacConfig'
import {
  buildEmptyFeatureMap,
  buildFullFeatureMap,
  deriveModuleAccessStatus,
  featureSummary,
} from '../../utils/rbacHelpers'
import AccessStatusChip from './AccessStatusChip'
import PermissionGroup from './PermissionGroup'
import PermissionSearch from './PermissionSearch'
import PermissionSummary from './PermissionSummary'

function displayRoleTitle(label) {
  return String(label || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase()
}

/** Centered permission dialog when a matrix cell is clicked (Admin Access page). */
export default function PermissionDrawer({
  open,
  onClose,
  role,
  module: mod,
  featureMap,
  defaultTemplateFeatures,
  onReplaceFeatures,
  onSave,
}) {
  const [search, setSearch] = useState('')
  const sessionBaselineRef = useRef(null)

  useEffect(() => {
    if (!open) {
      setSearch('')
      sessionBaselineRef.current = null
      return
    }
    sessionBaselineRef.current = JSON.parse(JSON.stringify(featureMap || {}))
  }, [open, mod?.id, role?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const definitions = useMemo(() => (mod?.id ? RBAC_MODULE_FEATURES[mod.id] || [] : []), [mod])
  const status = useMemo(() => deriveModuleAccessStatus(featureMap), [featureMap])
  const summary = useMemo(() => featureSummary(featureMap), [featureMap])

  const handleRestrictAll = useCallback(() => {
    if (!mod || !role) return
    onReplaceFeatures(role.id, mod.id, buildEmptyFeatureMap(mod.id))
  }, [mod, role, onReplaceFeatures])

  const handleEnableAll = useCallback(() => {
    if (!mod || !role) return
    onReplaceFeatures(role.id, mod.id, buildFullFeatureMap(mod.id))
  }, [mod, role, onReplaceFeatures])

  const handleReset = useCallback(() => {
    if (!mod || !role) return
    const baseline = sessionBaselineRef.current
    if (baseline && typeof baseline === 'object') {
      onReplaceFeatures(role.id, mod.id, JSON.parse(JSON.stringify(baseline)))
      toast.success('Reset permissions', {
        description: 'Restored permissions from when you opened this dialog.',
      })
      return
    }
    if (!defaultTemplateFeatures || typeof defaultTemplateFeatures !== 'object') return
    onReplaceFeatures(role.id, mod.id, JSON.parse(JSON.stringify(defaultTemplateFeatures)))
    toast.success('Reset permissions', {
      description: `Restored default template for ${mod.label}.`,
    })
  }, [mod, role, defaultTemplateFeatures, onReplaceFeatures])

  const handleFeatureBulkChange = useCallback(
    (featureId, permissionSet) => {
      if (!mod || !role || !featureMap) return
      onReplaceFeatures(role.id, mod.id, { ...featureMap, [featureId]: { ...permissionSet } })
    },
    [mod, role, featureMap, onReplaceFeatures],
  )

  const persist = useCallback(() => {
    sessionBaselineRef.current = JSON.parse(JSON.stringify(featureMap || {}))
    onSave?.()
    onClose()
  }, [onSave, onClose, featureMap])

  if (typeof document === 'undefined') return null

  const ModIcon = mod?.icon

  return createPortal(
    <AnimatePresence>
      {open && mod && role && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
          <motion.button
            type="button"
            aria-label="Close permission dialog"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="permission-dialog-title"
            className={cn(
              'relative z-[121] flex max-h-[min(92vh,820px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900',
            )}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="shrink-0 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    {ModIcon && (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300">
                        <ModIcon className="h-5 w-5" strokeWidth={2} />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">
                        {displayRoleTitle(role.label)}
                      </p>
                      <h2
                        id="permission-dialog-title"
                        className="mt-0.5 text-xl font-bold text-slate-900 dark:text-white"
                      >
                        {mod.label}
                      </h2>
                    </div>
                  </div>
                  {mod.description && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {mod.description}
                    </p>
                  )}
                  <motion.div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Module status
                    </span>
                    <AccessStatusChip status={status} disabled interactive={false} />
                  </motion.div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleEnableAll}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 sm:flex-none dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Enable All
                </button>
                <button
                  type="button"
                  onClick={handleRestrictAll}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200/80 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800 transition hover:bg-rose-100 sm:flex-none dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200"
                >
                  <Ban className="h-3.5 w-3.5" />
                  Restrict All
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 sm:flex-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
            </header>

            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {status === 'restricted' && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 text-[13px] text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-100">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Module is restricted. Use the switches below, <strong>Enable All</strong>, or{' '}
                    <strong>Reset</strong>.
                  </span>
                </div>
              )}

              <PermissionSummary
                allowed={summary.allowed}
                restricted={summary.restricted}
                total={summary.total}
              />

              <div className="my-5 h-px bg-slate-100 dark:bg-slate-800" />

              <PermissionSearch
                id="perm-dialog-search"
                value={search}
                onChange={setSearch}
                placeholder="Filter features…"
              />

              <h3 className="mt-4 mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                Feature-level access
              </h3>

              <PermissionGroup
                definitions={definitions}
                featureMap={featureMap}
                onFeatureBulkChange={handleFeatureBulkChange}
                searchQuery={search}
                editable
              />
            </div>

            <footer className="flex shrink-0 justify-end gap-3 border-t border-slate-200/80 bg-white/98 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/98">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={persist}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
