import { PlusCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

export function BannerButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 min-h-[38px] items-center justify-center gap-2 rounded-lg bg-[#1a3a5c] px-4 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition hover:bg-[#152f4a] sm:text-base"
    >
      <PlusCircle className="h-4 w-4 shrink-0" strokeWidth={2.2} />
      {children}
    </button>
  )
}

export function StatusBadge({ status }) {
  const active = status === 'Active'
  return (
    <span
      className={cn(
        'inline-flex min-w-[88px] items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold text-white',
        active ? 'bg-[#69df66]' : 'bg-[#efb36d]',
      )}
    >
      {status}
    </span>
  )
}

export function ResourceNameCell({ name }) {
  return (
    <div className="flex items-center gap-4 sm:gap-5">
      <span className="h-6 w-6 shrink-0 rounded bg-[#cbeeff]" />
      <span className="truncate font-medium">{name}</span>
    </div>
  )
}
