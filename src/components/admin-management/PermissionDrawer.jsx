import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Shield, X, Save, Sparkles, Ban, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
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

/** Right-side enterprise permission drawer (portal). */
export default function PermissionDrawer({
  open,
  onClose,
  role,
  module: mod,
  featureMap,
  editable,
  defaultTemplateFeatures,
  onReplaceFeatures,
  onSave,
}) {
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!open) setSearch('')
  }, [open, mod?.id, role?.id])

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
    toast.warning('All features restricted', {
      description: `${mod.label}: module status is now Restricted.`,
    })
  }, [mod, role, onReplaceFeatures])

  const handleEnableAll = useCallback(() => {
    if (!mod || !role) return
    onReplaceFeatures(role.id, mod.id, buildFullFeatureMap(mod.id))
    toast.success('All features enabled', {
      description: `${mod.label}: Full Access applied to every feature.`,
    })
  }, [mod, role, onReplaceFeatures])

  const handleReset = useCallback(() => {
    if (!mod || !role || !defaultTemplateFeatures || typeof defaultTemplateFeatures !== 'object') return
    const copy = JSON.parse(JSON.stringify(defaultTemplateFeatures))
    onReplaceFeatures(role.id, mod.id, copy)
    toast.success('Reset permissions', {
      description: `Restored default template for ${mod.label}.`,
    })
  }, [mod, role, defaultTemplateFeatures, onReplaceFeatures])

  const handleToggle = useCallback(
    (featureId, next) => {
      if (!mod || !role || !featureMap) return
      const label = definitions.find((d) => d.id === featureId)?.label || featureId
      const merged = { ...featureMap, [featureId]: next }
      const allOff =
        definitions.length > 0 && definitions.every((d) => typeof merged[d.id] === 'boolean' && !merged[d.id])

      onReplaceFeatures(role.id, mod.id, merged)

      if (allOff && next === false) {
        toast.warning('Restricting all features', {
          description: 'Every feature for this module is turned off.',
        })
      } else {
        toast.success(next ? 'Feature enabled' : 'Feature restricted', {
          description: label,
          duration: 2200,
        })
      }
    },
    [mod, role, featureMap, definitions, onReplaceFeatures],
  )

  const persist = useCallback(() => {
    onSave?.()
    onClose()
  }, [onSave, onClose])

  if (typeof document === 'undefined') return null

  const ModIcon = mod?.icon

  return createPortal(
    <AnimatePresence>
      {open && mod && role && (
        <div className="fixed inset-0 z-[120] flex justify-end">
          <motion.button
            type="button"
            aria-label="Close permission panel"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Feature permissions"
            className={cn(
              'relative z-[121] flex h-[100dvh] w-full flex-col border-l border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900',
              'md:max-w-[min(620px,94vw)] md:rounded-l-2xl',
            )}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
          >
            <header className="shrink-0 border-b border-slate-100 px-5 py-4 dark:border-slate-800 md:px-7 md:py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {ModIcon && (
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300">
                        <ModIcon className="h-5 w-5" strokeWidth={2} />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                        {role.label}
                      </p>
                      <h2 className="mt-0.5 truncate text-lg font-bold text-slate-900 dark:text-white md:text-xl">
                        {mod.label}
                      </h2>
                    </div>
                  </div>
                  {mod.description && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {mod.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Module status
                    </span>
                    <AccessStatusChip status={status} disabled />
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={persist}
                    disabled={!editable}
                    className={cn(
                      'hidden items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3.5 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg md:inline-flex',
                      !editable && 'pointer-events-none opacity-40',
                    )}
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!editable}
                  onClick={handleEnableAll}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-40 sm:flex-none dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Enable All
                </button>
                <button
                  type="button"
                  disabled={!editable}
                  onClick={handleRestrictAll}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200/80 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800 transition hover:bg-rose-100 disabled:opacity-40 sm:flex-none dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200"
                >
                  <Ban className="h-3.5 w-3.5" />
                  Restrict All
                </button>
                <button
                  type="button"
                  disabled={!editable || !defaultTemplateFeatures}
                  onClick={handleReset}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 sm:flex-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
            </header>

            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-7">
              {status === 'restricted' && editable && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 text-[13px] text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-100">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Module is restricted. Turn features on individually, use <strong>Enable All</strong>, or{' '}
                    <strong>Reset</strong> to restore the role default template.
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
                id="perm-drawer-search"
                value={search}
                onChange={setSearch}
                placeholder="Filter features…"
              />

              <div className="mt-4 rounded-2xl border border-slate-100/90 bg-slate-50/40 p-3 dark:border-slate-800 dark:bg-slate-900/30">
                <h3 className="mb-3 px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                  Feature-level access
                </h3>
                <PermissionGroup
                  definitions={definitions}
                  featureMap={featureMap}
                  onToggle={handleToggle}
                  searchQuery={search}
                  editable={editable}
                />
              </div>

              <p className="mt-6 text-xs leading-relaxed text-slate-400 dark:text-slate-500">
                Structured for expansion to View / Edit / Delete / Full per feature once the backend
                supports granular levels.
              </p>
            </div>

            <div className="shrink-0 border-t border-slate-200/80 bg-white/95 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/90 md:hidden md:px-7">
              <button
                type="button"
                onClick={persist}
                disabled={!editable}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-40"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
