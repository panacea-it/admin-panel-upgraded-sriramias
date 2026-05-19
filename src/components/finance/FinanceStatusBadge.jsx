import { cn } from '../../utils/cn'

const STYLES = {
  Paid: 'bg-[#69df66] text-white',
  Success: 'bg-[#69df66] text-white',
  Active: 'bg-[#69df66] text-white',
  Approved: 'bg-[#69df66] text-white',
  Delivered: 'bg-[#69df66] text-white',
  Partial: 'bg-[#efb36d] text-white',
  Due: 'bg-[#efb36d] text-[#111]',
  Pending: 'bg-[#55ace7] text-white',
  Failed: 'bg-[#df8284] text-white',
  Rejected: 'bg-[#df8284] text-white',
  Overdue: 'bg-[#dc2626] text-white',
  Cancelled: 'bg-slate-400 text-white',
  Refunded: 'bg-slate-500 text-white',
  'Pending Payment': 'bg-[#55ace7] text-white',
  Completed: 'bg-[#246392] text-white',
  Expired: 'bg-slate-400 text-white',
  'Access Extended': 'bg-[#8b98bb] text-white',
}

export default function FinanceStatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        'inline-flex min-w-[72px] items-center justify-center rounded-md px-2.5 py-1 text-xs font-semibold sm:text-sm',
        STYLES[status] || 'bg-slate-200 text-slate-700',
        className,
      )}
    >
      {status}
    </span>
  )
}
