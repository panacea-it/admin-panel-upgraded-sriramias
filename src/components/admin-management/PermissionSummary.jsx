export default function PermissionSummary({ allowed, restricted, total, className }) {
  return (
    <div
      className={
        className ||
        'flex flex-wrap gap-3 rounded-xl border border-slate-200/70 bg-gradient-to-br from-slate-50/90 to-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:from-slate-900/50 dark:to-slate-900/30'
      }
    >
      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Allowed
        </span>
        <p className="mt-0.5 text-lg font-bold text-emerald-600 dark:text-emerald-400">{allowed}</p>
      </div>
      <div className="h-10 w-px self-center bg-slate-200 dark:bg-slate-600" aria-hidden />
      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Restricted
        </span>
        <p className="mt-0.5 text-lg font-bold text-rose-600 dark:text-rose-400">{restricted}</p>
      </div>
      <div className="h-10 w-px self-center bg-slate-200 dark:bg-slate-600 max-sm:hidden" aria-hidden />
      <div className="max-sm:hidden">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Total features
        </span>
        <p className="mt-0.5 text-lg font-bold text-slate-800 dark:text-slate-100">{total}</p>
      </div>
    </div>
  )
}
