import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import {
  emptyPermissionSet,
  fullPermissionSet,
  isFeaturePermissionActive,
  normalizeFeaturePermissions,
} from '../../utils/rbacPermissionModel'

function FeatureSwitch({ on, disabled, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => !disabled && onChange(!on)}
      className={cn(
        'relative h-9 w-[52px] shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40',
        disabled && 'pointer-events-none opacity-45',
        on ? 'bg-violet-600' : 'bg-slate-300',
      )}
    >
      <motion.span
        layout
        className="absolute top-1 left-1 h-7 w-7 rounded-full bg-white shadow"
        animate={{ x: on ? 18 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      />
    </button>
  )
}

/** Feature rows with on/off switches only. */
export default function PermissionGroup({
  definitions,
  featureMap,
  onFeatureBulkChange,
  searchQuery,
  editable = true,
}) {
  const q = searchQuery.trim().toLowerCase()
  const items = definitions.filter(
    (d) => !q || d.label.toLowerCase().includes(q) || d.id.toLowerCase().includes(q),
  )

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
        No features match your search.
      </p>
    )
  }

  return (
    <motion.div className="space-y-2">
      {items.map((def, idx) => {
        const perms = normalizeFeaturePermissions(featureMap?.[def.id])
        const on = isFeaturePermissionActive(perms)

        return (
          <motion.div
            key={def.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.02, 0.2) }}
            className={cn(
              'flex items-center justify-between gap-4 rounded-xl border border-slate-200/75 bg-white/90 px-4 py-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition',
              editable &&
                'hover:border-violet-200/80 hover:shadow-[0_4px_14px_rgba(124,58,237,0.08)]',
            )}
          >
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-slate-900">{def.label}</p>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Feature
              </p>
            </div>
            <FeatureSwitch
              on={on}
              disabled={!editable}
              onChange={(enabled) =>
                onFeatureBulkChange(def.id, enabled ? fullPermissionSet() : emptyPermissionSet())
              }
            />
          </motion.div>
        )
      })}
    </motion.div>
  )
}
