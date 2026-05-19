import { useCallback, useEffect, useMemo, useState } from 'react'
import { Receipt, Eye, Send } from 'lucide-react'
import FinancePageShell from '../../components/finance/FinancePageShell'
import FinanceStatusBadge from '../../components/finance/FinanceStatusBadge'
import ReceiptPreview from '../../components/finance/ReceiptPreview'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import { fetchPaymentReports, resendReceipt, generateReceipt } from '../../api/financeAPI'
import { formatINR } from '../../utils/financeFilters'
import { formatCategoryDateTime } from '../../utils/formatDateTime'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useFinancePermissions } from '../../hooks/useFinancePermissions'
import { toast } from '../../utils/toast'

export default function ReceiptManagementPage() {
  const { canReceipts } = useFinancePermissions()
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [preview, setPreview] = useState(null)

  const load = useCallback(async () => {
    try {
      const data = await fetchPaymentReports()
      setRows(data.filter((r) => r.amountPaid > 0 || r.receiptNumber))
    } catch {
      toast.error('Failed to load receipts')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        (r.receiptNumber || '').toLowerCase().includes(q) ||
        r.studentName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q),
    )
  }, [rows, debouncedSearch])

  const handleResend = async (channel) => {
    if (!preview) return
    try {
      await resendReceipt(preview.id, channel)
      toast.success(`Receipt sent via ${channel}`)
    } catch {
      toast.error('Resend failed')
    }
  }

  const handleGenerate = async (row) => {
    try {
      await generateReceipt(row.id)
      toast.success('Receipt generated')
      load()
    } catch {
      toast.error('Generation failed')
    }
  }

  const columns = [
    { key: 'receiptNumber', label: 'Receipt #', render: (r) => r.receiptNumber || '—' },
    { key: 'studentName', label: 'Student', render: (r) => <span className="font-medium">{r.studentName}</span> },
    { key: 'courseName', label: 'Course' },
    { key: 'amountPaid', label: 'Amount', render: (r) => formatINR(r.amountPaid) },
    { key: 'paymentStatus', label: 'Status', render: (r) => <FinanceStatusBadge status={r.paymentStatus} /> },
    { key: 'paymentDate', label: 'Date', render: (r) => formatCategoryDateTime(r.paymentDate) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-1">
          <button type="button" onClick={() => setPreview(row)} className="rounded p-1.5 text-[#246392] hover:bg-[#eef6fc]" title="Preview">
            <Eye className="h-4 w-4" />
          </button>
          {canReceipts && !row.receiptNumber && (
            <button type="button" onClick={() => handleGenerate(row)} className="rounded p-1.5 text-[#69df66] hover:bg-green-50" title="Generate">
              <Receipt className="h-4 w-4" />
            </button>
          )}
          {canReceipts && row.receiptNumber && (
            <button
              type="button"
              onClick={async () => {
                await resendReceipt(row.id, 'Email')
                toast.success('Receipt resent')
              }}
              className="rounded p-1.5 text-[#246392] hover:bg-[#eef6fc]"
              title="Resend"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <FinancePageShell icon={Receipt} title="Receipt Management">
      <input
        type="search"
        placeholder="Search receipt, student…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
      />

      <PaginatedFigmaTable
        columns={columns}
        data={filtered}
        itemLabel="receipts"
        resetDeps={[debouncedSearch]}
      />

      <ReceiptPreview
        open={!!preview}
        payment={preview}
        onClose={() => setPreview(null)}
        onResend={handleResend}
      />
    </FinancePageShell>
  )
}
