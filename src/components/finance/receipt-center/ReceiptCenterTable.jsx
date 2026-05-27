import { Send } from 'lucide-react'
import FinanceStatusBadge from '../FinanceStatusBadge'
import CommunicationStatusChips from './CommunicationStatusChips'
import { formatINR } from '../../../utils/financeFilters'
import { formatCategoryDateTime } from '../../../utils/formatDateTime'
import { cn } from '../../../utils/cn'

export default function ReceiptCenterTable({ rows, onSendReceipt, canSend = true }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="max-h-[min(560px,65vh)] overflow-auto">
        <table className="w-full min-w-[1100px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-gradient-to-r from-[#246392] to-[#1a4d73] text-left text-[11px] font-bold uppercase tracking-wide text-white">
            <tr>
              <th className="px-3 py-3">Receipt #</th>
              <th className="px-3 py-3">Student</th>
              <th className="px-3 py-3">Mobile</th>
              <th className="px-3 py-3">Course</th>
              <th className="px-3 py-3">Payment type</th>
              <th className="px-3 py-3 text-right">Amount paid</th>
              <th className="px-3 py-3">Payment date</th>
              <th className="px-3 py-3 text-center">Receipt status</th>
              <th className="px-3 py-3">Communication</th>
              <th className="sticky right-0 z-20 bg-[#1a4d73] px-3 py-3 text-center shadow-[-4px_0_8px_rgba(0,0,0,0.12)]">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.id}
                className={cn(
                  'border-t border-slate-100 transition-colors hover:bg-[#f8fbff]',
                  idx % 2 === 1 && 'bg-slate-50/70',
                )}
              >
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs font-semibold text-[#246392]">
                  {row.receiptNumber}
                </td>
                <td className="px-3 py-2.5">
                  <p className="font-semibold text-[#222]">{row.studentName}</p>
                  <p className="text-[10px] text-[#888]">{row.studentId}</p>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-[#333]">
                  {row.mobile || '—'}
                </td>
                <td className="max-w-[160px] truncate px-3 py-2.5 text-[#333]" title={row.courseName}>
                  {row.courseName}
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={cn(
                      'inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold',
                      row.paymentTypeLabel === 'EMI Completed'
                        ? 'bg-[#eef6fc] text-[#1a4d73]'
                        : 'bg-slate-100 text-[#444]',
                    )}
                  >
                    {row.paymentTypeLabel}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-[#111]">
                  {formatINR(row.amountPaid)}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-xs text-[#555]">
                  {row.paymentDate ? formatCategoryDateTime(row.paymentDate) : '—'}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <FinanceStatusBadge status={row.receiptStatus} className="text-[10px]" />
                </td>
                <td className="px-3 py-2.5">
                  <CommunicationStatusChips communications={row.communications} compact />
                </td>
                <td
                  className={cn(
                    'sticky right-0 border-l border-slate-100 bg-white px-3 py-2.5',
                    idx % 2 === 1 && 'bg-slate-50/95',
                  )}
                >
                  {canSend && (
                    <button
                      type="button"
                      title="Send receipt via WhatsApp, SMS, or Email"
                      onClick={() => onSendReceipt(row)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#55ace7] to-[#246392] px-3 text-xs font-bold text-white shadow-sm transition hover:brightness-105"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Send Receipt
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="py-12 text-center text-sm text-[#686868]">
          No completed payment receipts match your filters.
          <br />
          <span className="text-xs">Only fully paid and EMI-completed students appear here.</span>
        </p>
      )}
    </div>
  )
}
