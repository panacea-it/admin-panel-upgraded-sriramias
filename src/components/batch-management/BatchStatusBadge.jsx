import { cn } from '../../utils/cn'

const STYLES = {
  Active: 'bg-emerald-500 text-white shadow-[0_2px_8px_rgba(16,185,129,0.35)]',
  Completed: 'bg-slate-500 text-white shadow-[0_2px_8px_rgba(100,116,139,0.35)]',
  Upcoming: 'bg-amber-500 text-white shadow-[0_2px_8px_rgba(245,158,11,0.35)]',
}

export default function BatchStatusBadge({ status }) {
  return (
    <span
      className={cn(
        'inline-flex min-w-[96px] items-center justify-center rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide sm:text-sm',
        STYLES[status] ?? 'bg-slate-400 text-white',
      )}
    >
      {status}
    </span>
  )
}
