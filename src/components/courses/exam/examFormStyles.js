import { cn } from '../../../utils/cn'

export const examInputClass = cn(
  'h-12 w-full rounded-xl bg-[#d1e9f6] px-4 text-sm font-medium text-[#1a3a5c] shadow-sm outline-none transition',
  'placeholder:text-[#7a8a9a]',
  'focus:ring-2 focus:ring-[#55ace7]/45',
)

export const examSectionCardClass = cn(
  'overflow-hidden rounded-2xl border border-[#e5eaf2] bg-white shadow-[0_8px_28px_rgba(15,23,42,0.06)]',
)

export const examPanelClass = cn(
  'rounded-2xl border border-[#cfe8f7] bg-gradient-to-b from-[#f8fbff] to-white p-1',
)
