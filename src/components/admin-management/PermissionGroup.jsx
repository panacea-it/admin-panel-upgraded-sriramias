import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

/** Feature rows with dashboard-styled switches. */
export default function PermissionGroup({
  definitions,
  featureMap,
  onToggle,
  searchQuery,
  editable,
}) {
  const q = searchQuery.trim().toLowerCase()
  const items = definitions.filter(
    (d) => !q || d.label.toLowerCase().includes(q) || d.id.toLowerCase().includes(q),
  )

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        No features match your search.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((def, idx) => {
        const on = !!(featureMap && featureMap[def.id])
        const switchDisabled = !editable

        return (
          <motion.div
            key={def.id}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(idx * 0.025, 0.24) }}
            className={cn(
              'flex items-center justify-between gap-4 rounded-xl border border-slate-200/75 bg-white/90 px-4 py-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition dark:border-slate-700/80 dark:bg-slate-900/50',
              !switchDisabled &&
                'hover:border-violet-200/80 hover:shadow-[0_4px_14px_rgba(124,58,237,0.08)] dark:hover:border-violet-500/30',
            )}
          >
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">{def.label}</p>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                Feature
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={on}
              disabled={switchDisabled}
              onClick={() => !switchDisabled && onToggle(def.id, !on)}
              className={cn(
                'relative h-9 w-[52px] shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 disabled:pointer-events-none',
                switchDisabled ? 'opacity-45' : '',
                on ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-600',
              )}
            >
              <motion.span
                layout
                className="absolute top-1 left-1 h-7 w-7 rounded-full bg-white shadow"
                animate={{ x: on ? 18 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            </button>
          </motion.div>
        )
      })}
    </div>
  )
}
