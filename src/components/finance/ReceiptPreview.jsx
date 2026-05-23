import { Printer, Download, MessageCircle } from 'lucide-react'
import { formatINR } from '../../utils/financeFilters'
import { formatCategoryDateTime } from '../../utils/formatDateTime'
import { cn } from '../../utils/cn'

const GST_RATE = 0.18

function calcGstBreakdown(totalFees) {
  const base = Math.round(totalFees / (1 + GST_RATE))
  const gst = totalFees - base
  return { base, gst }
}

export default function ReceiptPreview({
  payment,
  payments = [],
  installments = [],
  className,
  onPrint,
  onDownload,
  onWhatsApp,
}) {
  const rows = payments.length ? payments : payment ? [payment] : []
  const primary = payment || rows[0]
  if (!primary) return null

  const totalFees = primary.totalFees ?? rows.reduce((s, p) => s + (p.amountPaid || 0), 0)
  const { base, gst } = calcGstBreakdown(totalFees)
  const totalPaid = rows.reduce((s, p) => s + (p.amountPaid || 0), primary.amountPaid || 0)

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div
        className="mx-auto w-full max-w-[210mm] rounded-sm border border-slate-200 bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.1)] print:shadow-none"
        style={{ fontFamily: 'Poppins, sans-serif', minHeight: '297mm' }}
      >
        <div className="border-b-2 border-[#1a3a5c] pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1a3a5c]">Sriram IAS</h1>
              <p className="text-sm text-[#686868]">Tax Invoice / Fee Receipt</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-bold text-[#246392]">{primary.receiptNumber || 'DRAFT'}</p>
              <p className="text-[#686868]">{formatCategoryDateTime(primary.paymentDate || new Date().toISOString())}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase text-[#55ace7]">Bill To</p>
            <p className="mt-1 font-bold text-[#222]">{primary.studentName}</p>
            <p className="text-[#686868]">ID: {primary.studentId}</p>
            <p className="text-[#686868]">{primary.mobile}</p>
            <p className="text-[#686868]">{primary.email}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase text-[#55ace7]">Course</p>
            <p className="mt-1 font-bold text-[#222]">{primary.courseName}</p>
            <p className="text-[#686868]">{primary.courseType} · {primary.branch}</p>
          </div>
        </div>

        <table className="mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-[#55ace7] to-[#246392] text-left text-white">
              <th className="px-3 py-2 font-semibold">Description</th>
              <th className="px-3 py-2 font-semibold">Mode</th>
              <th className="px-3 py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-slate-100">
                <td className="px-3 py-2">
                  {p.courseName}
                  <span className="block text-xs text-[#9ca0a8]">{p.transactionId || '—'}</span>
                </td>
                <td className="px-3 py-2">{p.paymentMode}</td>
                <td className="px-3 py-2 text-right font-medium">{formatINR(p.amountPaid)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {installments.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase text-[#55ace7]">EMI Schedule</p>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#eef2fc] text-[#246392]">
                  <th className="px-2 py-1.5 text-left">#</th>
                  <th className="px-2 py-1.5 text-left">Due</th>
                  <th className="px-2 py-1.5 text-right">Amount</th>
                  <th className="px-2 py-1.5 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {installments.map((emi) => (
                  <tr key={emi.emiNo} className="border-b border-slate-100">
                    <td className="px-2 py-1.5">{emi.emiNo}</td>
                    <td className="px-2 py-1.5">{emi.dueDate}</td>
                    <td className="px-2 py-1.5 text-right">{formatINR(emi.emiAmount)}</td>
                    <td className="px-2 py-1.5">{emi.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-[#686868]">Taxable Amount</span>
            <span className="font-medium">{formatINR(base)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#686868]">GST @ 18%</span>
            <span className="font-medium">{formatINR(gst)}</span>
          </div>
          <div className="flex justify-between border-t border-[#1a3a5c] pt-2 text-base font-bold text-[#1a3a5c]">
            <span>Total Paid</span>
            <span>{formatINR(totalPaid)}</span>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-[#9ca0a8]">
          This is a computer-generated receipt. GSTIN: 29ABCDESRI0001Z5
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 print:hidden">
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1a3a5c] to-[#246392] px-4 py-2 text-sm font-semibold text-white"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#55ace7] to-[#246392] px-4 py-2 text-sm font-semibold text-white"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
        <button
          type="button"
          onClick={onWhatsApp}
          className="inline-flex items-center gap-2 rounded-lg border border-[#25D366] bg-white px-4 py-2 text-sm font-semibold text-[#128C7E]"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </button>
      </div>
    </div>
  )
}
